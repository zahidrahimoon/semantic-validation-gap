/**
 * Semantic validation layer — E4 overhead measurement only.
 *
 * FREEZE NOTE: the subject under study is tag `v1.0-frozen` (62a7267). This module is an ADDITION
 * for experiment E4. It is inert unless the environment variable `SEMANTIC_LAYER` is set to one of
 * R, EMB, SLM, HYB or JUDGE; when unset or "off", `checkSemantic` returns immediately and the
 * application behaves exactly as it does at v1.0-frozen. E1–E3 were run with the variable unset.
 *
 * The designs mirror 17_CODE/harness/semantic/designs.ts. Detection quality is measured offline in
 * E3; this copy exists only so E4 can measure the cost of running it inside a real request.
 */
import { appendFileSync } from "node:fs";
import { ollamaChat } from "@/lib/ollama";

/**
 * Outcome log for the E4 overhead benchmark (DV-10). The layer fails open by design, so a failing
 * model call still lets the request succeed and would otherwise look FAST. When SEMANTIC_LOG is set,
 * each call appends {layer, ok, ms, err}. Nothing is written when the layer is off.
 */
const SEM_LOG = process.env.SEMANTIC_LOG;
function record(layer: string, ok: boolean, ms: number, err?: string) {
  if (!SEM_LOG) return;
  try { appendFileSync(SEM_LOG, JSON.stringify({ layer, ok, ms: Math.round(ms), err }) + "\n"); } catch { /* never affect the request */ }
}

export type LayerName = "off" | "R" | "EMB" | "SLM" | "HYB" | "JUDGE";
export type SemanticOutcome = { checked: boolean; layer: LayerName; flagged: boolean; ms: number };

const LAYER = (): LayerName => {
  const v = (process.env.SEMANTIC_LAYER ?? "off").toUpperCase();
  return (["R", "EMB", "SLM", "HYB", "JUDGE"] as const).includes(v as never) ? (v as LayerName) : "off";
};

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const EMB_MODEL = process.env.SEMANTIC_EMB_MODEL ?? "nomic-embed-text";
const SLM_MODEL = process.env.SEMANTIC_SLM_MODEL ?? "qwen3:1.7b";
const JUDGE_MODEL = process.env.SEMANTIC_JUDGE_MODEL ?? "qwen3:4b";

/** Purpose text per field, used by EMB and the prompted designs. Kept short on purpose. */
const PURPOSE: Record<string, string> = {
  displayName: "A personal name or nickname shown next to the user's reviews.",
  bio: "A short self-description of the user, shown to the booking assistant as context.",
  notes: "Special requirements for a booking that staff will read: dietary, accessibility, equipment.",
  body: "A review of the workshop the user attended, consistent with the star rating.",
  description: "A description of a problem the customer is having with this booking platform.",
  message: "A question for the booking assistant about workshops, bookings, reviews or support.",
  title: "The title of a workshop, matching its category.",
  q: "A search term for workshop titles and descriptions.",
};

const cache = new Map<string, number[]>();
async function embedOnce(text: string): Promise<number[]> {
  const hit = cache.get(text);
  if (hit) return hit;
  const r = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: EMB_MODEL, input: text }), signal: AbortSignal.timeout(60_000),
  });
  const d = (await r.json()) as { embeddings: number[][] };
  cache.set(text, d.embeddings[0]);
  return d.embeddings[0];
}
const cosine = (a: number[], b: number[]): number => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
};

/** Cheap deterministic checks: the objective rules that do not need database state. */
function rulesFlag(field: string, value: unknown): boolean {
  if (typeof value === "string") {
    if (field === "displayName" && /^https?:\/\//i.test(value.trim())) return true;
    if (/\b(ignore (all )?(previous|the) instructions?|system (prompt|note|override)|as the (triage )?assistant)\b/i.test(value)) return true;
  }
  return false;
}

/**
 * Runs the configured layer over one field value. Never throws: a layer failure must not change the
 * application's validation outcome during a measurement run.
 */
export async function checkSemantic(field: string, value: unknown): Promise<SemanticOutcome> {
  const layer = LAYER();
  if (layer === "off") return { checked: false, layer, flagged: false, ms: 0 };
  const started = performance.now();
  const purpose = PURPOSE[field] ?? `The value of the ${field} field.`;
  const text = typeof value === "string" ? value : JSON.stringify(value);
  let flagged = false;
  try {
    if (layer === "R") flagged = rulesFlag(field, value);
    else if (layer === "EMB" || (layer === "HYB" && !(flagged = rulesFlag(field, value)))) {
      const [p, v] = [await embedOnce(purpose), await embedOnce(text)];
      flagged = 1 - cosine(p, v) > 0.5;
    } else if (layer === "SLM" || layer === "JUDGE") {
      const { content } = await ollamaChat(
        [{ role: "system", content: `Decide whether a submitted value suits its field. Field purpose: ${purpose} The value already passed format checks; ignore format and length. Return ONLY {"appropriate": true|false}.` },
         { role: "user", content: text.slice(0, 1000) }],
        { json: true, temperature: 0, maxTokens: layer === "SLM" ? 60 : 100, model: layer === "SLM" ? SLM_MODEL : JUDGE_MODEL }
      );
      flagged = (JSON.parse(content) as { appropriate?: boolean }).appropriate === false;
    }
  } catch (e) {
    flagged = false; // fail open, as a production layer would; the failure is recorded below
    record(layer, false, performance.now() - started, String(e).slice(0, 120));
    return { checked: true, layer, flagged, ms: performance.now() - started };
  }
  record(layer, true, performance.now() - started);
  return { checked: true, layer, flagged, ms: performance.now() - started };
}

export const semanticLayerName = (): LayerName => LAYER();

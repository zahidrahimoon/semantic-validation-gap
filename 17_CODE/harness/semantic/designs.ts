/**
 * E3: the five candidate semantic validation layers (08_EXPERIMENT_PLAN.md, pre-committed at Gate B).
 *
 * Each design exposes the same interface: given a target and a submitted value, return a score in
 * [0,1] where higher means "more likely semantically invalid", plus the decision latency. Thresholds
 * are chosen per fold in the evaluation script, never here.
 *
 * These run OFFLINE against the labelled E1 corpus. The frozen testbed is not modified; in-request
 * wiring for the E4 overhead measurement is a separate, env-gated addition.
 */
import { byId, type Target } from "../config/fields.js";
import { chat, embed } from "../lib/ollama.js";
import { RULES } from "../lib/rules_text.js";
import { evaluateRules, type Ctx } from "../groundtruth/rules.js";
import type { StructRecord } from "../measure/structural.js";

export type Design = "R" | "EMB" | "SLM" | "HYB" | "JUDGE";
export type Score = { score: number; ms: number; detail?: string };

const CTX: Ctx = { now: new Date(), bookedCategory: "DEVELOPMENT", remainingSeats: 20 };

/** R — the objective rule functions packaged as a validator. Binary; a floor, not a competitor. */
export function scoreR(s: StructRecord): Score {
  const t0 = performance.now();
  const v = evaluateRules(s, CTX);
  const failed = Object.entries(v).filter(([, x]) => x === "FAIL").map(([k]) => k);
  return { score: failed.length ? 1 : 0, ms: performance.now() - t0, detail: failed.join(",") };
}

/**
 * EMB — cosine distance between the submitted value and the field's purpose plus valid exemplars.
 * Exemplars come from the target's purpose text only, never from the labelled corpus, so no label
 * information leaks into the design.
 */
const embCache = new Map<string, number[]>();
async function embedCached(model: string, text: string): Promise<number[]> {
  const k = `${model}::${text}`;
  const hit = embCache.get(k);
  if (hit) return hit;
  const e = await embed(model, text);
  embCache.set(k, e);
  return e;
}
const cos = (a: number[], b: number[]): number => {
  let d = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return d / (Math.sqrt(na) * Math.sqrt(nb) || 1);
};
export async function scoreEMB(s: StructRecord, model = "nomic-embed-text"): Promise<Score> {
  const t = byId(s.target_id);
  const value = JSON.stringify(Object.fromEntries(t.keys.map((k) => [k, s.payload[k]])));
  const t0 = performance.now();
  const ref = await embedCached(model, `${t.purpose} ${RULES ? t.rules.map((r) => RULES[r]?.text ?? "").join(" ") : ""}`);
  const v = await embedCached(model, value);
  const sim = cos(ref, v);
  return { score: Math.max(0, Math.min(1, (1 - sim) )), ms: performance.now() - t0, detail: `cos=${sim.toFixed(3)}` };
}

const VERDICT_SYSTEM = (t: Target) => `You are a validation layer inside a workshop-booking website. A value has already passed the site's format checks. Decide whether it is appropriate for the field.

Field: ${t.keys.join(", ")}
What it is for: ${t.purpose}
Rules it must respect:
${t.rules.filter((r) => RULES[r]).map((r) => `- ${RULES[r].text}`).join("\n")}

Return ONLY {"appropriate": true|false, "confidence": 0.0-1.0}. Do not comment on format or length.`;

async function promptedVerdict(s: StructRecord, model: string, maxTokens: number): Promise<Score> {
  const t = byId(s.target_id);
  const value = JSON.stringify(Object.fromEntries(t.keys.map((k) => [k, s.payload[k]])));
  const t0 = performance.now();
  let score = 0.5, detail = "";
  try {
    const r = await chat(VERDICT_SYSTEM(t), `Submitted value: ${value}`, { model, temperature: 0, seed: 13, maxTokens });
    const p = JSON.parse(r.content) as { appropriate?: boolean; confidence?: number };
    const conf = typeof p.confidence === "number" ? Math.max(0, Math.min(1, p.confidence)) : 0.5;
    score = p.appropriate === false ? 0.5 + conf / 2 : p.appropriate === true ? 0.5 - conf / 2 : 0.5;
    detail = `appropriate=${p.appropriate} conf=${conf}`;
  } catch (e) {
    detail = `error: ${String(e).slice(0, 80)}`;
  }
  return { score, ms: performance.now() - t0, detail };
}

/** SLM — a sub-2B model prompted with the rule text. */
export const scoreSLM = (s: StructRecord, model = "qwen3:1.7b") => promptedVerdict(s, model, 80);
/** JUDGE — the 4B model used for generation; reference point, shares a family with the generator. */
export const scoreJUDGE = (s: StructRecord, model = "qwen3:4b") => promptedVerdict(s, model, 120);

/** HYB — R first (cheap, exact on objective rules), EMB only on what R lets through. */
export async function scoreHYB(s: StructRecord, embModel = "nomic-embed-text"): Promise<Score> {
  const r = scoreR(s);
  if (r.score === 1) return { score: 1, ms: r.ms, detail: `R:${r.detail}` };
  const e = await scoreEMB(s, embModel);
  return { score: e.score, ms: r.ms + e.ms, detail: `R:pass ${e.detail}` };
}

export async function scoreDesign(d: Design, s: StructRecord): Promise<Score> {
  switch (d) {
    case "R": return scoreR(s);
    case "EMB": return scoreEMB(s);
    case "SLM": return scoreSLM(s);
    case "HYB": return scoreHYB(s);
    case "JUDGE": return scoreJUDGE(s);
  }
}

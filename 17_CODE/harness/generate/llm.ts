/**
 * Groups D (context-free) and E (context-aware): LLM generation via local Ollama.
 * Values are stored exactly as returned (Phase 11: never silently modified).
 */
import { readFileSync } from "node:fs";
import { CONSTRAINTS } from "../config/constraints.js";
import { BASE_PAYLOAD, Target } from "../config/fields.js";
import { chat, modelDigest } from "../lib/ollama.js";
import { ruleText } from "../lib/rules_text.js";
import { sha256 } from "../lib/io.js";

const PROMPT_DIR = new URL("../../prompts/", import.meta.url).pathname;
export const FAMILIES = { P1: "P1_normal.md", P2: "P2_unusual.md", P3: "P3_ruleviolation.md", P4: "P4_context.md", P5: "P5_injection.md", P6: "P6_boundary.md", P7: "P7_unicode.md" } as const;
export type Family = keyof typeof FAMILIES;

export type GenRecord = {
  experiment_id: string; input_id: string; target_id: string; fields: string[]; surface: string;
  group: "A" | "B" | "C" | "D" | "E" | "F" | "G"; prompt_family: Family | null;
  model: string; model_digest: string; temperature: number; top_p: number; seed: number; run: number;
  prompt_file: string | null; prompt_hash: string | null; timestamp: string;
  value: Record<string, unknown>; expected_category: string; gen_ms?: number; gen_tokens?: number;
};

function buildPrompt(t: Target, fam: Family, contextAware: boolean, n: number): { system: string; file: string; hash: string } {
  const file = FAMILIES[fam];
  let tpl = readFileSync(PROMPT_DIR + file, "utf8");
  const purpose = contextAware ? `\nWhat this field is for:\n${t.purpose}\n` : "";
  const rules = contextAware ? `\nRules the application expects the value to respect:\n${ruleText(t.rules)}\n` : "";
  tpl = tpl.replace("{{N}}", String(n))
    .replace("{{KEYS}}", t.keys.map((k) => `"${k}"`).join(", "))
    .replace("{{CONSTRAINTS}}", CONSTRAINTS[t.id])
    .replace("{{PURPOSE}}", purpose)
    .replace("{{RULES}}", rules);
  return { system: tpl, file, hash: sha256(tpl) };
}

export async function generateLLM(opts: {
  target: Target; group: "D" | "E"; families: Family[]; perFamily: number; model: string;
  temperature: number; seed: number; run: number; experiment_id: string;
}): Promise<{ records: GenRecord[]; failures: Record<string, unknown>[] }> {
  const digest = await modelDigest(opts.model);
  const records: GenRecord[] = [];
  const failures: Record<string, unknown>[] = [];
  for (const fam of opts.families) {
    if (fam === "P5" && !opts.target.aiFacing) continue;
    const { system, file, hash } = buildPrompt(opts.target, fam, opts.group === "E", opts.perFamily);
    let r;
    try {
      r = await chat(system, `Field target: ${opts.target.id} (keys ${opts.target.keys.join(", ")}). Produce ${opts.perFamily} values now.`,
        { model: opts.model, temperature: opts.temperature, seed: opts.seed, maxTokens: 900 });
    } catch (e) {
      failures.push({ target: opts.target.id, group: opts.group, family: fam, run: opts.run, reason: "call_error", detail: String(e).slice(0, 200) });
      continue;
    }
    let values: Record<string, unknown>[] = [];
    try {
      const parsed = JSON.parse(r.content) as { values?: unknown };
      if (Array.isArray(parsed.values)) values = parsed.values as Record<string, unknown>[];
    } catch { /* fall through */ }
    if (values.length === 0) {
      failures.push({ target: opts.target.id, group: opts.group, family: fam, run: opts.run, reason: "unparseable_or_empty", raw: r.content.slice(0, 300) });
      continue;
    }
    values.forEach((v, i) => {
      const value: Record<string, unknown> = {};
      for (const k of opts.target.keys) value[k] = (v as Record<string, unknown>)[k];
      // DV-14: a value missing any target key would be filled from the form defaults at measurement
      // time, so it would measure the defaults, not the model. Count it as a failure instead.
      if (opts.target.keys.some((k) => value[k] === undefined)) {
        failures.push({ target: opts.target.id, group: opts.group, family: fam, run: opts.run, reason: "key_mismatch", raw: JSON.stringify(v).slice(0, 300) });
        return;
      }
      records.push({
        experiment_id: opts.experiment_id,
        input_id: `${opts.target.id}|${opts.group}|${fam}|r${opts.run}|${i}`,
        target_id: opts.target.id, fields: opts.target.fields, surface: opts.target.surface,
        group: opts.group, prompt_family: fam, model: r.model, model_digest: digest,
        temperature: opts.temperature, top_p: 0.9, seed: opts.seed, run: opts.run,
        prompt_file: file, prompt_hash: hash, timestamp: new Date().toISOString(),
        value, expected_category: fam === "P1" ? "intended_valid" : fam === "P5" ? "intended_injection" : `intended_${fam}`,
        gen_ms: r.ms, gen_tokens: r.evalCount,
      });
    });
  }
  return { records, failures };
}

export const basePayloadFor = (t: Target): Record<string, unknown> => ({ ...BASE_PAYLOAD[t.surface] });

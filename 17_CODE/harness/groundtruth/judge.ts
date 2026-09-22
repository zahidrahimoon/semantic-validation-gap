/**
 * R2: judge model of a DIFFERENT family than the generator (08_EXPERIMENT_PLAN.md §GT).
 * The judge sees the field purpose, the rule text and the value. It never sees the generation group,
 * the prompt family, or whether a violation was intended.
 */
import { byId } from "../config/fields.js";
import { chat, modelDigest } from "../lib/ollama.js";
import { RULES } from "../lib/rules_text.js";
import type { StructRecord } from "../measure/structural.js";

export type JudgeVerdict = "PASS" | "FAIL" | "UNSURE";
export type JudgeRecord = {
  input_id: string; judge_model: string; judge_digest: string; ms: number;
  verdicts: Record<string, JudgeVerdict>; rationale: Record<string, string>; raw?: string;
};

const SYSTEM = `You check whether a value submitted to a web form is appropriate for that field.

You are given: what the field is for, the rules the application expects the value to respect, and the submitted value. The value already passed the application's format checks, so do NOT comment on format, type or length.

For each rule, answer PASS (the value respects the rule), FAIL (the value breaks the rule) or UNSURE (genuinely cannot tell).

Return ONLY JSON: {"<RULE-ID>": {"verdict": "PASS|FAIL|UNSURE", "why": "<one short clause>"}, ...} with one entry per rule you were given. No other keys.`;

export async function judge(s: StructRecord, model: string, digest?: string): Promise<JudgeRecord> {
  const t = byId(s.target_id);
  const rules = t.rules.filter((r) => RULES[r]);
  const submitted = Object.fromEntries(t.keys.map((k) => [k, s.payload[k]]));
  const user = [
    `Field: ${t.keys.join(", ")} (on the ${t.surface} form of a workshop-booking website)`,
    `What the field is for: ${t.purpose}`,
    `Rules to check:`,
    ...rules.map((r) => `${r}: ${RULES[r].text}`),
    `Submitted value: ${JSON.stringify(submitted)}`,
  ].join("\n");
  const r = await chat(SYSTEM, user, { model, temperature: 0, seed: 7, maxTokens: 400 });
  const out: JudgeRecord = { input_id: s.input_id, judge_model: r.model, judge_digest: digest ?? (await modelDigest(model)), ms: r.ms, verdicts: {}, rationale: {} };
  try {
    const parsed = JSON.parse(r.content) as Record<string, { verdict?: string; why?: string } | string>;
    for (const rule of rules) {
      const e = parsed[rule];
      const raw = typeof e === "string" ? e : e?.verdict;
      const val = String(raw ?? "").toUpperCase();
      out.verdicts[rule] = val === "PASS" || val === "FAIL" ? (val as JudgeVerdict) : "UNSURE";
      out.rationale[rule] = (typeof e === "object" && e?.why ? e.why : "").slice(0, 200);
    }
  } catch {
    for (const rule of rules) out.verdicts[rule] = "UNSURE";
    out.raw = r.content.slice(0, 300);
  }
  return out;
}

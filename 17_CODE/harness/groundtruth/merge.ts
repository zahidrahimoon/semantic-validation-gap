/** Algorithm 1 (07_METHODOLOGY.md §5): merge R1 rules, R2 judge and R3 human into one label. */
import { RULES } from "../lib/rules_text.js";
import type { Verdict } from "./rules.js";
import type { JudgeVerdict } from "./judge.js";

export type Final = "VALID" | "SV-SI" | "AMBIGUOUS" | "N/A (structural fail)";
export type LabelRecord = {
  input_id: string; target_id: string; group: string; prompt_family: string | null;
  structural_pass: boolean; final_label: Final;
  violated_rules: string[]; violated_obj: string[]; violated_jud: string[];
  ambiguous_rules: string[]; per_rule: Record<string, { verdict: string; source: "R1" | "R2" | "R3" | "none" }>;
};

export function mergeLabel(args: {
  input_id: string; target_id: string; group: string; prompt_family: string | null; structural_pass: boolean;
  applicableRules: string[]; r1: Record<string, Verdict>; r2: Record<string, JudgeVerdict>; r3?: Record<string, "PASS" | "FAIL" | "AMBIGUOUS">;
}): LabelRecord {
  const per: LabelRecord["per_rule"] = {};
  const violated: string[] = [], ambiguous: string[] = [];
  for (const r of args.applicableRules) {
    const cls = RULES[r]?.cls ?? "JUD";
    let verdict = "AMBIGUOUS", source: "R1" | "R2" | "R3" | "none" = "none";
    if (cls === "OBJ" && args.r1[r] && args.r1[r] !== "NA") { verdict = args.r1[r]; source = "R1"; }
    else if (args.r3?.[r]) { verdict = args.r3[r]; source = "R3"; }
    else if (args.r2[r] === "PASS" || args.r2[r] === "FAIL") { verdict = args.r2[r]; source = "R2"; }
    per[r] = { verdict, source };
    if (verdict === "FAIL") violated.push(r);
    else if (verdict === "AMBIGUOUS") ambiguous.push(r);
  }
  const obj = violated.filter((r) => RULES[r]?.cls === "OBJ");
  const jud = violated.filter((r) => RULES[r]?.cls !== "OBJ");
  let final: Final;
  if (!args.structural_pass) final = "N/A (structural fail)";
  else if (violated.length > 0) final = "SV-SI";
  else if (ambiguous.length > 0) final = "AMBIGUOUS";
  else final = "VALID";
  return { input_id: args.input_id, target_id: args.target_id, group: args.group, prompt_family: args.prompt_family, structural_pass: args.structural_pass, final_label: final, violated_rules: violated, violated_obj: obj, violated_jud: jud, ambiguous_rules: ambiguous, per_rule: per };
}

/** Cohen's kappa for two raters over a set of items with categorical verdicts. */
export function cohenKappa(a: string[], b: string[]): number {
  if (a.length !== b.length || a.length === 0) return NaN;
  const cats = [...new Set([...a, ...b])];
  const n = a.length;
  let agree = 0;
  for (let i = 0; i < n; i++) if (a[i] === b[i]) agree++;
  const po = agree / n;
  let pe = 0;
  for (const c of cats) pe += (a.filter((x) => x === c).length / n) * (b.filter((x) => x === c).length / n);
  return pe === 1 ? 1 : (po - pe) / (1 - pe);
}

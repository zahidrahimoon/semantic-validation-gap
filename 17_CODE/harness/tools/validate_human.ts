/** Offline check of the group A/G files: schema-only pass + objective-rule verdicts. No HTTP, no LLM. */
import { readFileSync } from "node:fs";
import * as V from "../../testbed/lib/validation/index.js";
import { BASE_PAYLOAD, byId } from "../config/fields.js";
import { evaluateRules } from "../groundtruth/rules.js";

const S = V as unknown as Record<string, { safeParse: (x: unknown) => { success: boolean; error?: { issues: { path: (string|number)[]; message: string }[] } } }>;
const ctx = { now: new Date(), bookedCategory: "DEVELOPMENT", remainingSeats: 20 };
for (const g of ["A", "G"]) {
  const f = new URL(`../../../10_DATASETS/human_inputs/group_${g}.csv`, import.meta.url).pathname;
  const lines = readFileSync(f, "utf8").split("\n").filter((l) => l.trim() && !l.startsWith("target_id") && !l.startsWith("#"));
  let bad = 0, viol = 0;
  for (const l of lines) {
    const c = l.indexOf(",");
    const tid = l.slice(0, c).trim();
    const t = byId(tid);
    const value = JSON.parse(l.slice(c + 1).trim().replace(/^"|"$/g, "").replace(/""/g, '"')) as Record<string, unknown>;
    const payload = { ...BASE_PAYLOAD[t.surface], ...value, ...(BASE_PAYLOAD[t.surface].courseId === "__COURSE_ID__" ? { courseId: "cmxxxxxxxxxxxxxxxxxxxxxxx" } : {}) };
    const r = S[t.schema].safeParse(payload);
    if (!r.success) { bad++; console.log(`  [${g}] SCHEMA FAIL ${tid}: ${JSON.stringify(value).slice(0,70)} → ${(r.error!.issues[0].path.join(".")||"_")}: ${r.error!.issues[0].message}`); }
    const rv = evaluateRules({ payload } as never, ctx);
    const fails = Object.entries(rv).filter(([, v]) => v === "FAIL").map(([k]) => k);
    if (fails.length) { viol++; console.log(`  [${g}] RULE FAIL ${tid}: ${JSON.stringify(value).slice(0,70)} → ${fails.join(",")}`); }
  }
  console.log(`group ${g}: ${lines.length} values, ${bad} schema failures, ${viol} objective-rule violations`);
}

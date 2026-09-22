/**
 * E3 runner: score every structurally valid input with each design and write decisions.jsonl.
 * Threshold selection and leave-fields-out evaluation happen in 16_RESULTS/analysis/e3_analysis.py,
 * so no threshold is ever chosen on the fields a design is scored on.
 *
 *   tsx semantic/run_e3.ts --exp E1 --run <id> --designs R,EMB,HYB,SLM,JUDGE [--limit N]
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { appendJsonl, mulberry32, readJsonl, runDir } from "../lib/io.js";
import type { StructRecord } from "../measure/structural.js";
import { scoreDesign, type Design } from "./designs.js";

const args = process.argv.slice(2);
const flag = (n: string, d?: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const exp = flag("exp", "E1")!, runId = flag("run")!;
const designs = (flag("designs", "R,EMB,HYB,SLM,JUDGE")!).split(",") as Design[];
const limit = Number(flag("limit", "0"));
// DV-08: the slow model-based designs run on a stratified sample; the fast designs run on everything.
const sampleN = Number(flag("sample", "0"));
const sampledDesigns = new Set((flag("sample-designs", "SLM,JUDGE")!).split(","));

const dir = runDir(exp, runId);
const labels = new Map(readJsonl<{ input_id: string; final_label: string }>(join(dir, "semantic_labels.jsonl")).map((l) => [l.input_id, l.final_label]));
const passes = readJsonl<StructRecord>(join(dir, "validation_results.jsonl"))
  .filter((s) => s.structural_pass && ["VALID", "SV-SI"].includes(labels.get(s.input_id) ?? ""));
const out = join(dir, "e3_decisions.jsonl");

/**
 * The sample is drawn ONCE from all eligible inputs, round-robin across (target x condition x label)
 * strata with a fixed seed. Every sampled design scores the SAME inputs, so their comparison is
 * paired, and the ids are written to e3_sample_ids.json so the fast designs can be re-scored on the
 * identical subset in the analysis. Restarts re-derive the same set and only finish it.
 */
function drawSample(items: StructRecord[], n: number): Set<string> {
  const strata = new Map<string, StructRecord[]>();
  for (const x of [...items].sort((a, b) => a.input_id.localeCompare(b.input_id))) {
    const k = `${x.target_id}|${x.group}|${labels.get(x.input_id)}`;
    (strata.get(k) ?? strata.set(k, []).get(k)!).push(x);
  }
  const rnd = mulberry32(31337);
  for (const b of strata.values()) for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  const keys = [...strata.keys()].sort();
  const picked = new Set<string>();
  for (let round = 0; picked.size < n && round < 10000; round++) {
    for (const k of keys) {
      const b = strata.get(k)!;
      if (b.length > round) picked.add(b[round].input_id);
      if (picked.size >= n) break;
    }
  }
  return picked;
}
const sampleIds = sampleN > 0 && passes.length > sampleN ? drawSample(passes, sampleN) : null;
if (sampleIds) {
  writeFileSync(join(dir, "e3_sample_ids.json"), JSON.stringify({ n: sampleIds.size, seed: 31337,
    strata: "target x condition x label", designs: [...sampledDesigns], ids: [...sampleIds] }, null, 1));
}
const done = new Set(readJsonl<{ key: string }>(out).map((r) => r.key));

const run = async () => {
  if (!passes.length) { console.error("no labelled structural passes — run merge first"); process.exit(1); }
  for (const d of designs) {
    const pool = sampleIds && sampledDesigns.has(d) ? passes.filter((s) => sampleIds.has(s.input_id)) : passes;
    const todo = pool.filter((s) => !done.has(`${d}|${s.input_id}`)).slice(0, limit > 0 ? limit : undefined);
    console.log(`design ${d}: ${todo.length} to score (${pool === passes ? "all" : "stratified sample"} of ${pool.length})`);
    let i = 0;
    for (const s of todo) {
      const r = await scoreDesign(d, s);
      appendJsonl(out, [{ key: `${d}|${s.input_id}`, design: d, input_id: s.input_id, target_id: s.target_id,
        group: s.group, label: labels.get(s.input_id), score: r.score, ms: r.ms, detail: r.detail }]);
      if (++i % 50 === 0) console.log(`  ${d}: ${i}/${todo.length}`);
    }
  }
  console.log(`e3 done → ${out}`);
};
run().catch((e) => { console.error(e); process.exit(1); });

#!/usr/bin/env -S npx tsx
/**
 * Harness CLI. Every command appends to an immutable run folder under 16_RESULTS/raw/.
 *
 *   tsx cli.ts generate  --exp E0 --groups B,C,F,D,E --targets F01,F29 --runs 1 --model qwen3:4b --temp 0.8
 *   tsx cli.ts structural --exp E0 --run <runId>
 *   tsx cli.ts rules      --exp E0 --run <runId>
 *   tsx cli.ts judge      --exp E0 --run <runId> --model gemma3:4b [--limit N]
 *   tsx cli.ts merge      --exp E0 --run <runId>
 *   tsx cli.ts report     --exp E0 --run <runId>
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TARGETS, byId } from "./config/fields.js";
import { RULES } from "./lib/rules_text.js";
import { generateLLM, type Family, type GenRecord } from "./generate/llm.js";
import { programmaticRecords } from "./generate/programmatic.js";
import { appendJsonl, mulberry32, nowRunId, readJsonl, runDir, writeManifest } from "./lib/io.js";
import { courseIdFor, measure, type StructRecord } from "./measure/structural.js";
import { evaluateRules, type Verdict } from "./groundtruth/rules.js";
import { judge, type JudgeRecord } from "./groundtruth/judge.js";
import { cohenKappa, mergeLabel } from "./groundtruth/merge.js";
import { modelDigest } from "./lib/ollama.js";

const args = process.argv.slice(2);
const cmd = args[0];
const flag = (n: string, d?: string): string | undefined => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const HUMAN_DIR = new URL("../../10_DATASETS/human_inputs/", import.meta.url).pathname;

function targetsFrom(): typeof TARGETS {
  const t = flag("targets");
  return t ? t.split(",").map(byId) : TARGETS;
}

/** Groups A and G come from human-written CSV files (one per group): target_id,value_json */
function humanRecords(exp: string, group: "A" | "G"): GenRecord[] {
  const f = join(HUMAN_DIR, `group_${group}.csv`);
  if (!existsSync(f)) { console.warn(`! ${f} missing — group ${group} skipped (TODO-HUMAN TH-10)`); return []; }
  // Skip the header and any '#' comment line (the files carry a provenance banner).
  const lines = readFileSync(f, "utf8").split("\n").filter((l) => l.trim() && !l.startsWith("target_id") && !l.startsWith("#"));
  return lines.map((l, i) => {
    const c = l.indexOf(",");
    const target_id = l.slice(0, c).trim();
    const t = byId(target_id);
    return { experiment_id: exp, input_id: `${target_id}|${group}|r1|${i}`, target_id, fields: t.fields, surface: t.surface, group, prompt_family: null, model: "human", model_digest: "n/a", temperature: 0, top_p: 0, seed: 0, run: 1, prompt_file: `group_${group}.csv`, prompt_hash: null, timestamp: new Date().toISOString(), value: JSON.parse(l.slice(c + 1).trim().replace(/^"|"$/g, "").replace(/""/g, '"')) as Record<string, unknown>, expected_category: group === "A" ? "human_valid" : "human_benign_unusual" };
  });
}

async function cmdGenerate() {
  const exp = flag("exp", "E0")!, runId = flag("run", nowRunId())!;
  const groups = (flag("groups", "B,C,F,D,E")!).split(",") as ("A" | "B" | "C" | "D" | "E" | "F" | "G")[];
  const runs = Number(flag("runs", "1")), model = flag("model", "qwen3:4b")!, temp = Number(flag("temp", "0.8"));
  const perFamily = Number(flag("perfamily", "5")), nRandom = Number(flag("nrandom", "25"));
  const fams = (flag("families", "P1,P2,P3,P4,P5,P6,P7")!).split(",") as Family[];
  const seeds = [11, 22, 33];
  const dir = runDir(exp, runId);
  const out = join(dir, "raw_inputs.jsonl"), fail = join(dir, "generation_failures.jsonl");
  // Resume support: input_ids already written are never regenerated, so an interrupted run can be
  // restarted with the same --run and will neither duplicate nor skip work.
  const existing = new Set(readJsonl<GenRecord>(out).map((r) => r.input_id));
  const cellDone = new Set([...existing].map((id) => id.split("|").slice(0, 4).join("|")));
  // DV-07: a family whose call FAILED is also "done" — failures are counted, never regenerated, so a
  // restart must not retry them (retrying gave failed calls a second chance the first-attempt data
  // never had).
  for (const f of readJsonl<{ target: string; group: string; family: string; run: number }>(fail)) {
    cellDone.add(`${f.target}|${f.group}|${f.family}|r${f.run}`);
  }
  if (existing.size) console.log(`resuming: ${existing.size} inputs already present (${cellDone.size} cells)`);
  let n = 0, nf = 0, skipped = 0;
  for (const g of groups) {
    if (g === "A" || g === "G") {
      const r = humanRecords(exp, g).filter((x) => !existing.has(x.input_id));
      if (r.length) appendJsonl(out, r);
      n += r.length; continue;
    }
    for (const t of targetsFrom()) {
      if (g === "B" || g === "C" || g === "F") {
        const r = programmaticRecords(t, g, 2026, exp, nRandom).filter((x) => !existing.has(x.input_id));
        if (r.length) appendJsonl(out, r);
        n += r.length;
      } else {
        for (let run = 1; run <= runs; run++) {
          // Skip only families already generated for this (target, group, run); a partially completed
          // run resumes at the first missing family.
          const todo = fams.filter((fam) => !cellDone.has(`${t.id}|${g}|${fam}|r${run}`));
          if (!todo.length) { skipped++; continue; }
          const { records, failures } = await generateLLM({ target: t, group: g, families: todo, perFamily, model, temperature: temp, seed: seeds[run - 1] ?? 11, run, experiment_id: exp });
          if (records.length) appendJsonl(out, records);
          if (failures.length) appendJsonl(fail, failures);
          n += records.length; nf += failures.length;
          console.log(`  ${t.id} ${g} run${run}: +${records.length} (${failures.length} failures, ${fams.length - todo.length} families already done)`);
        }
      }
    }
  }
  writeManifest(dir, { experiment_id: exp, run_id: runId, step: "generate", groups, runs, model, temperature: temp, families: fams, perFamily, nRandom, targets: targetsFrom().map((t) => t.id), testbed_commit: "62a726720bc81ee498acee8f1b1fc0924b8ca598", generated: n, failures: nf, at: new Date().toISOString() });
  console.log(`generate done: ${n} new inputs, ${nf} generation failures, ${skipped} cells already complete → ${dir}`);
}

async function cmdStructural() {
  const exp = flag("exp", "E0")!, runId = flag("run")!;
  const dir = runDir(exp, runId);
  const recs = readJsonl<GenRecord>(join(dir, "raw_inputs.jsonl"));
  const courseId = await courseIdFor();
  const out = join(dir, "validation_results.jsonl");
  const done = new Set(readJsonl<StructRecord>(out).map((r) => r.input_id));
  let pass = 0, i = 0;
  for (const r of recs) {
    if (done.has(r.input_id)) continue;
    const s = await measure(r, courseId);
    appendJsonl(out, [s]);
    if (s.structural_pass) pass++;
    if (++i % 25 === 0) console.log(`  ${i}/${recs.length} measured`);
  }
  console.log(`structural done: ${i} measured, ${pass} structural passes → ${out}`);
}

function cmdRules() {
  const exp = flag("exp", "E0")!, runId = flag("run")!;
  const dir = runDir(exp, runId);
  const s = readJsonl<StructRecord>(join(dir, "validation_results.jsonl"));
  const ctx = { now: new Date(), bookedCategory: "DEVELOPMENT", remainingSeats: 20 };
  const rows = s.map((x) => ({ input_id: x.input_id, verdicts: evaluateRules(x, ctx) as Record<string, Verdict> }));
  appendJsonl(join(dir, "rule_verdicts.jsonl"), rows);
  console.log(`rules done: ${rows.length} rows (objective rules only)`);
}

async function cmdJudge() {
  const exp = flag("exp", "E0")!, runId = flag("run")!, model = flag("model", "gemma3:4b")!;
  const limit = Number(flag("limit", "0"));
  const sample = Number(flag("sample", "0"));
  const dir = runDir(exp, runId);
  const all = readJsonl<StructRecord>(join(dir, "validation_results.jsonl")).filter((x) => x.structural_pass);
  // The judge is only consulted for rules of class JUDGEMENT; a target whose rules are all
  // objectively decidable is settled by the rule functions (Algorithm 1), so judging it would add
  // nothing. Skipping those is information-preserving, not a sampling decision.
  const needsJudge = (r: StructRecord) => byId(r.target_id).rules.some((x) => RULES[x] && RULES[x].cls !== "OBJ");
  const s = all.filter(needsJudge);
  const skipped = all.length - s.length;
  const out = join(dir, "judge_verdicts.jsonl");
  const done = new Set(readJsonl<JudgeRecord>(out).map((r) => r.input_id));
  let pending = s.filter((x) => !done.has(x.input_id));
  // Stratified sampling (DV-06): the TARGET SET is drawn once from ALL eligible inputs, round-robin
  // across (target x condition) strata with a fixed seed. Because it is drawn from the full eligible
  // set rather than from what is still pending, every restart selects the same inputs and only
  // finishes them; it never adds another batch.
  // DV-09: once a sample has been judged, its membership is FROZEN in judge_sample_ids.json. Adding
  // newly eligible inputs (the re-measured booking targets) must not reshuffle it, so they get their
  // own stratified supplement instead, drawn once and appended to the same file.
  const frozenFile = join(dir, "judge_sample_ids.json");
  const supplementTargets = (flag("supplement", "") ?? "").split(",").filter(Boolean);
  const perStratum = Number(flag("per-stratum", "14"));
  if (existsSync(frozenFile)) {
    const fz = JSON.parse(readFileSync(frozenFile, "utf8")) as { ids: string[]; supplement: string[] } & Record<string, unknown>;
    const inTarget = new Set([...fz.ids, ...(fz.supplement ?? [])]);
    if (supplementTargets.length && !(fz.supplement ?? []).length) {
      const strata = new Map<string, StructRecord[]>();
      for (const x of [...s].sort((a, b) => a.input_id.localeCompare(b.input_id))) {
        if (!supplementTargets.includes(x.target_id) || inTarget.has(x.input_id)) continue;
        const k = `${x.target_id}|${x.group}`;
        (strata.get(k) ?? strata.set(k, []).get(k)!).push(x);
      }
      const rnd = mulberry32(90211);
      const sup: string[] = [];
      for (const k of [...strata.keys()].sort()) {
        const b = strata.get(k)!;
        for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
        for (const x of b.slice(0, perStratum)) sup.push(x.input_id);
      }
      fz.supplement = sup;
      fz.supplement_design = { targets: supplementTargets, per_stratum: perStratum, seed: 90211, strata: strata.size };
      writeFileSync(frozenFile, JSON.stringify(fz, null, 1));
      for (const id of sup) inTarget.add(id);
      console.log(`  supplementary sample for ${supplementTargets.join(",")}: ${sup.length} inputs over ${strata.size} strata`);
    }
    const before = pending.length;
    pending = pending.filter((x) => inTarget.has(x.input_id));
    console.log(`  frozen sample: target ${inTarget.size}; ${inTarget.size - pending.length} already judged, ${pending.length} to go (${before} unjudged overall)`);
  } else if (sample > 0 && s.length > sample) {
    const strata = new Map<string, StructRecord[]>();
    for (const x of [...s].sort((a, b) => a.input_id.localeCompare(b.input_id))) {
      const k = `${x.target_id}|${x.group}`;
      (strata.get(k) ?? strata.set(k, []).get(k)!).push(x);
    }
    const rnd = mulberry32(90210);
    for (const b of strata.values()) for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    const keys = [...strata.keys()].sort();
    const picked: StructRecord[] = [];
    for (let round = 0; picked.length < sample && round < 5000; round++) {
      for (const k of keys) {
        const b = strata.get(k)!;
        if (b.length > round) picked.push(b[round]);
        if (picked.length >= sample) break;
      }
    }
    const target = new Set(picked.map((x) => x.input_id));
    writeFileSync(frozenFile, JSON.stringify({ n: target.size, seed: 90210, ids: [...target], supplement: [] }, null, 1));
    const before = pending.length;
    pending = pending.filter((x) => target.has(x.input_id));
    console.log(`  stratified sample: target ${target.size} of ${s.length} eligible (${strata.size} strata); ` +
                `${target.size - pending.length} already judged, ${pending.length} to go (${before} unjudged overall)`);
  }
  const todo = pending.slice(0, limit > 0 ? limit : undefined);
  console.log(`  ${skipped} passes need no judge (all their rules are objectively decidable)`);
  const digest = await modelDigest(model);
  let i = 0;
  for (const x of todo) {
    try { appendJsonl(out, [await judge(x, model, digest)]); } catch (e) { appendJsonl(join(dir, "judge_failures.jsonl"), [{ input_id: x.input_id, error: String(e).slice(0, 200) }]); }
    if (++i % 10 === 0) console.log(`  judged ${i}/${todo.length}`);
  }
  console.log(`judge done: ${i} judged with ${model} (${digest.slice(0, 12)}) → ${out}`);
}

function cmdMerge() {
  const exp = flag("exp", "E0")!, runId = flag("run")!;
  const dir = runDir(exp, runId);
  const struct = readJsonl<StructRecord>(join(dir, "validation_results.jsonl"));
  const r1 = new Map(readJsonl<{ input_id: string; verdicts: Record<string, Verdict> }>(join(dir, "rule_verdicts.jsonl")).map((r) => [r.input_id, r.verdicts]));
  const r2 = new Map(readJsonl<JudgeRecord>(join(dir, "judge_verdicts.jsonl")).map((r) => [r.input_id, r.verdicts]));
  const rows = struct.map((s) => mergeLabel({ input_id: s.input_id, target_id: s.target_id, group: s.group, prompt_family: s.prompt_family, structural_pass: s.structural_pass, applicableRules: byId(s.target_id).rules, r1: r1.get(s.input_id) ?? {}, r2: r2.get(s.input_id) ?? {} }));
  appendJsonl(join(dir, "semantic_labels.jsonl"), rows);
  console.log(`merge done: ${rows.length} labels → ${join(dir, "semantic_labels.jsonl")}`);
}

/**
 * R3 annotation kit: export a stratified sample of structural passes for human labelling, blind to
 * generation condition, with 20 items repeated to estimate intra-annotator agreement.
 *   tsx cli.ts sample --exp E1 --run <id> [--n 200] [--repeats 20]
 *   tsx cli.ts import-labels --exp E1 --run <id>     (reads annotation_filled.csv)
 */
function cmdSample() {
  const exp = flag("exp", "E1")!, runId = flag("run")!;
  const n = Number(flag("n", "200")), repeats = Number(flag("repeats", "20"));
  const dir = runDir(exp, runId);
  const struct = readJsonl<StructRecord>(join(dir, "validation_results.jsonl")).filter((s) => s.structural_pass);
  if (!struct.length) { console.error("no structural passes yet"); return; }
  // Stratify by target × group so every cell is represented before any cell is oversampled.
  const strata = new Map<string, StructRecord[]>();
  for (const s of struct) {
    const k = `${s.target_id}|${s.group}`;
    (strata.get(k) ?? strata.set(k, []).get(k)!).push(s);
  }
  const keys = [...strata.keys()].sort();
  const picked: StructRecord[] = [];
  let round = 0;
  while (picked.length < n && round < 50) {
    for (const k of keys) {
      const bucket = strata.get(k)!;
      if (bucket.length > round) picked.push(bucket[round]);
      if (picked.length >= n) break;
    }
    round++;
  }
  const rep = picked.slice(0, repeats);
  const all = [...picked, ...rep.map((r) => ({ ...r, input_id: `${r.input_id}#repeat` }))];
  // Shuffled deterministically so order carries no condition signal.
  const rnd = mulberry32(4242);
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  const rows = ["item_id,target_id,field_purpose,rules_to_check,submitted_value,verdict_per_rule,notes"];
  for (const s of all) {
    const t = byId(s.target_id);
    const val = JSON.stringify(Object.fromEntries(t.keys.map((k) => [k, s.payload[k]])));
    const rules = t.rules.filter((r) => RULES[r]).map((r) => `${r}: ${RULES[r].text}`).join(" | ");
    const q = (x: string) => `"${x.replace(/"/g, '""')}"`;
    rows.push([s.input_id, s.target_id, q(t.purpose), q(rules), q(val), q(t.rules.filter((r) => RULES[r]).map((r) => `${r}=`).join(";")), ""].join(","));
  }
  const f = join(dir, "annotation_sample.csv");
  writeFileSync(f, rows.join("\n") + "\n", "utf8");
  console.log(`sample done: ${picked.length} items + ${rep.length} repeats → ${f}`);
  console.log(`  fill the verdict_per_rule column as e.g. B-RV-3=PASS;B-RV-4=FAIL (or =AMBIGUOUS), save as annotation_filled.csv, then: tsx cli.ts import-labels --exp ${exp} --run ${runId}`);
}

function cmdImportLabels() {
  const exp = flag("exp", "E1")!, runId = flag("run")!;
  const dir = runDir(exp, runId);
  const f = join(dir, "annotation_filled.csv");
  if (!existsSync(f)) { console.error(`missing ${f}`); return; }
  const lines = readFileSync(f, "utf8").split("\n").slice(1).filter((l) => l.trim());
  const rows = lines.map((l) => {
    const cells = l.match(/("([^"]|"")*"|[^,]*)/g)!.filter((_, i) => i % 2 === 0);
    const item = cells[0], verdicts: Record<string, string> = {};
    for (const part of (cells[5] ?? "").replace(/^"|"$/g, "").split(";")) {
      const [k, v] = part.split("=");
      if (k && v && ["PASS", "FAIL", "AMBIGUOUS"].includes(v.trim().toUpperCase())) verdicts[k.trim()] = v.trim().toUpperCase();
    }
    return { input_id: item, verdicts, repeat: item.endsWith("#repeat") };
  }).filter((r) => Object.keys(r.verdicts).length);
  appendJsonl(join(dir, "human_verdicts.jsonl"), rows);
  const byId_ = new Map<string, Record<string, string>>();
  for (const r of rows.filter((x) => !x.repeat)) byId_.set(r.input_id, r.verdicts);
  const pairs: [string, string][] = [];
  for (const r of rows.filter((x) => x.repeat)) {
    const orig = byId_.get(r.input_id.replace("#repeat", ""));
    if (orig) for (const k of Object.keys(r.verdicts)) if (orig[k]) pairs.push([orig[k], r.verdicts[k]]);
  }
  console.log(`import done: ${rows.length} annotated items → human_verdicts.jsonl`);
  if (pairs.length) console.log(`  intra-annotator kappa on ${pairs.length} repeated rule verdicts: ${cohenKappa(pairs.map((p) => p[0]), pairs.map((p) => p[1])).toFixed(3)}`);
}

function cmdReport() {
  const exp = flag("exp", "E0")!, runId = flag("run")!;
  const dir = runDir(exp, runId);
  const labels = readJsonl<{ group: string; structural_pass: boolean; final_label: string; target_id: string }>(join(dir, "semantic_labels.jsonl"));
  const g = new Map<string, { n: number; pass: number; svsi: number; amb: number }>();
  for (const l of labels) {
    const e = g.get(l.group) ?? { n: 0, pass: 0, svsi: 0, amb: 0 };
    e.n++; if (l.structural_pass) e.pass++;
    if (l.final_label === "SV-SI") e.svsi++; if (l.final_label === "AMBIGUOUS") e.amb++;
    g.set(l.group, e);
  }
  console.log(`\n${exp}/${runId} — counts only (NOT a result; analysis lives in 16_RESULTS/analysis/)`);
  console.log("group | n | struct pass | SV-SI | AMBIGUOUS | cond SV-SI");
  for (const [k, e] of [...g.entries()].sort()) {
    console.log(`  ${k}   | ${e.n} | ${e.pass} | ${e.svsi} | ${e.amb} | ${e.pass ? (e.svsi / e.pass).toFixed(3) : "-"}`);
  }
}

const run = async () => {
  switch (cmd) {
    case "generate": return cmdGenerate();
    case "structural": return cmdStructural();
    case "rules": return cmdRules();
    case "judge": return cmdJudge();
    case "sample": return cmdSample();
    case "import-labels": return cmdImportLabels();
    case "merge": return cmdMerge();
    case "report": return cmdReport();
    default: console.log(readFileSync(new URL(import.meta.url), "utf8").split("*/")[0]); process.exit(1);
  }
};
run().catch((e) => { console.error(e); process.exit(1); });

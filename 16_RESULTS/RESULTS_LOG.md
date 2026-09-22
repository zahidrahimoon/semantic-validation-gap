# RESULTS LOG (provenance) — Semantic Validation Gaps in AI-Driven Web Applications

> Only results the human executed and supplied. Raw files are saved unchanged in `raw/`.
> Every number in the paper maps to a Result ID here.

## Provenance

| Result ID | Experiment ID | Source file (raw/…) | sha256 | Run / commit hash | Date | Command | Seed(s) | Notes |
|---|---|---|---|---|---|---|---|---|

## Derived results (analysis/)

| Result ID | Derived from | Script (analysis/…) | Output file | Statistic reported |
|---|---|---|---|---|

## Deviations from plan

| PLANNED | ACTUAL | DIFFERENCE | REASON | Impact on conclusions |
|---|---|---|---|---|

## Results vs. hypotheses

| Hypothesis | Supported / Not supported / Inconclusive | Result IDs | Note |
|---|---|---|---|

## E0 — pilot (calibration only; NOT a reported result)

Purpose (08_EXPERIMENT_PLAN.md): verify the harness end to end, measure throughput, check prompt
sanity, calibrate the annotation guide. Numbers from E0 are never reported as findings.

| Result ID | Experiment ID | Source file | Run/commit hash | Date | Command | Seed(s) | Notes |
|---|---|---|---|---|---|---|---|
| E0-GEN-1 | E0 | `16_RESULTS/raw/E0_20260920T0810/raw_inputs.jsonl` | testbed 62a726720bc81ee498acee8f1b1fc0924b8ca598 (v1.0-frozen); harness (uncommitted, this session) | 2026-09-20 | `tsx cli.ts generate --exp E0 --run 20260920T0810 --groups B,C,F --targets F01,F29,F28,F35 --nrandom 8` then `--groups D,E --runs 1 --model qwen3:4b --temp 0.8 --perfamily 2 --families P1,P2,P3` | 2026 (programmatic), 11 (LLM run 1) | 118 inputs (72 programmatic, 46 LLM), 1 generation failure (F35 group D, one family unparseable) |
| E0-STR-1 | E0 | `16_RESULTS/raw/E0_20260920T0810/validation_results.jsonl` | as above | 2026-09-20 | `tsx cli.ts structural --exp E0 --run 20260920T0810` | — | schema-only + real HTTP outcome per input; F35 rows include the app's synchronous AI triage (~16–33 s each) |

### Observations from E0 (feed the design, not the results)

- The **schema vs service split works as intended**: all eight random promo codes (F28, group B) pass
  the Zod regex and are then rejected by the service with "Unknown or expired promo code" (rule
  B-BK-2, enforced in code). These are structural rejections at the service layer, not semantic gaps,
  and the two columns separate them cleanly.
- Generation failure rate at `perfamily=2` was 1/24 LLM calls (F35, one family returned unparseable
  JSON). Recorded, never regenerated.
- Throughput: ticket submissions (F35) dominate wall-clock because the app runs AI triage
  synchronously on the real path. For E1 the F35 and F39 targets need roughly 25 s per input; the
  budget in 08 already assumes this.
- `gemma3:4b` (the R2 judge, different family from the generator) was still downloading when the
  pilot ran, so the pilot's judge step is deferred rather than run with the generator's own model.

## E1 — main corpus (RUNNING, started 2026-09-20 13:47 +05:00)

| Result ID | Experiment ID | Source file | Run/commit hash | Date | Command | Seed(s) | Notes |
|---|---|---|---|---|---|---|---|
| E1-GEN-1 | E1 | `16_RESULTS/raw/E1_E1_20260920T0847/raw_inputs.jsonl` | testbed 62a7267 (v1.0-frozen) | 2026-09-20 | `tsx cli.ts generate --exp E1 --run E1_20260920T0847 --groups A,G,B,C,F --nrandom 25` | 2026 (programmatic); groups A/G from CSV | 867 inputs: 272 human-condition (AI-drafted, DV-03), 425 random, 85 adversarial, 85 boundary. 0 failures |
| E1-GEN-2 | E1 | same file (appended) | as above | 2026-09-20 | `tsx cli.ts generate --exp E1 --run E1_20260920T0847 --groups D,E --runs 3 --model qwen3:4b --temp 0.8 --perfamily 5` | 11, 22, 33 | RUNNING. Expected ~3,200 inputs across 17 targets × 2 groups × 3 runs × 6–7 prompt families |

Harness fix during E1: the group A/G CSV loader did not skip `#` comment lines, so the first attempt
at E1-GEN-1 aborted. Fixed in `17_CODE/harness/cli.ts` and the phase re-run into the same run folder
before any LLM generation completed. No data was discarded (the failed attempt wrote nothing).

### Integrity note during E1 (2026-09-20, caught before any measurement)

While E1 generation was still running, the semantic validation layer for E4 was implemented and
wired into `lib/services/index.ts` in the testbed working tree. That would have meant E1's structural
measurement ran against modified application code rather than the Gate-B-frozen subject, even though
the layer is inert unless `SEMANTIC_LAYER` is set.

Caught before the structural step began: `16_RESULTS/raw/E1_*/validation_results.jsonl` did not yet
exist, so no measurement was affected. The change was committed to branch `e4-semantic-layer`
(tag `v1.1-semantic`) and the working tree restored to `v1.0-frozen` (62a7267), verified by
`git describe --tags` and by the absence of `checkSemantic` from the working tree. E1, E2 and E3 run
against v1.0-frozen; only E4 checks out v1.1-semantic, where the layer is switched on per
configuration and is inert in the `structural-only` and `baseline` configurations.

### Generation failure modes observed in E1 (recorded, not repaired)

Four failures in the first ~180 LLM calls, all in group D (context-free), across four different
prompt families and two targets (F03 bio, F04 birthDate). Two distinct causes:

1. `ollama 500: prediction aborted, token repeat limit reached` — the 4B model entered a repetition
   loop and the runtime aborted it (2 of 4).
2. Unparseable output (2 of 4): once the model was truncated mid-JSON at the token budget, and once
   it returned a single bare object (`{"bio": ...}`) instead of the requested `{"values": [...]}`.

**No change was made to the parser or the prompts mid-run.** Relaxing the parser to accept a bare
object would salvage some of these, but applying it part-way through would mean early and late
records were collected under different rules, which is worse than losing 2% of calls. The failures
are counted per condition, target and prompt family in
`16_RESULTS/analysis/table0_generation_failures.csv` and reported in the paper, because a small
model's failure to follow an output contract is itself relevant to a study about whether generated
inputs are well formed.

Note for interpretation: failures are not uniform across cells (concentrated in F03, group D), so
per-cell sample sizes are reported alongside every rate.

### Scheduling constraint discovered 2026-09-20 (affects the wall-clock estimate)

Running two phases that use **different models** concurrently is destructive on this hardware. Ollama
runs with `OLLAMA_NUM_PARALLEL=1` on a 16 GB machine, so alternating generation (qwen3:4b) with
judging (gemma3:4b) forces a model unload and reload each way. Measured: a judge pass completed 3
items in ~20 minutes while generation was running, against seconds per item with the runtime to
itself.

Consequence: phases must run strictly sequentially, which `run_all.sh` already does, and the plan's
wall-clock estimate cannot be reduced by overlapping them. A concurrent rehearsal of the judge step on
pilot data was terminated once the interference was measured. No E1 data was affected; the pilot's 3
judge verdicts in `16_RESULTS/raw/E0_20260920T0810/judge_verdicts.jsonl` are calibration only.

### Throughput diagnosis 2026-09-20 (why generation was slow, and what was changed)

Measured from the 207 recorded generation calls, not estimated:

| Quantity | Value |
|---|---|
| Median call duration | 15.2 s |
| Mean call duration | 25.5 s |
| Slowest single call | 973 s |
| Median tokens generated | 85 |
| Calls at or near the 900-token cap | 0 of 207 |
| Implied median throughput | 6.4 tok/s (against 10.7 tok/s measured on an idle machine) |

Two causes, neither of them the amount of work requested. First, a small number of calls entered
repetition loops and ran for minutes; the per-call timeout was 300 s, so each one cost up to five
minutes for nothing. Second, throughput per token had fallen from 10.7 to 6.4 tok/s because a judge
rehearsal was competing for the single-model runtime.

Actions: the rehearsal was terminated, and the per-call timeout was reduced to 120 s (DV-05). The
token budget was **not** reduced, because no call was approaching it, so lowering it would have
risked truncation for no gain. Experimental scope was not reduced.

### Judging design changed to sampling (DV-06, 2026-09-20)

Two changes, for different reasons:

1. **Objective-only targets are no longer judged at all.** Five of the seventeen targets (F04, F13,
   F15+F16, F20+F21, F28) have only OBJECTIVE-class rules, which the rule functions decide
   deterministically. Under Algorithm 1 the judge's verdict for those rules would never be used, so
   consulting it was pure cost. This is information-preserving, not sampling.
2. **The remaining twelve targets are judged on a stratified sample of 1200 inputs**, drawn
   round-robin across target x condition strata with a fixed seed, so every cell is represented
   before any cell is deepened.

Effect on the analysis: inputs not sampled carry no verdict for their judgement rules and are
labelled AMBIGUOUS. Rates are therefore computed over **decided** inputs only, and the analysis
prints and records the decided-versus-undecided counts. Including undecided inputs in the denominator
would have understated every rate. Objective-rule findings still cover the whole corpus.

## Integrity incidents found 2026-09-21

### Incident 1 — zero-byte line after an abrupt stop

The pipeline stopped at 06:21 +05:00 when the session ended, while structural measurement was
writing. `validation_results.jsonl` gained a final line of 419 NUL bytes: the filesystem had extended
the file but the data was never flushed. It contained no measurement.

It would have crashed the resume, because the reader parsed every line, and the pipeline has no
`set -e`, so it would then have carried on to judging and analysis with only 63% of the data measured.

Action: the file was backed up to `_integrity/validation_results.jsonl.pre_nul_repair_*`, the NUL line
removed, and every other run file checked (none affected; 0 duplicate identifiers anywhere). The lost
measurement is re-taken on resume. The reader now skips NUL-only lines with a warning and still fails
loudly on any other unparseable line.

### Incident 2 — retried generation failures (DV-07)

While investigating the above, the run was seen writing new generation records after generation had
reported complete. No records were lost or duplicated (3,878 records, 3,878 distinct identifiers).
Instead, the resume logic was retrying prompt families whose earlier call had failed, which
contradicts the pre-registered rule that failures are never regenerated.

160 records came from retries. Because a failed call produces no records, any record in a cell that
also has a recorded failure is necessarily a retry, so they are identified exactly rather than by
heuristic. The primary analysis excludes them; `e1_e2_analysis.py --include-retried` produces the
sensitivity analysis in `16_RESULTS/analysis/sensitivity_include_retried/`. The resume logic is fixed.

## Incident 3 — booking capacity exhausted (DV-09), found 2026-09-21

The E1 analysis completed on 2026-09-21, then a within-target breakdown showed targets F25, F28 and
F29 (all on the booking form) absent for every condition. Cause: every booking consumes seats from a
course of capacity 20, the database was never reset between inputs as the plan required, and the
seats had already been used up by the pilot before E1 began. 616 of 678 booking inputs failed with
"Only 0 seats left"; the first booking measured already failed that way.

**Status: the E1 tables in `16_RESULTS/analysis/` dated 2026-09-21 are SUPERSEDED.** They exclude three
targets and count 616 database-caused failures as structural failures. They are kept only as a record
and must not be quoted. The fix is half-applied and the pipeline is deliberately blocked from resuming
(see `17_CODE/harness/RESUME_BLOCKED.md`).


## 2026-09-22 — E3 re-analysis after DV-11 (supersedes the v1 E3 figures)

Source: `raw/E1_E1_20260920T0847/e3_decisions.jsonl`, shared sample `e3_sample_ids.json` (600 inputs: 238 SV-SI, 362 VALID). Command: `.venv/bin/python analysis/e3_analysis.py raw/E1_E1_20260920T0847`. Outputs: `analysis/table6_detection.csv`, `table6b_detection_per_fold.csv`, `table6c_detection_full_corpus_fast_designs.csv`, `table6d_detection_native_and_auroc.csv`, `e3_summary.json`.

| Result ID | Design | recall @ FPR≤0.05 (held-out) [95% CI] | held-out FPR | AUROC | native (≥0.5) recall / FPR — EXPLORATORY | median ms |
|---|---|---|---|---|---|---|
| E3-HYB | HYB | 0.269 [0.213, 0.323] | 0.061 | 0.604 | 0.239 / 0.030 | 0.01 (reuses EMB's cached embeddings; see E4) |
| E3-JUDGE | JUDGE | 0.235 [0.184, 0.286] | 0.033 | 0.768 | 0.513 / 0.064 (no verdict on 25%) | 2688 |
| E3-R | R | 0.223 [0.167, 0.275] | 0.000 (circular on OBJ rules) | 0.611 | 0.223 / 0.000 | 0.007 |
| E3-EMB | EMB | 0.046 [0.022, 0.075] | 0.061 | 0.453 | 0.017 / 0.030 | 30 |
| E3-SLM | SLM | 0.013 [0.000, 0.029] | 0.011 | 0.755 | 0.689 / 0.193 | 1073 |

H5 (some non-judge design ≥ 0.70 recall at FPR ≤ 0.05): **NOT SUPPORTED**. Full corpus, fast designs (n = 2108): R 0.331 / FPR 0; HYB 0.362 / 0.061; EMB 0.031 / 0.061.

## 2026-09-22 — E2b model size / temperature (EXPLORATORY)

Source: `raw/E2b_E1_20260920T0847` (qwen3:1.7b T0.8), `raw/E2b_E1_20260920T0847_8b` (qwen3:8b T0.8), `raw/E2b_E1_20260920T0847_T0` (qwen3:4b T0), and the E1 run restricted to the same 10 targets x P1–P4 x groups D/E (qwen3:4b T0.8, 3 runs). Testbed 62a7267. Retried records excluded (DV-07). Command: `.venv/bin/python analysis/e2b_analysis.py`. Outputs: `analysis/table7_e2b_model_size.csv`, `table7b_e2b_by_group.csv`, `table7c_e2b_tests.csv`, `e2b_summary.json`.

| Result ID | Condition | runs | inputs | struct. passes | SV-SI objective rules [95% CI] | decided | SV-SI all rules |
|---|---|---|---|---|---|---|---|
| E2b-1 | qwen3:1.7b T0.8 | 1 | 340 | 334 | 16/334 = 4.8% [3.0, 7.6] | 137 | 48/137 = 35.0% |
| E2b-2 | qwen3:4b T0.8 (E1 ref.) | 3 | 1092 | 985 | 9/985 = 0.9% [0.5, 1.7] | 396 | 74/396 = 18.7% |
| E2b-3 | qwen3:8b T0.8 | 1 | 394 | 355 | 5/355 = 1.4% [0.6, 3.3] | 130 | 30/130 = 23.1% |
| E2b-4 | qwen3:4b T0 | 1 | 345 | 313 | 7/313 = 2.2% [1.1, 4.5] | 133 | 26/133 = 19.5% |

Fisher vs reference, Holm across 3 comparisons per metric: 1.7b objective OR 5.46 p_holm 0.0001, all-rules OR 2.35 p_holm 0.0004; 8b OR 1.55 / 1.31, p_holm 0.54 / 0.62; T0 OR 2.48 / 1.06, p_holm 0.16 / 0.80.
Caveats: the reference has 3 runs, the others 1; E2b judged 100 inputs per run vs E1's 1200 sample, so all-rules coverage differs (the objective-rule rate is unaffected); low counts on the objective metric.

Native operating point (exploratory): SLM/JUDGE flag only on an explicit `appropriate=false`; no verdict or parse error = not flagged (fail-open). JUDGE no-verdict rate 150/600 (134 missing field, 16 parse errors); SLM 0/600. The E3 corpus includes injection-family (P5) inputs; of the 6 in the model-design sample (all labelled SV-SI), JUDGE and SLM each flagged 5.

## 2026-09-22 — Within-target CMH contrasts now scripted (POST HOC)

The within-target odds ratios quoted in paper v0.8-partial (E vs B 0.15, D vs B 0.38, E vs G 0.91, E vs D 0.28, C vs B 3.18) had been computed interactively and no script produced them; they could not be reproduced and are **superseded**. They are now produced by `analysis/e2_cmh_within_target.py raw/E1_E1_20260920T0847` → `analysis/table3c_within_target_cmh.csv` (population 2011 decided structural passes, P5 and retried excluded; 16 target strata):
E vs B MH-OR 0.134 [0.093, 0.193] p<0.001; E vs G 1.073 [0.635, 1.813] p=0.87; D vs B 0.359 [0.259, 0.497] p<0.001; E vs D 0.249 [0.169, 0.366] p<0.001; C vs B 6.22 [2.61, 14.85] p<0.001. Directions and conclusions unchanged.
Also corrected in the paper: decided population 2011 (not 2010); χ²(6) = 214.0 (not 213.6), per `analysis/e1_e2_summary.json`.


## 2026-09-22 — E1/E2/E2b/E3 re-analysis after DV-14 (supersedes all earlier figures)

Source: `raw/E1_E1_20260920T0847` (labels merged 2026-09-22 10:14 after the DV-09 booking re-measurement; judge gemma3:4b on the frozen 1200 + 136 supplement), E2b run folders. Commands (from `16_RESULTS/analysis/`, `.venv/bin/python`): `e1_e2_analysis.py <run>`, `e1_e2_analysis.py <run> --include-retried`, `e2_cmh_within_target.py <run>`, `e1_by_family.py <run>`, `e1_sensitivity.py <run>`, `e2b_analysis.py`, `e3_analysis.py <run>`, `make_figures.py`, `make_latex_tables.py`, `make_numbers.py`. Every number in the paper is taken from `13_DRAFT/tables/numbers.tex` or the generated tables. Key values: H1 340/1076 = 31.6% [28.9, 34.4]; P1-only 23.2% [17.8, 29.6]; objective-only 7.9% [6.8, 9.2]; H2 χ²(6)=179.8, V=0.31; CMH E vs B 0.16, D vs B 0.46, E vs G 1.28 (p=0.35), E vs D 0.22; E3 best non-judge HYB 27.1% [21.8, 32.7] (H5 not supported).

## 2026-09-22 — E4 v2 request-path overhead (RQ6)

Source: `raw/E4_20260922T1142/` (108 runs: 6 configurations × 3 endpoints × 2 concurrencies × 3 repetitions; 60 s each after a 10 s warm-up; testbed branch e4-semantic-layer @ 33f2685 / v1.2-semantic, production build; restored to v1.0-frozen afterwards). JUDGE runs from the DV-17 re-run (19:15–19:39 PKT); first-attempt JUDGE runs kept in `_integrity/JUDGE_first_attempt/`. Logs: `logs/e4_run.log`, `logs/e4_run_judge.log`. 0 failed requests, 0 failed layer calls; 5 JUDGE c=8 runs SATURATED (no completion in 60 s).
Command: `.venv/bin/python analysis/e4_analysis.py raw/E4_20260922T1142` → `table8_e4_overhead.csv`, `table8b_e4_pareto.csv`, `e4_summary.json`; figure `09_DIAGRAMS/rendered/fig_tradeoff.pdf`.
Key values (median of 3 reps, added vs structural-only): R p97.5 ≤ 1 ms (c=1), ≤ 14 ms (c=8); EMB p97.5 65–96 ms (c=1), 122–751 ms (c=8); SLM p50 527–534 ms (c=1), 4149–4210 ms (c=8); JUDGE p50 1611–7704 ms (c=1), c=8 saturated on courses (3/3) and reviews (2/3).
H6 (on p97.5, DV-12): part 1 FAILS (EMB > 50 ms in every cell), part 2 HOLDS → **H6 NOT SUPPORTED**. Pareto frontier: R, HYB.

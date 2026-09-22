# 08 — EXPERIMENT PLAN — Semantic Validation Gaps in AI-Driven Web Applications

Version: v0.6-draft · Status: PRESENTED FOR GATE B · Frozen at Gate B: NO · Last updated: 2026-09-20

## Experiment index

| Exp ID | Objective | RQ | Hypothesis | Primary metric | Type |
|---|---|---|---|---|---|
| E0 | Pilot: throughput, prompt sanity, annotation-guide calibration (~100 inputs, 4 fields) | — | — | tok/s, generation-failure rate, pilot κ | CALIBRATION (not reported as a result) |
| E1 | Baseline gap measurement: 7 groups × 20 fields → structural outcome + semantic label | RQ1, RQ2, RQ4 | H1, H2 | conditional SV-SI rate (overall, per category); violation taxonomy | CONFIRMATORY (H1, H2 category level); EXPLORATORY (RQ4, field×group) |
| E2 | Group comparison on E1 data | RQ3 | H3a–c | pairwise conditional SV-SI contrasts | CONFIRMATORY |
| E2b | Model-size and temperature variation (10-field subset) | RQ3 | none | conditional SV-SI by model/temperature | EXPLORATORY |
| E3 | Semantic layer detection on the E1 labelled corpus, leave-fields-out | RQ5 | H5 | recall @ FPR ≤ 0.05 (held-out fields) | CONFIRMATORY |
| E4 | Request-path overhead under load: baseline / structural / structural+layer | RQ6 | H6 | added p95 latency; throughput; CPU; memory | CONFIRMATORY (thresholds) + descriptive Pareto |

---

## Shared design (applies to E1–E4)

**Subject.** Testbed `mono`, frozen at the Gate B commit (hash recorded in 17_CODE/README.md and
RESULTS_LOG.md). Seed data identical for every run (`npm run db:reset`).

**Fields.** The 20 fields selected in 06_INPUT_SURFACE_INVENTORY.md §4, tagged with one primary category:
simple scalar (F01, F04), structured (F09), free text (F07, F29, F33), financial (F12, F13, F14, F25, F28),
cross-field pairs (F15/F16, F20/F21, F31/F33, F36/F37), AI-facing (F03, F35, F39), search (F18).
Cross-field pairs are generated jointly (one input = the pair; the partner field takes a fixed valid
value unless the rule under test is the pair relation).

**Generation groups** (Phase 10). Per field: A valid human-written (8), B random structurally valid (25),
C rule-based adversarial (one template per applicable unenforced rule, ≥ 25 by template variation),
D LLM context-free (25 × 3 runs), E LLM context-aware (25 × 3 runs), F boundary (≈15 programmatic),
G benign-unusual human-written (8). Groups A and G are written by the researcher **before** any LLM
generation, blind to model outputs (TODO-HUMAN TH-10; ≈ 320 values, est. 2–3 h). Expected total
≈ 20 × (8+25+25+75+75+15+8) ≈ 4,600 inputs; ~3,000 from LLMs.

**Prompt families** (Phase 13), as files `17_CODE/prompts/<family>_<surface>.md` with SHA-256 recorded:
P1 normal (group D and E "valid" arm), P2 semantically unusual, P3 business-rule violation, P4 context
manipulation, P5 injection (AI-facing fields F03, F35, F39 only), P6 boundary, P7 Unicode/normalisation.
Group D uses P1–P4/P6/P7 with only the field name and schema; group E additionally receives the
field's purpose and its business rules (BUSINESS_RULES.md text) and is asked for structurally valid
values. P5 is run for both D and E on the three AI-facing fields and analysed separately.

**LLM controls.** Ollama 0.34.2; qwen3:4b (digest recorded); `think:false`, JSON output, `num_predict`
350, `top_p` 0.9 (default, recorded), temperature 0.8 for the three runs (seeds 11/22/33) plus one
temperature-0 run (seed 42) for E2b; prompts saved; generation failures counted, never regenerated;
cost = wall-clock and tokens (no monetary cost).

**Structural outcome.** (i) schema-only: the harness imports the same Zod schema and records
`schema_pass`; (ii) HTTP: POST to the route handler on the reset DB and record status, service
errors, `http_ms`. `structural_pass` := HTTP 2xx (the app's real decision, which includes the 5
enforced business checks; the schema-only result lets us separate schema from service rejections).

**Ground truth (GT), three sources, per Algorithm 1 in 07_METHODOLOGY.md.**
- R1 rule functions for OBJECTIVE rules. Pre-declared objective rules (deterministic given input + DB):
  B-PR-1, B-PR-2, B-PR-3, B-PR-4, B-CO-1, B-CO-2, B-CO-3, B-CO-6, B-SE-1, B-SE-2, B-BK-1, B-BK-2,
  B-BK-3, B-BK-4, B-RV-1, B-RV-2, B-RV-5, B-TK-1, B-TK-6 (partly). Pre-declared JUDGEMENT rules
  (need meaning): B-PR-5, B-PR-6, B-PR-7, B-CO-4, B-CO-5, B-CO-7, B-CO-8, B-CO-9, B-CO-10, B-SE-3,
  B-BK-5, B-BK-6, B-BK-7, B-BK-8, B-RV-3, B-RV-4, B-RV-6, B-TK-2, B-TK-3, B-TK-4, B-TK-5, B-CH-1, B-CH-2.
  Results are reported separately for objective-rule violations and judgement-rule violations
  (Gate A change 4).
- R2 judge model of a different family than the generator (gemma3:4b planned; fallback llama3.1:8b),
  temperature 0, JSON verdict per applicable rule with a one-line rationale, rubric text = the rule
  text + two fixed examples; the judge never sees the generation group or prompt.
- R3 human annotation: stratified sample of 200 structural passes (stratified by group × category;
  oversampling judgement rules), blind to group, using an annotation guide piloted in E0; 20 items
  repeated for intra-annotator agreement. Human verdicts override R2 where present.
- Agreement reported: κ(R2, R3) overall and by rule class; κ(R1, R2) on objective rules; the share of
  AMBIGUOUS labels. If κ(R2, R3) < 0.4 on judgement rules, judgement-rule results are downgraded to
  exploratory and the paper says so.

**Analysis unit.** One input (or cross-field pair). LLM inputs from three runs are pooled for the
primary tests with run as a reported source of variance (rates per run given as mean ± SD); a
sensitivity analysis uses one run only.

---

## E1 — Baseline gap measurement

```text
Objective: measure structural pass rates and conditional/unconditional SV-SI rates for all groups,
           by field category and by violated rule class.
RQ: RQ1, RQ2, RQ4
Hypothesis: H1 (D∪E conditional SV-SI CI lower bound > 0.05); H2 (category association; free-text and
           cross-field highest)
Dataset: generated corpus v1 (raw_inputs.jsonl), licence TBD (TH-05); no split (whole corpus).
Preprocessing: none on values (Phase 11). De-duplication is NOT applied; duplicates are counted and reported.
Baselines: groups A, B, C, F, G (see Shared design); strongest baseline for "inputs that pass" = group B
           random structurally valid; for "inputs that violate" = group C rule-based adversarial.
Proposed method: not applicable (measurement).
Ablations: schema-only vs HTTP structural outcome; objective-rule vs judgement-rule violations;
           with/without P5 inputs.
Independent variables: group, field category, prompt family, (run).
Dependent variables: structural_pass; final_label (VALID / SV-SI / AMBIGUOUS); violated rules.
Controlled variables: testbed commit, seed data, model + digest, temperature, num_predict, prompt files.
Metrics: structural pass rate; conditional SV-SI rate (primary) and unconditional; per-category and
         per-rule-class rates; Wilson 95% CIs; AMBIGUOUS share.
Setup: harness runs generate → structural → GT; DB reset before each group×run.
Hardware: i5-6440HQ 4 cores, 16 GB, no GPU (17_CODE/ENVIRONMENT.md).
Software: Node 22.19.0, Next 16.3.5, Zod 4.6.5, Prisma 7.10, Ollama 0.34.2, Python venv (pandas, scipy, statsmodels).
Hyperparameters + tuning budget: none tuned; LLM settings fixed above.
Runs / seeds: LLM groups 3 runs (seeds 11/22/33) at T=0.8; programmatic groups seed 2026.
Statistical analysis: H1 — Wilson CI on the pooled D∪E conditional rate; H2 — χ² test of
           independence (category × label among structural passes) with Cramér's V; post-hoc pairwise
           category comparisons with Holm correction (exploratory); RQ4 descriptive.
Expected output: 16_RESULTS/raw/E1_<run_id>/{raw_inputs.jsonl, validation_results.jsonl, semantic_labels.jsonl, db_after.sqlite, manifest.json}
Threats: construct validity of judgement rules (κ reported; separate reporting); testbed enforcement
           profile (Alternative 1 — results also reported for the 5 enforced rules, which by
           construction yield structural rejection); single app/domain.
```

## E2 — Group comparison (analysis of E1 data)

```text
Objective: test whether LLM inputs are disproportionately SV-SI once they pass structural validation.
RQ: RQ3   Hypothesis: H3a E > B; H3b E > G; H3c D > B (conditional SV-SI)
Dataset: E1 corpus, structural passes only, P5 excluded.
Baselines: B (random), G (benign-unusual human), A (valid human, expected ≈ 0), C (upper bound), F (boundary).
Independent: group.  Dependent: label.  Controlled: as E1.
Metrics: conditional SV-SI rate per group; odds ratios with 95% CI.
Statistical analysis: three pre-declared Fisher exact tests (H3a–c), Holm-corrected α = 0.05;
           effect size = odds ratio; all other pairwise contrasts exploratory (reported, flagged).
           Sensitivity: repeat with objective-rule violations only; with one LLM run only.
Threats: pooled runs inflate n for D/E — mitigated by run-level sensitivity and by reporting per-run
           rates; unequal n across groups (Fisher exact handles small cells).
Output: 16_RESULTS/analysis/E2_contrasts.csv (+ script).
```

## E2b — Model size and temperature (exploratory)

```text
Objective: does the effect depend on model size or temperature?
Dataset: 10-field subset (2 per category where possible), groups D and E, prompts P1–P4.
Conditions: qwen3:1.7b, qwen3:4b, qwen3:8b × T ∈ {0, 0.8}; 25 inputs per field per condition, 1 run at
           T=0 (deterministic), 3 runs at T=0.8 for 4b (already in E1), 1 run at T=0.8 for 1.7b and 8b.
Metrics: conditional SV-SI rate; structural pass rate; generation-failure rate; tokens/s.
Analysis: descriptive with CIs; χ² across models (exploratory). Stated limitation: one family (Qwen3), CPU quantised.
Est. time: 8b ≈ 500 calls × ~10 s ≈ 1.5 h; 1.7b ≈ 20 min; 4b T=0 ≈ 45 min.
```

## E3 — Semantic validation layer (designed after E1; skeleton pre-committed)

```text
Objective: evaluate five drop-in designs for detecting SV-SI inputs among structural passes.
RQ: RQ5   Hypothesis: H5 (some non-judge design: recall ≥ 0.70 at FPR ≤ 0.05 on held-out fields)
Dataset: E1 corpus, structural passes with final_label ∈ {VALID, SV-SI}; AMBIGUOUS excluded and counted.
Designs (Phase 18):  R    rules — the R1 rule functions packaged as middleware (objective rules only; floor)
                     EMB  embedding similarity to field purpose/exemplars (nomic-embed-text or bge-m3) +
                          logistic regression / LightGBM trained leave-fields-out
                     SLM  qwen3:0.6b (or 1.7b) prompted with the rule text, JSON verdict
                     HYB  R first, then EMB on the remainder
                     JUDGE qwen3:4b prompted with the rule text (reference; same model as generator —
                          disclosed; also tested against P5 inputs for injectability)
Split: 5-fold leave-fields-out (4 held-out fields per fold); thresholds chosen on training folds at
           FPR ≤ 0.05 on VALID inputs (groups A and G emphasised).
Metrics: recall, precision, F1, FPR, FNR at the chosen threshold; recall@FPR≤0.05 (primary); AUROC
           (secondary); coverage per rule class; per-design decision latency (single request, warm).
Statistical analysis: 1,000× stratified bootstrap CIs; McNemar for paired design comparison on the
           same inputs (exploratory).
Leakage check: no held-out field's inputs used for thresholds or classifier training; judge prompts
           contain rule text only, never labelled examples from the corpus.
Threats: R has recall bounded by objective-rule share; EMB exemplars must not be drawn from the
           corpus; JUDGE shares a model family with the generator (disclosed; R2 judge is a different
           family for ground truth, so labels are not self-graded).
Output: 16_RESULTS/raw/E3_<run_id>/decisions.jsonl; analysis/E3_metrics.csv
```

## E4 — Performance overhead

```text
Objective: measure request-path cost of each configuration.
RQ: RQ6   Hypothesis: H6 (R/EMB ≤ 50 ms added p95; JUDGE ≥ 1,000 ms)
Configurations: baseline (validation disabled via env flag) / structural-only / structural + {R, EMB, SLM, HYB, JUDGE}.
Workload: autocannon, 60 s per configuration, concurrency 1 and 8, mixed POSTs (booking, review,
           ticket-without-AI-triage, profile) drawn from group A values; 3 repetitions; warm-up 10 s discarded.
Metrics: p50/p90/p95/p99 latency, req/s, CPU % (pidstat), RSS MB, Ollama tokens per request;
           added latency = configuration − structural-only.
Statistical analysis: Mann–Whitney U on per-request latencies (config vs structural-only) with
           Cliff's delta; thresholds in H6 evaluated on the median of 3 repetitions' p95.
Controls: same machine, no other load, Ollama warm (keep_alive), DB reset between repetitions.
Threats: single CPU machine (stated); dev-server overhead (use `next build && next start`); Ollama
           `NUM_PARALLEL=1` serialises LLM calls at concurrency 8 (reported as observed behaviour).
Output: 16_RESULTS/raw/E4_<run_id>/latency_results.csv, metrics.csv
```

---

## Mandatory design checks

| Check | Status | Evidence / notes |
|---|---|---|
| Fair baselines | PLANNED | all groups hit the same frozen app, same DB state, same fields; LLM groups get no extra tuning; group C is explicitly the adversarial upper bound |
| Leakage | PLANNED | E3 leave-fields-out; thresholds on training folds; judge prompts carry rule text only; human annotators (the researcher) blind to group |
| Benchmark contamination | N/A for generation (no benchmark); for E3, corpus is new and unpublished before evaluation |
| LLM controls | PLANNED | model id + digest, T, top_p, seeds, prompts as files, ≥3 runs, wall-clock/tokens, non-determinism reported (O7) |
| LLM-as-judge validated | PLANNED | R2 judge vs human κ on 200 items; JUDGE design in E3 evaluated against final labels |
| Statistics | PLANNED | seeds; mean ± SD per run; Wilson/bootstrap CIs; Fisher/χ²/Mann–Whitney with OR/Cramér's V/Cliff's δ; Holm |
| Pre-commitment | at Gate B | H1–H6, primary metrics, the three RQ3 contrasts, H5/H6 thresholds, objective/judgement rule lists |
| Negative results | committed | a negligible SV-SI rate, no group difference, or no deployable layer are all reported |
| Human evaluation | PLANNED | single annotator (the researcher); no external subjects; TODO-HUMAN TH-09 ethics confirmation |

## Compute / time / cost estimate

| Exp ID | Runs | Est. time per run | Hardware | API cost | Total |
|---|---|---|---|---|---|
| E0 | 1 | ~30 min machine + 1 h human (guide pilot) | CPU | $0 | 1.5 h |
| E1 generation (D,E) | 3 runs × 20 fields × 50 | ~5 s/input → ≈ 4 h | CPU | $0 | ≈ 4 h background |
| E1 structural + R1 | 1 | minutes | CPU | $0 | < 15 min |
| E1 R2 judge | ~3,500 passes × ~5 s | ≈ 5 h | CPU | $0 | ≈ 5 h background |
| E1 R3 human | 200 + 20 items | ~1 min/item | human | — | ≈ 3–4 h human (TH-10 incl. groups A/G writing ≈ 2–3 h) |
| E2 / E2b | analysis; E2b ≈ 2.5 h generation | CPU | $0 | ≈ 3 h |
| E3 | EMB/SLM minutes–1 h; JUDGE ≈ 3,500 × 5 s ≈ 5 h | CPU | $0 | ≈ 6 h background |
| E4 | 7 configs × 2 concurrency × 3 reps × 70 s | ≈ 50 min | CPU | $0 | ≈ 1 h |
| Model pulls | qwen3:8b 5.2 GB, 1.7b 1.4 GB, 0.6b 0.5 GB, gemma3:4b 3.3 GB, embed ≈ 0.3 GB at ~1.8 MB/s | ≈ 1.7 h | network | $0 | ≈ 2 h |
| **Total** | | | | **$0** | **≈ 22 h machine (background) + ≈ 6–8 h human** |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| SV-SI rate for LLM groups ≈ 0 (H1 fails) | LOW–MEDIUM | C1/C4/C5 become negative or cost-only results | report honestly; C3 comparison still informative |
| Judgement-rule κ < 0.4 | MEDIUM | judgement results downgraded to exploratory | pilot guide; separate reporting pre-declared |
| Judge model refuses or narrates (Qwen3 think behaviour) | MEDIUM | label failures | JSON format + think:false (validated); different family for R2 |
| CPU time overrun | MEDIUM | schedule | background runs with checkpoints; E2b subset; JUDGE design capped at corpus size |
| Human annotation load (≈ 6–8 h) | MEDIUM | delay | batches of 50; pre-written groups A/G first |
| Concurrent publication of a web-input study | MEDIUM | novelty of C1 | monthly QF6 re-run; lead with C3–C5 |
| Ollama/model updates change behaviour | LOW | reproducibility | digests pinned; `ollama pull tag@digest` |

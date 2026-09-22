# 07 — METHODOLOGY — Semantic Validation Gaps in AI-Driven Web Applications

Version: v0.5 · Status: DRAFT (Stage 10) · Last updated: 2026-09-20

> Terminology from GLOSSARY.md. Every component is `PLANNED` until it exists in 17_CODE/, then `ACTUAL` (E7).

## 1. Overview and design rationale

The study is a controlled experiment on a frozen web application. Inputs from seven generation
groups are submitted, field by field, to the application's real HTTP validation path. Each input
receives (i) a **structural outcome** from the application (accepted / rejected, with error and
timing) and (ii) a **semantic label** from a ground-truth protocol that is independent of the
application and of the generator. The joint distribution of these two outcomes, by group and by
field category, answers RQ1–RQ4. Candidate **semantic validation layers** are then evaluated as
drop-in checks on the same labelled corpus (RQ5) and their request-path cost is measured under load
(RQ6). The mitigation layer is designed only after E1 shows whether a gap exists (Phase 18).

Rationale for a purpose-built testbed: the rule reference must be complete and frozen; real apps do
not enumerate their business rules. Threat (external validity) is stated in the paper.

## 2. System architecture (→ Fig. 1 in 09_DIAGRAMS/, PLANNED)

```text
                 ┌──────────────── 17_CODE/harness (TypeScript, Node 22) ────────────────┐
 Group A,G ──►  human-written CSVs (10_DATASETS/)                                         │
 Group B    ──►  random generator (schema-driven)                                         │
 Group C    ──►  rule-based adversarial templates (one per BUSINESS_RULES ID)             │
 Group F    ──►  boundary generator (min/max/enum/Unicode/whitespace)                     │
 Group D,E  ──►  LLM generator (Ollama, prompts P1–P7 as files, seeds, ≥3 runs)           │
                        │ raw_inputs.jsonl (append-only, with full metadata)              │
                        ▼                                                                 │
            ┌─ Structural measurement ─┐   POST /api/<surface>  (real Zod + service path)  │
            │  schema-only (imported)  │──────────────────────────► mono testbed ──► SQLite│
            │  + HTTP outcome + ms     │◄──────── {ok, errors} / 201|400 ─────────         │
            └───────────┬─────────────┘                                                    │
                        ▼ validation_results.jsonl                                         │
            ┌─ Ground truth (3 sources) ─┐                                                 │
            │ R1 rule functions (objective rules)                                          │
            │ R2 judge model ≠ generator family (rubric per rule, JSON, temp 0)             │
            │ R3 human annotation, stratified ~200, blind to group                          │
            └───────────┬─────────────┘  → semantic_labels.jsonl (+ AMBIGUOUS, κ)          │
                        ▼                                                                 │
            ┌─ Semantic layer candidates (E3) ─┐   validateSemantic(field, value, ctx)     │
            │ R · EMB · SLM · HYB · JUDGE       │──► decision, score, ms                    │
            └───────────┬─────────────┘                                                    │
                        ▼                                                                 │
            ┌─ Performance (E4) ─┐ autocannon vs baseline / structural / structural+layer  │
            └────────────────────┘  → latency_results.csv, metrics.csv                     │
            └─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Components and responsibilities

| Component | Responsibility | Inputs | Outputs | Status | Code location |
|---|---|---|---|---|---|
| Testbed app `mono` | subject under study: structural validation (Zod), 5 enforced business checks, DB, two AI features | HTTP JSON | `{ok, errors}`, DB rows | ACTUAL v0.2 (frozen at Gate B) | 17_CODE/testbed |
| Rule reference | 43 business rules with IDs and objectivity class | — | BUSINESS_RULES.md | ACTUAL (objectivity column PLANNED) | 17_CODE/testbed/BUSINESS_RULES.md |
| Field selection | 20 fields with category tags | inventory | `fields.json` | PLANNED | 17_CODE/harness/config/fields.json |
| Generators A–G | produce inputs with metadata | fields.json, prompts, CSVs | raw_inputs.jsonl | PLANNED | 17_CODE/harness/generate/ |
| Prompt files P1–P7 | versioned prompt text, one file per family × surface | — | — | PLANNED | 17_CODE/prompts/ |
| Structural runner | schema-only check (import schema) + HTTP submit; timing | raw_inputs | validation_results.jsonl | PLANNED | 17_CODE/harness/measure/structural.ts |
| Rule functions (R1) | deterministic check per objective rule ID | input + DB context | rule verdicts | PLANNED | 17_CODE/harness/groundtruth/rules/ |
| Judge (R2) | second-family model applies a per-rule rubric | input + rule text | verdict + rationale | PLANNED | 17_CODE/harness/groundtruth/judge.ts |
| Annotation kit (R3) | stratified sample export/import for the human | labels | CSV | PLANNED | 17_CODE/harness/groundtruth/annotate/ |
| Label merger | combines R1–R3 → final label / AMBIGUOUS; κ | verdicts | semantic_labels.jsonl | PLANNED | 17_CODE/harness/groundtruth/merge.ts |
| Semantic layer candidates | `validateSemantic(field, value, ctx)` × 5 designs | labelled corpus | decisions, scores, ms | PLANNED (after E1) | 17_CODE/testbed/lib/semantic/ |
| Load tester | autocannon scenarios per configuration | app | latency_results.csv | PLANNED | 17_CODE/harness/perf/ |
| Analysis | statistics + figures, regenerable | raw/ | 16_RESULTS/analysis/, 09_DIAGRAMS/ | PLANNED (Python venv) | 16_RESULTS/analysis/ |

## 4. Data flow — inputs, processing, outputs

Per input record (raw_inputs.jsonl): `experiment_id, input_id, field_id, surface, group, prompt_family,
model, model_digest, temperature, top_p, seed, run, prompt_file, prompt_hash, timestamp, value,
expected_category (generator's intent, e.g. "valid" / "rule B-BK-3 violation")`. Values are never
edited after generation (Phase 11); normalisation for submission (e.g. trimming) is done by the app,
not the harness.

Per validation record: `input_id, schema_pass, schema_errors, http_status, service_errors, structural_pass
(= http 2xx), schema_ms, http_ms, db_row_id`.

Per label record: `input_id, r1_verdicts{rule_id: PASS|FAIL|NA}, r2_verdicts{...}, r3_verdict?, final_label
(VALID | SV-SI | AMBIGUOUS), violated_rules[], rule_classes[], confidence, source_of_truth`.

## 5. Algorithms

```text
Algorithm 1: Ground-truth merge (per input, per applicable rule r)
Input: R1[r] ∈ {PASS, FAIL, NA}, R2[r] ∈ {PASS, FAIL, UNSURE}, R3[r] ∈ {PASS, FAIL, AMBIGUOUS, ∅}, class(r) ∈ {OBJECTIVE, JUDGEMENT}
Output: verdict[r]
1: if class(r) = OBJECTIVE and R1[r] ≠ NA:  verdict ← R1[r]            # deterministic rule wins
2: else if R3[r] ≠ ∅:                       verdict ← R3[r]            # human wins where present
3: else if R2[r] ∈ {PASS, FAIL}:             verdict ← R2[r]            # judge otherwise
4: else:                                    verdict ← AMBIGUOUS
5: final_label ← SV-SI if structural_pass and ∃r: verdict[r] = FAIL; VALID if structural_pass and ∀r: verdict[r] = PASS;
   AMBIGUOUS if structural_pass and no FAIL and ∃ AMBIGUOUS; N/A if not structural_pass
Agreement: Cohen's κ (R2 vs R3) and (R1 vs R2 on objective rules) on the annotated sample; reported per rule class.
```
Complexity: O(inputs × rules); negligible.

```text
Algorithm 2: Semantic layer evaluation (E3), per design d
Input: labelled corpus (structural passes only), design d with score s_d(field, value, ctx) ∈ [0,1], fields split K-fold by field (leave-fields-out)
1: for each fold: choose threshold τ on training fields s.t. FPR on VALID inputs ≤ 0.05
2: on held-out fields: recall = P(s_d ≥ τ | SV-SI), FPR = P(s_d ≥ τ | VALID), precision, F1; per rule class
3: bootstrap (1,000 resamples, stratified by field) → 95% CIs
Rules design R has no threshold (binary); JUDGE uses its verdict directly (no tuning).
```

## 6. Models and exact versions

| Model | Exact identifier / version | Access date | Licence | Role |
|---|---|---|---|---|
| qwen3:4b (Q4_K_M) | digest 359d7dd4bcda…4fae7 (17_CODE/ENVIRONMENT.md) | 2026-09-20 | Apache-2.0 (Qwen3) — TODO-HUMAN confirm | generator (D, E) primary; JUDGE design in E3 |
| qwen3:8b, qwen3:1.7b | digests recorded at pull | pending | Apache-2.0 | E2b model-size variation (generator) |
| gemma3:4b (or llama3.1:8b) | digest at pull | pending | Gemma / Llama community licences — TODO-HUMAN confirm | ground-truth judge R2 (different family from generator) |
| qwen3:0.6b or qwen3:1.7b | digest at pull | pending | Apache-2.0 | SLM design in E3 |
| nomic-embed-text or bge-m3 (Ollama) | digest at pull | pending | Apache-2.0 / MIT — confirm | EMB design in E3 |
| Ollama server | 0.34.2, image sha256:da6e0dc5…5532 | 2026-09-20 | MIT | runtime |

## 7. Training procedure
Not applicable for generators and judges (no fine-tuning). EMB design: a logistic-regression /
LightGBM classifier on embeddings may be trained on training-fold fields only (leave-fields-out);
hyperparameters fixed (default) — tuning budget: none beyond threshold selection.

## 8. Inference procedure
Ollama `/api/chat`, `stream:false`, `think:false`, JSON format for all generator/judge calls
(TESTBED_OBSERVATIONS.md engineering notes), `temperature` ∈ {0, 0.8}, `top_p` 0.9 (Ollama default,
recorded), `num_predict` 350, `seed` per run ∈ {11, 22, 33}. Full prompts saved in 17_CODE/prompts/.

## 9. Retrieval process — Not applicable.
## 10. Agent architecture — Not applicable (the testbed assistant is a single prompted call; no tools).

## 11. APIs and external services
Local only: testbed HTTP routes (`/api/profile|courses|bookings|reviews|tickets|chat`), Ollama HTTP.

## 12. Databases / storage
SQLite via Prisma (testbed); JSONL/CSV under 16_RESULTS/raw/<run_id>/ (append-only).

## 13. Security and privacy considerations
See EXPERIMENT_SAFETY.md. No personal data; injection inputs confined to the local testbed.

## 14. Failure modes and error handling

| Failure mode | Detection | Handling | Effect on results |
|---|---|---|---|
| LLM returns non-JSON / empty | parse failure | recorded as `generation_failure`; NOT silently regenerated; counted and reported | reduces n for that cell; reported per group |
| LLM output structurally invalid on purpose or by accident | structural runner | kept — it is data (structural fail) | feeds structural pass rate |
| Ollama timeout / crash | HTTP error | retry ×2 with same seed; then `generation_failure` | reported |
| CPU non-determinism across runs | run-to-run variance | ≥3 runs per LLM condition; report mean ± CI | variance reported |
| Judge returns UNSURE | rubric | treated per Algorithm 1 | AMBIGUOUS share reported |
| Human annotation fatigue / drift | κ on a 20-item repeat block | report intra-annotator agreement | construct-validity threat stated |
| App state dependence (capacity, promo) | DB reset per run; fixed seed data | ensures identical context for all groups | controlled variable |

## 15. Evaluation methodology (summary; details in 08_EXPERIMENT_PLAN.md)
E0 pilot → E1 gap measurement (RQ1, RQ2, RQ4) → E2/E2b group and model comparison (RQ3) → E3
detection (RQ5) → E4 overhead (RQ6). Primary metrics and tests are pre-committed in 08 and frozen at Gate B.

## 16. Reproducibility requirements (→ 17_CODE/ENVIRONMENT.md)
Frozen testbed commit hash; Ollama version + model digests; seeds; prompt files with hashes;
`package-lock.json`; Python venv versions; exact commands per run in RESULTS_LOG.md; raw JSONL released
(licence TODO-HUMAN TH-05).

## 17. PLANNED vs ACTUAL

| Item | PLANNED | ACTUAL | DIFFERENCE | REASON |
|---|---|---|---|---|
| (filled during Stage 12) | | | | |

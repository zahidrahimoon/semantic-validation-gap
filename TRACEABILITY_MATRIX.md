# TRACEABILITY MATRIX — Semantic Validation Gaps in AI-Driven Web Applications

Last updated: 2026-09-20 (Stage 9; result locations `RESULT PENDING` until Stage 12)

> Every RQ must reach a result and a discussion paragraph; every experiment must serve an RQ.

| RQ | Gap ID | Hypothesis | Contribution (C-ID) | Experiment ID | Metric(s) | Baseline(s) | Result location | Paper section |
|---|---|---|---|---|---|---|---|---|
| RQ1 | G1 | H1: conditional SV-SI(D∪E) CI lower bound > 0.05 | C1 | E1 | conditional + unconditional SV-SI rate, structural pass rate (Wilson 95% CI) | — (existence) | `RESULT PENDING: E1 — SV-SI rates` | VI.A Results; IX.A Discussion |
| RQ2 | G4 | H2: rates differ by field category; free-text & cross-field highest | C2 | E1 | conditional SV-SI per category; χ², Cramér's V; field×group exploratory | category "simple scalar" as reference | `RESULT PENDING: E1 — by category` | VI.B; IX.B |
| RQ3 | G2 | H3a E>B, H3b E>G, H3c D>B (conditional SV-SI) | C3 | E1 data, E2 analysis, E2b | pairwise Fisher + Holm, odds ratios; E2b model size/temperature | B random, G benign-unusual, A valid human, C rule-based (upper bound), F boundary | `RESULT PENDING: E2 — group contrasts`; `RESULT PENDING: E2b` | VI.C; IX.C |
| RQ4 | G1, G5 | exploratory | C2 | E1 | violated rule IDs / classes by group & category; injection share on AI-facing fields | — | `RESULT PENDING: E1 — violation taxonomy` | VI.D; IX.D |
| RQ5 | G3 | H5: some non-judge design recall ≥ 0.70 at FPR ≤ 0.05 (held-out fields) | C4 | E3 | recall@FPR≤0.05, precision, F1, FPR, FNR, per-rule-class coverage; bootstrap CIs | R rules (floor), JUDGE (reference), EMB, SLM, HYB | `RESULT PENDING: E3 — detection` | VII (approach), VI.E; IX.E |
| RQ6 | G3 | H6: R/EMB ≤ 50 ms p95 added; JUDGE ≥ 1,000 ms | C5 | E4 (+E3) | added p50/p90/p95/p99, req/s, CPU %, RSS MB, tokens; Pareto recall vs p95 | baseline (no validation), structural-only | `RESULT PENDING: E4 — overhead` | VI.F; IX.F |

## Orphan check (2026-09-20)

- RQs without an experiment: none
- Experiments without an RQ: none (E0 pilot serves calibration only and is not reported as a result)
- Contributions without validation: none
- RQs without a Discussion paragraph: all pending (draft not started)

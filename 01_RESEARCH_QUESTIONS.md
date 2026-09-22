# 01 — RESEARCH QUESTIONS, HYPOTHESES & CONTRIBUTIONS — Semantic Validation Gaps in AI-Driven Web Applications

Version: v0.5 · Status: DRAFT (Stage 9, after Gate A GO WITH CHANGES, D-007) · Last updated: 2026-09-20

> Derived from Gate-A-approved gaps G1–G5 (05_RESEARCH_GAP.md). RQ1–RQ5 are the human's original
> questions (USER_WORKFLOW_SPEC.md); RQ6 merges the human's RQ6 and RQ7 (D-008, reversible).
> Hypotheses and primary metrics are FROZEN at Gate B; later changes → DECISIONS_LOG.md.

Definitions (GLOSSARY.md): **structural pass** = accepted by the testbed's Zod schema + service
checks via the HTTP route; **SV-SI** = structural pass AND ≥1 business rule (BUSINESS_RULES.md)
violated per the ground-truth protocol (08 §GT). **Conditional SV-SI rate** = SV-SI / structural
passes (primary, per Gate A change 3); **unconditional** = SV-SI / all inputs (reported alongside).
Prompt family P5 (injection) is excluded from all primary rates and analysed separately (RQ4, G5).

## Research questions

### RQ1 — Can AI-generated inputs satisfy structural validation while violating application-level semantic or business expectations?
- Gap ID(s): G1
- Type: CONFIRMATORY (existence), descriptive magnitude
- Hypothesis H1: For LLM-generated inputs (groups D and E), the conditional SV-SI rate is greater than zero with a 95% Wilson CI whose lower bound exceeds 0.05 (i.e., not a negligible phenomenon).
- Null hypothesis H1₀: the conditional SV-SI rate of groups D∪E has a 95% CI lower bound ≤ 0.05.
- Primary metric: conditional SV-SI rate (D∪E), with unconditional rate and structural pass rate.
- Experiment ID(s): E1
- Frozen at Gate B: NO (pending)

### RQ2 — How frequently does this occur across different input-field categories?
- Gap ID(s): G4
- Type: CONFIRMATORY at category level; EXPLORATORY at field×group level (Gate A change 5)
- Hypothesis H2: Conditional SV-SI rates differ across the seven field categories (06_INPUT_SURFACE_INVENTORY.md §3); directional expectation from P21 §2 p.3 and P33 p.4: free-text and cross-field categories have the highest rates, simple scalar and structured/enum the lowest.
- Null hypothesis H2₀: no association between field category and SV-SI outcome among structural passes.
- Primary metric: conditional SV-SI rate per category; χ² test of independence, Cramér's V.
- Experiment ID(s): E1
- Frozen at Gate B: NO

### RQ3 — How does AI-generated input compare with human-designed, random, rule-based and boundary inputs?
- Gap ID(s): G2
- Type: CONFIRMATORY (three pre-declared contrasts), EXPLORATORY (others)
- Hypothesis H3: Among structurally valid inputs, the SV-SI rate of context-aware LLM inputs (E) exceeds that of (a) random structurally valid inputs (B) and (b) benign-unusual human inputs (G); (c) context-free LLM inputs (D) exceed random inputs (B). Rule-based adversarial inputs (C) are the designed upper bound and are compared descriptively.
- Null hypothesis H3₀: no difference in conditional SV-SI rate for each contrast.
- Primary metric: conditional SV-SI rate by group; pairwise Fisher exact tests for the three contrasts with Holm correction; odds ratios with 95% CI.
- Secondary (E2b, exploratory): effect of model size (qwen3 1.7B / 4B / 8B) and temperature (0 vs 0.8) within groups D/E on a 10-field subset.
- Experiment ID(s): E1 (data), E2 (analysis), E2b
- Frozen at Gate B: NO

### RQ4 — What types of semantic violations are most frequently produced?
- Gap ID(s): G1, G5
- Type: EXPLORATORY (descriptive taxonomy)
- Hypothesis: none (exploratory). Expectation: violations cluster in the rule classes *relevance/off-topic*, *cross-field inconsistency* and *plausibility*, with *instruction-to-system* violations concentrated in AI-facing fields (P43, P45).
- Primary metric: distribution of violated BUSINESS_RULES IDs and rule classes per group and per category; share of AI-facing SV-SI that is injection (P5) vs ordinary inappropriateness (P1–P4).
- Experiment ID(s): E1
- Frozen at Gate B: NO

### RQ5 — Can an additional semantic validation layer detect structurally valid but semantically inappropriate inputs?
- Gap ID(s): G3
- Type: CONFIRMATORY
- Hypothesis H5: At least one non-LLM-judge design (rules R, embedding similarity/classifier EMB, small LM SLM, hybrid HYB) achieves recall ≥ 0.70 on SV-SI inputs at a false-positive rate ≤ 0.05 on benign inputs (groups A and G), on held-out fields.
- Null hypothesis H5₀: no non-LLM-judge design reaches recall ≥ 0.70 at FPR ≤ 0.05.
- Primary metric: recall at FPR ≤ 0.05 (threshold chosen on a validation split, evaluated on held-out fields), plus precision, F1, FPR, FNR, coverage per rule class; LLM judge (JUDGE) reported as reference.
- Experiment ID(s): E3
- Frozen at Gate B: NO

### RQ6 — What latency and computational overhead does semantic validation introduce, and what is the trade-off between detection effectiveness and application performance? (merged RQ6+RQ7, D-008)
- Gap ID(s): G3
- Type: CONFIRMATORY (thresholds) + descriptive trade-off
- Hypothesis H6: On the study hardware (4-core CPU, no GPU), the rules and embedding designs add ≤ 50 ms to p95 request latency relative to structural-only validation, while the LLM-judge design adds ≥ 1,000 ms; therefore the detection–latency Pareto front is occupied by R/EMB/HYB, not by JUDGE.
- Null hypothesis H6₀: R and EMB add > 50 ms at p95, or JUDGE adds < 1,000 ms.
- Primary metric: added p50/p90/p95/p99 latency (ms), throughput (req/s), CPU and memory, tokens per request; trade-off plotted as recall-at-FPR≤0.05 vs added p95 latency.
- Experiment ID(s): E4 (with E3 detection numbers)
- Frozen at Gate B: NO

## Contributions

> Must match 06_NOVELTY.md and the paper's contribution list exactly (order per Gate A change 2).

| C-ID | Contribution (one sentence) | Contribution type | RQ(s) | Validated by (Experiment ID) |
|---|---|---|---|---|
| C3 | A controlled comparison of seven input-generation groups on a shared structural/semantic validity metric, including human-written and benign-unusual inputs | evaluation methodology + empirical | RQ3 | E1, E2, E2b |
| C4 | An evaluation of lightweight semantic validation layers (rules, embeddings, small LM, hybrid, LLM judge) for business-rule validity of web inputs, with FPR on benign-unusual inputs | empirical + evaluation methodology | RQ5 | E3 |
| C5 | A quantified detection–performance trade-off on commodity CPU hardware for baseline vs structural-only vs structural+semantic validation | empirical | RQ6 | E4 |
| C1 | An empirical characterisation of the SV-SI rate for LLM-generated inputs at a web application's input surface, judged against explicit business rules (extending output-side findings P33–P37 to the input side) | empirical | RQ1 | E1 |
| C2 | A taxonomy of semantic-gap types by input-field category with measured frequencies | empirical (taxonomy) | RQ2, RQ4 | E1 |

## Change history of RQs / hypotheses

| Date | Item | Before | After | Reason | Decision ID |
|---|---|---|---|---|---|
| 2026-09-20 | RQ6 + RQ7 | two RQs (overhead; trade-off) | one RQ6 | overlap; Gate A change 7 | D-008 |
| 2026-09-20 | primary metric | SV-SI rate (unspecified) | conditional SV-SI rate among structural passes, with unconditional alongside | Gate A change 3 | D-007 |

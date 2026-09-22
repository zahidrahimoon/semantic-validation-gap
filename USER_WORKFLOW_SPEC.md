# USER WORKFLOW SPECIFICATION (verbatim intent, received 2026-09-20)

> The human supplied a 39-phase workflow prompt ("FULL RESEARCH AUTOMATION WORKFLOW —
> Research Article: Semantic Validation Gaps in AI-Driven Web Applications"). This file
> preserves its substance so later sessions follow it. The workspace protocol
> (RESEARCH_SYSTEM.md, Parts A–H) remains the governing process; this spec adds
> project-specific requirements. Where the two conflict, the stricter integrity rule wins.

## Core research idea (do not replace)

Gap between **structural/input validation** (type, format, length, regex, range, enum) and
**semantic/contextual validation** (contextual correctness, logical consistency, domain
appropriateness, business rules, intended meaning, downstream safety) in AI-driven web apps.

Central hypothesis: runtime schema validation can accept an input that is structurally valid
but semantically inappropriate for the application's purpose, and AI-generated inputs can
systematically produce this situation.

Experimental environment: a Next.js application (created with
`npx create-next-app@latest my-app --yes`; see Stage 0 decision on what the app contains).

Objectives: (1) which inputs pass structural validation; (2) which structurally valid inputs
violate semantic/business expectations; (3) which field types are most vulnerable; (4) whether
AI-generated inputs differ from human-designed/random inputs; (5) whether an added semantic
validation layer detects these cases; (6) accuracy / FP / FN / latency / compute trade-offs.

Stance: falsify, validate or refine — never prove. Report weak/insignificant results honestly.

## Initial research questions (modify only with strong reason)

- RQ1 Can AI-generated inputs satisfy structural validation while violating semantic/business expectations?
- RQ2 How frequently does this occur across input-field categories?
- RQ3 How does AI-generated input compare with human-designed, random and rule-based inputs?
- RQ4 Which semantic-violation types are most frequent?
- RQ5 Can an additional semantic validation layer detect structurally valid but semantically inappropriate inputs?
- RQ6 What latency and computational overhead does semantic validation introduce?
- RQ7 What is the detection-effectiveness vs. application-performance trade-off?

## Phase requirements (condensed)

| User phase | Requirement | Where it lives in this project |
|---|---|---|
| 0 | Research concept (problem, hypothesis, RQs, risks, terminology, scope, evidence, falsification) | `00_RESEARCH_BRIEF.md` (Stage 1) |
| 1–3 | Literature search (IEEE, ACM, Springer, ScienceDirect, Wiley, USENIX, NDSS, OWASP, arXiv, Scholar, S2, Crossref); adopt field terminology if better; verified PDFs; matrix; thematic review | `02_SEARCH_STRATEGY.md`, `11_PAPERS/`, `03_LITERATURE_MATRIX.csv`, `04_LITERATURE_REVIEW.md`, `12_REFERENCES/` |
| 4 | Conservative research gap ("our search identified limited empirical evidence…") | `05_RESEARCH_GAP.md` |
| 5 | Refined RQs | `01_RESEARCH_QUESTIONS.md` |
| 6–7 | Inspect the Next.js project (versions, router, server actions, validation libs, ORM, auth, AI integrations); input-field discovery with per-field record (Input ID … Risk Category); never expose `.env` | `06_INPUT_SURFACE_INVENTORY.md` (project root, extra file) |
| 8–9 | Structural vs semantic distinction; field taxonomy; representative field selection with criteria | `06_INPUT_SURFACE_INVENTORY.md`, `07_METHODOLOGY.md` |
| 10 | Groups A (valid human) B (random) C (rule-based adversarial) D (AI) E (AI context-aware) F (boundary) G (benign unusual, for FP) | `08_EXPERIMENT_PLAN.md` |
| 11–13 | Reproducible generation framework with full metadata; model variation (recorded params; state limitation if one model); prompt families P1–P7 (P5 injection only for AI-processed fields) | `17_CODE/`, `08_EXPERIMENT_PLAN.md` |
| 14 | Isolated environment; `EXPERIMENT_SAFETY.md` | `EXPERIMENT_SAFETY.md` (project root, extra file) |
| 15–17 | Structural result per input; semantic ground truth independent of the generator (rules, separate model, human annotation); `AMBIGUOUS — HUMAN REVIEW` allowed | `16_RESULTS/`, `10_DATASETS/` |
| 18–19 | Mitigation designed only after baseline shows a gap; compare approaches A–F (embeddings, classifier, small LM, rule+semantic hybrid, LLM judge, domain constraints) | `07_METHODOLOGY.md` |
| 20–23 | Latency p50/p90/p95/p99, throughput, CPU, memory, cost; TP/TN/FP/FN, precision, recall, F1, FPR, FNR, coverage; breakdowns; justified statistics | `16_RESULTS/analysis/`, `10_STATISTICAL_ANALYSIS.md` |
| 24–26 | Reproducibility protocol; raw data never overwritten; `09_RESULTS.md` from real data only | `08_EXPERIMENT_PLAN.md`, `17_CODE/ENVIRONMENT.md`, `16_RESULTS/` |
| 27 | Original figures | `09_DIAGRAMS/` |
| 28–29 | Post-experiment novelty; contributions only if supported ("we used Next.js" is not novelty) | `06_NOVELTY.md` |
| 30–32 | IEEE manuscript; abstract only after results; four threats-to-validity classes | `13_DRAFT/` |
| 33–34 | Hostile critic; alternative explanations 1–6 (weak rules not AI; random same effect; human unusual similar; free-text only; just prompt injection; too expensive) | `14_REVIEWS/critic_report.md` |
| 35–39 | Final audit; file structure; staged workflow with approval for irreversible methodological decisions; never fabricate; final dashboard | `15_FINAL/`, `PROJECT_STATE.md` |

Labels required by the human in addition to A3: `NOT MEASURED`, `HUMAN REVIEW REQUIRED`,
`AMBIGUOUS — HUMAN REVIEW`.

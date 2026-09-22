# 00 — RESEARCH BRIEF — Semantic Validation Gaps in AI-Driven Web Applications

Version: v0.1 · Status: DRAFT v0.1 (Stage 1) · Last updated: 2026-09-20

## Stage 0 — Intake record

| Item | Answer | Source (HUMAN / `ASSUMPTION`) |
|---|---|---|
| Topic / core idea | Structural vs. semantic validation gap in AI-driven Next.js web apps; can AI-generated inputs pass schema validation yet violate semantic/business expectations; can a semantic layer detect them at acceptable cost (full spec: USER_WORKFLOW_SPEC.md) | HUMAN |
| Target venue | Undecided; IEEE conference format, 8–10 pages | DEFAULT accepted by HUMAN |
| Paper type (empirical / system-and-evaluation / algorithmic / survey / SLR / case study / position) | Empirical study | DEFAULT accepted by HUMAN |
| Deadline and available time | No hard deadline; ~2–3 h/week human time | DEFAULT accepted by HUMAN |
| Compute (GPU?) | No GPU. i5-6440HQ 4 cores, 16 GB RAM, Docker 29.2.0; Ollama in Docker, CPU only | HUMAN + measured |
| API budget | None; local open models only (Qwen family preferred) | HUMAN |
| Data access | All data synthetic, generated in-project | DEFAULT accepted by HUMAN |
| Team size | 1 human + AI system | DEFAULT accepted by HUMAN |
| Existing assets (code, data, results, prior papers) | None supplied. Testbed to be created with `npx create-next-app@latest my-app --yes` (bare scaffold; contents to be decided, Q1) | HUMAN |
| Constraints (must-use methods/datasets, domain) | Next.js testbed; black-and-white UI theme; keep code reviewable, no over-engineering | HUMAN |
| Human subjects / sensitive data | None | DEFAULT accepted by HUMAN |
| Expertise level in the area | Mid-level full-stack developer, ~3 years (Next.js, TS, Tailwind, shadcn/ui, Prisma, Docker; see zahidrahimoon.com) | HUMAN |

## 1. Working title

*Structurally Valid, Semantically Wrong: An Empirical Study of the Gap Between Schema Validation and Semantic Validation for AI-Generated Inputs in a Next.js Web Application* (working; final title chosen last, Stage 14).

## 2. Domain

Web application security and software testing, at the intersection of input validation, business-logic correctness, and LLM-integrated ("AI-driven") applications.

## 3. Problem statement

Modern web frameworks validate inputs at runtime with schema libraries (e.g., Zod, Yup, Valibot, JSON Schema) that check **structure**: type, presence, length, pattern, range, enumeration and format. Whether an input is **appropriate for the application's purpose** — consistent with other fields, plausible in the domain, compliant with business rules, safe for downstream consumers such as an LLM assistant — is a separate question that schemas do not answer. The study asks whether, and how often, inputs that pass structural validation nonetheless violate semantic or business expectations, whether inputs produced by large language models (LLMs) do so systematically or differently from human, random and rule-based inputs, and whether an additional semantic validation layer can detect such inputs at a cost acceptable for a web request path.

## 4. Motivation

* Input generation by LLMs is now routine (form auto-fill, agents operating web apps, synthetic test data, content generation). Such inputs are fluent and well-formed by construction, so they are unusually likely to *pass* structural checks while carrying content the schema author never anticipated.
* Business-logic flaws are consistently reported as hard to detect automatically because they depend on application-specific meaning rather than syntax (`V0 — UNVERIFIED`: OWASP guidance; to be confirmed in Stage 3).
* Where a field feeds an LLM component, semantically inappropriate content becomes a security question (indirect prompt injection), not only a data-quality one.
* Practitioners lack empirical guidance on where structural validation stops and what a semantic layer would cost.

## 5. Background

Structural validation is enforced at several layers of a typical Next.js application: client (react-hook-form + schema), server (server actions / route handlers with the same schema), database (types, uniqueness, foreign keys). Semantic expectations live in business-rule code, if anywhere, and are rarely enumerated. The testbed `mono` (17_CODE/testbed) makes both explicit: `lib/validation/index.ts` is the structural layer; `BUSINESS_RULES.md` lists 43 semantic expectations, of which 5 are enforced.

## 6. Existing approaches (preliminary)

> V0 allowed here but every item must be labelled `V0 — UNVERIFIED` until confirmed in Stage 3.

| Approach | Representative work | Verification level |
|---|---|---|
| Schema / type validation libraries (Zod, JSON Schema) | library docs; no academic study known to us | V0 — UNVERIFIED |
| LLM-based test-input and fuzz generation for web/REST APIs | recent arXiv/ICSE/ISSTA-line work on LLM fuzzing | V0 — UNVERIFIED |
| Business-logic vulnerability detection (specification inference, invariant mining) | classic web-security literature (e.g., Waler-style invariant inference) | V0 — UNVERIFIED (likely FOUNDATIONAL) |
| Prompt-injection detection / LLM guardrails (input and output filters) | guardrail frameworks and injection benchmarks | V0 — UNVERIFIED |
| Semantic input validation via LLMs ("semantic validation" in structured-output tooling) | practitioner tooling (e.g., Instructor docs) | V0 — UNVERIFIED (grey literature) |
| ML-based anomaly detection over HTTP inputs / WAFs | anomaly-detection literature for web requests | V0 — UNVERIFIED |

## 7. Initial research questions

RQ1–RQ7 as supplied by the human (USER_WORKFLOW_SPEC.md). Refined in Stage 9 only if literature or design gives a strong reason.

## 8. Objectives

O1 Measure the structural pass rate and the structurally-valid-but-semantically-invalid ("SV-SI") rate per field and per generation group. O2 Compare LLM-generated inputs (context-free and context-aware) with human, random, rule-based, boundary and benign-unusual inputs. O3 Characterise which field categories and violation types dominate. O4 Evaluate candidate semantic validation layers on detection and cost. O5 Report the trade-off honestly, including null results.

## 9. Expected contribution

Empirical characterisation (C1), a taxonomy of semantic-gap types by field category (C2), a controlled comparison of generation strategies (C3), an evaluation of lightweight semantic validators (C4), and detection/performance trade-off quantification (C5). Each is retained only if supported by results (Stage 8 / Phase 29).

## 10. Potential novelty — `UNCERTAIN` until Gate A

Our reading of the idea suggests the *combination* — explicit structural-vs-semantic distinction, LLM-generated inputs as the treatment, controlled non-LLM baselines, and an in-request semantic layer with measured overhead — may be under-studied. This is `UNCERTAIN` until the disconfirmation and novelty-kill searches (Stages 7–8). Using Next.js is not a novelty claim.

## 11. Expected methodology

Controlled experiment on a frozen testbed: groups A–G × prompt families P1–P7 × ~15–20 representative fields; structural outcome from the real schema and HTTP path; semantic ground truth from pre-written rules, an independent judge model of a different family, and human annotation of a stratified sample; mitigation layer compared only if a gap is shown; performance measured as baseline vs structural-only vs structural+semantic. Statistics pre-committed at Gate B.

## 12. Candidate datasets

| Dataset | Version | Licence | Size | Access | Notes |
|---|---|---|---|---|---|
| Generated input corpus (ours) | v1 at Gate B | to be chosen (suggest CC BY 4.0) | ~2,500–4,000 inputs | 16_RESULTS/raw | created in Stage 12 |
| Human-written valid/unusual inputs (ours, groups A and G) | v1 | same | ~15–20 fields × 20 | 10_DATASETS/ | written before generation |
| External prompt-injection corpora (only for P5 context, if suitable and licensed) | TBD | TBD | TBD | TBD | identified in Stage 3 |

## 13. Candidate metrics

| Metric | What it measures | Why appropriate |
|---|---|---|
| Structural pass rate | share of inputs accepted by the schema/HTTP path | defines the population at risk |
| SV-SI rate (primary) | share of structurally valid inputs judged semantically invalid | the phenomenon under study |
| Violation-type distribution | which BUSINESS_RULES IDs are violated | RQ4 taxonomy |
| Precision / recall / F1 / FPR / FNR per detector | detection quality incl. false alarms on group G | RQ5 |
| Cohen's κ | agreement between ground-truth sources | construct validity |
| Latency p50/p90/p95/p99, throughput, CPU, memory | cost of the semantic layer | RQ6–RQ7 |

## 14. Expected limitations

Single self-built application and domain; CPU-only small open models; ground-truth subjectivity; synthetic inputs rather than field traffic; results for Next.js/Zod may not transfer to other stacks.

## 15. Feasibility given resources

Feasible: all tooling is local and free; generation at 4–8B on CPU is hours per batch; human time needed mainly for annotation (~2–3 h) and reviewing the app. Risk: slow network for model downloads; CPU inference latency for the LLM-judge mitigation candidate will likely be prohibitive, which is itself a finding.

## 16. Search vocabulary

| Concept | Keywords | Synonyms | Related terms | Adjacent-field terms |
|---|---|---|---|---|
| Structural validation | input validation, schema validation, runtime type checking | syntactic validation, format validation | JSON Schema, Zod, type guards, data validation | data quality, constraint checking |
| Semantic validation | semantic validation, contextual validation, context-aware validation | business-rule validation, domain validation, plausibility check | business logic vulnerability, logic flaw, invariant | semantic anomaly detection, data plausibility |
| AI-generated inputs | LLM-generated input, AI-generated test case, LLM fuzzing | synthetic input generation, LLM test generation | adversarial input, agent-generated input | machine-generated text detection |
| AI-facing fields / injection | prompt injection, indirect prompt injection, LLM-integrated application | jailbreak, instruction injection | guardrails, input filtering, LLM firewall | agent security, tool-use security |
| Detection layer | semantic validator, LLM-as-judge, embedding classifier | guardrail, content filter | anomaly detection, WAF, latency overhead | small language model, distillation |

## 17. Candidate directions (2–4)

| Direction | Description | Pros | Cons / risks | Feasibility |
|---|---|---|---|---|
| D1 (default) | Full plan: baseline gap study + generation-strategy comparison + mitigation + cost | matches the human's idea; all RQs | largest scope; mitigation depends on gap existing | HIGH |
| D2 | Baseline gap study + generation comparison only (RQ1–RQ4), mitigation as future work | smaller, cleaner | weaker practical contribution | HIGH |
| D3 | Focus on AI-facing fields only (ticket, chat, bio) | sharp security framing | collapses into prompt-injection research (Alternative 5) | MEDIUM |
| D4 | Add a second, open-source Next.js app as subject | external validity | heavy setup, time | LOW–MEDIUM |

## 18. Assumptions

- `ASSUMPTION` A1: the testbed's enforcement profile (structural everywhere, few business checks) is typical of small production apps — to be qualified by literature.
- `ASSUMPTION` A2: 4–8B open models on CPU are adequate to exhibit the phenomenon, if it exists.
- `ASSUMPTION` A3: pre-written business rules plus an independent judge and a human sample give a defensible semantic ground truth.

## 19. Clarification questions for the human

None blocking. Open for later: preferred licence for released code/data (TODO-HUMAN).

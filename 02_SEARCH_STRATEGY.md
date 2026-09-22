# 02 — SEARCH STRATEGY & SEARCH LOG — Semantic Validation Gaps in AI-Driven Web Applications

Version: v0.2 · Status: SEARCHES RUN 2026-09-20 (logs archived in 11_PAPERS/search_reports/) · Last updated: 2026-09-20

> Everything in sections 1–7 is defined BEFORE searching.

## 1. Recency window

```text
Computed on (date): 2026-09-20
Current year:       2026
PRIORITY window:    2023 – 2026   (last 4 years incl. current)
SECONDARY window:   2020 – 2022
Older:              only if labelled FOUNDATIONAL (with justification)
Concurrent-work window (preprints): last 6–12 months → from 2025-09-20 to 2026-09-20
```

## 2. Inclusion / exclusion criteria

| # | Criterion | Include | Exclude |
|---|---|---|---|
| IC1 | Topic | input validation (structural/semantic/business-rule) in web apps; LLM-generated inputs, test cases or fuzzing for web/API systems; prompt injection in LLM-integrated apps; semantic/business-logic anomaly detection; LLM-based guardrails or validators with cost evaluation | generic ML security not involving application inputs; pure NLP data validation; hardware; unrelated 'semantic web' work |
| IC2 | Publication type | peer-reviewed journal/conference; recent preprints (labelled) | blogs, SEO sites, un-reviewed slides, mirrors |
| IC3 | Language | English | |
| IC4 | Years | per recency window | outside window unless FOUNDATIONAL |
| IC5 | Evidence quality | empirical evaluation or rigorous analysis | no evaluation, unverifiable venue |

## 3. Concepts and query families

| Concept | Terms / synonyms |
|---|---|
| C1 structural validation | input validation, schema validation, runtime type checking, JSON Schema, Zod, format validation |
| C2 semantic validation | semantic validation, contextual/context-aware validation, business-rule validation, business logic vulnerability, logic flaw, plausibility |
| C3 AI-generated inputs | LLM-generated input/test case, LLM fuzzing, semantic fuzzing, LLM test generation, adversarial input generation |
| C4 AI-facing fields | prompt injection, indirect prompt injection, LLM-integrated application, AI agent web security |
| C5 detection layer | guardrail, LLM-as-judge, semantic anomaly detection, input filter, latency overhead, small language model |

```text
"<topic>"                      "<topic>" survey OR review
"<topic>" framework            "<topic>" architecture
"<topic>" benchmark            "<topic>" dataset
"<topic>" evaluation           "<topic>" limitations OR challenges
"<topic>" <core method>        "<synonym>" <application domain>
"<topic>" site:ieeexplore.ieee.org    "<topic>" site:dl.acm.org
"<topic>" arxiv <current year>        (concurrent work)
```

| QF-ID | Query family | Concrete queries | Status (OPEN / SATURATED on date) |
|---|---|---|---|
| QF1 | Structural vs semantic input validation in web apps | "semantic validation" web application; "semantic input validation"; "schema validation" security limitations; "runtime schema validation" web; "context-aware input validation"; "business rule validation" web application; input validation limitations survey | SATURATED 2026-09-20 for "semantic validation"/"semantic anomaly" (same 3 old papers twice); zero peer-reviewed hits for Zod/runtime-schema/business-rule validation across 3 phrasings — re-run inside IEEE Xplore/ACM DL before recording as disconfirmation |
| QF2 | LLM-generated inputs / fuzzing / test generation for web & APIs | "LLM fuzzing" web; "large language model" test input generation REST API; "LLM-generated test cases" web application; "semantic fuzzing" LLM; LLM adversarial input generation web forms; LLM agents form filling | OPEN |
| QF3 | Prompt injection & LLM-integrated app security | "indirect prompt injection" web application; "prompt injection" benchmark detection; "LLM-integrated applications" security; AI agents web application security; guardrails input validation LLM | OPEN |
| QF4 | Business-logic flaws & semantic anomaly detection | "business logic vulnerabilit*" detection web; "logic flaws" web application detection; "semantic anomaly detection" web input; ML anomaly detection HTTP requests latency; invariant inference web application | OPEN |
| QF5 | Detection layer cost / LLM-as-judge validators | "LLM-as-a-judge" input validation latency; "small language model" guardrail latency; embedding-based classifier semantic input; guardrail overhead evaluation | OPEN |
| QF6 | Concurrent work (2025-09 → 2026-09 preprints) | all of the above + arxiv 2026; "structurally valid" "semantically" LLM inputs; schema validation LLM generated data | OPEN |

## 4. Sources

- [ ] IEEE Xplore  - [ ] ACM DL  - [ ] Springer  - [ ] ScienceDirect  - [ ] Wiley
- [ ] Taylor & Francis  - [ ] Nature  - [ ] MDPI (venue scrutiny)  - [ ] arXiv
- [ ] Semantic Scholar  - [ ] Crossref  - [ ] Google Scholar  - [ ] PubMed (if relevant)
- [ ] Official conference/journal sites

## 5. Citation chaining (A-tier papers)

| Seed Paper_ID | Backward (key references checked) | Forward (citing papers checked, source) | New Paper_IDs found |
|---|---|---|---|

## 6. Stopping rule

A query family is SATURATED when two consecutive searches return mostly already-known
papers. Record the date and the two searches (Search IDs) in section 3.

## 7. Concurrent-work check

| Date | Source | Query | Window | Hits examined | Threatening works (Paper_IDs) | Assessment |
|---|---|---|---|---|---|---|
| 2026-09-20 | WebSearch + arXiv listings (26 queries) | structural/schema-valid vs semantic; LLM inputs validation; semantic layer latency | 2025-09 → 2026-09 | ~200 | P33 OrderBench, P34 Constraint Tax, P35 SOB, P36 Schema-First, P37 Wrenn IC2E, P38 Song, P39 Calò CHI EA, P40 Zhao, P46 Tsigkopoulos, P61 Reflex-Guard, P64 Saleem | The FINDING "schema-valid output can be semantically wrong" is independently reported by ≥5 2026 preprints (structured-output/agent setting). No work found combining web-app input fields + business rules + LLM-vs-random/rule/human comparison + measured multi-design semantic layer. Novelty risk: HIGH for the bare phenomenon, MEDIUM for our combination. NOT saturated: ~1 relevant preprint/month → re-run monthly and before Gate A and before submission. |

## 8. Search log

| S-ID | Date | Source | Query | Filters | Results examined | Selected (Paper_IDs) | Rejected (n) | Rejection reasons |
|---|---|---|---|---|---|---|---|---|
| S-QF1/4 (17 searches) | 2026-09-20 | WebSearch + arXiv/Crossref confirmation | see `11_PAPERS/search_reports/search_QF1_QF4.md` §1 (per-query rows) | none (year hints in query) | ~160 | P01–P19 | ~120 | off-topic "semantic"=ontology/URL; blogs; broad surveys; attack-signature WAFs |
| S-QF2 (18 searches) | 2026-09-20 | WebSearch + arXiv/Semantic Scholar | `search_QF2.md` §1 | none | ~165 | P20–P32 | ~135 | LLM-as-target fuzzing; DL-library fuzzing; vendor blogs; REST tools without validity angle |
| S-QF3/5 (17 searches) | 2026-09-20 | WebSearch + arXiv/USENIX/OWASP | `search_QF3_QF5.md` §1 | none | ~170 | P43–P70 | ~130 | jailbreak-only; agent tooling; unconfirmed preprints; venue legitimacy |
| S-QF6 (26 searches, incl. 4 arXiv listing fetches) | 2026-09-20 | WebSearch + arXiv search listings | `search_QF6_concurrent.md` §1 | 2025-09 → 2026-09 emphasis | ~200 | P33–P42 | ~180 | adjacent structured-output work; agent benchmarks without validity split |

| D1–D5 (5 searches) | 2026-09-20 | WebSearch | disconfirmation queries for gaps G1–G5, text in `05_RESEARCH_GAP.md` | none | ~50 | none new (P20, P21, P64 re-found) | ~47 | blogs, patents, off-topic (semantic caching, code generation); 2 unscreened arXiv leads noted (2606.07810, 2501.10868) |

Per-query rows (query text, tool, hits examined, relevant count) are preserved verbatim in the four archived reports; this table summarises them so the log stays reproducible without duplication.

## 9. PRISMA-style counts

```text
Records identified (all sources):        ~695 result rows examined; 131 candidate rows reported
Duplicates removed:                      21 (same paper across families, e.g. Reflex-Guard, FormNexus, Tsigkopoulos)
Records screened (title/abstract):       110
Records excluded (with reasons below):   40
Full texts assessed for eligibility:     20 planned (V3/V4 reads, see SCREENING_REGISTER.md)
Full texts excluded (with reasons):      0 so far
Studies included:                        70 (A 18 · B 31 · C 21) — final count after reading
```

| Exclusion reason | Count |
|---|---|
| "semantic" means ontology/semantic-web/URL structure (IC1) | 3 |
| Attack-signature anomaly detection / WAF, not validity of accepted inputs (IC1) | 3 |
| Grey literature, thesis, or venue legitimacy uncertain (IC2, IC5) | 4 |
| Broad surveys or off-topic (IC1) | 4 |
| Attack-payload generation (SQLi/XSS), not semantic validity (IC1) | 2 |
| REST/API test-generation tools redundant with P23–P25 (no semantic-validity angle) | 7 |
| Peripheral web-agent IPI tooling / weak preprints (IC5) | 4 |
| Logic-vulnerability detection variants not about input semantics (IC1) | 5 |
| Adjacent structured-output / agent benchmarks (IC1) | 8 |

## 10. Methodological status

This review is: **SCOPING** (structured, logged, multi-source, single screener with AI assistance;
NOT a systematic literature review — no dual screening, no registered protocol).
Justification: the paper is an empirical study; the review positions it and identifies gaps.

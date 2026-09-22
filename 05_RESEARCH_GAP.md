# 05 — RESEARCH GAP — Semantic Validation Gaps in AI-Driven Web Applications

Version: v0.3 · Status: DRAFT (Stage 7) · Date: 2026-09-20 · Basis: `04_LITERATURE_REVIEW.md`, 20 notes,
search logs (`02_SEARCH_STRATEGY.md`, `11_PAPERS/search_reports/`), and the disconfirmation searches
D1–D5 below (run 2026-09-20 with WebSearch; results examined on the first page each).

Rule applied: a gap with no disconfirmation search cannot be rated above LOW; stated limitations and
future-work statements in the papers count more than our inference. Formulation is deliberately
conservative ("our search identified limited evidence"), not "no one has ever".

---

## Disconfirmation searches (Stage 7 specific; also logged in 02_SEARCH_STRATEGY.md §8)

| D-ID | Query (WebSearch, 2026-09-20) | What it found | Closes a gap? |
|---|---|---|---|
| D1 | empirical study "structurally valid" OR "schema-valid" inputs violate business rules web application form validation LLM-generated | P20 (known); practitioner articles (Towards Data Science "Your JSON is valid but your data is wrong"; TrueFoundry blog) describing the phenomenon for LLM *outputs*; USPTO patents on two-step schema + rule-base validation | No academic study of *inputs* to web apps; grey literature confirms practitioner awareness (context only) |
| D2 | LLM-generated inputs versus random versus rule-based versus human-written inputs web form validation pass rate comparison study | P21 (known: LLM vs random vs rule on pass rate); P20 (known); code-generation human-vs-LLM comparisons (off-topic) | No study with human-written inputs as a condition or with a semantic outcome |
| D3 | "semantic validation" layer web application request latency overhead embeddings classifier "small language model" LLM judge comparison | P64 (known, 61.2 ms A100); semantic-caching papers (off-topic); SLM-vs-LLM judge blogs; SLMJury arXiv 2606.07810 (small models as judges — not validation of app inputs; not screened) | No in-request semantic validator evaluated on CPU for web payloads |
| D4 | Zod OR "JSON Schema" runtime validation web application business logic constraints not expressible empirical study 2024 2025 2026 | Zod docs and dev blogs; JSONSchemaBench arXiv 2501.10868 (constrained-decoding benchmark, output side; not screened); P04-type formalisations | No empirical study of business-rule constraints vs runtime schema libraries |
| D5 | arxiv 2026 LLM agents fill web forms semantically wrong values pass validation field type analysis | P28-type form-filling benchmarks (known); one search summary quoted "semantic parameter errors … 16.83% for frontier models" without an attributable source — **V0 lead, unverified** (possibly arXiv 2605.08761, excluded at screening; re-screen) | No per-field-type analysis of semantically wrong-but-accepted form values |

Earlier concurrent-work searches (QF6, 26 queries) are also disconfirmation evidence for G1 and G2
and surfaced the Theme D papers.

---

## G1 — Measurement gap: SV-SI rate of LLM-generated inputs at a web application's input surface

```text
Gap ID / Type:   G1 / knowledge + evaluation
What is solved:  The phenomenon "schema-valid yet semantically wrong" is established for LLM OUTPUTS
                 consumed by APIs, tools and renderers (P33 Table 1 p.4; P34 Tables 3,6 pp.4–5;
                 P35 §6.2 p.7; P37 Tables III/V pp.6,8; P39 §3 p.3). Logic flaws surviving input
                 validation are established for human-crafted inputs (P11 §5.1 p.15; P07, P13 abstract).
What is partially solved:
                 LLM inputs to web forms are measured for ACCEPTANCE by the application (P20 Table 2
                 p.17; P21 Fig. 7 p.10), and semantic validity of LLM API values is measured for one
                 generator against a domain-coherence judgement (P24 Table 3 p.12). One form field is
                 shown to carry semantically malicious content past validation (P45 §3.2.3 p.6).
What remains unresolved:
                 How often LLM-generated values that PASS a web application's real structural
                 validation VIOLATE the application's explicit business rules, measured against a
                 rule reference independent of the application's own acceptance.
Evidence the gap exists (stated by authors, not inferred):
                 P20 §5.4 p.29 — "some invalid data … may also be successfully submitted … The
                 validation of such invalid tests will form part of our future work."
                 P26 §VII-C p.10 — oracle blind to "silent failures (incorrect results with HTTP 200)".
                 P39 §5 p.4 — generalisation "to full web applications with stateful interactions
                 remains an open question."
                 P33 §2 p.2 — "asks what remains unsolved after the structure is valid" (output side).
Disconfirmation: QF6 (26 queries), D1, D5 — found the output-side studies and grey literature only.
Why it matters:  Testing research uses acceptance as its success metric; if a material share of
                 accepted LLM inputs are semantically invalid, reported "validity" overstates test
                 quality and applications silently store wrong data (P35 §6.2 p.7 on silent propagation).
Feasible for us? YES — testbed, 39 fields with rule reference (BUSINESS_RULES.md), local models.
Gap confidence:  HIGH for the web-INPUT setting and rule-referenced measurement.
                 The bare phenomenon is NOT a gap (Theme D) — position as extension/replication.
```

## G2 — Methodological gap: controlled comparison of input sources on a shared structural/semantic metric

```text
Gap ID / Type:   G2 / methodological + evaluation
What is solved:  LLM vs random vs rule-based inputs compared on form PASS RATE (P21 Fig. 7 p.10:
                 83% / 3% / 23%); LLM vs LLM (P20, 11 models); prompt strategy vs model size for
                 diversity (P26 Table VII p.7); fine-tuned vs base small LM for semantic validity
                 (P24 Table 3 p.12).
What is partially solved:
                 P21 shows non-LLM baselines "deviated from the forms' specific requirements" (§4.5
                 p.10) — i.e., they fail STRUCTURALLY; nothing is said about semantic validity of
                 the inputs that do pass.
What remains unresolved:
                 Whether AI-generated inputs are MORE likely than random, rule-based, boundary or
                 human-written inputs to be SV-SI (as opposed to simply more likely to pass), and
                 whether context-aware prompting changes this. No included paper has a human-written
                 input condition (P20 uses humans only to rate outputs, Table 8 p.27).
Evidence the gap exists:
                 P20 §5.4 p.28 — no random/rule-based baselines (stated limitation).
                 P21 — semantic outcome not measured for passing inputs (OURS, from Def. 2 §3.2.2 p.7).
                 All 20 notes: RQ3 "NONE" or "PARTIAL" (04_LITERATURE_REVIEW.md cross-theme table).
Disconfirmation: D2, QF2 (18 queries) — nothing with human-written inputs or a semantic outcome.
Why it matters:  Alternatives 1–3 (weak rules not AI; random equivalence; human-unusual equivalence)
                 cannot be ruled out without this design; it decides whether the study is about AI at all.
Feasible for us? YES — groups A–G are designed for exactly this.
Gap confidence:  HIGH (two independent search families, one explicit stated limitation).
```

## G3 — System/evaluation gap: an in-request semantic validation layer for ordinary web inputs, with CPU-side cost

```text
Gap ID / Type:   G3 / system + evaluation + deployment
What is solved:  Input-side DETECTORS for adversarial intent exist and are benchmarked for accuracy
                 and FPR (P49 Table 8 p.1842; P54 Table 4 p.9; P56 abstract). Latency is reported
                 for some: 35–55 ms embedding classifiers on a T4 GPU (P61 Table VI p.9); 61.2 ms
                 median on an A100 (P64 Table 10 p.15); regex 0.03 ms / rules 2.5 ms / 86M
                 transformer 74 ms / LLM rail 1,470 ms on unspecified hardware (P63 Table 3 p.8);
                 LLM Guard 0.4 s in a web chatbot (P45 §5.2.3 p.10). Domain verifiers are advocated
                 (P33 §6 p.6) and used as oracles (P33, P34, P35).
What is partially solved:
                 Design templates: rules→embedding classifier (P64 §4.2.2 p.8), embedding + light
                 classifier with threshold routing to a slower judge (P61 §V p.11), tiered operating
                 points (P63 §1 p.2), SEU metrics (P60 §3.4 pp.4–5). Judge validation by fault
                 injection (P39 §3 p.3).
What remains unresolved:
                 A semantic validator for NON-adversarial data appropriateness (business rules,
                 cross-field consistency, plausibility) placed in the request path of a web
                 application, evaluated for precision/recall/FPR against a rule reference AND for
                 p50/p95/p99 latency, throughput and CPU cost on commodity CPU hardware, across
                 rule-based, embedding, small-LM and LLM-judge designs.
Evidence the gap exists:
                 P60 §1 p.1 — evaluations "frequently overlooking … inference latency, GPU resource
                 consumption, and utility".
                 P61 §II p.2 — "existing works rarely measure the trade-off between security and latency".
                 P54 — "deployable" detector with zero timing data (note, grep-confirmed).
                 P37 §IV.B p.5 — semantic check "not yet integrated into the pipeline as a blocking
                 validation step".
                 P33 — latency logged but never reported (note, OURS).
Disconfirmation: D3, QF5 (17 queries) — only intent/harm detectors on GPUs; none on data validity.
Why it matters:  A layer that costs 0.4–1.5 s per request (P45, P63) is not deployable for form
                 submission; a 3–60 ms layer might be. Whether cheap designs catch business-rule
                 violations at acceptable FPR is unknown.
Feasible for us? YES for rules, embeddings (nomic/bge via Ollama), small LM (qwen3 0.6–1.7B) and
                 LLM judge (qwen3 4–8B) on our CPU; GPU comparison NOT feasible (stated limitation).
Gap confidence:  HIGH for CPU-side, data-validity, in-request evaluation.
```

## G4 — Knowledge gap: which field categories are most exposed

```text
Gap ID / Type:   G4 / knowledge + generalization
What is solved:  Category-level breakdowns exist: form categories (P20 Table 4 p.22; P21 §5 p.11 —
                 travel forms with cross-field constraints 42% vs query forms 91%), task categories
                 (P33 Table 2 p.4), UI element types (P39 Fig. 1a p.4), a single integer field
                 dominating failures (P34 Table 7 p.5).
What is partially solved:
                 Cross-field constraints are repeatedly the hard case (P21 §2 p.3; P02/P03 abstract;
                 P33 "domain boundary tasks" p.4).
What remains unresolved:
                 Frequency of SV-SI by TYPED FIELD CATEGORY (simple scalar, structured/enum,
                 free text, financial, cross-field, AI-facing, search) for web inputs, and whether
                 the phenomenon is confined to free text (Alternative 4).
Evidence the gap exists:
                 Every one of the 20 notes records RQ2 as NONE or PARTIAL (04 cross-theme table).
Disconfirmation: D5, QF1 — none.
Why it matters:  Decides where a semantic layer is worth its cost; tests Alternative 4.
Feasible for us? YES — inventory has 39 fields across 8 categories (06_INPUT_SURFACE_INVENTORY.md).
Gap confidence:  MEDIUM — searches ran on the open web + arXiv; IEEE Xplore / ACM DL full-text
                 search not yet performed for this specific breakdown (TODO before Gate A).
```

## G5 — Boundary gap: semantic inappropriateness vs prompt injection in AI-facing fields

```text
Gap ID / Type:   G5 / knowledge + integration
What is solved:  Injection via stored form content is demonstrated (P45 §3.2.3 p.6; P46 abstract);
                 injection detectors are benchmarked (P49, P54); their FPR on benign text is the
                 deployment problem (P54, P56).
What is partially solved:
                 P41 §6 p.28 names "semantic input validation" as a missing control but scopes it to
                 adversarial instructions; P64 likewise.
What remains unresolved:
                 Whether a GENERAL semantic-appropriateness check on an AI-facing field (e.g. "is this
                 a support problem?") catches injection as a by-product, and how much of the SV-SI
                 rate on AI-facing fields is injection (P5 prompts) vs ordinary inappropriateness
                 (P1–P4). This is Alternative 5.
Evidence the gap exists:
                 P45 §7 p.11 — "sanitization and analysis of LLM inputs is a far more complex
                 problem"; P43 §5.6 p.12 — filters applied to chat but not to external input.
Disconfirmation: QF3 (17 queries), D3 — injection work treats detection as its own category.
Why it matters:  Keeps the paper from being "prompt injection under another name" (Critic Q11).
Feasible for us? YES — 4 direct AI-facing fields; P5 separated in analysis by design.
Gap confidence:  MEDIUM (secondary gap; depends on G1 results).
```

## Rejected / downgraded candidate gaps

| Candidate | Why not a gap |
|---|---|
| "Structural validation misses semantics" as such | Established: OWASP G01; P11 (2010); Theme D (2026). Background, not contribution. |
| "LLM outputs can be schema-valid but wrong" | Established by P33–P37 (five 2026 studies). We replicate/extend on the *input* side. |
| "Next.js/Zod validation is understudied" | True by search (zero hits, QF1) but framework choice is not a research gap (USER_WORKFLOW_SPEC Phase 28). Use as *setting*, not *claim*. |
| "No prompt-injection detector is deployable" | Actively studied (P54, P56, P61, P63); not ours to close. |

## Summary for Gate A

| Gap | Type | Confidence | Feeds RQ | Tests alternative |
|---|---|---|---|---|
| G1 | knowledge/evaluation | HIGH (setting), phenomenon itself NOT novel | RQ1, RQ4 | — |
| G2 | methodological | HIGH | RQ3 | Alt 1, 2, 3 |
| G3 | system/evaluation/deployment | HIGH (CPU, data validity) | RQ5, RQ6, RQ7 | Alt 6 |
| G4 | knowledge | MEDIUM (DL full-text search pending) | RQ2 | Alt 4 |
| G5 | knowledge/integration | MEDIUM | RQ4, RQ5 | Alt 5 |

Open TODO before Gate A: (i) run the G1/G4 disconfirmation queries inside IEEE Xplore and ACM DL
(publisher pages blocked automated fetch; TODO-HUMAN or browser session); (ii) re-screen arXiv
2605.08761 for the "semantic parameter errors" statistic (D5 lead, V0); (iii) obtain P02 and P08 PDFs.

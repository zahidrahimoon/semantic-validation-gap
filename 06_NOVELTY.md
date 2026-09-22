# 06 — NOVELTY — Semantic Validation Gaps in AI-Driven Web Applications

Version: v0.4 · Status: DRAFT for Gate A · Date: 2026-09-20 · Basis: `05_RESEARCH_GAP.md`, 20 notes,
novelty kill search K1–K6 (below). Language rule: "this work proposes / investigates"; "first" is not
used anywhere; positioning phrases are "to the best of our knowledge, based on a search of [sources]
up to 2026-09-20".

---

## 1. Nearest-neighbour analysis (five closest works, read at V4)

| Dimension | **P33** Li 2026 OrderBench | **P37** Wrenn et al. 2026 (IBM, IC2E) | **P20** Li et al. TOSEM 2026 | **P21** Alian et al. 2024 FormNexus | **P45** Pedro et al. ICSE 2025 P2SQL | **Ours (proposed)** |
|---|---|---|---|---|---|---|
| Problem | schema-valid LLM *outputs* that are semantically wrong/unsafe | structurally valid workflow *outputs* that do not fulfil intent | LLM-generated *inputs* for web-form testing | LLM inference of form constraints for testing | injected free text stored via forms reaching SQL | structurally valid *inputs* to a web app that violate business rules |
| Setting | restaurant-ordering agent, JSON API | production enterprise workflow platform | 146 real forms in 30 Java apps | 30 real forms | LangChain SQL chatbots | one Next.js app, 39 fields / 7 surfaces, 20 selected |
| Input producer | 4 open LLMs (API) | 6 LLMs (API) | 11 LLMs | GPT-4, Llama 2 + random + rule-based | authors (attacker-crafted) | LLM (context-free, context-aware) **+ human + random + rule-based + boundary + benign-unusual** |
| Reference for "semantic" | hand-coded domain verifier (oracle) | LLM judge, 10-criterion rubric (unvalidated) | application acceptance (SSR) | form feedback (FSS) | attack success | **pre-written business rules + independent judge model + human sample, agreement reported** |
| Outcome measured | schema validity vs semantic success / unsafe acceptance | structural success vs semantic satisfaction; cost; latency | SSR; failure taxonomy; human quality rating | FSS coverage; passing rate | success rate per attack; defence coverage; latency | **SV-SI rate by field category and generation group; violation taxonomy; detector P/R/FPR; p50–p99 latency, CPU** |
| Validation layer evaluated | no (verifier is oracle) | no (judge offline, not blocking) | no | no | LLM Guard (coverage + 0.4 s) | **yes: rules, embeddings, small LM, LLM judge, hybrid — accuracy AND CPU cost** |
| What we do differently | input side; web app; non-LLM baselines; typed fields; deployable layer with cost | inputs not outputs; open CPU models; rule reference; per-field | separate structural pass from semantic validity (they conflate, §5.4 p.29); add human/random/rule/boundary groups | semantic outcome for *passing* inputs; validator, not generator; cost | non-adversarial semantic violations across 20 fields; injection isolated as P5; FPR on benign inputs | — |

Secondary neighbours for the detection-layer contribution: P63 (tiered guardrails with latency, unspecified
hardware), P64 (rules→embedding classifier, 61 ms on A100), P61 (embedding + light classifier, T4), P24
(small-LM latency for generation). None evaluates data-appropriateness of ordinary inputs on CPU.

## 2. Novelty kill search (2026-09-20, WebSearch; in addition to QF6 and D1–D5)

| K-ID | Query (abridged) | Outcome |
|---|---|---|
| K1 | semantic validation middleware web forms LLM-generated inputs evaluation precision latency Next.js/Express/Django | Only framework docs and vendor courses (Instructor, Guardrails AI). No academic evaluation. |
| K2 | taxonomy "semantic violations" LLM-generated form inputs web application fields | P39 (known, UI markup), accessibility-repair studies, agent fault taxonomies. Nothing on input values. |
| K3 | benchmark "business rule" violations LLM-generated data web inputs beyond schema | BREX (rule extraction from text), **ShopGym arXiv 2605.16116** (e-commerce agent simulator with 7 post-generation validation rules — adjacent, unscreened, V0), LogiSafetyGen (regulatory tool calls). None measures SV-SI of web inputs. |
| K4 | detect implausible form field values embeddings classifier small LM latency | P57 (known, injection); **USPTO 12288159 "context embedding approach for detecting data entry errors"** (adjacent patent, unscreened, V0); plausibility probes in LLM layers (NLP). No web-input validator evaluated. |
| K5 | context-aware prompting LLM inputs pass validation violate business logic | Vendor security pages; ARGUS (agent provenance). Nothing empirical on generated inputs. |
| K6 | patents: semantic validation of user input using language model beyond schema | XML/document schema patents; LLM output citation patents. No match. |

Result: no work found that already delivers any of C1–C5 in the web-input setting. Two adjacent
V0 leads (ShopGym; USPTO 12288159) must be screened before submission (TODO).

## 3. Contributions

| # | Contribution (proposed) | Closest existing work | Concrete difference | Evidence the difference is real | Expected benefit | Validated by | Novelty confidence |
|---|---|---|---|---|---|---|---|
| C1 | Empirical characterisation of the SV-SI rate for LLM-generated inputs at a web application's input surface, judged against explicit business rules | P33, P34, P35, P37 (outputs); P20 (inputs, acceptance oracle) | inputs not outputs; rule reference independent of the app; per-field | P20 §5.4 p.29 defers exactly this; Theme D notes: none uses an input surface | quantifies how much of "validity" in testing research is semantic invalidity | E1 (Stage 11) | **M** — phenomenon known, setting and measurement new |
| C2 | Taxonomy of semantic-gap types by input-field category (simple scalar, structured, free text, financial, cross-field, AI-facing, search) | P33 Table 3 (domain errors), P43 Fig. 2 (threats), P24 IPD taxonomy, P39 Table 1 (UI) | organised by *field category* of a web app, with frequencies; tests Alternative 4 | all 20 notes: RQ2 NONE/PARTIAL | tells developers where a semantic layer pays off | E1, E2 | **M** (G4 MEDIUM confidence) |
| C3 | Controlled comparison of seven input-generation groups (human, random, rule-based adversarial, LLM context-free, LLM context-aware, boundary, benign-unusual) on the same structural/semantic metric | P21 (LLM vs random vs rule, pass rate only); P20 (no baselines) | semantic outcome; human-written and benign-unusual conditions; context-aware prompting as treatment | P20 §5.4 p.28; no note has a human-written condition | decides whether the effect is about AI (Alternatives 1–3) | E2 | **H** for the design; result direction unknown |
| C4 | Evaluation of lightweight semantic validation layers (rules, embedding similarity/classifier, small LM, LLM judge, rule+semantic hybrid) for data appropriateness of web inputs, incl. FPR on benign-unusual inputs | P63, P64, P61 (intent detectors); P45 LLM Guard; P33 §6 verifier (advocated, not evaluated) | target is business-rule validity, not adversarial intent; benign-unusual FPR group; in-request placement | P60 §1 p.1, P61 §II p.2 (cost overlooked); P37 §IV.B p.5 (not blocking) | practical guidance on which design is deployable | E3, E4 | **M–H** |
| C5 | Quantified detection/performance trade-off on commodity CPU (p50/p90/p95/p99, throughput, CPU, memory, tokens) for baseline vs structural-only vs structural+semantic | P63 Table 3 (tiers, HW unspecified), P64 Table 10 (A100), P61 Table VI (T4), P45 Fig. 3 | CPU-only, request-path, structured payloads | no CPU measurement in any note | realistic cost for small deployments | E4 | **H** for CPU/setting; **L** as a methodological idea (P60 SEU exists) |

Contributions retained only if E1–E4 support them (Phase 29). If E1 shows a negligible SV-SI rate,
C1 becomes a negative result and C4/C5 are reduced to a cost study of layers with nothing to catch —
still reportable, and the honest outcome.

## 4. Contribution type

Primarily **empirical analysis** (C1–C3) and **evaluation methodology** (C3's controlled design, C4's
benign-unusual FPR protocol, C5's CPU cost protocol), plus an **application with methodological
contribution** (the frozen testbed + rule reference as a reusable artefact). The testbed as software is
**not** claimed as a research contribution. The choice of Next.js is a setting, not a claim.

## 5. Novelty risk

**Overall: MEDIUM.** Reasons:
- HIGH risk on the headline phenomenon: five 2026 studies (P33–P37) already show "schema-valid but
  semantically wrong" for LLM outputs, and P11/OWASP make the structural/semantic distinction itself
  classical. Any framing of C1 as a discovery would be rejected by an informed reviewer.
- MEDIUM risk of concurrent work: this area produced roughly one relevant preprint per month from
  March to September 2026 (QF6). A web-input version of P33 could appear before submission. Mitigation:
  monthly re-run of QF6, and lead with C3–C5, which are less likely to be scooped together.
- LOW risk on C3–C5 as a bundle: no work found combining non-LLM/human baselines, per-field-type
  analysis, and CPU-side layer cost for data validity.
- Threat from adjacent unscreened leads: ShopGym (2605.16116) and USPTO 12288159 — screen before Gate B.

**Positioning sentence for the paper (draft):** "To the best of our knowledge, based on a search of
IEEE Xplore/ACM DL metadata, arXiv, Semantic Scholar and Crossref up to 20 September 2026, prior work
establishes the schema-valid-but-semantically-wrong phenomenon for LLM outputs; this work investigates
it for LLM-generated *inputs* at a web application's validation boundary, against explicit business
rules, with non-LLM and human-written baselines, and evaluates the cost of closing it on CPU hardware."

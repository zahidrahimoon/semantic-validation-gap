# PROJECT STATE — Semantic Validation Gaps in AI-Driven Web Applications

> Single source of truth (B2). Updated at the end of every working turn.

```text
Project:            Semantic Validation Gaps in AI-Driven Web Applications
Slug:               semantic-validation-gap
Version:            v0.8-partial (pre-results manuscript drafted; NO results exist)
Current stage:      PAUSED by researcher 2026-09-21 19:07, mid-fix of DV-09 (booking capacity bug). Resume BLOCKED until fix done — see 17_CODE/harness/RESUME_BLOCKED.md
Operating mode:     FULL (see capability check)
Created:            2026-09-20
Last updated:       2026-09-20 (literature collected)
Completed stages:   0, 1 (brief), 2 (strategy + 78 logged searches), 4 (matrix metadata), 5 (bib: 70 entries, valid); 10a partial (testbed built, inventory written, NOT frozen)
Open gates awaiting human decision: none (Gate A = GO WITH CHANGES D-007; Gate B = APPROVED D-010)
Open CRITICAL/HIGH issues:          DV-03 (HIGH) — human baseline is AI-drafted pending review; blocks H3b as an AI-vs-human contrast
Testbed: main @ 62a7267 (v1.0-frozen) for E1-E3; branch e4-semantic-layer (v1.1-semantic) for E4 only
Papers: identified 131 / screened 110 / included 70 (A17 B33 C20) / V4 15 / V3 5 / V2 50
Next actions (ordered):
  0. [RESUME HERE] Finish DV-09: per-input booking reset in measure/structural.ts; judge uses frozen judge_sample_ids.json + supplementary sample for F25/F29; add step to run_all.sh; typecheck; test one booking input; delete RESUME_BLOCKED.md; ./pipeline.sh start. Then E1 is re-labelled and re-analysed (the pre-fix E1 tables are superseded).
  -- progress at pause: E1 generation 100%, structural 100% except 678 re-queued booking inputs, judge 1200/1200 (base sample), E2b partly generated (1.7b + T0 done, 8b partial), E3 and E4 not started.
  1. HUMAN (TH-10, BLOCKING for the H3b claim): review the AI-drafted group A/G values (272 short values) and sign the record in 10_DATASETS/human_inputs/PROVENANCE.md
  2. When E1 generation + structural finish: run judge (needs gemma3:4b), merge, then `16_RESULTS/analysis/e1_e2_analysis.py` and `make_figures.py`
  3. Run E1 (all 17 targets, groups A–G, 3 LLM runs) → E2/E2b → design and run E3 → E4; then replace the 7 RESULT PENDING placeholders in 13_DRAFT/paper.tex
  4. Spot-check 3 notes against PDFs (P33, P45, P63) before drafting
  4. Resolve Stage 5 TODOs: P20 TOSEM vs arXiv version, P21 ISSTA 2024 DOI, P45 ICSE title, P64 first author/venue (NOT VERIFIED — HUMAN REVIEW REQUIRED), P61 integrity flags
  4. Stage 7 gap with disconfirmation searches (incl. IEEE Xplore/ACM DL re-run for Zod/runtime-schema/business-rule validation); Stage 8 novelty kill search; early critic → Gate A
  5. Human: review testbed (commit d4d6f69), BUSINESS_RULES.md, and supply PDFs for P02 (IEEE TSC) and P08 (Inderscience) if no OA copy exists
Blocked on human:
  - Nothing blocking; testbed review welcome (not required to continue literature work)
```

## Capability check (latest)

```text
Date:                       2026-09-20
Web search:                 YES (WebSearch tested)
Web page fetch:             YES (WebFetch tested on api.crossref.org)
Code execution / sandbox:   YES (bash, Python 3 venv, Node v22.19.0, npm 10.9.3)
Sandbox internet access:    YES (tools/crossref_lookup.py resolved 10.1109/5.771073)
Persistent file system:     YES (workspace on disk)
Uploaded PDFs available:    NO (none yet)
LaTeX compilation:          YES (TinyTeX, IEEEtran.cls, latexmk)
Diagram rendering:          PARTIAL (matplotlib/seaborn YES; Mermaid CLI and Graphviz NOT installed; TikZ via LaTeX YES)
Local LLM runtime:          NO (ollama not installed; no GPU; 4 CPU cores, 15 GB RAM)
LLM API keys in env:        NONE (ANTHROPIC/OPENAI/GOOGLE/OPENROUTER not set)
OPERATING MODE:             FULL for literature and drafting; LLM-generation experiments BLOCKED until model access is decided (Stage 0 Q2)
```

## Stage tracker

| Stage | Name | Status | Version | Date done | Output file(s) |
|---|---|---|---|---|---|
| 0 | Intake | DONE | v0.1 | | 00_RESEARCH_BRIEF.md (intake section) |
| 1 | Research brief | DONE | v0.1 | 2026-09-20 | 00_RESEARCH_BRIEF.md |
| 2 | Search strategy + log | DONE (re-run monthly for concurrent work) | v0.2 | 2026-09-20 | 02_SEARCH_STRATEGY.md, 11_PAPERS/search_reports/ |
| 3 | Screening, verification, reading | DONE (15 V4, 5 V3 notes; 2 PDFs requested) | v0.2 | 2026-09-20 | 11_PAPERS/SCREENING_REGISTER.md, notes/ |
| 4 | Literature matrix | DONE (70 rows; 20 with content from notes; 50 metadata-only) | v0.2 | 2026-09-20 | 03_LITERATURE_MATRIX.csv, 11_PAPERS/EVIDENCE_DIGEST.md |
| 5 | Bibliography | DONE (70 entries, parsed OK; audit pending) | v0.2 | 2026-09-20 | 12_REFERENCES/ |
| 6 | Synthesis | DRAFTED | v0.3 | 2026-09-20 | 04_LITERATURE_REVIEW.md |
| 7 | Research gap | DRAFTED (G1–G3 HIGH, G4–G5 MEDIUM; DL full-text check pending) | v0.3 | 2026-09-20 | 05_RESEARCH_GAP.md |
| 8 | Novelty | DRAFTED (risk MEDIUM; kill search K1–K6) | v0.4 | 2026-09-20 | 06_NOVELTY.md |
| ⛔ A | Gate A — Go / Pivot / Stop | PASSED — GO WITH CHANGES (D-007) | v0.4 | 2026-09-20 | DECISIONS_LOG.md, 14_REVIEWS/critic_report.md |
| 9 | RQs, hypotheses, traceability | DRAFTED (RQ1–RQ6; RQ6+RQ7 merged, D-008) | v0.5 | 2026-09-20 | 01_RESEARCH_QUESTIONS.md, TRACEABILITY_MATRIX.md |
| 10 | Methodology | DRAFTED (testbed ACTUAL v0.2, harness PLANNED) | v0.5 | 2026-09-20 | 07_METHODOLOGY.md, EXPERIMENT_SAFETY.md, 17_CODE/testbed |
| 11 | Experiment plan | DRAFTED (E0–E4; freeze list) | v0.6 | 2026-09-20 | 08_EXPERIMENT_PLAN.md |
| ⛔ B | Gate B — Method & plan approval | PASSED — APPROVED (D-010) | v0.6 | 2026-09-20 | DECISIONS_LOG.md |
| 12 | Execution support & results | RUNNING. Built: harness (generate/structural/rules/judge/merge/sample/import-labels), 5 semantic designs + E3 runner, E4 driver, 3 analysis scripts. E0 pilot done (118 inputs, 76 passes). E1 generation under way; judge→merge→analysis chain armed | v0.7 | | 16_RESULTS/raw/E1_E1_20260920T0847/, 16_RESULTS/analysis/, 17_CODE/harness/ |
| 13 | Diagrams | NOT STARTED | v0.8 | | 09_DIAGRAMS/ |
| 14 | Drafting | PARTIAL — full manuscript except Results/Discussion (7 RESULT PENDING placeholders); compiles, 8 pp, 65 refs, 0 undefined cites | v0.8 | 2026-09-20 | 13_DRAFT/paper.tex, paper.pdf, paper.md, CLAIMS_LEDGER.csv |
| 15 | Critic, audit, reviewer simulation | PARTIAL — critic run 1 done; citation audit done (5 defect classes fixed); reviewer simulation needs results | v0.9 | 2026-09-20 | 14_REVIEWS/critic_report.md, 12_REFERENCES/citation_audit.md |
| 16 | Venue compliance & IEEE formatting | NOT STARTED | v0.9 | | 13_DRAFT/paper.tex |
| 17 | Final QA gate & handover | PARTIAL — ai_disclosure.md and submission_checklist.md written; QA gate needs results | v1.0 | 2026-09-20 | 15_FINAL/ |
| 18 | Post-submission (optional) | NOT STARTED | — | | 14_REVIEWS/, 15_FINAL/ |

## PDFs requested from human

| Paper_ID | Citation | Why needed (central to gap / novelty / baseline) | Requested on | Received |
|---|---|---|---|---|
| P02 | Martin-Lopez et al. 2022, IEEE TSC 15(4), 10.1109/tsc.2021.3050610 | strongest academic treatment of beyond-schema (inter-parameter) constraints; A-tier | 2026-09-20 | no (checking for author OA copy first) |
| P08 | Hanna & Munro 2018, IJWET 13(3), 10.1504/ijwet.2018.095186 | only paper using "semantic-based user input validation" in our sense | 2026-09-20 | no |

## TODO-HUMAN register

| ID | Item | Stage | Raised | Resolved |
|---|---|---|---|---|
| TH-01 | Supply PDF for P02 (Martin-Lopez 2022, IEEE TSC) if no OA copy exists | 3 | 2026-09-20 | |
| TH-02 | Supply PDF for P08 (Hanna & Munro 2018, Inderscience) | 3 | 2026-09-20 | |
| TH-03 | Confirm current URL of OWASP WSTG "Test Business Logic Data Validation" (fetch 404) | 3 | 2026-09-20 | |
| TH-04 | Review testbed (17_CODE/testbed @ 21d347a) and BUSINESS_RULES.md before Gate B freeze | 10a | 2026-09-20 | |
| TH-05 | Decide licence for released code/data (suggest MIT / CC BY 4.0) | 12 | 2026-09-20 | |
| TH-06 | P64 (Saleem/Ahmed 2026): first author and ICCK venue legitimacy NOT VERIFIED — decide whether to cite | 5 | 2026-09-20 | |
| TH-07 | P61 (Reflex-Guard): placeholder references and inconsistent latency figures flagged in note — decide whether to cite numbers | 5 | 2026-09-20 | |
| TH-08 | Screen adjacent leads from kill search: ShopGym arXiv 2605.16116, USPTO 12288159 (V0) | 8 | 2026-09-20 | |
| TH-09 | Confirm no institutional ethics requirement applies (researcher-only annotation, synthetic data) | 11 | 2026-09-20 | |
| TH-10 | **REVIEW** the AI-drafted group A/G values (272 short values) and sign the review record in 10_DATASETS/human_inputs/PROVENANCE.md — decides whether H3b is an AI-vs-human contrast (DV-03); later annotate 200 + 20 items | 12 | 2026-09-20 | files drafted 2026-09-20, review outstanding |
| TH-11 | Confirm model licences (Qwen3 Apache-2.0; Gemma/Llama community terms; embedding model) for releasing generated data | 12 | 2026-09-20 | |
| TH-12 | Review the harness before E1 (17_CODE/harness: field targets, adversarial templates, rule functions, judge rubric) | 12 | 2026-09-20 | |

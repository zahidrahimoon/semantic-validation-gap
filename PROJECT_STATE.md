# PROJECT STATE — Semantic Validation Gaps in AI-Driven Web Applications

> Single source of truth (B2). Updated at the end of every working turn.

```text
Project:            Semantic Validation Gaps in AI-Driven Web Applications
Slug:               semantic-validation-gap
Version:            v0.9 (reviewed & revised) — all experiments complete
Current stage:      17 (final QA) — paper DRAFT, status at most READY FOR HUMAN VERIFICATION once human tasks are done
Operating mode:     FULL (Ollama in Docker, CPU only)
Last updated:       2026-09-22 20:00 PKT
Completed stages:   0–16; Gates A and B; E1, E2, E2b, E3, E4; review cycle 1 (71 issues) + cycle-2 verification
Open gates awaiting human decision: none
Open CRITICAL/HIGH issues (NEED HUMAN):
  - DV-03: groups A/G AI-drafted → review/sign 10_DATASETS/human_inputs/PROVENANCE.md
  - Judge–human κ missing → annotate 16_RESULTS/raw/E1_E1_20260920T0847/annotation_sample.csv, then `npx tsx cli.ts import-labels`
Key results (all generated, see 13_DRAFT/tables/numbers.tex): H1 supported (31.6% [28.9,34.4]; P1-only 23.2%; objective-only 7.9%);
  H2 association supported, structured prediction reversed; H3a–c NOT supported (random 54.6% > LLM); H5 NOT supported (best HYB 27.1%);
  H6 NOT supported (EMB 65–96 ms > 50 ms; R ≤ 14 ms; JUDGE saturates at c=8)
Testbed: main @ 62a7267 (v1.0-frozen), checked out; E4 branch e4-semantic-layer @ 33f2685 (v1.2-semantic)
Repository: project root under git since 2026-09-22 (after data collection); testbed has its own repo
Regenerate all results: see 16_RESULTS/analysis/README.md
Next actions (ordered):
  1. HUMAN: open http://127.0.0.1:8765 (service svg-review) — task 1 review 272 values + sign-off, task 2 annotate 220 items;
     then run `bash 17_CODE/review_app/finish_review.sh` and tell Claude "review finished" (paper wording switches automatically)
  2. HUMAN: author email/ORCID, venue choice (then /rs-venue), IEEE Thesaurus keywords, repository URL + licences, similarity check
  3. HUMAN: resolve saleem2026layered author order; confirm breck2019datavalidation author order
  4. OPTIONAL (~1 h CPU): re-judge the 7 context-dependent rules with the full record (removes a stated limitation)
Blocked on human: items 1–3 above
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

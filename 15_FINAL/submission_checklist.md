# SUBMISSION CHECKLIST

Paper: *Structurally Valid, Semantically Wrong: Measuring the Validation Gap for AI-Generated Web
Inputs* · Status 2026-10-17: **DRAFT — experiments, review, provenance and annotation complete; journal-mode manuscript with two authors; author tasks outstanding (see HUMAN MUST VERIFY)**

The protocol's highest permitted status is `READY FOR HUMAN VERIFICATION`. No AI system may decide
this paper is ready to submit; that decision is the author's.

## AI COMPLETED

| Item | State |
|---|---|
| Literature discovery and search log (78 searches + 5 disconfirmation + 6 novelty-kill) | DONE — `02_SEARCH_STRATEGY.md`, `11_PAPERS/search_reports/` |
| Source verification (V0–V4) | DONE — 70 included: 15 V4, 5 V3, 50 V2; every entry's level recorded in its BibTeX note |
| Literature matrix and per-paper notes | DONE — `03_LITERATURE_MATRIX.csv` (70 rows), `11_PAPERS/notes/` (20 notes with section/page locations) |
| BibTeX generation and citation audit | DONE — `12_REFERENCES/citation_audit.md`; 5 defect classes found and fixed; 0 parse failures, 0 undefined citations |
| Research-gap and novelty analysis | DONE — `05_RESEARCH_GAP.md` (G1–G5), `06_NOVELTY.md` (5 nearest neighbours, kill search K1–K6) |
| Methodology and experiment plan | DONE and frozen at the method gate — `07_METHODOLOGY.md`, `08_EXPERIMENT_PLAN.md` |
| Experimental apparatus | DONE — frozen testbed (`v1.0-frozen`), harness, 5 detector designs, overhead driver |
| Statistical analysis scripts | DONE — `16_RESULTS/analysis/` (pre-committed tests, written before data existed) |
| Diagrams | DONE — generated from data by `16_RESULTS/analysis/make_figures.py` |
| Paper draft | DONE — every prose number generated (`make_numbers.py`), every table generated (`make_latex_tables.py`) |
| Reviewer simulation and fix loop | DONE, cycle 1 — R1–R4 (71 issues) in `14_REVIEWS/`; status of each in `issue_tracker.md` |
| IEEE formatting | DONE — IEEEtran journal mode (2026-10-17; 10-page conference version kept as paper_v0.9-before-journal-coauthor.tex), clickable citations and DOIs |
| AI-use disclosure | DONE — `15_FINAL/ai_disclosure.md`; one-sentence version in the manuscript acknowledgment (kept per E8, D-011) |
| Model licences for released data | DONE 2026-10-17 — Qwen3 and nomic-embed-text Apache-2.0; Gemma Terms claim no rights in outputs (TH-11) |
| Novelty leads from the kill search | DONE 2026-10-17 — ShopGym and US 12288159 screened, no overlap (TH-08, 06_NOVELTY.md) |

## BLOCKING — must be true before submission

- [x] **Experiments complete.** E1–E4 finished; every number traceable to `16_RESULTS/raw/` via scripts.
- [x] **Result claims audited.** No number in the paper is typed by hand; R1 recomputed every figure from raw data independently.
- [x] **Human-written conditions resolved.** `10_DATASETS/human_inputs/PROVENANCE.md` signed 2026-09-23
      (262 kept, 7 deleted, 3 replaced); the paper calls A and G human-curated and H3b is reported with
      that caveat (DV-03).
- [x] **Annotation done.** 200 + 20 items annotated and imported 2026-09-23 (DV-19); judge–human kappa
      0.238 reported, so judgement-rule results are labelled exploratory as pre-registered.
- [x] **Reviewer simulation run** (cycle 1) and issues resolved or escalated (`14_REVIEWS/issue_tracker.md`).

- [x] **Judge re-run with full record context.** Done 2026-10-03 (DV-20); all results regenerated (DV-22, DV-23).

## HUMAN MUST VERIFY

| Item | Notes |
|---|---|
| Research claims and novelty | The phenomenon is established for model outputs; this paper extends it to the input side. Do not let the framing drift toward discovery. |
| Citation accuracy, especially the 50 V2 entries | Cited for existence and abstract-level statements only |
| Two flagged references | `saleem2026layered` (arXiv 2606.19660: arXiv metadata lists Saleem first, PDF byline lists N. Ahmed first; typeset for "ICCK Transactions on Information Security and Cryptography" with placeholder DOI and dates, venue legitimacy unverified) and `ahmed2026reflexguard` (arXiv 2608.17556: IEEE template header with unfilled biography block) — both are cited only as preprints for GPU latency figures in three sentences of Related Work. Options: keep as arXiv preprints (current), or drop both and keep `jacob2025promptshield` and `wang2026sokguardrails` for the same point. Author decides |
| Two novelty leads | Screened 2026-10-17, no overlap (06_NOVELTY.md). Nothing to do |
| Experimental results and provenance | Spot-check numbers against `16_RESULTS/raw/` |
| Dataset licences | Checked 2026-10-17 (TH-11): releasing generated inputs and verdicts is permitted under all three model licences |
| Ethics | No human subjects; confirm no institutional requirement applies |
| Figures | Original, generated from our data only |
| Similarity check | Run before submission |
| Author information | First author: email set, no ORCID. Second author (F. H. Khoso, added 2026-10-17): affiliation and email are placeholders in `\\thanks`; contribution statement not recorded (TH-13). Running head `\\markboth` is a placeholder (TH-14). Funding and conflicts to confirm |
| Venue requirements | No venue chosen. Shortlist of no-fee venues in `15_FINAL/venue_shortlist.md` (2026-10-17). Run `/rs-venue <name>` once decided. |
| Page limit and format | Journal mode, about 10 to 11 pages. The conference version (10 pages) is kept if a conference is chosen instead |
| Preprint policy | If posting to ResearchGate or arXiv, confirm the target venue permits preprints |
| Final submission decision | The author's alone |

## Repository

Public artefacts: https://github.com/zahidrahimoon/semantic-validation-gap
  main                          the study (stages, data, analysis, manuscript, testbed source)
  testbed-main                  the testbed's own history, tag v1.0-frozen (commit 62a7267) as used for E1-E3
  testbed-e4-semantic-layer     the overhead branch, tag v1.2-semantic (commit 33f2685) as used for E4
Licences: MIT for software (LICENSE), CC BY 4.0 for data and manuscript (LICENSE-DATA).
Default branch is `main` (verified 2026-10-17).

## Artefacts to release with the paper

```text
17_CODE/testbed      the subject under study, tagged v1.0-frozen
17_CODE/harness      generation, measurement, ground truth, detector designs
17_CODE/prompts      the seven prompt families, hashed
16_RESULTS/raw       every generated input, measurement and label, append-only
16_RESULTS/analysis  the scripts that produce every table and figure
10_DATASETS          the human-condition inputs and their provenance record
```

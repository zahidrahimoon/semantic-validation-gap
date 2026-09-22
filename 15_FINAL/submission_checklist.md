# SUBMISSION CHECKLIST

Paper: *Structurally Valid, Semantically Wrong: Measuring the Validation Gap for AI-Generated Web
Inputs* · Status 2026-09-22: **DRAFT — all experiments run; researcher tasks outstanding (see BLOCKING)**

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
| IEEE formatting | DONE — IEEEtran conference, compiles with no errors or overfull boxes |
| AI-use disclosure | DONE — `15_FINAL/ai_disclosure.md` |

## BLOCKING — must be true before submission

- [x] **Experiments complete.** E1–E4 finished; every number traceable to `16_RESULTS/raw/` via scripts.
- [x] **Result claims audited.** No number in the paper is typed by hand; R1 recomputed every figure from raw data independently.
- [ ] **Human-written conditions resolved.** `10_DATASETS/human_inputs/PROVENANCE.md` signed, or the
      paper relabels conditions A and G as AI-drafted and withdraws hypothesis H3b. Currently
      unresolved (deviation DV-03).
- [ ] **Annotation done.** The stratified sample labelled and imported; judge–human agreement
      reported. Without it the semantic labels rest on one model's judgement.
- [x] **Reviewer simulation run** (cycle 1) and issues resolved or escalated (`14_REVIEWS/issue_tracker.md`).

- [ ] **Judge re-run with full record context (recommended).** Seven judgement rules were judged without
      the fields they depend on; a sensitivity analysis is reported, but re-judging (~1 h CPU) would remove the caveat.

## HUMAN MUST VERIFY

| Item | Notes |
|---|---|
| Research claims and novelty | The phenomenon is established for model outputs; this paper extends it to the input side. Do not let the framing drift toward discovery. |
| Citation accuracy, especially the 50 V2 entries | Cited for existence and abstract-level statements only |
| Two flagged references | `saleem2026layered` (wrong first author, venue unverified) and `ahmed2026reflexguard` (placeholder references, inconsistent tables) — decide whether to cite |
| Two unscreened novelty leads | ShopGym (arXiv 2605.16116) and USPTO 12288159 |
| Experimental results and provenance | Spot-check numbers against `16_RESULTS/raw/` |
| Dataset licences | Model licences for releasing generated data (Qwen3, Gemma, embedding model) |
| Ethics | No human subjects; confirm no institutional requirement applies |
| Figures | Original, generated from our data only |
| Similarity check | Run before submission |
| Author information, affiliation, ORCID, funding, conflicts | All `TODO-HUMAN` in `paper.tex` |
| Venue requirements | Not yet researched — no venue chosen. Run `/rs-venue <name>` once decided. |
| Page limit and format | Currently ~10 pages; check the chosen venue's limit |
| Preprint policy | If posting to ResearchGate or arXiv, confirm the target venue permits preprints |
| Final submission decision | The author's alone |

## Artefacts to release with the paper

```text
17_CODE/testbed      the subject under study, tagged v1.0-frozen
17_CODE/harness      generation, measurement, ground truth, detector designs
17_CODE/prompts      the seven prompt families, hashed
16_RESULTS/raw       every generated input, measurement and label, append-only
16_RESULTS/analysis  the scripts that produce every table and figure
10_DATASETS          the human-condition inputs and their provenance record
```

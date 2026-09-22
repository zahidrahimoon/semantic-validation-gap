# R3 Reproducibility REVIEW — Semantic Validation Gaps in AI-Driven Web Applications

> Focus: data, code, parameters, environment, provenance.
> Independent pass: read the draft fresh; do not defend earlier choices.
> Up to 3 fix cycles; anything still open is escalated to the human.

## Cycle log

| Cycle | Date | Draft version | Issues raised | Issues fixed | Recommendation |
|---|---|---|---|---|---|
| 1 | 2026-09-22 | paper.tex v0.8 (RQ6/E4, Abstract, Conclusion out of scope) | 11 (3 HIGH, 5 MEDIUM, 3 LOW) | 0 | Major revision |

## Cycle 1 — 2026-09-22

### Summary of the paper (as this reviewer understands it)

The paper claims every number can be regenerated from immutable raw run folders by scripts. It also
claims that each run folder carries a manifest with the subject commit, model digests, seeds, prompt
hashes and command line, and that every record carries its own provenance.

### What was verified (and holds)

- `make_latex_tables.py`, run on copied CSVs in a scratch folder, reproduces all six `13_DRAFT/tables/*.tex`
  byte for byte.
- `e3_analysis.py`, re-run from `raw/E1_E1_20260920T0847`, reproduces `table6*.csv` exactly.
- An independent recomputation from the raw JSONL (not using the project scripts) reproduces H1, Table I,
  Table II, per-run rates and all CMH odds ratios.
- Each generated record carries model, digest, temperature, seed, run, prompt file and prompt hash.
  Each judge verdict carries the judge model and digest. The testbed is pinned at `62a7267`
  (`v1.0-frozen`). Invalid data is preserved in `_integrity/` and the `*_INVALID` folders.

### Strengths

- A frozen, tagged subject. Per-record provenance. Superseded data and scripts are preserved rather than
  deleted (`logs/e3_analysis.py.v1_threshold_bug`, `run_all.sh.v1…v3`). The deviation log is candid.

### Issues

| Issue ID | Severity | Location | Issue | Why it matters | Evidence | Recommended correction | Status |
|---|---|---|---|---|---|---|---|
| I-R3-001 | HIGH | §IV-A ("the commit hash is recorded with every run"); §IV "Input Surface and Test Generation Framework" | **The harness and analysis code have no version control.** Only the testbed is a git repository. The harness was edited several times while E1 was running: the CSV loader fix, the 120 s timeout (DV-05), the resume fix (DV-07), the NUL-tolerant reader, the booking reset (DV-09), and `perf/load.mjs` during E4 (DV-13). No hash identifies the harness version that produced `raw_inputs.jsonl`, `validation_results.jsonl`, `judge_verdicts.jsonl` or `e3_decisions.jsonl`. | A third party cannot check out the exact generator, measurer, judge and merge code behind the published data. The recorded commit covers the subject, not the instrument. | `git -C 17_CODE status` → "not a git repository". RESULTS_LOG E0-GEN-1: "harness (uncommitted, this session)". Only `run_all.sh` versions are kept in `16_RESULTS/logs/`. | Initialise a repository for `17_CODE/harness` and `16_RESULTS/analysis`, commit the current state and tag it. Write a dated change table that maps each harness change to the raw files it affected. From now on, record the harness hash in every manifest step. | OPEN |
| I-R3-002 | HIGH | §IV "…a manifest recording the subject commit, model digests, seeds, prompt hashes and command line" | **The manifest does not contain what the paper says.** `raw/E1_E1_20260920T0847/manifest.json` holds only the most recent invocation (`step: generate, generated: 0, failures: 0, at 2026-09-22T05:14`), because later calls overwrote it. It has no model digest, no prompt hashes, no command line, and nothing about the structural, judge, merge or E3 steps. `e3_decisions.jsonl` records no model name, digest, seed or temperature. | The published description of the artefact is inaccurate. E3 decisions cannot be tied to model weights. | `manifest.json`, 661 bytes. `e3_decisions.jsonl` columns: key, design, input_id, target_id, group, label, score, ms, detail. | Make the manifest append-only, with one entry per step (command, date, harness and testbed hashes, models and digests, seeds). Add model and digest to each E3 decision, or to an E3 manifest. Correct the §IV sentence. | OPEN |
| I-R3-003 | HIGH | `16_RESULTS/RESULTS_LOG.md` (the provenance source for every number in §VI) | **The provenance log does not cover the reported E1 numbers.** The top "Provenance" and "Derived results" tables are empty. No raw file has a sha256. The E1 section is still headed "RUNNING", and E1-GEN-2 still says "RUNNING". The 2026-09-21 E1 tables are declared SUPERSEDED, but no entry records the post-DV-09 re-run that produced the current Table I/II/III, `tab:failures`, H1 344/1228 or χ² = 214.0. That re-run covered re-measurement, the judge supplement, the merge, and the `e1_e2_analysis.py` command, date and outputs. Only E3, E2b and CMH have entries. | Protocol rule A2.3 requires every reported number to trace to a Result ID. The paper's central results currently have none. | `RESULTS_LOG.md` lines 6–24 (empty tables), 50, 55, 184 ("SUPERSEDED… must not be quoted"), 220–224 (the only later E1-related entry). | Add E1 result rows (Result ID, raw file and sha256, command, date, analysis output) for Table I, Table II, Table III, `tab:failures`, table4 and table5. Mark E1 generation COMPLETE with final counts (3878 records, 88 failure records). | OPEN |
| I-R3-004 | MEDIUM | Ground-truth merge (`cli.ts` l.122), E3 R design (`designs.ts` CTX) | **Labels depend on the clock time when the merge ran.** Time-relative rules are evaluated with `now: new Date()`, and that time is not stored. The affected rules are B-CO-2 (future start), B-PR-2 (birth date not in future), B-PR-3 (age ≥ 13) and B-PR-4. Group B dates are generated within ±400 days of the generation time, so re-running the merge later turns some PASS verdicts into FAIL. R in E3 uses its own `new Date()`. | Re-running the published pipeline will not reproduce the published labels, and the size of the drift depends on the date. | `cli.ts`: `const ctx = { now: new Date(), … }`. `generate/programmatic.ts` F15+F16 `iso(r, int(r,-400,400), h)`. `semantic_labels.jsonl` has no reference-time field. | Freeze the reference time (for example the E1 generation start, 2026-09-20T08:47Z) as a constant, pass it to merge and E3, and record it in the manifest and in each label record. | OPEN |
| I-R3-005 | MEDIUM | §IV "append-only JSON Lines into an immutable run folder… Raw folders are never modified by analysis" | **The run folder was modified.** `validation_results.jsonl` was rewritten twice (NUL repair; booking re-measurement after DV-09) and the manifest was overwritten. Backups exist, but the claim of immutability is inaccurate, and nothing records which lines were replaced. | Readers cannot tell which measurements are original and which were re-taken. | `_integrity/validation_results.jsonl.pre_nul_repair_20260921T120046`, `…pre_booking_state_fix_20260921T190640`. | Reword: "append-only except for two logged repairs (DV-09, NUL incident); pre-repair copies preserved". Add sha256 of each version and a count of replaced lines. | OPEN |
| I-R3-006 | MEDIUM | §IV-D ("values are stored exactly as returned") | **The raw model response is not stored for successful calls.** `llm.ts` keeps only the keys listed in `target.keys`; the full text is kept (truncated to 300 characters) only for failures. That is why 393 D/E records have `value: {}`, and it is now impossible to tell whether the model used a different key or returned an empty object (see I-R1-001). | The primary artefact cannot be audited, and the claim in the paper is false. | `generate/llm.ts` l. 64–66 (`value[k] = v[k]`); `raw_inputs.jsonl` records with `value == {}`: D 160, E 233. | Store `r.content` for every call, for example in a `raw_responses.jsonl` keyed by call. For the existing data, state the limitation and treat the empty values as failures. | OPEN |
| I-R3-007 | MEDIUM | `17_CODE/ENVIRONMENT.md`; §IV-D ("token budget… recorded") | **Parameters differ from the plan, and analysis versions are missing.** (a) The plan froze `num_predict` 350; the code uses `maxTokens: 900`. RESULTS_LOG mentions a "900-token cap", but no DV records the change. (b) seaborn, pandas, scipy and statsmodels have no versions, and there is no lock file for `.venv`. (c) Seeds and decoding settings for the judge (seed 7, T 0, 400 tokens), SLM/JUDGE (seed 13, 80/120 tokens), sampling (90210, 90211) and the bootstrap (2026) appear only in code, not in the paper or artefact notes. | Results may not rerun identically. The generation budget deviated from the pre-registration without a record. | `08_EXPERIMENT_PLAN.md` "LLM controls: num_predict 350"; `generate/llm.ts` `maxTokens: 900`; ENVIRONMENT.md Python row. | Add a DV for the token budget. Save `pip freeze` to `17_CODE/analysis-requirements.txt`. Add an artefact table of all seeds and decoding parameters (appendix or README). | OPEN |
| I-R3-008 | MEDIUM | §IV-F, §VI-E | **The judge's run-to-run stability is unknown.** Ground truth for judgement rules comes from a single gemma3:4b pass at T = 0 on CPU, where non-determinism was observed (TESTBED_OBSERVATIONS O7; §IV-H). Human annotation is pending (`annotation_sample.csv` exists; no results). No re-judging of a subsample was done. | Another run of the same pipeline could produce different labels by an unknown margin. With κ absent, nothing bounds label reproducibility. | `judge_verdicts.jsonl` (1336 rows, one pass). `judge.ts` seed 7. §IV-H cites run-to-run variation "even at low temperature". | Re-judge a fixed random subsample (for example 100 items) and report self-agreement. Finish the 200-item annotation and report κ. | OPEN |
| I-R3-009 | LOW | `16_RESULTS/analysis/README.md`; `e1_e2_analysis.py` | **README and paths do not match the scripts.** The README says outputs go to `out/`, but the scripts write to `analysis/`. The figure path `OUT/../../09_DIAGRAMS/rendered` resolves to `16_RESULTS/09_DIAGRAMS` when run with `--include-retried`, and that stray directory exists. `e2b_analysis.py` hard-codes the run folder names. | Minor friction when regenerating. | `ls 16_RESULTS` shows `09_DIAGRAMS`. README line 4. | Fix the README and use absolute project-relative paths. Add one `make`/`run_analysis.sh` that regenerates every table and figure in order. | OPEN |
| I-R3-010 | LOW | Generation failures file | **Retry failures are mixed in with first-attempt failures.** `generation_failures.jsonl` has no attempt index, and 25 cells carry more than one failure record, so the counts combine retries with first attempts. | The count reported in the paper cannot be reproduced without inference (see I-R1-013). | 88 records, 52 distinct cells. | Add an `attempt` field going forward. For the existing data, derive first attempts with a script and commit the script. | OPEN |
| I-R3-011 | LOW | Data and code availability | **No availability statement, and licences are unresolved.** The paper has no artefact-availability statement. The licence is TODO-HUMAN in `17_CODE/README.md` and the dataset licence is TBD (TH-05). The component table in `17_CODE/README.md` still marks the harness as "PLANNED". | Artefact evaluation will fail on availability. | `17_CODE/README.md` lines 7, 29–33. | Add a reproducibility/availability statement (repository URL plus commit or tag, and a DOI if archived). Resolve the licences. Update the component table to ACTUAL. | OPEN |

### Simulated recommendation: **Major revision**

Main reasons:
1. The analysis layer is reproducible: tables regenerate byte for byte from the CSVs, E3 regenerates from
   raw, and my independent recomputation matches. The instrument layer is not. The harness has no
   version control (I-R3-001), the manifest is overwritten and incomplete (I-R3-002), and the published
   E1 numbers have no provenance entry (I-R3-003).
2. Re-running the pipeline would not reproduce the labels. The merge uses the current clock (I-R3-004),
   raw model responses were discarded (I-R3-006), and the judge's stability is unmeasured (I-R3-008).
3. All of these are fixable without new experiments, except restoring the raw responses, which requires
   regeneration or a stated limitation.

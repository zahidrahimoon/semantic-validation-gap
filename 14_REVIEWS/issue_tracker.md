# ISSUE TRACKER — Semantic Validation Gaps in AI-Driven Web Applications

> All issues from critic, citation audit, and R1–R4. Never mark FIXED by deleting the
> evidence of the problem. Status: OPEN / FIXED / WON'T FIX (+ reason) / NEEDS HUMAN.
> Issue ID format: I-<reviewer>-<nnn>, e.g. I-R1-001, I-CRIT-002, I-CIT-003.

| Issue ID | Reviewer | Severity | Location | Issue | Status / resolution (cycle 1, 2026-09-22) |
|---|---|---|---|---|---|
| I-R1-001 | R1 | CRITICAL | §IV-D "values are stored exactly as returned… Gene | LLM outputs with the wrong keys are silently turned into the default valid payload | FIXED — DV-14: 430 E1 + 71 E2b records excluded as generation failures via analysis/defects.py; generator fixed; all analyses re-run; paper numbers regenerated (cycle 1) |
| I-R2-001 | R2 | CRITICAL | Sec. V-C/V-D; Sec. VIII-A (344/1228, 28.0 %); Sec. | The pooled LLM SV-SI rate includes prompt families that explicitly instruct the model to produce values that violate the rules | FIXED — see I-R1-003 |
| I-R4-001 | R4 | CRITICAL | References, all entries (from the `note` fields in | The printed reference list contains internal workflow notes and false identifiers | FIXED — 12_REFERENCES/make_paper_bib.py moves internal notes to annote, removes DOI-derived pseudo-arXiv ids |
| I-R1-002 | R1 | HIGH | §IV-F Semantic ground truth; §VI-B, §VI-D; Discuss | The judge cannot see the context that several judgement rules depend on | FIXED (disclosed + sensitivity) — Method §V-E states the judge saw only target fields; 'without context rules' sensitivity row (Table sensitivity); RQ2/RQ4 text qualified. Re-judging with full record = future work |
| I-R1-003 | R1 | HIGH | §IV-D Prompt families; §VI-A H1; Discussion RQ1/RQ | The "model-generated" rate pools prompts that instruct the model to break rules | FIXED — per-family table (tab:family), P1-only and without-P3 rates in Results and Abstract |
| I-R1-004 | R1 | HIGH | §VI-A, §VI-D (RQ4), Discussion RQ1/RQ3/RQ4 | One target and a missing date drive a large share of H1 and RQ4 | FIXED — 'without dates' sensitivity; F15+F16 date artefact stated in Results, Threats (external validity) and Future work |
| I-R1-005 | R1 | HIGH | §I para 1 ("…by construction, unable to state… tha | The expressiveness claim is contradicted by the testbed's own frozen schema | FIXED — Intro/Background reframed as enforced vs unenforced rules; the two Zod refinements named in Method |
| I-R1-006 | R1 | HIGH | Table I, column "Uncond. (%)" | The unconditional rate is biased downward | FIXED — unconditional column dropped from Table I; Decided column added |
| I-R1-007 | R1 | HIGH | Pooled rates (Table I, H1, Table II), §VI-D RQ4 ob | Pooled rates are distorted by the judge sampling design | FIXED — target-weighted rates in sensitivity table; RQ4 objective-share claim removed |
| I-R2-002 | R2 | HIGH | Title; Sec. I ¶3–4 ("What has changed is who write | The framing assumes the phenomenon is about AI-generated input, and the results refute that | FIXED — Intro reframed around the input boundary; 'unusually likely to satisfy a schema' removed; title kept (accurate: the gap is measured for AI-generated inputs against baselines) |
| I-R2-003 | R2 | HIGH | Sec. I contribution list (C1–C5) | The contribution list is still the pre-result proposal | FIXED — C1–C5 rewritten with findings, ordered, no 'deployable' |
| I-R2-004 | R2 | HIGH | Sec. I C2 ("A taxonomy of semantic-gap types organ | No taxonomy is presented | FIXED — taxonomy claim dropped; per-category and per-target tables |
| I-R2-005 | R2 | HIGH | Sec. V-F; Sec. VII; Sec. VIII-F/G; Table VI | The ground-truth judge is never named | FIXED — judge named (gemma3:4b); unvalidated-judge caveat in Abstract, Results, Threats; objective-only results reported separately |
| I-R2-006 | R2 | HIGH | Sec. II (Related work, LLM-generated inputs) ¶1 | The FormNexus figures are misattributed | FIXED — 83 / 23 / 3 % (P21 note, Fig. 7) |
| I-R3-001 | R3 | HIGH | §IV-A ("the commit hash is recorded with every run | The harness and analysis code have no version control | FIXED — project put under git after data collection (stated in README/RESULTS_LOG) |
| I-R3-002 | R3 | HIGH | §IV "…a manifest recording the subject commit, mod | The manifest does not contain what the paper says | FIXED — paper no longer claims a manifest with digests/commands; per-record provenance claim kept (true) |
| I-R3-003 | R3 | HIGH | `16_RESULTS/RESULTS_LOG.md` (the provenance source | The provenance log does not cover the reported E1 numbers | FIXED — RESULTS_LOG entries for the DV-09 re-run, DV-11, DV-14 re-analysis with commands |
| I-R4-002 | R4 | HIGH | Table IV (`tab_contrasts.tex`), Contrast column | "E>B", "E>G" and "D>B" are typeset in text mode without T1 font encoding, so ">" renders as "¿" | FIXED — math-mode $>$ |
| I-R4-003 | R4 | HIGH | Table I (`tab_conditions.tex`) | (a) "Cond | FIXED — Decided column, caption defines denominator, duplicated letter removed, Uncond. dropped |
| I-R4-004 | R4 | HIGH | Sec. IX, "Alternative explanations" (two consecuti | Two paragraphs address the same six alternative explanations | FIXED — see I-R1-018 |
| I-R4-005 | R4 | HIGH | Table VI caption; paper.log | The reference `tab:e4` is undefined, so the PDF prints "Table ??" | FIXED when E4 table exists |
| I-R4-006 | R4 | HIGH | Sec. X (Threats, internal validity) vs Sec. VIII-E | Threats cites "reported $\kappa$" as a mitigation, but Sec | FIXED — see I-R1-017 |
| I-R1-008 | R1 | MEDIUM | §IV-G ("every structurally valid input is labelled | Both statements are false | FIXED — undecided split into unjudged / no usable verdict via numbers.tex; 'every input labelled' removed |
| I-R1-009 | R1 | MEDIUM | Discussion RQ3 ("the gap is not specific to AI… an | The conclusion rests on one arbitrary random distribution | FIXED — random generator described in Method; Discussion RQ3 bounds the claim ('weak producer') |
| I-R1-010 | R1 | MEDIUM | §V (EMB, HYB); Discussion RQ5 ("no cheap layer clo | Undisclosed deviation in the EMB design | FIXED — DV-16; EMB described as untrained in §VI |
| I-R1-011 | R1 | MEDIUM | §VI-F; Table `tab:detection` | The prompted designs share the ground-truth judge's rubric | FIXED — §VI and RQ5 results state SLM/JUDGE share a similar rubric with the ground-truth judge |
| I-R1-012 | R1 | MEDIUM | §V last para; §VI-F "On all 2108 decided inputs" | The E3 population differs from the primary population without saying so | FIXED — §VI states the full-corpus population includes P5 and retried records |
| I-R1-013 | R1 | MEDIUM | §VI opening ("88 of 698 model calls (12.6 %), almo | The failure count mixes first attempts with failed retries | FIXED — failure records and distinct prompt cells both reported; 'almost all repetition loops' removed |
| I-R1-014 | R1 | MEDIUM | §IV-H Statistical analysis; Tables I–III; §VI-F CI | Non-independence is ignored | FIXED (disclosed) — non-independence stated in §V-F and Threats; per-run and per-target rates reported |
| I-R1-015 | R1 | MEDIUM | §VI-B; Table II; H2 | The category mapping deviates from the frozen taxonomy, and H2's direction is misreported | FIXED — DV-15; reversed structured prediction stated; per-target table added |
| I-R1-016 | R1 | MEDIUM | §VI-A, §VI-B, §VI-C, §VI-D, §VI-E, Discussion | Wording is stronger than the evidence (A5) | FIXED — 'moderate association'; E vs G 'did not differ detectably ... interval is wide'; labelling bounds reworded; injection 'not supported'; E2b hedged |
| I-R1-017 | R1 | MEDIUM | §VIII Threats, Internal validity | The threats section lists mitigations that do not exist yet | FIXED — Threats rewritten; no κ or unrun analyses cited |
| I-R2-007 | R2 | MEDIUM | Sec. I ¶5 and Sec. II ("its authors are explicit t | The P20 admission concerns *incomplete e-mail addresses* ("user@", "@email.com") | FIXED — reworded to 'may be submitted successfully because the application lacks the corresponding check' |
| I-R2-008 | R2 | MEDIUM | Sec. I ¶3 (constraint tax: "validity rises while e | Both statements overgeneralise P34 | FIXED — constraint-tax claim limited to the calendar tool-call task |
| I-R2-009 | R2 | MEDIUM | Sec. I C4; Sec. VII; Sec. VIII-G | C4 promises "a benign-unusual condition that measures how often each design rejects legitimate input" | FIXED — FPR on G reported in RQ5 |
| I-R2-010 | R2 | MEDIUM | Sec. I ¶4; Sec. IX RQ3 | The random baseline is not a canonical distribution | FIXED — see I-R1-009 |
| I-R2-011 | R2 | MEDIUM | Sec. II (all subsections); Sec. I C5 ("a regime ab | Several universal negatives rest partly on papers read only at V2 (abstract or not read) | FIXED — universal negatives hedged to 'in the studies we reviewed' / 'we found no' |
| I-R2-012 | R2 | MEDIUM | Sec. II; `06_NOVELTY.md` §2 | Literature coverage has three gaps | FIXED — 11_PAPERS/search_reports/review_gap_search_2026-09-22.md (23 queries): 6 works added (tool-call benchmarks, data validation, Sherlock, Intuit patent), ShopGym excluded; no concurrent work found; new Related Work subsection 'Data validation beyond schemas' |
| I-R2-013 | R2 | MEDIUM | Sec. VIII-A ("which bounds the labelling from both | A 78.0 % SV-SI rate on inputs *designed* to break a rule means about 22 % of designed violations were labelled valid, and 3.8 % of designed- | FIXED — 'up to a fifth of designed violations were missed and the rates may be underestimates' |
| I-R2-014 | R2 | MEDIUM | Sec. VIII-B; Sec. IX RQ2; C2 ("tells developers wh | The category analysis pools all conditions, including the adversarial condition C and random B | FIXED — per-target table with LLM-only column |
| I-R3-004 | R3 | MEDIUM | Ground-truth merge (`cli.ts` l.122), E3 R design ( | Labels depend on the clock time when the merge ran | FIXED (disclosed) — Threats: clock-relative rules evaluated at merge time |
| I-R3-005 | R3 | MEDIUM | §IV "append-only JSON Lines into an immutable run  | The run folder was modified | FIXED — 'immutable' claim removed from the paper |
| I-R3-006 | R3 | MEDIUM | §IV-D ("values are stored exactly as returned") | The raw model response is not stored for successful calls | WON'T FIX — data already generated; the generator now logs key-mismatch replies as failures with the raw object |
| I-R3-007 | R3 | MEDIUM | `17_CODE/ENVIRONMENT.md`; §IV-D ("token budget… re | Parameters differ from the plan, and analysis versions are missing | FIXED — DV-16 (num_predict 900); requirements.lock.txt; ENVIRONMENT.md updated |
| I-R3-008 | R3 | MEDIUM | §IV-F, §VI-E | The judge's run-to-run stability is unknown | FIXED (disclosed) — Threats: judge ran once, stability not measured |
| I-R4-007 | R4 | MEDIUM | Fig. 1 (`fig:by-condition`) | The figure is never referenced in the text | FIXED — Fig. 1 referenced in RQ3 results |
| I-R4-008 | R4 | MEDIUM | Table III caption; Table III body | "$p=1.97e-43$" prints as "p = 1.97e − 43" (computer notation, with a minus sign) | FIXED — p<0.001; readable category names |
| I-R4-009 | R4 | MEDIUM | Table IV | "$p_{\mathrm{Holm}}$ = 1" prints as the integer "1" | FIXED — p printed as 1.00; caption explains one-sided tests |
| I-R4-010 | R4 | MEDIUM | Sec. VII ("all 2108 decided inputs"); Sec. V-G ("2 | There are two different "decided" populations and neither is explained. | FIXED — see I-R1-012 |
| I-R4-011 | R4 | MEDIUM | Sec. V-C/V-D/V-F; Sec. VII | Essential parameters appear late or not at all | FIXED — generator, judge and random sampler described in Method |
| I-R4-012 | R4 | MEDIUM | Sec. VIII-B ("strongly associated") vs Sec. IX RQ2 | The same effect is described as "strong" in one place and "moderate" in another | FIXED — 'moderate association'; numbers instead of 'far more often' |
| I-R4-013 | R4 | MEDIUM | Sec. III ¶3 (OWASP Input Validation Cheat Sheet) | The OWASP cheat sheet is described and quoted ("price within expected range") without a citation. | FIXED — live page checked, sentences quoted in 12_REFERENCES/published_versions_2026-09-22.md, page archived; owasp2026inputvalidation cited |
| I-R4-014 | R4 | MEDIUM | References: capitalisation and author names | BibTeX lowercases proper nouns and mangles an author: "Formfactory", "Javelinguard", "Nemo guardrails", "Wasp", "Datasentinel"; "A | FIXED — braced names; Cristov{\~a}o |
| I-R4-015 | R4 | MEDIUM | References: preprint vs published versions; author | Several entries are cited as arXiv preprints although the literature matrix records a peer-reviewed venue | FIXED (partly) — rebedea, shi, kaya, wang, attouche, formfactory, evtimov, ayub, pereira switched to published versions (Crossref/publisher); zizzo kept (non-archival workshop); saleem author order NEEDS HUMAN (arXiv vs PDF byline conflict); schemathesis and injecguard kept as arXiv (cited content is in those versions) |
| I-R1-018 | R1 | LOW | Discussion, "Alternative explanations" (two paragr | Duplicate paragraphs that contradict each other | FIXED — single alternative-explanations paragraph |
| I-R1-019 | R1 | LOW | §IV-E ("against a freshly seeded database") | Method text does not match the code | FIXED — 'Booking state is reset to the seed before each booking request' |
| I-R1-020 | R1 | LOW | §IV-F ("rule functions implement the 18 rules clas | The count is wrong | FIXED — 19 objective rules; the 11 that apply to the targets all have rule functions |
| I-R1-021 | R1 | LOW | §IV-H ("a single-run sensitivity analysis is repor | Promised analyses are absent | FIXED — unrun analyses no longer claimed; objective-only sensitivity added |
| I-R1-022 | R1 | LOW | §IV-H, §V ("bootstrap intervals"; "a reply without | The bootstrap and no-verdict handling differ from the text | NO CHANGE NEEDED — thresholds chosen were 0.975–0.995 so a 0.5 no-verdict score never flagged; paper no longer says 'stratified bootstrap' |
| I-R1-023 | R1 | LOW | §V; H5; contribution C4 | The FPR population differs from the frozen H5 | FIXED (partly) — FPR on benign-unusual inputs (G) now reported; primary FPR on all valid inputs kept as the analysis script defines it (frozen plan text 'A and G emphasised' is not a population definition) |
| I-R1-024 | R1 | LOW | Table `tab:detection` caption | Dangling reference | FIXED when E4 table exists (tab:e4 generated by make_latex_tables.py) |
| I-R2-015 | R2 | LOW | Sec. I ¶4 ("Inputs are now routinely produced by l | This is an uncited prevalence claim. | FIXED — claim now cited |
| I-R2-016 | R2 | LOW | Sec. IX RQ3 ("A small model widened the gap, and a | Exploratory, single-run findings are stated as facts, and there is an unsupported assertion about production tolerance. | FIXED — E2b and native operating point hedged |
| I-R3-009 | R3 | LOW | `16_RESULTS/analysis/README.md`; `e1_e2_analysis.p | README and paths do not match the scripts | FIXED — analysis/README.md rewritten with regeneration commands |
| I-R3-010 | R3 | LOW | Generation failures file | Retry failures are mixed in with first-attempt failures | FIXED (disclosed) — failure records vs distinct cells reported |
| I-R3-011 | R3 | LOW | Data and code availability | No availability statement, and licences are unresolved | FIXED (partly) — Artifact Availability section added; repository URL and licences TODO-HUMAN |
| I-R4-016 | R4 | LOW | Acronyms at first use in body | IEEE requires acronyms to be defined again in the body | FIXED — LLM, FPR, AUROC, SLM, CMH defined in body |
| I-R4-017 | R4 | LOW | Contribution list (Sec. I) | The labels run C3, C4, C5, C1, C2 in that order, with a meta-sentence ("ordered by how much of them is new") | FIXED — C1–C5 in order |
| I-R4-018 | R4 | LOW | Section structure | Sec | FIXED — framework section merged into Method; Limitations merged into Threats |
| I-R4-019 | R4 | LOW | Grammar and style, various | "Authors of the largest such study concede" is missing its article | FIXED (partly) — article added; British spelling used throughout |
| I-R4-020 | R4 | LOW | Index Terms | The keywords are free-form | NEEDS HUMAN — choose IEEE Thesaurus terms at submission |

## Cycle 2 — final verification (14_REVIEWS/final_verification_cycle2.md), 2026-09-22

All 18 issues (2 HIGH, 5 MEDIUM, 11 LOW) FIXED in paper.tex / generators; no new data needed:
V2-01 RQ4 ranking corrected to the table4 order; V2-02 Discussion RQ4 now says judgement violations are the majority (514 vs 270) and objective enforcement removes a share;
V2-03 AI-facing counts recomputed for LLM conditions only (keys ai.llm.*); V2-04 abstract/conclusion label medians vs p97.5 and use generated ranges;
V2-05 "saturated on two of three endpoints"; V2-06 RQ5 claim restricted to R/HYB, JUDGE split stated; V2-07 "not specific to AI-generated input";
V2-08 "above the 5 % bound"; V2-09 "moderately associated", "over half"; V2-10 "also show high rates"; V2-11 "most of its detections";
V2-12 two-directional labelling error; V2-13 p95-bracket clause for EMB; V2-14 E2b p printed 0.001; V2-15 category column "Decided";
V2-16 CI, OR, ROC defined; V2-17 paragraph break; V2-18 272/1200/136 now \R{} keys, supplement design explained.
Also found while checking: E4 table H6 column was empty (CSV saved before verdicts) — FIXED.
Open after cycle 2 (NEED HUMAN): DV-03 review of groups A/G; judge–human annotation; saleem2026layered author order; breck2019 author order; IEEE Thesaurus keywords; repository URL/licence; author details; venue.

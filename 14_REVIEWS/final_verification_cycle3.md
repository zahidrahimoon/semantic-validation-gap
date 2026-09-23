# Independent verification — cycle 3

Date: 2026-09-23 · Scope: `13_DRAFT/paper.tex` + compiled `paper.pdf` (13:48), `13_DRAFT/tables/*`,
`16_RESULTS/analysis/*` (13:39–13:43), `16_RESULTS/human_review/*`, `16_RESULTS/RESULTS_LOG.md`,
`DECISIONS_LOG.md`, `10_DATASETS/human_inputs/PROVENANCE.md`, `CLAIMS_LEDGER.csv`, `PROJECT_STATE.md`.
Nothing was edited except this file. Verification was done against the data, not against the prose:
counts were recomputed from `16_RESULTS/raw/E1_E1_20260920T0847/*.jsonl` and the analysis CSV/JSON.

Flags in `numbers.tex` are `\humanlabelstrue \reviewedtrue \judgeweaktrue`. No `??key` and no
"Unknown result key" warning in `paper.log` — every `\R{}` resolves.

---

## 1. Is the exploratory downgrade stated everywhere a judgement-rule result is claimed?

`\ifjudgeweak` appears in **five** places: abstract (final sentence, l.49), §VII-A RQ1 (l.383),
§VII-E Ground-truth agreement (l.460), §VII-F RQ5 (l.472), §IX Threats/internal validity (l.586).

It is **absent** from every other place a judgement-rule-dependent result is asserted. These still
read as confirmatory:

| # | Location | What still reads confirmatory |
|---|---|---|
| 1.1 | §IX Threats, *Conclusion validity*, l.626 | "Only the three pre-declared contrasts are confirmatory." **Direct contradiction**: all three (H3a/b/c) are computed on merged labels that include judgement rules, so by the frozen rule none of them is confirmatory. |
| 1.2 | §VII-B Field categories (RQ2), l.404–406 | "Category is associated with the outcome ($\chi^2(6)=184.5$…), so H2's test is supported." H2 is a pre-registered hypothesis decided on judgement-rule-dependent labels (the top category, structured 57.0 %, is a single target whose rules are all JUD). No caveat. |
| 1.3 | §VII-C Comparison of producers (RQ3), l.416–427 | "None of the three pre-registered contrasts is supported … and two point the other way", plus all five CMH ORs. No caveat. |
| 1.4 | §VII-D Violation types (RQ4), l.449–451 | "Judgement-rule violations outnumber objective ones (502 against 272)" — entirely judge/human-dependent. No caveat. |
| 1.5 | §VIII Discussion, RQ2/RQ3/RQ4/RQ5 paragraphs, l.537–565 | None carries the word *exploratory*. RQ3 is introduced as "**the central negative result**". RQ1 (l.530–536) mentions "sensitive to … the judge (human agreement $\kappa=0.24$)" but never says the result is exploratory. |
| 1.6 | §VIII *Alternative explanations*, l.571–580 | Six verdicts ("consistent", "not supported", "supported") with no exploratory marker; four of the six rest on judgement-rule labels. |
| 1.7 | §X Conclusion, l.636–642 | "about a third of structurally valid LLM inputs broke an unenforced business rule, but random … broke rules more often, and telling the model the field's purpose and rules reduced violations." No qualifier of any kind. |
| 1.8 | §IX Threats, *Provenance*, l.629–631 | With `\reviewed` true the sentence "H3b is exploratory" is dropped. H3b is still exploratory — now for the κ reason instead of the provenance reason. |
| 1.9 | §IV Research Questions and Hypotheses, l.240–262 | The pre-registered gate itself (κ ≥ 0.4 on judge–human agreement, else judgement-rule results are exploratory) is never stated where H1–H6 are frozen; it first appears in §VII-E. A reader meets the hypotheses without knowing the gate exists. |

**Concrete fixes**

- 1.1 → replace with: "Because judge–human agreement fell below the pre-registered 0.4 threshold, no
  result that depends on judgement-rule labels — including the three pre-declared contrasts — is
  confirmatory; only the objective-rule analyses, which the rule functions decide for every
  structural pass, retain their pre-registered status."
- 1.2 → append after "so H2's test is supported": `\ifjudgeweak{} Because the category rates depend on
  judgement-rule labels, this result is exploratory (Section~\ref{sec:results}\,E).\fi`
- 1.3 → append after "and two point the other way": `\ifjudgeweak{} All three contrasts are computed on
  labels that include judgement rules and are therefore exploratory; the direction survives on
  objective rules alone (Table~\ref{tab:sensitivity}).\fi`
- 1.4 → open the subsection with `\ifjudgeweak Judgement-rule counts depend on the judge and are
  exploratory.\fi{}`
- 1.5/1.7 → add one sentence at the head of §VIII and one in §X, e.g. "Judge–human agreement was
  $\kappa=\R{kappa.judge}$, below the pre-registered 0.4, so every figure below that depends on
  judgement rules is exploratory; the objective-rule figures are not."
- 1.9 → add to §IV: "Agreement between the judge and the human annotation was pre-registered as the
  gate on this plan: a Cohen's $\kappa$ below 0.4 downgrades every judgement-rule result to
  exploratory."

---

## 2. Verbal proportions against the new numbers

All verified true except one borderline case (2.9).

| # | Location | Wording | Number it must match | Verdict |
|---|---|---|---|---|
| 2.1 | §VIII RQ1, §X | "About a third" of LLM inputs | `h1.rate` 30.9 % (338/1094) | OK |
| 2.2 | §VIII RQ1 | "a fifth when the model was asked only for legitimate values" | `s.llm.pone` 20.3 % | OK |
| 2.3 | §VIII RQ1 | "under a tenth on objective rules alone" | `s.llm.objective` 7.9 % | OK |
| 2.4 | §VII-A | "about a third of designed violations were missed" | 100 − `c.C.rate` 69.1 = 30.9 % | OK |
| 2.5 | §VII-A | "a few valid inputs were flagged" | `c.A.rate` 3.8 % | OK |
| 2.6 | §VII-A | "nearly every model value was in the past" (F15+F16) | table2b `llm_rate` 0.992 (131/132) | OK |
| 2.7 | §VIII RQ2 | "over half of the cross-field violations" | 160 (F15+F16) / 270 (cross-field) = 59.3 % | OK |
| 2.8 | §VII-F | "Most of its detections come from R" | R 53 TP of HYB's 64 TP = 82.8 % | OK |
| 2.9 | §VIII RQ5 | "R and HYB, find about a quarter to a third of violations" | R 22.5 %, HYB 27.1 % at the operating point (33.3 % / 36.6 % on the full decided corpus) | **Overstated at the top of the range.** Replace with "find about a quarter of violations (22.5 % and 27.1 %; 33 % and 37 % on the full decided corpus)". |
| 2.10 | §VIII RQ5 | "JUDGE at a similar FPR finds a quarter" | `e3.JUDGE.recall` 23.7 % | OK |
| 2.11 | §VIII RQ5 | "split evenly between objective and judgement rules" | 24.5 % / 22.4 % | OK |
| 2.12 | §VIII RQ5 | "rejecting between one valid input in fifteen and one in five" | JUDGE native FPR 6.8 % (1 in 14.7), SLM 20.1 % (1 in 5) | OK |
| 2.13 | §VIII RQ4 | "judgement-rule violations are the majority" | 502 / 774 = 64.9 % | OK |
| 2.14 | §VIII RQ4 | "most LLM violations came from ordinary prompts" | 61 of 81 = 75.3 % | OK |
| 2.15 | Abstract, §X | "about half a second" (SLM, median) | 527–534 ms | OK |
| 2.16 | Abstract, §X | judge "1.6–7.7 s" / "several seconds" | `e4.JUDGE.c1.*p50add.s` | OK |
| 2.17 | Abstract, §X | "saturated on two of three endpoints at eight concurrent clients" | courses and reviews `>60 000`; profile 14 282 ms | OK |
| 2.18 | §VIII RQ6, §X | "tens of milliseconds" (EMB) | 65–96 ms added p97.5 at c=1 | OK |
| 2.19 | §VIII RQ6 | EMB "detected almost nothing" | recall 4.7 %, AUROC 0.45 | OK |
| 2.20 | Abstract | "mostly violations of objective rules" (best fast design) | HYB caught 100 % of objective-only vs 6.5 % of judgement violators; 53/64 detections objective | OK |

---

## 3. Accuracy of the description of what the human did

### 3.1 CRITICAL — "275 values were drafted by an AI assistant" is false

§V-B (paper.tex l.291–296; PDF p.4): *"in this execution their **275** values were drafted by an AI
assistant at the researcher's request … A human reviewer then reviewed **every value**, keeping 262,
replacing 3 with values of their own and deleting 7"*.

Evidence: `raw_inputs.jsonl` holds 275 A/G records (A 139, G 136). Three of them
(`F28|A|r1|136/137/138`) are the reviewer's own replacement values, appended after the review
(`16_RESULTS/human_review/new_reference_ids.json`). The AI drafted **272** (`group_A.csv` and
`group_G.csv` at 136 each, per `PROVENANCE.md`); 262 + 3 + 7 = 272, which is also
`summary.json.provenance.total`. So the sentence attributes the human's own 3 values to the AI, and
"reviewed every value" is stated over a count that includes values that did not exist at review time.

Fix: *"in this execution their `\R{refvalues.aidrafted}` (=272) values were drafted by an AI assistant
… A human reviewer reviewed all 272, keeping `\R{review.keep}`, replacing `\R{review.change}` with
values of their own and deleting `\R{review.delete}`"*. This needs a new key in `make_numbers.py`
(`e1.refvalues` counts post-review records and must not be used for the AI-drafted count).

### 3.2 HIGH — who annotated is not disclosed; reviewer and annotator are the same person, and are the author

The paper says "A human annotator" (§V-E), "the human annotator" (§VII-E), "a human reviewer" (§V-B),
"a human reviewer reviewed and curated them" (§IX). Nothing says these are one person, nor that the
person is the author.

Evidence: `RESULTS_LOG.md` (2026-09-23) — "**Reviewer/annotator: Muhammad Zahid**";
`provenance_signoff.json` name "Muhammad Zahid"; `annotation_agreement.py` docstring — "**the
researcher's** blind annotation"; `review_status.json` label "human-curated (AI-drafted,
**researcher**-reviewed)". The paper's author is Zahid Rahimoon and §IX already says the application
was "built by the researcher".

Why it matters: the person who wrote the 43-rule reference and designed the conditions is also the
sole rater whose verdicts (a) override the judge in the merge, (b) set the κ that downgrades the
study, and (c) convert A/G from AI-drafted to "human-curated". The annotation was blind to
*condition* (verified: `17_CODE/review_app/server.py` l.83 withholds the id, group and prompt family
from the browser; only the server-side answer log carries them) but not blind to the hypotheses.

Fix: state it plainly once, in §V-E and §IX: *"The reviewer and annotator was the author, who also
built the testbed and wrote the rule reference; the annotation was blind to the generation condition
but not independent of the study design. A single non-independent rater is a limitation, and
agreement between two independent annotators is future work."*

### 3.3 MEDIUM — the 3 replacements, and what they do to condition A's structural rate

The paper says only "`\R{newref.passes}` (=0) of the replacements were themselves accepted by the
application, so the reviewed conditions rest on the kept values."

Evidence: the three values are promo codes `"Rahi"`, `"Zahid0078"`, `"Mosa78"` (`group_A.csv`, last
three rows). All three pass the Zod schema (`schema_pass: true`) and are rejected with HTTP 400 by
the application's promo-code lookup. They are **the only three structural failures in condition A**:
all 131 retained AI-drafted A values passed. Condition A's structural pass rate in Table I therefore
drops from 100 % to 97.8 % solely because of the human's own values.

Fix: add to §IX *Provenance*: *"The three replacement values were promo codes that the application's
promo lookup rejected; they are the only structural failures in condition A, so that condition's
97.8 % structural pass rate is an artefact of the review and not of the reference values used in the
semantic analysis."*

### 3.4 MEDIUM — the review and annotation effort is not reported, and it bears directly on κ

Evidence (timestamps in the two answer logs, both of which keep every click):

| Task | Items | Window | Elapsed | Median gap between answers |
|---|---|---|---|---|
| Reference review (task 1) | 272 values, 295 clicks | 12:17:00–12:36:08 | 19.1 min | **1.0 s** (p10 0 s, p90 6 s) |
| Blind annotation (task 2) | 220 items / 369 rule verdicts, 225 clicks | 12:53:37–13:26:25 | 32.8 min | **3.0 s** per item (p90 14 s) → 5.3 s per verdict |

Gate B (DECISIONS_LOG) budgeted "annotating 220 items ≈ 3–4 h" and "writing groups A/G ≈ 2–3 h".
§IX currently attributes part of the low agreement to "annotation error or the limited context the
annotator was shown" without evidence; the log is the evidence, and it is the strongest available
reading of κ = 0.238 and of the rule-functions-vs-human κ = 0.316. Omitting it while relying on the
annotation to downgrade the study, and to relabel A/G as human-curated, is a one-sided presentation.

Fix: add to §IX: *"The annotation took 33 min for 220 items (369 rule verdicts, median 3 s per item)
and the reference review 19 min for 272 values (median 1 s per value), against a planned 3–4 h and
2–3 h; both logs are released. A rapid single-rater pass is consistent with the low agreement, so
$\kappa=\R{kappa.judge}$ should be read as a joint bound on the judge and the annotation rather than
as a measurement of the judge alone."*

### 3.5 MEDIUM — the judge's no-verdict rate on the annotated items is not reported

§VII-E: "the judge agreed with the human annotator on 70.6 % of 126 rule verdicts where both gave a
verdict". Recomputed: the annotator returned 168 judgement-rule verdicts, 6 AMBIGUOUS, leaving 162 —
but only **126** are paired, because for **36 (22.2 %)** the judge returned no PASS/FAIL. κ is
therefore computed only where the judge was confident, which can bias it in either direction. The
paper reports the annotator's unsure rate (3.6 %) but not the judge's.

Fix: *"…on `\R{n.judge}` rule verdicts where both gave a verdict; the annotator was unsure on
`\R{unsure.judge}`\,\% of judgement-rule verdicts and the judge returned no usable verdict for a
further 36 of 162 (22\,\%), so $\kappa$ is estimated only where the judge was confident."*

### 3.6 LOW — self-consistency n is not stated

"the annotator's repeated annotations agreed with each other on 93.8 % ($\kappa=0.71$)" rests on
`n.self` = **32** rule verdicts from 20 repeated items. Add "(32 verdicts on 20 repeated items)";
"self-consistent" on 32 verdicts is a weak basis for the reassurance it carries in §IX.

---

## 4. Internal contradictions

### 4.1 CRITICAL — the compiled PDF's Table I footnote says the review is outstanding

PDF Table I footnote, verbatim: *"∗ SPECIFIED AS HUMAN-WRITTEN; VALUES AI-DRAFTED, **RESEARCHER
REVIEW OUTSTANDING**."* with rows "A valid human∗" and "G benign-unusual human∗". The body two
columns away says the review is done and the conditions are human-curated. Source:
`16_RESULTS/analysis/make_latex_tables.py` **l.40** — hard-coded string, not switched on
`review_status.json`.

Fix: make the footnote read from the review status, e.g. *"$^{*}$Specified as human-written; values
AI-drafted and then reviewed and curated by the author (262 kept, 7 deleted, 3 replaced; the 3
replacements were rejected by the application). Reported as human-curated."*

### 4.2 HIGH — two more stale table captions in the PDF

- `make_latex_tables.py` **l.308** → Table III (sensitivity): "G: BENIGN-UNUSUAL **(AI-DRAFTED)**".
- `make_latex_tables.py` **l.111** → Table VI (contrasts): "G BENIGN-UNUSUAL **(AI-DRAFTED)**".

Both appear in the compiled PDF and both contradict the body and Fig. 1 (which correctly says
"human-curated"). Fix: "(human-curated)" in both, driven by the same flag.

### 4.3 HIGH — the analysis-population arithmetic no longer adds up

§V-F (PDF p.4): "Of **3881** inputs, **430** key-mismatch records, **131** records produced by
inadvertent retries of failed calls, and **74** injection-family inputs are excluded, leaving
**3236**." 3881 − 430 − 131 − 74 = **3246**, not 3236.

The missing 10 are the review exclusions (`e1_e2_summary.json: "review_excluded": 10` = 7 deleted +
3 replaced originals, ids in `10_DATASETS/human_inputs/review_exclusions.json`). The key
`e1.reviewexcluded` = 10 is generated by `make_numbers.py` but used **nowhere** in `paper.tex`, so
the only records removed by the human review are invisible in the paper's population statement.

Fix: "Of `\R{e1.inputs}` inputs, `\R{e1.keymismatch}` key-mismatch records, `\R{e1.retried}` records
produced by inadvertent retries of failed calls, `\R{e1.reviewexcluded}` reference values the
reviewer deleted or replaced, and `\R{e1.p5}` injection-family inputs are excluded, leaving
`\R{e1.primary}`." Table I's caption ("Prompt family P5 … and retried records are excluded") needs
the same addition.

### 4.4 CRITICAL — "Only the three pre-declared contrasts are confirmatory"

See 1.1. This is the sharpest contradiction in the paper: §VII-E and §IX both state that *every*
judgement-rule result is exploratory, and §IX *Conclusion validity* then says the three contrasts
are confirmatory.

### 4.5 HIGH — DECISIONS_LOG has no 2026-09-23 entry

`grep 2026-09-23 DECISIONS_LOG.md` → 0 hits. Neither the completion of TH-10/DV-03 nor the
pre-registered downgrade of every judgement-rule result is logged, although:

- DV-03's own row still reads *"researcher review outstanding"* and *"Alternative explanation 3 is
  not ruled out until the researcher reviews the files"* — now false;
- DV-03's last column still says *"H3b becomes exploratory unless option 1 or 2 is taken"*, and the
  κ result makes it exploratory anyway;
- `RESEARCH_SYSTEM.md` A2.5 requires a log entry for any change to a major claim or metric, and the
  downgrade changes the status of H1, H2, H3a–c and H5.

Fix: add a dated decision entry recording (a) TH-10 closed via PROVENANCE option 1, with the 262/7/3
counts and the 3 rejected replacements; (b) the R3 import and the κ = 0.238 gate firing, listing
exactly which hypotheses lose confirmatory status; (c) update DV-03's row to resolved.

### 4.6 HIGH — CLAIMS_LEDGER rows are stamped "VERIFIED 2026-09-23" but hold superseded numbers

The status column was updated ("VERIFIED 2026-09-23 after R3 merge; judgement-rule component
EXPLORATORY (kappa 0.238)") while the claim text was not:

| Row | Ledger text | Current value |
|---|---|---|
| CL-019 | "344/1228 (28.0 %, CI 25.6–30.6)" | 338/1094, 30.9 %, CI 28.2–33.7 (28.0 % is pre-DV-14) |
| CL-020 | "chi2(6)=214.0 … V=0.33; structured 56 %, free text 52 %, financial 13 %" | 184.5, V=0.31, 57.0 / 50.7 / 12.5 |
| CL-021 | "Holm p=1.0, 0.58, 1.0; MH-OR E vs B 0.13 … E vs G 1.07 [0.64,1.81], E vs D 0.25" | 1.00, 0.14, 1.00; 0.156, 1.323 [0.772,2.267], 0.232 |
| CL-024 | "HYB 0.269 [0.213,0.323]" | 0.271 [0.213, 0.325] |
| CL-027 | "35.0 % vs 18.7 %, Holm p<0.001" | 35.0 % vs 22.3 %, Holm p=0.02 |
| CL-028 | "SLM 68.9 % / 19.3 %; JUDGE 51.3 % / 6.4 % with 25 % no verdict" | 69.1 / 20.1; 51.7 / 6.8; 26 % |

A ledger stamped as verified today that asserts numbers the paper does not contain is worse than a
stale ledger, because it is the audit trail a reviewer would check. Regenerate the claim texts from
the current CSVs (or from `numbers.tex`) in the same pass that sets the status.

### 4.7 MEDIUM — PROVENANCE.md contradicts itself and the data

- Header: "Version: v0.7 · Date: 2026-09-20 · Status: **AI-DRAFTED, RESEARCHER REVIEW OUTSTANDING
  (TH-10)**", while the review record below is signed and dated 2026-09-23.
- "## How this is handled (**pick one before E1 is analysed**)" and "The assistant's recommendation
  is option 1" still read as an open decision; option 1 was taken and E1 has been re-analysed.
- "`group_A.csv` (136 values)" — the file now holds **139** data rows.
- Construction notes: "Every value satisfies the target's structural constraints" — the three
  appended values pass Zod but are rejected by the application, and under the paper's own definition
  of structural validation (which includes service-level checks) that statement is now false for
  them.
- The review record does not mention that all three replacements were rejected, although
  `RESULTS_LOG.md` does.

### 4.8 MEDIUM — PROJECT_STATE.md still describes both tasks as outstanding

`PROJECT_STATE.md` (last written 2026-09-22 21:21) lists as open CRITICAL/HIGH: "DV-03: groups A/G
AI-drafted → review/sign …" and "Judge–human κ missing → annotate …"; next actions "1. HUMAN: … task
1 review 272 values + sign-off, task 2 annotate 220 items"; "Blocked on human: items 1–3"; TH-10
register row "review outstanding". All three are done. The workspace `CLAUDE.md` requires
PROJECT_STATE to be updated at the end of every working turn.

### 4.9 MEDIUM — three missing spaces in the compiled PDF from `\fi` swallowing the following space

TeX discards the space after the control word `\fi`. All three are visible in the PDF:

| paper.tex | PDF reads | Fix |
|---|---|---|
| l.427 `…human-written input.\else … \fi` ⏎ `Fig.~\ref{…}` | "human-written input.**Fig.** 1 shows" | `\fi{}` |
| l.474 `…the objective-rule part is not.\fi At the operating` | "the objective-rule part is not.**At** the operating" | `\fi{} At` |
| l.601 `…($\kappa=\R{kappa.self}$).\fi The judge sample` | "items (κ = 0.71).**The** judge sample" | `\fi{} The` |

### 4.10 LOW — JUDGE no-verdict rate differs between RESULTS_LOG and the paper

`RESULTS_LOG.md` E3 table (2026-09-22) says "no verdict on 25 %"; the paper and
`table6d` say 26 % (0.2557). The 2026-09-23 entry does not restate it, so the older line stands as
the record. Harmless rounding, but it is the kind of mismatch a citation audit flags.

---

## 5. Now stale, or changed by the new data

### 5.1 HIGH — the "five defects" list omits DV-18, which is now load-bearing

§IX *Defects found and corrected*: "**Five** defects were found during execution", items (i)–(v)
= DV-09, DV-07, DV-14, DV-10, DV-11. DV-18 (2026-09-22) records two further defects, both in the path
the new data travels: *"(i) `cmdMerge` never passed human verdicts to `mergeLabel`, so Algorithm 1's
R3 step was not wired in; (ii) `import-labels` parsed CSV with a regex that drops every cell after an
empty one, so verdicts would have been lost silently."* When the paper said "five", no human label
existed and DV-18 had no effect on results. It now does: every human verdict in the paper reached the
merge through the code those two fixes repaired. Omitting it understates the fragility of the label
pipeline the paper's central caveat rests on.

Fix: make it six and add: *"(vi) The label merge did not pass human verdicts to Algorithm 1 and the
annotation importer silently dropped cells after an empty one; both were found by testing the import
path with a synthetic label before any human annotation existed, and fixed and unit-tested before the
annotation was imported."*

### 5.2 MEDIUM — Alternative explanation 3 over-reads a null result

§VIII: *"Unusual human inputs behave the same: consistent with the data for human-curated inputs,
which did not differ detectably from context-aware model inputs."* The contrast is CMH OR **1.32,
95 % CI 0.77–2.27, p = 0.29** (pooled 24.5 % vs 17.2 %; Fisher one-sided Holm p = 0.14, OR 1.56) — an
underpowered null whose interval admits a 2.3× increase, on a comparison that is now itself
exploratory, against a reference condition curated in 19 minutes by the author. §VII-C does say "the
interval is wide"; the Alternative-explanations verdict does not carry that over.

Fix: *"Unusual human inputs behave the same: **not resolved**. Human-curated inputs did not differ
detectably from context-aware model inputs (OR `\R{cmh.EvG.or}`, CI `\R{cmh.EvG.ci}`,
`\R{cmh.EvG.p}`), but the interval admits a substantial difference in either direction, the reference
values were AI-drafted before curation, and the contrast is exploratory."*

### 5.3 MEDIUM — the objective-rule results are presented as unaffected, which the data do not support as strongly as the prose implies

Three places assert that the objective-rule results are untouched: §VII-A "the objective-rule rate
below depends only on the rule functions and is **not affected**"; §VII-F "the objective-rule part is
not"; `RESULTS_LOG.md` "Objective-rule results … are unaffected". Mechanically correct — I verified
`17_CODE/harness/groundtruth/merge.ts` gives R1 precedence over R3 on OBJ rules, exactly as frozen
Algorithm 1 specifies, and `e1_sensitivity.py` computes "objective rules only" from `violated_obj`,
so no judge and no human verdict enters it.

But the *only* human check of those rule functions gave **κ = 0.316** (89.5 % agreement over 143
verdicts, rule functions flagging **19** violations against the annotator's **4**). §IX discloses
this, then uses it to argue the annotation may be at fault. Both readings are available from the same
data, and §VII's two "not affected" statements do not acknowledge that the objective rules also
failed their human check.

Fix: in §VII-A/§VII-F, replace "is not affected" with "is not affected **by the judge**"; and in §IX
state the symmetric reading: *"The annotator's disagreement with the deterministic rule functions
($\kappa=\R{kappa.rules}$) is either annotation error or a defect in the rule functions; with one
rapid rater we cannot separate the two, so the objective-rule results are exempt from the
pre-registered downgrade by the letter of the plan rather than by independent confirmation."*

### 5.4 MEDIUM — Future work no longer addresses the ground truth

With both flags true, §X reduces to "Future work should collect reference inputs written by several
people unaided, re-judge context-dependent rules with the full record, state the current date to
generators, and repeat the protocol on an existing open-source application." Nothing about the thing
the study now knows is its weakest link. Add: "obtain independent annotations from more than one
rater with an adjudication step and a calibrated rubric, and re-establish the judge's agreement on
that basis".

### 5.5 LOW — a frozen agreement statistic is not reported

Algorithm 1 (`07_METHODOLOGY.md` l.96) specifies "Cohen's κ (R2 vs R3) **and (R1 vs R2 on objective
rules)**". The paper reports κ(R2 vs R3) and κ(R1 vs R3); κ(R1 vs R2 on objective rules) is neither
reported nor logged as a deviation.

### 5.6 Not an issue — checked and clean

- E vs G is correctly described as a model-vs-human-curated contrast in §VII-C, Fig. 1's caption and
  §IX *Provenance*; Fig. 1 already says "human-curated".
- §V-E's "where a human verdict exists it takes precedence over the judge" is precise (it does not
  claim precedence over the rule functions), and matches `merge.ts`.
- "blind to condition" is accurate: `server.py` l.83 withholds the id, group and prompt family from
  the browser for task 2, and `make_share_package.py` keeps the unblinding key out of the share
  package.
- §X and the abstract's operating-cost sentences all match `numbers.tex`.

---

## 6. Sanity check of the agreement analysis — correct

`16_RESULTS/analysis/annotation_agreement.py` recomputed against
`raw/E1_E1_20260920T0847/human_verdicts.jsonl` (220 rows), `judge_verdicts.jsonl` and
`17_CODE/review_app/targets.json`:

| Check | Result |
|---|---|
| Repeats excluded from the main comparison | **Yes** — rows with `repeat: true` go to a separate dict; 200 non-repeat items, 20 repeats. Reproduced exactly. |
| Judgement rules only | **Yes** — `CLS[rid] == "JUD"` from `targets.json` (`cls.startswith("OBJ")` → OBJ, else JUD). |
| Pairs are judge PASS/FAIL vs human PASS/FAIL | **Yes** — human `AMBIGUOUS` skipped (6); judge value accepted only if in `{PASS, FAIL}`. |
| Reported n matches the data | **Yes** — 168 human JUD verdicts, 6 unsure, **126** paired, 36 with no judge verdict. `\R{n.judge}` = 126. |
| κ arithmetic | **Correct.** Standard Cohen's κ. Hand-check: p_o = 0.7063; p_FAIL human 28/126, judge 37/126 → p_e = 0.61461; κ = 0.09169/0.38539 = **0.2379** = reported 0.238. |
| Objective comparison | 162 verdicts, 7 unsure, 143 paired, 89.5 %, κ = 0.3162 — reproduced. |
| Intra-annotator | 32 paired verdicts from the 20 repeats, 93.75 %, κ = 0.7143 — reproduced. |
| Gate logic | `judgement_results_exploratory = not (κ >= 0.4)` → True. Matches the pre-registration in the script docstring and Gate B. |
| Merge implementation vs frozen Algorithm 1 | `merge.ts` matches `07_METHODOLOGY.md` l.90–95 line for line (OBJ→R1, else R3, else R2, else AMBIGUOUS). |

Only substantive caveat: the 36 dropped verdicts (22 % of the annotator's decided judgement-rule
verdicts, all dropped because the judge gave no verdict) are not reported — see 3.5.

---

## Compact issue list

| Sev | Location | Fix |
|---|---|---|
| CRITICAL | `make_latex_tables.py` l.40 → Table I footnote in the PDF: "researcher review outstanding" | Drive the footnote from `review_status.json`; state 262 kept / 7 deleted / 3 replaced-and-rejected, "human-curated" (4.1) |
| CRITICAL | §IX *Conclusion validity* l.626 "Only the three pre-declared contrasts are confirmatory" | Replace: nothing that depends on judgement-rule labels is confirmatory (1.1 / 4.4) |
| CRITICAL | §V-B l.291 "their 275 values were drafted by an AI assistant … reviewed every value" | 272 were AI-drafted; 3 of the 275 are the reviewer's own; add a separate key (3.1) |
| HIGH | §V-F l.338 population sentence: 3881−430−131−74 = 3246 ≠ 3236 | Add `\R{e1.reviewexcluded}` (=10) as a fourth exclusion; same in Table I's caption (4.3) |
| HIGH | §VII-B (RQ2), §VII-C (RQ3), §VIII all RQ paragraphs, §X Conclusion, §VIII Alternative explanations, §IX *Provenance* | Add the exploratory qualifier; drop-in wording in §1 (1.2–1.8) |
| HIGH | §V-E, §VII-E, §IX — "a human annotator" / "a human reviewer" | Disclose that both are the author, who also built the testbed and wrote the rule reference (3.2) |
| HIGH | `make_latex_tables.py` l.111, l.308 → Table VI and Table III captions "(AI-drafted)" | "(human-curated)" (4.2) |
| HIGH | §IX "Five defects were found during execution" | Six: add DV-18's two label-pipeline defects, now load-bearing (5.1) |
| HIGH | `DECISIONS_LOG.md` — no 2026-09-23 entry; DV-03 row still "review outstanding" | Log TH-10 closure and the κ gate firing; list which hypotheses lose confirmatory status (4.5) |
| HIGH | `CLAIMS_LEDGER.csv` CL-019/020/021/024/027/028 | Claim texts hold superseded numbers under a "VERIFIED 2026-09-23" stamp; regenerate from the current CSVs (4.6) |
| MEDIUM | §IV Research Questions | State the pre-registered κ ≥ 0.4 gate where H1–H6 are frozen (1.9) |
| MEDIUM | §VII-E "126 rule verdicts where both gave a verdict" | Also report the judge's 36/162 (22 %) no-verdict rate (3.5) |
| MEDIUM | §IX Threats — no annotation-effort disclosure | Report 33 min / 220 items and 19 min / 272 values against the 3–4 h and 2–3 h plan (3.4) |
| MEDIUM | §IX *Provenance* — the 3 replacements | They are non-existent promo codes and are condition A's only structural failures (3.3) |
| MEDIUM | §VIII Alternative explanation 3 "consistent with the data" | "Not resolved" + the wide interval + exploratory status (5.2) |
| MEDIUM | §VII-A, §VII-F "the objective-rule … is not affected" | "not affected by the judge"; add the symmetric reading of κ(rules vs human) = 0.316 (5.3) |
| MEDIUM | §X Future work | Add multi-rater annotation with adjudication (5.4) |
| MEDIUM | `10_DATASETS/human_inputs/PROVENANCE.md` | Header still "REVIEW OUTSTANDING"; "136 values" (now 139); "pick one" decision still open; "every value satisfies the structural constraints" now false for the 3 appended values (4.7) |
| MEDIUM | `PROJECT_STATE.md` | Still lists DV-03, the missing κ and TH-10 as open and "blocked on human" (4.8) |
| MEDIUM | paper.tex l.427, l.474, l.601 | `\fi` eats the following space; three missing spaces visible in the PDF (4.9) |
| LOW | §VIII RQ5 "about a quarter to a third of violations" | "about a quarter (22.5 % and 27.1 %; 33 % and 37 % on the full decided corpus)" (2.9) |
| LOW | §VII-E "agreed with each other on 93.8 %" | Add "(32 verdicts on 20 repeated items)" (3.6) |
| LOW | `07_METHODOLOGY.md` Algorithm 1 l.96 | κ(R1 vs R2 on objective rules) is specified but neither reported nor logged as a deviation (5.5) |
| LOW | `RESULTS_LOG.md` E3 line "no verdict on 25 %" vs the paper's 26 % | Align (4.10) |

Every other verbal proportion, every `\R{}` key, the agreement script, the label merge and the
blinding of the annotation were checked against the data and are correct.

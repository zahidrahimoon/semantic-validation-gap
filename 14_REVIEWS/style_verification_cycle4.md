# Style-pass verification (cycle 4)

Date: 2026-09-23
Files compared: `13_DRAFT/paper.tex` (new) vs `13_DRAFT/paper_v0.9-before-style-pass.tex` (old)
PDF checked: `13_DRAFT/paper.pdf` (13 pages, compiled 2026-09-23 18:49, confirmed to be the new source)

## 0. Mechanical invariants (verified)

| Check | Result |
|---|---|
| `\R{...}` macro keys and their multiplicities | **identical** in both files |
| `\cite` key set | **identical** (72 distinct keys; `paper.bbl` has 72 `\bibitem`) |
| `\ifhumanlabels` / `\ifjudgeweak` / `\ifreviewed` / `\else` / `\fi` counts | **identical** (9 / 10 / 7 / 16 / 26) |
| Flags currently set in `tables/numbers.tex` | `humanlabelstrue`, `reviewedtrue`, `judgeweaktrue` |

So no number was retyped as a literal *except* the two cases noted in F5 and F9 below.

---

## 1. Meaning / strength / hedging changes

### F1 — HIGH — Related Work §"Position of this work": citation group contradicts the paper's own description of two of the four sources

New text (`paper.tex`, Related Work, "Position of this work"):

> "The guardrail studies evaluate detectors for adversarial intent and report cost on datacentre
> GPUs~\cite{jacob2025promptshield,ahmed2026reflexguard,saleem2026layered,maiorano2026tradeoffs}."

Two paragraphs earlier, the same paper says the opposite about two of those four works:

> "One detector reports no timing at all~\cite{jacob2025promptshield}." … "One study compares regex,
> classifier and LLM tiers without stating its hardware~\cite{maiorano2026tradeoffs}."

The paper notes confirm the earlier statements, not the new one:
- `11_PAPERS/notes/P54.md` (jacob2025promptshield): "**Latency / throughput / cost / hardware: Not reported.** The paper contains no timing, throughput, cost, GPU or hardware information for any detector."
- `11_PAPERS/notes/P63.md` (maiorano2026tradeoffs): "**Hardware: Not reported.** … no CPU/GPU model is named."

Only `ahmed2026reflexguard` (35 ms on a datacentre GPU) and `saleem2026layered` (61 ms on an A100) support "report cost on datacentre GPUs".

**Fix.** Trim the group and keep the paper's existing, accurate characterisation, e.g.:

> "The guardrail studies evaluate detectors for adversarial intent and, where they report cost at all,
> report it on datacentre GPUs~\cite{ahmed2026reflexguard,saleem2026layered}; others report no timing
> ~\cite{jacob2025promptshield} or no hardware~\cite{maiorano2026tradeoffs}."

### F2 — HIGH — "Position of this work": `kim2025llamaresttest` is placed in the group whose oracle is acceptance, contradicting Related Work and the Introduction

New text:

> "The form and API testing studies generate inputs with an LLM and count acceptance by the
> application~\cite{alian2024formnexus,li2026webformtest,kim2025llamaresttest}, so an accepted but
> inappropriate value counts as a success."

But the Introduction deliberately excludes that work from the same claim ("…because they treat acceptance by the application as validity~\cite{li2026webformtest,alian2024formnexus}"), and Related Work §"LLM-generated inputs" describes it as the exception: "Where semantic validity is measured separately, a base model reaches 22.9\,\% domain-coherent values, against 72.4\,\% after fine-tuning~\cite{kim2025llamaresttest}."

`11_PAPERS/notes/P24.md` confirms: "'valid inputs' in RQ1 are those judged domain-coherent by human raters, not those accepted by the server" (§4.2 p.13; Table 3 p.12).

**Fix.** Drop `kim2025llamaresttest` from that citation group and handle it separately, e.g. append: "The one study that scores semantic validity separately~\cite{kim2025llamaresttest} has no non-LLM comparison."

### F3 — HIGH — "Position of this work": new causal claim "a wrong value fails at once in the consuming tool" is contradicted by two of the four works cited for it

New text:

> "The output-side studies measure schema-valid but wrong values that a model
> emits~\cite{li2026orderbench,ray2026constrainttax,singh2026sob,wrenn2026enterprise}, where a wrong
> value fails at once in the consuming tool."

- `singh2026sob` (`11_PAPERS/notes/P35.md`): the oracle is exact leaf-value match against a source ("Value Accuracy [0,1] (exact leaf-value match; PRIMARY)"). A wrong value is silently wrong; nothing fails.
- `li2026orderbench` (`11_PAPERS/notes/P33.md`): the headline risk metric is **"unsafe acceptance"** — "`status=accepted` for an object the verifier says must not be executed". The whole point is that the wrong object *is* accepted, i.e. it does **not** fail at once.

Only `ray2026constrainttax` ("executable accuracy fell") and `wrenn2026enterprise` ("workflows that pass validation and cannot execute") support the claim.

This matters beyond citation hygiene: the contrast the subsection builds ("We measure values … where nothing fails") is weakened, because `li2026orderbench` already reports silent unsafe acceptance. The old draft's wording was correct and weaker — Introduction: "All of this concerns model outputs that a tool, an API or a renderer consumes."

**Fix.** Replace with a claim the sources support, e.g.: "…, where the value is consumed immediately by a tool, an API or a renderer and is scored against an expected answer or an execution outcome." Then state the real difference (persistence and later re-reading) without asserting that output-side errors always fail fast.

### F4 — MEDIUM — Abstract: quantifier strengthened from "many" to "most", as a general claim about web applications

- Old: "A web application's schema validation checks that an input is well formed, **but many business rules** that decide whether the input is appropriate **are never enforced**."
- New: "A web application's schema validation checks that an input is well formed. It does not check the many business rules that decide whether the input is appropriate, and **most of those rules are never enforced in code**."

"most" is a stronger universal about web applications in general. The paper's only evidence is its own testbed (38 of 43 rules unenforced), which it describes as "chosen to resemble small production applications" — not as a measured population property. Verified present in the PDF (abstract, line 12 of extracted text).

**Fix.** Restore "many": "…and many of those rules are never enforced in code."

### F5 — MEDIUM — Method §"Targets and generation conditions": a literal number was typed into the prose

- Old: "…\R{newref.passes} of the replacements were themselves accepted by the application --- **all** were promotional codes the application does not recognise…"
- New: "The application accepted \R{newref.passes} of the replacements. **All three** were promotional codes it does not recognise…"

`newref.passes = 0` and `review.change = 3`, so the arithmetic is currently correct and the rendered sentence is coherent ("The application accepted 0 of the replacements. All three were promotional codes it does not recognise…", PDF line 221). But "three" is a hand-typed count that silently mirrors `\R{review.change}`, which breaks the manuscript's own invariant stated in the preamble comment ("No number in this manuscript is typed by hand") and in §Analysis ("Every number in this paper is generated from the raw data by scripts").

**Fix.** "The application accepted \R{newref.passes} of the \R{review.change} replacements. All of them were promotional codes it does not recognise…"

### F6 — MEDIUM — Results §Overhead (RQ6): the p95 sensitivity caveat lost its scope

- Old: "EMB added X--Y\,ms with one client, above the bound **(on the p95 bracket used as a sensitivity check, the review endpoint fails and the other two are undetermined)**, and Z--W\,ms with eight…"
- New: "EMB added X--Y\,ms with one client, above the bound, and Z--W\,ms with eight, because every request embeds its text on the same CPU. **On the p95 bracket used as a sensitivity check, the review endpoint fails and the other two are undetermined.**"

Promoting the parenthesis to a standalone sentence removes its attachment to EMB. As written it can be read as a statement about H6 or about the overhead experiment generally, not about EMB's bound check.

**Fix.** "On the p95 bracket used as a sensitivity check, EMB fails the bound on the review endpoint and the other two endpoints are undetermined."

### F7 — LOW/MEDIUM — Abstract: the qualifier "objective" was dropped from the detection claim

- Old: "…the best fast design detected \R{e3.HYB.recall}\,\%, mostly violations of **objective** rules the application could enforce directly."
- New: "…The best fast design detected \R{e3.HYB.recall}\,\%, and most of what it caught were violations of rules the application could enforce in code."

"objective" is a defined term in this paper (decidable from input, database and clock) and carries the load of the finding. Dropping it makes the sentence vaguer, and the corresponding Results/Discussion text still says "objective". **Fix:** restore "objective rules".

### F8 — LOW/MEDIUM — Discussion RQ1: the subordinating "but" was removed, so the extension claim is now asserted flat

- Old: "The rate extends output-side findings… to inputs that an application would persist, **but its magnitude is sensitive** to prompt intent, to one date-dependent target, and to the judge…, **so** the claim that survives every check is…"
- New: "This extends output-side findings… to inputs that an application would store. The magnitude is sensitive to… The claim that survives every check is…"

The caveats are all still present, so this is a framing change rather than a lost caveat, but the extension claim no longer reads as qualified in the same sentence. **Fix (optional):** "This extends output-side findings… to inputs that an application would store, though the magnitude is sensitive to…"

### F9 — LOW/MEDIUM — Method §"Analysis population": "four groups" is a hand-typed count that is wrong in one conditional branch

New: "Of the \R{e1.inputs} inputs, **four groups** are excluded: … and\ifreviewed{} \R{e1.reviewexcluded} reference values that the reviewer deleted or replaced\else{} **no reviewer exclusions**\fi."

With `\reviewedtrue` (the current setting) this renders correctly. With `\reviewedfalse` it renders "four groups are excluded: X, Y, Z, and no reviewer exclusions", which is self-contradictory. **Fix:** drop "four groups" — "Of the \R{e1.inputs} inputs, the following are excluded: …".

### F10 — LOW — Discussion RQ4: a causal connector was introduced between two previously independent statements

- Old (two sentences): "On AI-facing fields most LLM violations came from ordinary prompts rather than injection attempts. The gap is mostly unenforced business logic rather than attack."
- New: "…rather than from injection attempts, **so** the gap is mostly unenforced business logic rather than attack."

The inference is defensible, but it is now asserted as following from a single AI-facing-field observation. **Fix:** revert to two sentences, or "which is consistent with the gap being mostly unenforced business logic rather than attack."

### F11 — LOW — Background: hedge on terminology usage strengthened

- Old: "In LLM security the same adjective **often** means adversarial intent"
- New: "In LLM security the same adjective **usually** means adversarial intent"

No source is cited for the frequency. **Fix:** restore "often".

### F12 — LOW — Method §"Semantic ground truth": stratification precision lost

- Old: "drawn round-robin across target **$\times$ condition** with a fixed seed"
- New: "drawn round-robin across target **and** condition with a fixed seed"

"target × condition" states that strata are the cross product; "target and condition" does not. Also, "up to 14 per stratum and as many as were available" moved to the end of a 51-word sentence, where it now trails the whole sample rather than the supplement. **Fix:** restore `$\times$` and re-attach the stratum cap to `\R{judge.supplement}`.

### F13 — LOW — Method §"Analysis population": exclusive "either … or" replaced an inclusive "or"

- Old: "the remainder were not in the judge sample (…) **or** received no usable verdict (…)"
- New: "The remaining passes were **either** not in the judge sample (…) **or** received no usable verdict (…)"

"either" asserts mutual exclusivity of the two counts, which the text does not establish. **Fix:** delete "either".

### F14 — LOW — Related Work: "deployable" dropped from the positioning of the output-side studies

- Old: "the semantic check is the oracle rather than an evaluated, **deployable** layer"
- New: "the semantic check is the oracle rather than a layer that is itself evaluated"

Deployability (request-path cost) is one of the paper's two axes (C4, RQ6), so the word was doing work. **Fix:** "…rather than a deployable layer that is itself evaluated."

### Checked and found unchanged in meaning (no action)

Background definitions of structural validation / semantic validity / SV-SI and the conditional-rate rationale; the whole RQ/hypothesis list (byte-identical in substance); the LLM-generation parameters; the structural-measurement rule (new "five enforced business checks" agrees with §Subject); all six defect items (i)–(vi); every Threats-to-Validity paragraph including the judge-strictness analysis, the annotator-vs-rule-function disagreement, self-consistency, clock-dependence, and the "Who produced the human data" and "Provenance" paragraphs; all six alternative explanations; the Conclusion and Future-Work item list; the two figure captions; the Artifact Availability and Acknowledgment sections.

## 2. Things dropped that mattered

Beyond F6, F7, F12 and F14 above, a word-level diff of the two bodies shows **no caveat, exclusion, deviation reference, threat or number-context was removed**. Specifically confirmed still present in the new version:

- P5/injection exclusion from all primary rates (RQ preamble, RQ4, alternative explanations).
- All four exclusion groups (key-mismatch, retried, P5, reviewer exclusions) and the `\R{e1.primary}` reconciliation.
- The seven context-deprived judgement rules and their sensitivity exclusion.
- The pre-registered κ=0.4 gate and every `\ifjudgeweak` exploratory rider (10 occurrences, unchanged).
- The date-target confound, the "random is a weak producer" bound, the AI-drafted-reference provenance caveat, the `TODO-HUMAN` artifact placeholder.
- All six defect deviations and the note that (iii), (v), (vi) were found by independent review.

Contrastive connectives dropped overall: `but` 19 → 14. Four of the five removals are harmless (the contrast survives via "still", "rather than", or sentence order); the fifth is F8.

## 3. "Position of this work" — novelty-claim audit

**Compliant with the project rule.** The subsection contains no "first", no "no prior work", and no unsupported universal novelty claim. The absence claims elsewhere in Related Work retain the required form ("We found no study that compares…", "We found no measurement of…").

Two residual overstatements, in addition to F1–F3:

- **LOW/MEDIUM** — "We measure values that an application accepts and stores, **where nothing fails** and the value is later read by people or by an assistant." "nothing fails" is absolute; the paper's own structural measurement shows some inputs *are* rejected by the five enforced checks. **Fix:** "where nothing fails at submission time".
- **LOW/MEDIUM** — "The comparison across seven producers, including non-LLM ones, **is what allows the central question to be answered at all**: whether this gap is a property of AI writers or of the validation boundary itself." "at all" is an implicit exclusivity claim, and the binary framing is sharper than the Discussion, which says the random comparison "bounds non-AI input rather than characterising it". **Fix:** "The comparison across seven producers, including non-LLM ones, is what lets us ask whether this gap is a property of AI writers or of the validation boundary."
- **LOW** — "Three lines of work come closest" carries no search-scope hedge, unlike the rest of the paper. **Fix:** "Of the work we reviewed, three lines come closest".

Claims in the subsection that **are** supported as the rest of the paper describes them: the "we separate the two outcomes and label against a frozen rule reference" sentence (§Method), and the "we evaluate detectors for ordinary data appropriateness, on structured payloads, on a four-core CPU, and report detection and cost together" sentence (§Layers, RQ5, RQ6).

## 4. Residual style check (new version only)

**Em dashes: none.** Zero `---` sequences and zero Unicode U+2013/U+2014 in `paper.tex`. All 12 `--` occurrences are numeric ranges (`\R{}--\R{}`) or correct en-dash compounds (`Cochran--Mantel--Haenszel`, `judge--human`, `client--server` in `\ifjudgeweak` text at line 507/576).

**"not only … but also": none.**

**Buzzwords: none.** The only hit for the watch list is "robustness" at line 97 ("A robustness study that uses status codes as its oracle…"), which names the study type of `tigulla2026robustness` and is not the banned adjectival use.

**Sentences over ~45 words (4 found, all pre-existing or list-shaped):**

1. §Semantic ground truth, 51 words — "For compute reasons the judge was applied to a stratified sample: … up to 14 per stratum and as many as were available." (see F12; split after the seed clause).
2. §LLM generation, 50 words — "Seven prompt families are stored as hashed files: P1 … P7 Unicode variants." Acceptable as an enumerated list; unchanged from the old version.
3. §Conclusion, 50 words as rendered — "Future work should strengthen the ground truth … and repeat the protocol on an existing open-source application." Seven coordinated items; unchanged from the old version. Consider splitting after "…written by several people unaided."
4. §Results RQ1, borderline 44 — "The interval is wide, and the reference inputs are AI-drafted values curated by a human reviewer, so this compares model input with human-curated input rather than with input a person wrote unaided."

**Paragraphs that still read as machine-generated (3):**

- **Related Work §"Schema-valid but semantically wrong outputs"** — five consecutive sentences of 10/12/14/15/12 words, three of them with the identical frame "A ⟨modifier⟩ study/benchmark **finds** …". The style pass converted a semicolon chain into uniform anaphora, which is a stronger tell than the original. *Fix:* vary the verbs and merge two, e.g. "A multi-source benchmark reports a 15–25 point gap between JSON pass rate and value accuracy, and a tool-API study attributes a shift from interface misuse to semantic misuse to the schema itself. In one production platform, workflows passed validation and could not execute."
- **Related Work §"Detection layers and their cost"** — six consecutive sentences of 11/9/8/13/15/11 words, four with the frame "One/An/A ⟨noun⟩ **reports/notes** …". *Fix:* combine the two GPU figures into one sentence and vary the openings.
- **Related Work §"Position of this work"** — a rigid three-beat template: "The ⟨X⟩ studies do ⟨A⟩ (24/28/15 words). We do ⟨B⟩ (24/18/21 words)." Six of eight sentences are 15–28 words and three begin "We". *Fix:* break the parallelism on at least one pair, and open one contrast from our side rather than theirs.

**One residual staccato triad (LOW):** §Introduction ¶1 — "A promotional code must apply to the item being bought. A workshop must start in the future. A review must be about the workshop it is attached to." (10/7/11 words, identical subject-modal-complement shape). The style pass replaced an em-dash appositive list with three near-identical short sentences. *Fix:* recombine into one sentence: "A promotional code must apply to the item being bought, a workshop must start in the future, and a review must be about the workshop it is attached to."

**Typographic regression (trivial):** line 74, `client--server` (old) became `client-server` (new). IEEE style takes an en dash for a compound of two parallel entities. *Fix:* restore `client--server`.

## 5. PDF verification

| Check | Result |
|---|---|
| PDF is the compile of the new source | **Yes** — contains "Position of this work" (as §H of Related Work), "reports no comparable figures", "those rules are never enforced in code" |
| `??` (unresolved refs/cites) | **0 occurrences** |
| `[RESULT PENDING]` | **0 occurrences** |
| `TODO-HUMAN` | 1 occurrence, in Artifact Availability ("repository URL and licence") — intended and protocol-allowed |
| Link annotations | **230 `/Link` annotations** in the compressed object streams |
| Clickable citations | **Yes** — 72 distinct `cite.*` link destinations, exactly matching the 72 `\bibitem` entries in `paper.bbl` |
| Internal `/GoTo` links | 173 |
| External `/URI` links (DOIs in references) | 180 |
| `paper.log` undefined references/citations | none (the only warning is a cosmetic `OT1/ptm/m/scit` font-shape substitution) |
| Overfull boxes | 0 |
| Pages | 13 |

---

## Compact issue list

| # | Severity | Location | Fix |
|---|---|---|---|
| F1 | HIGH | Related Work §"Position of this work", guardrail sentence | Remove `jacob2025promptshield` and `maiorano2026tradeoffs` from "report cost on datacentre GPUs"; keep only `ahmed2026reflexguard`, `saleem2026layered`, and state the other two report no timing / no hardware |
| F2 | HIGH | Related Work §"Position of this work", form/API sentence | Remove `kim2025llamaresttest` from the "count acceptance by the application" group; note separately that it scores semantic validity but has no non-LLM comparison |
| F3 | HIGH | Related Work §"Position of this work", output-side sentence | Replace "where a wrong value fails at once in the consuming tool" — `singh2026sob` scores exact leaf-value match and `li2026orderbench` reports unsafe *acceptance*; use "where the value is consumed immediately by a tool, an API or a renderer" |
| F4 | MEDIUM | Abstract, sentence 2 | "most of those rules are never enforced in code" → "many of those rules" |
| F5 | MEDIUM | §Method, Targets and generation conditions | "All three" is hand-typed → "The application accepted \R{newref.passes} of the \R{review.change} replacements. All of them were…" |
| F6 | MEDIUM | §Results RQ6, EMB paragraph | Re-attach the p95 caveat to EMB: "…EMB fails the bound on the review endpoint and the other two are undetermined." |
| F7 | LOW-MED | Abstract, detection sentence | Restore the qualifier: "violations of **objective** rules the application could enforce in code" |
| F8 | LOW-MED | §Discussion RQ1 | Re-subordinate the caveat: "…to inputs that an application would store, though the magnitude is sensitive to…" |
| F9 | LOW-MED | §Method, Analysis population | Drop the hand-typed "four groups" (wrong under `\reviewedfalse`) |
| F10 | LOW | §Discussion RQ4, last sentence | Remove the introduced "so"; revert to two sentences or use "which is consistent with" |
| F11 | LOW | §Background, terminology paragraph | "usually means adversarial intent" → "often" |
| F12 | LOW | §Method, Semantic ground truth | Restore "target $\times$ condition"; re-attach "up to 14 per stratum" to `\R{judge.supplement}` |
| F13 | LOW | §Method, Analysis population | Delete "either" (asserts an unestablished exclusivity) |
| F14 | LOW | Related Work §"Schema-valid but semantically wrong outputs" | Restore "deployable": "…rather than a deployable layer that is itself evaluated" |
| S1 | LOW-MED | §"Position of this work" | "where nothing fails" → "where nothing fails at submission time"; "is what allows the central question to be answered at all" → "is what lets us ask whether…"; "Three lines of work come closest" → "Of the work we reviewed, three lines come closest" |
| S2 | LOW-MED | Related Work §"Schema-valid but semantically wrong outputs"; §"Detection layers and their cost"; §"Position of this work" | Break the uniform short-sentence anaphora ("A ⟨X⟩ study finds…" ×3; "One/A ⟨X⟩ reports…" ×4; the rigid "They…/We…" three-beat template) |
| S3 | LOW | §Introduction ¶1 | Recombine the 10/7/11-word triad into one sentence |
| S4 | LOW | §Method, Semantic ground truth (51 words); §Conclusion future work (50 words) | Split each once |
| S5 | TRIVIAL | line 74 | `client-server` → `client--server` |

No em dashes, no banned buzzwords, no `??`, no `[RESULT PENDING]`; citations are clickable (72/72).

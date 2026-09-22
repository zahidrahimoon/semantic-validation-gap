# 04 — LITERATURE REVIEW (thematic synthesis) — Semantic Validation Gaps in AI-Driven Web Applications

Version: v0.3 · Status: DRAFT (Stage 6) · Date: 2026-09-20 · Basis: 20 reading notes (16 V4, 4 V3) in
`11_PAPERS/notes/`, plus abstract-level metadata (V2) for the remaining 50 included papers. Every factual
statement cites a Paper_ID; statements about V2-only papers are marked *(abstract)* and make no claim
beyond their abstracts. Locations (§/Table/page) are those recorded in the notes.

Terminology follows `GLOSSARY.md`: *structural validation* (what the schema encodes) vs *semantic
validation* (appropriateness for the application's purpose); *SV-SI* = structurally valid, semantically
invalid.

---

## Theme A — What structural validation can and cannot express

**Agreement.** Schema languages and validation libraries express per-value constraints (type, presence,
length, pattern, range, enumeration, format) and have well-understood formal limits: P06 gives JSON
Schema's formal grammar *(abstract)*, P04 formalises modern JSON Schema validation and shows its
complexity *(abstract)*, and P05/P19 (ER 2019/2021) describe empirically which constraints practitioners
actually encode in ~90k GitHub schemas *(abstract)*. Cross-field constraints are the recognised blind spot:
the Martin-Lopez/Segura line (P02, P03, P10, P14) catalogues *inter-parameter dependencies* — Requires,
Or, OnlyOne, AllOrNone, ZeroOrOne, Arithmetic/Relational — that OpenAPI "provides no support for"
*(abstract; P24 §3.2 p.7 adopts the same taxonomy and cites P02 as its source)*.

**Competing framings.** The security literature frames the same limit from the vulnerability side:
input-validation flaws admit "a concise and general specification" (sources/sinks) whereas logic
vulnerabilities do not, because "it is difficult (if not impossible) to define a general specification"
(P11 §1 pp.1–2). OWASP (G01, grey) names the pair *syntactic* vs *semantic* validation and files
"start date before end date" and "price within expected range" under semantic; our operational
definition differs only in placing developer-encoded ranges on the structural side (GLOSSARY.md).

**Methodological weakness.** Only one academic paper found uses "semantic-based user input
validation" in our sense (P08, Inderscience 2018, *abstract*; PDF requested). Three phrasings for
runtime schema validation in TypeScript/Zod and "business-rule validation" returned zero peer-reviewed
hits (02_SEARCH_STRATEGY.md §3, QF1). The practitioner phenomenon is documented mainly in grey
literature (G01, G04) — a gap in itself, but one that must be re-checked inside IEEE Xplore/ACM DL
before it is asserted (Stage 7, D-search 4).

## Theme B — Logic flaws: the classical form of "valid input, wrong meaning"

**Agreement.** Since 2010 the community has recognised that inputs which pass validity checks can
still violate application intent. P11 defines logic vulnerabilities as failures "to check for proper user
authorization or for the correct prices of the items in a shopping cart" (§2 p.3) and shows that
developers who "were very careful about checking user input for validity … often failed" on multi-path
cases (§5.1 p.15). P12 *(abstract)* derives logic-flaw tests black-box from behavioural patterns; P13
*(abstract)* detects client/server validation mismatches (parameter tampering); P07 *(abstract)* shows
REST APIs accepting structurally valid *extra* fields (mass assignment).

**Common mechanism.** Where semantic checks are automated, they are *invariant-based*: P11 infers
likely invariants over session variables and DB query parameters (Daikon) and model-checks them
(§4.3 pp.10–12); P14 *(abstract, FOUNDATIONAL)* coined "semantic anomaly detection" for
invariant violations in online data. The costs reported are offline analysis times (P11 Table 1 p.14:
0.5–4,576 min), not per-request overhead; P11 §6 p.16 cites runtime detectors with a "2–9%"
performance penalty *(secondary citation, not read)*.

**Recent turn.** 2025–2026 work applies LLMs to *find* logic vulnerabilities in code or process
documents (P15, P16 *(abstract)*), not to validate incoming data at runtime. Terminology remains
"logic vulnerability / business logic vulnerability (BLV)", never "semantic validation".

**Weakness for our purpose.** None of this literature considers *who* produces the input; all inputs
are attacker- or tester-crafted (P11 RQ3: NONE). Frequency by field type is never reported.

## Theme C — LLM-generated inputs for web forms and APIs: validity is measured as "accepted"

**Agreement.** LLMs are now the standard way to generate form and API inputs in testing research
(P20, P21, P22–P25, P29 *(abstract for P22, P23, P25, P29)*), and they outperform random and
type-based generators at *getting past* validation: FormNexus-GPT-4 reaches 83% form passing rate vs
QTypist 57%, static rule-based 23% and random Crawljax 3% (P21 Fig. 7 p.10); base GPT-4 alone 63%.
GPT-4 submits 98.48% of 14,454 generated inputs across 146 forms (P20 Table 2 p.17).

**Critical weakness: the oracle is the application.** Validity is operationalised as *successfully
submitted* (P20 §3.5 p.14: "If a response is caught, then it is considered a successful submission"),
*form submission state coverage* (P21 Def. 2 §3.2.2 p.7), or *HTTP 2xx vs 4xx* (P29 *(abstract)*;
P26 uses HTTP ≥500 as the robustness oracle). P20's authors concede that "some invalid data (such as
'user@' …) may also be successfully submitted due to a lack of exception-handling processes" and defer
"validation of such invalid tests" to future work (§5.4 p.29). P26 states its oracle is blind to "silent
failures (incorrect results with HTTP 200)" (§VII-C p.10). In other words, the field's headline
"validity" metric *is* our structural-pass event and counts SV-SI inputs as successes.

**Semantic validity, where measured, is low for small models.** P24 defines a semantically valid
value as "coherent with the API domain … 'Berlin' is a valid input … whereas 'dog' is not" (§4.2 p.13)
and reports base Llama3-8B at 22.94% semantically valid values even though the harness already
produces type-conformant values (Table 3 p.12); fine-tuning raises this to 72.44%. P21 finds GPT-4
"could only handle validations within single input fields" and failed cross-field constraints (§2 p.3),
and that ~26% of LLM-inferred constraints were not actually enforced by the application (§4.4 p.9).
P26 finds that prompt strategy, not model size, drives input diversity (Table VII p.7) and that
unguided models "generate syntactically valid inputs that do not exercise boundary conditions"
(§V-A-1 p.6).

**Baselines.** Only P21 compares LLM against random *and* rule-based inputs on the same forms;
P20 explicitly has no non-LLM baseline (§5.4 p.28); no paper includes human-written inputs as a
condition (P20 uses humans only to *rate* LLM outputs, Table 8 p.27). No paper reports a
per-field-type breakdown of semantic failures.

## Theme D — "Schema-valid but semantically wrong" is now an established LLM-output finding

**Agreement (2026, concurrent).** Five independent preprints report the same pattern for LLM
*outputs*: schema validity near 100% while semantic correctness is far lower. P33: 100% schema
validity for all four models in JSON-schema mode with semantic success 81.3% (GPT-OSS-120B),
30.7% (Qwen3-30B), and unsafe acceptances up to 41.7% (Table 1 p.4); constrained decoding does not
significantly improve semantics (Table 5 p.5). P34: "wrong-valid-schema rate" 88.9% in the main
suite and 52.0% in a calendar tool-call task where 102 of 104 failures are a single integer field
(Tables 3, 6, 7 pp.4–5). P35: JSON pass vs value accuracy gap "consistently 15–25 percentage
points" across 21 models; 17–31% of leaf values wrong despite valid structure (§6.2 p.7, §6.7 p.11).
P36: JSON Schema cuts interface misuse (5.39→3.72 invalid calls) but raises schema-valid "semantic
misuse" (0.93→3.03) (§7 p.8; null-result pilot). P37 (IBM production platform): structural success
up to 97.8% (Table III p.6) vs majority-vote semantic satisfaction ≤55.2% (Table V p.8); stubs "pass
structural validation but are non-executable" (§VI.D p.8). P39 extends the framing to LLM-generated
UI markup: 541 "semantic violations that pass automated checks" in 300 UIs (§3 p.3).

**Shared conclusions.** "Structured output is a necessary interface layer, not a substitute for domain
verification and fail-closed execution" (P33 Abstract p.1); "the concerning case is not merely invalid
JSON; it is wrong answer, valid schema" (P34 §2.1 p.2); "the scaffolding is correct; the content inside
it is not" (P35 §6.6 p.10). Where a semantic check exists it is the *oracle* (hand-coded verifier P33,
executable checker P34, source comparison P35, LLM judge P37/P39), not a deployed, evaluated layer;
only P39 validates its LLM judge (recall 80–92% on 721 injected faults, §3 p.3) and only P37 reports
cost (18.5–151.4 s and $0.003–$0.197 per run, Tables II–IV p.6).

**What differs from our setting.** These are LLM *outputs* consumed by APIs, tools or renderers. None
submits inputs to a web application's *input* surface, none has business rules as the reference, none
compares against non-LLM input sources, and none reports frequency by typed field (P33/P34 report
by task category or a single field). P39 explicitly leaves "full web applications with stateful
interactions" open (§5 p.4).

**Contradictions.** P34 finds hard-schema decoding *reduces* accuracy for sub-3B models (constraint
tax), while P33 finds it neutral for semantics and helpful only for schema validity of weak models;
both agree it does not fix semantics. P35 finds model size does not predict value accuracy (§6.6 p.10),
P37 finds the largest structural-success model has the lowest semantic score (Table III vs V) — model
scale is not a reliable lever, which matters for our CPU-only models.

## Theme E — Prompt injection: the security face of semantically inappropriate input

**Agreement.** LLM-integrated applications cannot separate data from instructions: "the data and
instruction modalities are not disentangled" (P43 §4.2 p.6), and "compromised data still has good text
quality and thus small perplexity" (P49 §6.3 p.1842). P43 gives the canonical taxonomy (four
injection methods × six threat classes, Fig. 2 p.3); P49 formalises attacks and benchmarks 10 LLMs,
finding "no existing prevention-based defenses are sufficient" and "no existing detection-based
defenses are sufficient" (§6.3 pp.1840–1842). Later empirical work confirms prevalence in the wild
(P47 *(abstract)*: >15,000 IPI instances on 11,700 pages) and in third-party chatbot plugins (P48
*(abstract)*).

**Form fields as the vector.** P45 is the closest to our setting: "an attacker can perform indirect attacks
by inserting malicious prompt fragments into the database through unsecured input forms" (Finding 3
§3.2.3 p.6); a job-description field, well-formed for its schema, later drives an UPDATE of another
user's e-mail (Listing 5 p.7). P46 *(abstract)* generalises this to SQLi/XSS/SSRF sinks. P45 concludes
that "sanitization and analysis of LLM inputs is a far more complex problem than the one employed to
counter SQL injections" (§7 p.11).

**Weakness.** Inputs are attacker-crafted; only free-text fields are exercised; frequency by field type
and comparison with benign-but-inappropriate inputs are absent. The literature treats injection as a
category distinct from data-validity problems, which is exactly the boundary our Alternative 5 tests.

## Theme F — Detection layers: accuracy is measured, cost mostly is not

**Agreement.** Input-side detectors — fine-tuned classifiers (P54, P55 *(abstract)*), embedding +
classical classifiers (P57 *(abstract)*, P61, P64 L1), small transformers (P65 *(abstract)*, P63's
Prompt Guard), and LLM judges (P45's LLM Guard, P62 *(abstract)*, P37, P39) — can detect
instruction-bearing or harmful text, and false-positive rate on benign traffic is the deployment
bottleneck: "existing schemes are unable to achieve such low FPRs" (P54 §1 p.1); PromptGuard blocks
2.91% of benign traffic at its default threshold (P54 Table 3 p.8); P56 *(abstract)* builds a benchmark
specifically for over-defence.

**Cost evidence is thin and GPU-bound.** P54 reports no timing at all (grep-confirmed in the note).
P61: embedding floor 35.27 ms, end-to-end P50 ≈41 ms but P99 285–541 ms on a Tesla T4 (Table VI
p.9). P64: 61.2 ms median total overhead on an A100, LLM inference excluded (Table 10 p.15). P60:
"Extra Delay" only at 0.5 s chart resolution on H800 GPUs (Fig. 2a p.12) and states evaluations
"frequently overlook … inference latency, GPU resource consumption, and utility" (§1 p.1). P63 is the
only head-to-head across tiers — regex 0.03 ms, multi-layer rules 2.50 ms, 86M transformer 74.41 ms,
LLM rail 1,470 ms (Table 3 p.8) — but its hardware is unspecified. P45 gives 0.4 s (8–20%) for an
LLM Guard in a web chatbot (§5.2.3 p.10). No paper measures a validator on CPU-only commodity
hardware, and none on structured request payloads rather than chat prompts.

**Trade-off framings we can adopt.** P60's security–efficiency–utility trifecta (§3.4 pp.4–5), P61's
recall/latency RES score (Eq. 7), P63's "operating point" view (§1 p.2), and P64's finding that
upstream filtering lowers downstream FPR (§5.6 p.15). Two caveats: LLM judges are themselves
injectable (P67 *(abstract)*; P45 §5.1.4 p.9), and low-FPR calibration is fragile out of distribution
(P63 §5.6 p.8: calibrated ≤1%, holdout 3.60%; P64 §6.2 p.18 same-distribution calibration).

**Semantic ≠ semantic.** P41 (survey) lists "semantic input validation" as a control missing from NIST/ISO
frameworks but defines it as a layer that "identifies potentially adversarial instructions" (§6 p.28);
P64 uses "semantic classifier" for intent. Neither addresses data-value appropriateness, which is
why our GLOSSARY entry records both meanings.

---

## Cross-theme comparison — Which existing work measures which part of our question?

*Question answered by the table: for each RQ, which read papers give DIRECT, PARTIAL or no evidence?*

| RQ | DIRECT | PARTIAL | None among read papers |
|---|---|---|---|
| RQ1 SV-SI exists | P33, P34, P35, P37 (LLM outputs); P45 (one form field) | P11, P20, P21, P24, P36, P39, P49 | — |
| RQ2 frequency by field type | — | P33/P34 (task category / single field), P39 (UI element type), P21 (form category) | P11, P20*, P26, P35, P36, P37, P41, P43, P45, P49, P54, P60–P64 |
| RQ3 LLM vs random / rule / human | — | P21 (LLM vs random vs rule, pass rate only), P24 (fine-tuned vs base vs RESTGPT), P26 (prompt strategies) | all others; **no paper includes human-written inputs** |
| RQ4 violation types | P33, P43, P45 (domain/attack taxonomies) | P24 (IPD taxonomy), P34, P35, P36, P39, P11 | P20 (generation failures only) |
| RQ5 semantic layer detection quality | P49 (input detectors, FPR/FNR), P45 (LLM Guard coverage) | P33/P34/P35/P37 (oracle only), P39 (validated judge), P54, P61, P63, P64 | P20, P21, P26 |
| RQ6 latency / overhead | P61 (T4), P63 (unspecified HW), P64 (A100), P45 (LLM Guard 0.4 s) | P24 (generator inference), P34 (+0.06 s decoding), P37 (end-to-end), P60 (0.5 s resolution) | P54, P49, P20, P21, P33, P35, P36, P39 |
| RQ7 detection vs performance trade-off | P63, P61, P60 (framework) | P34 (accuracy tax), P37 (cost), P49 (utility loss), P64 | others |

\*P20 gives SSR by *form category*, not field type.

## Synthesis statement

The literature establishes three things and leaves one. (1) Structural validation has known
expressive limits, especially for cross-field and domain rules (Theme A), and logic flaws that survive
careful input validation are a recognised class since 2010 (Theme B). (2) LLMs are good at producing
inputs that *pass* application validation, and the testing literature measures success exactly at that
point — while conceding the oracle admits semantically invalid inputs (Theme C). (3) For LLM
*outputs*, near-perfect schema validity coexisting with substantial semantic error is now replicated
across five 2026 studies (Theme D), and the security literature shows that well-formed free text can
carry executable intent that current filters miss at measurable but rarely reported cost (Themes E–F).

What no included work does is to take LLM-generated *inputs* to a web application's actual input
surfaces, judge them against explicit business rules rather than the application's own acceptance,
compare them under controlled conditions with random, rule-based and human-written inputs by
field type, and evaluate deployable semantic validators for both detection quality and CPU-side
request latency. Stage 7 records this as candidate gaps with disconfirmation searches.

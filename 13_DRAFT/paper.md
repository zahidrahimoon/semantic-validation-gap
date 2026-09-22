# Structurally Valid, Semantically Wrong: Measuring the Validation Gap for AI-Generated Web Inputs

Zahid Rahimoon, Independent Researcher

> Working copy. The authoritative manuscript is `paper.tex` (IEEEtran, compiles to `paper.pdf`, 8 pages, 65 references). Citation keys resolve against `12_REFERENCES/references_verified.bib`.


## Abstract

Runtime schema validation is the standard defence at a web application's input boundary. Libraries
such as Zod or JSON Schema check an input's type, presence, length, pattern, range, enumeration and
format, but they cannot express whether a well-formed value is *appropriate* for the field it
was submitted to. Recent work has established that large language models (LLMs) produce outputs that
are schema-valid yet semantically wrong; whether the same holds for values *submitted to* a web
application, and whether such values are more common from LLMs than from humans or random
generators, has not been measured. This paper presents a pre-registered protocol and its
implementation, together with the artefacts needed to execute it: a frozen Next.js testbed with 39
input fields, an explicit reference of 43 business rules of which only five are enforced in code, and
a harness that submits inputs from seven generation conditions through the application's real HTTP
validation path. Semantic validity is decided independently of both the application and the
generator, by deterministic rule functions for 18 objectively decidable rules, a judge model from a
different family than the generator, and human annotation of a stratified sample. We further specify
an evaluation of five candidate semantic validation layers --- rules, embedding classification, a
small language model, a hybrid, and an LLM judge --- measured for detection quality at a bounded
false-positive rate and for added request latency on commodity CPU hardware. All quantitative
results are marked `[RESULT PENDING: experiment]` and will be reported without alteration, including negative
outcomes.

**Index Terms** — 
input validation, semantic validation, business logic, large language models, web application
security, software testing, empirical study

## Introduction

A web application accepts an input only after it passes validation. In the current JavaScript and
TypeScript ecosystem that validation is usually a schema: a declarative object that states the type,
required-ness, length, pattern, numeric range, allowed enumeration and format of every field, checked
at runtime on the client, again on the server, and finally by database constraints. Such schemas are
well understood, formally characterised  [pezoa2016foundations, attouche2023jsonschema], and
empirically studied at scale  [baazizi2021usagenot]. They are also, by construction, unable to
state anything that depends on the application's purpose: that a promotional code must apply to the
category of the item being bought, that a workshop must start in the future, that a review must be
about the workshop it is attached to, or that a support ticket must describe a problem with this
platform rather than instructions addressed to the assistant that reads it.

That limitation is not new. Felmetsger et al.\ separated input-validation flaws, which admit a
general specification, from logic vulnerabilities, which do not, and observed developers who
validated input carefully yet still shipped logic flaws  [felmetsger2010waler]. Subsequent work
detected such flaws from behavioural traces  [pellegrino2014logicflaws], from client--server
validation mismatches  [bisht2010notamper], and from over-permissive API
payloads  [corradini2023massassignment]. What has changed is *who writes the input*.

Inputs are now routinely produced by language models: form auto-fill, agents operating web
applications on a user's behalf, synthetic test data, and generated content. Such values are fluent
and well-formed by construction, which makes them unusually likely to satisfy a schema. A body of
2026 work shows that this surface correctness does not carry over to meaning. Schema-constrained
ordering agents reach full schema validity while semantic success falls as low as a few per cent,
with unsafe acceptances in double digits  [li2026orderbench]. Hard schema decoding for small
models produces a measured ``constraint tax'': validity rises while executable accuracy
collapses  [ray2026constrainttax]. Across twenty-one models, a consistent gap of fifteen to
twenty-five percentage points separates schema compliance from value accuracy  [singh2026sob].
Schema-first tool interfaces reduce interface misuse while increasing schema-valid semantic
misuse  [sigdel2026schemafirst]. In a production enterprise platform, the model with the highest
structural success has among the lowest semantic satisfaction  [wrenn2026enterprise]. The same
framing has been carried to generated user interfaces, where violations that pass automated checkers
are counted directly  [calo2026semanticgap].

All of that evidence concerns model *outputs* consumed by an API, a tool or a renderer. The
input boundary of a web application is different in three ways that matter. First, a reference for
what is semantically correct exists in principle, because the application has business rules, even
when they are not written down. Second, values that pass are *persisted* and shown to other
users or read by an assistant, so a semantic error does not fail loudly; it becomes data. Third,
there are non-LLM producers of input to compare against, which is what decides whether the
phenomenon is about AI at all.

The web testing literature measures LLM-generated inputs for exactly the wrong outcome for this
question. Validity is operationalised as *accepted by the application*: successfully submitted,
covering a submission state, or answered with a 2xx status  [li2026webformtest, alian2024formnexus].
Authors of the largest such study concede that incomplete e-mail addresses were counted as successes
because the application lacked the corresponding check, and defer the validation of those tests to
future work  [li2026webformtest]. A robustness study using status codes as its oracle states
that it cannot see failures that return success  [tigulla2026robustness]. Where semantic
validity of generated API values *is* measured, a base eight-billion-parameter model produces
domain-coherent values under a quarter of the time even though the harness already guarantees
type conformance  [kim2025llamaresttest].

This paper does not claim to discover that schemas miss semantics. It contributes a protocol,
artefacts and a measurement design for the input boundary, and its contributions are ordered by how
much of them is new:

  - **C3.** A controlled comparison of seven input-generation conditions --- valid human,
  random structurally valid, rule-based adversarial, LLM without field context, LLM with field
  context and rules, boundary, and benign-unusual --- on one shared structural and semantic outcome.
  To our knowledge, based on a search of IEEE Xplore and ACM Digital Library metadata, arXiv,
  Semantic Scholar and Crossref up to 20 September 2026, no prior study includes a human-written
  condition alongside random and rule-based conditions with a semantic outcome.
  - **C4.** An evaluation of five deployable semantic validation designs against business-rule
  validity rather than adversarial intent, including a benign-unusual condition that measures how
  often each design rejects legitimate input.
  - **C5.** A detection-versus-performance trade-off measured on commodity CPU hardware in
  the request path, a regime absent from the guardrail literature, which reports either no timing at
  all  [jacob2025promptshield] or datacentre-GPU figures  [ahmed2026reflexguard, saleem2026layered, wang2026sokguardrails].
  - **C1.** An empirical characterisation of the structurally-valid-but-semantically-invalid
  rate at a web application's input surface, extending the output-side
  findings  [li2026orderbench, ray2026constrainttax, singh2026sob, wrenn2026enterprise] rather than
  rediscovering them.
  - **C2.** A taxonomy of semantic-gap types organised by input-field category, with
  measured frequencies.

Section background fixes terminology. Section related positions the work.
Section rq states the research questions and hypotheses, which were frozen before any data
were generated. Sections method to layer describe the method, the testbed and
generation framework, and the candidate validation layers. Section results reports results;
at the time of writing it is populated with explicit placeholders. Sections threats and
limitations state threats and limitations, and Section conclusion concludes.

## Background and Terminology

We use two terms throughout, defined operationally so that each input receives an unambiguous
outcome.

**Structural validation** is every check encoded in the application's runtime schema --- type,
presence, length, pattern, numeric range, enumeration, format --- together with database
constraints. It is what a schema library can express without referring to application state or to
other records.

**Semantic validation** is the question of whether a structurally valid value is appropriate for
the application's purpose: contextual correctness, consistency across fields, domain plausibility,
compliance with business rules, and safety for downstream consumers such as an LLM component.

An input that passes structural validation and violates at least one business rule is called
**SV-SI** (structurally valid, semantically invalid). The *conditional* SV-SI rate is the
share of SV-SI inputs among those that pass structural validation; the *unconditional* rate is
the share among all inputs submitted. The conditional rate is the primary outcome, because a
generator that simply produces more well-formed values would otherwise appear more dangerous merely
by passing more often.

Terminology in the literature is not settled, and the divergence is worth stating. The OWASP Input
Validation Cheat Sheet distinguishes *syntactic* from *semantic* validation and places
range checks such as ``price within expected range'' on the semantic side; we keep a range that the
developer wrote into the schema on the structural side, because the schema enforces it, and treat
only unenforced plausibility as semantic. Security research generally speaks of *logic
vulnerabilities*  [felmetsger2010waler, pellegrino2014logicflaws] or *business logic
vulnerabilities*  [metin2025blv]; API testing research speaks of *inter-parameter
dependencies* for the cross-field subset  [martinlopez2022idl, martinlopez2019catalogue]; one
older paper uses ``semantic-based user input validation'' in our
sense  [hanna2018semanticvalidation]. In LLM work the same adjective is used for adversarial
intent: a recent survey lists ``semantic input validation'' as a missing control while defining it as
a layer that identifies adversarial instructions  [singh2026injectioninteraction]. Our usage
concerns data appropriateness, which includes but is not limited to that case.

## Related Work

### Limits of structural validation

JSON Schema has a formal semantics and a known complexity  [pezoa2016foundations, attouche2023jsonschema],
and empirical studies describe which constraints practitioners actually
encode  [baazizi2021usagenot]. The recognised expressive gap is cross-field: inter-parameter
dependencies of the form *requires*, *or*, *only-one*, *all-or-none*,
*zero-or-one* and arithmetic relations cannot be stated in an OpenAPI
document  [martinlopez2022idl, martinlopez2019catalogue], which has motivated generating
server-side validation code from a separate dependency
language  [barakat2023idlgen]. Schema-derived fuzzers inherit the same
boundary  [hatfielddodds2021schemathesis]. Surveys of input-validation vulnerabilities remain
organised around injection classes  [fadlalla2023inputvalidation].

### Logic flaws: the classical form of the problem

Waler inferred likely invariants over session state and database query parameters and model-checked
them, finding previously unknown logic vulnerabilities in real
applications  [felmetsger2010waler]. Black-box behavioural patterns  [pellegrino2014logicflaws],
parameter-tampering analysis  [bisht2010notamper], mass-assignment
testing  [corradini2023massassignment] and excessive-data-exposure
fuzzing  [pan2024edefuzz] detect related classes. ``Semantic anomaly detection'' in this
invariant sense predates the web literature  [raz2002semanticanomaly]. Recent work applies LLMs
to *find* business-logic vulnerabilities in code  [metin2025blv, armillotta2026antaeus],
surveyed among other security uses  [sheng2025llmsecsurvey]. In all of it, inputs are crafted by
an attacker or a tester, never compared across producers, and costs are reported as offline analysis
time rather than per-request overhead.

### LLM-generated inputs for forms and APIs

LLMs outperform random and type-based generators at producing inputs that applications accept: on
thirty real forms, an LLM-driven approach reaches a form passing rate of 83 % against 57 % for a
rule-based generator and 3 % for random crawling  [alian2024formnexus]; across 146 forms and
eleven models, the best model submits over 98 % of its generated
inputs  [li2026webformtest]. The oracle in each case is the application's own acceptance, and its
authors are explicit that this admits semantically invalid
values  [li2026webformtest, tigulla2026robustness]. Where semantic validity is measured
separately, a base model reaches 22.9 % domain-coherent values against 72.4 % after
fine-tuning  [kim2025llamaresttest]; related work mines input constraints from
specifications  [kim2024restgpt, huynh2024constraints], studies text input for mobile
interfaces  [cui2024guitextinput], benchmarks form-filling
agents  [li2025formfactory], and measures schema validity of synthetic
records  [mishra2026structuredsynthetic]. One study compares LLM against both random and
rule-based inputs  [alian2024formnexus]; none adds a human-written condition, and none reports a
per-field-type semantic outcome.

### Schema-valid but semantically wrong outputs

Five independent 2026 studies report the pattern for model outputs. OrderBench separates syntactic
validity, schema validity and semantic success and finds full schema validity alongside semantic
success as low as a few per cent  [li2026orderbench]. The constraint-tax study measures accuracy
lost when hard schema decoding replaces prompting, with almost all failures concentrated in a single
integer field  [ray2026constrainttax]. A multi-source benchmark finds a persistent gap between
JSON pass rate and value accuracy  [singh2026sob]. A controlled tool-API study separates
interface misuse from semantic misuse and finds schemas shift failures from the former to the
latter  [sigdel2026schemafirst]. A production study finds the most structurally successful model
emits workflows that pass validation and cannot execute  [wrenn2026enterprise]. Taxonomies of
structured-output error  [song2026structuredoutput], cross-column constraint
repair  [zhao2026constraintaware] and neuro-symbolic verification  [sigloch2026neurosymbolic]
develop the theme. In every case the semantic check is the oracle rather than an evaluated,
deployable layer, and the setting is output rather than input.

### Semantically inappropriate input as a security problem

Indirect prompt injection established that models do not separate data from
instructions  [greshake2023indirect], that attacks on deployed applications
succeed  [liu2023houyi, kaya2026chatbotplugins], and that surface quality checks do not
distinguish compromised from clean text  [liu2024formalizing]. The closest work to our setting
shows an attacker inserting prompt fragments through an ordinary form field, which later drives a
database write affecting another user, and concludes that sanitising LLM inputs is a harder problem
than countering SQL injection  [pedro2025p2sql]; the pattern generalises to classic web
sinks  [tsigkopoulos2026webexploitation] and occurs in the wild at
scale  [khodayari2026ipiwild]. Benchmarks  [yi2025bipia, evtimov2025wasp, liu2025wainjectbench]
and a journal study  [milani2026ipi] extend coverage. Inputs remain attacker-crafted and, with
one exception, confined to free-text fields.

### Detection layers and their cost

Input-side detectors span fine-tuned classifiers  [jacob2025promptshield, liu2025datasentinel],
embedding classifiers  [ayub2024embedding, ahmed2026reflexguard], small
transformers  [datta2025javelinguard, lakara2026fence], intrinsic-feature
probes  [shi2025promptarmor, akinrele2026regime] and LLM
judges  [le2026llmjudge, rebedea2023nemo]. False-positive rate on benign traffic is the
deployment constraint, and purpose-built over-defence benchmarks
exist  [li2024injecguard]. Cost evidence is thin and GPU-bound: a detector presented as
deployable reports no timing at all  [jacob2025promptshield]; an embedding guardrail reports a
35 ms embedding floor with tail latencies in the hundreds of milliseconds on a datacentre
GPU  [ahmed2026reflexguard]; a layered framework reports a 61 ms median on an A100 with model
inference excluded  [saleem2026layered]; a systematisation reports extra delay only at
half-second resolution and states that cost and utility are routinely
overlooked  [wang2026sokguardrails, zizzo2025guardrails, kumar2025nofreelunch]. One study compares
tiers head to head --- regex, transformer classifier, LLM rail --- but does not state its
hardware  [maiorano2026tradeoffs]. LLM judges are themselves
injectable  [shi2024judgeattack]. No study measures a validator for data appropriateness, on
structured request payloads, on CPU.

## Research Questions and Hypotheses

The following were frozen, together with the primary metrics and the analysis plan, before any
experimental input was generated. Prompt family P5 (injection) is excluded from all primary rates and
analysed separately.

  - **RQ1.** Can AI-generated inputs satisfy structural validation while violating
  business expectations? *H1:* the conditional SV-SI rate of LLM conditions has a 95 % Wilson
  confidence interval whose lower bound exceeds 0.05.
  - **RQ2.** How does this vary across field categories? *H2:* conditional rates
  differ across the seven categories, with free-text and cross-field highest.
  - **RQ3.** How do AI-generated inputs compare with human, random, rule-based and boundary
  inputs? *H3a:* context-aware LLM exceeds random; *H3b:* context-aware LLM exceeds
  benign-unusual human; *H3c:* context-free LLM exceeds random.
  - **RQ4.** Which violation types dominate? Exploratory.
  - **RQ5.** Can an added semantic layer detect SV-SI inputs? *H5:* at least one
  non-judge design reaches recall \geq 0.70 at a false-positive rate \leq 0.05 on held-out
  fields.
  - **RQ6.** What does it cost, and what is the trade-off? *H6:* rule and embedding
  designs add at most 50 ms to p95 request latency while an LLM judge adds at least 1000 ms.

## Experimental Methodology

### Subject under study

The subject is a purpose-built Next.js 16 application (App Router, TypeScript) using Zod for
validation on both client and server, Prisma with SQLite for persistence, and a local Ollama runtime
for two AI-facing features: synchronous triage of support tickets and a booking assistant. It has
seven input surfaces and 39 fields. Business rules are enumerated in a reference file of 43 rules, of
which five are enforced in code and 38 are not, a profile chosen to resemble common practice in small
production applications. The application and the rule reference were committed and tagged before any
input was generated, and the commit hash is recorded with every run, so that the subject cannot be
adjusted in response to a result.

A purpose-built subject is a deliberate trade: real applications do not enumerate their business
rules, and without a complete reference the semantic outcome has no ground truth.
Section threats treats the resulting external-validity threat.

### Experimental targets

Seventeen targets covering 22 fields were selected to represent every field category with at least
two members, to include every directly AI-facing field, and to include five cross-field pairs whose
rule is a relation between members. Pure identifiers and fields with no statable semantic rule were
excluded. Each target carries a purpose description, its applicable rule identifiers, and the exact
structural constraints transcribed from the frozen schema.

### Generation conditions

Seven conditions produce values for each target. **A** valid human-written; **B** random
but structurally valid, generated from a seeded pseudo-random source; **C** rule-based
adversarial, one hand-written template per unenforced rule; **D** LLM given only the field name
and structural constraints; **E** LLM additionally given the field's purpose and its business
rules, and asked for structurally valid values; **F** boundary values at schema edges and
character-level variants; **G** benign but unusual human-written values, which measure how often
a validator rejects legitimate input. Conditions A and G were prepared before any LLM generation for
the main experiment.

### Prompt families

Seven prompt families are versioned as files and hashed: normal, semantically unusual, business-rule
violation, context manipulation, injection, boundary, and Unicode or normalisation variation. The
injection family is used only for the three directly AI-facing targets. Condition D receives the
constraints only; condition E additionally receives purpose and rules. Model identifier and digest,
temperature, nucleus parameter, seed, token budget, prompt file and prompt hash are recorded for every
generated value, and values are stored exactly as returned. Generation failures are counted and never
silently regenerated.

### Structural measurement

Each input is measured twice. The harness imports the same schema object the application uses and
records the schema-only verdict, then submits the input over HTTP to the real route handler against a
freshly seeded database and records the status, the service-level errors and the elapsed time. The
structural outcome is the application's own decision. Separating the two captures the case where a
value satisfies the schema and is then rejected by one of the five enforced business checks, which is
a structural rejection at the service layer rather than a semantic gap. The pilot confirmed this
separation is load-bearing: every randomly generated promotional code satisfied the schema pattern
and was rejected by the service as unknown.

### Semantic ground truth

Semantic validity is decided independently of the application and of the generator, from three
sources. First, deterministic rule functions implement the 18 rules classified in advance as
objectively decidable from the input and database state. Second, a judge model from a different
family than the generator applies a per-rule rubric consisting of the field purpose, the rule text and
the submitted value; it never sees the generation condition, the prompt family, or whether a
violation was intended. Third, the researcher annotates a stratified sample of 200 structurally valid
inputs, blind to condition, with 20 items repeated to estimate intra-annotator agreement. A rule
classified as objective is decided by its rule function; otherwise human annotation takes precedence
where present, and the judge decides the remainder. Where no source yields a verdict the input is
labelled ambiguous rather than forced. Agreement between judge and human is reported with Cohen's
κ, overall and by rule class; if agreement on judgement rules falls below 0.4 those results
are reported as exploratory.

### Statistical analysis

Rates are reported with Wilson 95 % intervals. H1 is evaluated on the interval's lower bound. H2
uses a χ² test of independence with Cramér's V. H3a--c use three pre-declared Fisher exact
tests with Holm correction and odds ratios; all other pairwise contrasts are exploratory and labelled
as such. Detection metrics use stratified bootstrap intervals over 1000 resamples. Latency
comparisons use Mann--Whitney U with Cliff's δ. Each LLM condition is repeated three times
with fixed seeds, rates are reported per run as well as pooled, and a single-run sensitivity analysis
is reported, because run-to-run variation was observed on this hardware even at low temperature.

## Input Surface and Test Generation Framework

The harness is a TypeScript package that writes append-only JSON Lines into an immutable run folder
per experiment, with a manifest recording the subject commit, model digests, seeds, prompt hashes and
command line. Each generated record carries its condition, prompt family, model, digest, temperature,
seed, run index and the generator's intended category, so that a value's provenance is recoverable
from the data alone. Each measurement record carries the schema verdict and errors, the HTTP status
and service errors, and both timings. Each label record carries the per-rule verdict with its source,
the violated rules split by rule class, and the final label. Raw folders are never modified by
analysis; every table and figure is regenerated from them by scripts.

## Semantic Validation Approach

Five designs are evaluated as a drop-in check executed after structural validation and before
business logic, all exposing the same interface. **R** packages the objective rule functions as
middleware and is a floor rather than a competitor, since it cannot address judgement rules.
**EMB** embeds the value with a local embedding model and classifies it against the field's
purpose and exemplars. **SLM** prompts a sub-two-billion-parameter model with the rule text.
**HYB** runs R first and EMB on the remainder. **JUDGE** prompts the same
four-billion-parameter model used for generation and serves as a reference point; because it shares a
family with the generator this is disclosed rather than hidden, and it is additionally tested against
injection inputs to probe whether the judge can itself be redirected  [shi2024judgeattack].

Evaluation is leave-fields-out across five folds: thresholds are chosen on training-fold fields at a
false-positive rate of at most 0.05 on valid inputs and applied to held-out fields, so no design is
tuned on the fields it is scored on. Designs are compared on recall at that bounded false-positive
rate, with precision, F_1 and per-rule-class coverage reported alongside. The layer is designed and
evaluated only after the baseline measurement establishes whether a gap exists; if the conditional
SV-SI rate is negligible, this section reports the cost of layers with nothing to catch.

## Results

**No experimental results exist at the time of writing.** The generation, measurement and
ground-truth pipeline has been implemented and exercised end to end on a calibration pilot of 118
inputs across four targets, which is used only to verify the harness and to estimate throughput, and
whose numbers are deliberately not reported as findings. The full corpus has not been generated. Every
quantity below is a placeholder and will be replaced by the value the experiment produces.

### Structural and semantic outcomes (RQ1)

`[RESULT PENDING: E1 --- structural pass rate and conditional and unconditional SV-SI rate per condition, with
Wilson 95 % intervals; decision on H1]`

### Variation across field categories (RQ2)

`[RESULT PENDING: E1 --- conditional SV-SI rate per field category; χ² and Cramér's V; decision on H2]`

### Comparison of generation conditions (RQ3)

`[RESULT PENDING: E2 --- pairwise conditional SV-SI contrasts with odds ratios and Holm-corrected p values
for H3a, H3b, H3c; E2b --- rates by model size and temperature]`

### Violation types (RQ4)

`[RESULT PENDING: E1 --- distribution of violated rules and rule classes by condition and category; share of
AI-facing violations attributable to injection prompts]`

### Ground-truth agreement

`[RESULT PENDING: E1 --- Cohen's κ between judge and human annotation, overall and by rule class; share
of ambiguous labels]`

### Detection quality of the semantic layer (RQ5)

`[RESULT PENDING: E3 --- recall at a false-positive rate of at most 0.05 on held-out fields, with precision,
F_1 and per-rule-class coverage for each of R, EMB, SLM, HYB and JUDGE; decision on H5]`

### Overhead and trade-off (RQ6)

`[RESULT PENDING: E4 --- added p50, p90, p95 and p99 latency, throughput, CPU and memory for each
configuration against structural-only validation; decision on H6; Pareto front of recall against
added p95 latency]`

## Discussion

This section answers each research question explicitly once the corresponding results exist.
`[RESULT PENDING: Discussion --- one subsection per research question, the status of each of the six
alternative explanations, and any unexpected finding]`

Six alternative explanations were specified in advance and each is addressed by a designed
comparison rather than by argument. That the phenomenon is caused by weak business rules rather than
by AI is examined by reporting the rule-based adversarial condition as a designed upper bound and by
reporting the five enforced rules separately. That random inputs produce the same effect is examined
by H3a. That unusual human inputs behave the same way is examined by H3b, subject to the provenance
qualification recorded with the data. That the phenomenon is confined to free-text fields is examined
by the per-category breakdown. That the study is prompt-injection research under another name is
examined by excluding the injection family from all primary rates and reporting it separately, and by
the fact that only three of seventeen targets are directly AI-facing. That semantic validation is too
expensive to deploy is the subject of RQ6, where a negative answer is a result rather than a failure.

## Threats to Validity

**Internal validity.** Labelling error is the main threat. Judgement rules require an
interpretation of meaning, and agreement on such judgements can be low even between humans: a related
study reports human-to-human agreement of roughly 0.24 on semantic accessibility
judgements  [calo2026semanticgap]. Three independent sources, a declared split between
objectively decidable and judgement rules, an explicit ambiguous class, and reported κ are the
mitigations; a low κ downgrades the affected results to exploratory. Model non-determinism is
mitigated by three repeated runs with fixed seeds and by reporting per-run variation. Implementation
error in the harness is mitigated by measuring the schema verdict and the HTTP verdict separately,
which cross-checks the two paths, and by typechecking against the application's own schema objects.

**External validity.** The subject is one application in one domain, built by the researcher,
with one enforcement profile; results may not transfer to other stacks, domains or teams. Generation
uses quantised open models of 0.6 to 8 billion parameters on CPU, and evidence that model scale does
not predict semantic quality  [singh2026sob, wrenn2026enterprise] cuts both ways: it weakens the
assumption that frontier models would behave better, and it prevents any claim that they would behave
the same. The choice of Next.js is a property of the environment, not a claim of the paper.

**Construct validity.** Whether an input is semantically invalid is defined as violating a rule
in a frozen, enumerated reference. That reference is an operationalisation, not a ground truth about
the domain; a different team would write different rules. The rules were frozen before any input
existed, which prevents adjustment to results, and every rule identifier is reported with the
violations attributed to it so that a reader can discount rules they disagree with.

**Conclusion validity.** Cell sizes support tests at condition and category level; interactions
between field and condition are treated as exploratory throughout. Pooling three runs inflates the
sample for LLM conditions, which is addressed by per-run rates and a single-run sensitivity analysis.
Multiple comparisons are Holm-corrected for the three pre-declared contrasts, and all other
contrasts are labelled exploratory.

## Limitations

Beyond the threats above, four limitations are inherent to the present design. The study measures a
single application, so prevalence figures are properties of that subject rather than of web
applications in general. Latency figures are properties of one four-core CPU without a GPU and do not
transfer to other hardware, though they are the regime a small deployment actually faces. The LLM
judge design shares a model family with the generator, which is disclosed; the judge used for ground
truth does not. Finally, at the time of writing the human-written conditions were drafted by an AI
assistant at the researcher's request and await researcher review; until that review is recorded, the
comparison against human inputs is a comparison against a second AI condition, hypothesis H3b is
exploratory, and the alternative explanation that unusual human inputs behave similarly is not ruled
out. This is recorded in the artefact provenance file and in the deviation log rather than being
resolved by assertion.

## Conclusion and Future Work

Schema validation answers whether an input is well formed, not whether it belongs. For model outputs
the distance between those two questions has been measured repeatedly and found large. This paper
supplies what is needed to measure it at a web application's input boundary, where the value is
persisted rather than merely consumed: a frozen subject with an explicit business-rule reference, a
harness that records the schema decision and the application's decision separately, a ground-truth
protocol independent of both the application and the generator, seven generation conditions including
non-AI and human ones, and a specification for evaluating five deployable validation designs on
detection quality and request-path cost.

`[RESULT PENDING: Conclusion --- the study's actual findings, stated no more strongly than the evidence
supports, including any negative result]`

Future work, independent of the outcome, includes repeating the protocol on an open-source
application to address the external-validity threat, extending the field taxonomy to stacks other
than Zod and Prisma, and examining whether a semantic layer trained on one application's rules
transfers to another's.

## Acknowledgment

The literature search, verification, drafting, harness implementation and analysis scripting for this
work were performed with the assistance of an AI system under the author's direction; the research
claims and the final manuscript are the author's responsibility. A full disclosure of AI use is
provided with the artefacts.


## References

See `paper.pdf` for the formatted reference list (65 entries, all V2 or higher).

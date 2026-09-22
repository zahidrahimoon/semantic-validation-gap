# EVIDENCE DIGEST — input to Stage 6 synthesis

Project: semantic-validation-gap · Compiled: 2026-09-20 · Source: ONLY the reading notes in `11_PAPERS/notes/` (P11, P20, P21, P24, P26, P33, P34, P35, P36, P37, P39, P41, P43, P45, P49, P54, P60, P61, P63, P64). No PDF was re-opened and nothing was added from memory. Every bullet cites a Paper_ID and the location the note gives. Numbers marked "approx." were read from figures by the note author, not printed in text.

Verification levels (from note headers): V4 full — P11, P20, P21, P24, P33, P34, P36, P37, P39, P43, P45, P49, P54, P61, P63. V3 partial — P26, P35, P41, P60, P64.

RQ key used throughout: RQ1 structural-pass-but-semantic-fail · RQ2 frequency by field type · RQ3 LLM vs random/rule/human inputs · RQ4 violation types · RQ5 semantic-layer detection · RQ6 latency/overhead · RQ7 trade-off.

---

## Theme A — Structural validation & schema limits

- **P11** (Abstract p.1; §1 pp.1–2): input-validation flaws (XSS, SQLi) admit a general sources/sinks specification; application logic flaws do not, because no general specification of intended behaviour exists.
- **P11** (§5.1 p.15): student developers who were careful "checking user input for validity" still shipped logic flaws on multi-path cases — validity checks present, logic violations remain.
- **P11** (§5.2 p.15; §4.3.4 pp.12–13): checks implemented via regular expressions or database queries are not recognised by the analysis — regex-style validators sit outside the logic-flaw model.
- **P20** (§4.3 p.16): SSR is defined as alignment with "the expected input and structural requirements of the web forms"; validity is operationalised structurally.
- **P20** (§3.5 p.14): success oracle = any server response caught; a response carrying a validation error could count as success (OURS in note).
- **P21** (§3.2.2 p.7, Definition 2): a valid input set is one the application accepts (absence of error feedback); validity is defined by application behaviour, not an external semantic criterion.
- **P24** (§3.4 p.10): default ARAT-RL values are "chosen randomly but in conformance with the expected types"; LMs are triggered only after repeated 4xx — type conformance alone is insufficient for acceptance.
- **P26** (Sec. VI-E p.9): LLM-generated XSS payloads and control characters "did not trigger robustness failures because the SUTs' input parsers rejected them" — parser-level structural checks are strong.
- **P26** (Sec. VII-C p.10): HTTP ≥ 500 oracle cannot detect "silent failures (incorrect results with HTTP 200)".
- **P33** (§1 p.1): structured-generation success criterion "is usually structural: can the output be parsed, and does it match the declared type-level shape?"
- **P33** (§6 p.6): "A JSON Schema can ensure that items is an array and quantity is an integer. It cannot ensure that a requested allergen conflict was rejected."
- **P34** (§1 p.1; §7.1 p.6; §7.5 p.7): product code treats parseability as the execution gate; "Parseability is a transport property, not a task-success metric"; treat schema validity as an interface SLO.
- **P35** (Sec. 6.6 item 3 p.10): 16 of 21 text models score ≥ 96% on Path Recall, Structure Coverage and Type Safety yet Value Accuracy is 0.693–0.830 — structural metrics mask value errors.
- **P36** (§3 p.3): separates interface validity (JSON, required fields, types, enums, bounds) from execution validity (runtime preconditions) and holds the latter constant.
- **P37** (§I p.1; §V p.5): "structural success" = schema compliance + validation checks + UI rendering; explicitly does not measure whether workflows fulfil intent.
- **P39** (§1 p.2): Axe-core marks an image compliant if an alt attribute exists "regardless of whether that attribute actually describes the image meaningfully".
- **P41** (Sec. 5.5.3 p.17): structured output generation with JSON schemas "further reduces the risk of unsafe output interpretation" — presented as a mitigation, with no mention of value-level correctness.
- **P49** (§5.2 p.1837; §6.3 p.1842): response-based detection (label-set membership, a format check) fails when injected and target tasks are of the same type.
- **P63** (Sec 4.2 p.4): Layer 2 validates LLM output JSON shape `{title, description, buggedCode, correctCode}` plus lengths/required keys and XSS patterns — structural output validation, not semantic input validation (OURS in note).

## Theme B — Business-logic flaws / semantic anomaly

- **P11** (§2 p.3): logic vulnerabilities defined as failures "to check for proper user authorization or for the correct prices of the items in a shopping cart"; example of a single-use coupon applied arbitrarily often (§1 p.2).
- **P11** (§4.3.1 p.10; Fig. 3 p.9): a likely invariant (`session.User.isAdmin == true`) is reported only when at least one supporting path and one violating path exist — heuristic for real vs spurious invariants.
- **P11** (§4.3.2 pp.11–12; Figs. 4–5 p.11): equality invariants linking session data to DB query parameters are always significant; tampered hidden `username` field and another user's valid post id both exploit valid values.
- **P11** (§5 p.13; Table 1 p.14): 29 previously unknown vulnerabilities in four real apps and 18 in eight Jebbo apps; GIMS 23 vulnerabilities / 2 false positives; JspCart 5 / 0. Note flags per-row sum 30 vs text 29.
- **P11** (§5.1 p.14): GIMS had 14 servlets reachable unauthenticated (missing `return` after redirect) and 9 admin pages without role checks; JspCart 4 of 45 admin pages missing the admin check.
- **P11** (§5 p.13): all vulnerabilities found at exploration depth ≤ 3; doubling to depth 6 found nothing more.
- **P11** (§5.1 p.14): JaCoB — two real flaws missed because the inferred specification had no discrepancy with the code (false negatives by construction).
- **P11** (Table 1 p.14): analysis cost 0.5–4,576 minutes per application (offline, not request overhead).
- **P21** (§2 p.3): large-context GPT-4 "could only handle validations within single input fields", failing cross-field semantic constraints (same origin/destination, return before departure).
- **P21** (§4.4 p.9): ~26% of GPT-4-inferred constraints were invalidated (not enforced by the form); Llama 2 ~76% — LLMs over-infer business rules.
- **P24** (§4.2 p.13, citing ARTE [2]): "a semantically valid input must be coherent with the API domain … 'Berlin' is a valid input … whereas 'dog' is not."
- **P24** (§3.2 p.7; §2.2 p.5): inter-parameter dependencies (Requires, Or, OnlyOne, AllOrNone, ZeroOrOne, Arithmetic/Relational/Complex) as the catalogue of cross-parameter semantic rules.
- **P26** (Sec. V-A-2 p.6): state-based failure modes (unauthenticated cart removal; checkout with empty cart) surfaced only under ZeroShot prompting — FM14 in 2/18 runs.
- **P33** (Table 2 p.4): hardest categories are domain-boundary tasks — unavailable item (unsafe 51.7% schema mode), unavailable modifier (40.8%), allergen conflict (35.8%), dietary conflict (25.8%).
- **P36** (§7 p.8): schema conditions cut interface misuse (5.39 → 3.72 mean invalid calls) but raised schema-valid semantic misuse (0.93 → 3.03).
- **P45** (§3.2.3 pp.6–7; Listing 5): free-text job-description field stored in DB later drives the SQL agent to `UPDATE users SET email='attacker@…'` — a well-formed field carrying an instruction.
- **P49** (§6.3 p.1842): "compromised data still has good text quality and thus small perplexity, making them indistinguishable with clean data".

## Theme C — LLM-generated inputs & test generation

- **P20** (Table 2 p.17): average SSR 60.37% over 11 LLMs; GPT-4 98.48% (PH-P 99.54%), GLM-4 89.50%, LLaMa2-7B 25.65%, GLM-4V 0.00%.
- **P20** (Table 2 p.17; §5.1.1 p.18): prompt type matters — Parser-Processed HTML 70.63% vs Raw HTML 60.21% vs LLM-Processed 50.27%.
- **P20** (§5.2.1 pp.24–25): of 5,728 failed submissions, 40.82% wrong output format, 29.50% wrong content (e.g., "Number Person" for a number field), 29.68% API connection problems.
- **P20** (Table 5 p.23; §5.1.1 p.19): some LLMs echoed placeholder/hint text ("#username=Your Email Address") instead of values.
- **P20** (Table 8 p.27): tester-rated quality mean 2.47/5; GPT-4 3.62 despite 98.48% SSR; Kendall's W = 0.94.
- **P20** (§5.4 p.29): "some invalid data (such as 'user@' or '@email.com' — incomplete email addresses) may also be successfully submitted"; validation of invalid tests is future work.
- **P20** (§5.4 p.28): no random-based baselines were included.
- **P21** (Fig. 6 p.9): FSS coverage — FormNexus-GPT-4 89%, standalone GPT-4 71%, static type-based 57%, FormNexus-Llama 2 51%, Llama 2 35%, Crawljax random 30%.
- **P21** (Fig. 7 p.10): passing rate — FormNexus-GPT-4 83%, GPT-4 63%, QTypist-like 57%, Llama 2 33%, static 23%, Crawljax 3%.
- **P21** (§4.5 pp.9–10): standalone GPT-4 produced no viable values for 3/30 forms; Llama 2 for 14/30 (context size).
- **P21** (Table 4 p.10): ablation — removing FERG drops coverage 89% → 82% and passing 83% → 70%; date context helps date-bearing forms ~20%.
- **P24** (Table 3 p.12): semantically valid values — base Llama3-8B 22.94% (Spotify 0.00%, Ohsome 2.78%), fine-tuned LlamaREST-EX 72.44%, RESTGPT 68.82%, 2-bit 29.12%.
- **P24** (Table 4 p.12): IPD rules recovered of 18 — fine-tuned 12, RESTGPT 9, base Llama3-8B 2 (note: abstract says "of 17").
- **P24** (Fig. 4 p.16; Table 6 p.14): LlamaRestTest 8-bit 55.8% method coverage vs EvoMaster 45.8, ARAT-RL 41.7, MoRest 33.3, RESTler 33.1; 204 unique 500s vs 130–160.
- **P24** (§4.2 p.13): small model fails on region-specific formats ("en" instead of "en-GB") and domain knowledge (FDIC).
- **P26** (Sec. V-A-1 p.6): "Without guidance, models generate syntactically valid inputs that do not exercise boundary conditions or structural mutations"; ZeroShot union coverage 11% / 36%.
- **P26** (Table V p.6; Table VII p.7): no single run > 57% FM coverage; Structured prompting collapses diversity (Jaccard 1.00).
- **P26** (Sec. V-B p.7): prompt variation yields roughly twice the failure-set diversity of model variation (J 0.16–0.19 vs 0.34–0.36).
- **P26** (Sec. V-C-1 p.7; Sec. VI-A p.8): given "replace value by null", all models produced value-empty, never key-absent mutations; concrete examples were needed.
- **P26** (Sec. V-C-3 pp.7–8): more tests ≠ more coverage (60 tests → 8/14 FMs vs 12 tests → 3/14).
- **P39** (§3 p.3; Fig. 1a p.4): 541 semantic violations in 300 LLM-generated UIs (~1.8/UI); generic buttons 27%, vague links 26%, poor alt text 20%, ARIA 14%, generic form labels 12%.
- **P39** (Fig. 1b p.4, approx.): violations per UI by generator ≈ 1.8 / 1.5 / 0.3 (bar-to-model mapping not stated in text).

## Theme D — Schema-valid but semantically wrong LLM outputs

- **P33** (Table 1 p.4): schema validity 100% in json_schema mode for all four models, yet semantic success GPT-OSS-120b 81.3%, Llama-3.1-8B 36.0%, Qwen3-30B 30.7%, Gemma-2-2B 2.0%.
- **P33** (Table 1 p.4): unsafe acceptance 0.0% (GPT-OSS), 8.3% (Llama), 14.3% (Qwen), 41.7% (Gemma) under json_schema mode.
- **P33** (Table 5 p.5): json_schema vs prompt-only — unsafe acceptance falls for Llama (−5.0 pp, p=0.001) and Gemma (−3.3 pp, p=0.013); semantic success changes are not significant except Gemma +2.0 (p=0.031).
- **P33** (Table 3 p.5): multi-label errors across 1,200 schema-mode cases — unsafe 16.1%, catalog hallucination 16.2%, scope split 8.1%, negation 6.7%, quantity/size 5.4%, allergen preservation 4.7%.
- **P33** (Table 4 p.5): "No dairy for me, add cheese sauce to fries" accepted with cheese sauce — schema-valid unsafe allergen acceptance.
- **P34** (Table 3 p.4): sub-3B aggregate — hard schema raises schema validity 61.5% → 100% while answer accuracy falls 19.7% → 11.0% and wrong-valid-schema rate rises 49.5% → 88.9%.
- **P34** (Table 6 p.5): calendar tool-call — executable accuracy 91.5% (prompt-JSON) → 48.0% (hard schema); wrong-valid 8.5% → 52.0%; latency 1.63 → 1.69 s.
- **P34** (Table 7 p.5; §6.3 p.5): 102 of 104 hard-schema failures are single-field `duration_minutes` errors; 30-minute request emitted as 180 — "A calendar API would accept the object and schedule the wrong meeting."
- **P34** (Table 4 p.5): answer tax largest for arithmetic_two_step (26.8 pts) and object_tracking (12.5); boolean_logic gains validity without accuracy loss.
- **P34** (Table 9 p.6; §6.5 p.6): Qwen2.5-3B — wrong-valid 43.6% → 75.2% under hard schema; issue "not limited to the smallest models".
- **P34** (Table 10 p.6): delayed_constraint mode reaches 40.7% answer / 100% valid / 40.7% exec vs answer_only_schema 26.8 / 99.0 / 26.8 (MLX, 4 models).
- **P35** (Sec. 6.2 p.7; Fig. 2 p.8): JSON Pass vs Value Accuracy gap consistently 15–25 pp; every model > 84% JSON Pass, none > 80.4% Value Accuracy.
- **P35** (Sec. 6.6 item 1 p.9): GPT-5.4 99.97% JSON Pass but Perfect Response 0.486; GLM-4.7 0.972 vs 0.526.
- **P35** (Sec. 6.7 p.11): value errors are "the dominant gap": 17–31% of leaf values incorrect despite valid structure; parse failures < 2% for 19/21 models.
- **P35** (Abstract p.1): best Value Accuracy 83.0% text, 67.2% image, 23.7% audio, alongside near-perfect schema compliance.
- **P35** (Table 3 p.9): schema-constrained decoding changes Value Accuracy only −0.007 to +0.033 while raising JSON Pass for Gemini (0.860 → 0.956).
- **P35** (Sec. 6.6 item 4 p.10): model size does not predict quality — Phi-4 (14B) 0.798 VA > GPT-5 0.795.
- **P36** (§7 p.8; Abstract p.1): "schema conditions reduce interface misuse but not semantic misuse"; task success 0.0 in all cells of the 0.5B pilot.
- **P37** (Table III p.6; Table V p.8): v2 structural success 74.1–97.8% while majority-vote semantic satisfaction is 6.9–55.2%.
- **P37** (§VI.D p.8): gpt-oss-120b, best structurally (97.8%), worst semantically (6.9%) because it emitted "stub" workflows that "pass structural validation but are non-executable".
- **P37** (§VI.C p.7): even the strongest model failed the semantic test on nearly half the prompts; "high structural success rates … should not be interpreted as semantic correctness".
- **P37** (§IV.B p.5): semantic correctness "not yet integrated into the pipeline as a blocking validation step".
- **P39** (§5 p.4): training that rewards Axe-core scores "may inadvertently teach models to produce syntactically compliant but semantically empty attributes".

## Theme E — Prompt injection in LLM-integrated apps

- **P43** (Abstract p.1; §4.2 p.6): LLM-integrated applications "blur the line between data and instructions"; "the data and instruction modalities are not disentangled".
- **P43** (§4.2 p.6, remark 2): prompts filtered when typed into Bing Chat are not filtered when injected indirectly through retrieved content.
- **P43** (§3.1 pp.3–4; Fig. 2 p.3): taxonomy — passive/active/user-driven/hidden injection; threats: information gathering, fraud, intrusion, malware, manipulated content, availability.
- **P43** (§4.2.3 p.7; §4.2.4 p.8; §4.3 p.11): e-mail worm, remote control via fetched instructions, persistence via memory, multi-stage and Base64-encoded injections demonstrated qualitatively.
- **P43** (§5.2 p.11): no quantitative success rates — quantification left to future work.
- **P43** (§5.6 p.12): Bing Chat "seems to employ additional filtering on the input-output channels without considering the model's external input"; "hard to imagine a foolproof solution".
- **P45** (Table 1 p.5): unrestricted default prompt — drop tables / modify records / dump contents succeed 1.0 on chain and agent; prompt-restriction bypasses RD.1/RD.2 also 1.0.
- **P45** (Table 1 p.5; Finding 3 p.6): indirect attack via stored job description — RI.1 chain 1.0 / agent 0.6; RI.2 (UPDATE another user's e-mail) agent 1.0; vector is "unsecured input forms".
- **P45** (Table 2 p.7; §4.2.2 p.8): attacks replicate on GPT-3.5, GPT-4, PaLM2, Llama 2 70B, Vicuna 33B; RD.2 not reproducible on GPT-4; GPT-4 "highest robustness".
- **P45** (§7 p.11): "The sanitization and analysis of LLM inputs is a far more complex problem than the one employed to counter SQL injections."
- **P49** (Table 4 p.1839): ASV on GPT-4 — Naive 0.62, Escape 0.66, Context Ignoring 0.65, Fake Completion 0.70, Combined 0.75; Combined averages ASV 0.62 / MR 0.78 over 10 LLMs.
- **P49** (Fig. 3 p.1839): larger LLMs more vulnerable — Pearson 0.63 (ASV) / 0.64 (MR) with model size.
- **P49** (§1 p.1831; fn.1): injection vector is applicant-supplied resume text (white-on-white in PDF) — user-supplied content, never a typed form field.
- **P49** (§7 p.1843): injection (attacker-chosen task) distinguished from jailbreaking (unsafe target task).
- **P54** (Table 11 p.14): 200 crafted injections succeed 43–59% on GPT-3.5-Turbo, GPT-4o, GPT-4o-mini, Llama 3.
- **P54** (Sec 2.4 p.4): conversational requests (empty application prompt) are benign by construction; only application-structured requests (p‖d) are at risk.
- **P41** (Sec. 6 p.28; Table 5): NIST AI RMF and ISO/IEC "lack semantic input validation, prompt–execution separation, output-to-action control…"; "semantic input validation" there means adversarial-instruction detection.
- **P41** (Sec. 5.1.3 p.11): existing defences "rely on heuristic filtering, which can be bypassed"; StruQ, spotlighting, signed prompts reviewed.
- **P41** (Sec. 7 p.30): LLM-mediated interactions "weaken data–instruction, trust, and execution boundaries".
- **P64** (Sec. 1 p.2): input filters cannot inspect retrieved documents; output monitors cannot prevent an injection reaching the model — motivates layering.
- **P64** (Table 8 p.14): undefended macro-ASR 71.4%; L1 only 44.2; L2 only 51.8; L3 only 38.6; NeMo 35.1; full framework 11.3.
- **P64** (Table 11 p.16): residual bypasses — novel phrasing 37.5%, implicit instructions in retrieved chunks 25.0%, persona drift below threshold 21.9%, multi-turn accumulation 15.6%.
- **P60** (Fig. 5 p.14): jailbreak guardrails let 51–91% of 203 prompt injections pass (PGR Llama Guard 0.911, SelfDefend-intent 0.749, GuardReasoner 0.680); filtering "modest at best".
- **P63** (Table 3 p.8): input-gate bypass — no defence 100%, regex only 69.65%, multi-layer 46.34%, Prompt Guard 2 38.48%, NeMo 0.00%.
- **P63** (Table 7 p.13; Sec 5.9 pp.10–11): regex defence bypass EN 25.1% vs PT-BR 73.5%; 34% of PT-BR patterns lacked rules.
- **P63** (Table 6 p.13): all 171 input bypasses ended S0 — 71 caught by provider filter, 100 refused by the gpt-4.1 tutor (conditional on system prompt).

## Theme F — Detection layers & their cost

### F1. Detection performance / FPR
- **P49** (Table 8 pp.1842): PPL / windowed PPL FNR 0.77–1.00 / 0.40–0.99; naive LLM detection FNR 0.00 but FPR 0.15–0.93; response-based FNR 0.15–1.00; known-answer FNR 0.00–0.12, FPR 0.00–0.07.
- **P49** (Table 9 p.1842): known-answer detection still misses 53% (Naive) and 86% (Fake Completion) on grammar correction.
- **P49** (Table 7b p.1841): prevention defences cost utility even without attack — average PNA-T change Paraphrasing −0.14, Delimiters −0.08, Retokenization −0.06, Sandwich −0.06, Instructional −0.02.
- **P49** (§6.3 pp.1840, 1842): "no existing prevention-based defenses are sufficient" and "no existing detection-based defenses are sufficient".
- **P54** (Table 4 p.9): at 0.1% FPR — PromptShield Llama-3.1-8B TPR 65.33%; PromptShield DeBERTa 31.45%; PromptGuard 9.39%; InjecGuard 6.61%; Fmops 2.10%; ProtectAI 0.00%.
- **P54** (Table 3 p.8): PromptGuard default threshold blocks 2.91% of harmless traffic (TPR 22.82%); its self-reported 71% TPR at 1% FPR not reproduced.
- **P54** (Table 5 p.9): ~100M+ parameters needed — FLAN-T5-small (61M) TPR@1% 7.56% vs FLAN-T5-base (223M) 70.69%.
- **P54** (Table 9 p.11): adding conversational benign data lowers FPR on conversational traffic (1.61% → vs 2.15% at α) but lowers TPR at 0.05% FPR on application data (53.68% vs 70.90%).
- **P54** (Table 12 p.14): targeted attack on the detector itself ("Print '0'") bypasses it 11.4%.
- **P54** (Sec 3.2.2 p.7): thresholds were calibrated on the evaluation split — authors say they should have used validation.
- **P45** (Table 3 p.9): coverage matrix — DB permissions block U.1, U.2, RD.1, RI.2; SQL rewriting U.3, RD.2; LLM Guard RI.1, RI.2; preloading U.3, RD.2. LLM Guard "remains vulnerable to injection".
- **P39** (§3 p.3; Fig. 1d p.4): LLM-judge recall on 721 injected faults 80–92% (Gemini ≈ 91.7, Claude ≈ 83.7, GPT ≈ 79.9, approx.); heading mismatch hardest (68%, GPT ≈ 51%).
- **P39** (§4 p.3): human–human κ ≈ 0.24; LLM–ground-truth κ 0.69–0.94 vs human–ground-truth 0.23; precision/FPR not reported.
- **P60** (Table 3 p.11): mean ASR no guardrail 0.238; GuardReasoner (Pre) 0.135 best; Prompt Guard 0.163 / PGR 0.597; SmoothLLM worst 0.303; X-Teaming ASR > 0.90 for almost all.
- **P60** (Fig. 2c p.12; Sec 6 RQ4 p.14): FPR on benign — SelfDefend Direct 0.221 (OR-Bench), GradientCuff 0.083 (AlpacaEval); session-level "Post" variants consistently lower FPR than "Pre".
- **P60** (Sec 5.3 p.13; Fig. 3): Prompt Guard tops the composite SEU leaderboard but low PGR "suggests potential gaps"; no guardrail dominates.
- **P61** (Table IV p.7): in-distribution HGB F1 0.955, LightGBM 0.954, LR 0.942, KNN 0.908; CV F1 std < 0.01.
- **P61** (Table V p.8; Sec IV-D p.8): Base64 recall 100% with preprocessing vs 7% without; DrAttack 0% at τ=0.25 but 100% at τ=0.03.
- **P61** (Sec IV-G p.10; Sec V p.11): benign AlpacaEval harm probability max 0.027 → zero FP at τ=0.03; but LR at τ=0.25 gives 5.4% FPR (not reconciled in note).
- **P63** (Table 3 p.8; Table 4): FPR — multi-layer 0.00% (n=111, upper 95% bound 2.67%), Prompt Guard 3.60% [0.90, 7.21] despite ≤1% calibration target, NeMo 16.22% [9.01, 23.42].
- **P63** (Table 5 p.10): persona-dependent FPR — Prompt Guard up to 9.52% (curious beginner); NeMo up to 28.57%.
- **P63** (Table 9 p.13): Prompt Guard threshold sweep — 0.010: 36.0% bypass / 3.60% FPR; 0.050: 40.7% / 0.00%; 0.99: 65.3% / 0%.
- **P64** (Table 8 p.14; Table 9 p.15): FPR — L1 5.1%, L2 1.3%, L3 6.7%, NeMo 8.4%, full 4.8% (lower than L1+L3 6.9% because L2 reduces load on L3).
- **P64** (Sec. 5.5.3 p.14; Fig. 10 p.16): L1 MiniLM classifier AUC 0.941 (FPR 0.051, TPR 0.722); L3 harmful-content predicate AUC 0.923.
- **P64** (Sec. 4.2.2 p.8): pattern matching "high precision on known attacks at near-zero latency"; embedding classifier "extends recall to unseen phrasings at a modest computational cost".
- **P33** (§6 p.6): recommends fail-closed domain verifier after structured output; verifier's own error rate not evaluated (OURS in note).
- **P37** (§VI pp.6–8): LLM-as-judge (Claude Sonnet 4.5, 10-criterion rubric, 3 gradings) used offline; not validated against humans (§IX p.9).

### F2. Latency / overhead / cost
- **P45** (§5.2.3 p.10; Fig. 3): LLM Guard adds 0.35–0.51 s (≈0.4 s average; 8–20%) on 1.61–5.19 s baseline; SQL rewriting 1.87 ms; preloading 0.7 ms; permission hardening negligible.
- **P45** (§5.1.3 p.9): preloading user data "can consume a significant number of tokens … higher API costs and latency".
- **P24** (§4.3 p.15; §3.3.3 p.10): LM inference per IPD extraction 48.9 s (FT), 36.9 s (8-bit), 26.2 s (4-bit), 26.1 s (2-bit) on M1 MacBook Pro; model sizes 2.96–7.95 GB.
- **P34** (Table 6 p.5): constrained decoding adds +0.06 s (1.63 → 1.69 s) on the calendar task; validator-layer cost not isolated.
- **P37** (Tables II–IV p.6): end-to-end pipeline latency 18.5–99.3 s (v1), 33.6–151.4 s (v2); v2 adds 8–75 s; interactive threshold stated < 50–60 s.
- **P37** (§V p.5; §VII.E p.9): annualised cost at 1,000 workflows/day — mistral-small ≈ $3,700, gpt-oss-120b ≈ $6,000, llama-4-maverick ≈ $8,900, mistral-medium ≈ $71,900 (19× for +0.4 pt).
- **P60** (Sec 5.2 p.12; Sec 6 RQ1 p.13): Perplexity Filter, Llama Guard, SelfDefend, PromptGuard "negligible latency"; most others ≤ 0.5 s; GuardReasoner and GradientCuff largest (≈2 s approx.); pre-processing cheaper than post-processing for the same model.
- **P60** (Fig. 2b p.12; Sec 6 RQ2): GPU memory — SmoothLLM zero, GradientCuff/PromptGuard near-zero, GuardReasoner highest (≈45 GB approx.); H800 hardware, PyTorch 2.6.0.
- **P61** (Sec IV-E p.8): bge-small embedding 35.27 ms per request on Tesla T4 is the latency floor; preprocessing < 0.1 ms; LightGBM classifier 2.32 ms.
- **P61** (Table VI p.9): end-to-end mean / P50 / P99 — LR 53.17 / 40.85 / 325.80 ms; LightGBM 54.88 / 41.71 / 284.73; HGB 69.81 / 53.34 / 463.53; RF 193.97 / 181.53 / 422.88.
- **P61** (Table VII p.9): RES — LR 16.79 vs Llama Guard 2 11.90 (255 ms) and SafeDecoding 9.80 (723 ms); baselines quoted from prior work, not re-run.
- **P61** (Sec I p.1): real-time budget "< 100 ms" asserted without reference; P99 values exceed it (OURS in note).
- **P63** (Table 3 p.8): average / p95 latency — regex 0.03 / 0.04 ms; multi-layer 2.50 / 4.10 ms; Prompt Guard 2 (86M) 74.41 / 86.10 ms; NeMo + Azure gpt-4.1 1470.61 / 4748.63 ms. Hardware not reported.
- **P63** (Table 8 p.13): cost $0 for local layers vs $12.50 per 1K queries for NeMo; throughput ≈ 400 QPS multi-layer, ≈ 13 QPS Prompt Guard, < 1 QPS NeMo.
- **P63** (Sec 5.11 p.13): NeMo permissive rail reaches 2.4% bypass / 0% FPR at ≈ +200 ms per query over balanced.
- **P64** (Table 10 p.15): A100 median / p95 — L1 pattern 2.1 / 4.3 ms; L1 MiniLM classifier 18.4 / 27.6; L2 11.5 subtotal; L3 29.2 subtotal; total 61.2 / 97.4 ms, LLM inference excluded; two encoding steps ≈ 60% of overhead.
- **P64** (Fig. 11 p.16; Sec. 6.2 p.18): per-model overhead 59.7–65.3 ms under single-request load; concurrent load may push p95 beyond 97.4 ms.
- **P54** (Sec 3.2.1 p.6): no latency, throughput, cost or hardware reported anywhere despite "deployable" framing; Llama-class detectors "may not be suitable for all deployment scenarios".
- **P49**: no latency, token or dollar overhead for any of the 10 defences (note: Not reported).
- **P11** (§6 p.16): cites runtime-detection systems with "a 2%–9% penalty in performance" — related work, not the authors' measurement.

---

## What no note covers — evidence map per RQ

| RQ | DIRECT | PARTIAL / INDIRECT / ADJACENT | No evidence (per note) | Gap left open by all notes |
|---|---|---|---|---|
| **RQ1** structural-pass / semantic-fail | P11 (conceptual ancestor), P20 (central: SSR vs quality), P24 (22.94% semantically valid), P33 (100% schema / 2–81% semantic), P34 (88.9% / 52.0% wrong-valid), P35 (15–25 pp gap), P37 (97.8% vs ≤55.2%), P45 (RI.1/RI.2 instance) | P21, P26, P36, P43, P49 (PARTIAL); P39 (analogue); P41, P64 (ADJACENT) | P54, P60, P61, P63 | No note measures the rate at which **LLM-generated web-form/API field values** pass structural validators yet violate field-level semantic rules; all DIRECT evidence is on LLM *outputs* (JSON, workflows, orders) or on hand-crafted inputs. |
| **RQ2** frequency by field type | none | P11, P20, P21, P24, P26, P33, P34, P35 (category / task / per-service only); P39 (element-type analogue) | P36, P37, P41, P43, P45 (one field only), P49, P54, P60, P61, P63, P64 | No per-field-type (email / date / number / enum / phone / free text) failure distribution exists in any note. |
| **RQ3** LLM vs random / rule / human inputs | P21 (LLM vs Crawljax random vs static type-based) | P20 (LLM vs LLM only), P24 (fine-tuned vs base vs type-based tools), P26 (prompt strategies) | P11, P33, P34, P35, P36, P37, P39, P41, P43, P45, P49, P54, P60, P61, P63, P64 | No note includes a **human-written** input group; only P21 runs random and rule-based baselines on the same forms. |
| **RQ4** violation types | P11 (logic-flaw classes), P33 (domain error taxonomy), P43 (six threats / four vectors), P45 (seven attack classes) | P20, P21 (constraint templates), P24 (IPD catalogue), P26, P34, P35, P36, P37, P39 (six fault types), P49 | P41, P54, P60, P61, P63; P64 ADJACENT | Taxonomies are domain-specific (orders, workflows, injections, accessibility); no unified typology of semantic violations for typed web inputs. |
| **RQ5** semantic-layer detection | P45 (LLM Guard with coverage), P49 (five input detectors with FNR/FPR), P39 (LLM-judge recall 80–92%) | P11, P21, P33, P34, P36, P37, P43, P54, P61, P63, P64 (PARTIAL); P35 INDIRECT; P41, P60 ADJACENT | P20, P26 | Detectors evaluated are for **instructions/harm/injection**, not for semantic validity of ordinary data values; where a semantic checker exists (P33, P34) it is the oracle and its own error rate is unmeasured. |
| **RQ6** latency / overhead | P45 (≈0.4 s Guard; ms-level others), P61 (T4 ms-level with P99), P63 (0.03–1470 ms, hardware unspecified), P64 (A100 per-component median/p95) | P11 (analysis time), P24 (LM inference s), P34 (+0.06 s), P37 (end-to-end s), P60 (plot-level s) | P20, P21, P26, P33, P35, P36, P39, P41, P43, P49, P54 | No note reports the overhead of a **semantic validator for data values** in the web request path; no CPU-only figures; only P61/P64 give P99/p95 with hardware stated. |
| **RQ7** trade-off | P24 (quantization), P34 (validity–correctness tax), P37 (cost vs structural success), P45 (coverage vs overhead), P49 (utility cost), P60 (SEU), P61 (RES), P63 (bypass–FPR–latency–cost) | P33, P39, P54, P64 (PARTIAL); P11, P35 INDIRECT | P20, P21, P26, P36, P41, P43 | No note trades **semantic-validity detection** against latency and FPR on benign structured inputs; trade-offs measured are security-vs-utility or validity-vs-accuracy. |

Cross-cutting absences observed across all 20 notes (OURS, absence evidence):
- No note evaluates a validation layer on **application-structured benign inputs** (form/JSON payloads); FPR is always on chatbot prompts (P54, P60, P61, P63, P64).
- No note reports **CPU-only** latency for an ML input filter (P61 describes a CPU rig but reports no CPU numbers).
- No note separates "format-valid but rejected" from "format-invalid" failures for generated inputs (P20, P21, P24, P26).
- Only P21 and P24 combine generated inputs with a real application/API validation oracle; P33/P34/P35/P37 use deterministic or LLM-judge oracles on outputs.

---

## Integrity flags raised in notes (copied; resolve in Stage 5 audit or escalate as TODO-HUMAN)

Version / venue / metadata
- **P11**: no venue printed on the PDF (no header/footer); obtained from the USENIX Security '10 proceedings URL. FOUNDATIONAL.
- **P20**: arXiv 2405.09965v2 read, not the TOSEM camera-ready (DOI 10.1145/3735553); PDF carries ACM template placeholders ("J. ACM, Vol. 37, No. 4, Article 111, August 2018", "https://doi.org/XXXXXXX.XXXXXXX"); citation key says 2026 while arXiv PDF says 2025 — resolve via Crossref in Stage 5; any numeric/wording difference between versions is UNVERIFIED.
- **P21**: PDF header reads "ISSTA 2024" but DOI (10.1145/nnnnnnn.nnnnnnn) and ISBN are placeholders — confirm the ACM DOI via Crossref before citing the published version (TODO for Stage 5).
- **P24**: arXiv v2 carries the published PACMSE/FSE 2025 header (DOI 10.1145/3715737); internal inconsistencies — 22.94% vs 24.94% semantically valid (text vs Table 3); "12 out of 17" (abstract) vs Total 18 (Table 4) — resolve against the ACM version before quoting exact figures.
- **P26**: header "This work has been submitted to the IEEE for possible publication"; venue not confirmed (SRDS 2026 implied only by anonymous repo name); figures not viewed.
- **P33**: single-author preprint, no venue; dated "May 2026" with arXiv stamp 2607.18261v1 "16 May 2026" (ID series vs date mismatch); no code/data URL despite stated JSONL release.
- **P34**: single-author preprint, no affiliation printed, no venue, no code/data URL despite references to "experiment directories"; four expanded-study models unnamed.
- **P35**: "Preprint" from JigsawStack, Inc.; code/data "released" per Abstract and Conclusion but no repository URL found in PDF text or link annotations — **TODO-HUMAN**: locate the release. V0 leads to verify: LLMStructBench (Tenckhoff et al. 2026), Park et al. 2024.
- **P36**: authors listed as "Independent Researcher" (boisestate.edu emails); no venue; results in prose only, no tables/figures; repository link not verified.
- **P37**: IBM authors evaluate their own IBM Concert platform (potential positive framing); "project repository" with prompts named but not linked; no venue.
- **P39**: CHI EA '26 with DOI 10.1145/3772363.3799364 printed on the PDF, but PDF obtained from the first author's site, not the ACM DL; several numbers (per-generator violations, judge recall by model) read from figures only — approximate; per-model UI counts and judge prompt Not reported.
- **P41**: self-declared "ACM Comput. Surv." format with placeholder DOI 10.1145/nnnnnnn.nnnnnnn and "Manuscript submitted to ACM" — treat as preprint, not an accepted CSUR article; Sections 5.3–5.10, Table 4 and Supplementary Table 6 not read.
- **P43**: arXiv 2302.12173v2 read; the AISec 2023 camera-ready (DOI 10.1145/3605764.3623985) was NOT read — **TODO-HUMAN**: confirm the AISec version's page/section numbering before citing locations.
- **P45**: arXiv 2308.01990v4 read; published at ICSE 2025 under a **new title** ("Prompt-to-SQL Injections in LLM-Integrated Web Applications: Risks and Defenses") — **TODO-HUMAN**: cite the ICSE version, obtain DOI via Crossref, confirm section/page mapping; no repository URL in PDF.
- **P49**: printed USENIX Security 2024 proceedings version (pp.1831–1847) — metadata as printed; results for non-GPT-4 LLMs live in an external technical report [28].
- **P54**: no venue printed on PDF (arXiv 2501.15145v2); CODASPY 2025 venue and DOI 10.1145/3714393.3726501 come from the task brief, not the PDF — Crossref check still required.
- **P60**: no venue printed on PDF (arXiv 2506.10597v2); "IEEE S&P 2026" comes from the task brief and P63's reference [24] — confirm via publisher record before citing as S&P; Table 1 (full taxonomy), Sec 4.1/4.4, Appendices A–B not read; latency/memory values are visual chart estimates, not printed numbers.
- **P61**: running header "IEEE TRANSACTIONS ON SUSTAINABLE COMPUTING, VOL. 00, NO. 0, DEC. 2026" is a template placeholder; author-biography block unfilled ("Author Name is currently pursuing a Ph.D. in [Field]"); **references [4]–[7] carry implausible sequential placeholder arXiv IDs (2403.12345, 2402.12345, 2404.12345, 2401.12345)** and [4] misattributes DrAttack; internal numeric inconsistencies (abstract 37.6 ms vs Table VI 54.88 ms end-to-end; Table VI vs Table VII latencies; 99.1% vs 95.9% recall); repository stated but **no URL anywhere in PDF** — Code availability `NOT VERIFIED — HUMAN REVIEW REQUIRED`. Treat every claim from P61 with caution and cross-check.
- **P63**: single-author preprint (affiliation only lumytics.com e-mail), no venue; hardware never specified; 480-query set described both as "the benchmark" and "the holdout" alongside a 20/80 split — ambiguous; AI-tools disclosure printed (GPT-5 family, Claude Opus 4.6/Sonnet 4.5, Gemini 3).
- **P64**: **first author printed on the PDF is N. Ahmed, not Saleem — citation key `saleem2026layered` violates the firstauthor-year rule; flag for Stage 5 audit**; typeset as "ICCK Transactions on Information Security and Cryptography" with placeholder DOI 10.62762/ICCK.2026.000000, placeholder dates ("submit-date", "pub-date") and "Editor A" — venue legitimacy `NOT VERIFIED — HUMAN REVIEW REQUIRED`; data/code "available at: GitHub Repository" with no URL — **TODO-HUMAN**; conflict of interest declared (Sparkverse AI).

Measurement-quality flags (affect claim strength)
- **P11**: Table 1 per-row vulnerability sum (30) ≠ text (29); counts depend on manual alert aggregation.
- **P20**: two framings of the same result ("decreased by 9.10% to 74.15%" vs "between 52% and 98% lower"); per-run variance not reported at temperature 1.
- **P21**: single run, no variance or tests; "significantly" used without tests; outcome detector is keyword heuristic.
- **P24**: no inter-rater kappa for semantic-validity judgements; no variance over 10 runs.
- **P26**: one execution per configuration; FM definitions post hoc; OTel 504 cascade confound.
- **P33/P34**: exact-match semantic success inflates failure rates; latency logged but unreported (P33).
- **P35**: ~3% residual ground-truth error; exact-match penalises paraphrases.
- **P36**: zero task success in all cells — H1–H3 untestable; no CIs despite stated plan.
- **P37**: point estimates, no CIs; semantic evaluation on a selected subsample (3 of 8 runs, structurally valid only); LLM judge unvalidated.
- **P39**: no judge precision/FPR; Axe-core never actually run; generators = judges.
- **P49**: GPT-4 default; other-LLM results external.
- **P54**: single run per configuration; thresholds tuned on evaluation data.
- **P60**: efficiency numbers only as plots (0.5 s resolution); batch size / sequence length / GPU count Not reported.
- **P61**: latency from 100 prompts, one seed; P99 exceeds the paper's own sub-100 ms requirement; FPR at τ=0.03 vs 5.4% at τ=0.25 refer to different classifiers.
- **P63**: n=111 benign, so zero-FPR upper bound ≈ 2.7%; throughput measurement method unstated.
- **P64**: thresholds calibrated on same-distribution validation; single-request latency on dedicated GPU.

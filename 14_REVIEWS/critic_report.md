# RESEARCH CRITIC REPORT — run 1 (early, on the idea, for Gate A) — 2026-09-20

Scope: idea + literature (Stages 1–8) + testbed v0.2 + RESEARCH_PLAN.md. No results exist; the critic
attacks the design and positioning. Second run happens on the full draft (Stage 15).

| Q | Critic question | Assessment | Severity | Recommended action |
|---|---|---|---|---|
| 1 | Has this been done? | The phenomenon has (P33–P37 for outputs; P11/OWASP for the distinction). The web-input measurement with rule reference, the 7-group comparison, and CPU-side layer cost have not (05, 06). | HIGH if framed as discovery; LOW if framed as extension | Reframe: "extends to the input side"; cite P33–P37 in the introduction, not only related work |
| 2 | Is the novelty real? | Real for C3–C5 bundle; modest for C1; C2 depends on results. | MEDIUM | Lead with C3 and C4/C5 in the contribution list |
| 3 | Engineering rather than research? | Risk: "we built an app and added a validator". Mitigated by hypotheses, controlled groups, pre-registered metrics, and alternative explanations 1–6. | MEDIUM | Keep the testbed out of the contribution list; freeze and hash before generation |
| 4 | Dataset / baselines / metrics adequate? | Single self-built app and one domain; 20 fields; open 0.6–8B models on CPU. Baselines A/B/C/F/G are strong for RQ3; the LLM-judge baseline is CPU-slow (12–33 s observed, TESTBED_OBSERVATIONS.md). | HIGH (external validity) | State as limitation; optional second open-source app (RESEARCH_PLAN D4) if time allows; report judge latency honestly as a result, not a bug |
| 5 | Alternative explanation for results? | Alt 1 weak rules: BUSINESS_RULES has 38/43 unenforced — a critic will say the app is a straw man. Alt 2/3 random and human-unusual may produce the same SV-SI rate. Alt 4 free-text-only. Alt 5 injection. Alt 6 cost. | HIGH | Alt 1: justify the enforcement profile with P20 §5.4/P21 §4.4 evidence that real apps under-enforce, and report results for the 5 enforced rules separately; Alt 2–6 are designed into groups B, G, field categories, P5 separation, E4 |
| 6 | Semantic violations objectively defined? | Rules B-XX-n are explicit, but several are judgement calls (B-PR-5 "is a personal name", B-RV-3 "about this course"). | HIGH (construct validity) | Three-source ground truth (rules, judge, human sample) with κ; AMBIGUOUS class; per-rule objectivity rating in 08 |
| 7 | Ground truth reliable? | Judge model must differ from the generator family; human sample ~200; κ reported. P39 shows human–human κ can be as low as 0.24 on semantic judgements (§3 p.3). | HIGH | Pilot the annotation guide; expect low κ on subjective rules and pre-declare which rules count as "objective" |
| 8 | Poor schema design vs AI? | If Zod schemas are unusually loose, the gap is inflated. | MEDIUM | Schemas mirror common practice (lengths, regex, enum, email/url); document; sensitivity analysis with a "strict schema" variant is optional |
| 9 | Are AI inputs actually different from random/rule-based? | Unknown — this is RQ3 and the study's real question. Prior evidence: LLM inputs pass far more often (P21), so the *conditional* SV-SI rate among passing inputs is the right comparison. | — | Primary metric = SV-SI rate among structurally valid inputs; report both conditional and unconditional |
| 10 | Sample size sufficient? | ~2,500–4,000 inputs across 20 fields × 7 groups gives ~20–30 per cell; enough for group-level χ²/Fisher, thin for field×group interactions. | MEDIUM | Pre-commit primary tests at group and category level; treat field×group as exploratory |
| 11 | Is the semantic detector just another LLM? | Candidate E (LLM judge) is; A–D and F are not. The comparison is the point. Judge injectability (P67, P45 §5.1.4) is a known threat. | MEDIUM | Report each design separately; include P5 inputs against the judge to test injectability |
| 12 | Too much latency? | Almost certainly for the LLM judge on CPU (seconds); possibly acceptable for rules/embeddings (ms-range per P61/P64 on GPU — CPU unknown). | — | This is RQ6/RQ7; a negative result is a result |
| 13 | Prompt injection under another name? | Only 4 of 20 selected fields are AI-facing; P5 is isolated; the main SV-SI rate excludes P5. | LOW if enforced | Keep the exclusion in the pre-registered analysis plan |
| 14 | Does Next.js matter? | No. It is the environment; Zod/Prisma patterns generalise to other stacks. | LOW | Say so in the paper; never claim framework novelty |
| 15 | Reproducible? | Local open models with digests, seeds, frozen commit, prompts as files, raw JSONL. Risk: CPU non-determinism across runs was already observed (O7). | MEDIUM | Repeat runs (≥3) per condition; report variance; pin Ollama version and model digests |
| 16 | Claims stronger than evidence? | Not yet — no claims exist. Watch for "AI-generated inputs bypass validation" phrasing; the correct claim is conditional and comparative. | — | Claims ledger from Stage 14 |
| 17 | Missing evidence? | IEEE Xplore/ACM DL full-text disconfirmation not done (G1, G4); P02 and P08 unread; two adjacent leads unscreened (ShopGym, USPTO 12288159). | MEDIUM | TODO-HUMAN items TH-01–TH-03 + new TH-08 |

**Critic verdict on the idea:** *Worth doing, with repositioning.* The study is not about discovering
that schemas miss semantics; it is about measuring, in a web application with an explicit rule
reference, whether LLM-generated inputs are disproportionately semantically invalid relative to human,
random and rule-based inputs once they pass structural validation, where by field type, and what it
costs to catch them on commodity hardware. Framed that way it survives questions 1–3. Its weakest
points are construct validity of "semantic violation" (Q6–Q7) and the single self-built application
(Q4–Q5, Q8), which must be handled by design and stated as limitations, not hidden.

**Recommendation to the human:** GO WITH CHANGES (see DECISIONS_LOG.md Gate A).

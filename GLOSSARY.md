# GLOSSARY — Semantic Validation Gaps in AI-Driven Web Applications

> Fixed terminology. Once a term is defined here, use it identically in every stage file,
> figure label, and the paper. Record rejected synonyms so they are not reintroduced.

## Terms

| Term (use this) | Definition | Do NOT use (synonyms rejected) | First defined in | Source (Paper_ID or "ours") |
|---|---|---|---|---|
| structural validation | Operational definition: every check encoded in the application's runtime schema (type, presence, length, pattern, range, enumeration, format) plus database constraints — i.e. what a schema library can express without a rule that references application state or other records. In the testbed: `lib/validation/index.ts` + Prisma constraints. NOTE: OWASP's Input Validation Cheat Sheet (G01) calls this *syntactic* validation and files range checks such as "price within expected range" under *semantic*; we keep a range that the developer wrote into the schema on the structural side because it is enforced by the schema, and treat only unenforced plausibility ranges as semantic. This deviation is stated in the paper. | syntactic validation (use once when citing OWASP, then "structural"), schema-only validation, format validation | 00_RESEARCH_BRIEF.md §3; reconciled 2026-09-20 | ours; OWASP G01 for the syntactic/semantic pair |
| semantic validation | Checks on whether a structurally valid input is appropriate for the application's intended purpose: contextual correctness, cross-field consistency, domain plausibility, business rules, downstream safety. In the testbed: BUSINESS_RULES.md. Literature equivalents: OWASP "semantic validation" (G01); WSTG "logically invalid data" (G02); "inter-parameter dependencies" for the cross-field subset (P02, P03); "semantic-based user input validation" (P08); "schema-valid but semantically incorrect/unsafe" (P33), "wrong-valid-schema" (P34), "semantic misuse" vs "interface misuse" (P36). The academic security literature mostly frames failures of this kind as "logic vulnerabilities/flaws" (P11, P12) or "business logic vulnerabilities" (P15). | contextual validation, business validation (use "business rule" for the rule itself), "semantic security" (P29-type ontology work — different meaning) | 00_RESEARCH_BRIEF.md §3; reconciled 2026-09-20 | ours + G01/P02/P08/P33/P34/P36 |
| business rule | A single, statable domain expectation (e.g. "promo code applies to the course category"), identified by a rule ID (B-XX-n). | constraint (reserved for DB constraints), policy | BUSINESS_RULES.md | ours |
| SV-SI input | An input that passes structural validation and violates at least one business rule (structurally valid, semantically invalid). The primary outcome. | "semantic bypass", "gap input" | 00_RESEARCH_BRIEF.md §13 | ours |
| AI-facing field | A field whose value is later placed into an LLM prompt by the application (testbed: ticket subject/description, chat message, profile bio). | LLM-exposed field | 17_CODE/testbed/lib/services/ai.ts | ours |
| generation group | One of the seven input-production conditions A–G. | condition (in stats prose only), arm | RESEARCH_PLAN.md §3 | ours |
| prompt family | One of the seven LLM prompting strategies P1–P7. | prompt type | RESEARCH_PLAN.md §3 | ours |
| semantic validation layer | A drop-in check `validateSemantic(field, value)` executed after structural validation and before business logic. | semantic firewall, AI validator | RESEARCH_PLAN.md §3 | ours |
| testbed | The `mono` Next.js application in 17_CODE/testbed. | "the app", "our system" | 17_CODE/testbed/README.md | ours |

## Acronyms

> Define at first use in the abstract AND again at first use in the body (IEEE).

| Acronym | Expansion | Defined in abstract? | Defined in body section |
|---|---|---|---|
| LLM | large language model | TBD | TBD |
| SV-SI | structurally valid, semantically invalid | TBD | TBD |
| FPR / FNR | false-positive rate / false-negative rate | TBD | TBD |
| ORM | object–relational mapper | — | TBD |

## Notation (symbols used in equations)

| Symbol | Meaning | Type / domain | First used in |
|---|---|---|---|

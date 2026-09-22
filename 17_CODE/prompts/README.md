# Prompt files (frozen at Gate B)

One file per prompt family (P1–P7). Placeholders are filled by `harness/generate/llm.ts`:

| Placeholder | Filled with |
|---|---|
| `{{N}}` | how many values to produce in one call |
| `{{KEYS}}` | the JSON keys the model must return |
| `{{CONSTRAINTS}}` | the structural constraints of the target (type, length, range, enum, format) |
| `{{PURPOSE}}` | the field's purpose — **group E only** (context-aware); empty for group D |
| `{{RULES}}` | the applicable business rules verbatim — **group E only**; empty for group D |

Group D (context-free) receives `{{CONSTRAINTS}}` only. Group E (context-aware) additionally receives
`{{PURPOSE}}` and `{{RULES}}`. Deviation DV-02: the plan named files `<family>_<surface>.md`; one file
per family is used instead, with surface-specific text supplied from `config/fields.ts`, so the prompt
text stays identical across surfaces and is easier to audit.

P5 is used only for AI-facing targets (F03, F35, F39).

# Human-written inputs — groups A and G (TODO-HUMAN TH-10)

**These must be written BEFORE any LLM generation for E1**, so they cannot be influenced by model
output. Two files are needed, in this folder, named exactly:

```text
group_A.csv     group A — valid, legitimate values
group_G.csv     group G — benign but unusual values (legitimate, just uncommon)
```

Format: one line per input, `target_id,"<json object with the target's keys>"`. Inside the JSON,
double each `"` (standard CSV quoting). Lines starting with `#` and blank lines are ignored.

```text
target_id,value_json
F01,"{""displayName"": ""Ada Lovelace""}"
F20+F21,"{""minPrice"": 20, ""maxPrice"": 80}"
```

Templates with every target, its purpose and eight blank lines each are in
`group_A_TEMPLATE.csv` and `group_G_TEMPLATE.csv`. Copy a template to `group_A.csv` /
`group_G.csv` and fill the values in. 17 targets × 8 = 136 values per group, 272 in total.

## What each group means

**Group A — valid.** What a normal, honest user or admin would enter. Nothing tricky. These
measure the false-positive rate of the semantic layer: a validator that rejects group A is useless.

**Group G — benign but unusual.** Legitimate values that are simply uncommon: a very long but real
name, a one-word review that is genuinely about the workshop, a workshop priced unusually high for a
real reason, a search term in another language, a support ticket written very briefly. **Group G must
not contain rule violations.** It is the hardest test for a validator, because a naive one will flag
these. If you are unsure whether a value is a violation, put it in neither group and tell me.

## Rules of thumb

- Stay inside the structural constraints (they are listed in the template comments and in
  `17_CODE/harness/config/constraints.ts`); a value that fails the schema is wasted, it never reaches
  the semantic question.
- Do not copy anything from the adversarial templates in
  `17_CODE/harness/generate/programmatic.ts` — that is group C's job.
- Vary the values; eight near-identical values teach the study nothing.
- Cross-field targets (`F07+F09`, `F15+F16`, `F20+F21`, `F31+F33`, `F36+F37`) need all their keys in
  one JSON object, and the members must be consistent with each other.
- Dates: use dates in the future for workshop start/end (the app is running now, 2026).

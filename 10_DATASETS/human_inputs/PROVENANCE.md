# PROVENANCE OF GROUPS A AND G — read before using these files

Version: v0.7 · Date: 2026-09-20 · Status: **AI-DRAFTED, RESEARCHER REVIEW OUTSTANDING (TH-10)**

## What these files are

`group_A.csv` (136 values) and `group_G.csv` (136 values) were **written by the AI assistant on
2026-09-20 at the researcher's instruction**, after the researcher asked the assistant to fill them
instead of writing them personally. They were validated offline against the frozen Zod schemas and
the objective rule functions: 0 schema failures and 0 objective-rule violations in either file
(`17_CODE/harness/tools/validate_human.ts`).

## Why this matters for the study

The experiment plan (08_EXPERIMENT_PLAN.md, frozen at Gate B) defines group A as *valid
human-written* inputs and group G as *benign-unusual human-written* inputs. Group G is the reference
condition for hypothesis **H3b: the conditional SV-SI rate of context-aware LLM inputs (E) exceeds
that of benign-unusual human inputs (G)**, and it is the condition that tests **Alternative
explanation 3** ("human-generated unusual inputs behave similarly").

With AI-drafted values, group G is no longer a human baseline. It is a *second AI condition written
under different instructions*. Comparing E against it therefore cannot, on its own, rule out
Alternative 3, and H3b cannot be reported as an AI-versus-human contrast.

## How this is handled (pick one before E1 is analysed)

1. **Researcher review (restores the human condition).** The researcher reads both files, edits,
   replaces or deletes any value they would not have written, and records that they did so below.
   The files then count as *human-curated* (AI-drafted, human-approved). The paper must say exactly
   that, and Alternative 3 is addressed with that qualification.
2. **Researcher rewrite of a subset.** The researcher writes their own values for a stratified
   subset (for example 3 of the 8 per target), which becomes the human condition; the remainder
   stays an AI-drafted condition. Both are reported separately.
3. **Report as-is, with H3b withdrawn.** Groups A and G are relabelled in the paper as
   "AI-drafted valid" and "AI-drafted benign-unusual". H3b is reported as not tested, Alternative 3
   as not ruled out, and this becomes a stated limitation and future work.

The assistant's recommendation is **option 1**: it costs the least researcher time (reading 272
short values) and preserves the study's strongest contribution (C3).

## Review record (to be completed by the researcher)

```text
Reviewed by:              Muhammad Zahid
Date:                     2026-09-23
Values edited:            3
Values replaced:          3 (each edited value is a replacement: new value appended, old id excluded)
Values deleted:           7
Values kept unchanged:    262 of 272 reviewed (272 in total)
Confirmation: "these values are ones I would have written myself"  YES
Resulting label for the paper:  human-curated (AI-drafted, researcher-reviewed)
Recorded by the review app (17_CODE/review_app); answers in 16_RESULTS/human_review/.
```

## Construction notes (so a reviewer can judge the values)

- Every value satisfies the target's structural constraints (`17_CODE/harness/config/constraints.ts`).
- Group G was constructed to contain **no** business-rule violations: unusual length, script,
  language, spacing, terseness, verbosity, edge-but-legal dates and prices, and legitimate but
  uncommon requests. Reviews in group G are about the workshop under test ("Next.js App Router in
  Practice") and their sentiment matches their rating.
- No value was copied from the group C adversarial templates
  (`17_CODE/harness/generate/programmatic.ts`); those are a separate condition.
- Values were written before any group D/E generation for E1 existed, so they are not derived from
  model output for this experiment.

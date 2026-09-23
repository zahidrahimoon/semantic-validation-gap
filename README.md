# Semantic Validation Gaps in AI-Driven Web Applications

Artefacts for the paper *Structurally Valid, Semantically Wrong: Measuring the Validation Gap for
AI-Generated Web Inputs* (Zahid Rahimoon, 2026).

A web application's schema validation checks that an input is well formed, not whether it is
appropriate. This study measures how often inputs that pass validation still break business rules the
application does not enforce, compares seven producers of input (two LLM conditions, random,
rule-based adversarial, boundary and two reference conditions), and evaluates five candidate
validation layers for detection quality and request-path cost on a four-core CPU.

## Headline results

| Question | Result |
|---|---|
| Do LLM inputs pass validation and break rules? | Yes: 338/1094 = 30.9% of decided structural passes (95% CI 28.2-33.7) |
| Is the gap specific to AI? | No: random structurally valid inputs break rules more often (53.3%) |
| Does field context help? | Yes: purpose and rules cut the odds of a violation by 77% |
| Can a layer detect it? | No design reached 70% recall at 5% FPR; best fast design 27.1% |
| What does a layer cost? | Rules at most 14 ms at p97.5; an LLM judge 1.6-7.7 s and saturating under load |

Judge-human agreement was Cohen's kappa 0.238, below the threshold fixed before data
collection, so every result that depends on judgement rules is reported as exploratory.

## Layout

```
00_..09_   research stages: brief, questions, search strategy, literature, gap, novelty, method, plan
10_DATASETS/   reference input values (groups A and G) and their provenance record
11_PAPERS/     screening register, per-paper notes and search reports (third-party PDFs not included)
12_REFERENCES/ bibliography, citation audit, published-version checks
13_DRAFT/      paper.tex, paper.pdf, generated tables and numbers
14_REVIEWS/    four reviewer simulations, the critic report and the issue tracker (89 issues)
15_FINAL/      submission checklist and AI-use disclosure
16_RESULTS/    raw runs (append-only), analysis scripts, results log, human review answers
17_CODE/       the frozen testbed, the experiment harness, prompts and the review app
DECISIONS_LOG.md  every decision and all 19 deviations from the frozen plan
```

## Reproducing the numbers

No number in the paper is typed by hand. Each one comes from `13_DRAFT/tables/numbers.tex`, which is
generated from the raw data. To regenerate everything, see `16_RESULTS/analysis/README.md`.

```bash
python3 -m venv .venv && .venv/bin/pip install -r 16_RESULTS/analysis/requirements.lock.txt
cd 16_RESULTS/analysis
R=../raw/E1_E1_20260920T0847
../../.venv/bin/python e1_e2_analysis.py $R      # and the other scripts listed in that README
```

Re-running the measurements themselves needs the testbed (`17_CODE/testbed`, tag `v1.0-frozen`),
Node 22, and Ollama with qwen3:4b, qwen3:1.7b, qwen3:8b, gemma3:4b and nomic-embed-text.

## Honest notes

* One application, one domain, built by the author. Prevalence figures describe that subject.
* Ground truth for judgement rules comes from a 4B judge model whose agreement with the author's blind
  annotation was weak; those results are exploratory. Objective rules are decided by deterministic
  rule functions.
* The reference conditions A and G were first drafted with a language model and then reviewed value by
  value by the author, so they are human-curated rather than written unaided.
* Six defects found during execution are documented in `DECISIONS_LOG.md` with the invalid data kept.

## Licence

Software (`17_CODE/`, `16_RESULTS/analysis/`, `tools/`): MIT, see `LICENSE`.
Data, rule reference and manuscript: CC BY 4.0, see `LICENSE-DATA`.

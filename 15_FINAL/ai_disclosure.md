# AI-USE DISCLOSURE

Paper: *Structurally Valid, Semantically Wrong: Measuring the Validation Gap for AI-Generated Web
Inputs* · Author: Zahid Rahimoon · Date: 2026-09-22

This statement is written to satisfy the disclosure policies of IEEE and ACM venues and of preprint
servers. It is deliberately specific, because the paper is itself about AI-generated content and a
vague statement would be inadequate.

## Tools used

| Tool | Version / identifier | Where used |
|---|---|---|
| Claude (Anthropic), via Claude Code | sessions of 2026-09-20 to 2026-09-22 | literature search and verification, note-taking, drafting, harness implementation, analysis scripting, figure scripting |
| Qwen3 4B (Q4_K_M), local via Ollama 0.34.2 | digest `359d7dd4bcda…` | **experimental subject**: generation of input conditions D and E; the JUDGE detector design |
| Qwen3 1.7B and 8B, local | digests recorded in each run's `raw_inputs.jsonl` | model-size variation (E2b); Qwen3 1.7B is also the SLM detector design |
| Gemma 3 4B, local | digest recorded | independent ground-truth judge (different model family from the generator) |
| Embedding model (nomic-embed-text), local | digest recorded | the EMB detector design |

## How AI assistance was used in preparing the manuscript

- **Literature search and screening.** Queries were run by the assistant across web search, arXiv,
  Crossref and Semantic Scholar; every search is logged in `02_SEARCH_STRATEGY.md` and the raw search
  reports are archived in `11_PAPERS/search_reports/`. **No citation entered the bibliography from
  model memory.** Each entry's metadata was fetched from Crossref or the arXiv API; the fetch outputs
  are archived. Papers read in full or in part have per-paper notes with section and page locations.
- **Drafting.** The assistant drafted the manuscript text. The author directed scope, reviewed
  content and is responsible for every claim.
- **Code.** The testbed application, the experiment harness, the detector designs and the analysis
  scripts were written by the assistant under the author's direction. All are released with the paper.
- **Analysis.** Statistical tests were specified before data collection (frozen at the method-approval
  gate) and implemented in scripts; no number in the paper was produced by a model reading data and
  reporting a figure in prose. Tables are generated from the analysis outputs by script. Figures quoted
  in the prose were transcribed from script output and re-checked against it; a check on 2026-09-22
  found and corrected three transcription or reproducibility errors in an earlier draft (see
  `16_RESULTS/RESULTS_LOG.md`), and an analysis defect that had produced a wrong detector result was
  fixed before that result was reported (deviation DV-11).
- **Human-written input conditions.** `TODO-HUMAN`: conditions A and G were drafted by the assistant
  at the author's request rather than written by the author. Their provenance, the consequence for one
  hypothesis, and the options for resolving it are recorded in
  `10_DATASETS/human_inputs/PROVENANCE.md` and in the paper's limitations section. **This must be
  resolved or disclosed in the submitted version.**
- **Human annotation.** `TODO-HUMAN`: the 200-item annotation that validates the ground-truth judge
  against a person has not been done; the paper states that judgement-rule results rest on the judge.

## What AI assistance did not do

It did not decide that a claim was true, that a contribution was novel, that a gate was passed, or
that the paper was ready to submit. It did not generate any experimental result: every number comes
from an executed run whose raw output is in `16_RESULTS/raw/`, with provenance in `RESULTS_LOG.md`.
Where a measurement had not been made, the draft carried an explicit placeholder rather than an
estimate.

## Responsibility

The research questions, the design decisions, the interpretation and the final manuscript are the
author's responsibility. AI tools are not listed as authors.

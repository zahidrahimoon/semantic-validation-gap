# WHAT IS LEFT BEFORE THIS CAN BE SUBMITTED

Date: 2026-09-20 · Status: E1 running · Read this first if you are picking the project up.

## The one deliverable you asked for

`13_DRAFT/paper.pdf` — one file, IEEE conference format, currently 8 pages. When the pipeline below
finishes, the seven red `[RESULT PENDING]` markers in it are replaced by real numbers and tables and
it becomes the complete article. Nothing else about the file changes. `15_FINAL/` will then hold the
submission copy, the checklist and the AI-disclosure statement.

## Pipeline status

| Step | What it produces | Status | Wall-clock on this machine |
|---|---|---|---|
| E1 generate (A,G,B,C,F) | ~2,800 programmatic + human inputs | RUNNING | minutes |
| E1 generate (D,E) | ~3,200 LLM inputs, 3 runs, qwen3:4b | RUNNING | ~5 h |
| E1 structural | schema + HTTP outcome per input | queued | ~4 h (ticket/chat targets call the model) |
| E1 rules (R1) | objective-rule verdicts | queued | minutes |
| E1 judge (R2) | judge verdicts on every structural pass | **blocked**: `gemma3:4b` still downloading | ~5 h after it lands |
| E1 merge + report | final labels, SV-SI rates | queued | minutes |
| E2 / E2b | condition contrasts; model-size and temperature | queued | ~3 h |
| E3 | five semantic-layer designs, leave-fields-out | queued | ~6 h |
| E4 | latency, throughput, CPU, memory | queued | ~1 h |
| Analysis + figures | tables and plots from raw data | queued | ~1 h |
| Paper fill | replace the seven placeholders | queued | — |

Total remaining machine time ≈ 20 h, almost all unattended background work on a 4-core CPU with no
GPU. It does not need supervision, but it does need the machine left on and the Docker container and
the dev server running.

## Two things only you can do

1. **Review the group A/G values** (272 short lines, ~40 min) and sign the record in
   `10_DATASETS/human_inputs/PROVENANCE.md`. Until that is signed, the paper must say hypothesis H3b
   is exploratory, because the "human" baseline was AI-drafted. This is the single change with the
   largest effect on what the paper can claim.
2. **Annotate 220 items** after E1 finishes (~3–4 h). This is the third ground-truth source and the
   only way to report judge–human agreement. Without it the semantic labels rest on one model's
   judgement, which a reviewer will challenge.

## If you want it faster

Reducing the LLM runs from three to one cuts generation and judging by roughly two thirds (about 7 h
saved). It is a change to a Gate-B-frozen item, so it needs your explicit approval and is recorded as
a deviation. The cost is that run-to-run variance can no longer be reported, which weakens the
reliability argument. Recommendation: keep three runs unless the deadline forces otherwise.

## Before you send it anywhere

The protocol caps the status at `READY FOR HUMAN VERIFICATION`. Submission needs, from you: author
details and affiliation, a similarity check, the target venue's current author guidelines applied
(`/rs-venue <name>` does the research and formatting), confirmation of the model licences for
releasing the generated data, and a read of the claims ledger. ResearchGate posting is a
preprint-style release; check whether your chosen venue permits it before posting.

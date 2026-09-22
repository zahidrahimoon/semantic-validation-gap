# review_app — the two researcher tasks

Open **http://127.0.0.1:8765** (runs as user service `svg-review`; if stopped: `python3 17_CODE/review_app/server.py`).

1. **Review reference inputs** (272, TH-10): Keep / Change / Delete each AI-drafted value, then sign off.
2. **Annotate inputs** (220, blind): Respects / Breaks / Unsure for each rule. Item ids and conditions are never sent to the browser.

Every click is saved immediately to `16_RESULTS/human_review/*.jsonl`; you can stop and continue any time.
When both show complete, run: `bash 17_CODE/review_app/finish_review.sh`. It applies the review, measures
any replacement values, imports the annotation, rebuilds labels, re-runs all analyses, regenerates the
paper's numbers (the text switches to the "reviewed / validated" wording automatically), recompiles and commits.

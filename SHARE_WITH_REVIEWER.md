# Sharing the two human tasks with another person

## 1. What to SEND (one file is enough)

    16_RESULTS/human_review/share/review_package.zip

Full path: `/home/zahid/ResearchWork/projects/semantic-validation-gap/16_RESULTS/human_review/share/review_package.zip`

It contains three files (you can also send them individually from the same folder):

| File | What it is |
|---|---|
| `annotation_task.html` | Task 2: blind annotation, 220 items (~2–3 h). Contains item numbers only. |
| `reference_review_task.html` | Task 1: keep / change / delete 272 AI-drafted values (~1–1.5 h). |
| `INSTRUCTIONS.txt` | Plain instructions for the reviewer. |

The reviewer needs only a browser: no internet, no install, no account. Progress is kept in their
browser; they can stop and continue. Ask them to do the **annotation first**, then the reference
review: seeing the reference values first could hint at where some annotation items came from.
If two different people do the two tasks, that is even better.

## 2. What NEVER to send

    16_RESULTS/human_review/private/        (annotation_key.json, reference_key.json)

These map item numbers back to the inputs' conditions; sharing them would un-blind the annotation.

## 3. What comes BACK

The reviewer presses **Download results** in each task and sends you:

    annotation_results_<name>.json
    reference_review_results_<name>.json

Save them anywhere (e.g. `16_RESULTS/human_review/returned/`), then run from the project folder:

    python3 17_CODE/review_app/import_shared_results.py <path>/annotation_results_<name>.json <path>/reference_review_results_<name>.json
    bash 17_CODE/review_app/finish_review.sh

The first command checks the files belong to this package and records the answers with the
reviewer's name; the second applies everything, re-runs all analyses, updates the paper and commits.
Then tell Claude "review finished".

## Alternative: do it yourself on this laptop

Open http://127.0.0.1:8765 (service `svg-review`), then run `finish_review.sh`.

Package ids (must match the returned files): see `16_RESULTS/human_review/share/INSTRUCTIONS.txt`.

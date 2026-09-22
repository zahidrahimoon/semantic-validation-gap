#!/usr/bin/env bash
# Run once, after both tasks in the review app are finished (272/272 and 220/220).
# Applies the review, measures any replacement values, imports the annotation, rebuilds the labels,
# re-runs every analysis, regenerates the paper's numbers and tables, recompiles it, and commits.
set -eu
P=/home/zahid/ResearchWork/projects/semantic-validation-gap
H=$P/17_CODE/harness; T=$P/17_CODE/testbed; A=$P/16_RESULTS/analysis
RUN=E1_20260920T0847; R=$P/16_RESULTS/raw/E1_$RUN
PY=/home/zahid/ResearchWork/.venv/bin/python
step() { echo; echo "[$(date -Is)] == $*"; }

step "export answers from the review app"
python3 -c "import sys; sys.path.insert(0, '$P/17_CODE/review_app'); import server; print(server.export_files())"

step "apply the review of groups A/G"
python3 "$P/17_CODE/review_app/apply_review.py"
NEW=$(python3 -c "import json; print(len(json.load(open('$P/16_RESULTS/human_review/new_reference_ids.json'))))")

cd "$H"
if [ "$NEW" -gt 0 ]; then
  step "measure $NEW replacement values (frozen testbed, real HTTP path)"
  [ "$(cd "$T" && git describe --tags)" = "v1.0-frozen" ] || { echo "testbed not on v1.0-frozen"; exit 1; }
  if ! curl -s -m 5 -o /dev/null http://localhost:3000/api/health; then
    (cd "$T" && nohup npm run dev -- --port 3000 > "$P/16_RESULTS/logs/devserver.log" 2>&1 < /dev/null &)
    for i in $(seq 1 60); do curl -s -m 5 -o /dev/null http://localhost:3000/api/health && break; sleep 3; done
  fi
  npx tsx cli.ts generate --exp E1 --run "$RUN" --groups A,G --nrandom 25
  npx tsx cli.ts structural --exp E1 --run "$RUN"
  rm -f "$R/rule_verdicts.jsonl"; npx tsx cli.ts rules --exp E1 --run "$RUN"
  npx tsx cli.ts judge --exp E1 --run "$RUN" --model gemma3:4b --ids-file "$P/16_RESULTS/human_review/new_reference_ids.json"
fi

step "import the annotation and rebuild labels (human verdicts take precedence over the judge)"
npx tsx cli.ts import-labels --exp E1 --run "$RUN"
rm -f "$R/semantic_labels.jsonl"; npx tsx cli.ts merge --exp E1 --run "$RUN"

step "re-run every analysis"
cd "$A"
$PY e1_e2_analysis.py "$R"; $PY e1_e2_analysis.py "$R" --include-retried > /dev/null
$PY e2_cmh_within_target.py "$R"; $PY e1_by_family.py "$R" > /dev/null; $PY e1_by_target.py "$R" > /dev/null
$PY e1_sensitivity.py "$R" > /dev/null; $PY e2b_analysis.py > /dev/null; $PY e3_analysis.py "$R" > /dev/null
$PY e4_analysis.py "$P/16_RESULTS/raw/E4_20260922T1142" > /dev/null
$PY annotation_agreement.py "$R"
$PY make_figures.py; $PY make_latex_tables.py > /dev/null; $PY make_numbers.py

step "recompile the paper"
cd "$P/13_DRAFT" && latexmk -pdf -interaction=nonstopmode paper.tex > /dev/null 2>&1 || true
grep -E "^!|Unknown result key|Output written" paper.log || true

step "commit"
cd "$P" && git add -A && git commit -q -m "Researcher review (TH-10) and blind annotation applied; results regenerated" && git log --oneline | head -1
echo; echo "Done. Tell Claude 'review finished' so the paper text and logs are checked against the new numbers."

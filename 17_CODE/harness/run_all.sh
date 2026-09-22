#!/usr/bin/env bash
# Runs the ENTIRE remaining pipeline for E1-E4 unattended. Every step is resumable: re-running this
# script after any interruption skips work already written to the run folder.
#
# v2 (2026-09-21). v1 kept going when a step failed, so on 2026-09-21 a crash in E1 structural
# measurement cascaded silently through rules, judging, merging and analysis. v2 stops the pipeline
# the moment a core step fails, and checks that every E1 input was measured before anything
# downstream is allowed to run. The old script is kept at 16_RESULTS/logs/run_all.sh.v1_cascading_bug.
#
# Order matters: E1-E3 run against the frozen subject (main @ v1.0-frozen); only E4 switches to the
# v1.1-semantic branch, and the checkout is always restored afterwards.
#
# NEVER edit this file while it is running: bash reads scripts by byte offset.
set -u
P=/home/zahid/ResearchWork/projects/semantic-validation-gap
H=$P/17_CODE/harness
T=$P/17_CODE/testbed
L=$P/16_RESULTS/logs
VENV=/home/zahid/ResearchWork/.venv/bin/python
RUN=E1_20260920T0847
R1=$P/16_RESULTS/raw/E1_$RUN
mkdir -p "$L"
cd "$H"

step() { echo; echo "[$(date -Is)] ========== $* =========="; }

# Core steps: if this fails, stop everything so nothing downstream runs on incomplete data.
must() {
  "$@"
  local rc=$?
  if [ $rc -ne 0 ]; then
    echo "!! FATAL: step failed (exit $rc): $*"
    echo "!! Pipeline stopped so that nothing downstream runs on incomplete data. Fix, then re-run."
    exit 1
  fi
}

# Optional steps (exploratory or independent): log loudly but keep going.
try() {
  "$@" || echo "!! step failed (non-fatal, pipeline continues): $*"
}

wait_for_app() {
  for i in $(seq 1 60); do
    curl -s -m 5 -o /dev/null http://localhost:3000/api/health 2>/dev/null && return 0
    sleep 3
  done
  echo "!! app not responding"; return 1
}

ensure_app() {
  curl -s -m 5 -o /dev/null http://localhost:3000/api/health 2>/dev/null && return 0
  echo "  app is down; starting the dev server on the frozen subject"
  (cd "$T" && nohup npm run dev -- --port 3000 > "$L/devserver.log" 2>&1 < /dev/null &)
  wait_for_app
}

count() { [ -f "$1" ] && grep -c . "$1" || echo 0; }

step "guard: testbed must be on the frozen subject for E1-E3"
CURRENT=$(cd "$T" && git describe --tags 2>/dev/null || echo unknown)
if [ "$CURRENT" != "v1.0-frozen" ]; then
  echo "!! testbed is at '$CURRENT', expected v1.0-frozen. Refusing to measure. Run: git checkout main"
  exit 1
fi
must ensure_app

step "E1 generation (resumable; failed families are never retried, DV-07)"
must npx tsx cli.ts generate --exp E1 --run "$RUN" --groups A,G,B,C,F --nrandom 25
must npx tsx cli.ts generate --exp E1 --run "$RUN" --groups D,E --runs 3 --model qwen3:4b --temp 0.8 --perfamily 5

step "E1 structural measurement (real HTTP path)"
must npx tsx cli.ts structural --exp E1 --run "$RUN"
NIN=$(count "$R1/raw_inputs.jsonl"); NVAL=$(count "$R1/validation_results.jsonl")
echo "  completeness check: $NVAL measured of $NIN inputs"
if [ "$NVAL" -lt "$NIN" ]; then
  echo "!! FATAL: only $NVAL of $NIN inputs measured. Refusing to label or analyse an incomplete corpus."
  exit 1
fi

step "E1 objective rule verdicts (R1)"
rm -f "$R1/rule_verdicts.jsonl"   # derived, not raw: always rebuilt whole so it matches the measurements
must npx tsx cli.ts rules --exp E1 --run "$RUN"

step "E1 judge verdicts (R2, gemma3:4b, stratified sample of 1200, DV-06)"
# DV-09: the judged 1200 are frozen in judge_sample_ids.json; the booking judgement targets F25/F29,
# ineligible when it was drawn, get a one-time stratified supplement of 14 per target x condition.
must npx tsx cli.ts judge --exp E1 --run "$RUN" --model gemma3:4b --sample 1200 --supplement F25,F29 --per-stratum 14

step "E1 merge labels + counts"
rm -f "$R1/semantic_labels.jsonl"  # derived: rebuilt whole from R1 + R2
must npx tsx cli.ts merge --exp E1 --run "$RUN"
must npx tsx cli.ts report --exp E1 --run "$RUN"

step "E1 annotation sample for the researcher (R3)"
try npx tsx cli.ts sample --exp E1 --run "$RUN" --n 200 --repeats 20

step "E1/E2 analysis + figures (primary: first attempts only; sensitivity: with retries)"
cd "$P/16_RESULTS/analysis"
must "$VENV" e1_e2_analysis.py "$R1"
try  "$VENV" e1_e2_analysis.py "$R1" --include-retried
must "$VENV" e2_cmh_within_target.py "$R1"   # post hoc within-target contrasts
must "$VENV" make_figures.py
try  "$VENV" make_latex_tables.py
cd "$H"

step "E2b model-size and temperature variation (10-target subset, exploratory)"
# Each model gets its OWN run folder: record ids do not encode the model, so sharing a folder would
# make the second model find the first model's cells "done" and skip itself.
SUB="F01,F04,F03,F12,F14,F18,F25,F29,F35,F39"
E2B_RUNS=""
for spec in "qwen3:1.7b:$RUN" "qwen3:8b:${RUN}_8b"; do
  M=$(echo "$spec" | cut -d: -f1,2)     # e.g. qwen3:1.7b
  RID=$(echo "$spec" | cut -d: -f3)     # its run folder
  if curl -s http://localhost:11434/api/tags | grep -q "\"$M\""; then
    try npx tsx cli.ts generate --exp E2b --run "$RID" --groups D,E --runs 1 --model "$M" --temp 0.8 \
      --perfamily 5 --targets "$SUB" --families P1,P2,P3,P4
    E2B_RUNS="$E2B_RUNS $RID"
  else
    echo "  $M not pulled: E2b runs without it (reported as a limitation)"
  fi
done
try npx tsx cli.ts generate --exp E2b --run "${RUN}_T0" --groups D,E --runs 1 --model qwen3:4b --temp 0 \
  --perfamily 5 --targets "$SUB" --families P1,P2,P3,P4
E2B_RUNS="$E2B_RUNS ${RUN}_T0"
for R in $E2B_RUNS; do
  try npx tsx cli.ts structural --exp E2b --run "$R"
  rm -f "$P/16_RESULTS/raw/E2b_$R/rule_verdicts.jsonl" "$P/16_RESULTS/raw/E2b_$R/semantic_labels.jsonl"
  try npx tsx cli.ts rules --exp E2b --run "$R"
  try npx tsx cli.ts judge --exp E2b --run "$R" --model gemma3:4b --sample 100   # DV-08
  try npx tsx cli.ts merge --exp E2b --run "$R"
done

step "E3 semantic layer designs on the E1 corpus"
DESIGNS=R,HYB,SLM,JUDGE
curl -s http://localhost:11434/api/tags | grep -q '"nomic-embed-text' && DESIGNS=R,EMB,HYB,SLM,JUDGE
echo "  designs: $DESIGNS"
# DV-08: the model-based designs (SLM, JUDGE) score a paired stratified sample of 600; the fast
# designs (R, EMB, HYB) score every decided input and are also compared on that same sample.
try npx tsx semantic/run_e3.ts --exp E1 --run "$RUN" --designs "$DESIGNS" --sample 600 --sample-designs SLM,JUDGE
cd "$P/16_RESULTS/analysis"
try "$VENV" e3_analysis.py "$R1"
try "$VENV" e2b_analysis.py      # exploratory model size / temperature
try "$VENV" make_latex_tables.py
cd "$H"

step "E4 overhead: switching the testbed to v1.1-semantic (production build)"
restore_frozen() {
  cd "$T"
  pkill -f "next start" 2>/dev/null
  sleep 3
  git checkout -q main
  echo "  testbed restored to: $(git describe --tags)"
  (nohup npm run dev -- --port 3000 > "$L/devserver.log" 2>&1 < /dev/null &)
  cd "$H"; wait_for_app || true
}
trap restore_frozen EXIT   # the frozen subject is restored even if E4 fails part-way
cd "$T"
pkill -f "next dev" 2>/dev/null
sleep 3
if git checkout -q e4-semantic-layer && npm run build > "$L/e4_build.log" 2>&1; then
  (nohup npm run start -- --port 3000 > "$L/e4_server.log" 2>&1 < /dev/null &)
  sleep 8
  cd "$H"
  if wait_for_app; then
    try env DUR=60 REPS=3 bash perf/run_e4.sh
  fi
else
  echo "!! E4 build failed (see $L/e4_build.log); E4 skipped"
fi

step "E4 analysis"
E4DIR=$(ls -d "$P"/16_RESULTS/raw/E4_2* 2>/dev/null | grep -v INVALID | tail -1)
cd "$P/16_RESULTS/analysis"
[ -n "$E4DIR" ] && [ -f "$E4DIR/latency_results.csv" ] && try "$VENV" e4_analysis.py "$E4DIR"
try "$VENV" make_latex_tables.py
cd "$H"

step "PIPELINE COMPLETE"
echo "tables : $P/16_RESULTS/analysis/*.csv  (sensitivity: analysis/sensitivity_include_retried/)"
echo "figures: $P/09_DIAGRAMS/rendered/*.pdf"
echo "latex  : $P/13_DRAFT/tables/*.tex"
echo "researcher tasks remaining: annotate $R1/annotation_sample.csv;"
echo "                            sign $P/10_DATASETS/human_inputs/PROVENANCE.md"

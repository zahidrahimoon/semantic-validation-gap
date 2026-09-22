#!/usr/bin/env bash
# Waits for E1 generation+structural+rules to finish, then runs the judge, merges labels and
# produces the E1/E2 tables and figures. Unattended; resumable (every step skips finished work).
set -u
H=/home/zahid/ResearchWork/projects/semantic-validation-gap/17_CODE/harness
P=/home/zahid/ResearchWork/projects/semantic-validation-gap
LOG=/tmp/claude-1000/-home-zahid-ResearchWork/9030d9fd-5b70-45f9-8cc4-83a71c64735f/scratchpad/e1.log
RUN=$(cat /tmp/claude-1000/-home-zahid-ResearchWork/9030d9fd-5b70-45f9-8cc4-83a71c64735f/scratchpad/e1_run.txt)
cd "$H"

echo "[$(date -Is)] waiting for E1 phase 1 (generation + structural + rules)"
for i in $(seq 1 2880); do            # up to 24 h
  grep -q "rules done" "$LOG" && break
  sleep 30
done
grep -q "rules done" "$LOG" || { echo "[$(date -Is)] phase 1 did not finish; stopping"; exit 1; }

echo "[$(date -Is)] === E1 judge (gemma3:4b, different family from the generator) ==="
npx tsx cli.ts judge --exp E1 --run "$RUN" --model gemma3:4b
echo "[$(date -Is)] === E1 merge ==="
npx tsx cli.ts merge --exp E1 --run "$RUN"
npx tsx cli.ts report --exp E1 --run "$RUN"
echo "[$(date -Is)] === E1/E2 analysis ==="
cd "$P/16_RESULTS/analysis"
"$P/../../.venv/bin/python" e1_e2_analysis.py "$P/16_RESULTS/raw/E1_${RUN}" && \
"$P/../../.venv/bin/python" make_figures.py
echo "[$(date -Is)] === E1 + E2 COMPLETE — tables in 16_RESULTS/analysis, figures in 09_DIAGRAMS/rendered ==="

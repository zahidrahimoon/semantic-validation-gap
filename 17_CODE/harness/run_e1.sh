#!/usr/bin/env bash
# E1 full corpus, resumable. Safe to re-run with the same RUN after any interruption: every step
# skips work already written to the run folder. Logs to 16_RESULTS/logs/.
set -u
H=/home/zahid/ResearchWork/projects/semantic-validation-gap/17_CODE/harness
RUN=E1_20260920T0847
cd "$H"
echo "[$(date -Is)] === E1 $RUN: programmatic + human groups (resumable) ==="
npx tsx cli.ts generate --exp E1 --run "$RUN" --groups A,G,B,C,F --nrandom 25
echo "[$(date -Is)] === E1: LLM groups D and E, 3 runs, qwen3:4b T=0.8 ==="
npx tsx cli.ts generate --exp E1 --run "$RUN" --groups D,E --runs 3 --model qwen3:4b --temp 0.8 --perfamily 5
echo "[$(date -Is)] === E1: structural measurement ==="
npx tsx cli.ts structural --exp E1 --run "$RUN"
echo "[$(date -Is)] === E1: objective rule verdicts ==="
npx tsx cli.ts rules --exp E1 --run "$RUN"
echo "[$(date -Is)] === E1 generation+structural COMPLETE ==="

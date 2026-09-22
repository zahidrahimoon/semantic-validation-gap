#!/usr/bin/env bash
# Wraps E4 v2: stops the dev server, checks out and builds the E4 branch, runs the benchmark, and
# ALWAYS restores the frozen subject afterwards (trap), even if the benchmark stops part-way.
set -u
P=/home/zahid/ResearchWork/projects/semantic-validation-gap
T=$P/17_CODE/testbed; L=$P/16_RESULTS/logs; H=$P/17_CODE/harness
restore() {
  pkill -f "next-server" 2>/dev/null; pkill -f "next start" 2>/dev/null; sleep 2
  cd "$T" && git checkout -q main && echo "[$(date -Is)] testbed restored to: $(git describe --tags)"
}
trap restore EXIT
echo "[$(date -Is)] E4 v2: stopping dev server, building e4-semantic-layer"
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 3
cd "$T" && git checkout -q e4-semantic-layer || { echo "!! checkout failed"; exit 1; }
echo "[$(date -Is)] testbed at: $(git describe --tags)"
npm run build > "$L/e4_build.log" 2>&1 || { echo "!! build failed, see $L/e4_build.log"; exit 1; }
cd "$H" && bash perf/run_e4.sh

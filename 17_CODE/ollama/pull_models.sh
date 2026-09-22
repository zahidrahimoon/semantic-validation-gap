#!/usr/bin/env bash
# Pulls every model the experiment plan needs (08_EXPERIMENT_PLAN.md §Models).
# Sequential on purpose: the network gives ~1.8 MB/s and parallel pulls just thrash.
set -u
MODELS=(gemma3:4b qwen3:1.7b qwen3:0.6b nomic-embed-text qwen3:8b)
for m in "${MODELS[@]}"; do
  echo "[$(date -Is)] pulling $m"
  docker exec svg-ollama ollama pull "$m" 2>&1 | tr '\r' '\n' | grep -E 'success|error|^pulling manifest' | tail -2
done
echo "[$(date -Is)] all pulls attempted; installed models:"
curl -s http://localhost:11434/api/tags | python3 -c 'import sys,json;[print(" ", m["name"], m["digest"][:16], m["details"]["parameter_size"], m["details"]["quantization_level"]) for m in json.load(sys.stdin)["models"]]'

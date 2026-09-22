#!/usr/bin/env bash
# Waits for the Ollama container to answer, then pulls the configured model.
set -u
MODEL="${1:-qwen3:4b}"
cd "$(dirname "$0")"
for i in $(seq 1 240); do
  if curl -s -m 3 http://localhost:11434/api/version >/dev/null 2>&1; then
    echo "[$(date -Is)] ollama up: $(curl -s http://localhost:11434/api/version)"
    echo "[$(date -Is)] pulling $MODEL ..."
    docker exec svg-ollama ollama pull "$MODEL" 2>&1 | tr '\r' '\n' | grep -vE '^\s*$' | awk 'NR%40==1 || /success|error|verifying|writing/' 
    echo "[$(date -Is)] pull finished; models now:"
    curl -s http://localhost:11434/api/tags
    exit 0
  fi
  sleep 15
done
echo "[$(date -Is)] gave up waiting for ollama"; exit 1

#!/usr/bin/env bash
# One-word control for the experiment pipeline, run as a systemd USER service so it survives the
# terminal or chat session closing. Usage:  ./pipeline.sh start | status | log | stop
P=/home/zahid/ResearchWork/projects/semantic-validation-gap
case "${1:-status}" in
  start)
    if [ -f "$P/17_CODE/harness/RESUME_BLOCKED.md" ]; then
      echo "BLOCKED: a fix is half-applied. Read 17_CODE/harness/RESUME_BLOCKED.md first."; exit 1
    fi
    if systemctl --user is-active --quiet svg-pipeline; then echo "already running"; exit 0; fi
    (cd "$P/17_CODE/ollama" && docker compose up -d >/dev/null 2>&1)
    systemctl --user reset-failed svg-pipeline 2>/dev/null
    systemd-run --user --unit=svg-pipeline --collect --setenv=PATH="$PATH" --setenv=HOME="$HOME" \
      -p WorkingDirectory="$P/17_CODE/harness" \
      /bin/bash -c "exec ./run_all.sh >> $P/16_RESULTS/logs/run_all.log 2>&1"
    echo "started (resumes wherever it stopped)";;
  status)
    systemctl --user is-active --quiet svg-pipeline && echo "RUNNING" || echo "NOT RUNNING — use: ./pipeline.sh start"
    grep -a "==========" "$P/16_RESULTS/logs/run_all.log" | tail -1 | sed 's/.*========== /current step: /; s/ ==========//'
    tail -1 "$P/16_RESULTS/logs/run_all.log";;
  log)   tail -f "$P/16_RESULTS/logs/run_all.log";;
  stop)  systemctl --user stop svg-pipeline && echo "stopped (safe: it resumes from here next start)";;
  *)     echo "usage: $0 start | status | log | stop";;
esac

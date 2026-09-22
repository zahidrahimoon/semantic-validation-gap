# EXPERIMENT SAFETY — Semantic Validation Gaps in AI-Driven Web Applications

Version: v0.5 · Date: 2026-09-20 · Status: DRAFT (Phase 14 of USER_WORKFLOW_SPEC.md; frozen at Gate B)

| Item | Setting | How enforced |
|---|---|---|
| Environment | Local development only: `next dev` on `localhost:3000`, Ollama in Docker on `localhost:11434`. No production or staging system is involved. | The testbed has no deployment target; `.env` contains only localhost URLs. |
| Database isolation | SQLite file `17_CODE/testbed/dev.db`, reset before every experiment run (`npm run db:reset`), snapshot copied to `16_RESULTS/raw/<run_id>/db_after.sqlite` after the run. | Harness refuses to start unless `DATABASE_URL` starts with `file:` (guard in `17_CODE/harness`). |
| External APIs | None. No cloud LLM APIs, no e-mail, no payment. The only network call is to the local Ollama container. | No API keys exist in the environment (capability check 2026-09-20). Harness sets `OLLAMA_URL` to localhost and has no other HTTP client. |
| Rate / load limits | Generation and labelling run sequentially (Ollama `OLLAMA_NUM_PARALLEL=1`); load tests (E4) use bounded concurrency (≤ 8) against the local app only. | Harness config; autocannon `-c` capped. |
| Secrets | No secrets. `.env` is git-ignored; `.env.example` documents the three localhost variables. | `.gitignore`; review before commit. |
| Data content | All inputs are synthetic (human-written by the researcher, programmatic, or LLM-generated). No real personal data; the seed contains fictional users. Prompts instruct models not to produce real personal data. | Prompt files; annotation guide flags any real-looking PII for removal (AMBIGUOUS class). |
| Prompt-injection inputs (P5) | Are only ever sent to the local testbed's own AI features; they cannot reach any third-party system. | Architecture (no tools, no browsing, no external calls in the assistant). |
| Rollback | Testbed code: frozen git commit; `git checkout <hash>`. Data: `npm run db:reset`. Models: pinned digests in 17_CODE/ENVIRONMENT.md; `ollama pull <tag>@<digest>` restores. | Recorded per run in 16_RESULTS/RESULTS_LOG.md. |
| Raw data immutability | `16_RESULTS/raw/` is append-only: every run writes into a new `<run_id>/` folder; analysis never modifies raw files. | Convention + a `chmod -w` step at run end (harness). |
| Resource limits | CPU-only; long runs execute in the background with resumable JSONL checkpoints so an interrupted run can continue without regenerating. | Harness design. |
| Ethics | No human subjects; the only human activity is the researcher's own annotation (no consent process required). `TODO-HUMAN`: confirm no institutional requirement applies. | TODO-HUMAN register TH-09. |

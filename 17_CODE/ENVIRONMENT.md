# ENVIRONMENT — recorded 2026-09-20 (testbed v0.1)

| Item | Value |
|---|---|
| OS | Ubuntu 24.04.3 LTS, kernel 7.0.0-31-generic |
| CPU / RAM / GPU | Intel i5-6440HQ (4 cores, AVX2) / 16 GB / none (CPU-only inference) |
| Node / npm | v22.19.0 / 10.9.3 |
| Next.js / React | 16.3.5 / 19.2.8 |
| TypeScript / Tailwind | ^5 / ^4 |
| Zod / react-hook-form / @hookform/resolvers | 4.6.5 / ^7.88.0 / ^5.9.1 |
| Prisma / @prisma/client / adapter | 7.10.0 / ^7.10.0 / @prisma/adapter-better-sqlite3 (better-sqlite3) |
| Database | SQLite file `prisma/dev.db` |
| Docker | 29.2.0; image `ollama/ollama:latest` = `ollama/ollama@sha256:da6e0dc5651df159e45686fd663c4dbe1624a52c44d7280eeac1551d8f865532` (Ollama server v0.34.2, pulled 2026-09-20) |
| LLM runtime | Ollama, CPU; app default model `qwen3:4b` (Q4_K_M, digest `359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7`, pulled 2026-09-20) |
| Python (analysis) | Python 3.12.3, workspace `.venv`; exact package versions in `16_RESULTS/analysis/requirements.lock.txt` |
| LaTeX | TinyTeX, IEEEtran.cls, latexmk |
| Lock file | `testbed/package-lock.json` (committed) |
| **Frozen subject commit** | `62a726720bc81ee498acee8f1b1fc0924b8ca598` (tag `v1.0-frozen`) |

Exact versions of every npm package: `testbed/package-lock.json` at the frozen commit.

## Installed models (digests pin exact weights; recorded 2026-09-21)

| Model | Size / quantisation | Digest |
|---|---|---|
| gemma3:4b | 4.3B Q4_K_M | `a2af6cc3eb7fa8be8504abaf9b04e88f17a119ec3f04a3addf55f92841195f5a` |
| nomic-embed-text:latest | 137M F16 | `0a109f422b47e3a30ba2b10eca18548e944e8a23073ee3f3e947efcf3c45e59f` |
| qwen3:0.6b | 751.63M Q4_K_M | `7df6b6e09427a769808717c0a93cadc4ae99ed4eb8bf5ca557c90846becea435` |
| qwen3:1.7b | 2.0B Q4_K_M | `8f68893c685c3ddff2aa3fffce2aa60a30bb2da65ca488b61fff134a4d1730e7` |
| qwen3:4b | 4.0B Q4_K_M | `359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7` |
| qwen3:8b | 8.2B Q4_K_M | `500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41` |

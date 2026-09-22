# 17_CODE — Semantic Validation Gaps in AI-Driven Web Applications

```text
Repository URL:          code lives in this folder; testbed has its own git repo (17_CODE/testbed/.git)
Commit hash used for reported results:  62a726720bc81ee498acee8f1b1fc0924b8ca598
                         (tag v1.0-frozen, 2026-09-20, Gate B D-010; earlier: 21d347a v0.2, d4d6f69 v0.1)
Licence:                 TODO-HUMAN (suggest MIT for the testbed and harness)
Entry points / commands: see testbed/README.md; ollama/docker-compose.yml; ollama/wait_and_pull.sh <model>
```

Layout:

```text
17_CODE/
├── testbed/       the Next.js app under study (own git repo)
├── ollama/        docker-compose for the local LLM runtime + model-pull helper
├── harness/       (Stage 11–12) input generation, structural/semantic measurement, performance scripts
└── prompts/       (Stage 11) versioned prompt files P1–P7
```

Every method claim in the paper must map to code here or be labelled `PLANNED` (E7).

| Method component (07_METHODOLOGY.md) | File / function | Status (PLANNED / ACTUAL) |
|---|---|---|
| Testbed application with structural validation | `testbed/lib/validation/index.ts`, `testbed/lib/services/index.ts` | ACTUAL (FROZEN at v1.0-frozen) |
| Business-rule reference (semantic ground truth basis) | `testbed/BUSINESS_RULES.md` | ACTUAL (FROZEN v1.0: 18 OBJ, 1 OBJ*, 24 JUD) |
| AI-facing components (triage, assistant) | `testbed/lib/services/ai.ts` | ACTUAL |
| Local LLM runtime | `ollama/docker-compose.yml` | ACTUAL |
| Input generation framework (groups A–G, prompts P1–P7) | `harness/` | PLANNED |
| Structural measurement (schema + HTTP path) | `harness/` | PLANNED |
| Semantic ground truth (rules, judge model, human sample) | `harness/`, `10_DATASETS/` | PLANNED |
| Semantic validation layer candidates A–F | `testbed/lib/semantic/` | PLANNED (only if baseline shows a gap) |
| Performance measurement | `harness/perf/` | PLANNED |

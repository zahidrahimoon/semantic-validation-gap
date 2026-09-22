# RESEARCH PLAN — Semantic Validation Gaps in AI-Driven Web Applications

Version: v0.1-draft · Date: 2026-09-20 · Status: **AWAITING HUMAN APPROVAL** (no research work starts before approval)

This plan turns the human's 39-phase specification (`USER_WORKFLOW_SPEC.md`) into a concrete,
gated schedule under `RESEARCH_SYSTEM.md`. Everything marked `ASSUMPTION` or `TO CONFIRM` is
open until the human confirms it.

---

## 0. Fixed decisions from Stage 0 intake (2026-09-20)

| Item | Decision | Source |
|---|---|---|
| Experimental app | Purpose-built Next.js testbed, created with `npx create-next-app@latest`, black-and-white UI theme for everything | HUMAN |
| LLM access | Ollama in Docker, CPU only. Qwen family preferred; model choice by best fit | HUMAN |
| Complexity ceiling | Mid-level full-stack developer (~3 yrs). No over-engineering; every piece must be reviewable by the human | HUMAN |
| Ground truth | Pre-written deterministic rules + separate judge model (different family from the generator) + human annotation of a stratified sample (~200) | DEFAULT accepted |
| Venue | Undecided; IEEE conference format, 8–10 pages | DEFAULT accepted |
| Deadline / time | No hard deadline; ~2–3 h/week of human time | DEFAULT accepted |
| Human subjects / sensitive data | None; all inputs synthetic | DEFAULT accepted |
| Paper type | Empirical study, English, IEEE style, single author + AI-use disclosure | DEFAULT accepted |
| Hardware (measured) | Intel i5-6440HQ, 4 cores, AVX2, 16 GB RAM, no GPU, 34 GB free disk, Docker 29.2.0, Node 22.19.0 | measured |

---

## 1. The testbed application (`17_CODE/testbed/`) — `TO CONFIRM`

**Design principle:** realistic enough to have real business rules, small enough to review in an
afternoon. Its schemas and rules are **frozen and git-committed before any input is generated**
(the commit hash goes into the paper), so the app cannot be tuned toward a result.

**Proposed domain: a small workshop/course booking platform** (working name `mono` — monochrome).
Chosen because it naturally contains every field category in the human's taxonomy:

| Feature | Fields (examples) | Field categories exercised |
|---|---|---|
| Profile | display name, username, bio, birth date, website, country (enum) | simple scalar, free text, metadata |
| Courses (admin) | title, description, category (enum), price, discount %, capacity, start/end datetime, tags[] | structured, financial, cross-field (end > start, discount < price), administrative |
| Bookings | seats, promo code, attendee email, special requirements (text) | business-critical, cross-field (seats ≤ remaining capacity), financial |
| Reviews | rating 1–5, title, body | user-generated content, free text |
| Support tickets | subject, description, priority (enum), category (enum) | free text, **AI-facing** (an assistant summarises + classifies + drafts a reply via Ollama) |
| Assistant chat | user message | **AI-facing** free text |
| Search / listing | query, price range, category filter, sort, page (searchParams) | search-related, URL params |

Estimated size: ~35–45 input fields across ~8 routes. Enough to select ~15–20 representative fields.

**Stack (matches the human's profile):** Next.js (latest, App Router, TypeScript), Tailwind,
shadcn/ui with a neutral black/white palette, react-hook-form + Zod on the client, Zod again in
server actions / route handlers, Prisma + SQLite (single file, trivially resettable; Postgres
optional), Ollama HTTP API for the AI-facing features. No auth provider: a fixed demo user and
a fixed admin user (auth is out of scope and would add review burden).

**What "structural validation" means in the testbed:** the Zod schemas + Prisma constraints,
exactly as a typical developer would write them (types, required, min/max, regex, enum,
email/url formats). **What "semantic/business validation" means:** the documented business
rules (`BUSINESS_RULES.md`, written before generation), e.g. "start date must be in the future",
"a promo code must apply to the booked course", "a review body must be about the course",
"a support description must describe a problem with this platform", "a bio must not contain
instructions addressed to the assistant". Where a rule is deliberately *not* enforced in code,
that is recorded — the gap between the two lists is the object of study.

---

## 2. Models (Ollama in Docker, CPU) — `TO CONFIRM` against the Ollama library at setup

| Role | Proposed model | Why | Fallback |
|---|---|---|---|
| Generator, primary | `qwen3:8b` (Q4) | strongest Qwen that fits 16 GB RAM on CPU | `qwen2.5:7b-instruct` |
| Generator, small (model-size variation, Phase 12) | `qwen3:4b` and `qwen3:1.7b` | same family, controlled comparison | `qwen2.5:3b`, `qwen2.5:1.5b` |
| Judge (semantic label, independent of generator) | a different family, e.g. `llama3.1:8b` or `gemma3:4b` | avoids the generator grading itself (Phase 16) | second-opinion from a second Qwen size only if no other family fits |
| Mitigation candidate C (small LM) | `qwen3:0.6b` / `qwen3:1.7b` | latency-realistic for a web request path | — |
| Mitigation candidate A (embeddings) | `nomic-embed-text` or `bge-m3` via Ollama | cheap semantic similarity to field purpose | — |

Expected CPU throughput on this machine (to be **measured**, not assumed): roughly 3–8 tokens/s
for 7–8B Q4, 15–30 tokens/s for 1.7–4B. Generated inputs are short (5–60 tokens), so a batch of
~3,000 generations at 8B is on the order of hours, not days. Runs go in the background with
checkpointed JSONL so they can resume.

Every generation records: model tag, digest, temperature, top-p, seed, max tokens, full system
+ user prompt (saved to file), timestamp, run id. Temperature conditions: 0 (deterministic) and
0.8 (diverse), each with fixed seeds.

---

## 3. Experimental design (frozen at Gate B)

**Unit of analysis:** one (field, input) pair. **Primary outcome:** structurally valid AND
semantically invalid ("SV-SI", the gap). Secondary: violation type, detection by mitigation.

**Groups** (Phase 10): A valid human-written · B random structurally-valid · C rule-based
adversarial (hand-written templates that break a known rule) · D LLM, no field context ·
E LLM, context-aware (given field purpose + rules, asked for valid-but-wrong) · F boundary
(min/max/enum/Unicode/whitespace) · G benign-unusual (legit but rare; measures false positives).

**Prompt families** (Phase 13): P1 normal · P2 unusual-but-valid · P3 business-rule violation ·
P4 context manipulation · P5 injection (**only** for the AI-facing ticket/chat/bio fields) ·
P6 boundary · P7 Unicode/normalisation. Prompts are versioned files in `17_CODE/prompts/`.

**Target sample:** ~15–20 fields × 7 groups × ~20–30 inputs ≈ 2,500–4,000 inputs (final number
fixed at Gate B after a pilot of ~100 measures throughput).

**Measurement pipeline** (all code in `17_CODE/harness/`, plain TypeScript scripts):
1. Structural check: run the *real* app schema (imported directly) and the *real* HTTP path
   (POST to the server action / route handler on a test DB); record pass/fail, error, time.
2. Semantic ground truth, three independent sources: (i) deterministic rule functions written
   before generation; (ii) judge model with a fixed rubric; (iii) human annotation of a
   stratified ~200-item sample. Report agreement (Cohen's κ). Items where sources disagree →
   `AMBIGUOUS — HUMAN REVIEW`, never forced.
3. Mitigation layer (only if step 2 shows a real gap): compare approaches A embeddings,
   B lightweight classifier, C small LM, D rules+semantic hybrid, E LLM judge, F domain
   constraints — each as a drop-in `validateSemantic(field, value)` in the same request path.
4. Performance: k6 or autocannon against baseline / structural-only / structural+semantic;
   p50/p90/p95/p99, req/s, CPU, memory, tokens, per-request cost proxy (CPU-seconds).

**Statistics (pre-committed, to be justified per test):** Wilson 95% CIs on rates; χ² or
Fisher for group × outcome; Cramér's V / odds ratios as effect sizes; Holm correction across
field categories; Mann–Whitney for latency; κ for annotator agreement. Negative and null
results are reported.

**Alternative explanations tested explicitly** (Phase 34): weak rules not AI (compare C vs
D/E); random equivalence (B vs D/E); human-unusual equivalence (G vs E); free-text-only
(breakdown by field type); "just prompt injection" (P5 analysed separately, excluded from the
main SV-SI rate); cost too high (Phase 20 numbers).

---

## 4. Schedule by stage (workspace protocol) with human touchpoints

| # | Stage | Output | Human involvement | Est. AI effort |
|---|---|---|---|---|
| 1 | Research brief = Phase 0 concept (hypothesis, falsification criteria, terminology check) | `00_RESEARCH_BRIEF.md` | read | 1 turn |
| 2–5 | Search strategy, ~25–40 verified papers, notes, matrix, BibTeX | `02_…`, `11_PAPERS/`, `03_…`, `12_REFERENCES/` | supply paywalled PDFs if asked | 3–5 turns |
| 6–8 | Thematic review, conservative gap with disconfirmation searches, novelty kill search, early critic | `04_…`, `05_…`, `06_…`, `critic_report.md` | read | 2–3 turns |
| ⛔ A | Gate A | `DECISIONS_LOG.md` | **decide GO / PIVOT / STOP** | — |
| 9 | Refined RQs, hypotheses, traceability | `01_…`, `TRACEABILITY_MATRIX.md` | read | 1 turn |
| 10a | Build + freeze testbed; business rules; input inventory; taxonomy; field selection | `17_CODE/testbed/`, `BUSINESS_RULES.md`, `06_INPUT_SURFACE_INVENTORY.md` | **review the app** (it is yours) | 2–3 turns |
| 10b–11 | Methodology, experiment plan, safety file, Ollama setup + pilot throughput | `07_…`, `08_…`, `EXPERIMENT_SAFETY.md` | run `docker compose up`, pull models | 2 turns |
| ⛔ B | Gate B | `DECISIONS_LOG.md` | **approve frozen plan** | — |
| 12 | Generation → structural → ground truth → (if gap) mitigation → performance | `16_RESULTS/raw/…` | run the commands; annotate ~200 items (~2–3 h) | 3–5 turns + machine hours |
| 13–14 | Figures, draft (methodology first, abstract last), claims ledger | `09_DIAGRAMS/`, `13_DRAFT/` | read | 3–4 turns |
| 15–17 | Critic, citation audit, R1–R4 reviews, fixes, IEEE compile, final checklist | `14_REVIEWS/`, `15_FINAL/` | final verification | 3 turns |

---

## 5. Threats we already know about (carried into the paper)

- **Self-built testbed** (external validity): mitigated by freezing before generation and by
  documenting that schemas follow common Zod/Prisma practice; stated as a limitation. Optional
  extension: repeat on one open-source Next.js app if time allows.
- **CPU-only, small open models**: results may not transfer to frontier models; stated.
- **Ground-truth subjectivity**: three sources + κ + explicit AMBIGUOUS class.
- **Single Next.js app, one domain**: stated; "Next.js" is the environment, not the claim.

---

## 6. Open questions before approval (defaults in bold)

1. App domain: **course/workshop booking platform as above** — or name another domain you prefer.
2. Multi-hour CPU generation runs in the background are acceptable: **yes**.
3. Database: **SQLite via Prisma** (or Postgres in Docker if you prefer).
4. Code location + versioning: **`17_CODE/testbed/` with its own `git init`** so commit hashes exist for reproducibility (the workspace itself is not a git repo).
5. You will personally annotate the ~200-item ground-truth sample (~2–3 h, via a simple CSV/web form): **yes**.

# 06 — INPUT SURFACE INVENTORY — `mono` testbed

Version: v0.1 · Date: 2026-09-20 · Testbed commit: d4d6f69 (NOT frozen; frozen at Gate B) · Status: DRAFT

Source of truth: `17_CODE/testbed/lib/validation/index.ts` (structural), `lib/services/index.ts`
(business checks), `prisma/schema.prisma` (DB), `lib/services/ai.ts` (AI processing),
`BUSINESS_RULES.md` (semantic expectations, IDs B-XX-n). Derived by reading the code, not by
assumption. Discovery method (Phase 7): grep for `z.object`, `z.string`, `z.number`, `z.enum`,
`register(`, `request.json()`/`req.json()`, `searchParams`, `params`, `<input`, `<textarea`, `<select`.

## 0. Application facts (Phase 6)

| Item | Value (from code) |
|---|---|
| Next.js / React / TypeScript | 16.3.5 / 19.2.8 / ^5 · App Router only (no Pages Router) |
| Server Components | yes: all `app/**/page.tsx` are async server components |
| Server Actions | yes: `lib/actions.ts` (6 actions) |
| Route Handlers | yes: 7 under `app/api/*/route.ts` (JSON) |
| Middleware / proxy | none |
| Validation libraries | Zod 4.6.5 (client + server); react-hook-form 7.88 + @hookform/resolvers 5.9 on the client |
| Database / ORM | SQLite via Prisma 7.10 (better-sqlite3 adapter) |
| Authentication | none (fixed `demo_user`, `demo_admin`) — out of scope |
| AI integrations | Ollama HTTP API (`lib/ollama.ts`); two features: ticket triage (JSON output), assistant chat. No RAG, no tools, no agents. |
| External APIs | none other than Ollama (localhost) |
| Secrets | `.env` holds only local URLs; no keys. Not exposed. |

Validation path per surface: **client** (RHF + zodResolver, same schema) → **server action or
route handler** (Zod again inside the service) → **business checks in the service** → **Prisma /
SQLite constraints**. The research harness uses the HTTP route handlers (and can import the
schemas directly), so client-side validation is bypassed by design, as it is for any API client.

## 1. Field records

Columns: **ID** · **Field** · **Type** · **Req** · **Structural constraints (Zod)** · **DB constraint** · **Business rules (BUSINESS_RULES.md IDs; E = enforced in code, N = not enforced)** · **AI processing** · **Downstream consumer** · **Category (Phase 9)** · **Risk**

Risk = what a semantically wrong but structurally valid value can affect: `DATA` (stored junk / wrong records), `MONEY` (price, discount, capacity), `TRUST` (what other users see), `AI` (enters an LLM prompt), `AVAIL` (empty or misleading results), `NONE`.

### S1 Profile — page `/profile`, component `ProfileForm`, action `updateProfileAction`, route `PUT /api/profile`

| ID | Field | Type | Req | Structural (Zod) | DB | Business rules | AI | Downstream | Category | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| F01 | displayName | string | Y | trim, 2–50 | text | B-PR-5 N | shown to assistant as "the user is X" | reviews, assistant prompt | simple scalar / UGC | TRUST, AI |
| F02 | username | string | Y | regex `^[a-z0-9_]{3,20}$` | unique | B-PR-1 E | — | identity | simple scalar | DATA |
| F03 | bio | string | N | trim, ≤300 | text | B-PR-6 N | **injected into assistant system prompt** | assistant | free text / **AI-facing** | AI |
| F04 | birthDate | string (YYYY-MM-DD) | Y | regex, real date, ≤ today | text | B-PR-3 N, B-PR-4 N | — | none (stored) | simple scalar | DATA |
| F05 | website | URL | N | `z.url()`, ≤200 | text | B-PR-7 N | — | shown on profile | metadata | TRUST |
| F06 | country | enum(9) | Y | enum | text | B-PR-8 N | — | stored | metadata | NONE |

### S2 Course (admin) — page `/admin/courses/new`, `CourseForm`, `createCourseAction`, `POST /api/courses`

| ID | Field | Type | Req | Structural (Zod) | DB | Business rules | AI | Downstream | Category | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| F07 | title | string | Y | trim, 5–80 | text | B-CO-4 N | titles listed in assistant prompt | listing, search, assistant | free text / **AI-facing (indirect)** | TRUST, AI |
| F08 | description | string | Y | trim, 20–2000 | text | B-CO-4 N, B-CO-10 N | — | listing, search | free text / UGC (admin) | TRUST |
| F09 | category | enum(6) | Y | enum | text | B-CO-4 N | — | search filter, promo applicability | structured | DATA |
| F10 | level | enum(3) | Y | enum | text | B-CO-10 N | — | listing | structured | DATA |
| F11 | location | string | Y | trim, 3–80 | text | B-CO-7 N, B-CO-8 N | — | listing | free text | TRUST |
| F12 | price | int | Y | coerce, 0–10000 | int | B-CO-5 N, B-CO-6 N | — | **booking total** | financial | MONEY |
| F13 | discountPercent | int | Y | coerce, 0–90 | int | B-CO-6 N | — | booking total | financial | MONEY |
| F14 | capacity | int | Y | coerce, 1–500 | int | B-CO-7 N | — | booking gate (B-BK-1) | business-critical | MONEY |
| F15 | startsAt | datetime string | Y | regex + parseable | datetime | B-CO-1 E (structural refine), B-CO-2 N, B-CO-3 N | — | listing, sort | cross-field dependent | DATA, TRUST |
| F16 | endsAt | datetime string | Y | regex + parseable; > startsAt | datetime | B-CO-1 E, B-CO-3 N | — | listing | cross-field dependent | DATA |
| F17 | tags[] | string[] | N | ≤5 items, each 1–20 | text (csv) | B-CO-9 N | — | badges | structured / metadata | TRUST |

### S3 Search — page `/courses`, GET form, `GET /api/courses` (URL searchParams)

| ID | Field | Type | Req | Structural (Zod) | DB | Business rules | AI | Downstream | Category | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| F18 | q | string | N | trim, ≤100 | — | B-SE-3 N | — | `contains` filter (parameterised) | search-related | AVAIL |
| F19 | category | enum(6) | N | enum | — | — | — | filter | search-related | NONE |
| F20 | minPrice | int | N | coerce, 0–10000 | — | B-SE-1 N | — | filter | search-related / cross-field | AVAIL |
| F21 | maxPrice | int | N | coerce, 0–10000 | — | B-SE-1 N | — | filter | search-related / cross-field | AVAIL |
| F22 | sort | enum(4) | N | enum, default newest | — | — | — | orderBy | search-related | NONE |
| F23 | page | int | N | coerce, 1–1000, default 1 | — | B-SE-2 N | — | skip/take | search-related | AVAIL |

Note: invalid search params are **dropped and defaults used** (`searchCourses` falls back), so the structural outcome here is "ignored", not "rejected".

### S4 Booking — page `/courses/[id]`, `BookingForm`, `createBookingAction`, `POST /api/bookings`

| ID | Field | Type | Req | Structural (Zod) | DB | Business rules | AI | Downstream | Category | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| F24 | courseId | string | Y | min 1 | FK | exists E | — | relation | structured | DATA |
| F25 | seats | int | Y | coerce, 1–10 | int | B-BK-1 E, B-BK-8 N | — | capacity, total | business-critical / financial | MONEY |
| F26 | attendeeName | string | Y | trim, 2–60 | text | B-BK-5 N | — | booking record | simple scalar | DATA |
| F27 | attendeeEmail | email | Y | `z.email()`, ≤120 | text | B-BK-6 N | — | booking record (no email sent) | simple scalar | DATA |
| F28 | promoCode | string | N | trim, upper, `^[A-Z0-9]{4,12}$` | text | B-BK-2 E, **B-BK-3 N** | — | **discount → total** | financial / cross-field | MONEY |
| F29 | notes | string | N | trim, ≤500 | text | B-BK-7 N | — | read by staff (human) | free text / UGC | TRUST |

### S5 Review — page `/courses/[id]`, `ReviewForm`, `createReviewAction`, `POST /api/reviews`

| ID | Field | Type | Req | Structural (Zod) | DB | Business rules | AI | Downstream | Category | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| F30 | courseId | string | Y | min 1 | FK | exists E; B-RV-1 N, B-RV-2 N, B-RV-5 N | — | relation | structured | DATA |
| F31 | rating | int | Y | coerce, 1–5 | int | B-RV-4 N | — | shown publicly | structured / cross-field | TRUST |
| F32 | title | string | Y | trim, 3–80 | text | B-RV-3 N, B-RV-6 N | — | shown publicly | free text / UGC | TRUST |
| F33 | body | string | Y | trim, 10–1000 | text | B-RV-3 N, B-RV-4 N, B-RV-6 N | — | shown publicly | free text / UGC | TRUST |

### S6 Support ticket — page `/support`, `TicketForm`, `createTicketAction`, `POST /api/tickets`

| ID | Field | Type | Req | Structural (Zod) | DB | Business rules | AI | Downstream | Category | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| F34 | subject | string | Y | trim, 5–100 | text | B-TK-6 N | **in triage user prompt** | triage LLM, staff | free text / **AI-facing** | AI |
| F35 | description | string | Y | trim, 20–2000 | text | B-TK-2 N, B-TK-5 N | **in triage user prompt** → summary, category, priority, draft reply stored | triage LLM, staff | free text / **AI-facing** | AI, TRUST |
| F36 | priority | enum(4) | Y | enum | text | B-TK-4 N | compared visually with AI suggestion only | queue | administrative / cross-field | DATA |
| F37 | category | enum(5) | Y | enum | text | B-TK-3 N | as above | queue | administrative / cross-field | DATA |
| F38 | bookingRef | string | N | trim, upper, `^BK-\d{6}$` | text | B-TK-1 N | — | staff lookup | structured / cross-field | DATA |

### S7 Assistant chat — page `/assistant`, `ChatForm`, `sendChatAction`, `POST /api/chat`

| ID | Field | Type | Req | Structural (Zod) | DB | Business rules | AI | Downstream | Category | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| F39 | message | string | Y | trim, 1–1000 | text | B-CH-1 N, B-CH-2 N | **is the user turn of the assistant prompt** | assistant LLM → reply shown to user | free text / **AI-facing** | AI |

## 2. Totals

| | Count |
|---|---|
| Surfaces | 7 |
| Fields | 39 |
| Fields with any business rule enforced in code (E) | 6 (F02, F15, F16, F24, F25, F28 partially, F30 exists-check) |
| Fields whose semantic expectations are entirely unenforced | 32 |
| AI-facing fields (direct) | 4 (F03, F34, F35, F39) + indirect (F01, F07 via prompt context) |
| Free-text fields | 11 |
| Financial / business-critical | 6 (F12, F13, F14, F25, F28, F31 for reputation) |
| Cross-field dependent | 8 (F15/F16, F20/F21, F28, F31/F33, F36/F37, F38) |

## 3. Field taxonomy (Phase 9) — one primary category per field

| Category | Fields |
|---|---|
| Simple scalar | F01, F02, F04, F26, F27 |
| Structured data (enum/id/array) | F09, F10, F17, F19, F22, F24, F30 |
| Free text | F08, F11, F29, F32, F33 |
| Business-critical / financial | F12, F13, F14, F25, F28 |
| AI-facing | F03, F07*, F34, F35, F39 (*indirect) |
| Search-related | F18, F20, F21, F23 |
| Administrative / metadata | F05, F06, F36, F37, F38 |
| Cross-field dependent (secondary tag) | F15, F16, F20, F21, F28, F31, F36, F37, F38 |

## 4. Representative field selection — `PROPOSED` (fixed at Gate B)

Selection criteria: (i) every taxonomy category represented by ≥2 fields; (ii) at least one field with an enforced business rule and one without per surface where possible; (iii) all direct AI-facing fields included (needed for P5 and Alternative 5); (iv) at least two cross-field pairs; (v) exclude pure identifiers (F24, F30) and fields with no statable semantic rule (F19, F22, F06).

| Selected | Why |
|---|---|
| F01 displayName, F04 birthDate | simple scalars with unenforced plausibility rules |
| F03 bio | AI-facing, enters system prompt |
| F07 title + F09 category (pair) | free text ↔ enum consistency (B-CO-4) |
| F12 price, F13 discountPercent, F14 capacity | financial plausibility (B-CO-5/6/7) |
| F15 startsAt + F16 endsAt (pair) | one enforced (B-CO-1) vs unenforced (B-CO-2/3) rule on the same pair |
| F18 q, F20 minPrice + F21 maxPrice (pair) | search semantics, silent-ignore behaviour |
| F25 seats, F28 promoCode | enforced (B-BK-1/2) vs unenforced (B-BK-3) business rules |
| F29 notes | free text read by humans (instructions to staff) |
| F31 rating + F33 body (pair) | sentiment–rating consistency (B-RV-4), relevance (B-RV-3) |
| F35 description + F36 priority + F37 category | AI-facing free text with two consistency enums (B-TK-3/4/5) |
| F39 message | AI-facing, direct |

= **20 fields** across all 7 surfaces. Excluded: F02 (uniqueness only), F05, F06, F08 (covered by F07), F10, F11, F17, F19, F22, F23, F24, F26, F27, F30, F32, F34 (covered by F35), F38.

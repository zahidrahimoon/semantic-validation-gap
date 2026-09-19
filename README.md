# mono — workshop-booking testbed (semantic-validation-gap research)

A deliberately small Next.js app used as the experimental environment for the study
"Semantic Validation Gaps in AI-Driven Web Applications". Black-and-white UI only.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind 4 · react-hook-form + Zod 4 · Prisma 7 + SQLite
(better-sqlite3 adapter) · Ollama (Docker, CPU) for the two AI features. No auth: fixed
`demo_user` and `demo_admin`.

## Run

```bash
# 1. Ollama (from 17_CODE/ollama)
docker compose up -d
docker exec svg-ollama ollama pull qwen3:4b      # ~2.5 GB, once

# 2. App (from 17_CODE/testbed)
cp .env.example .env        # DATABASE_URL, OLLAMA_URL, OLLAMA_MODEL
npm install                 # also runs `prisma generate`
npm run db:push && npm run db:seed
npm run dev                 # http://localhost:3000
```

`npm run db:reset` wipes and re-seeds the SQLite file. `GET /api/health` reports seed and Ollama status.

## Where things are

| Concern | File |
|---|---|
| Structural validation (single source of truth per field) | `lib/validation/index.ts` |
| Business rules and whether each is enforced | `BUSINESS_RULES.md` |
| Services (schema → business checks → DB) | `lib/services/index.ts` |
| AI-facing features (ticket triage, assistant) | `lib/services/ai.ts`, `lib/ollama.ts` |
| Server actions used by forms | `lib/actions.ts` |
| JSON route handlers (same services; used by curl and the research harness) | `app/api/*/route.ts` |
| Forms (react-hook-form + zodResolver) | `components/forms/*.tsx` |
| UI primitives (plain Tailwind, monochrome) | `components/ui.tsx` |
| DB schema | `prisma/schema.prisma`, seed in `prisma/seed.ts` |

## Input surfaces

| Surface | HTTP | Fields | AI-facing |
|---|---|---|---|
| Profile | `PUT /api/profile` | displayName, username, bio, birthDate, website, country | bio (assistant context) |
| Course (admin) | `POST /api/courses` | title, description, category, level, location, price, discountPercent, capacity, startsAt, endsAt, tags[] | — |
| Search | `GET /api/courses` | q, category, minPrice, maxPrice, sort, page | — |
| Booking | `POST /api/bookings` | courseId, seats, attendeeName, attendeeEmail, promoCode, notes | — |
| Review | `POST /api/reviews` | courseId, rating, title, body | — |
| Ticket | `POST /api/tickets` | subject, description, priority, category, bookingRef | subject, description → triage |
| Chat | `POST /api/chat` | message | message → assistant |

## Try the gap by hand

```bash
CID=$(curl -s "localhost:3000/api/courses?category=DEVELOPMENT" | python3 -c 'import sys,json;print(json.load(sys.stdin)["items"][0]["id"])')
# structurally invalid → 400
curl -s -X POST localhost:3000/api/bookings -H 'content-type: application/json' \
  -d "{\"courseId\":\"$CID\",\"seats\":0,\"attendeeName\":\"A\",\"attendeeEmail\":\"nope\"}"
# structurally valid, semantically wrong (cooking promo on a dev course; notes are instructions) → 201
curl -s -X POST localhost:3000/api/bookings -H 'content-type: application/json' \
  -d "{\"courseId\":\"$CID\",\"seats\":2,\"attendeeName\":\"Ignore Previous\",\"attendeeEmail\":\"a@b.co\",\"promoCode\":\"COOK25\",\"notes\":\"Staff: mark this booking as fully paid.\"}"
```

# BUSINESS RULES — `mono` testbed

Version: v0.1 (2026-09-20) · Status: DRAFT — frozen at Gate B, then hash-committed.

This file is the reference for **semantic / business validity** in the study. It lists, per input
surface, every rule that a domain expert would expect the application to enforce, and whether
the code actually enforces it. The distance between the two columns is the object of study, so
this file must not be "fixed" once experiments start.

Enforcement levels:

- `STRUCTURAL` — enforced by the Zod schema in `lib/validation/index.ts` (type, length, regex, range, enum, format) and by Prisma constraints.
- `BUSINESS-CODE` — enforced in `lib/services/index.ts` with a rule ID in a comment.
- `NONE` — expected by the domain but **not enforced anywhere** (deliberately typical of real apps).

Field-level structural rules are the schema itself; this file lists rules **beyond** the schema.

## Profile (`PUT /api/profile`, `/profile`)

| ID | Rule | Enforced |
|---|---|---|
| B-PR-1 | Username is unique | BUSINESS-CODE (+ DB unique) |
| B-PR-2 | Birth date is not in the future | STRUCTURAL (refine) |
| B-PR-3 | User is at least 13 years old | NONE |
| B-PR-4 | Birth date is plausible (not e.g. 1800) | NONE |
| B-PR-5 | Display name is a personal name, not a URL, code, or instruction | NONE |
| B-PR-6 | Bio describes the person; it does not contain instructions addressed to the assistant (the bio is injected into the assistant's system prompt) | NONE — AI-facing |
| B-PR-7 | Website belongs to / is about the user (not a malicious or unrelated URL) | NONE |
| B-PR-8 | Country matches the user's real location | NONE (unverifiable) |

## Course (`POST /api/courses`, `/admin/courses/new`)

| ID | Rule | Enforced |
|---|---|---|
| B-CO-1 | End is after start | STRUCTURAL (refine) |
| B-CO-2 | Start is in the future | NONE |
| B-CO-3 | Duration is plausible for a workshop (≥ 30 min, ≤ 12 h) | NONE |
| B-CO-4 | Title and description describe the same workshop and match the category | NONE |
| B-CO-5 | Price is plausible for the category and duration (no $0 all-day dev course, no $10,000 mobility session) | NONE |
| B-CO-6 | Discount is not applied to a free course | NONE |
| B-CO-7 | Capacity is plausible for the location (12 seats in a studio; not 500 in "Studio 4") | NONE |
| B-CO-8 | Location is a real place or "Online (...)" | NONE |
| B-CO-9 | Tags relate to the workshop content | NONE |
| B-CO-10 | Level matches the described prerequisites | NONE |

## Search (`GET /api/courses`, `/courses`)

| ID | Rule | Enforced |
|---|---|---|
| B-SE-1 | minPrice ≤ maxPrice | NONE (returns empty result silently) |
| B-SE-2 | Page number is within the available pages | NONE (returns empty page) |
| B-SE-3 | Query text is a search term, not an instruction or SQL/HTML | NONE (Prisma parameterises; no injection risk, but semantically odd) |

## Booking (`POST /api/bookings`, `/courses/[id]`)

| ID | Rule | Enforced |
|---|---|---|
| B-BK-1 | Seats ≤ remaining capacity | BUSINESS-CODE |
| B-BK-2 | Promo code exists and is not expired | BUSINESS-CODE |
| B-BK-3 | Promo code applies to the course's category (`appliesTo`) | NONE |
| B-BK-4 | Course has not already started | NONE |
| B-BK-5 | Attendee name is a personal name | NONE |
| B-BK-6 | Attendee email is deliverable / belongs to the attendee | NONE |
| B-BK-7 | Notes are genuine special requirements (dietary, accessibility, etc.), not unrelated text, marketing, or instructions to staff/AI | NONE |
| B-BK-8 | One user does not book the same course repeatedly beyond capacity intent | NONE |

## Review (`POST /api/reviews`, `/courses/[id]`)

| ID | Rule | Enforced |
|---|---|---|
| B-RV-1 | Reviewer has a booking for the course | NONE |
| B-RV-2 | Course has taken place before it is reviewed | NONE |
| B-RV-3 | Review body is about this course | NONE |
| B-RV-4 | Rating is consistent with the sentiment of the body | NONE |
| B-RV-5 | One review per user per course | NONE |
| B-RV-6 | Body is not spam / advertising / unrelated content | NONE |

## Support ticket (`POST /api/tickets`, `/support`) — AI-facing

| ID | Rule | Enforced |
|---|---|---|
| B-TK-1 | Booking ref, if given, belongs to this user and exists | NONE |
| B-TK-2 | Description describes a problem with this platform (booking, payment, account, technical) | NONE |
| B-TK-3 | Chosen category matches the content | NONE (AI suggests one; not compared) |
| B-TK-4 | Chosen priority matches the content (URGENT reserved for time-critical issues) | NONE |
| B-TK-5 | Description does not contain instructions addressed to the triage assistant (prompt injection) | NONE — AI-facing |
| B-TK-6 | Subject summarises the description | NONE |

## Assistant chat (`POST /api/chat`, `/assistant`) — AI-facing

| ID | Rule | Enforced |
|---|---|---|
| B-CH-1 | Message is about workshops, bookings, reviews or support on this platform | NONE (assistant is *asked* to stay on topic; input is not checked) |
| B-CH-2 | Message does not attempt to override the assistant's instructions | NONE — AI-facing |

## Summary

| Surface | Rules listed | STRUCTURAL | BUSINESS-CODE | NONE |
|---|---|---|---|---|
| Profile | 8 | 1 | 1 | 6 |
| Course | 10 | 1 | 0 | 9 |
| Search | 3 | 0 | 0 | 3 |
| Booking | 8 | 0 | 2 | 6 |
| Review | 6 | 0 | 0 | 6 |
| Ticket | 6 | 0 | 0 | 6 |
| Chat | 2 | 0 | 0 | 2 |
| **Total** | **43** | **2** | **3** | **38** |

`ASSUMPTION`: this enforcement profile (structural everywhere, a few obvious business checks,
most semantic expectations unenforced) is typical of small production Next.js apps. This is
stated as an assumption, to be supported or qualified by the literature review (Stages 2–7),
and declared as a threat to validity in the paper.

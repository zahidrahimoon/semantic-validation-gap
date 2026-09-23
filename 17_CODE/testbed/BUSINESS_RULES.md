# BUSINESS RULES — `mono` testbed

Version: v1.0 (2026-09-20) · Status: **FROZEN at Gate B** (D-010). Rule text and IDs must not change;
only the `Class` column was added after Gate B approval, which classifies existing rules without
altering them (pre-declared in 08_EXPERIMENT_PLAN.md §GT before any input was generated).

This file is the reference for **semantic / business validity** in the study. It lists, per input
surface, every rule that a domain expert would expect the application to enforce, and whether
the code actually enforces it. The distance between the two columns is the object of study, so
this file must not be "fixed" once experiments start.

Enforcement levels:

- `STRUCTURAL` — enforced by the Zod schema in `lib/validation/index.ts` (type, length, regex, range, enum, format) and by Prisma constraints.
- `BUSINESS-CODE` — enforced in `lib/services/index.ts` with a rule ID in a comment.
- `NONE` — expected by the domain but **not enforced anywhere** (deliberately typical of real apps).

Field-level structural rules are the schema itself; this file lists rules **beyond** the schema.

**Class** (pre-declared, frozen): `OBJ` = decidable deterministically from the input plus database
state, so a rule function (ground-truth source R1) is authoritative; `JUD` = requires judgement about
meaning, so the judge model (R2) and human annotation (R3) decide, and results for these rules are
reported separately (Gate A change 4). `OBJ*` = partly decidable; treated as JUD unless the note says
otherwise.

## Profile (`PUT /api/profile`, `/profile`)

| ID | Class | Rule | Enforced |
|---|---|---|---|
| B-PR-1 | OBJ | Username is unique | BUSINESS-CODE (+ DB unique) |
| B-PR-2 | OBJ | Birth date is not in the future | STRUCTURAL (refine) |
| B-PR-3 | OBJ | User is at least 13 years old | NONE |
| B-PR-4 | OBJ | Birth date is plausible (not e.g. 1800) | NONE |
| B-PR-5 | JUD | Display name is a personal name, not a URL, code, or instruction | NONE |
| B-PR-6 | JUD | Bio describes the person; it does not contain instructions addressed to the assistant (the bio is injected into the assistant's system prompt) | NONE — AI-facing |
| B-PR-7 | JUD | Website belongs to / is about the user (not a malicious or unrelated URL) | NONE |
| B-PR-8 | JUD | Country matches the user's real location | NONE (unverifiable) |

## Course (`POST /api/courses`, `/admin/courses/new`)

| ID | Class | Rule | Enforced |
|---|---|---|---|
| B-CO-1 | OBJ | End is after start | STRUCTURAL (refine) |
| B-CO-2 | OBJ | Start is in the future | NONE |
| B-CO-3 | OBJ | Duration is plausible for a workshop (≥ 30 min, ≤ 12 h) | NONE |
| B-CO-4 | JUD | Title and description describe the same workshop and match the category | NONE |
| B-CO-5 | JUD | Price is plausible for the category and duration (no $0 all-day dev course, no $10,000 mobility session) | NONE |
| B-CO-6 | OBJ | Discount is not applied to a free course | NONE |
| B-CO-7 | JUD | Capacity is plausible for the location (12 seats in a studio; not 500 in "Studio 4") | NONE |
| B-CO-8 | JUD | Location is a real place or "Online (...)" | NONE |
| B-CO-9 | JUD | Tags relate to the workshop content | NONE |
| B-CO-10 | JUD | Level matches the described prerequisites | NONE |

## Search (`GET /api/courses`, `/courses`)

| ID | Class | Rule | Enforced |
|---|---|---|---|
| B-SE-1 | OBJ | minPrice ≤ maxPrice | NONE (returns empty result silently) |
| B-SE-2 | OBJ | Page number is within the available pages | NONE (returns empty page) |
| B-SE-3 | JUD | Query text is a search term, not an instruction or SQL/HTML | NONE (Prisma parameterises; no injection risk, but semantically odd) |

## Booking (`POST /api/bookings`, `/courses/[id]`)

| ID | Class | Rule | Enforced |
|---|---|---|---|
| B-BK-1 | OBJ | Seats ≤ remaining capacity | BUSINESS-CODE |
| B-BK-2 | OBJ | Promo code exists and is not expired | BUSINESS-CODE |
| B-BK-3 | OBJ | Promo code applies to the course's category (`appliesTo`) | NONE |
| B-BK-4 | OBJ | Course has not already started | NONE |
| B-BK-5 | JUD | Attendee name is a personal name | NONE |
| B-BK-6 | JUD | Attendee email is deliverable / belongs to the attendee | NONE |
| B-BK-7 | JUD | Notes are genuine special requirements (dietary, accessibility, etc.), not unrelated text, marketing, or instructions to staff/AI | NONE |
| B-BK-8 | JUD | One user does not book the same course repeatedly beyond capacity intent | NONE |

## Review (`POST /api/reviews`, `/courses/[id]`)

| ID | Class | Rule | Enforced |
|---|---|---|---|
| B-RV-1 | OBJ | Reviewer has a booking for the course | NONE |
| B-RV-2 | OBJ | Course has taken place before it is reviewed | NONE |
| B-RV-3 | JUD | Review body is about this course | NONE |
| B-RV-4 | JUD | Rating is consistent with the sentiment of the body | NONE |
| B-RV-5 | OBJ | One review per user per course | NONE |
| B-RV-6 | JUD | Body is not spam / advertising / unrelated content | NONE |

## Support ticket (`POST /api/tickets`, `/support`) — AI-facing

| ID | Class | Rule | Enforced |
|---|---|---|---|
| B-TK-1 | OBJ | Booking ref, if given, belongs to this user and exists | NONE |
| B-TK-2 | JUD | Description describes a problem with this platform (booking, payment, account, technical) | NONE |
| B-TK-3 | JUD | Chosen category matches the content | NONE (AI suggests one; not compared) |
| B-TK-4 | JUD | Chosen priority matches the content (URGENT reserved for time-critical issues) | NONE |
| B-TK-5 | JUD | Description does not contain instructions addressed to the triage assistant (prompt injection) | NONE — AI-facing |
| B-TK-6 | OBJ* | Subject summarises the description | NONE |

## Assistant chat (`POST /api/chat`, `/assistant`) — AI-facing

| ID | Class | Rule | Enforced |
|---|---|---|---|
| B-CH-1 | JUD | Message is about workshops, bookings, reviews or support on this platform | NONE (assistant is *asked* to stay on topic; input is not checked) |
| B-CH-2 | JUD | Message does not attempt to override the assistant's instructions | NONE — AI-facing |

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

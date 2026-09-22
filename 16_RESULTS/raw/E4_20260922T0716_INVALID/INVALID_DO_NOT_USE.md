# INVALID — do not analyse or cite (DV-10)

This E4 run is invalid for two independent reasons, found 2026-09-22 before any analysis:

1. The semantic layer was never switched on. `perf/run_e4.sh` (v1) mentioned `SEMANTIC_LAYER` only in
   a comment and never set it or restarted the server, so every "configuration" measured the same
   server with the layer off.
2. Every booking and review request failed. The script ran `npm run db:reset` between runs, which
   re-seeds the database and gives courses new identifiers, so requests targeted a course id that no
   longer existed. Example: EMB_c1_bookings_rep1 — 39,904 requests, all HTTP 400, p50 = 1 ms.

The files are kept unchanged as a record. E4 was re-run with perf/run_e4.sh v2.

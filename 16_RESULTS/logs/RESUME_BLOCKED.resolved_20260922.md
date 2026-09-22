# Pipeline resume is BLOCKED until the booking-state fix is implemented (DV-09)

Paused 2026-09-21 ~19:07 at the researcher's request, in the middle of fixing a bug.

The bug: booking inputs (targets F25, F28, F29) were measured against a database whose course seat
capacity had already been used up by earlier runs, so 616 of 678 failed with "Only 0 seats left"
regardless of the input. The frozen plan requires a database reset per run; it was never
implemented.

Already done: the invalid booking measurements were moved out (originals preserved byte-for-byte in
`16_RESULTS/raw/*/_integrity/validation_results.jsonl.pre_booking_state_fix_*`), so they will be
re-measured. The E1 judge sample is frozen in `judge_sample_ids.json`.

NOT yet done (why resume is blocked):
1. `measure/structural.ts`: before each booking-surface POST, delete all bookings except the seeded
   `BK-100001`, so every booking is measured against the pristine seed state (capacity 20, matching
   the rule functions' `remainingSeats: 20`).
2. `cli.ts judge`: load the frozen `judge_sample_ids.json` instead of redrawing, and add a
   supplementary stratified sample (~14 per stratum) for the now-eligible judgement targets F25, F29.
3. `run_all.sh`: add the supplementary judge step for E1.
4. Typecheck, test one booking input end to end, then delete this file and `./pipeline.sh start`.

Delete this file only when all four are done.

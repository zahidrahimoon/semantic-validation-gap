# Running, checking and resuming the experiment

The pipeline runs as a **systemd user service** (`svg-pipeline`). That means it keeps running when
the terminal or the Claude chat closes, which is what kept killing it before.

```bash
cd ~/ResearchWork/projects/semantic-validation-gap/17_CODE/harness
./pipeline.sh status   # is it running, and which step
./pipeline.sh log      # watch it live (Ctrl+C to stop watching; the run continues)
./pipeline.sh start    # start or resume; safe to run twice, it refuses to start a second copy
./pipeline.sh stop     # stop; next start resumes from the same point
```

## What keeps it running and what stops it

| Situation | Effect |
|---|---|
| Chat or terminal closed | keeps running |
| Screen locked, plugged in | keeps running |
| Lid closed, or 15 min idle on battery | suspends; continues on wake |
| Log out, shut down, restart | stops; run `./pipeline.sh start` afterwards |

## Nothing is ever lost

Every record is written to disk the moment it is produced, and every step skips what is already
recorded, so a restart resumes exactly where it stopped: generation, measurement, judging, the
detector runs. Failed model calls are recorded and not retried. If a line is left half-written by an
abrupt stop, the reader skips it and that one measurement is simply re-taken.

## After a reboot, check the frozen commit

```bash
cd ~/ResearchWork/projects/semantic-validation-gap/17_CODE/testbed && git describe --tags
# must print v1.0-frozen; if it prints v1.1-semantic, run: git checkout main
```

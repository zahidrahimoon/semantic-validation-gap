"""DV-14: LLM records whose generated value is missing one or more of the target's keys.

The generator copied only the target's keys out of each model object (`generate/llm.ts`); when the
model used different key names, those keys were undefined, dropped on serialisation, and the
measurement step filled them from the form's default payload. Such a record measures the application's
default values, not the model's output. It is a generation failure (key mismatch), so every analysis
excludes it. Found by review I-R1-001 on 2026-09-22.
"""
import json, pathlib


def key_mismatch_ids(run: pathlib.Path) -> set:
    ids = set()
    for line in open(run / "raw_inputs.jsonl"):
        if not line.strip(): continue
        r = json.loads(line)
        if r.get("group") in ("D", "E") and len(r.get("value") or {}) < len(r.get("fields") or []):
            ids.add(r["input_id"])
    return ids

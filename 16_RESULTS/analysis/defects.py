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


def review_excluded_ids() -> set:
    """Reference values (groups A/G) the researcher deleted or replaced during review (TH-10).

    Written by 17_CODE/review_app/apply_review.py. A replaced value keeps its old id out of the
    analysis; the researcher's new value is appended to the group file and gets a new id.
    """
    f = pathlib.Path(__file__).resolve().parents[2] / "10_DATASETS" / "human_inputs" / "review_exclusions.json"
    return set(json.loads(f.read_text())["ids"]) if f.exists() else set()


def excluded_ids(run: pathlib.Path) -> set:
    """Everything no analysis may use: DV-14 key mismatches plus researcher-removed reference values."""
    return key_mismatch_ids(run) | review_excluded_ids()

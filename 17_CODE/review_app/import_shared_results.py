#!/usr/bin/env python3
"""Import results files returned by a reviewer (from the shared HTML package).

Usage: python3 17_CODE/review_app/import_shared_results.py <results.json> [<results.json> ...]

Each file is checked against the package it was made from (a changed package would mean different
items), item numbers are mapped back to input ids with the private key, and the answers are appended
to the same logs the local app writes (16_RESULTS/human_review/*.jsonl), tagged with the reviewer's
name. Then run finish_review.sh as usual. The returned files themselves are kept in
16_RESULTS/human_review/returned/ as the raw human data.
"""
import json, pathlib, shutil, sys

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parents[1] / "16_RESULTS" / "human_review"
KEYS = {"annotation": OUT / "private" / "annotation_key.json", "reference": OUT / "private" / "reference_key.json"}
RETURNED = OUT / "returned"; RETURNED.mkdir(exist_ok=True)

for path in map(pathlib.Path, sys.argv[1:]):
    r = json.loads(path.read_text())
    key = json.loads(KEYS[r["task"]].read_text())
    if r["package"] != key["package"]:
        sys.exit(f"{path.name}: made from package {r['package']}, but the current package is {key['package']}; not imported")
    shutil.copy2(path, RETURNED / path.name)
    n = 0
    if r["task"] == "annotation":
        with open(OUT / "annotation_answers.jsonl", "a") as fh:
            for num, a in r["answers"].items():
                fh.write(json.dumps(dict(key=key["key"][num], verdicts=a["verdicts"], note="", at=a["at"], annotator=r["reviewer"])) + "\n"); n += 1
    else:
        with open(OUT / "provenance_answers.jsonl", "a") as fh:
            for num, a in r["answers"].items():
                fh.write(json.dumps(dict(key=key["key"][num], decision=a["decision"], new_value=a.get("new_value"), note="",
                                         at=a["at"], reviewer=r["reviewer"])) + "\n"); n += 1
        if r.get("confirmation"):
            (OUT / "provenance_signoff.json").write_text(json.dumps(
                dict(name=r["reviewer"], confirmation=r["confirmation"], at=r["saved"], source=path.name), indent=2))
    print(f"{path.name}: {r['task']} by {r['reviewer']}: {n} of {r['total']} answers imported")

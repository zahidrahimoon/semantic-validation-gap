#!/usr/bin/env python3
"""Apply the researcher's review of groups A/G (TH-10) to the data, once the review app shows 272/272.

  * Deleted or changed values: their ids go to 10_DATASETS/human_inputs/review_exclusions.json, which
    every analysis excludes (16_RESULTS/analysis/defects.py). Nothing is removed from the group files,
    so the ids of all other values stay the same.
  * Changed values: the researcher's new value is appended to the group file and gets a new id; the
    list is written to 16_RESULTS/human_review/new_reference_ids.json so it can be measured and judged.
  * The review record in PROVENANCE.md and the banner line of each group file are filled in from the
    sign-off. 16_RESULTS/human_review/review_status.json tells the paper which wording applies.
Safe to run more than once: values already applied are not appended again.
"""
import csv, io, json, datetime, pathlib

P = pathlib.Path(__file__).resolve().parents[2]
HUMAN = P / "10_DATASETS" / "human_inputs"
OUT = P / "16_RESULTS" / "human_review"
EXCL = HUMAN / "review_exclusions.json"

answers = {}
for line in (OUT / "provenance_answers.jsonl").read_text().splitlines():
    if line.strip():
        a = json.loads(line); answers[a["key"]] = a
sign = json.loads((OUT / "provenance_signoff.json").read_text())
state = json.loads(EXCL.read_text()) if EXCL.exists() else {"ids": [], "replaced": {}}


def data_lines(group):
    return [l for l in (HUMAN / f"group_{group}.csv").read_text().splitlines()
            if l.strip() and not l.startswith("target_id") and not l.startswith("#")]


new_ids = []
for key, a in sorted(answers.items()):
    if a["decision"] == "keep" or key in state["ids"]:
        if a["decision"] == "change" and key in state["replaced"]: new_ids.append(state["replaced"][key])
        continue
    state["ids"].append(key)
    if a["decision"] == "change":
        target, group = key.split("|")[0], key.split("|")[1]
        value = json.dumps(json.loads(a["new_value"]), ensure_ascii=False)
        buf = io.StringIO(); csv.writer(buf, lineterminator="").writerow([target, value])
        f = HUMAN / f"group_{group}.csv"
        text = f.read_text()
        f.write_text(text + ("" if text.endswith("\n") else "\n") + buf.getvalue() + "\n")
        new_id = f"{target}|{group}|r1|{len(data_lines(group)) - 1}"
        state["replaced"][key] = new_id; new_ids.append(new_id)
EXCL.write_text(json.dumps(state, indent=1))
(OUT / "new_reference_ids.json").write_text(json.dumps(sorted(set(new_ids)), indent=1))

counts = {c: sum(1 for a in answers.values() if a["decision"] == c) for c in ("keep", "change", "delete")}
reviewed = len(answers) == 272 and sign.get("confirmation") == "YES"
label = "human-curated (AI-drafted, researcher-reviewed)" if reviewed else "AI-drafted"
date = sign.get("at", datetime.datetime.now().isoformat())[:10]
record = f"""Reviewed by:              {sign.get('name', '')}
Date:                     {date}
Values edited:            {counts['change']}
Values replaced:          {counts['change']} (each edited value is a replacement: new value appended, old id excluded)
Values deleted:           {counts['delete']}
Values kept unchanged:    {counts['keep']} of {len(answers)} reviewed (272 in total)
Confirmation: "these values are ones I would have written myself"  {sign.get('confirmation', '')}
Resulting label for the paper:  {label}
Recorded by the review app (17_CODE/review_app); answers in 16_RESULTS/human_review/."""
prov = HUMAN / "PROVENANCE.md"; t = prov.read_text()
start = t.index("## Review record"); a = t.index("```text", start) + len("```text\n"); b = t.index("```", a)
prov.write_text(t[:a] + record + "\n" + t[b:])
for g in ("A", "G"):
    f = HUMAN / f"group_{g}.csv"
    lines = f.read_text().splitlines()
    lines = [(f"# PROVENANCE: AI-DRAFTED 2026-09-20; reviewed by {sign.get('name', '')} on {date} "
              f"({'confirmed' if reviewed else 'NOT confirmed'}). See PROVENANCE.md.") if l.startswith("# PROVENANCE") else l
             for l in lines]
    f.write_text("\n".join(lines) + "\n")
(OUT / "review_status.json").write_text(json.dumps(dict(reviewed=reviewed, label=label, **counts,
                                                         new_values=len(set(new_ids)), date=date), indent=2))
print(f"review applied: {counts}; {len(set(new_ids))} new values to measure; label: {label}")

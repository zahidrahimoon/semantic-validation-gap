#!/usr/bin/env python3
"""Ground-truth agreement (R3): the researcher's blind annotation against the judge and the rule functions.

Reads human_verdicts.jsonl (written by `cli.ts import-labels`; the latest import of each item wins).
  * judge vs human, judgement rules: Cohen's kappa over rule verdicts where both said PASS or FAIL,
    plus the share of rules the human marked UNSURE. Pre-registered: kappa < 0.4 downgrades
    judgement-rule results to exploratory.
  * rule functions vs human, objective rules: the same, as a check of the rule functions.
  * intra-annotator: kappa between an item's first annotation and its "#repeat" copy.

Usage: .venv/bin/python annotation_agreement.py <E1 run folder>
"""
import json, sys, pathlib
import pandas as pd

RUN = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(__file__).parent
hf = RUN / "human_verdicts.jsonl"
if not hf.exists():
    sys.exit("no human_verdicts.jsonl yet: finish the annotation and run `cli.ts import-labels` first")
targets = json.loads((pathlib.Path(__file__).resolve().parents[2] / "17_CODE/review_app/targets.json").read_text())
CLS = {r["id"]: ("OBJ" if r["cls"].startswith("OBJ") else "JUD") for t in targets for r in t["rules"]}


def kappa(a, b):
    n = len(a)
    if n == 0: return float("nan")
    po = sum(x == y for x, y in zip(a, b)) / n
    cats = set(a) | set(b)
    pe = sum((a.count(c) / n) * (b.count(c) / n) for c in cats)
    return 1.0 if pe == 1 else (po - pe) / (1 - pe)


human, repeats = {}, {}
for line in open(hf):
    if not line.strip(): continue
    r = json.loads(line)
    (repeats if r["repeat"] else human)[r["input_id"].replace("#repeat", "")] = r["verdicts"]
judge = {}
for line in open(RUN / "judge_verdicts.jsonl"):
    if line.strip():
        r = json.loads(line); judge[r["input_id"]] = r["verdicts"]
rules = {}
for line in open(RUN / "rule_verdicts.jsonl"):
    if line.strip():
        r = json.loads(line); rules[r["input_id"]] = r["verdicts"]

rows = []
def compare(name, cls, other):
    pairs, unsure, total, no_verdict = [], 0, 0, 0
    for iid, hv in human.items():
        for rid, h in hv.items():
            if CLS.get(rid) != cls: continue
            total += 1
            if h == "AMBIGUOUS": unsure += 1; continue
            o = other.get(iid, {}).get(rid)
            o = o.get("verdict") if isinstance(o, dict) else o
            if o in ("PASS", "FAIL"): pairs.append((h, o))
            else: no_verdict += 1   # the other rater gave no usable verdict on this rule
    a, b = [p[0] for p in pairs], [p[1] for p in pairs]
    rows.append(dict(comparison=name, rule_class=cls, rule_verdicts=total, human_unsure=unsure, compared=len(pairs),
                     agreement=sum(x == y for x, y in pairs) / len(pairs) if pairs else float("nan"),
                     kappa=kappa(a, b), human_fail=a.count("FAIL"), other_fail=b.count("FAIL"), other_no_verdict=no_verdict))

compare("judge vs human", "JUD", judge)
compare("rule functions vs human", "OBJ", rules)
rp = [(human[i][r], repeats[i][r]) for i in repeats if i in human for r in repeats[i] if r in human[i]]
rows.append(dict(comparison="annotator vs self (repeats)", rule_class="all", rule_verdicts=len(rp), human_unsure=None,
                 compared=len(rp), agreement=sum(x == y for x, y in rp) / len(rp) if rp else float("nan"),
                 kappa=kappa([p[0] for p in rp], [p[1] for p in rp]), human_fail=None, other_fail=None))
res = pd.DataFrame(rows)
res.to_csv(OUT / "table9_agreement.csv", index=False)
jk = res.loc[res["comparison"] == "judge vs human", "kappa"].iloc[0]
summary = dict(items=len(human), repeats=len(repeats), judge_kappa=jk,
               judgement_results_exploratory=bool(not (jk >= 0.4)), rows=rows)
(OUT / "agreement_summary.json").write_text(json.dumps(summary, indent=2, default=float))
print(res.round(3).to_string(index=False))
print(f"\njudge-human kappa {jk:.3f} -> judgement-rule results {'EXPLORATORY (pre-registered, kappa < 0.4)' if summary['judgement_results_exploratory'] else 'confirmatory'}")

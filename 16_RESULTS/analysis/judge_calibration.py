#!/usr/bin/env python3
"""Calibrate the judge against the two designed conditions, per rule (reviewer point 2).

Condition C is built from hand-written templates, each designed to break ONE named rule while
satisfying the schema (`expected_category` = "designed_violation:<rule>"), so for those inputs the
truth is known: the named rule is violated. Condition A is written to be valid, so a FAIL there is a
false positive. This gives the judge's per-rule recall and false-positive rate directly, which is more
informative than a kappa against a single annotator.

Judgement rules only: objective rules are decided by the rule functions, not by the judge.

A Rogan-Gladen correction of the judgement-rule SV-SI rate is reported with the caveat that condition C
is deliberately blatant, so its recall is an optimistic estimate of recall on natural violations, and a
correction built on it understates the true rate.

Usage: .venv/bin/python judge_calibration.py <E1 run folder>
"""
import json, sys, pathlib
import numpy as np, pandas as pd
from defects import excluded_ids

RUN = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(__file__).parent
jl = lambda n: [json.loads(l) for l in open(RUN / n) if l.strip()]
targets = json.loads((pathlib.Path(__file__).resolve().parents[2] / "17_CODE/review_app/targets.json").read_text())
CLS = {r["id"]: ("OBJ" if r["cls"].startswith("OBJ") else "JUD") for t in targets for r in t["rules"]}
EX = excluded_ids(RUN)

raw = {r["input_id"]: r for r in jl("raw_inputs.jsonl")}
struct = {r["input_id"]: r for r in jl("validation_results.jsonl")}
judge = {r["input_id"]: r["verdicts"] for r in jl("judge_verdicts.jsonl")}
ctx = RUN / "judge_context_verdicts.jsonl"
if ctx.exists():   # DV-20: context-rule verdicts made with the whole record replace the first pass
    for r in jl("judge_context_verdicts.jsonl"):
        judge.setdefault(r["input_id"], {}).update(r["verdicts"])


def wilson(k, n, z=1.96):
    if n == 0: return (np.nan, np.nan)
    p = k / n; den = 1 + z * z / n
    c = (p + z * z / (2 * n)) / den; h = z * np.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return (c - h, c + h)


rows = []
for rule in sorted({r for v in judge.values() for r in v}):
    if CLS.get(rule) != "JUD": continue
    # recall: condition C inputs designed to break this rule, that passed structurally and were judged
    hit = tot = 0
    for iid, r in raw.items():
        if r["group"] != "C" or iid in EX: continue
        if r.get("expected_category") != f"designed_violation:{rule}": continue
        if not struct.get(iid, {}).get("structural_pass") or iid not in judge: continue
        tot += 1; hit += judge[iid].get(rule) == "FAIL"
    # false positives: condition A (written to be valid), same rule
    fp = n_a = 0
    for iid, r in raw.items():
        if r["group"] != "A" or iid in EX: continue
        if rule not in judge.get(iid, {}): continue
        if not struct.get(iid, {}).get("structural_pass"): continue
        n_a += 1; fp += judge[iid][rule] == "FAIL"
    if tot or n_a:
        rows.append(dict(rule=rule, designed_violations=tot, judge_caught=hit,
                         recall=hit / tot if tot else np.nan,
                         recall_lo=wilson(hit, tot)[0], recall_hi=wilson(hit, tot)[1],
                         valid_inputs=n_a, judge_false_positives=fp,
                         fpr=fp / n_a if n_a else np.nan))
res = pd.DataFrame(rows).sort_values("designed_violations", ascending=False)
res.to_csv(OUT / "table10_judge_calibration.csv", index=False)

H = res["judge_caught"].sum(); T = res["designed_violations"].sum()
F = res["judge_false_positives"].sum(); N = res["valid_inputs"].sum()
recall, fpr = (H / T if T else np.nan), (F / N if N else np.nan)
summary = dict(rules=len(res), designed_violations=int(T), caught=int(H), recall=recall,
               recall_ci=list(wilson(H, T)), valid_inputs=int(N), false_positives=int(F), fpr=fpr,
               fpr_ci=list(wilson(F, N)))

# Rogan-Gladen correction of the observed judgement-rule rate among LLM inputs
lab = {r["input_id"]: r for r in jl("semantic_labels.jsonl")}
fails = [r for r in jl("generation_failures.jsonl")]
failed = {(f["target"], f["group"], f["family"], f["run"]) for f in fails}
obs_k = obs_n = 0
for iid, r in lab.items():
    if r["group"] not in ("D", "E") or iid in EX or r["prompt_family"] == "P5": continue
    if (r["target_id"], r["group"], r["prompt_family"], raw.get(iid, {}).get("run")) in failed: continue
    if not r["structural_pass"] or r["final_label"] not in ("VALID", "SV-SI"): continue
    obs_n += 1; obs_k += len(r["violated_jud"]) > 0
obs = obs_k / obs_n if obs_n else np.nan
corrected = (obs - fpr) / (recall - fpr) if recall > fpr else np.nan
summary.update(observed_judgement_rate=obs, observed_k=obs_k, observed_n=obs_n,
               corrected_judgement_rate=float(np.clip(corrected, 0, 1)) if corrected == corrected else None,
               note="C is deliberately blatant, so its recall is optimistic and the correction is a lower bound on the true rate")
(OUT / "judge_calibration_summary.json").write_text(json.dumps(summary, indent=2, default=float))
pd.set_option("display.width", 200)
print(res.round(3).to_string(index=False))
print("\n", json.dumps({k: (round(v, 4) if isinstance(v, float) else v) for k, v in summary.items() if k != "note"}, indent=1, default=str))

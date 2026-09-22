#!/usr/bin/env python3
"""E1 sensitivity analyses of the pre-registered H1 rate (review issues I-R1-002/003/004/007).

Each row recomputes the conditional SV-SI rate of the LLM conditions (D+E, P5 excluded, retried and
key-mismatch records excluded) under one change, so a reader can see how much the headline depends on
design choices:
  * primary                     the pre-registered definition (all rules, decided passes)
  * P1 only                     legitimate-value prompts only (P3 asks for rule violations)
  * excluding P3                every family except the one that asks for violations
  * excluding F15+F16           workshop dates: the prompts never state today's date, while the random
                                generator's dates are relative to the real clock
  * objective rules only        rule functions only (every structural pass is decided; no judge)
  * excluding context rules     drops rules the judge could not decide from the target field alone
                                (it never saw the record's other fields): B-TK-3, B-TK-4, B-CO-4,
                                B-CO-5, B-CO-7, B-RV-3, B-BK-8. An input counts as SV-SI only if it
                                violates some other rule.
  * target-weighted             mean of per-target rates, weighting each target by its share of LLM
                                structural passes (undoes the judge sample's target mix)
Also the same for B (random) and G, so the RQ3 direction can be checked under each change.

Usage: .venv/bin/python e1_sensitivity.py <E1 run folder>
"""
import json, sys, pathlib
import numpy as np, pandas as pd
from defects import key_mismatch_ids

RUN = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(__file__).parent
CONTEXT_RULES = {"B-TK-3", "B-TK-4", "B-CO-4", "B-CO-5", "B-CO-7", "B-RV-3", "B-BK-8"}
jl = lambda n: pd.DataFrame([json.loads(l) for l in open(RUN / n) if l.strip()])
lab, raw, fails = jl("semantic_labels.jsonl"), jl("raw_inputs.jsonl"), jl("generation_failures.jsonl")
df = lab.merge(raw[["input_id", "run"]], on="input_id", how="left")
df = df[~df["input_id"].isin(key_mismatch_ids(RUN))]
failed = set(zip(fails["target"], fails["group"], fails["family"], fails["run"]))
df = df[[(t, g, f, r) not in failed for t, g, f, r in zip(df["target_id"], df["group"], df["prompt_family"], df["run"])]]
df = df[(df["prompt_family"] != "P5") & df["structural_pass"]].copy()
df["cond"] = np.where(df["group"].isin(["D", "E"]), "LLM (D+E)", df["group"])


def wilson(k, n, z=1.96):
    if n == 0: return (np.nan, np.nan)
    p = k / n; den = 1 + z * z / n
    c = (p + z * z / (2 * n)) / den; h = z * np.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return (c - h, c + h)


def rate(d, y):
    k, n = int(y.sum()), len(d)
    lo, hi = wilson(k, n)
    return k, n, (k / n if n else np.nan), lo, hi


dec = df[df["final_label"].isin(["VALID", "SV-SI"])]
rows = []
for cond in ["LLM (D+E)", "B", "G"]:
    d = dec[dec["cond"] == cond]
    variants = {
        "primary": (d, d["final_label"] == "SV-SI"),
        "P1 only": (d[d["prompt_family"] == "P1"], d[d["prompt_family"] == "P1"]["final_label"] == "SV-SI"),
        "excluding P3": (d[d["prompt_family"] != "P3"], d[d["prompt_family"] != "P3"]["final_label"] == "SV-SI"),
        "excluding F15+F16": (d[d["target_id"] != "F15+F16"], d[d["target_id"] != "F15+F16"]["final_label"] == "SV-SI"),
    }
    a = df[df["cond"] == cond]   # all structural passes: objective rules decide every one
    variants["objective rules only"] = (a, a["violated_obj"].apply(len) > 0)
    ctx = d[~d["ambiguous_rules"].apply(lambda r: bool(set(r) - CONTEXT_RULES))]
    variants["excluding context rules"] = (ctx, ctx["violated_rules"].apply(lambda r: bool(set(r) - CONTEXT_RULES)))
    for name, (dd, y) in variants.items():
        k, n, r, lo, hi = rate(dd, y)
        rows.append(dict(condition=cond, variant=name, svsi=k, n=n, rate=r, ci_lo=lo, ci_hi=hi))
    # target-weighted: per-target decided rate, weights = share of this condition's structural passes
    w = a.groupby("target_id").size(); pt = d.groupby("target_id").apply(lambda x: (x["final_label"] == "SV-SI").mean(), include_groups=False)
    common = pt.index.intersection(w.index)
    rows.append(dict(condition=cond, variant="target-weighted", svsi=np.nan, n=int(w[common].sum()),
                     rate=float((pt[common] * w[common]).sum() / w[common].sum()), ci_lo=np.nan, ci_hi=np.nan))

res = pd.DataFrame(rows)
res.to_csv(OUT / "table1c_sensitivity.csv", index=False)
pd.set_option("display.width", 200)
print(res.round(3).to_string(index=False))

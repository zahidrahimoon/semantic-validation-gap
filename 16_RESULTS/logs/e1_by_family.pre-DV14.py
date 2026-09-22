#!/usr/bin/env python3
"""E1 (EXPLORATORY breakdown of a pre-registered rate): conditional SV-SI of the LLM conditions by
prompt family.

The pre-registered H1 rate pools families P1-P4, P6, P7 (P5 excluded). Those families ask for
different things: P1 legitimate values, P2 unusual values, P3 values that would be WRONG to accept,
P4 values whose meaning depends on downstream interpretation, P6 boundary, P7 Unicode variants. The
pooled rate therefore mixes spontaneous error with requested violation. This script reports each
family separately and the rate for legitimate-value prompts (P1) on its own.

Same population as e1_e2_analysis.py: decided structural passes, P5 excluded, retried records
excluded (DV-07).

Usage: .venv/bin/python e1_by_family.py <E1 run folder>
"""
import json, sys, pathlib
import numpy as np, pandas as pd

RUN = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(__file__).parent
jl = lambda n: pd.DataFrame([json.loads(l) for l in open(RUN / n) if l.strip()])
lab, raw, fails = jl("semantic_labels.jsonl"), jl("raw_inputs.jsonl"), jl("generation_failures.jsonl")
df = lab.merge(raw[["input_id", "run"]], on="input_id", how="left")
failed = set(zip(fails["target"], fails["group"], fails["family"], fails["run"]))
df = df[[(t, g, f, r) not in failed for t, g, f, r in zip(df["target_id"], df["group"], df["prompt_family"], df["run"])]]
df = df[df["group"].isin(["D", "E"]) & (df["prompt_family"] != "P5")].copy()

FAMILY = {"P1": "legitimate", "P2": "unusual", "P3": "asked to violate rules", "P4": "context-dependent",
          "P6": "boundary", "P7": "Unicode variation"}


def wilson(k, n, z=1.96):
    if n == 0: return (np.nan, np.nan)
    p = k / n; den = 1 + z * z / n
    c = (p + z * z / (2 * n)) / den; h = z * np.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return (c - h, c + h)


rows = []
def add(label, family, d):
    passes = d[d["structural_pass"]]; dec = passes[passes["final_label"].isin(["VALID", "SV-SI"])]
    k, n = int((dec["final_label"] == "SV-SI").sum()), len(dec)
    lo, hi = wilson(k, n)
    rows.append(dict(group=label, family=family, meaning=FAMILY.get(family, "all except P5"),
                     inputs=len(d), struct_pass=len(passes), struct_rate=len(passes) / len(d) if len(d) else np.nan,
                     decided=n, svsi=k, rate=k / n if n else np.nan, ci_lo=lo, ci_hi=hi))

for fam in sorted(df["prompt_family"].unique()):
    for g in ["D", "E"]:
        add(g, fam, df[(df["group"] == g) & (df["prompt_family"] == fam)])
    add("D+E", fam, df[df["prompt_family"] == fam])
add("D+E", "pooled", df)
add("D+E", "pooled excl. P3", df[df["prompt_family"] != "P3"])

res = pd.DataFrame(rows)
res.to_csv(OUT / "table1b_llm_by_family.csv", index=False)
pd.set_option("display.width", 200)
print(res.round(3).to_string(index=False))

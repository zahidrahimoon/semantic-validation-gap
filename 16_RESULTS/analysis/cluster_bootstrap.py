#!/usr/bin/env python3
"""Cluster-robust intervals for the main rates and contrasts (reviewer point 4).

Values are not independent: an LLM call returns five values at once, and each target contributes many
inputs. Wilson intervals treat them as independent and are therefore too narrow. This script
resamples whole clusters with replacement (2000 draws) and reports percentile intervals:

  * clustered by generation call  (target x condition x prompt family x run), the unit the model produced
  * clustered by target           (17 targets), the unit a reader generalises over

Same population as e1_e2_analysis.py. Reported for the conditional SV-SI rate per condition, for the
pooled LLM rate (H1), and for the three pre-registered contrasts as a difference in rates.

Usage: .venv/bin/python cluster_bootstrap.py <E1 run folder>
"""
import json, sys, pathlib
import numpy as np, pandas as pd
from defects import excluded_ids

RUN = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(__file__).parent
B = 2000
rng = np.random.default_rng(20260924)
jl = lambda n: pd.DataFrame([json.loads(l) for l in open(RUN / n) if l.strip()])
lab, raw, fails = jl("semantic_labels.jsonl"), jl("raw_inputs.jsonl"), jl("generation_failures.jsonl")
df = lab.merge(raw[["input_id", "run"]], on="input_id", how="left")
df = df[~df["input_id"].isin(excluded_ids(RUN))]
failed = set(zip(fails["target"], fails["group"], fails["family"], fails["run"]))
df = df[[(t, g, f, r) not in failed for t, g, f, r in zip(df["target_id"], df["group"], df["prompt_family"], df["run"])]]
df = df[(df["prompt_family"] != "P5") & df["structural_pass"] & df["final_label"].isin(["VALID", "SV-SI"])].copy()
df["y"] = (df["final_label"] == "SV-SI").astype(int)
df["call"] = (df["target_id"] + "|" + df["group"] + "|" + df["prompt_family"].fillna("-") + "|"
              + df["run"].astype("Int64").astype(str))


def boot(d, by, stat):
    """Percentile interval from resampling whole clusters of `by` with replacement."""
    groups = [g for _, g in d.groupby(by, sort=False)]
    if len(groups) < 2: return (np.nan, np.nan)
    out = []
    for _ in range(B):
        pick = rng.integers(0, len(groups), len(groups))
        s = stat(pd.concat([groups[i] for i in pick], copy=True))
        if s == s: out.append(s)
    return tuple(np.percentile(out, [2.5, 97.5])) if out else (np.nan, np.nan)


rate = lambda d: d["y"].mean() if len(d) else np.nan
rows = []
for name, d in [("LLM (D+E)", df[df["group"].isin(["D", "E"])])] + [(g, df[df["group"] == g]) for g in sorted(df["group"].unique())]:
    if d.empty: continue
    lo_c, hi_c = boot(d, "call", rate)
    lo_t, hi_t = boot(d, "target_id", rate)
    rows.append(dict(quantity=f"rate {name}", n=len(d), estimate=rate(d),
                     call_lo=lo_c, call_hi=hi_c, target_lo=lo_t, target_hi=hi_t))

for g1, g2, label in [("E", "B", "H3a E-B"), ("E", "G", "H3b E-G"), ("D", "B", "H3c D-B"), ("E", "D", "E-D (exploratory)")]:
    d = df[df["group"].isin([g1, g2])]
    diff = lambda x: (rate(x[x["group"] == g1]) - rate(x[x["group"] == g2]))
    lo_c, hi_c = boot(d, "call", diff)
    lo_t, hi_t = boot(d, "target_id", diff)
    rows.append(dict(quantity=f"difference {label}", n=len(d), estimate=diff(d),
                     call_lo=lo_c, call_hi=hi_c, target_lo=lo_t, target_hi=hi_t))

res = pd.DataFrame(rows)
res.to_csv(OUT / "table11_cluster_bootstrap.csv", index=False)
(OUT / "cluster_bootstrap_summary.json").write_text(json.dumps(dict(
    draws=B, clusters_call=int(df["call"].nunique()), clusters_target=int(df["target_id"].nunique()),
    rows=res.to_dict("records")), indent=2, default=float))
pd.set_option("display.width", 200)
print(f"clusters: {df['call'].nunique()} calls, {df['target_id'].nunique()} targets; {B} draws")
print(res.round(3).to_string(index=False))

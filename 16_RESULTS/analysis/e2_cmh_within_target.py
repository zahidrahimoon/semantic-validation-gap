#!/usr/bin/env python3
"""E2 (POST HOC, labelled as such in the paper): pre-registered contrasts re-tested WITHIN target.

The judge sample gives conditions different target mixes among decided inputs, and targets differ a
lot in their SV-SI rate, so the pooled Fisher tests can be confounded by target. The Cochran-Mantel-
Haenszel test stratifies by target. Same population as the primary E1 analysis: decided structural
passes, P5 excluded, retried records excluded (DV-07). Strata where either condition has no decided
input carry no information and are dropped by the test.

Usage: .venv/bin/python e2_cmh_within_target.py <E1 run folder>
"""
import json, sys, pathlib, warnings
import numpy as np, pandas as pd
from defects import key_mismatch_ids  # DV-14
from statsmodels.stats.contingency_tables import StratifiedTable

warnings.filterwarnings("ignore", category=RuntimeWarning)  # zero cells in single strata
RUN = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(__file__).parent
jl = lambda n: pd.DataFrame([json.loads(l) for l in open(RUN / n) if l.strip()])
lab, raw, fails = jl("semantic_labels.jsonl"), jl("raw_inputs.jsonl"), jl("generation_failures.jsonl")
df = lab.merge(raw[["input_id", "run"]], on="input_id", how="left")
df = df[~df["input_id"].isin(key_mismatch_ids(RUN))]  # DV-14
failed = set(zip(fails["target"], fails["group"], fails["family"], fails["run"]))
df = df[[(t, g, f, r) not in failed for t, g, f, r in zip(df["target_id"], df["group"], df["prompt_family"], df["run"])]]
df = df[(df["prompt_family"] != "P5") & df["structural_pass"] & df["final_label"].isin(["VALID", "SV-SI"])].copy()
df["y"] = (df["final_label"] == "SV-SI").astype(int)
print(f"population: {len(df)} decided structural passes")

CONTRASTS = [("E", "B", "H3a (pre-registered)"), ("E", "G", "H3b (pre-registered)"), ("D", "B", "H3c (pre-registered)"),
             ("E", "D", "exploratory"), ("C", "B", "sanity: adversarial vs random")]
rows = []
for g1, g2, role in CONTRASTS:
    tables = []
    for t, dt in df[df["group"].isin([g1, g2])].groupby("target_id"):
        a = dt[dt["group"] == g1]["y"]; b = dt[dt["group"] == g2]["y"]
        if len(a) == 0 or len(b) == 0: continue
        tables.append(np.array([[a.sum(), len(a) - a.sum()], [b.sum(), len(b) - b.sum()]], dtype=float))
    st = StratifiedTable(tables)
    lo, hi = st.oddsratio_pooled_confint()
    rows.append(dict(contrast=f"{g1} vs {g2}", role=role, strata=len(tables),
                     n1=int(sum(x[0].sum() for x in tables)), n2=int(sum(x[1].sum() for x in tables)),
                     mh_odds_ratio=st.oddsratio_pooled, ci_lo=lo, ci_hi=hi,
                     p_two_sided=st.test_null_odds(correction=True).pvalue))
res = pd.DataFrame(rows)
res.to_csv(OUT / "table3c_within_target_cmh.csv", index=False)
print(res.round(4).to_string(index=False))

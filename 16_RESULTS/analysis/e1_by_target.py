#!/usr/bin/env python3
"""E1: conditional SV-SI per target, all conditions and LLM conditions (D+E) only.

Categories contain between one and four targets, so a category effect can be one target's effect;
this table lets the reader see that (review I-R1-015, R2-014). Same population as e1_e2_analysis.py.

Usage: .venv/bin/python e1_by_target.py <E1 run folder>
"""
import json, sys, pathlib
import pandas as pd
from defects import key_mismatch_ids, excluded_ids

RUN = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(__file__).parent
CATEGORY = {"F01": "simple", "F04": "simple", "F03": "aifacing", "F07+F09": "crossfield", "F12": "financial",
            "F13": "financial", "F14": "financial", "F15+F16": "crossfield", "F18": "search", "F20+F21": "crossfield",
            "F25": "financial", "F28": "financial", "F29": "freetext", "F31+F33": "crossfield", "F35": "aifacing",
            "F36+F37": "structured", "F39": "aifacing"}   # as in e1_e2_analysis.py (DV-15)
jl = lambda n: pd.DataFrame([json.loads(l) for l in open(RUN / n) if l.strip()])
lab, raw, fails = jl("semantic_labels.jsonl"), jl("raw_inputs.jsonl"), jl("generation_failures.jsonl")
df = lab.merge(raw[["input_id", "run"]], on="input_id", how="left")
df = df[~df["input_id"].isin(excluded_ids(RUN))]
fs = set(zip(fails["target"], fails["group"], fails["family"], fails["run"]))
df = df[[(t, g, f, r) not in fs for t, g, f, r in zip(df["target_id"], df["group"], df["prompt_family"], df["run"])]]
df = df[(df["prompt_family"] != "P5") & df["structural_pass"] & df["final_label"].isin(["VALID", "SV-SI"])].copy()
df["y"] = df["final_label"] == "SV-SI"
rows = []
for t, d in df.groupby("target_id"):
    l = d[d["group"].isin(["D", "E"])]
    rows.append(dict(target=t, category=CATEGORY[t], decided=len(d), svsi=int(d["y"].sum()), rate=d["y"].mean(),
                     llm_decided=len(l), llm_svsi=int(l["y"].sum()), llm_rate=l["y"].mean() if len(l) else float("nan")))
res = pd.DataFrame(rows).sort_values(["category", "target"])
res.to_csv(OUT / "table2b_by_target.csv", index=False)
print(res.round(3).to_string(index=False))

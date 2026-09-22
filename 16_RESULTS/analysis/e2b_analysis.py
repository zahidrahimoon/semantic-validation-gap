#!/usr/bin/env python3
"""E2b (EXPLORATORY): does the SV-SI rate depend on generator size or temperature?

Conditions, all on the same 10-target subset, prompt families P1-P4, groups D and E:
  qwen3:1.7b T0.8 | qwen3:4b T0.8 (the E1 generator, restricted to the subset) | qwen3:8b T0.8 | qwen3:4b T0

Two rates per condition:
  * SV-SI (objective rules): share of structural passes that break at least one OBJECTIVE rule. Every
    input is decided on its objective rules (rule functions), so this rate is comparable across all
    conditions whatever the judge sample was. It is the headline E2b metric.
  * SV-SI (all rules, decided only): the E1 primary definition. E2b judged a stratified 100 inputs per
    run (DV-08) while E1 judged 1200 of ~3300, so judgement-rule coverage differs between conditions;
    reported for completeness, with that caveat.

As in E1, records produced by retrying a failed prompt family are excluded (DV-07).
Tests: two-sided Fisher exact tests against the 4b T0.8 reference, Holm-corrected, labelled exploratory.

Usage: .venv/bin/python e2b_analysis.py
"""
import json, pathlib
import numpy as np, pandas as pd
from scipy.stats import fisher_exact
from statsmodels.stats.multitest import multipletests
from defects import key_mismatch_ids, excluded_ids  # DV-14

RAW = pathlib.Path(__file__).resolve().parents[1] / "raw"
OUT = pathlib.Path(__file__).parent
SUBSET = ["F01", "F04", "F03", "F12", "F14", "F18", "F25", "F29", "F35", "F39"]
FAMILIES = ["P1", "P2", "P3", "P4"]
CONDITIONS = [  # label, run folder, runs to keep (None = all)
    ("qwen3:1.7b T0.8", "E2b_E1_20260920T0847", None),
    ("qwen3:4b T0.8 (E1)", "E1_E1_20260920T0847", None),
    ("qwen3:8b T0.8", "E2b_E1_20260920T0847_8b", None),
    ("qwen3:4b T0", "E2b_E1_20260920T0847_T0", None),
]
REF = "qwen3:4b T0.8 (E1)"


def jl(folder, name):
    p = RAW / folder / name
    return pd.DataFrame([json.loads(l) for l in open(p) if l.strip()]) if p.exists() else pd.DataFrame()


def wilson(k, n, z=1.96):
    if n == 0: return (np.nan, np.nan)
    p = k / n; den = 1 + z * z / n
    c = (p + z * z / (2 * n)) / den; h = z * np.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return (c - h, c + h)


def load(label, folder, runs):
    lab, raw, fails = jl(folder, "semantic_labels.jsonl"), jl(folder, "raw_inputs.jsonl"), jl(folder, "generation_failures.jsonl")
    df = lab.merge(raw[["input_id", "model", "temperature", "run"]], on="input_id", how="left")
    df = df[df["target_id"].isin(SUBSET) & df["prompt_family"].isin(FAMILIES) & df["group"].isin(["D", "E"])]
    km = excluded_ids(RAW / folder)  # DV-14
    n_km = int(df["input_id"].isin(km).sum()); df = df[~df["input_id"].isin(km)]
    if runs is not None: df = df[df["run"].isin(runs)]
    failed = set() if fails.empty else set(zip(fails["target"], fails["group"], fails["family"], fails["run"]))
    retried = [(t, g, f, r) in failed for t, g, f, r in zip(df["target_id"], df["group"], df["prompt_family"], df["run"])]
    df = df[~np.array(retried, dtype=bool)].copy()
    df["condition"] = label
    df["obj_violation"] = df["violated_obj"].apply(lambda v: len(v) > 0)
    n_fail = 0 if fails.empty else int((fails["target"].isin(SUBSET) & fails["family"].isin(FAMILIES)
                                        & fails["group"].isin(["D", "E"])).sum())
    return df, n_fail + n_km, int(sum(retried))


frames, rows = [], []
for label, folder, runs in CONDITIONS:
    df, n_fail, n_retried = load(label, folder, runs)
    frames.append(df)
    passes = df[df["structural_pass"]]
    dec = passes[passes["final_label"].isin(["VALID", "SV-SI"])]
    k_obj, n_obj = int(passes["obj_violation"].sum()), len(passes)
    k_all, n_all = int((dec["final_label"] == "SV-SI").sum()), len(dec)
    rows.append(dict(condition=label, models=",".join(sorted(df["model"].dropna().unique())),
                     temperature=",".join(str(t) for t in sorted(df["temperature"].dropna().unique())),
                     runs=int(df["run"].nunique()), inputs=len(df), generation_failures=n_fail, retried_excluded=n_retried,
                     structural_pass=n_obj, structural_rate=n_obj / len(df) if len(df) else np.nan,
                     svsi_obj=k_obj, svsi_obj_rate=k_obj / n_obj if n_obj else np.nan,
                     svsi_obj_lo=wilson(k_obj, n_obj)[0], svsi_obj_hi=wilson(k_obj, n_obj)[1],
                     decided=n_all, svsi_all=k_all, svsi_all_rate=k_all / n_all if n_all else np.nan,
                     svsi_all_lo=wilson(k_all, n_all)[0], svsi_all_hi=wilson(k_all, n_all)[1]))

res = pd.DataFrame(rows)
res.to_csv(OUT / "table7_e2b_model_size.csv", index=False)

# Same table split by group (D context-free / E context-aware), objective-rule rate only.
allf = pd.concat(frames)
by_group = (allf[allf["structural_pass"]].groupby(["condition", "group"])
            .agg(passes=("obj_violation", "size"), svsi_obj=("obj_violation", "sum")).reset_index())
by_group["svsi_obj_rate"] = by_group["svsi_obj"] / by_group["passes"]
by_group.to_csv(OUT / "table7b_e2b_by_group.csv", index=False)

# Exploratory tests against the E1 generator, Holm-corrected across the three comparisons.
ref = res.set_index("condition").loc[REF]
tests = []
for _, r in res[res["condition"] != REF].iterrows():
    for metric, k, n, kr, nr in [("objective", r.svsi_obj, r.structural_pass, ref.svsi_obj, ref.structural_pass),
                                 ("all_decided", r.svsi_all, r.decided, ref.svsi_all, ref.decided)]:
        odds, p = fisher_exact([[k, n - k], [kr, nr - kr]])
        tests.append(dict(metric=metric, comparison=f"{r.condition} vs {REF}", odds_ratio=odds, p=p))
t = pd.DataFrame(tests)
for metric in t["metric"].unique():
    m = t["metric"] == metric
    t.loc[m, "p_holm"] = multipletests(t.loc[m, "p"], method="holm")[1]
t.to_csv(OUT / "table7c_e2b_tests.csv", index=False)

(OUT / "e2b_summary.json").write_text(json.dumps(dict(
    status="EXPLORATORY", subset=SUBSET, families=FAMILIES, reference=REF,
    conditions=rows, tests=tests), indent=2, default=float))
pd.set_option("display.width", 200)
print(res[["condition", "runs", "inputs", "generation_failures", "structural_pass", "svsi_obj", "svsi_obj_rate",
           "svsi_obj_lo", "svsi_obj_hi", "decided", "svsi_all", "svsi_all_rate"]].round(3).to_string(index=False))
print(); print(by_group.round(3).to_string(index=False))
print(); print(t.round(4).to_string(index=False))

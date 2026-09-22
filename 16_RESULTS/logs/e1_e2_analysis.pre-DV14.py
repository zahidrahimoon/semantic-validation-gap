#!/usr/bin/env python3
"""E1/E2 analysis: SV-SI rates, category association, pre-declared condition contrasts.

Reads only the immutable raw folder; writes tables to this directory and figures to 09_DIAGRAMS/.
Every statistic here is pre-committed in 08_EXPERIMENT_PLAN.md (frozen at Gate B).

Usage: ../../../../.venv/bin/python e1_e2_analysis.py <run_folder>
"""
import json, sys, pathlib, itertools
import pandas as pd, numpy as np
from scipy import stats
from statsmodels.stats.proportion import proportion_confint
from statsmodels.stats.multitest import multipletests

RUN = pathlib.Path([a for a in sys.argv[1:] if not a.startswith("--")][0])
OUT = pathlib.Path(__file__).parent / ("sensitivity_include_retried" if "--include-retried" in sys.argv else "")
OUT.mkdir(exist_ok=True)
FIG = OUT / "../../09_DIAGRAMS/rendered"
FIG.mkdir(parents=True, exist_ok=True)

def jl(name):
    p = RUN / name
    return pd.DataFrame([json.loads(l) for l in open(p)]) if p.exists() else pd.DataFrame()

raw, val, lab = jl("raw_inputs.jsonl"), jl("validation_results.jsonl"), jl("semantic_labels.jsonl")
if lab.empty:
    sys.exit("semantic_labels.jsonl missing — run `cli.ts merge` first")

CATEGORY = {"F01":"simple","F04":"simple","F03":"aifacing","F07+F09":"crossfield","F12":"financial",
 "F13":"financial","F14":"financial","F15+F16":"crossfield","F18":"search","F20+F21":"crossfield",
 "F25":"financial","F28":"financial","F29":"freetext","F31+F33":"crossfield","F35":"aifacing",
 "F36+F37":"structured","F39":"aifacing"}
GROUP_NAME = {"A":"A valid human*","B":"B random","C":"C rule-based adversarial","D":"D LLM context-free",
 "E":"E LLM context-aware","F":"F boundary","G":"G benign-unusual human*"}

df = lab.merge(raw[["input_id","prompt_family","expected_category","model","run"]].rename(columns={"prompt_family":"pf"}),
               on="input_id", how="left", suffixes=("","_raw"))
df["category"] = df["target_id"].map(CATEGORY)

# DV-07: records produced by RETRYING a prompt family that had failed. A failed call yields no
# records, so any record in a (target, condition, family, run) cell that also has a recorded failure
# came from a retry. The frozen plan says failures are counted and never regenerated, so the PRIMARY
# analysis uses first attempts only; `--include-retried` gives the sensitivity analysis.
INCLUDE_RETRIED = "--include-retried" in sys.argv
_fails = jl("generation_failures.jsonl")
_failed = set() if _fails.empty else set(zip(_fails["target"], _fails["group"], _fails["family"], _fails["run"]))
df["retried"] = [(t, g, f, r) in _failed for t, g, f, r in zip(df["target_id"], df["group"], df["pf"], df["run"])]
n_retried = int(df["retried"].sum())
if not INCLUDE_RETRIED:
    df = df[~df["retried"]].copy()
print(f"retried records: {n_retried} ({'INCLUDED — sensitivity analysis' if INCLUDE_RETRIED else 'excluded — primary analysis, first attempts only'})")
df["is_p5"] = df["pf"].eq("P5")
primary = df[~df["is_p5"]].copy()              # P5 excluded from all primary rates (frozen)
all_passes = primary[primary["structural_pass"]].copy()
# DV-06: the judge was applied to a stratified sample, so some structurally valid inputs carry no
# verdict for their judgement rules and are labelled AMBIGUOUS. Rates are computed over DECIDED
# inputs only; including undecided ones in the denominator would understate every rate. The
# undecided share is reported so the reader can see the analysis population.
passes = all_passes[all_passes["final_label"].isin(["VALID", "SV-SI"])].copy()
undecided = len(all_passes) - len(passes)
print(f"analysis population: {len(passes)} decided of {len(all_passes)} structural passes "
      f"({undecided} undecided / not sampled for judging)")

def wilson(k, n):
    if n == 0: return (np.nan, np.nan, np.nan)
    lo, hi = proportion_confint(k, n, alpha=0.05, method="wilson")
    return (k / n, lo, hi)

# ---------- Table 1: outcomes by condition ----------
rows = []
for g, d in primary.groupby("group"):
    ap = d[d["structural_pass"]]                        # all structural passes (for the pass rate)
    p = ap[ap["final_label"].isin(["VALID", "SV-SI"])]  # decided only (for the SV-SI rates)
    sv = (p["final_label"] == "SV-SI").sum()
    amb = (ap["final_label"] == "AMBIGUOUS").sum()
    sr, srl, srh = wilson(len(ap), len(d))
    cr, crl, crh = wilson(sv, len(p))
    ur, url, urh = wilson(sv, len(d))
    rows.append(dict(group=g, name=GROUP_NAME.get(g, g), n=len(d), struct_pass=len(ap),
        struct_rate=sr, struct_lo=srl, struct_hi=srh, decided=len(p), svsi=sv, ambiguous=amb,
        cond_svsi=cr, cond_lo=crl, cond_hi=crh, uncond_svsi=ur, uncond_lo=url, uncond_hi=urh))
t1 = pd.DataFrame(rows).sort_values("group")
t1.to_csv(OUT / "table1_by_condition.csv", index=False)

# H1: pooled D+E conditional SV-SI, lower CI bound > 0.05
de = passes[passes["group"].isin(["D", "E"])]
k, n = (de["final_label"] == "SV-SI").sum(), len(de)
r, lo, hi = wilson(k, n)
h1 = dict(k=int(k), n=int(n), rate=r, ci_lo=lo, ci_hi=hi, threshold=0.05,
          H1_supported=bool(lo > 0.05) if n else None)

# ---------- Table 2: by field category (H2) ----------
rows = []
for c, d in passes.groupby("category"):
    sv = (d["final_label"] == "SV-SI").sum()
    r, lo, hi = wilson(sv, len(d))
    rows.append(dict(category=c, struct_pass=len(d), svsi=int(sv), cond_svsi=r, ci_lo=lo, ci_hi=hi))
t2 = pd.DataFrame(rows).sort_values("cond_svsi", ascending=False)
t2.to_csv(OUT / "table2_by_category.csv", index=False)
ct = pd.crosstab(passes["category"], passes["final_label"] == "SV-SI")
h2 = {}
if ct.shape[0] > 1 and ct.shape[1] > 1:
    chi2, p, dof, _ = stats.chi2_contingency(ct)
    nn = ct.values.sum()
    h2 = dict(chi2=chi2, p=p, dof=int(dof), cramers_v=float(np.sqrt(chi2 / (nn * (min(ct.shape) - 1)))),
              H2_supported=bool(p < 0.05))

# ---------- Table 3: pre-declared contrasts (H3a-c) ----------
def contrast(g1, g2):
    a = passes[passes["group"] == g1]; b = passes[passes["group"] == g2]
    k1, n1 = (a["final_label"] == "SV-SI").sum(), len(a)
    k2, n2 = (b["final_label"] == "SV-SI").sum(), len(b)
    if min(n1, n2) == 0: return dict(contrast=f"{g1}>{g2}", note="empty group")
    odds, p = stats.fisher_exact([[k1, n1 - k1], [k2, n2 - k2]], alternative="greater")
    return dict(contrast=f"{g1}>{g2}", k1=int(k1), n1=int(n1), rate1=k1/n1, k2=int(k2), n2=int(n2),
                rate2=k2/n2, odds_ratio=odds, p_raw=p)
pre = [contrast("E","B"), contrast("E","G"), contrast("D","B")]
pre = [x for x in pre if "p_raw" in x]
if pre:
    ps = [x["p_raw"] for x in pre]
    rej, adj, _, _ = multipletests(ps, alpha=0.05, method="holm")
    for x, a, r_ in zip(pre, adj, rej): x["p_holm"], x["significant"] = a, bool(r_)
t3 = pd.DataFrame(pre); t3["hypothesis"] = ["H3a","H3b","H3c"][:len(t3)]
t3.to_csv(OUT / "table3_contrasts.csv", index=False)

# exploratory: all other pairs
expl = []
for g1, g2 in itertools.permutations(sorted(passes["group"].unique()), 2):
    if f"{g1}>{g2}" in [x["contrast"] for x in pre]: continue
    c = contrast(g1, g2)
    if "p_raw" in c: expl.append(c)
pd.DataFrame(expl).to_csv(OUT / "table3b_exploratory_contrasts.csv", index=False)

# ---------- Table 4: violation taxonomy (RQ4) ----------
vio = []
for _, r in passes.iterrows():
    for rule in (r["violated_rules"] or []):
        vio.append(dict(group=r["group"], category=r["category"], target=r["target_id"], rule=rule,
                        cls="OBJ" if rule in (r["violated_obj"] or []) else "JUD"))
t4 = pd.DataFrame(vio)
if not t4.empty:
    t4.groupby(["rule","cls"]).size().rename("count").reset_index().sort_values("count", ascending=False).to_csv(OUT / "table4_violations_by_rule.csv", index=False)
    pd.crosstab(t4["group"], t4["cls"]).to_csv(OUT / "table4b_violation_class_by_group.csv")

# ---------- AI-facing: injection vs ordinary inappropriateness (RQ4/G5) ----------
ai = df[df["category"] == "aifacing"]
aip = ai[ai["structural_pass"]]
inj = dict(ai_facing_passes=int(len(aip)),
           svsi_all=int((aip["final_label"] == "SV-SI").sum()),
           svsi_p5=int(((aip["final_label"] == "SV-SI") & aip["is_p5"]).sum()),
           svsi_non_p5=int(((aip["final_label"] == "SV-SI") & ~aip["is_p5"]).sum()))

# ---------- per-run variance for LLM conditions ----------
runs = passes[passes["group"].isin(["D","E"])].groupby(["group","run"]).apply(
    lambda d: pd.Series({"n": len(d), "svsi": int((d["final_label"]=="SV-SI").sum()),
                         "rate": (d["final_label"]=="SV-SI").mean()}), include_groups=False).reset_index()
runs.to_csv(OUT / "table5_per_run.csv", index=False)

# ---------- generation failures (reported, never silently dropped) ----------
fails = jl("generation_failures.jsonl")
fail_summary = {}
if not fails.empty:
    fails.groupby(["group", "target", "family", "reason"]).size().rename("count").reset_index().to_csv(OUT / "table0_generation_failures.csv", index=False)
    # denominator: one LLM call per target x group x family x run
    calls = raw[raw["group"].isin(["D", "E"])].groupby(["group", "target_id", "prompt_family", "run"]).size().shape[0] if not raw.empty else 0
    fail_summary = dict(total=int(len(fails)),
                        by_group={k: int(v) for k, v in fails["group"].value_counts().items()},
                        by_reason={k: int(v) for k, v in fails["reason"].value_counts().items()},
                        by_target={k: int(v) for k, v in fails["target"].value_counts().items()},
                        successful_calls=int(calls),
                        failure_rate=float(len(fails) / (len(fails) + calls)) if calls else None)

summary = dict(run=str(RUN.name), retried_records=n_retried, retried_included=INCLUDE_RETRIED, generation_failures=fail_summary,
               analysis_population=dict(structural_passes=int(len(all_passes)), decided=int(len(passes)),
                                        undecided_not_judged=int(undecided)), n_inputs=int(len(df)), n_primary=int(len(primary)),
               n_struct_pass=int(len(passes)), H1=h1, H2=h2,
               contrasts=[{k: (float(v) if isinstance(v, (int, float, np.floating)) else v) for k, v in x.items()} for x in pre],
               ai_facing=inj, ambiguous_share=float((passes["final_label"]=="AMBIGUOUS").mean()) if len(passes) else None)
(OUT / "e1_e2_summary.json").write_text(json.dumps(summary, indent=2, default=str))
print(json.dumps(summary, indent=2, default=str)[:2000])
print("\nTables written to", OUT)

#!/usr/bin/env python3
"""E3 analysis: detection quality of each semantic-layer design, leave-fields-out.

Thresholds are chosen on training-fold fields at FPR <= 0.05 on VALID inputs and applied to held-out
fields, so no design is tuned on the fields it is scored on (08_EXPERIMENT_PLAN.md, frozen).
Primary metric: recall at FPR <= 0.05 on held-out fields. H5: some non-JUDGE design reaches >= 0.70.

Usage: ../../../../.venv/bin/python e3_analysis.py <run_folder>
"""
import json, sys, pathlib
import numpy as np, pandas as pd
from defects import key_mismatch_ids  # DV-14

RUN = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(__file__).parent
rows = [json.loads(l) for l in open(RUN / "e3_decisions.jsonl")]
d = pd.DataFrame(rows)
_km = key_mismatch_ids(RUN)  # DV-14
print(f"key-mismatch records excluded (DV-14): {d[d['design'] == 'R']['input_id'].isin(_km).sum()}")
d = d[~d["input_id"].isin(_km)].copy()
if d.empty: sys.exit("no e3 decisions")
d["y"] = (d["label"] == "SV-SI").astype(int)

# DV-08: the model-based designs (SLM, JUDGE) were scored on a stratified sample; the fast designs on
# everything. The PRIMARY comparison restricts every design to that same sample so it is like for
# like; full-corpus figures for the fast designs are reported separately.
_sf = RUN / "e3_sample_ids.json"
SAMPLE = set(json.loads(_sf.read_text())["ids"]) if _sf.exists() else None
FULL = d.copy()
if SAMPLE is not None:
    d = d[d["input_id"].isin(SAMPLE)].copy()
    print(f"primary comparison on the shared stratified sample: {d['input_id'].nunique()} inputs")

FOLDS = 5
targets = sorted(FULL["target_id"].unique())
fold_of = {t: i % FOLDS for i, t in enumerate(targets)}
d["fold"] = d["target_id"].map(fold_of)
FULL["fold"] = FULL["target_id"].map(fold_of)

def threshold_at_fpr(scores_valid, max_fpr=0.05, candidates=None):
    """Smallest threshold t such that the share of VALID training inputs with score >= t is <= max_fpr.

    v1 used np.quantile, which is wrong for discrete or tied scores: for the binary rules design most
    valid scores are 0, the 95th percentile is 0, and 'score >= 0' flags every input (recall 1, FPR 1).
    Candidates are the distinct scores of ALL training inputs (both classes; passing only the VALID
    scores would miss e.g. t = 1 for a design that never flags a valid input) plus +inf (flag nothing),
    checked from low to high.
    """
    v = np.asarray(scores_valid, dtype=float)
    if len(v) == 0: return float("inf")
    cand = set(v.tolist()) | set(np.asarray(candidates if candidates is not None else [], dtype=float).tolist())
    for t in sorted(cand) + [float("inf")]:
        if (v >= t).mean() <= max_fpr:
            return t
    return float("inf")

def metrics(y, s, thr):
    pred = (s >= thr).astype(int)
    tp = int(((pred == 1) & (y == 1)).sum()); fp = int(((pred == 1) & (y == 0)).sum())
    fn = int(((pred == 0) & (y == 1)).sum()); tn = int(((pred == 0) & (y == 0)).sum())
    rec = tp / (tp + fn) if tp + fn else np.nan
    prec = tp / (tp + fp) if tp + fp else np.nan
    fpr = fp / (fp + tn) if fp + tn else np.nan
    f1 = 2 * prec * rec / (prec + rec) if prec and rec and not np.isnan(prec) and not np.isnan(rec) and (prec + rec) else np.nan
    return dict(tp=tp, fp=fp, fn=fn, tn=tn, recall=rec, precision=prec, fpr=fpr, fnr=1 - rec if rec == rec else np.nan, f1=f1)

results, per_fold, held = [], [], []
for design, dd in d.groupby("design"):
    ys, ss = [], []
    for f in range(FOLDS):
        tr, te = dd[dd["fold"] != f], dd[dd["fold"] == f]
        if te.empty or tr.empty: continue
        thr = threshold_at_fpr(tr.loc[tr["y"] == 0, "score"].values, candidates=tr["score"].values)
        m = metrics(te["y"].values, te["score"].values, thr)
        per_fold.append(dict(design=design, fold=f, threshold=thr, n=len(te), **m))
        ys.append(te["y"].values); ss.append((te["score"].values >= thr).astype(int))
        held.append(te.assign(pred=(te["score"].values >= thr).astype(int)))
    if not ys: continue
    y = np.concatenate(ys); pred = np.concatenate(ss)
    tp = int(((pred == 1) & (y == 1)).sum()); fp = int(((pred == 1) & (y == 0)).sum())
    fn = int(((pred == 0) & (y == 1)).sum()); tn = int(((pred == 0) & (y == 0)).sum())
    rec = tp / (tp + fn) if tp + fn else np.nan
    prec = tp / (tp + fp) if tp + fp else np.nan
    fpr = fp / (fp + tn) if fp + tn else np.nan
    # stratified bootstrap over inputs
    rng = np.random.default_rng(2026); boot = []
    idx = np.arange(len(y))
    for _ in range(1000):
        b = rng.choice(idx, len(idx), replace=True)
        yb, pb = y[b], pred[b]
        t_, f_ = ((pb == 1) & (yb == 1)).sum(), ((pb == 0) & (yb == 1)).sum()
        boot.append(t_ / (t_ + f_) if t_ + f_ else np.nan)
    lo, hi = np.nanpercentile(boot, [2.5, 97.5])
    results.append(dict(design=design, n=len(y), tp=tp, fp=fp, fn=fn, tn=tn,
        recall_at_fpr05=rec, recall_ci_lo=lo, recall_ci_hi=hi, precision=prec, fpr=fpr,
        f1=2 * prec * rec / (prec + rec) if prec and rec and (prec + rec) else np.nan,
        median_ms=float(dd["ms"].median()), p95_ms=float(dd["ms"].quantile(0.95))))

def auroc(y, s):
    """Mann-Whitney AUROC with ties counted as 1/2 (planned secondary metric)."""
    pos, neg = s[y == 1], s[y == 0]
    if len(pos) == 0 or len(neg) == 0: return np.nan
    gt = (pos[:, None] > neg[None, :]).sum(); eq = (pos[:, None] == neg[None, :]).sum()
    return float((gt + 0.5 * eq) / (len(pos) * len(neg)))

# EXPLORATORY (post hoc, not pre-registered): each design at its own native decision rule with no
# threshold tuning. Reported because the FPR <= 0.05 constraint forces coarse-scored designs (SLM, JUDGE,
# R) to an all-or-nothing operating point. For the prompted designs the native rule is "the model said
# appropriate=false"; a missing verdict or unparseable reply is NOT a detection (it scores 0.5 but the
# deployed layer fails open on it), and its rate is reported. For R, EMB, HYB it is score >= 0.5.
native = []
for design, dd in d.groupby("design"):
    if design in ("SLM", "JUDGE"):
        flag = dd["detail"].fillna("").str.startswith("appropriate=false").astype(int).values
        no_verdict = float((~dd["detail"].fillna("").str.match(r"appropriate=(true|false)")).mean())
    else:
        flag = (dd["score"].values >= 0.5).astype(int); no_verdict = 0.0
    m = metrics(dd["y"].values, flag, 1)
    native.append(dict(design=design, n=len(dd), auroc=auroc(dd["y"].values, dd["score"].values.astype(float)),
                       recall_native=m["recall"], fpr_native=m["fpr"], precision_native=m["precision"],
                       no_verdict_rate=no_verdict))
pd.DataFrame(native).to_csv(OUT / "table6d_detection_native_and_auroc.csv", index=False)

# Planned secondary: coverage per rule class, at the primary (held-out) operating point. An SV-SI input
# is "objective" if every rule it violates is objective, "judgement" if it violates at least one
# judgement rule. Also the FPR on benign-unusual inputs (condition G), which C4 is about.
labs = pd.DataFrame([json.loads(l) for l in open(RUN / "semantic_labels.jsonl")])
labs["rule_class"] = np.where(labs["violated_jud"].apply(len) > 0, "judgement",
                              np.where(labs["violated_obj"].apply(len) > 0, "objective", "none"))
H = pd.concat(held).merge(labs[["input_id", "rule_class"]], on="input_id", how="left")
cov = []
for design, hh in H.groupby("design"):
    row = dict(design=design)
    for rc in ["objective", "judgement"]:
        x = hh[(hh["y"] == 1) & (hh["rule_class"] == rc)]
        row[f"n_{rc}"] = len(x); row[f"recall_{rc}"] = x["pred"].mean() if len(x) else np.nan
    g = hh[(hh["y"] == 0) & (hh["group"] == "G")]
    row["n_valid_G"] = len(g); row["fpr_G"] = g["pred"].mean() if len(g) else np.nan
    cov.append(row)
pd.DataFrame(cov).to_csv(OUT / "table6e_detection_by_rule_class.csv", index=False)
print(pd.DataFrame(cov).round(3).to_string(index=False))

res = pd.DataFrame(results).sort_values("recall_at_fpr05", ascending=False)
res["population"] = "shared stratified sample" if SAMPLE is not None else "all decided inputs"
res.to_csv(OUT / "table6_detection.csv", index=False)

# Secondary: fast designs on the full corpus (more precise, but not directly comparable to SLM/JUDGE).
if SAMPLE is not None:
    full_rows = []
    for design, dd in FULL[FULL["design"].isin(["R", "EMB", "HYB"])].groupby("design"):
        ys, ps = [], []
        for f in range(FOLDS):
            tr, te = dd[dd["fold"] != f], dd[dd["fold"] == f]
            if te.empty or tr.empty: continue
            thr = threshold_at_fpr(tr.loc[tr["y"] == 0, "score"].values, candidates=tr["score"].values)
            ys.append(te["y"].values); ps.append((te["score"].values >= thr).astype(int))
        if not ys: continue
        y = np.concatenate(ys); pr = np.concatenate(ps)
        tp = int(((pr == 1) & (y == 1)).sum()); fp = int(((pr == 1) & (y == 0)).sum())
        fn = int(((pr == 0) & (y == 1)).sum()); tn = int(((pr == 0) & (y == 0)).sum())
        full_rows.append(dict(design=design, n=len(y), recall=tp / (tp + fn) if tp + fn else np.nan,
                              fpr=fp / (fp + tn) if fp + tn else np.nan, population="all decided inputs"))
    pd.DataFrame(full_rows).to_csv(OUT / "table6c_detection_full_corpus_fast_designs.csv", index=False)
pd.DataFrame(per_fold).to_csv(OUT / "table6b_detection_per_fold.csv", index=False)

non_judge = res[res["design"] != "JUDGE"]
h5 = dict(best_non_judge=None if non_judge.empty else str(non_judge.iloc[0]["design"]),
          best_recall=None if non_judge.empty else float(non_judge.iloc[0]["recall_at_fpr05"]),
          threshold=0.70,
          H5_supported=bool(not non_judge.empty and non_judge.iloc[0]["recall_at_fpr05"] >= 0.70))
(OUT / "e3_summary.json").write_text(json.dumps(dict(H5=h5, designs=results, exploratory_native=native), indent=2, default=str))
print(res.to_string(index=False)); print("\nH5:", json.dumps(h5, indent=2))
print("\nEXPLORATORY native operating point + AUROC:"); print(pd.DataFrame(native).to_string(index=False))

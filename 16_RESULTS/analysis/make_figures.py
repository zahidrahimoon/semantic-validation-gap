#!/usr/bin/env python3
"""Figures for the paper, regenerated from the analysis tables. Colour-blind-safe, greyscale-legible."""
import sys, pathlib
import pandas as pd, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

OUT = pathlib.Path(__file__).parent
FIG = (OUT / "../../09_DIAGRAMS/rendered").resolve(); FIG.mkdir(parents=True, exist_ok=True)
plt.rcParams.update({"font.size": 9, "figure.dpi": 300, "savefig.bbox": "tight", "axes.spines.top": False, "axes.spines.right": False})
HATCH = ["", "///", "...", "xxx", "\\\\\\", "|||", "---"]

t1 = pd.read_csv(OUT / "table1_by_condition.csv")
fig, ax = plt.subplots(figsize=(5.5, 2.8))
x = range(len(t1))
ax.bar(x, t1["cond_svsi"], color="0.55", edgecolor="black",
       yerr=[t1["cond_svsi"] - t1["cond_lo"], t1["cond_hi"] - t1["cond_svsi"]], capsize=3)
for i, h in zip(x, HATCH[:len(t1)]): ax.patches[i].set_hatch(h)
ax.set_xticks(list(x)); ax.set_xticklabels(t1["group"], )
ax.set_ylabel("conditional SV-SI rate"); ax.set_xlabel("generation condition")
ax.set_ylim(0, 1)
fig.savefig(FIG / "fig_svsi_by_condition.pdf"); plt.close(fig)

t2 = pd.read_csv(OUT / "table2_by_category.csv")
fig, ax = plt.subplots(figsize=(5.5, 2.8))
ax.barh(t2["category"], t2["cond_svsi"], color="0.7", edgecolor="black",
        xerr=[t2["cond_svsi"] - t2["ci_lo"], t2["ci_hi"] - t2["cond_svsi"]], capsize=3)
ax.set_xlabel("conditional SV-SI rate"); ax.set_xlim(0, 1)
fig.savefig(FIG / "fig_svsi_by_category.pdf"); plt.close(fig)

fig, ax = plt.subplots(figsize=(5.5, 2.8))
ax.bar(range(len(t1)), t1["struct_rate"], color="0.85", edgecolor="black")
ax.set_xticks(range(len(t1))); ax.set_xticklabels(t1["group"])
ax.set_ylabel("structural pass rate"); ax.set_xlabel("generation condition"); ax.set_ylim(0, 1)
fig.savefig(FIG / "fig_structural_pass.pdf"); plt.close(fig)
# Detection vs request-path cost (RQ6): E3 recall at FPR <= 0.05 against worst-case added p97.5 over
# endpoints, one panel per concurrency. Only drawn once the E4 analysis exists.
pf_path = OUT / "table8b_e4_pareto.csv"
if pf_path.exists():
    pf = pd.read_csv(pf_path)
    MARK = {"R": "o", "EMB": "s", "HYB": "D", "SLM": "^", "JUDGE": "v"}
    concs = sorted(pf["concurrency"].unique())
    fig, axes = plt.subplots(1, len(concs), figsize=(5.5, 2.4), sharey=True)
    for ax, c in zip(axes if len(concs) > 1 else [axes], concs):
        d = pf[pf["concurrency"] == c]
        for _, r in d.iterrows():
            ax.scatter(max(r["worst_added_p97_5"], 1), r["recall"], marker=MARK.get(r["config"], "o"),
                       facecolor="black" if r["pareto_optimal"] else "white", edgecolor="black", s=36, zorder=3)
            ax.annotate(r["config"], (max(r["worst_added_p97_5"], 1), r["recall"]), textcoords="offset points",
                        xytext=(4, 3), fontsize=7)
        ax.set_xscale("log"); ax.set_title(f"concurrency {int(c)}", fontsize=8)
        ax.set_xlabel("added p97.5 latency (ms, log)"); ax.axhline(0.70, color="0.5", ls="--", lw=0.8)
    (axes[0] if len(concs) > 1 else axes).set_ylabel("recall at FPR $\\leq$ 0.05")
    fig.savefig(FIG / "fig_tradeoff.pdf"); plt.close(fig)
print("figures written to", FIG)

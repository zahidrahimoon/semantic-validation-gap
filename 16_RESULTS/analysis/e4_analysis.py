#!/usr/bin/env python3
"""E4 analysis: request-path overhead of each semantic-layer configuration (RQ6, H6).

Input: latency_results.csv written by perf/run_e4.sh v2 (one row per configuration x concurrency x
endpoint x repetition, each a 60 s autocannon run after a 10 s warm-up).

Per cell (configuration x concurrency x endpoint) the median over the 3 repetitions is taken for each
percentile, as pre-registered. Added latency = configuration - structural-only.

H6 was pre-registered on p95, but autocannon reports p90 and p97.5, not p95 (DV-12). Decided on
2026-09-22 before any layer configuration had been measured (only structural-only runs existed):
  * PRIMARY: H6 is evaluated on the added p97.5 (config p97.5 - structural p97.5), the nearest reported
    tail percentile at or above p95. R/EMB hold in a cell if added p97.5 <= 50 ms; JUDGE holds if >= 1000 ms.
  * SENSITIVITY: the added p95 bracketed without interpolation, using monotonicity of percentiles:
        lower = config p90 - structural p97.5,   upper = config p97.5 - structural p90.
    Reported, not used for the verdict: the profile endpoint's own tail makes this bracket about
    +/-100 ms wide even for structural-only against itself.
A part of H6 holds only if it holds in EVERY cell (3 endpoints x 2 concurrencies) and at least one cell exists.

Usage: .venv/bin/python e4_analysis.py <E4 run folder>
"""
import json, sys, pathlib
import numpy as np, pandas as pd

RUN = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(__file__).parent
d = pd.read_csv(RUN / "latency_results.csv")
PCTS = ["p50", "p90", "p97_5", "p99", "mean", "rps"]

# Integrity: every run must be all-2xx (run_e4.sh rejects others) and, for layer configurations, the
# layer must actually have been called and succeeded (fail-open calls would make a layer look free).
bad = d[(d["non2xx"].fillna(0) > 0) | (d["errors"].fillna(0) > 0)]
if len(bad): sys.exit(f"{len(bad)} runs with failed requests; refusing to analyse")
d["layer_success"] = d["layer_calls_ok"] / (d["layer_calls_ok"] + d["layer_calls_failed"]).replace(0, np.nan)
# DV-17: a saturated run (no request completed within the run) has no latency; it counts as +inf, so a
# cell's median is +inf when at least two of its three repetitions saturated.
if "saturated" not in d: d["saturated"] = 0
for c in ["p50", "p90", "p97_5", "p99", "mean"]:
    d.loc[d["saturated"] == 1, c] = np.inf

cell = (d.groupby(["config", "concurrency", "endpoint"])
        .agg(reps=("rep", "nunique"), requests=("requests", "median"),
             layer_calls_ok=("layer_calls_ok", "sum"), layer_calls_failed=("layer_calls_failed", "sum"),
             saturated_reps=("saturated", "sum"),
             **{c: (c, "median") for c in PCTS}).reset_index())
base = cell[cell["config"] == "structural"].set_index(["concurrency", "endpoint"])

rows = []
for _, r in cell.iterrows():
    b = base.loc[(r["concurrency"], r["endpoint"])]
    row = r.to_dict()
    for c in ["p50", "p90", "p97_5", "p99"]:
        row[f"added_{c}"] = r[c] - b[c]
    row["added_p95_lo"] = r["p90"] - b["p97_5"]
    row["added_p95_hi"] = r["p97_5"] - b["p90"]
    row["rps_ratio"] = r["rps"] / b["rps"] if b["rps"] else np.nan
    n_calls = r["layer_calls_ok"] + r["layer_calls_failed"]
    row["layer_success"] = r["layer_calls_ok"] / n_calls if n_calls else np.nan
    rows.append(row)
res = pd.DataFrame(rows)
# A layer configuration whose layer was never called, or failed open, measured nothing: say so loudly.
for r in res[res["config"] != "structural"].itertuples():
    if r.layer_calls_ok == 0 or r.layer_calls_failed > 0:
        print(f"!! {r.config} c={r.concurrency} {r.endpoint}: layer calls ok={r.layer_calls_ok} "
              f"failed={r.layer_calls_failed}; latency for this cell does not measure a working layer")
ORDER = {"structural": 0, "R": 1, "EMB": 2, "HYB": 3, "SLM": 4, "JUDGE": 5}
res = res.sort_values(["concurrency", "endpoint", "config"], key=lambda s: s.map(ORDER) if s.name == "config" else s)


def verdict(cfg, added):
    if cfg in ("R", "EMB"): return "holds" if added <= 50 else "fails"
    if cfg == "JUDGE": return "holds" if added >= 1000 else "fails"
    return None


def bracket(cfg, lo, hi):  # sensitivity only
    if cfg in ("R", "EMB"): return "holds" if hi <= 50 else ("fails" if lo > 50 else "undetermined")
    if cfg == "JUDGE": return "holds" if lo >= 1000 else ("fails" if hi < 1000 else "undetermined")
    return None


res["h6"] = [verdict(c, a) for c, a in zip(res["config"], res["added_p97_5"])]
res["h6_p95_bracket"] = [bracket(c, lo, hi) for c, lo, hi in zip(res["config"], res["added_p95_lo"], res["added_p95_hi"])]
res.to_csv(OUT / "table8_e4_overhead.csv", index=False)  # after the H6 verdicts, so the table shows them
h6_cells = res[res["h6"].notna()]
part1 = h6_cells[h6_cells["config"].isin(["R", "EMB"])]["h6"]
part2 = h6_cells[h6_cells["config"] == "JUDGE"]["h6"]
def part(v):
    if len(v) == 0: return "not measured"
    return "holds" if (v == "holds").all() else "fails"
H6 = dict(
    part1_R_EMB_le_50ms=part(part1), part2_JUDGE_ge_1000ms=part(part2),
    cells=h6_cells[["config", "concurrency", "endpoint", "added_p97_5", "added_p95_lo", "added_p95_hi",
                    "h6", "h6_p95_bracket"]].to_dict("records"),
    note="evaluated on added p97.5 (autocannon does not report p95); p95 bracket as sensitivity; DV-12")
H6["H6_supported"] = H6["part1_R_EMB_le_50ms"] == "holds" and H6["part2_JUDGE_ge_1000ms"] == "holds"

# Detection-latency Pareto: E3 recall at FPR <= 0.05 against the worst-case added p97.5 over endpoints.
pareto = []
det = OUT / "table6_detection.csv"
if det.exists():
    rec = pd.read_csv(det).set_index("design")["recall_at_fpr05"]
    for (cfg, conc), g in res[res["config"] != "structural"].groupby(["config", "concurrency"]):
        if cfg in rec.index:
            pareto.append(dict(config=cfg, concurrency=conc, recall=float(rec[cfg]),
                               worst_added_p97_5=float(g["added_p97_5"].max())))
    pf = pd.DataFrame(pareto)
    if len(pf):
        pf["pareto_optimal"] = [not ((pf["concurrency"] == r.concurrency) & (pf["recall"] >= r.recall)
                                     & (pf["worst_added_p97_5"] <= r.worst_added_p97_5)
                                     & ((pf["recall"] > r.recall) | (pf["worst_added_p97_5"] < r.worst_added_p97_5))).any()
                                for r in pf.itertuples()]
        pf.to_csv(OUT / "table8b_e4_pareto.csv", index=False)
        pareto = pf.to_dict("records")

(OUT / "e4_summary.json").write_text(json.dumps(dict(run=RUN.name, runs=int(len(d)), H6=H6, pareto=pareto),
                                                 indent=2, default=float))
pd.set_option("display.width", 220)
print(res[["config", "concurrency", "endpoint", "reps", "p50", "p97_5", "rps", "added_p50", "added_p97_5",
           "added_p95_lo", "added_p95_hi", "rps_ratio", "layer_success", "h6", "h6_p95_bracket"]].round(1).to_string(index=False))
print("\nH6:", json.dumps({k: v for k, v in H6.items() if k != "cells"}, indent=2))
if pareto: print(pd.DataFrame(pareto).round(3).to_string(index=False))

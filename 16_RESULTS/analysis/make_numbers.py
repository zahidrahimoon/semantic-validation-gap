#!/usr/bin/env python3
"""Write every number quoted in the paper's prose to 13_DRAFT/tables/numbers.tex.

The prose uses \\R{key} instead of typed numbers, so a figure in the text always equals the analysis
output it came from (an earlier draft had three hand-transcription errors). An unknown key prints
"??key" in bold and a LaTeX warning, so a missing number can never pass silently.

Run after all analysis scripts. Usage: .venv/bin/python make_numbers.py
"""
import json, pathlib
import pandas as pd

A = pathlib.Path(__file__).parent
RUN = A / "../raw/E1_E1_20260920T0847"
TEX = (A / "../../13_DRAFT/tables").resolve()
N = {}


def pct(x, nd=1): return f"{100 * float(x):.{nd}f}"
def ci(lo, hi): return f"{100 * float(lo):.1f}--{100 * float(hi):.1f}"
def f2(x): return f"{float(x):.2f}"
def pval(p):
    p = float(p)
    if p < 0.001: return "$p<0.001$"
    return f"$p={p:.3f}$" if p < 0.01 else f"$p={p:.2f}$"
def put(k, v): N[k] = str(v)


# ---- E1 population and failures
s = json.loads((A / "e1_e2_summary.json").read_text())
raw = [json.loads(l) for l in open(RUN / "raw_inputs.jsonl") if l.strip()]
fails = [json.loads(l) for l in open(RUN / "generation_failures.jsonl") if l.strip()]
put("e1.inputs", len(raw))
put("e1.keymismatch", s["key_mismatch_excluded"])
put("e1.retried", s["retried_records"])
put("e1.reviewexcluded", s.get("review_excluded", 0))
put("e1.p5", len(raw) - s["key_mismatch_excluded"] - s.get("review_excluded", 0) - s["retried_records"] - s["n_primary"])
put("e1.primary", s["n_primary"])
put("e1.passes", s["analysis_population"]["structural_passes"])
put("e1.decided", s["analysis_population"]["decided"])
put("e1.undecided", s["analysis_population"]["undecided_not_judged"])
put("e1.failrecords", len(fails))
put("e1.failcells", len({(f["target"], f["group"], f["family"], f["run"]) for f in fails}))
put("e1.failcallerror", s["generation_failures"]["by_reason"].get("call_error", 0))
put("e1.failunparse", s["generation_failures"]["by_reason"].get("unparseable_or_empty", 0))
# undecided structural passes: never judged vs judged without a usable verdict
from defects import key_mismatch_ids, excluded_ids
_lab = pd.DataFrame([json.loads(l) for l in open(RUN / "semantic_labels.jsonl") if l.strip()])
_raw = pd.DataFrame(raw)[["input_id", "run"]]
_fs = {(f["target"], f["group"], f["family"], f["run"]) for f in fails}
_d = _lab.merge(_raw, on="input_id", how="left")
_d = _d[~_d["input_id"].isin(excluded_ids(RUN))]
_d = _d[[(t, g, pf, r) not in _fs for t, g, pf, r in zip(_d["target_id"], _d["group"], _d["prompt_family"], _d["run"])]]
_u = _d[(_d["prompt_family"] != "P5") & _d["structural_pass"] & ~_d["final_label"].isin(["VALID", "SV-SI"])]
_judged = {json.loads(l)["input_id"] for l in open(RUN / "judge_verdicts.jsonl") if l.strip()}
put("e1.undecided.unsure", int(_u["input_id"].isin(_judged).sum()))
put("e1.undecided.unjudged", int((~_u["input_id"].isin(_judged)).sum()))
h1 = s["H1"]
put("h1.k", h1["k"]); put("h1.n", h1["n"]); put("h1.rate", pct(h1["rate"])); put("h1.ci", ci(h1["ci_lo"], h1["ci_hi"]))
r = json.loads((A / "sensitivity_include_retried/e1_e2_summary.json").read_text())["H1"]
put("h1.withretried", pct(r["rate"]))

t1 = pd.read_csv(A / "table1_by_condition.csv").set_index("group")
for g, row in t1.iterrows():
    put(f"c.{g}.rate", pct(row["cond_svsi"])); put(f"c.{g}.ci", ci(row["cond_lo"], row["cond_hi"]))
    put(f"c.{g}.struct", pct(row["struct_rate"]))
t5 = pd.read_csv(A / "table5_per_run.csv")
for _, row in t5.iterrows(): put(f"run.{row['group']}.{int(row['run'])}", pct(row["rate"]))

sens = pd.read_csv(A / "table1c_sensitivity.csv")
key = {"primary": "primary", "P1 only": "pone", "excluding P3": "nopthree", "excluding F15+F16": "nodates",
       "objective rules only": "objective", "excluding context rules": "nocontext", "target-weighted": "weighted"}
cond = {"LLM (D+E)": "llm", "B": "B", "G": "G"}
for _, row in sens.iterrows():
    if pd.isna(row["rate"]): continue
    k = f"s.{cond[row['condition']]}.{key[row['variant']]}"
    put(k, pct(row["rate"]))
    if not pd.isna(row["ci_lo"]): put(k + ".ci", ci(row["ci_lo"], row["ci_hi"]))

fam = pd.read_csv(A / "table1b_llm_by_family.csv")
for _, row in fam.iterrows():
    if row["family"] in ("pooled", "pooled excl. P3"): continue
    g = {"D": "D", "E": "E", "D+E": "DE"}[row["group"]]
    put(f"fam.{row['family']}.{g}", pct(row["rate"]))

# ---- H2 / categories
put("h2.chi", f"{s['H2']['chi2']:.1f}"); put("h2.v", f2(s["H2"]["cramers_v"]))
for _, row in pd.read_csv(A / "table2_by_category.csv").iterrows():
    put(f"cat.{row['category']}", f"{100 * row['cond_svsi']:.0f}")

# ---- H3 pooled and within target
c3 = pd.read_csv(A / "table3_contrasts.csv")
for _, row in c3.iterrows():
    put(f"h3.{row['contrast'].replace('>', 'gt')}.pholm", f2(row["p_holm"]))
cmh = pd.read_csv(A / "table3c_within_target_cmh.csv")
for _, row in cmh.iterrows():
    k = "cmh." + row["contrast"].replace(" vs ", "v")
    put(k + ".or", f2(row["mh_odds_ratio"]) if row["mh_odds_ratio"] < 10 else f"{row['mh_odds_ratio']:.1f}")
    put(k + ".ci", f"{row['ci_lo']:.2f}--{row['ci_hi']:.2f}" if row["ci_hi"] < 10 else f"{row['ci_lo']:.1f}--{row['ci_hi']:.1f}")
    put(k + ".p", pval(row["p_two_sided"]))
put("cmh.EvD.reduction", f"{100 * (1 - cmh.set_index('contrast').loc['E vs D', 'mh_odds_ratio']):.0f}")

# ---- RQ4
rules = pd.read_csv(A / "table4_violations_by_rule.csv").set_index("rule")["count"]
for rid in ["B-CO-2", "B-CO-3", "B-PR-6", "B-TK-4", "B-CO-7", "B-RV-3", "B-RV-4"]:
    if rid in rules: put(f"rule.{rid}", int(rules[rid]))
ai = s["ai_facing"]
# AI-facing SV-SI among LLM conditions only (review V2-03)
_AI = {"F03", "F35", "F39"}
_l = _d[(_d["group"].isin(["D", "E"])) & _d["structural_pass"] & (_d["final_label"] == "SV-SI") & _d["target_id"].isin(_AI)]
put("ai.llm.svsi", len(_l)); put("ai.llm.p5", int((_l["prompt_family"] == "P5").sum())); put("ai.llm.nonp5", int((_l["prompt_family"] != "P5").sum()))
# rule-class totals of violations (table4b) and the reference-condition size, judge supplement
_t4b = pd.read_csv(A / "table4b_violation_class_by_group.csv")
put("viol.jud", int(_t4b["JUD"].sum())); put("viol.obj", int(_t4b["OBJ"].sum()))
put("e1.refvalues", sum(1 for x in raw if x["group"] in ("A", "G")))
_js = json.loads((RUN / "judge_sample_ids.json").read_text())
put("judge.base", len(_js["ids"])); put("judge.supplement", len(_js["supplement"]))
put("ai.svsi", ai["svsi_all"]); put("ai.p5", ai["svsi_p5"]); put("ai.nonp5", ai["svsi_non_p5"])

# ---- E2b
e2b = pd.read_csv(A / "table7_e2b_model_size.csv").set_index("condition")
lab = {"qwen3:1.7b T0.8": "small", "qwen3:4b T0.8 (E1)": "ref", "qwen3:8b T0.8": "large", "qwen3:4b T0": "tzero"}
for c, row in e2b.iterrows():
    put(f"e2b.{lab[c]}.obj", pct(row["svsi_obj_rate"])); put(f"e2b.{lab[c]}.all", pct(row["svsi_all_rate"]))
tt = pd.read_csv(A / "table7c_e2b_tests.csv")
for _, row in tt.iterrows():
    c = lab[row["comparison"].split(" vs ")[0]]
    m = "obj" if row["metric"] == "objective" else "all"
    put(f"e2b.{c}.{m}.or", f"{row['odds_ratio']:.1f}"); put(f"e2b.{c}.{m}.p", pval(row["p_holm"]).replace("p", "p_{\\mathrm{Holm}}", 1))

# ---- E3
d6 = pd.read_csv(A / "table6_detection.csv").set_index("design")
nat = pd.read_csv(A / "table6d_detection_native_and_auroc.csv").set_index("design")
cov = pd.read_csv(A / "table6e_detection_by_rule_class.csv").set_index("design")
full = pd.read_csv(A / "table6c_detection_full_corpus_fast_designs.csv").set_index("design")
put("e3.n", int(d6["n"].iloc[0])); put("e3.pos", int(d6["tp"].iloc[0] + d6["fn"].iloc[0])); put("e3.neg", int(d6["fp"].iloc[0] + d6["tn"].iloc[0]))
put("e3.fulln", int(full["n"].iloc[0]))
for dz in d6.index:
    put(f"e3.{dz}.recall", pct(d6.loc[dz, "recall_at_fpr05"])); put(f"e3.{dz}.ci", ci(d6.loc[dz, "recall_ci_lo"], d6.loc[dz, "recall_ci_hi"]))
    put(f"e3.{dz}.fpr", pct(d6.loc[dz, "fpr"])); put(f"e3.{dz}.auroc", f2(nat.loc[dz, "auroc"]))
    put(f"e3.{dz}.nrecall", pct(nat.loc[dz, "recall_native"])); put(f"e3.{dz}.nfpr", pct(nat.loc[dz, "fpr_native"]))
    put(f"e3.{dz}.noverdict", f"{100 * nat.loc[dz, 'no_verdict_rate']:.0f}")
    put(f"e3.{dz}.robj", pct(cov.loc[dz, "recall_objective"])); put(f"e3.{dz}.rjud", pct(cov.loc[dz, "recall_judgement"]))
    put(f"e3.{dz}.fprG", pct(cov.loc[dz, "fpr_G"]))
for dz in full.index:
    put(f"e3.{dz}.fullrecall", pct(full.loc[dz, "recall"]))
pf = pd.read_csv(A / "table6b_detection_per_fold.csv")
put("e3.emb.foldfprmax", f"{100 * pf[pf['design'].isin(['EMB', 'HYB'])]['fpr'].max():.0f}")

# ---- E4 (only once its analysis exists)
e4 = A / "e4_summary.json"
if e4.exists() and (A / "table8_e4_overhead.csv").exists():
    t8 = pd.read_csv(A / "table8_e4_overhead.csv")
    for _, row in t8.iterrows():
        k = f"e4.{row['config']}.c{int(row['concurrency'])}.{row['endpoint']}"
        for col in ["p50", "p97_5", "added_p50", "added_p97_5", "rps"]:
            v = row[col]
            put(f"{k}.{col.replace('_', '')}", "$>$60\\,000" if v == float("inf") else (f"{v:.0f}" if col != "rps" else f"{v:.1f}"))
    for (cfg, conc), g in t8.groupby(["config", "concurrency"]):
        fmt = lambda v: "$>$60\\,000" if v == float("inf") else f"{v:.0f}"
        put(f"e4.{cfg}.c{int(conc)}.maxadd", fmt(g['added_p97_5'].max()))
        put(f"e4.{cfg}.c{int(conc)}.minadd", fmt(g['added_p97_5'].min()))
        put(f"e4.{cfg}.c{int(conc)}.maxp50add", fmt(g['added_p50'].max()))
        put(f"e4.{cfg}.c{int(conc)}.minp50add", fmt(g['added_p50'].min()))
        sec = lambda v: "$>$60" if v == float("inf") else f"{v / 1000:.1f}"
        put(f"e4.{cfg}.c{int(conc)}.minp50add.s", sec(g['added_p50'].min()))
        put(f"e4.{cfg}.c{int(conc)}.maxp50add.s", sec(g['added_p50'].max()))
    h6 = json.loads(e4.read_text())["H6"]
    put("h6.part1", h6["part1_R_EMB_le_50ms"]); put("h6.part2", h6["part2_JUDGE_ge_1000ms"])

# ---- researcher tasks: review of groups A/G (TH-10) and blind annotation (R3)
FLAGS = {"humanlabels": False, "reviewed": False, "judgeweak": False}
st = A / "../human_review/review_status.json"
if st.exists():
    rs = json.loads(st.read_text())
    FLAGS["reviewed"] = bool(rs["reviewed"])
    for k in ("keep", "change", "delete"): put(f"review.{k}", rs[k])
ag = A / "agreement_summary.json"
if ag.exists():
    sm = json.loads(ag.read_text())
    FLAGS["humanlabels"] = True; FLAGS["judgeweak"] = bool(sm["judgement_results_exploratory"])
    put("ann.items", sm["items"]); put("ann.repeats", sm["repeats"])
    for r in sm["rows"]:
        k = {"judge vs human": "judge", "rule functions vs human": "rules", "annotator vs self (repeats)": "self"}[r["comparison"]]
        put(f"kappa.{k}", f2(r["kappa"])); put(f"agree.{k}", pct(r["agreement"])); put(f"n.{k}", r["compared"])
        if r.get("human_unsure") is not None and r["rule_verdicts"]:
            put(f"unsure.{k}", pct(r["human_unsure"] / r["rule_verdicts"]))

lines = [r"% Generated by 16_RESULTS/analysis/make_numbers.py. Do not edit by hand.",
         r"\makeatletter",
         r"\newcommand{\R}[1]{\ifcsname res@#1\endcsname\csname res@#1\endcsname\else\textbf{??#1}\PackageWarning{numbers}{Unknown result key #1}\fi}"]
for k, v in sorted(N.items()):
    lines.append(rf"\expandafter\def\csname res@{k}\endcsname{{{v}}}")
for f, on in FLAGS.items():
    lines.append(rf"\newif\if{f}" + (rf"\{f}true" if on else ""))
lines.append(r"\makeatother")
(TEX / "numbers.tex").write_text("\n".join(lines) + "\n")
print(f"wrote {len(N)} numbers to {TEX / 'numbers.tex'}")

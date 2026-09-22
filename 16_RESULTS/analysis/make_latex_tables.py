#!/usr/bin/env python3
"""Render the analysis CSVs into IEEEtran table files that paper.tex \\input{}s.

Numbers are never typed by hand: the paper includes these files, so a table in the PDF always
matches the raw data it came from. Run after e1_e2_analysis.py and e3_analysis.py.

Usage: ../../../../.venv/bin/python make_latex_tables.py
"""
import json, pathlib
import pandas as pd

OUT = pathlib.Path(__file__).parent
TEX = (OUT / "../../13_DRAFT/tables").resolve(); TEX.mkdir(parents=True, exist_ok=True)

def pct(x, nd=1):
    return "--" if pd.isna(x) else f"{100*float(x):.{nd}f}"
def ci(lo, hi):
    return "--" if pd.isna(lo) or pd.isna(hi) else f"[{100*float(lo):.1f}, {100*float(hi):.1f}]"
def esc(s):
    return str(s).replace("&", r"\&").replace("_", r"\_").replace("%", r"\%")

def write(name, body):
    (TEX / name).write_text(body)
    print("wrote", TEX / name)

# ---- Table: outcomes by generation condition ----
f = OUT / "table1_by_condition.csv"
if f.exists():
    t = pd.read_csv(f)
    rows = "\n".join(
        f"{esc(r['name']).replace('*', '$^{*}$')} & {int(r['n'])} & {pct(r['struct_rate'])} & "
        f"{int(r['struct_pass'])} & {int(r['decided'])} & {int(r['svsi'])} & {pct(r['cond_svsi'])} & {ci(r['cond_lo'], r['cond_hi'])} \\\\"
        for _, r in t.iterrows())
    write("tab_conditions.tex", r"""\begin{table*}[t]
\caption{Structural and semantic outcomes by input-generation condition. The conditional SV-SI rate is
the share of structurally valid inputs that violate at least one business rule; it is the primary
outcome, computed over \emph{decided} passes: those whose every applicable rule received a verdict
(passes outside the judge sample are undecided and excluded). Prompt family P5 (injection) and retried
records are excluded. Intervals are Wilson 95\% confidence intervals.
$^{*}$Specified as human-written; values AI-drafted, researcher review outstanding.}
\label{tab:conditions}
\centering
\begin{tabular}{lrrrrrrr}
\toprule
Condition & $n$ & Struct.\ pass (\%) & Passes & Decided & SV-SI & Cond.\ SV-SI (\%) & 95\% CI \\
\midrule
""" + rows + r"""
\bottomrule
\end{tabular}
\end{table*}
""")

# ---- Table: by field category ----
f = OUT / "table2_by_category.csv"
if f.exists():
    t = pd.read_csv(f)
    CAT = {"structured": "Structured", "freetext": "Free text", "crossfield": "Cross-field",
           "aifacing": "AI-facing", "search": "Search", "simple": "Simple scalar", "financial": "Financial"}
    rows = "\n".join(f"{CAT.get(r['category'], esc(r['category']))} & {int(r['struct_pass'])} & {int(r['svsi'])} & "
                     f"{pct(r['cond_svsi'])} & {ci(r['ci_lo'], r['ci_hi'])} \\\\" for _, r in t.iterrows())
    s = {}
    p = OUT / "e1_e2_summary.json"
    if p.exists(): s = json.loads(p.read_text()).get("H2") or {}
    note = ("" if not s else
            f" A $\\chi^2$ test of independence gives $\\chi^2={s.get('chi2', float('nan')):.1f}$, "
            f"$p{'<0.001' if s.get('p', 1) < 0.001 else '=' + format(s.get('p', float('nan')), '.3f')}$, Cram\\'er's $V={s.get('cramers_v', float('nan')):.3f}$.")
    write("tab_categories.tex", r"""\begin{table}[t]
\caption{Conditional SV-SI rate by input-field category, over structurally valid inputs from all
conditions.""" + note + r"""}
\label{tab:categories}
\centering
\begin{tabular}{lrrrr}
\toprule
Field category & Passes & SV-SI & Cond.\ SV-SI (\%) & 95\% CI \\
\midrule
""" + rows + r"""
\bottomrule
\end{tabular}
\end{table}
""")

# ---- Table: pre-declared contrasts ----
f = OUT / "table3_contrasts.csv"
if f.exists():
    t = pd.read_csv(f)

    def num(v, nd=2):
        return "--" if pd.isna(v) else f"{float(v):.{nd}f}"

    def sci(v):
        if pd.isna(v): return "--"
        v = float(v)
        return "$<$0.001" if v < 0.001 else ("1.00" if v > 0.995 else f"{v:.2f}")

    cells = []
    for _, r in t.iterrows():
        cells.append(" & ".join([
            esc(r.get("hypothesis", "")),
            str(r["contrast"]).replace(">", "$>$"),
            pct(r["rate1"]),
            pct(r["rate2"]),
            num(r.get("odds_ratio")),
            sci(r.get("p_holm")),
            "yes" if r.get("significant") else "no",
        ]) + r" \\")
    rows = "\n".join(cells)
    write("tab_contrasts.tex", r"""\begin{table}[t]
\caption{Pre-declared one-sided contrasts on the conditional SV-SI rate (Fisher exact, Holm-corrected
across the three tests). Each test is one-sided in the pre-registered direction (Rate 1 $>$ Rate 2), so
an odds ratio below 1 yields $p$ close to 1. Conditions: B random, E LLM with field context,
G benign-unusual (AI-drafted), D LLM without field context. Within-target results are in the text.}
\label{tab:contrasts}
\centering
\footnotesize
\setlength{\tabcolsep}{3pt}
\begin{tabular}{llrrrrl}
\toprule
 & Contrast & Rate 1 (\%) & Rate 2 (\%) & OR & $p_{\mathrm{Holm}}$ & Supported \\
\midrule
""" + rows + r"""
\bottomrule
\end{tabular}
\end{table}
""")

# ---- Table: detection designs ----
f = OUT / "table6_detection.csv"
if f.exists():
    t = pd.read_csv(f)
    nat = pd.read_csv(OUT / "table6d_detection_native_and_auroc.csv").set_index("design")
    def ms(x):
        return f"{float(x):.2f}" if float(x) < 1 else f"{float(x):.0f}"
    rows = "\n".join(
        f"{esc(r['design'])} & {pct(r['recall_at_fpr05'])} & {ci(r['recall_ci_lo'], r['recall_ci_hi'])} & "
        f"{pct(r['fpr'])} & {pct(r['precision'])} & {float(nat.loc[r['design'], 'auroc']):.2f} & "
        f"{pct(nat.loc[r['design'], 'recall_native'])} / {pct(nat.loc[r['design'], 'fpr_native'])} & "
        f"{ms(r['median_ms'])} \\\\"
        for _, r in t.iterrows())
    npos = int(t["tp"].iloc[0] + t["fn"].iloc[0]); nneg = int(t["fp"].iloc[0] + t["tn"].iloc[0])
    nov = float(nat.loc["JUDGE", "no_verdict_rate"]) if "JUDGE" in nat.index else float("nan")
    write("tab_detection.tex", r"""\begin{table*}[t]
\caption{Detection quality of the candidate semantic validation layers on the shared stratified sample
of """ + f"{npos + nneg} decided inputs ({npos} SV-SI, {nneg} valid)" + r""", leave-fields-out (5 folds). Recall, 95\% bootstrap
interval, FPR and precision are at the pre-registered operating point: the threshold is the smallest
score whose false-positive rate on valid training-fold inputs is at most 5\%, applied to held-out fields.
AUROC is threshold-free. The native column (exploratory, not pre-registered) applies each design's own
decision rule without tuning: for SLM and JUDGE, the model answered ``not appropriate''; for R, EMB and
HYB, score $\geq 0.5$. JUDGE returned no usable verdict for """ + f"{100 * nov:.0f}" + r"""\% of inputs, counted as not flagged. R's zero FPR is partly by construction: its rule
functions also decide the ground truth for objective rules. JUDGE shares a model family with the
generator and is a reference point. Latency is the median decision time of the layer alone on the study CPU;
HYB's figure reuses embeddings already cached by EMB, so its uncached request-path cost is the one in Table~\ref{tab:e4}.}
\label{tab:detection}
\centering
\begin{tabular}{lrrrrrrr}
\toprule
Design & Recall (\%) & 95\% CI & FPR (\%) & Precision (\%) & AUROC & Native recall / FPR (\%) & Median (ms) \\
\midrule
""" + rows + r"""
\bottomrule
\end{tabular}
\end{table*}
""")

# ---- Table: generation failures ----
f = OUT / "table0_generation_failures.csv"
if f.exists():
    t = pd.read_csv(f)
    agg = t.groupby(["group", "reason"])["count"].sum().reset_index()
    rows = "\n".join(f"{esc(r['group'])} & {esc(r['reason'])} & {int(r['count'])} \\\\" for _, r in agg.iterrows())
    write("tab_failures.tex", r"""\begin{table}[t]
\caption{Generation failures, counted and reported rather than regenerated. The output parser and the
prompts were not changed during the run.}
\label{tab:failures}
\centering
\begin{tabular}{llr}
\toprule
Condition & Failure mode & Count \\
\midrule
""" + rows + r"""
\bottomrule
\end{tabular}
\end{table}
""")

# ---- Table: E2b model size / temperature (exploratory) ----
f = OUT / "table7_e2b_model_size.csv"
if f.exists():
    t = pd.read_csv(f)
    tests = pd.read_csv(OUT / "table7c_e2b_tests.csv")
    SHORT = {"qwen3:1.7b T0.8": "1.7b, $T$=0.8", "qwen3:4b T0.8 (E1)": "4b, $T$=0.8$^{\\dagger}$",
             "qwen3:8b T0.8": "8b, $T$=0.8", "qwen3:4b T0": "4b, $T$=0"}
    def ptxt(cond, metric):
        m = tests[(tests["comparison"].str.startswith(cond + " vs")) & (tests["metric"] == metric)]
        if m.empty: return "ref."
        v = float(m['p_holm'].iloc[0])
        return "$<$0.001" if v < 0.001 else f"{v:.2f}"
    rows = "\n".join(
        f"{esc(SHORT.get(r['condition'], r['condition']))} & {int(r['runs'])} & {int(r['inputs'])} & {int(r['structural_pass'])} & "
        f"{int(r['svsi_obj'])} ({pct(r['svsi_obj_rate'])}) & {ptxt(r['condition'], 'objective')} & "
        f"{int(r['svsi_all'])}/{int(r['decided'])} ({pct(r['svsi_all_rate'])}) & {ptxt(r['condition'], 'all_decided')} \\\\"
        for _, r in t.iterrows())
    write("tab_e2b.tex", r"""\begin{table}[t]
\caption{Exploratory: SV-SI by generator size and temperature on the same 10 targets, prompt families
P1--P4, conditions D and E. The objective-rule rate is decided for every structural pass and so is
comparable across rows; the all-rules rate uses the judge, which labelled 100 inputs per E2b run
against a 1{,}200-input sample in E1. $p_{\mathrm{Holm}}$: two-sided Fisher test against the E1
generator ($^{\dagger}$qwen3:4b, $T=0.8$, the E1 reference), Holm-corrected across three comparisons.
Obj.: SV-SI on objective rules among structural passes. All: SV-SI among decided passes.}
\label{tab:e2b}
\centering
\footnotesize
\setlength{\tabcolsep}{2.5pt}
\begin{tabular}{lrrrrrrr}
\toprule
qwen3 & Runs & $n$ & Pass & Obj.\ (\%) & $p_{\mathrm{H}}$ & All (\%) & $p_{\mathrm{H}}$ \\
\midrule
""" + rows + r"""
\bottomrule
\end{tabular}
\end{table}
""")

# ---- Table: E4 overhead ----
f = OUT / "table8_e4_overhead.csv"
if f.exists():
    t = pd.read_csv(f)
    def ms0(x):
        if pd.isna(x): return "--"
        return "$>$60\\,000" if x == float("inf") else f"{float(x):.0f}"
    rows = []
    for conc in sorted(t["concurrency"].unique()):
        rows.append(f"\\multicolumn{{9}}{{l}}{{\\emph{{Concurrency {int(conc)}}}}} \\\\")
        for _, r in t[t["concurrency"] == conc].iterrows():
            rows.append(f"{esc(r['config'])} & {esc(r['endpoint'])} & {ms0(r['p50'])} & {ms0(r['p97_5'])} & "
                        f"{ms0(r['added_p50'])} & {ms0(r['added_p97_5'])} & {float(r['rps']):.1f} & "
                        f"{'--' if r['config'] == 'structural' else pct(r['layer_success'], 0)} & "
                        f"{'' if pd.isna(r.get('h6')) else esc(r['h6'])} \\\\")
    write("tab_e4.tex", r"""\begin{table*}[t]
\caption{Request-path overhead of each configuration (production build, 4-core CPU, no GPU). Each
cell is the median over 3 repetitions of a 60\,s autocannon run after a 10\,s warm-up, with a unique
payload per request. Added latency is relative to structural-only validation on the same endpoint and
concurrency. H6 is evaluated on the added p97.5, the nearest tail percentile autocannon reports
($\geq$ p95). Layer success is the share of layer calls that returned a verdict rather than failing open.
``$>$60\,000'': the configuration saturated, completing no request within at least two of the three
60\,s runs.}
\label{tab:e4}
\centering
\begin{tabular}{llrrrrrrl}
\toprule
Config. & Endpoint & p50 (ms) & p97.5 (ms) & $\Delta$p50 (ms) & $\Delta$p97.5 (ms) & req/s & Layer ok (\%) & H6 \\
\midrule
""" + "\n".join(rows) + r"""
\bottomrule
\end{tabular}
\end{table*}
""")

# ---- Table: LLM rate by prompt family ----
f = OUT / "table1b_llm_by_family.csv"
if f.exists():
    t = pd.read_csv(f)
    rows = []
    for fam in ["P1", "P2", "P3", "P4", "P6", "P7"]:
        x = t[t["family"] == fam].set_index("group")
        if x.empty: continue
        rows.append(f"{fam} & {esc(x.loc['D+E', 'meaning']).replace('asked to violate rules', 'rule violations')} & {pct(x.loc['D', 'rate'])} & {pct(x.loc['E', 'rate'])} & "
                    f"{int(x.loc['D+E', 'svsi'])}/{int(x.loc['D+E', 'decided'])} & {pct(x.loc['D+E', 'rate'])} & "
                    f"{ci(x.loc['D+E', 'ci_lo'], x.loc['D+E', 'ci_hi'])} \\\\")
    for lbl in ["pooled", "pooled excl. P3"]:
        x = t[t["family"] == lbl].iloc[0]
        rows.append(f"\\multicolumn{{2}}{{l}}{{{'All (H1)' if lbl == 'pooled' else 'All except P3'}}} & & & "
                    f"{int(x['svsi'])}/{int(x['decided'])} & {pct(x['rate'])} & {ci(x['ci_lo'], x['ci_hi'])} \\\\")
    rows.insert(len(rows) - 2, "\\midrule")
    write("tab_family.tex", r"""\begin{table}[t]
\caption{Conditional SV-SI rate of model-generated inputs by prompt family (decided structural passes;
P5 excluded). P3 explicitly asks the model for values the application should reject; P1 asks for
legitimate values. D: without field context; E: with purpose and rules.}
\label{tab:family}
\centering
\footnotesize
\setlength{\tabcolsep}{2pt}
\begin{tabular}{llrrrrr}
\toprule
 & Prompt asks for & D (\%) & E (\%) & SV-SI & D+E (\%) & 95\% CI \\
\midrule
""" + "\n".join(rows) + r"""
\bottomrule
\end{tabular}
\end{table}
""")

# ---- Table: sensitivity of the H1 rate ----
f = OUT / "table1c_sensitivity.csv"
if f.exists():
    t = pd.read_csv(f)
    NAMES = {"primary": "Pre-registered (all rules)", "P1 only": "P1 (legitimate) prompts only",
             "excluding P3": "Without P3 (asks for violations)", "excluding F15+F16": "Without dates (F15+F16)",
             "objective rules only": "Objective rules only", "excluding context rules": "Without context rules",
             "target-weighted": "Target-weighted"}
    def cell(c, v):
        x = t[(t["condition"] == c) & (t["variant"] == v)]
        return "--" if x.empty or pd.isna(x["rate"].iloc[0]) else pct(x["rate"].iloc[0])
    rows = "\n".join(f"{NAMES[v]} & {cell('LLM (D+E)', v)} & "
                     f"{'--' if t[(t['condition'] == 'LLM (D+E)') & (t['variant'] == v)]['ci_lo'].isna().all() else ci(*t[(t['condition'] == 'LLM (D+E)') & (t['variant'] == v)][['ci_lo', 'ci_hi']].iloc[0])} & "
                     f"{cell('B', v)} & {cell('G', v)} \\\\" for v in NAMES)
    write("tab_sensitivity.tex", r"""\begin{table}[t]
\caption{Sensitivity of the conditional SV-SI rate to design choices. LLM: conditions D and E pooled;
B: random; G: benign-unusual (AI-drafted). ``Without context rules'' drops seven judgement rules the
judge had to decide without the rest of the record. ``Objective rules only'' uses no judge. Target-weighted averages
per-target rates by each target's share of structural passes. P1 and P3 apply to model conditions only.}
\label{tab:sensitivity}
\centering
\footnotesize
\setlength{\tabcolsep}{3pt}
\begin{tabular}{lrrrr}
\toprule
Variant & LLM (\%) & 95\% CI & B (\%) & G (\%) \\
\midrule
""" + rows + r"""
\bottomrule
\end{tabular}
\end{table}
""")

# ---- Table: per target ----
f = OUT / "table2b_by_target.csv"
if f.exists():
    t = pd.read_csv(f)
    CAT = {"structured": "Structured", "freetext": "Free text", "crossfield": "Cross-field",
           "aifacing": "AI-facing", "search": "Search", "simple": "Simple scalar", "financial": "Financial"}
    rows = "\n".join(f"{esc(r['target'])} & {CAT[r['category']]} & {int(r['decided'])} & {pct(r['rate'])} & "
                     f"{int(r['llm_decided'])} & {pct(r['llm_rate'])} \\\\" for _, r in t.iterrows())
    write("tab_targets.tex", r"""\begin{table}[t]
\caption{Conditional SV-SI rate per target, all conditions and model conditions (D+E) only, over
decided structural passes. Categories hold one to four targets, so a category rate can be driven by
a single target.}
\label{tab:targets}
\centering
\footnotesize
\setlength{\tabcolsep}{3pt}
\begin{tabular}{llrrrr}
\toprule
Target & Category & Decided & All (\%) & LLM dec. & LLM (\%) \\
\midrule
""" + rows + r"""
\bottomrule
\end{tabular}
\end{table}
""")
print("\nInclude in paper.tex with e.g. \\input{tables/tab_conditions}")

#!/bin/bash
# Regenerate every statistic, table, figure and number in the paper from ../raw/ alone.
# Run from this folder. Any non-zero exit stops the script, so a half-regenerated paper is impossible.
set -euo pipefail
PY=/home/zahid/ResearchWork/.venv/bin/python
R=../raw/E1_E1_20260920T0847
E4=../raw/E4_20260922T1142
step() { echo; echo "=== $* ==="; }

step "E1/E2 primary (Tables I-IV, H1-H3)";      $PY e1_e2_analysis.py "$R"
step "E1/E2 including retried calls (DV-07)";   $PY e1_e2_analysis.py "$R" --include-retried
step "within-target contrasts (post hoc)";      $PY e2_cmh_within_target.py "$R"
step "rate by prompt family";                   $PY e1_by_family.py "$R"
step "rate by target";                          $PY e1_by_target.py "$R"
step "H1 sensitivity variants";                 $PY e1_sensitivity.py "$R"
step "judge calibration (DV-21)";               $PY judge_calibration.py "$R"
step "cluster-robust intervals (DV-21)";        $PY cluster_bootstrap.py "$R"
step "annotator agreement";                     $PY annotation_agreement.py "$R"
step "model size / temperature (exploratory)";  $PY e2b_analysis.py
step "detection quality (RQ5)";                 $PY e3_analysis.py "$R"
step "trained embedding classifier";            $PY e3_trained_classifier.py "$R"
step "request-path overhead (RQ6)";             $PY e4_analysis.py "$E4"
step "figures";                                 $PY make_figures.py
step "LaTeX tables";                            $PY make_latex_tables.py
step "numbers.tex";                             $PY make_numbers.py
echo; echo "all analyses regenerated"

# analysis/ — regenerable statistics

Every table, figure and number in the paper is produced by a script here that reads only `../raw/`.
Outputs (CSV/JSON) are written to this folder; LaTeX tables and `numbers.tex` go to `../../13_DRAFT/tables/`;
figures to `../../09_DIAGRAMS/rendered/`. Package versions: `requirements.lock.txt` (Python 3.12.3).

Regenerate everything (from this folder, with the workspace venv `/home/zahid/ResearchWork/.venv/bin/python`):

```bash
R=../raw/E1_E1_20260920T0847
python e1_e2_analysis.py $R                  # E1/E2 primary (Tables I–IV, H1–H3)
python e1_e2_analysis.py $R --include-retried # sensitivity (DV-07)
python e2_cmh_within_target.py $R            # within-target contrasts (post hoc)
python e1_by_family.py $R                     # rate by prompt family
python e1_by_target.py $R                     # rate by target
python e1_sensitivity.py $R                   # H1 sensitivity variants
python e2b_analysis.py                        # model size / temperature (exploratory)
python e3_analysis.py $R                      # detection quality (RQ5)
python e4_analysis.py ../raw/E4_20260922T1142 # request-path overhead (RQ6)
python make_figures.py && python make_latex_tables.py && python make_numbers.py
```

`defects.py` holds the DV-14 exclusion (LLM records with missing target keys), used by every script.

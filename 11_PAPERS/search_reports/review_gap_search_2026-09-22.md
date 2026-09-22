# Review-gap search (I-R2-012), 2026-09-22

Why this search was run: reviewer issue I-R2-012 in `14_REVIEWS/novelty_review.md` and PROJECT_STATE TH-08.
Search date (system date): 2026-09-22. Scope: the four items listed under I-R2-012.
No edits were made to `paper.tex` or to any `.bib` file. The BibTeX below is **proposed only**.

Verification levels follow RESEARCH_SYSTEM.md A4. "Abstract read" means the abstract text was retrieved
from the source named and read in full. Nothing here claims more than that unless a full-text location is given.

**Tool note:** `tools/crossref_lookup.py --arxiv` returned "HTTP 406" for 2604.06185, 2608.03071 and
2605.16116, but worked for a control ID (1706.03762). A direct query to the arXiv API
(`export.arxiv.org/api/query?id_list=...`) returned all three records. arXiv metadata below comes from that
direct API response. The tool fault should be checked separately. It is not a sign that the papers are missing.

## 1. Search log

| # | Date | Source | Query / request | Results examined | Selected | Rejected / reason |
|---|---|---|---|---|---|---|
| 1 | 2026-09-22 | arXiv API id_list | 2604.06185, 2608.03071, 2605.16116 | 3 | all 3 records exist | — |
| 2 | 2026-09-22 | arxiv.org/html/2604.06185v1 (WebFetch) | error analysis / parameter value errors | 1 | WildToolBench §4.5, Table 4 | — |
| 3 | 2026-09-22 | WebSearch | `WildToolBench "Benchmarking LLM Tool-Use in the Wild" ICLR 2026 openreview` | 9 | ICLR 2026 poster page, OpenReview, ML Anthology record | — |
| 4 | 2026-09-22 | mlanthology.org (WebFetch) | yu2026iclr-benchmarking record | 1 | ICLR 2026 bibliographic record | — |
| 5 | 2026-09-22 | patents.google.com/patent/US12288159B1 | direct fetch | 0 | — | HTTP 404 (wrong kind code) |
| 6 | 2026-09-22 | WebSearch | `US 12288159 "context embedding" detecting data entry errors patent` | 9 | USPTO ppubs PDF link, Google Patents US12288159B2 | 7 unrelated |
| 7 | 2026-09-22 | patents.google.com/patent/US12288159 (WebFetch) | title, assignee, inventors, dates, abstract | 1 | US12288159B2 | — |
| 8 | 2026-09-22 | WebSearch | `"Data Validation for Machine Learning" Breck Polyzotis MLSys 2019` | 10 | MLSys proceedings page, PDF | Shankar 2023 CIKM (not screened here), interview studies |
| 9 | 2026-09-22 | proceedings.mlsys.org abstract page + BibTeX + PDF (curl, pdftotext) | metadata, author order, abstract | 1 | Breck et al. 2019 | — |
| 10 | 2026-09-22 | WebSearch | `"Automating large-scale data quality verification" Schelter PVLDB 2018 Deequ` | 9 | PVLDB 11(12) (Deequ) | "Unit Testing Data with Deequ" (SIGMOD demo, a lighter duplicate), Auto-Validate-by-History (not screened) |
| 11 | 2026-09-22 | WebSearch | `Sherlock deep learning approach semantic data type detection KDD 2019 Hulsebos` | 10 | Sherlock KDD 2019 | follow-up works (TabSketchFM, DomainNet): off-scope |
| 12 | 2026-09-22 | WebSearch | `semantic data validation beyond schema constraints data quality unit tests survey 2024 2025` | 10 | — (Auto-Test arXiv 2504.10762 noted, not screened) | vendor/blog pages |
| 13 | 2026-09-22 | Crossref (crossref_lookup.py --doi) | 10.14778/3229863.3229867; 10.1145/3292500.3330993 | 2 | both confirmed | — |
| 14 | 2026-09-22 | Crossref REST `filter=updates:<DOI>` | retraction/correction notices for both DOIs | 2 | 0 notices each | — |
| 15 | 2026-09-22 | arXiv API id_list | 1905.10688 (Sherlock abstract) | 1 | abstract read | — |
| 16 | 2026-09-22 | WebSearch | `LLM-generated form inputs pass schema validation violate business rules semantic validity 2026` | 9 | none (blogs, vendor pages, old form-validation patents) | not peer-reviewed or not research |
| 17 | 2026-09-22 | WebSearch | `arxiv 2026 "semantic validity" LLM generated API request payloads business constraints random baseline` | ~27 | 2607.18261 (already P33) | output-side or off-topic |
| 18 | 2026-09-22 | WebSearch | `"business rule" violations LLM agent web form submissions validation layer LLM-as-judge latency 2025` | 9 | none (2604.12177, AgentSpec: agent-policy enforcement, not input-value validity) | blogs |
| 19 | 2026-09-22 | WebSearch | `schema-valid but semantically invalid inputs web application LLM agents measurement study arxiv` | 9 | 2607.18261 (P33), 2604.16706 (AgentProp-Bench) noted | 2509.20172 already logged in QF6 |
| 20 | 2026-09-22 | WebSearch | `LLM test data generation web forms semantic constraints plausibility comparison random generator boundary values 2026` | 9 | none new (P20, P21 already V4) | — |
| 21 | 2026-09-22 | WebSearch | `validating LLM agent inputs to APIs cross-field constraints detection small language model embedding CPU latency evaluation` | 9 | 2609.07370 noted; 2605.26128 already in bib (ray2026constrainttax) | — |
| 22 | 2026-09-22 | arXiv API search, newest first | `abs:"schema-valid" OR abs:"business rules" AND abs:LLM` | 25 | 2609.23742 noted | 24 off-topic by title |
| 23 | 2026-09-22 | arXiv API id_list | 2609.23742, 2604.16706, 2609.07370 (abstracts) | 3 | abstracts read | see §5 |

## 2. Item 1: tool-call parameter benchmarks

### C1: arXiv 2604.06185, *Benchmarking LLM Tool-Use in the Wild* (WildToolBench). Verdict: **INCLUDE**
- Metadata (arXiv API): Peijie Yu, Wei Liu, Yifan Yang, Jinjian Li, Zelong Zhang, Xiao Feng, Feng Zhang;
  v1 published 2026-02-13 (the ID prefix 2604 does not match the Feb date, the same anomaly seen for P33); arXiv comment
  "accepted by ICLR 2026". Published version: ICLR 2026 (ML Anthology record `yu2026iclr-benchmarking`,
  same authors in the same order; ICLR 2026 poster page iclr.cc/virtual/2026/poster/10006500; OpenReview id
  yz7fL5vfpn). Per A4/Stage 3, cite the ICLR version.
- Level: **V3**. The abstract was read (arXiv API). The error-analysis section was located in the arXiv HTML: §4.5 and
  Table 4 list "Param Type Error", "Param Hallucination" and "Param Value Error" per model. The authors state that
  parameter-level errors are lower than action-level errors. This passage was read through a WebFetch summary, not
  checked line by line. Spot-check it before relying on anything past the abstract.
- One-sentence abstract-level description: a tool-use benchmark built on real user behaviour patterns
  (compositional tasks, implicit intent across turns, instruction transitions). No model among the 57 evaluated
  exceeds 15% accuracy.
- Correction to the reviewer note: the abstract does not mention parameter-value error rates. The per-category
  parameter-value error figures appear only in §4.5/Table 4. The figure "16.83% semantic parameter errors" from a
  blog search result (row 16) was **not** traced to this paper and must not be attributed to it.

### C2: arXiv 2608.03071, *Getting the Parameters Right: A Difficulty-Graded Benchmark and Probe-Guided Training for LLM Tool Calls* (ParamBench). Verdict: **INCLUDE**
- Metadata (arXiv API): 16 authors (see BibTeX); v1 2026-08-04; cs.AI; "15 pages, 8 figures"; no venue.
  Preprint.
- Level: **V2** (metadata from the arXiv API; abstract read).
- One-sentence description: introduces ParamBench, built from real cloud-network APIs and graded into five
  difficulty levels by parameter nesting depth, cross-parameter dependencies and value derivation from earlier
  calls. It also proposes probe-guided training and reranking, which the authors report raises average exact match
  on parameter generation from 19.7% to 59.6%.

## 3. Item 2: earlier novelty-kill leads (TH-08)

### C3: arXiv 2605.16116, *ShopGym*. Verdict: **EXCLUDE**
- Metadata (arXiv API): Chinmay Savadikar, Mingyu Zhao, Yuanzheng Zhu, Han Li, Shuang Xie, Alberto Castelo,
  Tianfu Wu, Lingyun Wang; 2026-05-15; cs.AI; preprint. Level: V2 (abstract read).
- Description: a framework that turns live storefronts into resettable sandbox shops (ShopArena) and synthesizes
  grounded benchmark tasks (ShopGuru) for evaluating e-commerce web agents.
- Reason for exclusion: the "validated generation process" validates the generated *shop environments*. It does not
  validate the values an agent submits. The paper does not measure business-rule validity of inputs, has no
  non-LLM input producers and no validation layer. It poses no novelty threat and is not needed for positioning.
  (The earlier note in 06_NOVELTY.md K3 about "7 post-generation validation rules" is not supported by the
  abstract. That detail was not read and should not be repeated.)

### C4: US Patent 12,288,159 B2, *Deep learning based context embedding approach for detecting data entry errors*. Verdict: **INCLUDE (recommended, human to confirm)**
- Metadata (Google Patents page US12288159B2, fetched 2026-09-22; USPTO ppubs PDF link found in search): assignee
  Intuit Inc.; inventors Arkadeep Banerjee, Vignesh T. Subrahmaniam; filed 2023-03-16; granted 2025-04-29.
  Level: **V2** (title and abstract only, as instructed). Claims and description were not read.
- Description (abstract): a method that classifies a string entered into a data field as valid or invalid. An
  embedding model encodes the value with reference values, statistics of recently entered values form a second
  vector, and a classifier runs on the concatenated vectors.
- Why include: it is the closest prior art found for the embedding-based validation layer (C4). An embedding plus
  classifier that flags invalid field entries has been patented. Citing it is honest positioning and does not weaken
  the paper, because the patent reports no measurement of AI-generated inputs, no comparison of producers and no
  latency comparison, at least in the abstract. It also narrows any claim that embedding-based field validation
  is new. It should be labelled as a patent and not treated as peer-reviewed evidence.

## 4. Item 3: data validation / data quality literature (3 selected)

All three are peer-reviewed venues and FOUNDATIONAL for this project, since they fall outside the priority window.

### C5: Breck et al., *Data Validation for Machine Learning*, MLSys 2019. Verdict: **INCLUDE**
- Metadata: Proceedings of Machine Learning and Systems, vol. 1, pp. 334–347, 2019 (proceedings.mlsys.org
  abstract page, citation meta tags and official BibTeX). No DOI.
- **Author-order conflict:** the proceedings page and BibTeX list Polyzotis, Zinkevich, Roy, Breck, Whang. The
  byline of the paper PDF itself (both the proceedings PDF and the mlsys.org PDF, extracted with pdftotext) reads
  **Eric Breck, Neoklis Polyzotis, Sudip Roy, Steven Euijong Whang, Martin Zinkevich**. The proposed entry follows
  the paper's own byline. `TODO-HUMAN`: confirm this choice.
- Level: **V3** (abstract and introduction first page read from the PDF).
- Description: presents the data validation system deployed in Google's TFX platform, which detects anomalies in
  data fed to ML pipelines (including schema-free data and training/serving skew), with evidence from production
  deployment.

### C6: Schelter et al., *Automating Large-Scale Data Quality Verification*, PVLDB 11(12), 2018 (Deequ). Verdict: **INCLUDE**
- Metadata (Crossref): Sebastian Schelter, Dustin Lange, Philipp Schmidt, Meltem Celikel, Felix Biessmann,
  Andreas Grafberger; Proc. VLDB Endow. 11(12):1781–1794, Aug 2018; DOI 10.14778/3229863.3229867. No Crossref
  update/retraction notices. Level: **V2** (Crossref abstract read).
- Description: a system with a declarative API that combines common quality constraints with user-defined
  validation code ("unit tests for data"), runs as aggregation queries on Apache Spark, and supports incremental
  validation and ML-assisted constraint suggestion and anomaly detection.

### C7: Hulsebos et al., *Sherlock: A Deep Learning Approach to Semantic Data Type Detection*, KDD 2019. Verdict: **INCLUDE**
- Metadata (Crossref): Madelon Hulsebos, Kevin Hu, Michiel Bakker, Emanuel Zgraggen, Arvind Satyanarayan, Tim
  Kraska, Çagatay Demiralp, César Hidalgo; Proc. 25th ACM SIGKDD, pp. 1500–1508, 2019; DOI
  10.1145/3292500.3330993 (the Crossref title field is truncated to "Sherlock"; the full title comes from arXiv
  1905.10688 and dblp). No update notices. Level: **V2** (abstract read from arXiv 1905.10688).
- Description: a multi-input neural network that detects the semantic types of table columns (78 DBpedia types).
  It is reported to outperform dictionary and regular-expression matching, which the authors describe as not robust
  to dirty data.

Noted but not screened (out of the 3-paper budget): Auto-Test (arXiv 2504.10762, semantic-domain constraints for
table error detection); Auto-Validate-by-History (arXiv 2306.02421); Shankar et al. CIKM 2023
(10.1145/3583780.3614786). All are V1 and must not be cited without screening.

## 5. Item 4: concurrent-work check (2025–2026)

Queries: rows 16–23 above (6 web searches, 1 arXiv API newest-first search of 25 records, and 1 abstract fetch of
3 candidates).

**Verdict: no work found that measures the business-rule validity of LLM-generated inputs to web forms/APIs
against non-LLM producers (random, rule-based, boundary), and none that also evaluates validation layers for
detection and CPU latency.** This is an absence of evidence within the queries run, not proof that no such work
exists.

The closest items are all output-side (LLM emits a structured object and the check is correctness against a
task answer, not an application's business rules), and none uses non-LLM producers:
- 2607.18261 OrderBench (P33, already cited as `li2026orderbench`): schema-valid ordering objects with ~80%
  semantic success. Still the nearest neighbour.
- **2609.23742** (Chavan, 2026-09-20, single author, preprint, V2 abstract read): *Constrained Decoding Eliminates
  Structural Failures in Small LLMs but Reveals a Scale-Dependent Semantic Gap*. Constrained decoding raises schema
  validity to 100% across 14 structured-output tasks on 0.6–4B models, but content accuracy shows a persistent,
  scale-dependent semantic gap. It is output-side with no web inputs, business rules or validation layer. It is
  optional to cite as further concurrent evidence that "schema-valid ≠ semantically correct". It was posted 2 days
  ago. Not added to the INCLUDE list; decision for the human.
- 2604.16706 AgentProp-Bench (V2 abstract): parameter-level errors propagate to wrong final answers (p ≈ 0.62).
  Adjacent. Not included.
- 2609.07370 (V2 abstract): CPU benchmark of sub-2B models for tool calling, including argument value agreement
  and latency. Adjacent on CPU latency but it evaluates tool-call generation, not validators. Not included.

## 6. Proposed BibTeX (not added to any .bib file)

```bibtex
@inproceedings{yu2026wildtoolbench,
  title     = {Benchmarking {LLM} Tool-Use in the Wild},
  author    = {Yu, Peijie and Liu, Wei and Yang, Yifan and Li, Jinjian and Zhang, Zelong and Feng, Xiao and Zhang, Feng},
  booktitle = {Proc. Int. Conf. Learning Representations ({ICLR})},
  year      = {2026},
  url       = {https://openreview.net/forum?id=yz7fL5vfpn},
  note      = {arXiv:2604.06185}
}

@misc{yu2026parambench,
  title         = {Getting the Parameters Right: A Difficulty-Graded Benchmark and Probe-Guided Training for {LLM} Tool Calls},
  author        = {Yu, Guoyao and Sun, Xiaoqing and Huang, Ziqi and Fan, Shaojing and Zhang, Zhongyi and Hu, Xiaomeng and Xue, Xiaobo and Shi, Yangyang and Xiao, Xiong and Song, Yang and Lyu, Biao and Wen, Rong and Li, Xing and He, Qinming and Zhu, Shunming and Liu, Zhenguang},
  year          = {2026},
  eprint        = {2608.03071},
  archivePrefix = {arXiv},
  primaryClass  = {cs.AI},
  howpublished  = {arXiv preprint arXiv:2608.03071},
  url           = {https://arxiv.org/abs/2608.03071}
}

@patent{banerjee2025contextembedding,
  title       = {Deep Learning Based Context Embedding Approach for Detecting Data Entry Errors},
  author      = {Banerjee, Arkadeep and Subrahmaniam, Vignesh T.},
  nationality = {US},
  number      = {12288159},
  type        = {Patent},
  assignee    = {Intuit Inc.},
  year        = {2025},
  month       = apr,
  day         = {29},
  url         = {https://patents.google.com/patent/US12288159B2}
}

@inproceedings{breck2019datavalidation,
  title     = {Data Validation for Machine Learning},
  author    = {Breck, Eric and Polyzotis, Neoklis and Roy, Sudip and Whang, Steven Euijong and Zinkevich, Martin},
  booktitle = {Proc. Machine Learning and Systems ({MLSys})},
  volume    = {1},
  pages     = {334--347},
  year      = {2019},
  url       = {https://proceedings.mlsys.org/paper_files/paper/2019/hash/928f1160e52192e3e0017fb63ab65391-Abstract.html},
  note      = {Author order follows the paper byline; proceedings metadata lists Polyzotis first}
}

@article{schelter2018deequ,
  title   = {Automating Large-Scale Data Quality Verification},
  author  = {Schelter, Sebastian and Lange, Dustin and Schmidt, Philipp and Celikel, Meltem and Biessmann, Felix and Grafberger, Andreas},
  journal = {Proc. {VLDB} Endowment},
  volume  = {11},
  number  = {12},
  pages   = {1781--1794},
  year    = {2018},
  doi     = {10.14778/3229863.3229867}
}

@inproceedings{hulsebos2019sherlock,
  title     = {Sherlock: A Deep Learning Approach to Semantic Data Type Detection},
  author    = {Hulsebos, Madelon and Hu, Kevin and Bakker, Michiel and Zgraggen, Emanuel and Satyanarayan, Arvind and Kraska, Tim and Demiralp, {\c{C}}a{\u{g}}atay and Hidalgo, C{\'e}sar},
  booktitle = {Proc. 25th {ACM} {SIGKDD} Int. Conf. Knowledge Discovery \& Data Mining},
  pages     = {1500--1508},
  year      = {2019},
  doi       = {10.1145/3292500.3330993}
}
```

(`yu2026wildtoolbench` and `yu2026parambench` share surname and year. Their keyword suffixes keep them distinct,
so no a/b suffix is needed.)

## 7. Suggested Related Work placements (abstract-level claims only)

- **Sec. II-D (output-side validity), WildToolBench + ParamBench:** "Tool-use benchmarks evaluate the calls an LLM
  emits against a task's expected answer, either under realistic multi-turn user behaviour
  [yu2026wildtoolbench] or with a focus on filling parameter values correctly across nesting and cross-parameter
  dependencies [yu2026parambench]. We instead measure values submitted *to* an application against its own
  business rules, and compare LLM producers with non-LLM producers."
- **Sec. II (semantic validation layers / C4), patent:** "Classifying a field entry as valid or invalid from a
  context embedding combined with statistics of recently entered values has been described in a patent
  [banerjee2025contextembedding]. We evaluate an embedding-based validator empirically, alongside rule-based,
  small-LM and LLM-judge layers, on AI-generated web inputs."
- **Sec. II (new short paragraph: data validation), Breck + Deequ + Sherlock:** "Data-management research
  validates data beyond structural schemas, for example with anomaly detection on data fed to ML pipelines
  [breck2019datavalidation], declarative constraint checks that act as unit tests for data
  [schelter2018deequ], and learned detection of the semantic types of columns [hulsebos2019sherlock]. These
  systems operate on datasets or columns in batch, whereas we study per-request validation of individual web
  inputs against application business rules."

  (The contrast "batch/dataset vs. per-request" matches what the abstracts describe: pipeline data, Spark
  aggregation over datasets, and column-level typing. It is a positioning statement, not a claim about limitations
  those papers report.)

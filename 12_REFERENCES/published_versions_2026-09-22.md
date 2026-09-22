# Published-version check for preprint entries — 2026-09-22

Scope: `13_DRAFT/references.bib` @misc/arXiv entries; saleem2026layered author order; OWASP
Input Validation Cheat Sheet entry. No `.bib` file or `paper.tex` was edited. All values below
come from live lookups made on 2026-09-22 (tool: `tools/crossref_lookup.py`, which queries
Crossref; ACL Anthology BibTeX export; arXiv abs pages / arXiv API; ICCK journal page; Crossref
journal API; workshop CFP page; ML Anthology). DBLP (bot challenge) and OpenReview (bot
challenge, HTTP 403) could not be reached from this session.

Brace note: the proposed entries brace acronyms/proper nouns per Stage 5. Where Crossref
prints "Sok", the arXiv and ACL/publisher-side capitalisation "SoK" is kept, as in the existing entry.

---

## 1. Priority entries

### rebedea2023nemo — PUBLISHED (EMNLP 2023 System Demonstrations) — REPLACE

Sources:
- `crossref_lookup.py --doi 10.18653/v1/2023.emnlp-demo.40` → proceedings-article; container
  "Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing:
  System Demonstrations"; authors Traian Rebedea; Razvan Dinu; Makesh Narsimhan Sreedhar;
  Christopher Parisien; Jonathan Cohen; pages 431-445; publisher ACL; year 2023.
- ACL Anthology BibTeX export https://aclanthology.org/2023.emnlp-demo.40.bib → same authors,
  editors Yansong Feng and Els Lefever, month dec, address Singapore, pages 431--445.

Differences from the current entry: the middle author's full name is **Makesh Narsimhan
Sreedhar**. The current entry has "Makesh Sreedhar".

```bibtex
@inproceedings{rebedea2023nemo,
  title     = {{NeMo} Guardrails: A Toolkit for Controllable and Safe {LLM} Applications with Programmable Rails},
  author    = {Traian Rebedea and Razvan Dinu and Makesh Narsimhan Sreedhar and Christopher Parisien and Jonathan Cohen},
  editor    = {Yansong Feng and Els Lefever},
  booktitle = {Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing: System Demonstrations},
  pages     = {431--445},
  year      = {2023},
  month     = dec,
  address   = {Singapore},
  publisher = {Association for Computational Linguistics},
  doi       = {10.18653/v1/2023.emnlp-demo.40},
  url       = {https://aclanthology.org/2023.emnlp-demo.40/},
  annote    = {Published version of arXiv:2310.10501; metadata: Crossref + ACL Anthology, 2026-09-22; P68}
}
```

### shi2024judgeattack — PUBLISHED (ACM CCS 2024) — REPLACE

Sources:
- `crossref_lookup.py --doi 10.1145/3658644.3690291` → proceedings-article; container
  "Proceedings of the 2024 on ACM SIGSAC Conference on Computer and Communications Security";
  published 2024-12-2; pages 660-674; publisher ACM; authors Jiawen Shi; Zenghui Yuan; Yinuo
  Liu; Yue Huang; Pan Zhou; Lichao Sun; Neil Zhenqiang Gong (same order as arXiv).
- `crossref_lookup.py --bibtex` → series "CCS '24".

```bibtex
@inproceedings{shi2024judgeattack,
  title     = {Optimization-based Prompt Injection Attack to {LLM}-as-a-Judge},
  author    = {Jiawen Shi and Zenghui Yuan and Yinuo Liu and Yue Huang and Pan Zhou and Lichao Sun and Neil Zhenqiang Gong},
  booktitle = {Proceedings of the 2024 on {ACM} {SIGSAC} Conference on Computer and Communications Security},
  series    = {CCS '24},
  pages     = {660--674},
  year      = {2024},
  publisher = {ACM},
  doi       = {10.1145/3658644.3690291},
  url       = {https://doi.org/10.1145/3658644.3690291},
  annote    = {Published version of arXiv:2403.17710; metadata: Crossref, 2026-09-22; P67}
}
```
(Conference location is not included because Crossref does not give one and it was not checked elsewhere.)

### kaya2026chatbotplugins — PUBLISHED (IEEE S&P 2026) — REPLACE

Sources:
- `crossref_lookup.py --title ...` → candidate 1 (score 90.9); confirmed with
  `--doi 10.1109/sp63933.2026.00062` → proceedings-article; "2026 IEEE Symposium on Security
  and Privacy (SP)"; published 2026-5-18; pages 4223-4242; IEEE; authors Yigitcan Kaya; Anton
  Landerer; Stijn Pletinckx; Michelle Zimmermann; Christopher Kruegel; Giovanni Vigna.

Differences from the current entry: the year becomes **2026**. The current entry has 2025, the arXiv posting year. The key already says 2026.

```bibtex
@inproceedings{kaya2026chatbotplugins,
  title     = {When {AI} Meets the Web: Prompt Injection Risks in Third-Party {AI} Chatbot Plugins},
  author    = {Yigitcan Kaya and Anton Landerer and Stijn Pletinckx and Michelle Zimmermann and Christopher Kruegel and Giovanni Vigna},
  booktitle = {2026 {IEEE} Symposium on Security and Privacy ({SP})},
  pages     = {4223--4242},
  year      = {2026},
  publisher = {IEEE},
  doi       = {10.1109/SP63933.2026.00062},
  url       = {https://doi.org/10.1109/SP63933.2026.00062},
  annote    = {Published version of arXiv:2511.05797; metadata: Crossref, 2026-09-22; P48}
}
```

### wang2026sokguardrails — PUBLISHED (IEEE S&P 2026) — REPLACE

Sources:
- `crossref_lookup.py --doi 10.1109/sp63933.2026.00076` → proceedings-article; "2026 IEEE
  Symposium on Security and Privacy (SP)"; published 2026-5-18; pages 39-58; IEEE; authors
  Xunguang Wang; Zhenlan Ji; Wenxuan Wang; Zongjie Li; Daoyuan Wu; Shuai Wang. Crossref title
  prints "Sok"; kept as {SoK}.

Differences from the current entry: the year becomes **2026**. The current entry has 2025.

```bibtex
@inproceedings{wang2026sokguardrails,
  title     = {{SoK}: Evaluating Jailbreak Guardrails for Large Language Models},
  author    = {Xunguang Wang and Zhenlan Ji and Wenxuan Wang and Zongjie Li and Daoyuan Wu and Shuai Wang},
  booktitle = {2026 {IEEE} Symposium on Security and Privacy ({SP})},
  pages     = {39--58},
  year      = {2026},
  publisher = {IEEE},
  doi       = {10.1109/SP63933.2026.00076},
  url       = {https://doi.org/10.1109/SP63933.2026.00076},
  annote    = {Published version of arXiv:2506.10597; metadata: Crossref, 2026-09-22; P60}
}
```

### zizzo2025guardrails — WORKSHOP PAPER, NON-ARCHIVAL, NO DOI — KEEP arXiv (optional note)

Sources:
- `crossref_lookup.py --title ...` → no matching record. The batch Crossref check also found no match.
- arXiv API (2502.15427) → comment "NeurIPS 2024, Safe Generative AI Workshop"; 10 authors,
  same order as the entry.
- Workshop CFP https://safegenaiworkshop.github.io/cfp: "Dual-submission policy
  (non-archival): Accepted papers will not be archived, ..."
- ML Anthology https://mlanthology.org/neuripsw/2024/zizzo2024neuripsw-adversarial/ lists it under
  "NeurIPS 2024 Workshops: SafeGenAi", year 2024, last author "Kush R. Varshney". ML Anthology is
  an aggregator, not a publisher record.
- OpenReview forum a44MiSFw6G is listed in search results, but the page and API were blocked by a bot
  challenge (HTTP 403). **Not directly VERIFIED.**

Verdict: there is no archival, peer-reviewed proceedings version. The arXiv @misc entry is
correct as it stands. If you want to mention the workshop, use the optional `note` below. Do
not convert it to @inproceedings, because the workshop explicitly does not archive papers.

```bibtex
@misc{zizzo2025guardrails,
  title         = {Adversarial Prompt Evaluation: Systematic Benchmarking of Guardrails Against Prompt Input Attacks on {LLMs}},
  author        = {Giulio Zizzo and Giandomenico Cornacchia and Kieran Fraser and Muhammad Zaid Hameed and Ambrish Rawat and Beat Buesser and Mark Purcell and Pin-Yu Chen and Prasanna Sattigeri and Kush Varshney},
  year          = {2025},
  eprint        = {2502.15427},
  archiveprefix = {arXiv},
  howpublished  = {arXiv preprint arXiv:2502.15427},
  note          = {Presented at the NeurIPS 2024 Safe Generative AI Workshop (non-archival)},
  url           = {https://arxiv.org/abs/2502.15427},
  annote        = {Preprint; workshop non-archival per CFP (checked 2026-09-22); Verification: V2; P58}
}
```

---

## 2. saleem2026layered — AUTHOR ORDER CONFLICT; VENUE EXISTS, BUT THE PAPER IS NOT PUBLISHED THERE

Sources:
- arXiv abs page metadata (`citation_author` meta tags), https://arxiv.org/abs/2606.19660,
  2606.19660v1 and 2606.19660v2, fetched 2026-09-22:
  - v1 (17 Jun 2026): Saleem, Gulshan; Ahmed, Nisar; Zaman, Muhammad Imran; Hassan, Ali (4 authors).
  - v2 (26 Aug 2026, current): Saleem, Gulshan; Ahmed, Nisar; Zaman, Muhammad Imran; Hassan, Ali;
    Mujahid, Umar (5 authors).
  - Submitter: Nisar Ahmed. arXiv comment: "Submitted in ICCK Transactions on Information Security
    and Cryptography".
  - arXiv API returns the same order (Saleem first).
- Local PDF `11_PAPERS/pdfs/2026_Saleem_LayeredFramework.pdf` (arXiv v2), page 1 (pdftotext):
  "N. Ahmed 1,2,*, G. Saleem 3,*, M.I. Zaman 2,*, A. Hassan 2,* and Umar Mujahid 4,*".
  This means the PDF byline puts **Ahmed first**, while the arXiv metadata puts **Saleem first**.
- `crossref_lookup.py --arxiv 2606.19660` → LOOKUP FAILED (HTTP 406) because of a tool/endpoint issue. The arXiv
  page above is used instead.
- `crossref_lookup.py --title "A Layered Security Framework Against Prompt Injection in RAG-Based Chatbots"`
  → no match. A Crossref author+title query found no match either.
- The Crossref journal record for ISSN 3070-2429 (https://api.crossref.org/journals/3070-2429) shows
  publisher "Institute of Central Computation and Knowledge Inc" and 18 DOIs (2025: 7, 2026: 11).
  All 18 DOI titles were listed, and none is this paper. The PDF's DOI "10.62762/ICCK.2026.000000" is a
  template placeholder, and its submission and publication dates are unfilled.
- Journal page https://www.icck.org/tisc lists ISSN 3070-2429, Vol. 1 and Vol. 2 (2026). The paper
  does not appear there.

Findings:
- **Authoritative author list: NOT VERIFIED — HUMAN REVIEW REQUIRED.** The two authoritative
  artefacts disagree. The arXiv metadata, entered by the submitter, gives Saleem, Ahmed, Zaman,
  Hassan, Mujahid. The typeset PDF byline gives Ahmed, Saleem, Zaman, Hassan, Mujahid. There is no
  publisher record to settle it. Convention: the byline on the document is normally treated as the
  authors' own order, and the arXiv metadata can be mis-entered. So the PDF order is the better-supported
  choice, but it is still not confirmed. Recommended action (`TODO-HUMAN`): cite the arXiv version, and either (a) keep
  arXiv metadata order (what bibliographic databases will show) and note the discrepancy, or (b)
  use the PDF byline order and re-key to `ahmed2026layered`. Changing the key requires updating paper.tex.
- **Venue:** the journal *exists* (it has a Crossref-registered ISSN, 18 DOIs, and a live website), but
  the paper is **not published** there as of 2026-09-22. The arXiv comment says only "Submitted in". It must be cited as an
  arXiv preprint. Nothing should imply acceptance at ICCK. The venue's legitimacy and quality remain
  `NOT VERIFIED — HUMAN REVIEW REQUIRED`: it is a new publisher (Vol. 1 in 2025), it is not in JCR according to a third-party index
  (minicod.com, which is not authoritative), and the peer-review practices were not assessed.
- Observation: the same journal published "A Resource-Efficient Machine Learning Pipeline for DDoS
  Attack Detection..." (10.62762/tisc.2025.438083) by authors surnamed Ahmed, Saleem, Naveed, Zaman.
  Identity was not checked. This is relevant only to a venue-independence judgement by the human.

Proposed entry, option (a), keeping arXiv metadata order and the existing key:
```bibtex
@misc{saleem2026layered,
  title         = {A Layered Security Framework Against Prompt Injection in {RAG}-Based Chatbots},
  author        = {Gulshan Saleem and Nisar Ahmed and Muhammad Imran Zaman and Ali Hassan and Umar Mujahid},
  year          = {2026},
  eprint        = {2606.19660},
  archiveprefix = {arXiv},
  howpublished  = {arXiv preprint arXiv:2606.19660v2},
  url           = {https://arxiv.org/abs/2606.19660},
  annote        = {Preprint (submitted to ICCK Trans. Inf. Secur. Cryptogr.; not published as of 2026-09-22).
                   Author order per arXiv metadata; PDF byline lists N. Ahmed first -- NOT VERIFIED -- HUMAN REVIEW REQUIRED; P64}
}
```
Option (b), using the PDF byline order (requires changing the key in paper.tex):
```bibtex
@misc{ahmed2026layered,
  title         = {A Layered Security Framework Against Prompt Injection in {RAG}-Based Chatbots},
  author        = {Nisar Ahmed and Gulshan Saleem and Muhammad Imran Zaman and Ali Hassan and Umar Mujahid},
  year          = {2026},
  eprint        = {2606.19660},
  archiveprefix = {arXiv},
  howpublished  = {arXiv preprint arXiv:2606.19660v2},
  url           = {https://arxiv.org/abs/2606.19660},
  annote        = {Preprint; author order per PDF byline (v2 p.1); arXiv metadata lists G. Saleem first; P64}
}
```

---

## 3. owasp2026inputvalidation — VERIFIED (live page, 2026-09-22)

Source: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html fetched
2026-09-22 with curl. Page title: "Input Validation - OWASP Cheat Sheet Series". Snapshot saved as
`12_REFERENCES/owasp_input_validation_2026-09-22.html` (sha256
8bc89764e21e97a0d34736b7a178d163150560a924d68edb29bd36e2aa8577a9).

Exact text, from section "Input Validation Strategies":
> "Input validation should be applied at both syntactic and semantic levels:"
> "Syntactic validation should enforce correct syntax of structured fields (e.g. SSN, date, currency symbol)."
> "Semantic validation should enforce correctness of their values in the specific business context (e.g. start date is before end date, price is within expected range)."

The paper's description is supported: the page distinguishes syntactic from semantic validation,
and "price is within expected range" is given as a *semantic* example. Caveat: the same page also
lists "Minimum and maximum value range check for numerical parameters and dates" as an
implementation technique under "Implementing Input Validation". A range check is therefore not
exclusively semantic on this page. The paper's wording should tie the range example to "business
context", as the page does. No author names or revision date are shown on the page, so the
corporate author "OWASP Cheat Sheet Series Team" is used.

```bibtex
@online{owasp2026inputvalidation,
  author       = {{OWASP Cheat Sheet Series Team}},
  title        = {Input Validation Cheat Sheet},
  organization = {OWASP Foundation},
  year         = {2026},
  url          = {https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html},
  urldate      = {2026-09-22},
  note         = {Accessed: 2026-09-22}
}
```
IEEEtran.bst does not support `@online`/`urldate`. If the paper uses IEEEtran, use this form:
```bibtex
@misc{owasp2026inputvalidation,
  author       = {{OWASP Cheat Sheet Series Team}},
  title        = {Input Validation Cheat Sheet},
  howpublished = {OWASP Cheat Sheet Series, OWASP Foundation},
  year         = {2026},
  url          = {https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html},
  note         = {Accessed: Sep. 22, 2026}
}
```
The year is the access year, because the page gives no publication or revision date.

---

## 4. Other @misc entries — batch check

Method: a Crossref `query.bibliographic` title search (5 rows) for each of the 38 @misc entries,
flagging title similarity > 0.85, followed by a `--doi` confirmation for each hit. A DBLP batch
was attempted but blocked by a bot challenge. A Semantic Scholar batch by arXiv ID was
attempted but rate-limited (HTTP 429). Targeted web searches were run for liu2023houyi,
li2024injecguard, cui2024guitextinput and ayub2024embedding.

### Published versions found (confirmed with `crossref_lookup.py --doi`)

**attouche2023jsonschema** → PACMPL (POPL 2024). `--doi 10.1145/3632891`: journal-article;
Proceedings of the ACM on Programming Languages; vol 8, issue POPL, pp. 1451-1481; published
2024-1-2; ACM; authors Lyes Attouche; Mohamed-Amine Baazizi; Dario Colazzo; Giorgio Ghelli;
Carlo Sartiani; Stefanie Scherzinger (same order).
```bibtex
@article{attouche2023jsonschema,
  title   = {Validation of Modern {JSON} Schema: Formalization and Complexity},
  author  = {Lyes Attouche and Mohamed-Amine Baazizi and Dario Colazzo and Giorgio Ghelli and Carlo Sartiani and Stefanie Scherzinger},
  journal = {Proceedings of the {ACM} on Programming Languages},
  volume  = {8},
  number  = {POPL},
  pages   = {1451--1481},
  year    = {2024},
  doi     = {10.1145/3632891},
  url     = {https://doi.org/10.1145/3632891},
  annote  = {Published version of arXiv:2307.10034; metadata: Crossref 2026-09-22; P04}
}
```
(Key year 2023 no longer matches the publication year of 2024. Re-keying is optional and would require updating paper.tex.)

**hatfielddodds2021schemathesis** → ICSE 2022 Companion, **2 pages (pp. 345-346)**. Crossref has
two records for the same item: IEEE `10.1109/icse-companion55297.2022.9793781` and ACM
`10.1145/3510454.3528637`. Both give authors Zac Hatfield-Dodds; Dmitry Dygalo and pages 345-346,
May 2022. CAUTION: the published version is a 2-page companion paper, while the arXiv version is
9 pages. If the paper cites content found only in the 9-page arXiv version, keep the arXiv entry,
or cite both. The companion record was not read, so it is unknown whether it contains the cited claims. `TODO-HUMAN` decision.
```bibtex
@inproceedings{hatfielddodds2021schemathesis,
  title     = {Deriving Semantics-Aware Fuzzers from Web {API} Schemas},
  author    = {Zac Hatfield-Dodds and Dmitry Dygalo},
  booktitle = {Proceedings of the {ACM/IEEE} 44th International Conference on Software Engineering: Companion Proceedings},
  pages     = {345--346},
  year      = {2022},
  publisher = {ACM},
  doi       = {10.1145/3510454.3528637},
  url       = {https://doi.org/10.1145/3510454.3528637},
  annote    = {2-page companion version of arXiv:2112.10328 (9 pp.); metadata: Crossref 2026-09-22; P09}
}
```

**li2025formfactory** → ACM Multimedia 2025. `--doi 10.1145/3746027.3758285`: Proceedings of the
33rd ACM International Conference on Multimedia; pp. 13273-13280; 2025-10-27; ACM; authors Bobo
Li; Yuheng Wang; Hao Fei; Juncheng Li; Wei Ji; Mong-Li Lee; Wynne Hsu (same order).
```bibtex
@inproceedings{li2025formfactory,
  title     = {{FormFactory}: An Interactive Benchmarking Suite for Multimodal Form-Filling Agents},
  author    = {Bobo Li and Yuheng Wang and Hao Fei and Juncheng Li and Wei Ji and Mong-Li Lee and Wynne Hsu},
  booktitle = {Proceedings of the 33rd {ACM} International Conference on Multimedia},
  pages     = {13273--13280},
  year      = {2025},
  publisher = {ACM},
  doi       = {10.1145/3746027.3758285},
  url       = {https://doi.org/10.1145/3746027.3758285},
  annote    = {Published version of arXiv:2506.01520; metadata: Crossref 2026-09-22; P28}
}
```

**pereira2026apitestgenie** → AST 2026. `--doi 10.1145/3793654.3793743`: Proceedings of the 7th
ACM/IEEE International Conference on Automation of Software Test; pp. 46-54; 2026-4-13; ACM;
authors André Pereira; Bruno Lima; João Pascoal Faria (same order).
```bibtex
@inproceedings{pereira2026apitestgenie,
  title     = {{APITestGenie}: Generating Web {API} Tests from Requirements and {API} Specifications with {LLMs}},
  author    = {Andr\'e Pereira and Bruno Lima and Jo\~ao Pascoal Faria},
  booktitle = {Proceedings of the 7th {ACM/IEEE} International Conference on Automation of Software Test},
  pages     = {46--54},
  year      = {2026},
  publisher = {ACM},
  doi       = {10.1145/3793654.3793743},
  url       = {https://doi.org/10.1145/3793654.3793743},
  annote    = {Published version of arXiv:2604.02039; metadata: Crossref 2026-09-22; P29}
}
```

**evtimov2025wasp** → NeurIPS 2025 (Advances in Neural Information Processing Systems 38).
`--doi 10.52202/085713-0666`: pp. 22436-22458; 2025; NeurIPS Foundation; authors Ivan Evtimov;
Arman Zharmagambetov; Aaron Grattafiori; Chuan Guo; Kamalika Chaudhuri (same order). Crossref
does not say whether this is the main track or the Datasets and Benchmarks track, so the booktitle is kept generic.
```bibtex
@inproceedings{evtimov2025wasp,
  title     = {{WASP}: Benchmarking Web Agent Security Against Prompt Injection Attacks},
  author    = {Ivan Evtimov and Arman Zharmagambetov and Aaron Grattafiori and Chuan Guo and Kamalika Chaudhuri},
  booktitle = {Advances in Neural Information Processing Systems 38},
  pages     = {22436--22458},
  year      = {2025},
  publisher = {Neural Information Processing Systems Foundation, Inc.},
  doi       = {10.52202/085713-0666},
  url       = {https://doi.org/10.52202/085713-0666},
  annote    = {Published version of arXiv:2504.18575; metadata: Crossref 2026-09-22; P51}
}
```

### Published versions found outside Crossref's title match (targeted web checks)

**ayub2024embedding** → CAMLIS 2024, CEUR Workshop Proceedings Vol-3920. Source: the CEUR-WS volume
index https://ceur-ws.org/Vol-3920/ gives "Proceedings of the Conference on Applied Machine Learning
in Information Security (CAMLIS 2024)", Arlington, Virginia, USA, October 24-25, 2024; editors
Rachel Allen, Sagar Samtani, Edward Raff, Ethan Rudd; paper "Embedding-based classifiers can detect
prompt injection attacks", pp. 257-268, Md. Ahsan Ayub, Subhabrata Majumdar; published on CEUR-WS
2025-02-09; CC BY 4.0. There is no DOI; CEUR volumes carry a URN.
```bibtex
@inproceedings{ayub2024embedding,
  title     = {Embedding-based classifiers can detect prompt injection attacks},
  author    = {Md. Ahsan Ayub and Subhabrata Majumdar},
  editor    = {Rachel Allen and Sagar Samtani and Edward Raff and Ethan Rudd},
  booktitle = {Proceedings of the Conference on Applied Machine Learning in Information Security ({CAMLIS} 2024)},
  series    = {{CEUR} Workshop Proceedings},
  volume    = {3920},
  pages     = {257--268},
  address   = {Arlington, Virginia, USA},
  year      = {2024},
  publisher = {CEUR-WS.org},
  url       = {https://ceur-ws.org/Vol-3920/paper15.pdf},
  annote    = {Published version of arXiv:2410.22284; metadata: CEUR-WS volume index 2026-09-22; P57}
}
```
(The CEUR volume was published in 2025, but the proceedings are for CAMLIS 2024. The volume page
dates its copyright 2024, so year 2024 is kept. The paper15.pdf URL came from a search result and is
consistent with the volume. It was not opened.)

**li2024injecguard** → published under a NEW TITLE with MORE AUTHORS at ACL 2025. Sources:
ACL Anthology BibTeX https://aclanthology.org/2025.acl-long.1468.bib and
`crossref_lookup.py --doi 10.18653/v1/2025.acl-long.1468` → "PIGuard: Prompt Injection Guardrail
via Mitigating Overdefense for Free"; Hao Li; Xiaogeng Liu; Ning Zhang; Chaowei Xiao; Proceedings
of the 63rd Annual Meeting of the ACL (Volume 1: Long Papers); pp. 30420-30437; July 2025; Vienna,
Austria; editors Che, Nabende, Shutova, Pilehvar. The link between the two works comes from the
authors' GitHub repository (search result: "The model name has been changed from InjecGuard to
PIGuard due to licensing issues", [ACL 2025]). That repository is not an authoritative record. The arXiv
page 2410.22770 still shows the old title and 2 authors. CAUTION: the two versions may differ in
content, and P56 was read from the arXiv version. Any claim cited from it must be re-checked
against the ACL paper before switching. Switching also changes the tool name used in the text
(InjecGuard → PIGuard). `TODO-HUMAN` decision.
```bibtex
@inproceedings{li2025piguard,
  title     = {{PIGuard}: Prompt Injection Guardrail via Mitigating Overdefense for Free},
  author    = {Hao Li and Xiaogeng Liu and Ning Zhang and Chaowei Xiao},
  editor    = {Wanxiang Che and Joyce Nabende and Ekaterina Shutova and Mohammad Taher Pilehvar},
  booktitle = {Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)},
  pages     = {30420--30437},
  year      = {2025},
  month     = jul,
  address   = {Vienna, Austria},
  publisher = {Association for Computational Linguistics},
  doi       = {10.18653/v1/2025.acl-long.1468},
  url       = {https://aclanthology.org/2025.acl-long.1468/},
  annote    = {Published (retitled) version of arXiv:2410.22770 (InjecGuard); metadata: ACL Anthology + Crossref 2026-09-22; P56 -- re-verify claims before swapping}
}
```
(A new key is suggested because the first author is unchanged but the year and title changed. Keeping the key `li2024injecguard` is also acceptable if paper.tex should not change.)

Targeted web searches for liu2023houyi and cui2024guitextinput found only arXiv, DBLP CoRR and
Semantic Scholar pages. No published version was found.

### False positive (ignore)
- liu2025wainjectbench: the closest Crossref hit (similarity 0.87) is a different paper by other
  authors, 10.64751/ijdim.2026.v5.n2.pp131-137. It is not a published version of this entry. Keep as is.

### No published version found (keep as is)
armillotta2026antaeus, tigulla2026robustness, cui2024guitextinput, lu2025semanticfuzzing,
li2026orderbench, ray2026constrainttax, singh2026sob, sigdel2026schemafirst, wrenn2026enterprise
(arXiv comment says "Accepted at the 14th IEEE International Conference on Cloud...", but no
Crossref record yet), song2026structuredoutput, zhao2026constraintaware,
singh2026injectioninteraction, sigloch2026neurosymbolic (arXiv comment: extended version of an
accepted KI 2026 technical communication. No Crossref record found. If one appears, it would be a
shorter, different item), liu2023houyi, tsigkopoulos2026webexploitation, khodayari2026ipiwild,
kumar2025nofreelunch, ahmed2026reflexguard, le2026llmjudge,
maiorano2026tradeoffs, datta2025javelinguard, lakara2026fence, shi2025promptarmor,
akinrele2026regime.
Limitation: venues without Crossref DOIs (ICLR, some USENIX, some ACL-hosted or retitled versions) would not
appear in this search. Neither could retitled versions, as the li2024injecguard case shows. DBLP (bot
challenge) and the Semantic Scholar API (HTTP 429 rate limit) could not be queried in batch. Those
entries were therefore checked only against Crossref, plus targeted web searches for four of them. A human pass with DBLP or
Google Scholar before submission is recommended (`TODO-HUMAN`).

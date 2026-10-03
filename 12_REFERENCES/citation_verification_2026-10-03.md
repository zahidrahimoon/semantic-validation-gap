# Citation Integrity Verification — 2026-10-03

Scope: the **48 distinct cite keys actually used in `13_DRAFT/paper.tex`** (the 77-entry
`13_DRAFT/references.bib` contains 29 further entries that the paper does not cite; those were
not audited). Every row below was checked against a **live authoritative source on 2026-10-03**.

Method:
- `python3 tools/crossref_lookup.py --doi <DOI>` for all 27 DOI-bearing entries (Crossref REST).
- `python3 tools/crossref_lookup.py --arxiv <id>` (arXiv API) for all 16 arXiv entries.
- Crossref title search for each preprint to detect a later published version.
- Crossref `update-to` / `updated-by` fields checked on all 27 DOIs for retraction / expression of
  concern. **None found.**
- Publisher / primary pages for the 6 entries with no DOI (CEUR-WS, Google Patents, MLSys
  proceedings, USENIX, OWASP, OpenReview/ICLR).
- Full text (PDF) read for the five 2026 preprints central to the argument.

**Headline: no fabricated citation was found.** All 48 works exist, with titles and author lists
matching the authoritative record. Eight entries need a field change; the most consequential is a
wrong year on `jacob2025promptshield` and a wrong author order on `breck2019datavalidation`.

Verdict key: `OK` = matches authoritative record · `FIX` = concrete field change needed ·
`FLAG` = human decision needed, not an error · `NOT VERIFIED` = could not confirm.

---

## 1. Summary of entries needing a change

| # | Key | Verdict | What is wrong |
|---|---|---|---|
| 1 | `jacob2025promptshield` | **FIX** | `year = {2024}` — CODASPY '25 was June 2025 |
| 2 | `breck2019datavalidation` | **FIX** | Author order contradicts the MLSys proceedings record; `pages` unconfirmed |
| 3 | `hatfielddodds2021schemathesis` | **FLAG** | A peer-reviewed version now exists (ICSE '22 Companion, 2 pp.) |
| 4 | `wrenn2026enterprise` | **FLAG** | Accepted at IEEE IC2E 2026 (Industry Track); published version forthcoming |
| 5 | `saleem2026layered` | **NOT VERIFIED** (author order) | arXiv metadata and PDF byline disagree; pre-existing flag confirmed |
| 6 | `owasp2026inputvalidation` | **FIX** | `note = {Accessed: Sep; 22, 2026}` — stray semicolon |
| 7 | 8 entries | **FIX** (hygiene) | Duplicate `annote =` field in the same entry |
| 8 | `attouche2023jsonschema` | **FIX** (cosmetic) | Cite key says 2023; the work is POPL 2024 |

### Corrected BibTeX field values

**1. `jacob2025promptshield`** — authoritative: `codaspy.org/2025/toc.html` (CODASPY '25 table of
contents lists the paper with the same five authors) + CODASPY 2025 held **4–6 June 2025,
Pittsburgh, PA**. Crossref's deposited date for this DOI (`2024-06-19`) is itself wrong; the
container, series and conference edition all say 2025. The reviewer's observation was correct.

```bibtex
  year={2025},
  month=jun,
```
(everything else — title, 5 authors in order, DOI `10.1145/3714393.3726501`, pages 341–352,
booktitle, series `CODASPY '25` — is confirmed correct.)

**2. `breck2019datavalidation`** — authoritative: MLSys 2019 proceedings page
`https://proceedings.mlsys.org/paper_files/paper/2019/hash/928f1160e52192e3e0017fb63ab65391-Abstract.html`
(fetched twice, incl. the 2019 volume index). Proceedings byline order is **Polyzotis first**; the
bib currently lists Breck first. The existing `TODO-HUMAN` annote flagged this; the authoritative
record now settles it (protocol A4/Stage 3: publisher record is the authority).

```bibtex
  author = {Polyzotis, Neoklis and Zinkevich, Martin and Roy, Sudip and Breck, Eric and Whang, Steven Euijong},
```
Consequence: the cite key `breck2019datavalidation` becomes misleading; the protocol key would be
`polyzotis2019datavalidation`. Also: **MLSys does not publish page numbers for this volume** — the
`pages = {334--347}` could not be confirmed at any authoritative source. Recommend deleting the
`pages` field or confirming it against a library copy.

**3. `hatfielddodds2021schemathesis`** — FLAG, not an error. Crossref title search returns a
peer-reviewed version:

```
Deriving semantics-aware fuzzers from web API schemas
Zac Hatfield-Dodds; Dmitry Dygalo
Proc. ACM/IEEE 44th ICSE: Companion Proceedings, 2022-05-21, pp. 345-346
DOI 10.1145/3510454.3528637  (IEEE mirror: 10.1109/icse-companion55297.2022.9793781)
```
**Caution before switching:** the published version is a **2-page tool-demo companion paper**,
whereas the cited arXiv v1 is the full 9-page paper. If the paper cites substantive content, the
preprint is the correct source and the companion paper should be added as a `note`. Human decision.

**4. `wrenn2026enterprise`** — FLAG. arXiv comments field reads *"Accepted at the 14th IEEE
International Conference on Cloud Engineering (IC2E 2026), Industry Track."* No DOI yet (arXiv
`journal_ref` empty, no Crossref record found on 2026-10-03). Either leave as preprint or add
`note = {Accepted at IEEE IC2E 2026, Industry Track}`.

**5. `saleem2026layered`** — NOT VERIFIED (author order only). arXiv API (v2, 2026-08-26) returns
`Gulshan Saleem; Nisar Ahmed; Muhammad Imran Zaman; Ali Hassan; Umar Mujahid`, which matches the
bib. The project's own note records that the PDF byline puts N. Ahmed first. The existing
`NOT VERIFIED — HUMAN REVIEW REQUIRED` annote is correct and should stay. The ICCK venue in the
arXiv comment is still unverified (submitted, not accepted) — do not add it as a venue.

**6. `owasp2026inputvalidation`**
```bibtex
  note = {Accessed: Sep. 22, 2026},
```
(Page confirmed live at `cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html`,
title "Input Validation — OWASP Cheat Sheet Series". The page carries no version or last-updated
date, so `year = {2026}` is only supportable via the access date — keep the access date.)

**7. Duplicate `annote` field** (BibTeX takes one and warns; `annote` is not printed by IEEEtran,
so this is hygiene only). Affected: `attouche2023jsonschema`, `ayub2024embedding`,
`evtimov2025wasp`, `kaya2026chatbotplugins`, `li2025formfactory`, `rebedea2023nemo`,
`shi2024judgeattack`, `wang2026sokguardrails`. Merge each pair into one `annote`.

**8. `attouche2023jsonschema`** — the entry's `year = {2024}` is correct (PACMPL 8(POPL),
published 2024-01-02); only the *key* says 2023. Cosmetic; renaming would touch paper.tex.

---

## 2. Full table — one row per cited key

### 2a. DOI-bearing entries (Crossref, 2026-10-03; all DOIs resolve to the cited paper; no
retraction or expression-of-concern notices)

| Key | Verdict | Authoritative source | Notes |
|---|---|---|---|
| `alian2024formnexus` | OK | Crossref `10.1145/3650212.3680332` | ISSTA '24, 2024-09-11, pp. 932–944; 4 authors in order ✓ |
| `attouche2023jsonschema` | FIX (cosmetic) | Crossref `10.1145/3632891` | PACMPL 8(POPL) 1451–1481, 2024 ✓; key year misleading; duplicate `annote` |
| `baazizi2021usagenot` | OK | Crossref `10.1007/978-3-030-89022-3_9` | 2021, pp. 102–112; 5 authors ✓ |
| `bisht2010notamper` | OK | Crossref `10.1145/1866307.1866375` | CCS '10, 2010-10, pp. 607–618; 5 authors ✓. Crossref truncates the title to "NoTamper"; the full subtitle in the bib matches the ACM DL record |
| `calo2026semanticgap` | OK | Crossref `10.1145/3772363.3799364` | CHI EA '26, 2026-04-13, pp. 1–5; 3 authors ✓ |
| `corradini2023massassignment` | OK | Crossref `10.1109/icse48619.2023.00213` | ICSE 2023, pp. 2553–2564; 3 authors ✓ |
| `evtimov2025wasp` | OK | Crossref `10.52202/085713-0666` | NeurIPS 38 (2025), pp. 22436–22458; 5 authors ✓; duplicate `annote` |
| `fadlalla2023inputvalidation` | OK | Crossref `10.1109/access.2023.3266385` | IEEE Access 11, 40128–40161, 2023 ✓ |
| `greshake2023indirect` | OK | Crossref `10.1145/3605764.3623985` | AISec '23 @ CCS, 2023-11, pp. 79–90; 6 authors ✓ |
| `hulsebos2019sherlock` | OK | Crossref `10.1145/3292500.3330993` | KDD '19, pp. 1500–1508; 8 authors ✓. Crossref truncates the title to "Sherlock"; full title matches ACM DL |
| `jacob2025promptshield` | **FIX: year 2024 → 2025** | Crossref `10.1145/3714393.3726501` + codaspy.org/2025 ToC | See §1.1. Title, 5 authors, pages 341–352 ✓ |
| `kaya2026chatbotplugins` | OK | Crossref `10.1109/SP63933.2026.00062` | IEEE S&P 2026, pp. 4223–4242; 6 authors ✓; duplicate `annote` |
| `kim2025llamaresttest` | OK | Crossref `10.1145/3715737` | PACMSE 2(FSE) 465–488, 2025-06 ✓ |
| `li2025formfactory` | OK | Crossref `10.1145/3746027.3758285` | ACM MM 2025, pp. 13273–13280; 7 authors ✓; duplicate `annote` |
| `li2026webformtest` | OK | Crossref `10.1145/3735553` | TOSEM 35(3) 1–37, 2026-02 ✓ |
| `martinlopez2019catalogue` | OK | Crossref `10.1007/978-3-030-33702-5_31` | ICSOC 2019, pp. 399–414; 3 authors ✓ |
| `martinlopez2022idl` | OK | Crossref `10.1109/tsc.2021.3050610` | IEEE TSC 15(4) 2342–2355, 2022-07; 4 authors ✓ |
| `metin2025blv` | OK | Crossref `10.3390/info16070585` | Information 16(7):585, 2025-07; 4 authors ✓. MDPI venue — already noted in the project's venue scrutiny |
| `pan2024edefuzz` | OK | Crossref `10.1145/3597503.3608133` | ICSE '24, Crossref pub. date 2024-02-06, pp. 1–12; 4 authors ✓ |
| `pedro2025p2sql` | OK | Crossref `10.1109/icse55347.2025.00007` | ICSE 2025, pp. 1768–1780; 5 authors ✓ |
| `pellegrino2014logicflaws` | OK | Crossref `10.14722/ndss.2014.23021` | NDSS 2014; 2 authors ✓ (no pages in record — bib correctly omits them) |
| `pezoa2016foundations` | OK | Crossref `10.1145/2872427.2883029` | WWW '16, pp. 263–273; 5 authors ✓ |
| `rebedea2023nemo` | OK | Crossref `10.18653/v1/2023.emnlp-demo.40` | EMNLP 2023 Demos, pp. 431–445; 5 authors ✓; duplicate `annote` |
| `schelter2018deequ` | OK | Crossref `10.14778/3229863.3229867` | PVLDB 11(12) 1781–1794, 2018 ✓ |
| `shi2024judgeattack` | OK | Crossref `10.1145/3658644.3690291` | CCS '24, pp. 660–674; 7 authors ✓; duplicate `annote` |
| `wang2026sokguardrails` | OK | Crossref `10.1109/SP63933.2026.00076` | IEEE S&P 2026, pp. 39–58; 6 authors ✓; duplicate `annote` |
| `yi2025bipia` | OK | Crossref `10.1145/3690624.3709179` | KDD '25 V.1, pp. 1809–1820; 7 authors ✓ |

### 2b. arXiv preprints (arXiv API, 2026-10-03; title + author order confirmed for all)

| Key | arXiv | Verdict | Published version? |
|---|---|---|---|
| `ahmed2026reflexguard` | 2608.17556v2 | OK | None (no `journal_ref`/DOI; Crossref title search: no match) |
| `datta2025javelinguard` | 2506.07330v1 | OK | None found |
| `hatfielddodds2021schemathesis` | 2112.10328v1 | **FLAG** | **Yes** — ICSE '22 Companion, pp. 345–346, DOI `10.1145/3510454.3528637` (2-page version; see §1.3) |
| `khodayari2026ipiwild` | 2604.27202v1 | OK | None found |
| `li2024injecguard` | 2410.22770v3 | OK | None found |
| `li2026orderbench` | 2607.18261v1 | OK | None found. Note: arXiv ID month (2607) vs v1 date (2026-05-16) differ — consistent with a moderation hold, not an error |
| `maiorano2026tradeoffs` | 2605.06669v2 | OK | None found. Same ID/date offset (ID 2605, v1 2026-03-29) |
| `ray2026constrainttax` | 2605.26128v1 | OK | None found |
| `saleem2026layered` | 2606.19660v2 | **NOT VERIFIED** (author order) | None. See §1.5 |
| `sigdel2026schemafirst` | 2603.13404v1 | OK | None found |
| `singh2026injectioninteraction` | 2609.03999v1 | OK | None found |
| `singh2026sob` | 2604.25359v1 | OK | None found (arXiv comment: "submitted to NeurIPS 2026" — submitted, not accepted; do not cite a venue) |
| `tigulla2026robustness` | 2605.14202v1 | OK | None found |
| `wrenn2026enterprise` | 2608.03311v1 | **FLAG** | Accepted at IEEE IC2E 2026 Industry Track; no DOI yet. See §1.4 |
| `yu2026parambench` | 2608.03071v1 | OK | None found. 16 authors confirmed in order |

### 2c. Entries with no DOI (primary-source verification)

| Key | Verdict | Authoritative source | Notes |
|---|---|---|---|
| `ayub2024embedding` | OK | `ceur-ws.org/Vol-3920/` volume index | CAMLIS 2024, Arlington VA, 24–25 Oct 2024; paper 15, **pp. 257–268**; editors Allen, Samtani, Raff, Rudd — all match the bib exactly. Duplicate `annote` |
| `banerjee2025contextembedding` | OK | Google Patents `US12288159B2` | Title, inventors (Arkadeep Banerjee; Vignesh T. Subrahmaniam), assignee Intuit Inc., granted 2025-04-29 — all match. Correctly labelled "patent, not peer-reviewed" |
| `breck2019datavalidation` | **FIX** | `proceedings.mlsys.org` 2019 volume + paper page | Author order wrong; `pages` unconfirmed. See §1.2 |
| `felmetsger2010waler` | OK | PDF at `usenix.org/legacy/event/sec10/tech/full_papers/Felmetsger.pdf` (fetched and text-extracted) | Title and 4-author byline (Felmetsger, Cavedon, Kruegel, Vigna, UCSB) confirmed from the paper's first page. USENIX Security 2010 ✓ |
| `owasp2026inputvalidation` | **FIX** (note formatting) | `cheatsheetseries.owasp.org/.../Input_Validation_Cheat_Sheet.html` (live, plus local snapshot `12_REFERENCES/owasp_input_validation_2026-09-22.html`) | Page live and title correct; no version/date published on the page, so the access date carries the year |
| `yu2026wildtoolbench` | OK | arXiv 2604.06185 (comments: "accepted by ICLR 2026") + `iclr.cc/virtual/2026/poster/10006500` | ICLR 2026 acceptance confirmed independently; 7 authors in order ✓. OpenReview blocked a direct fetch (bot challenge), so the ICLR virtual site was used instead |

---

## 3. Claim check — the five 2026 preprints central to the argument

Each citing sentence in `paper.tex` was read and checked against the source. **Full text (PDF) was
read for all five**, not just the abstract.

| Key | Citing sentence (paper.tex) | Source evidence | Strength | Verdict |
|---|---|---|---|---|
| `li2026orderbench` | L83: "Schema-constrained ordering agents reach full schema validity while semantic success falls as low as a few per cent" | PDF: "Gemma-2-2B is the most severe counterexample: JSON-schema mode produces 100% schema-valid objects, yet semantic success is 2.0%". Also Qwen3-30B-A3B: 100% schema validity, 31.3%/30.7% semantic success | DIRECT | **Supported.** (Note: the *abstract* alone says only "semantic success remains near 80%" for the strongest model; the "few per cent" figure is in the results, §Table 1. Anyone spot-checking the abstract will think this is an overclaim — worth an explicit page/table pointer in the ledger.) |
| `li2026orderbench` | L174: "OrderBench separates syntactic validity, schema validity and semantic success" | Abstract: "separates syntactic validity, schema validity, status decisions, exact item semantics, constraint preservation, and unsafe acceptances" | DIRECT | Supported |
| `ray2026constrainttax` | L84/L175: "hard schema decoding raised validity while executable accuracy fell" | Abstract: "hard answer-only schema decoding raises schema validity from 61.5% to 100.0%, but lowers answer accuracy from 19.7% to 11.0%"; calendar tool-call task: executable accuracy 91.5% → 48.0% under hard schema, both modes 100% schema-valid | DIRECT | Supported |
| `singh2026sob` | L85: "across 21 models, schema compliance exceeds value accuracy by 15 to 25 percentage points" | PDF: "Across the leaderboard, the gap is consistently 15–25 percentage points: every model produces nearly perfect JSON…"; 21 models confirmed in the abstract | DIRECT | **Supported.** (The abstract's headline figures — 83.0% text / 67.2% image / 23.7% audio — imply much larger gaps on image and audio; the 15–25 pp range is the *text leaderboard*. Consider scoping the sentence to text, or a spot-check will read as an understatement.) |
| `singh2026sob` | L644: "scale does not predict semantic quality" | PDF: "scaling compute alone has not closed the value-accuracy gap, and that structured-output capability is [orthogonal]" | INDIRECT | Supported at INDIRECT strength; current wording ("the evidence that scale does not predict…") is slightly firmer than the source. Prefer "suggests". |
| `sigdel2026schemafirst` | L86: "schema-first tool interfaces increase schema-valid semantic misuse" | PDF results: "semantic misuse is higher in B/C (A = 0.93, B = 3.03, C = 3.03)" where A = prose docs, B/C = JSON Schema conditions | DIRECT (with caveat) | **Supported by the results section, but the abstract says only "schema conditions reduce interface misuse but not semantic misuse."** Also: this is a **pilot with one open local model, three seeds, and zero end-task success across all conditions**. The sentence should carry that scope (e.g. "in a single-model pilot"), otherwise R1/R2 will mark it an overclaim. |
| `sigdel2026schemafirst` | L177: "schemas shift failures from interface misuse to semantic misuse" | Same evidence | DIRECT | Supported; better calibrated than L86 |
| `wrenn2026enterprise` | L87: "in one enterprise platform the most structurally successful model had among the lowest semantic satisfaction" | PDF §VI: "gpt-oss-120b … majority-vote satisfaction rate dropped to 6.9%—the lowest result of any cell in the study—despite gpt-oss-120b achieving the highest structural success rate (97.8%) of any model" | DIRECT | **Supported.** Arguably understated — it was *the* lowest, not "among the lowest" |
| `wrenn2026enterprise` | L178: "workflows pass validation and then fail to execute" | PDF: gpt-oss-120b produced "stub" workflows — "These stubs pass structural validation but are non-executable" | DIRECT | Supported |
| `wrenn2026enterprise` | L644: "scale does not predict semantic quality" | PDF: smaller mistral-small reaches 95.7% structural success; largest gpt-oss-120b has the worst semantic result | INDIRECT | Supported at INDIRECT strength |

No claim in this set was found to be unsupported or attributed to the wrong paper.

---

## 4. Other observations (no action required, recorded for the audit trail)

- **29 bib entries are never cited** by `paper.tex` (e.g. `liu2023houyi`, `deng2023titanfuzz`,
  `zizzo2025guardrails`). Harmless for the build, but R2 may ask why screened work was dropped —
  that belongs in `02_SEARCH_STRATEGY.md`, not here.
- `13_DRAFT/references.bib` and `12_REFERENCES/references_verified.bib` hold the **same key set**;
  they differ only in formatting. `paper.tex` builds against `\bibliography{references}` in
  `13_DRAFT/`, so any fix must be applied there (and mirrored to `12_REFERENCES/`).
- **No retraction or expression-of-concern notice** was found for any of the 27 DOIs.
- `metin2025blv` is an MDPI journal article; venue scrutiny was already applied in the project.
  `banerjee2025contextembedding` is a patent and is correctly labelled as not peer-reviewed.
- Three arXiv entries have an ID month later than their v1 date (`li2026orderbench`,
  `maiorano2026tradeoffs`, `yu2026wildtoolbench`). This is normal for papers held in arXiv
  moderation and is not a metadata error.
- Per the task brief, **`references.bib` and `paper.tex` were not modified.**

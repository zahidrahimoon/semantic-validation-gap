# CITATION AUDIT — Semantic Validation Gaps in AI-Driven Web Applications

Version: v0.9 · Date: 2026-09-20 · Scope: **bibliography level complete**; claim level partial
(claims that depend on experimental results do not exist yet, so they cannot be audited).

Audit script: `12_REFERENCES/normalize_bib.py` (idempotent; never alters bibliographic values) plus a
`bibtexparser` check. Both `.bib` files: **70 entries, 0 parse failures.**

## 1. Bibliography-level findings and fixes

| # | Finding | Count | Action taken | Status |
|---|---|---|---|---|
| A1 | The `crossref_lookup.py` advisory comment was being emitted *inside* entry bodies, corrupting them | 30 | comment stripped by the normaliser | FIXED |
| A2 | `note` field carrying the verification level had been appended **after** the entry's closing brace, so 30 entries silently lost their provenance | 30 | notes moved inside the entry; every entry now records its level | FIXED |
| A3 | Publisher BibTeX uses capitalised field names (`DOI=`, `Title=`) which `ieeetran.bst` does not read | 32 | all field names lowercased | FIXED |
| A4 | Acronyms unprotected in titles, so the bibliography style lowercased them — the compiled PDF printed "rest api testing" and "Sok:" | 32 | acronyms braced (`{REST} {API}`, `{SoK}`, `{LLM}`, `{JSON}`, …); verified in the PDF text layer | FIXED |
| A5 | En-dash page ranges (`37–41`) and a stray Unicode prime in `series` fields | 34 | converted to `--` and ASCII | FIXED |
| A6 | Entries arrived as a single 600-character line, unreadable for review | 32 | reflowed to one field per line | FIXED |
| A7 | Non-preprint entries without a DOI | 2 | `felmetsger2010waler`, `liu2024formalizing` — both USENIX Security papers that genuinely have no DOI; publisher URL recorded instead | ACCEPTED |
| A8 | Duplicate keys / duplicate titles (preprint + published pair) | 0 | two known pairs were already collapsed to the published version (`pedro2025p2sql` → ICSE 2025, `alian2024formnexus` → ISSTA 2024) | CLEAN |
| A9 | Key convention `firstauthorlastnameYEARkeyword` | 70/70 | conforms | CLEAN |
| A10 | Verification level recorded per entry | 70/70 | conforms | CLEAN |

Post-fix compile: `latexmk` exit 0, 9 pages, **0 undefined citations**, 65 entries cited.

## 2. Verification level distribution (as cited)

| Level | Meaning | Count |
|---|---|---|
| V4 | full text read, claims located by section/page | 15 |
| V3 | abstract + key sections read | 5 |
| V2 | metadata confirmed at an authoritative source; abstract-level claims only | 50 |

Every paper cited for a specific method detail, number or stated limitation is V3 or V4. V2 papers
are cited only for existence, topic or an abstract-level statement, and the manuscript marks such
statements *(abstract)* in the literature review.

## 3. DOI resolution

All 68 DOIs were obtained from Crossref itself (`tools/crossref_lookup.py`), so each resolves by
construction and the title, author list, venue and year in the entry are the publisher's own record
rather than transcription. Two entries have no DOI (A7).

## 4. Outstanding items requiring human judgement

| ID | Item | Why it matters |
|---|---|---|
| TH-06 | `saleem2026layered`: the PDF byline's first author is N. Ahmed, not Saleem, and the journal's legitimacy could not be verified | cite key and venue may be wrong; the paper's latency numbers are used as a methodological template |
| TH-07 | `ahmed2026reflexguard`: placeholder arXiv IDs in its own reference list, an unfilled IEEE template header, and two internally inconsistent latency tables | its numbers should not be quoted without qualification |
| TH-08 | Two adjacent leads found by the novelty kill search are unscreened: ShopGym (arXiv 2605.16116) and USPTO 12288159 | could affect the novelty claim |
| TH-01/02 | `martinlopez2022idl` and `hanna2018semanticvalidation` are paywalled and unread (V2) | both are cited for the expressive limits of schemas; currently cited at abstract level only |

## 5. Claim-level audit (partial)

`CLAIMS_LEDGER.csv` holds 26 claims. 18 are background or method claims and each was checked against
the cited source's note, with the evidence location recorded. 7 are result claims marked
`OURS-PENDING`; they cannot be audited until the experiments finish. 1 is a limitation claim about the
provenance of the human-written input conditions.

No claim in the ledger has strength `NONE`. Two claims derived from smoke tests are explicitly marked
as calibration observations rather than findings, and the manuscript states them that way.

**Re-run required** after the experiments complete: audit the 7 result claims against
`16_RESULTS/analysis/` outputs and confirm every number in the paper traces to a file in
`16_RESULTS/raw/`.


## 2026-09-22 — audit after review cycle 1 (I-R4-001, I-R4-013/014/015, I-R2-006/012)

- Paper copy `13_DRAFT/references.bib` is now cleaned by `12_REFERENCES/make_paper_bib.py`: internal notes moved to `annote` (not printed); three DOI-derived pseudo-arXiv ids removed (arXiv:2014.23021, 2023.00213, 2025.00250); product names braced; `Cristov{\~a}o`; month names fixed.
- Published versions substituted after Crossref/publisher verification (`published_versions_2026-09-22.md`): rebedea2023nemo (also author name corrected: Makesh Narsimhan Sreedhar), shi2024judgeattack, kaya2026chatbotplugins (year 2026), wang2026sokguardrails (year 2026), attouche2023jsonschema, li2025formfactory, evtimov2025wasp, ayub2024embedding, pereira2026apitestgenie.
- Kept as preprints: zizzo2025guardrails (non-archival workshop), hatfielddodds2021schemathesis (long version cited), li2024injecguard (claims come from the arXiv version; ACL 2025 'PIGuard' version differs).
- NOT VERIFIED — HUMAN REVIEW REQUIRED: saleem2026layered author order (arXiv metadata: Saleem first; PDF byline: N. Ahmed first); ICCK venue legitimacy.
- Added (review_gap_search_2026-09-22.md): yu2026wildtoolbench (V3), yu2026parambench (V2), banerjee2025contextembedding (patent, V2), breck2019datavalidation (V3; author order TODO-HUMAN), schelter2018deequ (V2), hulsebos2019sherlock (V2), owasp2026inputvalidation (live page, archived copy).
- FormNexus figures corrected to 83 / 23 / 3 % (P21 note, Fig. 7 p.10).
- Result: 0 undefined citations, 0 BibTeX warnings.

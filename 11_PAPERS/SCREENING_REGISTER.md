# SCREENING REGISTER — Stage 3 (2026-09-20)

Source: four logged search families (11_PAPERS/search_reports/) → 131 candidate rows → de-duplicated
→ screened on title/abstract against IC1–IC5 (02_SEARCH_STRATEGY.md). Metadata verified via arXiv API
(`arxiv_verify_all.md`, 83 IDs, 0 failures) and Crossref (`crossref_verify_batch1.md`, 25 DOIs + 4 title
searches). **V2 = metadata confirmed only; nothing below has been read unless a note exists in `notes/`.**

Tiers: A = central to gap/novelty/baselines (must reach V4) · B = relevant · C = supporting/background ·
D = weak (excluded from paper unless needed) · REJECT. Recency: PRI = 2023–2026, SEC = 2020–2022, FND = foundational.

| Paper_ID | Cite key | First author, year | Venue (verified) | ID | Theme | Tier | Rec | Level | Read plan |
|---|---|---|---|---|---|---|---|---|---|
| P01 | fadlalla2023inputvalidation | Fadlalla 2023 | IEEE Access 11 | 10.1109/access.2023.3266385 | A structural validation | B | PRI | V2 | abstract |
| P02 | martinlopez2022idl | Martin-Lopez 2022 | IEEE TSC 15(4) | 10.1109/tsc.2021.3050610 | A | A | SEC | V2 | V4 — PDF needed (paywalled; check author OA copy) |
| P03 | martinlopez2019catalogue | Martin-Lopez 2019 | ICSOC 2019 LNCS | 10.1007/978-3-030-33702-5_31 | A | B | FND(2019) | V2 | abstract |
| P04 | attouche2023jsonschema | Attouche 2023 | arXiv | 2307.10034 | A | C | PRI | V2 | abstract |
| P05 | baazizi2021usagenot | Baazizi 2021 | ER 2021 LNCS | 10.1007/978-3-030-89022-3_9 | A | C | SEC | V2 | abstract |
| P06 | pezoa2016foundations | Pezoa 2016 | WWW 2016 | 10.1145/2872427.2883029 | A | C | FND | V2 | abstract |
| P07 | corradini2023massassignment | Corradini 2023 | ICSE 2023 | 10.1109/icse48619.2023.00213 | A/B | B | PRI | V2 | V3 |
| P08 | hanna2018semanticvalidation | Hanna 2018 | IJWET 13(3) Inderscience | 10.1504/ijwet.2018.095186 | A | B | FND(2018) | V2 | V3 — PDF needed (paywalled) |
| P09 | hatfielddodds2021schemathesis | Hatfield-Dodds 2021 | arXiv | 2112.10328 | A | C | SEC | V2 | abstract |
| P10 | barakat2023idlgen | Barakat 2023 | ICSOC 2023 LNCS | 10.1007/978-3-031-48421-6_11 | A | C | PRI | V2 | abstract |
| P11 | felmetsger2010waler | Felmetsger 2010 | USENIX Security 2010 (usenix.org) | usenix.org PDF | B logic flaws | A | FND | V4 (note) | DONE: V4 |
| P12 | pellegrino2014logicflaws | Pellegrino 2014 | NDSS 2014 | 10.14722/ndss.2014.23021 | B | B | FND | V2 | V3 |
| P13 | bisht2010notamper | Bisht 2010 | ACM CCS 2010 | 10.1145/1866307.1866375 | B | B | FND | V2 | abstract |
| P14 | raz2002semanticanomaly | Raz 2002 | ICSE 2002 | 10.1145/581376.581378 | B | C | FND | V2 | abstract |
| P15 | metin2025blv | Metin 2025 | Information (MDPI) 16(7) | 10.3390/info16070585 | B | B | PRI | V2 | V3 (MDPI: venue scrutiny noted) |
| P16 | armillotta2026antaeus | Armillotta 2026 | arXiv (Jul 2026) | 2607.01138 | B | B | PRI/concurrent | V2 | V3 |
| P17 | sahin2026accesspolicy | Sahin 2026 | JSS 2026 | 10.1016/j.jss.2026.113060 (arXiv 2604.00702) | B | C | PRI | V2 | abstract |
| P18 | pan2024edefuzz | Pan 2024 | ICSE 2024 | 10.1145/3597503.3608133 | B | C | PRI | V2 | abstract |
| P19 | sheng2025llmsecsurvey | Sheng 2025 | ACM CSUR 58(5) | 10.1145/3769082 | B | C | PRI | V2 | abstract |
| P20 | li2026webformtest | Li 2026 | ACM TOSEM (arXiv 2405.09965) | 10.1145/3735553 | C LLM inputs | A | PRI | V4 (note) | DONE: V4 |
| P21 | alian2024formnexus | Alian 2024 | ISSTA 2024 pp. 932–944 | 10.1145/3650212.3680332 (arXiv 2402.00950) | C | A | PRI | V4 (note) | DONE: V4 |
| P22 | chen2025fillforms | Chen 2025 | Information (MDPI) 16(2) | 10.3390/info16020102 | C | B | PRI | V2 | V3 |
| P23 | kim2024restgpt | Kim 2024 | ICSE-NIER 2024 | 10.1145/3639476.3639769 | C | B | PRI | V2 | abstract |
| P24 | kim2025llamaresttest | Kim 2025 | FSE 2025 / PACMSE | 10.1145/3715737 | C | A | PRI | V4 (note) | DONE: V4 |
| P25 | huynh2024constraints | Huynh 2024 | ASE 2024 | 10.1145/3691620.3695341 | C | B | PRI | V2 | abstract |
| P26 | tigulla2026robustness | Tigulla 2026 | arXiv | 2605.14202 | C | B | PRI | V3 (note) | DONE: V3 |
| P27 | cui2024guitextinput | Cui 2024 | arXiv | 2404.08948 | C | B | PRI | V2 | abstract |
| P28 | li2025formfactory | Li 2025 | arXiv | 2506.01520 | C | C | PRI | V2 | abstract |
| P29 | pereira2026apitestgenie | Pereira 2026 | AST 2026 (arXiv 2604.02039) | 2604.02039 | C | B | PRI | V2 | abstract |
| P30 | mishra2026structuredsynthetic | Mishra 2026 | ACM SDG workshop | 10.1145/3814574.3816747 | C | B | PRI | V2 | abstract |
| P31 | deng2023titanfuzz | Deng 2023 | ISSTA 2023 | 10.1145/3597926.3598067 | C | C | PRI | V2 | abstract |
| P32 | lu2025semanticfuzzing | Lu 2025 | arXiv | 2509.19533 | C | C | PRI | V2 | abstract |
| P33 | li2026orderbench | Li 2026 | arXiv (May 2026) | 2607.18261 | D schema-valid-but-wrong | A | PRI/concurrent | V4 (note) | DONE: V4 |
| P34 | ray2026constrainttax | Ray 2026 | arXiv (May 2026) | 2605.26128 | D | A | PRI/concurrent | V4 (note) | DONE: V4 |
| P35 | singh2026sob | Singh 2026 | arXiv (Apr 2026) | 2604.25359 | D | B | PRI/concurrent | V3 (note) | DONE: V3 |
| P36 | sigdel2026schemafirst | Sigdel 2026 | arXiv (Mar 2026) | 2603.13404 | D | A | PRI/concurrent | V4 (note) | DONE: V4 |
| P37 | wrenn2026enterprise | Wrenn 2026 | IEEE IC2E 2026 Industry (per arXiv 2608.03311) | 2608.03311 | D | A | PRI/concurrent | V4 (note) | DONE: V4 |
| P38 | song2026structuredoutput | Song 2026 | arXiv (Jun 2026) | 2606.09395 | D | B | PRI/concurrent | V2 | abstract |
| P39 | calo2026semanticgap | Calò 2026 | CHI EA 2026 | 10.1145/3772363.3799364 | D | A | PRI/concurrent | V4 (note) | DONE: V4 (author PDF) |
| P40 | zhao2026constraintaware | Zhao 2026 | arXiv (Aug 2026) | 2608.15109 | D | B | PRI/concurrent | V2 | abstract |
| P41 | singh2026injectioninteraction | Singh 2026 | arXiv (Sep 2026, survey) | 2609.03999 | D/E | B | PRI/concurrent | V3 (note) | DONE: V3 |
| P42 | sigloch2026neurosymbolic | Sigloch 2026 | KI 2026 (per arXiv 2605.26942) | 2605.26942 | D | C | PRI | V2 | abstract |
| P43 | greshake2023indirect | Greshake 2023 | ACM AISec 2023 workshop | 10.1145/3605764.3623985 (arXiv 2302.12173) | E injection in apps | A | FND(2023) | V4 (note) | DONE: V4 |
| P44 | liu2023houyi | Liu 2023 | arXiv (no Crossref record found) | 2306.05499 | E | B | PRI | V2 | abstract |
| P45 | pedro2025p2sql | Pedro 2025 | ICSE 2025 pp. 1768–1780 (published title: "Prompt-to-SQL Injections in LLM-Integrated Web Applications: Risks and Defenses") | 10.1109/icse55347.2025.00007 (arXiv 2308.01990) | E | A | PRI | V4 (note) | DONE: V4 |
| P46 | tsigkopoulos2026webexploitation | Tsigkopoulos 2026 | arXiv (Aug 2026) | 2608.10281 | E | B | PRI/concurrent | V2 | V3 |
| P47 | khodayari2026ipiwild | Khodayari 2026 | arXiv (Apr 2026) | 2604.27202 | E | B | PRI/concurrent | V2 | abstract |
| P48 | kaya2026chatbotplugins | Kaya 2026 | IEEE S&P 2026 (per arXiv 2511.05797) | 2511.05797 | E | B | PRI | V2 | abstract |
| P49 | liu2024formalizing | Liu 2024 | USENIX Security 2024 pp. 1831–1847 (usenix.org) | usenix.org | E/F | A | PRI | V4 (note) | DONE: V4 |
| P50 | yi2025bipia | Yi 2025 | KDD 2025 | 10.1145/3690624.3709179 | E | B | PRI | V2 | abstract |
| P51 | evtimov2025wasp | Evtimov 2025 | arXiv | 2504.18575 | E | C | PRI | V2 | abstract |
| P52 | liu2025wainjectbench | Liu 2025 | arXiv | 2510.01354 | E/F | B | PRI | V2 | abstract |
| P53 | milani2026ipi | Milani 2026 | Neural Computing and Applications | 10.1007/s00521-026-12266-x | E | C | PRI | V2 | abstract |
| P54 | jacob2025promptshield | Jacob 2025 | ACM CODASPY 2025 | 10.1145/3714393.3726501 (arXiv 2501.15145) | F detection cost | A | PRI | V4 (note) | DONE: V4 |
| P55 | liu2025datasentinel | Liu 2025 | IEEE S&P 2025 pp. 2190–2208 | 10.1109/sp61157.2025.00250 | F | B | PRI | V2 | abstract |
| P56 | li2024injecguard | Li 2024 | arXiv | 2410.22770 | F | B | PRI | V2 | V3 |
| P57 | ayub2024embedding | Ayub 2024 | arXiv (also CEUR-WS 3920) | 2410.22284 | F | B | PRI | V2 | abstract |
| P58 | zizzo2025guardrails | Zizzo 2025 | NeurIPS 2024 SafeGenAI wksp (per arXiv) | 2502.15427 | F | B | PRI | V2 | abstract |
| P59 | kumar2025nofreelunch | Kumar 2025 | arXiv | 2504.00441 | F | B | PRI | V2 | abstract |
| P60 | wang2026sokguardrails | Wang 2026 | IEEE S&P 2026 (per arXiv 2506.10597) | 2506.10597 | F | A | PRI | V3 (note) | DONE: V3 |
| P61 | ahmed2026reflexguard | Ahmed 2026 | arXiv (Aug 2026) | 2608.17556 | F | A | PRI/concurrent | V4 (note) | DONE: V4 |
| P62 | le2026llmjudge | Le 2026 | arXiv (Mar 2026) | 2603.25176 | F | B | PRI | V2 | abstract |
| P63 | maiorano2026tradeoffs | Maiorano 2026 | arXiv (Mar 2026) | 2605.06669 | F | A | PRI/concurrent | V4 (note) | DONE: V4 |
| P64 | saleem2026layered | Saleem 2026 | arXiv (Jun 2026) | 2606.19660 | F | B | PRI/concurrent | V3 (note) | DONE: V3 |
| P65 | datta2025javelinguard | Datta 2025 | arXiv | 2506.07330 | F | C | PRI | V2 | abstract |
| P66 | lakara2026fence | Lakara 2026 | arXiv | 2607.18268 | F | C | PRI | V2 | abstract |
| P67 | shi2024judgeattack | Shi 2024 | ACM CCS 2024 (per arXiv 2403.17710) | 2403.17710 | F | B | PRI | V2 | abstract |
| P68 | rebedea2023nemo | Rebedea 2023 | EMNLP 2023 demo (per arXiv) | 2310.10501 | F | C | PRI | V2 | abstract |
| P69 | shi2025promptarmor | Shi 2025 | arXiv | 2507.15219 | F | C | PRI | V2 | abstract |
| P70 | akinrele2026regime | Akinrele 2026 | arXiv | 2605.26999 | F | C | PRI | V2 | abstract |

## Excluded at screening (with reason)

| Candidate | Reason |
|---|---|
| Razzaq 2014 Inf. Sci.; Aljawarneh 2010; Cheng 2020 | "semantic" = semantic-web/ontology or URL structure, not our sense (IC1) |
| Durmuşkaya 2025; Sameh 2025; Babaey 2025 (ML-WAF anomaly) | attack-signature anomaly detection, not semantic validity of accepted inputs (IC1); keep as optional background |
| KARTAL thesis; PWFuzz; MDPI Applied Sciences crawler; IJNDI 2025 (sciltp) | grey / niche / venue legitimacy uncertain (IC2, IC5) |
| Shar & Tan 2012; Zhang 2021 CSUR; Li 2024 WAT survey; Tang 2026 TypeScript bugs | broad or off-topic (IC1) |
| Karakoc 2026 SQLi gen; Gabbireddy 2026 XSS | attack-payload generation, not semantic validity (IC1) |
| RESTifAI, RESTestBench, MioHint, RBCTest, AutoRestTest, Vikram 2026, Fuzz4All | REST/API test generation without a semantic-validity angle beyond P24/P25 (redundant) |
| WASP-adjacent web-agent IPI tooling (IPI-proxy, accessibility-tree attack), federated/undergraduate classifier preprints | peripheral or weak evidence (IC5) |
| Neef 2026; Falchuk 2026; Double-Dip 2026; BACFuzz; A2CT | logic-vuln detection variants not about input semantics (IC1) — may be cited in Related Work if space |
| Structured-output benchmarks not about semantic-vs-structural (LLMStructBench, TOON, UI-CUBE, EntCollabBench, agent-skills fuzzing, domain-model instances) | adjacent (IC1) |

## Grey literature (context only; never academic evidence)

| ID | Item | URL | Use |
|---|---|---|---|
| G01 | OWASP Input Validation Cheat Sheet (syntactic vs semantic validation definition) | https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html | terminology; practitioner framing |
| G02 | OWASP WSTG 4.2 — Business Logic Testing / Test Business Logic Data Validation | github OWASP/wstg (page fetch 404 — TODO-HUMAN confirm current URL) | terminology |
| G03 | OWASP Top 10 for LLM Applications 2025 — LLM01 Prompt Injection | https://genai.owasp.org/ | practitioner framing for AI-facing fields |
| G04 | Instructor / Guardrails AI docs "semantic validation" | vendor docs | shows the term in tooling; not evidence |

## PDFs requested from human (paywalled, central)

| Paper_ID | Why | Status |
|---|---|---|
| P02 martinlopez2022idl | strongest academic treatment of beyond-schema constraints (A-tier) | check for author OA copy first; else TODO-HUMAN |
| P08 hanna2018semanticvalidation | only paper using "semantic-based user input validation" in our sense | TODO-HUMAN |

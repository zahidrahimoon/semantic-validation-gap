#!/usr/bin/env python3
"""Make 13_DRAFT/references.bib print cleanly under IEEEtran without losing the audit trail.

The verified bibliography carries our verification level and Paper_ID in each entry's `note` field
("Verification: V2; P07"). IEEEtran prints `note`, so those internal notes appeared in the paper's
reference list (review issue I-R4-001). This script, run on the paper copy:
  1. moves internal notes (Verification ..., P-ids, arXiv comments, TO CONFIRM flags) from `note` to
     `annote`, which IEEEtran does not print;
  2. drops bogus "arXiv:YYYY.NNNNN" strings that were derived from DOI suffixes (e.g. the DOI
     10.14722/ndss.2014.23021 became "arXiv:2014.23021"). A real arXiv id is YYMM.NNNNN with month
     01-12; these have "months" 14, 23, 25;
  3. drops the redundant note "Preprint" (IEEEtran already prints "arXiv preprint ...");
  4. braces mixed-case product names in titles so the style cannot lowercase them;
  5. fixes the accent in one author name that BibTeX split wrongly ("Cristov\\~ao").

Idempotent. Never alters titles' words, authors, years, venues, DOIs or pages.

Usage: python3 12_REFERENCES/make_paper_bib.py 13_DRAFT/references.bib
"""
import re, sys, pathlib

PROTECT = ["FormFactory", "WASP", "DataSentinel", "JavelinGuard", "NeMo", "PromptShield", "OrderBench",
           "LlamaRestTest", "FormNexus", "RESTGPT", "EDEFuzz", "NoTamper", "Schemathesis", "BIPIA",
           "WAInjectBench", "PromptArmor", "InjecGuard", "HouYi", "Waler"]

path = pathlib.Path(sys.argv[1]); src = path.read_text()


def bogus_arxiv(tok: str) -> bool:
    m = re.fullmatch(r"arXiv:(\d{2})(\d{2})\.\d{4,5}", tok.strip())
    return bool(m) and not (1 <= int(m.group(2)) <= 12)


def split_note(note: str):
    keep, internal = [], []
    if "(preprint read; published version cited)" in note:
        note = note.replace(" (preprint read; published version cited)", "")
        internal.append("preprint read; published version cited")
    for part in [p.strip() for p in re.split(r";\s*|\.\s+", note) if p.strip()]:
        p = part.rstrip(".")
        if bogus_arxiv(p):
            internal.append(f"removed DOI-derived id {p}")
        elif re.match(r"(Verification|P\d+$|arXiv comment|Author list|TO CONFIRM|Preprint$|Accepted at|\d+ pages)", p) or re.fullmatch(r"P\d+", p):
            internal.append(p)  # internal audit notes and truncated arXiv comments

        else:
            keep.append(p)
    return "; ".join(keep), "; ".join(internal)


def fix_entry(block: str) -> str:
    m = re.search(r"\n(\s*)note\s*=\s*\{(.*?)\}(,?)\s*(?=\n)", block, flags=re.S)
    if m:
        keep, internal = split_note(m.group(2))
        repl = ""
        if keep: repl += f"\n{m.group(1)}note = {{{keep}}},"
        if internal: repl += f"\n{m.group(1)}annote = {{{internal}}},"
        block = block[:m.start()] + repl + block[m.end():]
        block = re.sub(r",(\s*\n\})\s*$", r"\1", block.rstrip()) + "\n"
    # Waler author list was checked against the PDF (11_PAPERS/notes/P11.md, V4): drop the flag
    block = block.replace("Author list TO CONFIRM against the PDF; ", "")
    def title_fix(t):
        for w in PROTECT:
            t = re.sub(rf"(?<![{{\w]){w}(?![}}\w])", "{" + w + "}", t)
        return t
    block = re.sub(r"(\btitle\s*=\s*\{)(.*?)(\}\s*,)", lambda x: x.group(1) + title_fix(x.group(2)) + x.group(3), block, flags=re.S)
    # A DOI already resolves, so a separate url field only lengthens the printed reference.
    if re.search(r"\n\s*doi\s*=\s*\{", block):
        block = re.sub(r"\n\s*url\s*=\s*\{[^}]*\},?", "", block)
        block = re.sub(r",(\s*\n\})\s*$", r"\1", block.rstrip()) + "\n"
    return block.replace(r"Cristov\~ao", r"Cristov{\~a}o")


parts = re.split(r"\n(?=@)", src)
path.write_text("\n".join(fix_entry(p) if p.lstrip().startswith("@") else p for p in parts))
print("cleaned", path)

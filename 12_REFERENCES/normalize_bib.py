#!/usr/bin/env python3
"""Normalise the BibTeX files for IEEEtran (Stage 15 citation audit fixes).

Fixes, in order:
  1. removes the crossref_lookup advisory comment that lands inside entries,
  2. lowercases field names (publishers emit DOI=, Title=, which bst styles then miss),
  3. protects acronyms with braces so ieeetran.bst cannot lowercase them,
  4. converts en/em dashes in page ranges to -- and replaces stray Unicode,
  5. reflows one-line entries to one field per line so a human can read them.

Idempotent: running it twice changes nothing. Never invents or alters bibliographic values.
"""
import re, sys, pathlib

ACRONYMS = ["LLM", "LLMs", "JSON", "API", "APIs", "REST", "RESTful", "SQL", "XSS", "SSRF", "AI", "SoK",
            "CPU", "GPU", "HTML", "CHI", "IEEE", "ACM", "OWASP", "NIST", "ISO", "BERT", "GPT", "UI",
            "UIs", "SLM", "SLMs", "RAG", "IPI", "PLC", "MARL", "NL", "IaC", "TOON", "SQLi"]
FIELD = re.compile(r"(^|[,{]\s*)([A-Za-z_]+)(\s*=)", re.M)

def protect_acronyms(text: str) -> str:
    for a in sorted(ACRONYMS, key=len, reverse=True):
        # only when not already inside braces
        text = re.sub(rf"(?<!\{{)\b{a}\b(?!\}})", "{" + a + "}", text)
    return text

def normalize(src: str) -> str:
    # 1. drop the advisory comment block wherever it appears
    src = re.sub(r"%\s*NOTE: publisher BibTeX often needs fixing:.*?use\.\s*,?\s*", "", src, flags=re.S)
    # 4. Unicode cleanups
    for a, b in {"′": "'", "–": "--", "—": "---", "’": "'", " ": " "}.items():
        src = src.replace(a, b)
    out = []
    for block in re.split(r"\n(?=@)", src):
        if not block.strip().startswith("@"):
            out.append(block); continue
        # 2. lowercase field names
        block = FIELD.sub(lambda m: m.group(1) + m.group(2).lower() + m.group(3), block)
        # 3. acronyms inside title only
        def fix_title(m):
            return m.group(1) + protect_acronyms(m.group(2)) + m.group(3)
        block = re.sub(r"(title\s*=\s*\{)(.*?)(\}\s*,)", fix_title, block, flags=re.S)
        # 4b. page ranges
        block = re.sub(r"(pages\s*=\s*\{)(\d+)\s*-{1,2}\s*(\d+)(\})", r"\1\2--\3\4", block)
        # 5. reflow single-line entries
        if block.count("\n") <= 2 and len(block) > 160:
            head = re.match(r"(@\w+\{[^,]+,)", block)
            if head:
                body = block[head.end():].rstrip()
                body = body[:body.rfind("}")] if body.rfind("}") != -1 else body
                fields, depth, cur = [], 0, ""
                for ch in body:
                    if ch == "{": depth += 1
                    elif ch == "}": depth -= 1
                    if ch == "," and depth == 0:
                        fields.append(cur.strip()); cur = ""
                    else:
                        cur += ch
                if cur.strip(): fields.append(cur.strip())
                block = head.group(1) + "\n" + "".join(f"  {f},\n" for f in fields if f) + "}\n"
        out.append(block)
    return "\n".join(out)

for f in sys.argv[1:]:
    p = pathlib.Path(f)
    p.write_text(normalize(p.read_text(encoding="utf8")), encoding="utf8")
    print("normalised", f)

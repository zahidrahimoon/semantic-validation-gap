#!/usr/bin/env python3
"""Build a shareable package for the two human tasks: self-contained HTML files that anyone can open
in a browser, with no server and no internet.

Output (16_RESULTS/human_review/):
  share/annotation_task.html        task 2, BLIND: contains item numbers only, never ids or conditions
  share/reference_review_task.html  task 1: the AI-drafted reference values (groups A and G)
  share/INSTRUCTIONS.txt            what the reviewer does and what to send back
  share/review_package.zip          the three files above, ready to send
  private/annotation_key.json       item number -> input id. NEVER SHARE: it would unblind the task.

The person works in the page, progress is kept in their browser, and at the end they press
"Download results" and send back one JSON file. `import_shared_results.py` reads it.

Usage: python3 17_CODE/review_app/make_share_package.py
"""
import hashlib, json, pathlib, sys, zipfile

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import server  # reuses the exact item lists (and the blind, fixed-seed order) of the local app

OUT = server.OUT
SHARE = OUT / "share"; SHARE.mkdir(parents=True, exist_ok=True)
PRIVATE = OUT / "private"; PRIVATE.mkdir(parents=True, exist_ok=True)

ann_items = [dict(number=i["number"], purpose=i["purpose"], rules=i["rules"], value=i["value"]) for i in server.ANN]
ref_items = [dict(number=n, meaning=i["meaning"], target=i["target"], purpose=i["purpose"],
                  rules=[{"text": r["text"]} for r in i["rules"]], value=i["value"])
             for n, i in enumerate(server.REF, start=1)]


def package_id(items):
    return hashlib.sha256(json.dumps(items, sort_keys=True).encode()).hexdigest()[:12]


ANN_ID, REF_ID = package_id(ann_items), package_id(ref_items)
(PRIVATE / "annotation_key.json").write_text(json.dumps(
    dict(package=ANN_ID, key={str(i["number"]): i["key"] for i in server.ANN}), indent=1))
(PRIVATE / "reference_key.json").write_text(json.dumps(
    dict(package=REF_ID, key={str(n): i["key"] for n, i in enumerate(server.REF, start=1)}), indent=1))

TEMPLATE = (HERE / "share_template.html").read_text()


def page(task, title, items, pid):
    cfg = dict(task=task, title=title, package=pid, items=items)
    return TEMPLATE.replace("/*__CONFIG__*/null", json.dumps(cfg, ensure_ascii=False).replace("</", "<\\/"))


(SHARE / "annotation_task.html").write_text(page("annotation", "Annotation task", ann_items, ANN_ID))
(SHARE / "reference_review_task.html").write_text(page("reference", "Reference-value review", ref_items, REF_ID))
(SHARE / "INSTRUCTIONS.txt").write_text(f"""RESEARCH REVIEW - INSTRUCTIONS FOR THE REVIEWER
================================================

Thank you for helping. You need only a web browser (Chrome, Firefox, Edge or Safari). No internet,
no installation and no account. Nothing you enter leaves your computer until you send the results file.

There are two tasks. Do them in this order:

  1. annotation_task.html         (about 2-3 hours, 220 items)
     A web form accepted each value below. For every rule shown, decide whether the value
     RESPECTS it, BREAKS it, or you are UNSURE. Judge only what you see; if you cannot tell, choose
     Unsure. Some items appear twice on purpose. Do not try to guess where a value came from.

  2. reference_review_task.html   (about 1-1.5 hours, 272 values)
     Each value is meant to be a normal (or unusual but legitimate) value a real user would type.
     Keep it if you would write it yourself, Change it to what you would write, or Delete it.
     At the end, enter your name and answer the confirmation question.

How to work:
  - Double-click the .html file; it opens in your browser.
  - Enter your name at the top of each task.
  - Your progress is saved in that browser automatically. Close it and reopen the same file in the
    same browser to continue. To move to another computer, use "Download results" and then
    "Load earlier results" on the other computer.
  - Keyboard shortcuts are shown at the top of each page.

When you finish (or want to hand over part-way):
  - Press "Download results" in each task. You get one file per task:
        annotation_results_<yourname>.json
        reference_review_results_<yourname>.json
  - Send those files back to the researcher (e-mail, WhatsApp, USB - any way is fine).

Package ids: annotation {ANN_ID}, reference review {REF_ID}
""")
with zipfile.ZipFile(SHARE / "review_package.zip", "w", zipfile.ZIP_DEFLATED) as z:
    for f in ("annotation_task.html", "reference_review_task.html", "INSTRUCTIONS.txt"):
        z.write(SHARE / f, arcname=f)
print(f"package written to {SHARE}  (annotation {ANN_ID}, reference {REF_ID})")
print(f"private keys (do NOT share): {PRIVATE}")

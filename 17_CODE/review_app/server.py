#!/usr/bin/env python3
"""Local review app for the two researcher tasks (TH-10 and the R3 annotation).

  Task 1 - review the AI-drafted reference inputs (groups A and G): keep, change or delete each value.
  Task 2 - annotate a blind sample of 220 structurally valid inputs: PASS / FAIL / UNSURE per rule.

Every click is appended to a JSON Lines log on disk immediately, so closing the browser or the laptop
loses nothing; the latest answer for an item wins. The browser never receives an item's id, group or
prompt family for task 2, so the annotation stays blind to the generation condition.

Run:  python3 17_CODE/review_app/server.py      then open  http://127.0.0.1:8765
Only Python's standard library is used. Listens on 127.0.0.1 only.
"""
import csv, json, random, re, datetime, pathlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = pathlib.Path(__file__).resolve().parent
P = HERE.parents[1]                                   # project root
HUMAN = P / "10_DATASETS" / "human_inputs"
RUN = P / "16_RESULTS" / "raw" / "E1_E1_20260920T0847"
OUT = P / "16_RESULTS" / "human_review"; OUT.mkdir(exist_ok=True)
LOG = {"provenance": OUT / "provenance_answers.jsonl", "annotation": OUT / "annotation_answers.jsonl"}
TARGETS = {t["id"]: t for t in json.loads((HERE / "targets.json").read_text())}

GROUP_MEANING = {
    "A": "a normal, valid value that a real user of this site would type",
    "G": "an unusual but legitimate value: surprising in form, but it must NOT break any rule",
}


def load_reference_items():
    """Groups A and G, keyed exactly as the harness keys them: <target>|<group>|r1|<line index>."""
    items = []
    for g in ("A", "G"):
        lines = [l for l in (HUMAN / f"group_{g}.csv").read_text().splitlines()
                 if l.strip() and not l.startswith("target_id") and not l.startswith("#")]
        for i, line in enumerate(lines):
            target_id, value = next(csv.reader([line]))
            t = TARGETS[target_id]
            items.append(dict(key=f"{target_id}|{g}|r1|{i}", group=g, meaning=GROUP_MEANING[g],
                              target=target_id, purpose=t["purpose"], rules=t["rules"], value=value))
    return items


def load_annotation_items():
    """The frozen annotation sample, shuffled once (fixed seed) so a repeated item is far from its original."""
    rows = list(csv.DictReader(open(RUN / "annotation_sample.csv", newline="")))
    rng = random.Random(20260922)
    for _ in range(1000):
        order = list(range(len(rows))); rng.shuffle(order)
        pos = {rows[j]["item_id"]: k for k, j in enumerate(order)}
        if all(abs(pos[r["item_id"]] - pos[r["item_id"].replace("#repeat", "")]) >= 40
               for r in rows if r["item_id"].endswith("#repeat")):
            break
    items = []
    for n, j in enumerate(order, start=1):
        r = rows[j]
        # rules are written "B-XX-1: text | B-XX-2: text" (cli.ts sample)
        parts = re.split(r"\s*\|\s*(?=B-[A-Z]+-\d+: )", r["rules_to_check"].strip())
        rules = [dict(id=m.group(1), text=m.group(2).strip())
                 for m in (re.match(r"(B-[A-Z]+-\d+): (.*)", x, flags=re.S) for x in parts) if m]
        items.append(dict(key=r["item_id"], number=n, target=r["target_id"], purpose=r["field_purpose"],
                          rules=rules, value=r["submitted_value"]))
    return items


REF = load_reference_items()
ANN = load_annotation_items()
ANN_BY_NUMBER = {a["number"]: a for a in ANN}


def latest(task):
    """Latest answer per item from the append-only log."""
    out = {}
    if LOG[task].exists():
        for line in LOG[task].read_text().splitlines():
            if line.strip():
                a = json.loads(line); out[a["key"]] = a
    return out


def public(task):
    """What the browser may see. For the annotation, the item's id (which encodes its condition) is withheld."""
    ans = latest(task)
    if task == "provenance":
        return [dict(i, answer=ans.get(i["key"])) for i in REF]
    return [dict(number=i["number"], target=i["target"], purpose=i["purpose"], rules=i["rules"], value=i["value"],
                 answer={k: v for k, v in ans.get(i["key"], {}).items() if k != "key"} or None) for i in ANN]


def export_files():
    """Write the files the analysis reads: annotation_filled.csv (importer format) and a review summary."""
    ann = latest("annotation")
    with open(RUN / "annotation_filled.csv", "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["item_id", "target_id", "field_purpose", "rules_to_check", "submitted_value", "verdict_per_rule", "notes"])
        for i in ANN:
            a = ann.get(i["key"])
            if not a: continue
            v = ";".join(f"{rid}={a['verdicts'][rid]}" for rid in a["verdicts"])
            # only the id and the verdicts are read by the importer; the other cells stay empty so no
            # comma or line break in a value can break its simple CSV parsing
            w.writerow([i["key"], i["target"], "", "", "", v, ""])
    prov = latest("provenance")
    counts = {c: sum(1 for a in prov.values() if a["decision"] == c) for c in ("keep", "change", "delete")}
    summary = dict(exported=datetime.datetime.now().isoformat(timespec="seconds"),
                   provenance=dict(total=len(REF), answered=len(prov), **counts),
                   annotation=dict(total=len(ANN), answered=len(ann)))
    (OUT / "summary.json").write_text(json.dumps(summary, indent=2))
    return summary


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json"):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(code); self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data))); self.end_headers(); self.wfile.write(data)

    def log_message(self, *args):  # keep the terminal quiet
        pass

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            return self._send(200, (HERE / "review.html").read_bytes(), "text/html; charset=utf-8")
        if self.path == "/api/provenance": return self._send(200, public("provenance"))
        if self.path == "/api/annotation": return self._send(200, public("annotation"))
        if self.path == "/api/signoff":
            f = OUT / "provenance_signoff.json"
            return self._send(200, json.loads(f.read_text()) if f.exists() else {})
        self._send(404, {"error": "not found"})

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
        now = datetime.datetime.now().isoformat(timespec="seconds")
        if self.path == "/api/provenance":
            if body.get("decision") not in ("keep", "change", "delete"): return self._send(400, {"error": "decision"})
            if body["decision"] == "change":
                try: json.loads(body.get("new_value", ""))
                except Exception: return self._send(400, {"error": "new value is not valid JSON"})
            rec = dict(key=body["key"], decision=body["decision"], new_value=body.get("new_value"),
                       note=body.get("note", ""), at=now)
            with open(LOG["provenance"], "a") as fh: fh.write(json.dumps(rec) + "\n")
            return self._send(200, {"ok": True})
        if self.path == "/api/annotation":
            item = ANN_BY_NUMBER.get(int(body.get("number", 0)))
            verdicts = body.get("verdicts") or {}
            if not item or set(verdicts) != {r["id"] for r in item["rules"]} or \
               any(v not in ("PASS", "FAIL", "AMBIGUOUS") for v in verdicts.values()):
                return self._send(400, {"error": "every rule needs PASS, FAIL or UNSURE"})
            rec = dict(key=item["key"], verdicts=verdicts, note=body.get("note", ""), at=now)
            with open(LOG["annotation"], "a") as fh: fh.write(json.dumps(rec) + "\n")
            return self._send(200, {"ok": True})
        if self.path == "/api/signoff":
            rec = dict(body, at=now)
            (OUT / "provenance_signoff.json").write_text(json.dumps(rec, indent=2))
            return self._send(200, {"ok": True})
        if self.path == "/api/export":
            return self._send(200, export_files())
        self._send(404, {"error": "not found"})


if __name__ == "__main__":
    print(f"Review app: http://127.0.0.1:8765  ({len(REF)} reference values, {len(ANN)} annotation items)")
    print(f"Answers are saved to {OUT}")
    ThreadingHTTPServer(("127.0.0.1", 8765), Handler).serve_forever()

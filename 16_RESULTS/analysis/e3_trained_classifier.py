#!/usr/bin/env python3
"""EMB-TRAINED: the embedding classifier the plan originally specified (reviewer point 8).

The EMB design evaluated in the paper is untrained: it scores a value by cosine distance from an
embedding of the field's purpose and rules. The frozen plan anticipated a trained classifier, and the
leave-fields-out split provides the labels for one. This script embeds each decided input's value once
(nomic-embed-text, cached to embeddings.npz), then fits logistic regression on the training folds and
scores the held-out fields, exactly like the other designs:

  features: the value embedding, the field-purpose embedding, their element-wise product, and the
            cosine distance between them
  split:    the same five leave-fields-out folds as e3_analysis.py
  operating point: the smallest score whose false-positive rate on valid training-fold inputs is <= 5%

Usage: .venv/bin/python e3_trained_classifier.py <E1 run folder> [--embed]
  --embed  (re)compute embeddings through Ollama; otherwise the cache is required
"""
import json, sys, pathlib, urllib.request
import numpy as np, pandas as pd
from sklearn.linear_model import LogisticRegression
from defects import excluded_ids

RUN = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(__file__).parent
CACHE = OUT / "embeddings.npz"
OLLAMA = "http://localhost:11434/api/embed"
MODEL = "nomic-embed-text"
targets = {t["id"]: t for t in json.loads((pathlib.Path(__file__).resolve().parents[2] / "17_CODE/review_app/targets.json").read_text())}

rows = [json.loads(l) for l in open(RUN / "e3_decisions.jsonl") if l.strip()]
d = pd.DataFrame([r for r in rows if r["design"] == "R"])          # one row per decided input
d = d[~d["input_id"].isin(excluded_ids(RUN))].copy()
lab = {}
for l in open(RUN / "semantic_labels.jsonl"):
    if l.strip():
        r = json.loads(l); lab[r["input_id"]] = r["final_label"]
d["label"] = d["input_id"].map(lab)                      # DV-22, as in e3_analysis.py
d = d[d["label"].isin(["VALID", "SV-SI"])].reset_index(drop=True)
d["y"] = (d["label"] == "SV-SI").astype(int)
struct = {json.loads(l)["input_id"]: json.loads(l) for l in open(RUN / "validation_results.jsonl") if l.strip()}


def embed(text):
    req = urllib.request.Request(OLLAMA, data=json.dumps({"model": MODEL, "input": text[:4000]}).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return np.array(json.load(r)["embeddings"][0], dtype=np.float32)


def value_text(iid, tid):
    t = targets[tid]
    payload = struct.get(iid, {}).get("payload", {})
    return json.dumps({k: payload.get(k) for k in t["keys"]}, ensure_ascii=False)


def purpose_text(tid):
    t = targets[tid]
    return t["purpose"] + " " + " ".join(r["text"] for r in t["rules"])


# The cache is keyed by input_id and topped up: a value's embedding does not depend on its label,
# so relabelling the run only ever adds ids, and nothing already embedded is recomputed.
have = {}
if CACHE.exists() and "--rebuild" not in sys.argv:
    z0 = np.load(CACHE, allow_pickle=True)
    have = {str(i): z0["V"][k] for k, i in enumerate(z0["ids"])}
    have.update({str(k): z0[k] for k in z0.files if k.startswith("P_")})
missing = [i for i in d["input_id"] if i not in have] + [f"P_{t}" for t in targets if f"P_{t}" not in have]
if missing:
    print(f"embedding {len(missing)} new items through {MODEL} ...")
    tid_of = dict(zip(d["input_id"], d["target_id"]))
    for n, m in enumerate(missing, 1):
        have[m] = embed(purpose_text(m[2:]) if m.startswith("P_") else value_text(m, tid_of[m]))
        if n % 200 == 0: print(f"  {n}/{len(missing)}")
    ids = [i for i in have if not i.startswith("P_")]
    np.savez_compressed(CACHE, V=np.stack([have[i] for i in ids]), ids=np.array(ids),
                        **{k: v for k, v in have.items() if k.startswith("P_")})
    print("cached to", CACHE)
V = np.stack([have[i] for i in d["input_id"]])
P = np.stack([have[f"P_{t}"] for t in d["target_id"]])
norm = lambda M: M / (np.linalg.norm(M, axis=1, keepdims=True) + 1e-9)
Vn, Pn = norm(V), norm(P)
cos = (Vn * Pn).sum(1, keepdims=True)
X = np.hstack([Vn, Pn, Vn * Pn, cos])
y = d["y"].to_numpy()

FOLDS = 5
tgts = sorted(d["target_id"].unique())
fold = d["target_id"].map({t: i % FOLDS for i, t in enumerate(tgts)}).to_numpy()


def threshold_at_fpr(scores_valid, candidates, max_fpr=0.05):
    v = np.asarray(scores_valid, float)
    for t in sorted(set(v.tolist()) | set(np.asarray(candidates, float).tolist())) + [float("inf")]:
        if (v >= t).mean() <= max_fpr: return t
    return float("inf")


pred = np.zeros(len(y), dtype=int); score = np.zeros(len(y))
for f in range(FOLDS):
    tr, te = fold != f, fold == f
    if te.sum() == 0 or len(set(y[tr])) < 2: continue
    clf = LogisticRegression(max_iter=2000, C=1.0, class_weight="balanced").fit(X[tr], y[tr])
    s_tr, s_te = clf.predict_proba(X[tr])[:, 1], clf.predict_proba(X[te])[:, 1]
    thr = threshold_at_fpr(s_tr[y[tr] == 0], s_tr)
    score[te] = s_te; pred[te] = (s_te >= thr).astype(int)

tp = int(((pred == 1) & (y == 1)).sum()); fp = int(((pred == 1) & (y == 0)).sum())
fn = int(((pred == 0) & (y == 1)).sum()); tn = int(((pred == 0) & (y == 0)).sum())
pos, neg = score[y == 1], score[y == 0]
auroc = float(((pos[:, None] > neg[None, :]).sum() + 0.5 * (pos[:, None] == neg[None, :]).sum()) / (len(pos) * len(neg)))
rng = np.random.default_rng(7); boot = []
idx = np.arange(len(y))
for _ in range(1000):
    b = rng.choice(idx, len(idx), replace=True)
    t_, f_ = ((pred[b] == 1) & (y[b] == 1)).sum(), ((pred[b] == 0) & (y[b] == 1)).sum()
    if t_ + f_: boot.append(t_ / (t_ + f_))
lo, hi = np.percentile(boot, [2.5, 97.5])
res = dict(design="EMB-TRAINED", n=len(y), tp=tp, fp=fp, fn=fn, tn=tn,
           recall_at_fpr05=tp / (tp + fn) if tp + fn else float("nan"), recall_ci_lo=lo, recall_ci_hi=hi,
           precision=tp / (tp + fp) if tp + fp else float("nan"), fpr=fp / (fp + tn) if fp + tn else float("nan"),
           auroc=auroc, population="all decided inputs, leave-fields-out")
pd.DataFrame([res]).to_csv(OUT / "table6f_trained_classifier.csv", index=False)
(OUT / "trained_classifier_summary.json").write_text(json.dumps(res, indent=2, default=float))
print(json.dumps({k: (round(v, 3) if isinstance(v, float) else v) for k, v in res.items()}, indent=1))

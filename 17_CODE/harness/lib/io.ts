/** Append-only JSONL writing, run ids and manifests (EXPERIMENT_SAFETY.md: raw data is immutable). */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";

export const RAW_ROOT = new URL("../../../16_RESULTS/raw/", import.meta.url).pathname;

export function runDir(exp: string, runId: string): string {
  const d = join(RAW_ROOT, `${exp}_${runId}`);
  mkdirSync(d, { recursive: true });
  return d;
}

export function appendJsonl(file: string, rows: unknown[]): void {
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
}

export function readJsonl<T>(file: string): T[] {
  if (!existsSync(file)) return [];
  const out: T[] = [];
  for (const l of readFileSync(file, "utf8").split("\n")) {
    if (!l) continue;
    // A line of only NUL bytes is what the filesystem leaves when the machine stops mid-write. It
    // holds no data, so skip it (the lost record is simply re-measured on resume). Any OTHER
    // unparseable line is real corruption and must stop the run rather than be silently dropped.
    if (l.replace(/\u0000/g, "").trim() === "") {
      console.warn(`  ! skipped a zero-byte line in ${file} (interrupted write)`);
      continue;
    }
    out.push(JSON.parse(l) as T);
  }
  return out;
}

export function writeManifest(dir: string, m: Record<string, unknown>): void {
  writeFileSync(join(dir, "manifest.json"), JSON.stringify(m, null, 2), "utf8");
}

export const sha256 = (s: string): string => createHash("sha256").update(s).digest("hex").slice(0, 16);

export const nowRunId = (): string => new Date().toISOString().replace(/[-:T]/g, "").slice(0, 13);

/** Deterministic PRNG so programmatic groups are reproducible from a seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

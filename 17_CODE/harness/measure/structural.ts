/**
 * Structural measurement: (i) schema-only, by importing the SAME frozen Zod schema the app uses,
 * (ii) the real HTTP path on the running testbed. `structural_pass` is the app's own 2xx decision.
 */
import { createRequire } from "node:module";
import * as V from "../../testbed/lib/validation/index.js";
import { BASE_PAYLOAD, Target, byId } from "../config/fields.js";
import type { GenRecord } from "../generate/llm.js";

const APP = process.env.APP_URL ?? "http://localhost:3000";

/**
 * DV-09: every booking consumes seats, so without a reset the outcome of a booking depends on how
 * many bookings were measured before it rather than on the input. Before each booking-surface
 * measurement, delete every booking except the seeded one (BK-100001, on a different course), which
 * restores the seed state: the course under test has all 20 seats free, exactly what the rule
 * functions assume (remainingSeats: 20). The database is the testbed's own SQLite file.
 */
const requireCjs = createRequire(import.meta.url);
const DB_PATH = new URL("../../testbed/dev.db", import.meta.url).pathname;
let db: { prepare: (sql: string) => { run: () => { changes: number } } } | null = null;
export function resetBookingState(): number {
  if (!db) {
    const Database = requireCjs("../../testbed/node_modules/better-sqlite3") as new (f: string) => typeof db;
    db = new Database(DB_PATH);
  }
  return db!.prepare("DELETE FROM Booking WHERE ref <> 'BK-100001'").run().changes;
}

export type StructRecord = {
  input_id: string; target_id: string; group: string; prompt_family: string | null;
  payload: Record<string, unknown>;
  schema_pass: boolean; schema_errors: string[]; schema_ms: number;
  http_status: number; http_ok: boolean; service_errors: string[]; http_ms: number;
  structural_pass: boolean; created_id: string | null; error: string | null;
};

const SCHEMAS: Record<string, unknown> = V as unknown as Record<string, unknown>;

export async function courseIdFor(category = "DEVELOPMENT"): Promise<string> {
  const r = await fetch(`${APP}/api/courses?category=${category}`);
  const d = (await r.json()) as { items: { id: string }[] };
  if (!d.items?.length) throw new Error("no seeded course found — run npm run db:seed in the testbed");
  return d.items[0].id;
}

export function buildPayload(t: Target, value: Record<string, unknown>, courseId: string): Record<string, unknown> {
  const p: Record<string, unknown> = { ...BASE_PAYLOAD[t.surface], ...value };
  if (p.courseId === "__COURSE_ID__") p.courseId = courseId;
  return p;
}

export async function measure(rec: GenRecord, courseId: string): Promise<StructRecord> {
  const t = byId(rec.target_id);
  const payload = buildPayload(t, rec.value as Record<string, unknown>, courseId);
  // (i) schema-only
  const schema = SCHEMAS[t.schema] as { safeParse: (x: unknown) => { success: boolean; error?: { issues: { path: (string | number)[]; message: string }[] } } };
  const t0 = performance.now();
  const sr = schema.safeParse(payload);
  const schema_ms = performance.now() - t0;
  const schema_errors = sr.success ? [] : (sr.error?.issues ?? []).map((i) => `${i.path.join(".") || "_root"}: ${i.message}`);
  // (ii) real HTTP path — against the seed state for bookings (DV-09)
  if (t.surface === "booking") resetBookingState();
  let http_status = 0, service_errors: string[] = [], created_id: string | null = null, error: string | null = null;
  const t1 = performance.now();
  try {
    let res: Response;
    if (t.method === "GET") {
      const qs = new URLSearchParams(Object.entries(payload).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)]));
      res = await fetch(`${APP}${t.path}?${qs.toString()}`, { signal: AbortSignal.timeout(320_000) });
    } else {
      res = await fetch(`${APP}${t.path}`, { method: t.method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(320_000) });
    }
    http_status = res.status;
    const body = (await res.json()) as { ok?: boolean; errors?: Record<string, string[]>; message?: string; data?: { id?: string } };
    if (body.errors) service_errors = Object.entries(body.errors).map(([k, v]) => `${k}: ${v.join("; ")}`);
    else if (body.message && body.ok === false) service_errors = [body.message];
    created_id = body.data?.id ?? null;
  } catch (e) {
    error = String(e).slice(0, 200);
  }
  const http_ms = performance.now() - t1;
  const http_ok = http_status >= 200 && http_status < 300;
  return {
    input_id: rec.input_id, target_id: rec.target_id, group: rec.group, prompt_family: rec.prompt_family,
    payload, schema_pass: sr.success, schema_errors, schema_ms: Math.round(schema_ms * 1000) / 1000,
    http_status, http_ok, service_errors, http_ms: Math.round(http_ms), structural_pass: http_ok, created_id, error,
  };
}

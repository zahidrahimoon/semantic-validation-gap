/**
 * R1: deterministic rule functions for the OBJECTIVE rules only (BUSINESS_RULES.md class OBJ).
 * Judgement rules return "NA" here and are decided by R2 (judge) and R3 (human) — Algorithm 1.
 */
import type { StructRecord } from "../measure/structural.js";

export type Verdict = "PASS" | "FAIL" | "NA";
const MS_YEAR = 365.2425 * 24 * 3600 * 1000;

/** Seeded promo codes (testbed prisma/seed.ts, frozen): code → {pct, appliesTo, expired}. */
const PROMOS: Record<string, { appliesTo: string; expired: boolean }> = {
  WELCOME10: { appliesTo: "ANY", expired: false },
  COOK25: { appliesTo: "COOKING", expired: false },
  OLD50: { appliesTo: "ANY", expired: true },
};

/** Context the rules need beyond the payload itself. */
export type Ctx = { now: Date; bookedCategory: string; remainingSeats: number };

export function evaluateRules(s: StructRecord, ctx: Ctx): Record<string, Verdict> {
  const p = s.payload;
  const v: Record<string, Verdict> = {};
  const num = (k: string): number | null => (typeof p[k] === "number" ? (p[k] as number) : Number.isFinite(Number(p[k])) ? Number(p[k]) : null);
  const str_ = (k: string): string | null => (typeof p[k] === "string" ? (p[k] as string) : null);

  // Profile
  const bd = str_("birthDate");
  if (bd && /^\d{4}-\d{2}-\d{2}$/.test(bd) && !Number.isNaN(Date.parse(bd))) {
    const d = new Date(bd);
    v["B-PR-2"] = d <= ctx.now ? "PASS" : "FAIL";
    v["B-PR-3"] = ctx.now.getTime() - d.getTime() >= 13 * MS_YEAR ? "PASS" : "FAIL";
    v["B-PR-4"] = d.getFullYear() >= 1910 && ctx.now.getTime() - d.getTime() <= 120 * MS_YEAR ? "PASS" : "FAIL";
  }
  // Course dates
  const sa = str_("startsAt"), ea = str_("endsAt");
  if (sa && ea && !Number.isNaN(Date.parse(sa)) && !Number.isNaN(Date.parse(ea))) {
    const S = new Date(sa), E = new Date(ea);
    v["B-CO-1"] = E > S ? "PASS" : "FAIL";
    v["B-CO-2"] = S > ctx.now ? "PASS" : "FAIL";
    const hours = (E.getTime() - S.getTime()) / 3600000;
    v["B-CO-3"] = hours >= 0.5 && hours <= 12 ? "PASS" : "FAIL";
  }
  // Discount on a free course
  const price = num("price"), disc = num("discountPercent");
  if (price !== null && disc !== null) v["B-CO-6"] = price === 0 && disc > 0 ? "FAIL" : "PASS";
  // Search range
  const mn = num("minPrice"), mx = num("maxPrice");
  if (mn !== null && mx !== null) v["B-SE-1"] = mn <= mx ? "PASS" : "FAIL";
  // Booking
  const seats = num("seats");
  if (seats !== null) v["B-BK-1"] = seats <= ctx.remainingSeats ? "PASS" : "FAIL";
  const promo = str_("promoCode");
  if (promo !== null && promo !== "") {
    const key = promo.trim().toUpperCase();
    const rec = PROMOS[key];
    v["B-BK-2"] = rec && !rec.expired ? "PASS" : "FAIL";
    v["B-BK-3"] = rec ? (rec.appliesTo === "ANY" || rec.appliesTo === ctx.bookedCategory ? "PASS" : "FAIL") : "NA";
  }
  return v;
}

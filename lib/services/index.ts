/**
 * Service layer: ONE implementation per operation, shared by the server actions
 * (forms) and the JSON route handlers (HTTP). Each service:
 *   1. runs the STRUCTURAL schema (lib/validation),
 *   2. runs the few BUSINESS rules that are enforced in code (see BUSINESS_RULES.md),
 *   3. writes to the database.
 * Returning { ok:false, errors } instead of throwing keeps the validation outcome
 * observable for the research harness.
 */
import { z } from "zod";
import { db } from "@/lib/db";
import { assistantReply, triageTicket } from "@/lib/services/ai";
import {
  ActionResult,
  bookingSchema,
  chatSchema,
  courseSchema,
  fieldErrors,
  profileSchema,
  reviewSchema,
  searchSchema,
  ticketSchema,
} from "@/lib/validation";

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): { ok: true; data: z.output<S> } | { ok: false; result: ActionResult<never> } {
  const r = schema.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, result: { ok: false, message: "Validation failed", errors: fieldErrors(r.error) } };
}

// ---------- profile ----------
export async function updateProfile(userId: string, input: unknown): Promise<ActionResult> {
  const p = parse(profileSchema, input);
  if (!p.ok) return p.result;
  const taken = await db.user.findFirst({ where: { username: p.data.username, NOT: { id: userId } } });
  if (taken) return { ok: false, message: "Validation failed", errors: { username: ["Username already taken"] } };
  const u = await db.user.update({
    where: { id: userId },
    data: { ...p.data, bio: p.data.bio ?? "", website: p.data.website ?? "" },
  });
  return { ok: true, data: { id: u.id } };
}

// ---------- courses ----------
export async function createCourse(input: unknown): Promise<ActionResult> {
  const p = parse(courseSchema, input);
  if (!p.ok) return p.result;
  const c = await db.course.create({
    data: {
      ...p.data,
      startsAt: new Date(p.data.startsAt),
      endsAt: new Date(p.data.endsAt),
      tags: p.data.tags.join(","),
    },
  });
  return { ok: true, data: { id: c.id } };
}

export async function searchCourses(rawParams: unknown) {
  const r = searchSchema.safeParse(rawParams);
  const q = r.success ? r.data : searchSchema.parse({});
  const errors = r.success ? undefined : fieldErrors(r.error);
  const pageSize = 6;
  const where = {
    AND: [
      q.q ? { OR: [{ title: { contains: q.q } }, { description: { contains: q.q } }] } : {},
      q.category ? { category: q.category } : {},
      q.minPrice !== undefined ? { price: { gte: q.minPrice } } : {},
      q.maxPrice !== undefined ? { price: { lte: q.maxPrice } } : {},
    ],
  };
  const orderBy =
    q.sort === "price_asc" ? { price: "asc" as const } : q.sort === "price_desc" ? { price: "desc" as const } : q.sort === "soonest" ? { startsAt: "asc" as const } : { createdAt: "desc" as const };
  const [items, total] = await Promise.all([
    db.course.findMany({ where, orderBy, skip: (q.page - 1) * pageSize, take: pageSize }),
    db.course.count({ where }),
  ]);
  return { query: q, errors, items, total, pageSize };
}

export async function getCourse(id: string) {
  const course = await db.course.findUnique({ where: { id }, include: { reviews: { include: { user: true }, orderBy: { createdAt: "desc" } } } });
  if (!course) return null;
  const booked = await db.booking.aggregate({ where: { courseId: id }, _sum: { seats: true } });
  return { ...course, seatsBooked: booked._sum.seats ?? 0 };
}

// ---------- bookings ----------
export async function createBooking(userId: string, input: unknown): Promise<ActionResult<{ id: string; ref: string; totalPrice: number }>> {
  const p = parse(bookingSchema, input);
  if (!p.ok) return p.result;
  const course = await getCourse(p.data.courseId);
  if (!course) return { ok: false, message: "Validation failed", errors: { courseId: ["Course not found"] } };
  // BUSINESS RULE B-BK-1 (enforced): seats must not exceed remaining capacity
  const remaining = course.capacity - course.seatsBooked;
  if (p.data.seats > remaining) return { ok: false, message: "Validation failed", errors: { seats: [`Only ${remaining} seats left`] } };
  // BUSINESS RULE B-BK-2 (enforced): promo code must exist and not be expired
  let discount = course.discountPercent;
  if (p.data.promoCode) {
    const promo = await db.promoCode.findUnique({ where: { code: p.data.promoCode } });
    if (!promo || promo.expiresAt < new Date()) return { ok: false, message: "Validation failed", errors: { promoCode: ["Unknown or expired promo code"] } };
    discount = Math.max(discount, promo.discountPercent); // B-BK-3 (NOT enforced): promo.appliesTo vs course.category
  }
  const totalPrice = Math.round(course.price * p.data.seats * (1 - discount / 100));
  const ref = `BK-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0")}`;
  const b = await db.booking.create({
    data: { ...p.data, promoCode: p.data.promoCode ?? "", notes: p.data.notes ?? "", userId, ref, totalPrice },
  });
  return { ok: true, data: { id: b.id, ref: b.ref, totalPrice } };
}

// ---------- reviews ----------
export async function createReview(userId: string, input: unknown): Promise<ActionResult> {
  const p = parse(reviewSchema, input);
  if (!p.ok) return p.result;
  const course = await db.course.findUnique({ where: { id: p.data.courseId } });
  if (!course) return { ok: false, message: "Validation failed", errors: { courseId: ["Course not found"] } };
  // B-RV-1 (NOT enforced): reviewer must have a booking for the course
  const r = await db.review.create({ data: { ...p.data, userId } });
  return { ok: true, data: { id: r.id } };
}

// ---------- support tickets (AI-facing) ----------
export async function createTicket(userId: string, input: unknown): Promise<ActionResult<{ id: string; aiOk: boolean }>> {
  const p = parse(ticketSchema, input);
  if (!p.ok) return p.result;
  // B-TK-1 (NOT enforced): bookingRef, if given, must belong to this user
  const t = await db.ticket.create({ data: { ...p.data, bookingRef: p.data.bookingRef ?? "", userId } });
  let aiOk = false;
  try {
    const ai = await triageTicket(p.data.subject, p.data.description);
    await db.ticket.update({
      where: { id: t.id },
      data: { aiSummary: ai.summary, aiCategory: ai.suggestedCategory, aiPriority: ai.suggestedPriority, aiDraftReply: ai.draftReply, aiModel: ai.model, aiMs: ai.ms },
    });
    aiOk = true;
  } catch (e) {
    await db.ticket.update({ where: { id: t.id }, data: { aiSummary: `AI triage unavailable: ${(e as Error).message.slice(0, 120)}` } });
  }
  return { ok: true, data: { id: t.id, aiOk } };
}

// ---------- assistant chat (AI-facing) ----------
export async function sendChat(userId: string, input: unknown): Promise<ActionResult<{ reply: string }>> {
  const p = parse(chatSchema, input);
  if (!p.ok) return p.result;
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const courses = await db.course.findMany({ select: { title: true }, take: 20 });
  await db.chatMessage.create({ data: { userId, role: "user", content: p.data.message } });
  try {
    const ai = await assistantReply(p.data.message, { displayName: user.displayName, bio: user.bio, courseTitles: courses.map((c) => c.title) });
    await db.chatMessage.create({ data: { userId, role: "assistant", content: ai.reply, model: ai.model, ms: ai.ms } });
    return { ok: true, data: { reply: ai.reply } };
  } catch (e) {
    return { ok: false, message: `Assistant unavailable: ${(e as Error).message.slice(0, 160)}` };
  }
}

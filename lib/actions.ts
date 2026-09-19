"use server";
/** Server actions used by the forms. Thin: resolve demo user → call service → revalidate. */
import { revalidatePath } from "next/cache";
import { db, DEMO_ADMIN, demoUser } from "@/lib/db";
import * as svc from "@/lib/services";

export async function updateProfileAction(input: unknown) {
  const u = await demoUser();
  const r = await svc.updateProfile(u.id, input);
  if (r.ok) revalidatePath("/profile");
  return r;
}

export async function createCourseAction(input: unknown) {
  const admin = await db.user.findUnique({ where: { username: DEMO_ADMIN } });
  if (!admin) return { ok: false as const, message: "Admin user missing (seed the DB)" };
  const r = await svc.createCourse(input);
  if (r.ok) revalidatePath("/courses");
  return r;
}

export async function createBookingAction(input: unknown) {
  const u = await demoUser();
  const r = await svc.createBooking(u.id, input);
  if (r.ok) revalidatePath("/courses");
  return r;
}

export async function createReviewAction(input: unknown) {
  const u = await demoUser();
  const r = await svc.createReview(u.id, input);
  if (r.ok) revalidatePath("/courses");
  return r;
}

export async function createTicketAction(input: unknown) {
  const u = await demoUser();
  const r = await svc.createTicket(u.id, input);
  if (r.ok) revalidatePath("/support");
  return r;
}

export async function sendChatAction(input: unknown) {
  const u = await demoUser();
  const r = await svc.sendChat(u.id, input);
  revalidatePath("/assistant");
  return r;
}

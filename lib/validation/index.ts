/**
 * STRUCTURAL validation schemas for every input surface of the testbed.
 *
 * These are deliberately written the way a typical developer would write them:
 * types, required-ness, lengths, regexes, ranges, enums and formats. Anything
 * that requires knowledge of the application's purpose (semantic / business
 * rules) is listed in BUSINESS_RULES.md; only a few of those are enforced in the
 * services layer, and BUSINESS_RULES.md records which ones.
 *
 * The same schemas are used on the client (react-hook-form + zodResolver), in
 * server actions, and in the JSON route handlers, so "structurally valid" has a
 * single definition per field.
 */
import { z } from "zod";

/** Accepts <input type="datetime-local"> values (YYYY-MM-DDTHH:mm) and full ISO 8601 strings. */
const dateTimeString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/, "Use YYYY-MM-DDTHH:mm")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Not a real date/time");

// ---------- shared enums ----------
export const COUNTRIES = ["PK", "US", "GB", "DE", "IN", "AE", "CA", "AU", "OTHER"] as const;
export const COURSE_CATEGORIES = ["DESIGN", "DEVELOPMENT", "BUSINESS", "MUSIC", "COOKING", "FITNESS"] as const;
export const COURSE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const TICKET_CATEGORIES = ["BOOKING", "PAYMENT", "ACCOUNT", "TECHNICAL", "OTHER"] as const;
export const SORT_OPTIONS = ["newest", "price_asc", "price_desc", "soonest"] as const;

// ---------- profile ----------
export const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(50),
  username: z.string().regex(/^[a-z0-9_]{3,20}$/, "3–20 lowercase letters, digits or underscore"),
  bio: z.string().trim().max(300).optional().or(z.literal("")),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine((s) => !Number.isNaN(Date.parse(s)), "Not a real date")
    .refine((s) => new Date(s) <= new Date(), "Birth date cannot be in the future"),
  website: z.url().max(200).optional().or(z.literal("")),
  country: z.enum(COUNTRIES),
});
export type ProfileInput = z.infer<typeof profileSchema>;

// ---------- course (admin) ----------
export const courseSchema = z
  .object({
    title: z.string().trim().min(5).max(80),
    description: z.string().trim().min(20).max(2000),
    category: z.enum(COURSE_CATEGORIES),
    level: z.enum(COURSE_LEVELS),
    location: z.string().trim().min(3).max(80),
    price: z.coerce.number().int().min(0).max(10000),
    discountPercent: z.coerce.number().int().min(0).max(90),
    capacity: z.coerce.number().int().min(1).max(500),
    startsAt: dateTimeString,
    endsAt: dateTimeString,
    tags: z.array(z.string().trim().min(1).max(20)).max(5).default([]),
  })
  .refine((c) => new Date(c.endsAt) > new Date(c.startsAt), { message: "End must be after start", path: ["endsAt"] });
export type CourseInput = z.infer<typeof courseSchema>;

// ---------- booking ----------
export const bookingSchema = z.object({
  courseId: z.string().min(1),
  seats: z.coerce.number().int().min(1).max(10),
  attendeeName: z.string().trim().min(2).max(60),
  attendeeEmail: z.email().max(120),
  promoCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{4,12}$/).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
export type BookingInput = z.infer<typeof bookingSchema>;

// ---------- review ----------
export const reviewSchema = z.object({
  courseId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(80),
  body: z.string().trim().min(10).max(1000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

// ---------- support ticket (AI-facing: description is read by the assistant) ----------
export const ticketSchema = z.object({
  subject: z.string().trim().min(5).max(100),
  description: z.string().trim().min(20).max(2000),
  priority: z.enum(TICKET_PRIORITIES),
  category: z.enum(TICKET_CATEGORIES),
  bookingRef: z.string().trim().toUpperCase().regex(/^BK-\d{6}$/, "Format BK-000000").optional().or(z.literal("")),
});
export type TicketInput = z.infer<typeof ticketSchema>;

// ---------- assistant chat (AI-facing) ----------
export const chatSchema = z.object({
  message: z.string().trim().min(1).max(1000),
});
export type ChatInput = z.infer<typeof chatSchema>;

// ---------- course search (URL searchParams) ----------
export const searchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.enum(COURSE_CATEGORIES).optional(),
  minPrice: z.coerce.number().int().min(0).max(10000).optional(),
  maxPrice: z.coerce.number().int().min(0).max(10000).optional(),
  sort: z.enum(SORT_OPTIONS).default("newest"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});
export type SearchInput = z.infer<typeof searchSchema>;

/** Flatten a Zod error into { field: [messages] } for forms and JSON responses. */
export function fieldErrors(err: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_root";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

export type ActionResult<T = { id: string }> =
  | { ok: true; data: T }
  | { ok: false; message: string; errors?: Record<string, string[]> };

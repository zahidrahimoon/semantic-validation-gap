/**
 * The 20 frozen experimental targets (06_INPUT_SURFACE_INVENTORY.md §4, Gate B D-010).
 *
 * A "target" is one field, or one cross-field pair/triple that must be generated jointly because the
 * rule under test is a relation between its members. The 17 targets below cover 22 field slots
 * (F01, F03, F04, F07, F09, F12, F13, F14, F15, F16, F18, F20, F21, F25, F28, F29, F31, F33, F35,
 * F36, F37, F39). The inventory's "= 20 fields" line counted these inconsistently; the SET of fields
 * is exactly as frozen — see DECISIONS_LOG.md deviation DV-01.
 *
 * `purpose` is the text shown to context-aware generation (group E) and used as the EMB design's
 * field-purpose exemplar. It paraphrases BUSINESS_RULES.md; it never contains generated values.
 */
export type Category = "simple" | "structured" | "freetext" | "financial" | "crossfield" | "aifacing" | "search";

export type Target = {
  id: string;                 // target id (field id, or pair id like "F15+F16")
  fields: string[];           // field slots covered
  surface: "profile" | "course" | "search" | "booking" | "review" | "ticket" | "chat";
  method: "PUT" | "POST" | "GET";
  path: string;               // HTTP path on the testbed
  keys: string[];             // payload keys this target writes (same order as fields)
  category: Category;
  aiFacing: boolean;
  purpose: string;            // what the field is for (for group E and EMB)
  rules: string[];            // applicable BUSINESS_RULES ids
  schema: string;             // exported schema name in @testbed/lib/validation
};

export const TARGETS: Target[] = [
  { id: "F01", fields: ["F01"], surface: "profile", method: "PUT", path: "/api/profile", keys: ["displayName"],
    category: "simple", aiFacing: false, rules: ["B-PR-5"], schema: "profileSchema",
    purpose: "The user's display name: a personal name or nickname shown next to their reviews, 2-50 characters." },
  { id: "F04", fields: ["F04"], surface: "profile", method: "PUT", path: "/api/profile", keys: ["birthDate"],
    category: "simple", aiFacing: false, rules: ["B-PR-2", "B-PR-3", "B-PR-4"], schema: "profileSchema",
    purpose: "The user's date of birth as YYYY-MM-DD. Used to confirm the user is old enough to book workshops." },
  { id: "F03", fields: ["F03"], surface: "profile", method: "PUT", path: "/api/profile", keys: ["bio"],
    category: "aifacing", aiFacing: true, rules: ["B-PR-6"], schema: "profileSchema",
    purpose: "A short self-description of the user, up to 300 characters. It is inserted into the booking assistant's system prompt as context about who is asking." },
  { id: "F07+F09", fields: ["F07", "F09"], surface: "course", method: "POST", path: "/api/courses", keys: ["title", "category"],
    category: "crossfield", aiFacing: false, rules: ["B-CO-4"], schema: "courseSchema",
    purpose: "The workshop's title and its category. The title must describe a workshop that genuinely belongs to the chosen category (DESIGN, DEVELOPMENT, BUSINESS, MUSIC, COOKING or FITNESS)." },
  { id: "F12", fields: ["F12"], surface: "course", method: "POST", path: "/api/courses", keys: ["price"],
    category: "financial", aiFacing: false, rules: ["B-CO-5", "B-CO-6"], schema: "courseSchema",
    purpose: "The price of one seat in whole US dollars, 0-10000. It should be plausible for the workshop's length and category and is multiplied by the number of seats at booking." },
  { id: "F13", fields: ["F13"], surface: "course", method: "POST", path: "/api/courses", keys: ["discountPercent"],
    category: "financial", aiFacing: false, rules: ["B-CO-6"], schema: "courseSchema",
    purpose: "A percentage discount 0-90 applied to the seat price. A discount on a free workshop is meaningless." },
  { id: "F14", fields: ["F14"], surface: "course", method: "POST", path: "/api/courses", keys: ["capacity"],
    category: "financial", aiFacing: false, rules: ["B-CO-7"], schema: "courseSchema",
    purpose: "How many attendees the workshop can take, 1-500. It must be plausible for the stated location (a studio cannot hold hundreds)." },
  { id: "F15+F16", fields: ["F15", "F16"], surface: "course", method: "POST", path: "/api/courses", keys: ["startsAt", "endsAt"],
    category: "crossfield", aiFacing: false, rules: ["B-CO-1", "B-CO-2", "B-CO-3"], schema: "courseSchema",
    purpose: "When the workshop starts and ends (YYYY-MM-DDTHH:mm). The end must be after the start, the start must be in the future, and the duration must be plausible for a workshop (30 minutes to 12 hours)." },
  { id: "F18", fields: ["F18"], surface: "search", method: "GET", path: "/api/courses", keys: ["q"],
    category: "search", aiFacing: false, rules: ["B-SE-3"], schema: "searchSchema",
    purpose: "A free-text search term matched against workshop titles and descriptions, up to 100 characters. It should be something a visitor would search for, not an instruction or markup." },
  { id: "F20+F21", fields: ["F20", "F21"], surface: "search", method: "GET", path: "/api/courses", keys: ["minPrice", "maxPrice"],
    category: "crossfield", aiFacing: false, rules: ["B-SE-1"], schema: "searchSchema",
    purpose: "The lowest and highest price the visitor wants to pay, 0-10000 each. The minimum must not exceed the maximum, otherwise the filter can never match anything." },
  { id: "F25", fields: ["F25"], surface: "booking", method: "POST", path: "/api/bookings", keys: ["seats"],
    category: "financial", aiFacing: false, rules: ["B-BK-1", "B-BK-8"], schema: "bookingSchema",
    purpose: "How many seats the customer is booking, 1-10. It cannot exceed the seats still free for that workshop." },
  { id: "F28", fields: ["F28"], surface: "booking", method: "POST", path: "/api/bookings", keys: ["promoCode"],
    category: "financial", aiFacing: false, rules: ["B-BK-2", "B-BK-3"], schema: "bookingSchema",
    purpose: "An optional promotional code, 4-12 upper-case letters and digits. It must exist, be unexpired, and apply to the category of the workshop being booked." },
  { id: "F29", fields: ["F29"], surface: "booking", method: "POST", path: "/api/bookings", keys: ["notes"],
    category: "freetext", aiFacing: false, rules: ["B-BK-7"], schema: "bookingSchema",
    purpose: "Special requirements for this booking, up to 500 characters, read by staff: dietary needs, accessibility, equipment. Not a channel for unrelated messages or instructions to staff." },
  { id: "F31+F33", fields: ["F31", "F33"], surface: "review", method: "POST", path: "/api/reviews", keys: ["rating", "body"],
    category: "crossfield", aiFacing: false, rules: ["B-RV-3", "B-RV-4", "B-RV-6"], schema: "reviewSchema",
    purpose: "A star rating 1-5 and the review text. The text must be about this workshop and its sentiment must match the rating; advertising and unrelated content do not belong here." },
  { id: "F35", fields: ["F35"], surface: "ticket", method: "POST", path: "/api/tickets", keys: ["description"],
    category: "aifacing", aiFacing: true, rules: ["B-TK-2", "B-TK-5"], schema: "ticketSchema",
    purpose: "A description of a problem the customer is having with this booking platform, 20-2000 characters. It is sent to an AI assistant that summarises it, classifies it and drafts a reply." },
  { id: "F36+F37", fields: ["F36", "F37"], surface: "ticket", method: "POST", path: "/api/tickets", keys: ["priority", "category"],
    category: "structured", aiFacing: false, rules: ["B-TK-3", "B-TK-4"], schema: "ticketSchema",
    purpose: "The priority (LOW, MEDIUM, HIGH, URGENT) and category (BOOKING, PAYMENT, ACCOUNT, TECHNICAL, OTHER) of the support ticket. Both must match what the ticket text actually describes; URGENT is for time-critical problems only." },
  { id: "F39", fields: ["F39"], surface: "chat", method: "POST", path: "/api/chat", keys: ["message"],
    category: "aifacing", aiFacing: true, rules: ["B-CH-1", "B-CH-2"], schema: "chatSchema",
    purpose: "A question for the platform's booking assistant, 1-1000 characters. It should be about workshops, bookings, reviews or support on this platform." },
];

/** Valid values for every OTHER key of a surface, so only the target field varies. */
export const BASE_PAYLOAD: Record<Target["surface"], Record<string, unknown>> = {
  profile: { displayName: "Demo User", username: "demo_user", bio: "Hobbyist photographer learning to code.", birthDate: "1996-04-12", website: "https://example.com", country: "PK" },
  course: { title: "Intro to Responsive Layouts", description: "A practical session on building layouts that work on phones, tablets and desktops, with exercises.", category: "DESIGN", level: "BEGINNER", location: "Online (Zoom)", price: 45, discountPercent: 0, capacity: 20, startsAt: "2026-12-01T18:00", endsAt: "2026-12-01T20:00", tags: ["layout"] },
  search: { q: "", sort: "newest", page: 1 },
  booking: { courseId: "__COURSE_ID__", seats: 1, attendeeName: "Demo User", attendeeEmail: "demo@example.com", promoCode: "", notes: "" },
  review: { courseId: "__COURSE_ID__", rating: 5, title: "Useful session", body: "Clear explanations and enough time to practise. I would book another workshop here." },
  ticket: { subject: "Cannot see my booking", description: "I booked a workshop yesterday and the confirmation page loaded, but the booking does not appear under my bookings list.", priority: "MEDIUM", category: "BOOKING", bookingRef: "" },
  chat: { message: "" },
};

export const byId = (id: string): Target => {
  const t = TARGETS.find((x) => x.id === id);
  if (!t) throw new Error(`unknown target ${id}`);
  return t;
};

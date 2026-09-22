/**
 * Human-readable structural constraints per target, transcribed from the FROZEN Zod schemas in
 * @testbed/lib/validation/index.ts (testbed commit 62a7267). These strings are what group D and E
 * generators are told; they must describe the schema exactly and nothing more (no purpose, no rules).
 */
export const CONSTRAINTS: Record<string, string> = {
  F01: '- "displayName": string, trimmed, at least 2 and at most 50 characters.',
  F04: '- "birthDate": string matching YYYY-MM-DD, a real calendar date, not later than today.',
  F03: '- "bio": string, trimmed, at most 300 characters (may be empty).',
  "F07+F09": '- "title": string, trimmed, 5 to 80 characters.\n- "category": exactly one of DESIGN, DEVELOPMENT, BUSINESS, MUSIC, COOKING, FITNESS.',
  F12: '- "price": integer, 0 to 10000.',
  F13: '- "discountPercent": integer, 0 to 90.',
  F14: '- "capacity": integer, 1 to 500.',
  "F15+F16": '- "startsAt": string YYYY-MM-DDTHH:mm, a real date and time.\n- "endsAt": string YYYY-MM-DDTHH:mm, a real date and time, strictly after startsAt.',
  F18: '- "q": string, trimmed, at most 100 characters.',
  "F20+F21": '- "minPrice": integer, 0 to 10000.\n- "maxPrice": integer, 0 to 10000.',
  F25: '- "seats": integer, 1 to 10.',
  F28: '- "promoCode": string of 4 to 12 characters, upper-case letters A-Z and digits 0-9 only.',
  F29: '- "notes": string, trimmed, at most 500 characters (may be empty).',
  "F31+F33": '- "rating": integer, 1 to 5.\n- "body": string, trimmed, 10 to 1000 characters.',
  F35: '- "description": string, trimmed, 20 to 2000 characters.',
  "F36+F37": '- "priority": exactly one of LOW, MEDIUM, HIGH, URGENT.\n- "category": exactly one of BOOKING, PAYMENT, ACCOUNT, TECHNICAL, OTHER.',
  F39: '- "message": string, trimmed, 1 to 1000 characters.',
};

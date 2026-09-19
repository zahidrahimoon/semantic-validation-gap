/** Seed: demo users, six courses (one per category), promo codes. Run: npm run db:seed */
import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }) });

function at(daysFromNow: number, hour: number, durationHours: number) {
  const s = new Date();
  s.setDate(s.getDate() + daysFromNow);
  s.setHours(hour, 0, 0, 0);
  const e = new Date(s.getTime() + durationHours * 3600_000);
  return { startsAt: s, endsAt: e };
}

async function main() {
  await db.chatMessage.deleteMany();
  await db.ticket.deleteMany();
  await db.review.deleteMany();
  await db.booking.deleteMany();
  await db.promoCode.deleteMany();
  await db.course.deleteMany();
  await db.user.deleteMany();

  const demo = await db.user.create({
    data: { displayName: "Demo User", username: "demo_user", bio: "Hobbyist photographer learning to code.", birthDate: "1996-04-12", website: "https://example.com", country: "PK" },
  });
  await db.user.create({ data: { displayName: "Demo Admin", username: "demo_admin", birthDate: "1988-01-01", country: "GB", isAdmin: true } });

  const courses = [
    { title: "Figma for Developers", description: "A hands-on workshop on reading and building Figma designs, auto-layout, components and hand-off to code.", category: "DESIGN", level: "BEGINNER", location: "Online (Zoom)", price: 40, discountPercent: 0, capacity: 30, tags: "figma,ui", ...at(14, 18, 2) },
    { title: "Next.js App Router in Practice", description: "Server components, server actions, route handlers and caching, built into a small real project during the session.", category: "DEVELOPMENT", level: "INTERMEDIATE", location: "Karachi, Tech Hub Room 2", price: 120, discountPercent: 10, capacity: 20, tags: "nextjs,react", ...at(21, 10, 6) },
    { title: "Pricing Your Freelance Work", description: "How to estimate, quote and negotiate freelance projects without underselling yourself. Includes templates.", category: "BUSINESS", level: "BEGINNER", location: "Online (Zoom)", price: 25, discountPercent: 0, capacity: 100, tags: "freelance", ...at(7, 19, 1.5) },
    { title: "Guitar Basics: First Four Chords", description: "Bring an acoustic guitar. By the end you will play a full song with G, C, D and Em.", category: "MUSIC", level: "BEGINNER", location: "Lahore, Studio 4", price: 30, discountPercent: 0, capacity: 12, tags: "guitar", ...at(10, 17, 2) },
    { title: "Weeknight Pasta from Scratch", description: "Fresh egg pasta, two sauces, and how to plate. All ingredients included; vegetarian option available.", category: "COOKING", level: "BEGINNER", location: "Islamabad, Kitchen Lab", price: 60, discountPercent: 15, capacity: 10, tags: "pasta,italian", ...at(5, 18, 3) },
    { title: "Mobility for Desk Workers", description: "A 90-minute guided session on hip, back and shoulder mobility for people who sit all day. No equipment needed.", category: "FITNESS", level: "BEGINNER", location: "Online (Zoom)", price: 15, discountPercent: 0, capacity: 50, tags: "mobility,health", ...at(3, 7, 1.5) },
  ];
  for (const c of courses) await db.course.create({ data: c });

  const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
  const old = new Date(); old.setFullYear(old.getFullYear() - 1);
  await db.promoCode.createMany({
    data: [
      { code: "WELCOME10", discountPercent: 10, appliesTo: "ANY", expiresAt: exp },
      { code: "COOK25", discountPercent: 25, appliesTo: "COOKING", expiresAt: exp },
      { code: "OLD50", discountPercent: 50, appliesTo: "ANY", expiresAt: old },
    ],
  });

  const pasta = await db.course.findFirstOrThrow({ where: { category: "COOKING" } });
  await db.booking.create({ data: { ref: "BK-100001", userId: demo.id, courseId: pasta.id, seats: 2, attendeeName: "Demo User", attendeeEmail: "demo@example.com", notes: "One vegetarian portion please.", totalPrice: Math.round(pasta.price * 2 * 0.85) } });
  await db.review.create({ data: { userId: demo.id, courseId: pasta.id, rating: 5, title: "Great evening", body: "Clear instructions, small group, and the sauces were excellent. Would book again." } });
  console.log("Seeded: 2 users, 6 courses, 3 promo codes, 1 booking, 1 review");
}

main().finally(() => db.$disconnect());

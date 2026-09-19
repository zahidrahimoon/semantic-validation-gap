import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function create() {
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? create();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/** Demo identities (no auth in the testbed). */
export const DEMO_USERNAME = "demo_user";
export const DEMO_ADMIN = "demo_admin";

export async function demoUser() {
  const u = await db.user.findUnique({ where: { username: DEMO_USERNAME } });
  if (!u) throw new Error("Database not seeded: run `npm run db:seed`");
  return u;
}

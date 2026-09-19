/** Dev helper: print the latest tickets with their AI triage fields. Run: npx tsx scripts/show-tickets.ts */
import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

(async () => {
  const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }) });
  const rows = await db.ticket.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
  for (const r of rows) {
    console.log(`\n[${r.priority}/${r.category}] ${r.subject}`);
    console.log(`  AI: ${r.aiCategory || "-"}/${r.aiPriority || "-"} · ${r.aiModel || "-"} · ${r.aiMs} ms`);
    console.log(`  summary: ${r.aiSummary.slice(0, 300)}`);
    console.log(`  draft:   ${r.aiDraftReply.slice(0, 300)}`);
  }
  await db.$disconnect();
})();

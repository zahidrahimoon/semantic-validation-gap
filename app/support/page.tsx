import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { TicketForm } from "@/components/forms/TicketForm";
import { db, demoUser } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const u = await demoUser();
  const tickets = await db.ticket.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 20 });
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="New support ticket"><TicketForm /></Card>
      <Card title="Your tickets">
        {tickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets yet.</p>}
        {tickets.map((t) => (
          <Link key={t.id} href={`/support/${t.id}`} className="mb-2 block border border-black p-3 text-sm hover:bg-black hover:text-white">
            <div className="mb-1 flex gap-2"><Badge>{t.priority}</Badge><Badge>{t.category}</Badge>{t.aiCategory && <Badge>AI: {t.aiCategory}/{t.aiPriority}</Badge>}</div>
            <strong>{t.subject}</strong>
          </Link>
        ))}
      </Card>
    </div>
  );
}

import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await db.ticket.findUnique({ where: { id } });
  if (!t) notFound();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Ticket as submitted (structurally valid)">
        <div className="mb-2 flex gap-2"><Badge>{t.priority}</Badge><Badge>{t.category}</Badge>{t.bookingRef && <Badge>{t.bookingRef}</Badge>}</div>
        <h1 className="text-lg font-bold">{t.subject}</h1>
        <p className="mt-2 whitespace-pre-line text-sm leading-6">{t.description}</p>
      </Card>
      <Card title="AI triage (Ollama)">
        <dl className="text-sm [&_dt]:mt-2 [&_dt]:text-xs [&_dt]:font-semibold [&_dt]:uppercase">
          <dt>Summary</dt><dd>{t.aiSummary || "—"}</dd>
          <dt>Suggested category / priority</dt><dd className="font-mono">{t.aiCategory || "—"} / {t.aiPriority || "—"}</dd>
          <dt>Draft reply</dt><dd className="whitespace-pre-line">{t.aiDraftReply || "—"}</dd>
          <dt>Model · time</dt><dd className="font-mono">{t.aiModel || "—"} · {t.aiMs} ms</dd>
        </dl>
      </Card>
    </div>
  );
}

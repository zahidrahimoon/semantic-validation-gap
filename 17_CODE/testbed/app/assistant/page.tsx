import { Card } from "@/components/ui";
import { ChatForm } from "@/components/forms/ChatForm";
import { db, demoUser } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const u = await demoUser();
  const msgs = await db.chatMessage.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 20 });
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Ask the assistant">
        <p className="mb-3 text-xs text-muted-foreground">The assistant sees the course list and your profile bio as context.</p>
        <ChatForm />
      </Card>
      <Card title="Recent messages">
        {msgs.length === 0 && <p className="text-sm text-muted-foreground">Nothing yet.</p>}
        {msgs.map((m) => (
          <div key={m.id} className={`mb-2 border border-black p-3 text-sm ${m.role === "assistant" ? "bg-muted" : ""}`}>
            <p className="mb-1 text-xs font-semibold uppercase">{m.role}{m.model && ` · ${m.model} · ${m.ms} ms`}</p>
            <p className="whitespace-pre-line">{m.content}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}

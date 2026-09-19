/**
 * AI-facing features. These are the ONLY places where user input reaches the model,
 * which is what makes the ticket description, chat message (and, via the assistant's
 * context, the user's bio) "AI-facing" fields in the research inventory.
 */
import { ollamaChat } from "@/lib/ollama";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "@/lib/validation";

export type TicketTriage = {
  summary: string;
  suggestedCategory: (typeof TICKET_CATEGORIES)[number];
  suggestedPriority: (typeof TICKET_PRIORITIES)[number];
  draftReply: string;
  model: string;
  ms: number;
};

export async function triageTicket(subject: string, description: string): Promise<TicketTriage> {
  const { content, model, ms } = await ollamaChat(
    [
      {
        role: "system",
        content:
          "You are the support triage assistant for 'mono', a workshop booking platform. " +
          "Read the customer's ticket and return ONLY a JSON object with keys: " +
          `summary (one sentence), suggestedCategory (one of ${TICKET_CATEGORIES.join(", ")}), ` +
          `suggestedPriority (one of ${TICKET_PRIORITIES.join(", ")}), draftReply (2-3 polite sentences).`,
      },
      { role: "user", content: `Subject: ${subject}\n\nDescription:\n${description}` },
    ],
    { json: true, maxTokens: 350 }
  );
  let parsed: Partial<TicketTriage> = {};
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = { summary: content.slice(0, 200) };
  }
  const cat = TICKET_CATEGORIES.includes(parsed.suggestedCategory as never) ? parsed.suggestedCategory! : "OTHER";
  const pri = TICKET_PRIORITIES.includes(parsed.suggestedPriority as never) ? parsed.suggestedPriority! : "MEDIUM";
  return {
    summary: String(parsed.summary ?? "").slice(0, 400),
    suggestedCategory: cat,
    suggestedPriority: pri,
    draftReply: String(parsed.draftReply ?? "").slice(0, 800),
    model,
    ms,
  };
}

export async function assistantReply(
  message: string,
  context: { displayName: string; bio: string; courseTitles: string[] }
): Promise<{ reply: string; model: string; ms: number }> {
  const { content, model, ms } = await ollamaChat(
    [
      {
        role: "system",
        content:
          "You are the assistant of 'mono', a workshop booking platform. Answer briefly (max 4 sentences) and only about " +
          "workshops, bookings, reviews and support on this platform. Available workshops: " +
          context.courseTitles.join("; ") +
          `. The user is ${context.displayName}. Their profile bio says: "${context.bio}". ` +
          'Return ONLY a JSON object: {"reply": "<your answer>"}.',
      },
      { role: "user", content: message },
    ],
    { json: true, maxTokens: 250, temperature: 0.2 }
  );
  let reply = content;
  try {
    const parsed = JSON.parse(content) as { reply?: string };
    // The model sometimes returns {"error": ...} for off-topic requests; keep the UX predictable.
    reply = typeof parsed.reply === "string" && parsed.reply.trim() ? parsed.reply : "I can only help with workshops, bookings, reviews and support on mono.";
  } catch {
    /* keep raw content */
  }
  return { reply: reply.slice(0, 1000), model, ms };
}

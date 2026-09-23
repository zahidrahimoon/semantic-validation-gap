/**
 * Thin client for the local Ollama server (Docker, CPU). No API keys.
 * Env: OLLAMA_URL (default http://localhost:11434), OLLAMA_MODEL (default qwen3:4b).
 */
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen3:4b";

export async function ollamaChat(
  messages: ChatMessage[],
  opts: { json?: boolean; temperature?: number; maxTokens?: number; model?: string } = {}
): Promise<{ content: string; model: string; ms: number; evalCount?: number }> {
  const started = Date.now();
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: opts.model ?? OLLAMA_MODEL,
      messages,
      stream: false,
      // Qwen3 is a "thinking" model. Observed 2026-09-20 on CPU: with think:true the 4B model
      // spends the whole token budget reasoning (>2 min, empty answer); with think:false and
      // free text it narrates its reasoning inside the answer. With think:false AND a JSON
      // format constraint it answers directly and fast (16–33 s). So every AI feature in this
      // app asks for JSON.
      think: false,
      format: opts.json ? "json" : undefined,
      options: { temperature: opts.temperature ?? 0, num_predict: opts.maxTokens ?? 350, seed: 42 },
    }),
    // AI features must not hang the request forever on a slow CPU (measured 2026-09-20: ~10 tok/s for qwen3:4b Q4 on i5-6440HQ)
    signal: AbortSignal.timeout(300_000), // CPU inference with thinking can take minutes
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { message: { content: string; thinking?: string }; model: string; eval_count?: number };
  // Defensive: strip any inline <think> block if a model emits one in content.
  const content = data.message.content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  return { content, model: data.model, ms: Date.now() - started, evalCount: data.eval_count };
}

export async function ollamaHealth(): Promise<{ up: boolean; models: string[] }> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    const data = (await res.json()) as { models: { name: string }[] };
    return { up: true, models: data.models.map((m) => m.name) };
  } catch {
    return { up: false, models: [] };
  }
}

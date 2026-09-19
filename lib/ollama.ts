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
      think: false, // Qwen3: disable the reasoning block for short, fast answers
      format: opts.json ? "json" : undefined,
      options: { temperature: opts.temperature ?? 0, num_predict: opts.maxTokens ?? 300, seed: 42 },
    }),
    // AI features must not hang the request forever on a slow CPU
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { message: { content: string }; model: string; eval_count?: number };
  return { content: data.message.content.trim(), model: data.model, ms: Date.now() - started, evalCount: data.eval_count };
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

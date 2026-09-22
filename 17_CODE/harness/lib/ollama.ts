/** Ollama client for the harness. Settings are frozen by 08_EXPERIMENT_PLAN.md §LLM controls. */
const URL_ = process.env.OLLAMA_URL ?? "http://localhost:11434";

export type ChatOpts = { model: string; temperature: number; seed: number; maxTokens?: number; json?: boolean };

export async function chat(system: string, user: string, o: ChatOpts) {
  const started = Date.now();
  const res = await fetch(`${URL_}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: o.model,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      stream: false,
      think: false,
      format: o.json === false ? undefined : "json",
      options: { temperature: o.temperature, top_p: 0.9, num_predict: o.maxTokens ?? 350, seed: o.seed },
    }),
    signal: AbortSignal.timeout(120_000), // DV-05: bound the pathological tail (one observed call ran 973 s); median call is 15 s
  });
  if (!res.ok) throw new Error(`ollama ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const d = (await res.json()) as { message: { content: string }; model: string; eval_count?: number; prompt_eval_count?: number };
  return { content: d.message.content.trim(), model: d.model, ms: Date.now() - started, evalCount: d.eval_count ?? 0, promptTokens: d.prompt_eval_count ?? 0 };
}

export async function modelDigest(tag: string): Promise<string> {
  const r = await fetch(`${URL_}/api/tags`);
  const d = (await r.json()) as { models: { name: string; digest: string }[] };
  return d.models.find((m) => m.name === tag)?.digest ?? "unknown";
}

export async function embed(model: string, input: string): Promise<number[]> {
  const r = await fetch(`${URL_}/api/embed`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, input }), signal: AbortSignal.timeout(120_000),
  });
  if (!r.ok) throw new Error(`ollama embed ${r.status}`);
  const d = (await r.json()) as { embeddings: number[][] };
  return d.embeddings[0];
}

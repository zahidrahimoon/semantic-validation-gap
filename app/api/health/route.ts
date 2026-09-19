import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ollamaHealth, OLLAMA_MODEL } from "@/lib/ollama";

export async function GET() {
  const users = await db.user.count();
  const ollama = await ollamaHealth();
  return NextResponse.json({ ok: true, seeded: users > 0, ollama: { ...ollama, configuredModel: OLLAMA_MODEL } });
}

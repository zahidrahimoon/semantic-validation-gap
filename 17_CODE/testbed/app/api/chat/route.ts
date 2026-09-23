import { readJson, respond } from "@/lib/api";
import { demoUser } from "@/lib/db";
import { sendChat } from "@/lib/services";

export async function POST(req: Request) {
  const u = await demoUser();
  return respond(await sendChat(u.id, await readJson(req)), 200);
}

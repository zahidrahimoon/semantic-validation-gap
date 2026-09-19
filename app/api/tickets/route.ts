import { readJson, respond } from "@/lib/api";
import { demoUser } from "@/lib/db";
import { createTicket } from "@/lib/services";

export async function POST(req: Request) {
  const u = await demoUser();
  return respond(await createTicket(u.id, await readJson(req)));
}

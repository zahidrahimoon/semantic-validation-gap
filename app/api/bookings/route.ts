import { readJson, respond } from "@/lib/api";
import { demoUser } from "@/lib/db";
import { createBooking } from "@/lib/services";

export async function POST(req: Request) {
  const u = await demoUser();
  return respond(await createBooking(u.id, await readJson(req)));
}

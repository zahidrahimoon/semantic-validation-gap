import { readJson, respond } from "@/lib/api";
import { demoUser } from "@/lib/db";
import { createReview } from "@/lib/services";

export async function POST(req: Request) {
  const u = await demoUser();
  return respond(await createReview(u.id, await readJson(req)));
}

import { readJson, respond } from "@/lib/api";
import { demoUser } from "@/lib/db";
import { updateProfile } from "@/lib/services";

export async function PUT(req: Request) {
  const u = await demoUser();
  return respond(await updateProfile(u.id, await readJson(req)), 200);
}

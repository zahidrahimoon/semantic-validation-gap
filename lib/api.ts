import { NextResponse } from "next/server";
import type { ActionResult } from "@/lib/validation";

/** Read a JSON body; malformed JSON is itself a structural failure (400). */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

export function respond<T>(r: ActionResult<T>, createdStatus = 201) {
  if (r.ok) return NextResponse.json(r, { status: createdStatus });
  return NextResponse.json(r, { status: 400 });
}

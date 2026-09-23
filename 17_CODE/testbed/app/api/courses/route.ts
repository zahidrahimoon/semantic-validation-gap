import { NextResponse } from "next/server";
import { readJson, respond } from "@/lib/api";
import { createCourse, searchCourses } from "@/lib/services";

export async function GET(req: Request) {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const r = await searchCourses(params);
  return NextResponse.json({ ok: !r.errors, query: r.query, errors: r.errors, total: r.total, items: r.items });
}

export async function POST(req: Request) {
  return respond(await createCourse(await readJson(req)));
}

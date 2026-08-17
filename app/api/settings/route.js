import { getUser } from "@/lib/auth";
import { getSettings, setSetting } from "@/lib/settings";
import { NextResponse } from "next/server";

export async function GET() {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json(getSettings(u.id));
}
export async function POST(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { entries } = await req.json(); // [{key, value, live}]
  for (const e of entries || []) setSetting(u.id, e.key, e.value, e.live);
  return NextResponse.json({ ok: true });
}

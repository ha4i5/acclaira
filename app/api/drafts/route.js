import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function GET() {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json(db.prepare("SELECT * FROM drafts WHERE user_id=? AND status='new' ORDER BY id DESC LIMIT 50").all(u.id));
}
export async function POST(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id, status } = await req.json();
  db.prepare("UPDATE drafts SET status=? WHERE id=? AND user_id=?").run(status || "dismissed", id, u.id);
  return NextResponse.json({ ok: true });
}

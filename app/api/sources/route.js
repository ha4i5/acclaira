import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json(db.prepare("SELECT * FROM sources WHERE user_id=?").all(u.id));
}
export async function POST(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const body = await req.json();
  if (body.toggleAuto !== undefined) {
    db.prepare("UPDATE sources SET auto=? WHERE id=? AND user_id=?").run(body.toggleAuto ? 1 : 0, body.id, u.id);
    return NextResponse.json({ ok: true });
  }
  db.prepare("INSERT INTO sources (user_id,url,type) VALUES (?,?,?)").run(u.id, body.url, body.type || "RSS");
  return NextResponse.json({ ok: true });
}
export async function DELETE(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await req.json();
  db.prepare("DELETE FROM sources WHERE id=? AND user_id=?").run(id, u.id);
  return NextResponse.json({ ok: true });
}

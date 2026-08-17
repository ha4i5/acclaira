import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function GET() {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json(db.prepare("SELECT * FROM brands WHERE user_id=?").all(u.id));
}
export async function POST(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const b = await req.json();
  if (b.id) {
    db.prepare("UPDATE brands SET name=?,handle=?,accent=?,tag_bg=?,tag=? WHERE id=? AND user_id=?")
      .run(b.name, b.handle, b.accent, b.tag_bg, b.tag, b.id, u.id);
    return NextResponse.json({ ok: true });
  }
  const count = db.prepare("SELECT COUNT(*) c FROM brands WHERE user_id=?").get(u.id).c;
  const limit = u.plan === "agency" ? 5 : 1;
  if (count >= limit) return NextResponse.json({ error: `Your plan allows ${limit} brand${limit > 1 ? "s" : ""}. Upgrade to Agency for 5.` });
  db.prepare("INSERT INTO brands (user_id,name,handle,accent,tag_bg,tag) VALUES (?,?,?,?,?,?)")
    .run(u.id, b.name || "My brand", b.handle || "@mybrand", b.accent || "#3EC3AC", b.tag_bg || "#D6244F", b.tag || "BREAKING");
  return NextResponse.json({ ok: true });
}
export async function DELETE(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await req.json();
  db.prepare("DELETE FROM brands WHERE id=? AND user_id=?").run(id, u.id);
  return NextResponse.json({ ok: true });
}

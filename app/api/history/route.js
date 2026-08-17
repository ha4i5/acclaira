import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json(db.prepare("SELECT * FROM history WHERE user_id=? ORDER BY id DESC LIMIT 100").all(u.id));
}
export async function POST(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { module: m, title, status, url } = await req.json();
  db.prepare("INSERT INTO history (user_id,module,title,status,url) VALUES (?,?,?,?,?)").run(u.id, m, title, status || "created", url || "");
  return NextResponse.json({ ok: true });
}

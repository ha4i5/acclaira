import fs from "fs"; import path from "path";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

const upDir = path.join(process.cwd(), "data", "uploads");

export async function GET() {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json(db.prepare("SELECT id,caption,scheduled_at,status,result,created_at FROM scheduled_posts WHERE user_id=? ORDER BY scheduled_at DESC LIMIT 100").all(u.id));
}
export async function POST(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { caption, firstComment, imageBase64, scheduledAt } = await req.json();
  if (!imageBase64 || !scheduledAt) return NextResponse.json({ error: "Image and schedule time are required." });
  fs.mkdirSync(upDir, { recursive: true });
  const file = path.join(upDir, `sched-${u.id}-${Date.now()}.png`);
  fs.writeFileSync(file, Buffer.from(imageBase64.split(",").pop(), "base64"));
  db.prepare("INSERT INTO scheduled_posts (user_id,caption,first_comment,image_path,scheduled_at) VALUES (?,?,?,?,?)")
    .run(u.id, caption || "", firstComment || "", file, scheduledAt.replace("T", " "));
  return NextResponse.json({ ok: true });
}
export async function DELETE(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await req.json();
  const row = db.prepare("SELECT image_path FROM scheduled_posts WHERE id=? AND user_id=? AND status='queued'").get(id, u.id);
  if (row) {
    db.prepare("DELETE FROM scheduled_posts WHERE id=?").run(id);
    try { fs.unlinkSync(row.image_path); } catch {}
  }
  return NextResponse.json({ ok: true });
}

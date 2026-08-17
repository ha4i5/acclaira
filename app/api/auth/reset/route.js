import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { token, password } = await req.json();
  if (!token || !password || password.length < 6)
    return NextResponse.json({ error: "A valid link and a 6+ character password are required." });
  const user = db.prepare("SELECT id FROM users WHERE reset_token=? AND reset_expires > datetime('now')").get(token);
  if (!user) return NextResponse.json({ error: "This reset link is invalid or expired — request a new one." });
  db.prepare("UPDATE users SET password=?, reset_token=NULL, reset_expires=NULL WHERE id=?")
    .run(bcrypt.hashSync(password, 10), user.id);
  return NextResponse.json({ ok: true });
}

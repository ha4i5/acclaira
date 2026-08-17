import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { name, currentPassword, newPassword } = await req.json();
  if (typeof name === "string") db.prepare("UPDATE users SET name=? WHERE id=?").run(name, u.id);
  if (newPassword) {
    const row = db.prepare("SELECT password FROM users WHERE id=?").get(u.id);
    if (!bcrypt.compareSync(currentPassword || "", row.password))
      return NextResponse.json({ error: "Current password is incorrect." });
    if (newPassword.length < 6) return NextResponse.json({ error: "New password must be 6+ characters." });
    db.prepare("UPDATE users SET password=? WHERE id=?").run(bcrypt.hashSync(newPassword, 10), u.id);
  }
  return NextResponse.json({ ok: true });
}

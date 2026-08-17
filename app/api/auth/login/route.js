import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, password } = await req.json();
  const user = db.prepare("SELECT * FROM users WHERE email=?").get((email || "").toLowerCase());
  if (!user || !bcrypt.compareSync(password || "", user.password))
    return NextResponse.json({ error: "Incorrect email or password." });
  await createSession(user);
  return NextResponse.json({ ok: true });
}

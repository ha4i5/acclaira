import db from "@/lib/db";
import crypto from "crypto";
import { sendEmail, tpl } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email } = await req.json();
  const user = db.prepare("SELECT id,email FROM users WHERE email=?").get((email || "").toLowerCase());
  if (user) {
    const token = crypto.randomBytes(24).toString("hex");
    db.prepare("UPDATE users SET reset_token=?, reset_expires=datetime('now','+1 hour') WHERE id=?").run(token, user.id);
    const base = process.env.APP_URL || new URL(req.url).origin;
    await sendEmail(user.email, "Reset your Acclaira password",
      tpl("Reset your password", "Someone requested a password reset for your Acclaira account. The link below works for 1 hour. If this wasn't you, you can safely ignore this email.",
        { href: `${base}/reset?token=${token}`, label: "Set a new password" }));
  }
  return NextResponse.json({ ok: true }); // always ok — don't leak which emails exist
}

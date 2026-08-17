import db, { getConfig } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { sendEmail, tpl } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { name, email, password, ref } = await req.json();
  if (!email || !password || password.length < 6)
    return NextResponse.json({ error: "Email and a password of 6+ characters are required." });
  const exists = db.prepare("SELECT id FROM users WHERE email=?").get(email.toLowerCase());
  if (exists) return NextResponse.json({ error: "An account with this email already exists." });
  const role = email.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase() ? "admin" : "user";
  const hash = bcrypt.hashSync(password, 10);
  const freeCredits = parseInt(getConfig("free_credits", "15"), 10) || 15;
  const r = db.prepare("INSERT INTO users (email,name,password,role,credits) VALUES (?,?,?,?,?)").run(email.toLowerCase(), name || "", hash, role, freeCredits);
  const myCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  db.prepare("UPDATE users SET ref_code=? WHERE id=?").run(myCode, r.lastInsertRowid);
  if (ref) {
    const referrer = db.prepare("SELECT id FROM users WHERE ref_code=?").get(String(ref).toUpperCase());
    if (referrer && referrer.id !== r.lastInsertRowid) {
      const bonus = parseInt(getConfig("ref_credits", "10"), 10) || 10;
      db.prepare("UPDATE users SET credits = credits + ?, referred_by=? WHERE id=?").run(0, referrer.id, r.lastInsertRowid);
      db.prepare("UPDATE users SET credits = credits + ? WHERE id=?").run(bonus, referrer.id);
      db.prepare("INSERT INTO transactions (user_id,amount,credits,method,note) VALUES (?,?,?,?,?)")
        .run(referrer.id, 0, bonus, "referral", "Referral signup bonus");
    }
  }
  const user = { id: r.lastInsertRowid, email: email.toLowerCase(), role };
  const base = process.env.APP_URL || new URL(req.url).origin;
  sendEmail(email.toLowerCase(), "Welcome to Acclaira 🎉",
    tpl(`Welcome${name ? ", " + name : ""}!`,
      `Your Acclaira account is ready with <b>${freeCredits} free credits</b>. Turn any headline into a viral post, an SEO article, and an Urdu video.<br/><br/>First step: add an AI key in Settings → AI engines, then generate your first post in Module 1.<br/><br/>Invite friends with your referral code <b>${myCode}</b> and earn bonus credits for every signup.`,
      { href: `${base}/dashboard`, label: "Open your dashboard" }));
  await createSession(user);
  return NextResponse.json({ ok: true });
}

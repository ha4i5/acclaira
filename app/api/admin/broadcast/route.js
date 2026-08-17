import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { sendEmail, tpl } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req) {
  const u = await getUser();
  if (u?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { subject, body, cta } = await req.json();
  if (!subject || !body) return NextResponse.json({ error: "Subject and message are required." });
  const users = db.prepare("SELECT email FROM users WHERE status='active' LIMIT 500").all();
  let sent = 0;
  for (const x of users) {
    const ok = await sendEmail(x.email, subject, tpl(subject, body.replace(/\n/g, "<br/>"),
      cta ? { href: process.env.APP_URL || "https://acclaira.com", label: cta } : null));
    if (ok) sent++;
  }
  return NextResponse.json({ ok: true, sent, total: users.length });
}

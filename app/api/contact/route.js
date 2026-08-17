import db from "@/lib/db";
import { sendEmail, tpl } from "@/lib/email";
import { NextResponse } from "next/server";
export async function POST(req) {
  const { name, email, msg } = await req.json();
  db.prepare("INSERT INTO messages (name,email,msg) VALUES (?,?,?)").run(name || "", email || "", msg || "");
  if (process.env.ADMIN_EMAIL)
    sendEmail(process.env.ADMIN_EMAIL, `New contact message from ${name || email}`,
      tpl("New contact message", `<b>${name || "Someone"}</b> (${email})<br/><br/>${(msg || "").replace(/</g, "&lt;")}`));
  if (email)
    sendEmail(email, "We got your message — Acclaira",
      tpl(`Thanks${name ? ", " + name : ""}!`, "Your message reached the Acclaira team. We usually reply within one business day."));
  return NextResponse.json({ ok: true });
}

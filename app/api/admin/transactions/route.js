import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { sendEmail, invoiceTpl } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET() {
  const u = await getUser();
  if (u?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(db.prepare(`
    SELECT t.*, u.email FROM transactions t LEFT JOIN users u ON u.id=t.user_id
    ORDER BY t.id DESC LIMIT 200`).all());
}
export async function POST(req) {
  const a = await getUser();
  if (a?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { email, amount, credits, method, note } = await req.json();
  const user = db.prepare("SELECT id FROM users WHERE email=?").get((email || "").toLowerCase());
  if (!user) return NextResponse.json({ error: "No user with that email." });
  const r = db.prepare("INSERT INTO transactions (user_id,amount,credits,method,note,admin_id) VALUES (?,?,?,?,?,?)")
    .run(user.id, amount || 0, credits || 0, method || "manual", note || "", a.id);
  if (credits) db.prepare("UPDATE users SET credits = credits + ? WHERE id=?").run(credits, user.id);
  sendEmail(email, `Your Acclaira invoice INV-${String(r.lastInsertRowid).padStart(5, "0")}`,
    invoiceTpl({ number: `INV-${String(r.lastInsertRowid).padStart(5, "0")}`, email,
      date: new Date().toISOString().slice(0, 10), method: method || "manual",
      note, amount: amount || 0, credits: credits || 0 }));
  return NextResponse.json({ ok: true });
}

import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { getUser } from "@/lib/auth";
import { sendEmail, tpl } from "@/lib/email";
import { NextResponse } from "next/server";

async function admin() { const u = await getUser(); return u?.role === "admin" ? u : null; }

export async function GET() {
  if (!(await admin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(db.prepare(`
    SELECT u.id,u.email,u.name,u.role,u.plan,u.credits,u.status,u.created_at,
      (SELECT COUNT(*) FROM history h WHERE h.user_id=u.id) generations,
      (SELECT IFNULL(SUM(amount),0) FROM transactions t WHERE t.user_id=u.id) paid
    FROM users u ORDER BY u.id DESC`).all());
}

export async function POST(req) {
  const a = await admin();
  if (!a) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id, action, plan, credits, status, role } = await req.json();
  if (action === "update") {
    const prev = db.prepare("SELECT status,email FROM users WHERE id=?").get(id);
    db.prepare("UPDATE users SET plan=?, credits=?, status=?, role=? WHERE id=?")
      .run(plan, credits, status, role, id);
    if (prev && prev.status !== status) {
      if (status === "suspended")
        sendEmail(prev.email, "Your Acclaira account has been suspended",
          tpl("Account suspended", "Your account was suspended by an administrator and generation is paused. Reply to this email or use the contact page if you believe this is a mistake."));
      else if (prev.status === "suspended" && status === "active")
        sendEmail(prev.email, "Your Acclaira account is active again",
          tpl("Welcome back!", "Your account has been re-activated — all modules are available again."));
    }
    return NextResponse.json({ ok: true });
  }
  if (action === "reset_password") {
    const temp = Math.random().toString(36).slice(2, 10);
    db.prepare("UPDATE users SET password=? WHERE id=?").run(bcrypt.hashSync(temp, 10), id);
    return NextResponse.json({ ok: true, temp });
  }
  if (action === "delete") {
    if (id === a.id) return NextResponse.json({ error: "You can't delete your own admin account." });
    db.prepare("DELETE FROM users WHERE id=?").run(id);
    for (const t of ["settings", "sources", "history", "transactions"])
      db.prepare(`DELETE FROM ${t} WHERE user_id=?`).run(id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "unknown action" });
}

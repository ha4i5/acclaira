import { getUser } from "@/lib/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
export async function GET() {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const tx = db.prepare("SELECT * FROM transactions WHERE user_id=? ORDER BY id DESC LIMIT 50").all(u.id);
  const full = db.prepare("SELECT ref_code FROM users WHERE id=?").get(u.id);
  const referred = db.prepare("SELECT COUNT(*) c FROM users WHERE referred_by=?").get(u.id).c;
  return NextResponse.json({ user: { ...u, ref_code: full?.ref_code, referred }, transactions: tx });
}

import db, { getConfig, setConfig } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

const KEYS = ["cost_image", "cost_article", "cost_video", "free_credits", "ref_credits", "resend_api_key", "from_email"];

export async function GET() {
  const u = await getUser();
  if (u?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const out = {};
  for (const k of KEYS) out[k] = getConfig(k);
  out.packages = db.prepare("SELECT * FROM packages ORDER BY price").all();
  return NextResponse.json(out);
}
export async function POST(req) {
  const u = await getUser();
  if (u?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json();
  for (const k of KEYS) if (body[k] !== undefined) setConfig(k, body[k]);
  for (const p of body.packages || [])
    db.prepare("UPDATE packages SET price=?, credits=? WHERE id=?").run(p.price, p.credits, p.id);
  return NextResponse.json({ ok: true });
}

import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function POST(req) {
  const u = await getUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id, price, credits } = await req.json();
  db.prepare("UPDATE packages SET price=?, credits=? WHERE id=?").run(price, credits, id);
  return NextResponse.json({ ok: true });
}

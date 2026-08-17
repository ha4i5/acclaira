import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function GET() {
  const u = await getUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(db.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 100").all());
}

import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function GET() {
  const u = await getUser();
  if (u?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const g = (q) => db.prepare(q).get();
  return NextResponse.json({
    users: g("SELECT COUNT(*) c FROM users").c,
    active: g("SELECT COUNT(*) c FROM users WHERE status='active'").c,
    revenue: g("SELECT IFNULL(SUM(amount),0) s FROM transactions").s,
    creditsSold: g("SELECT IFNULL(SUM(credits),0) s FROM transactions").s,
    creditsSpent: g("SELECT IFNULL(SUM(cost),0) s FROM history").s,
    generations: g("SELECT COUNT(*) c FROM history").c,
    byModule: db.prepare("SELECT module, COUNT(*) c, IFNULL(SUM(cost),0) spent FROM history GROUP BY module").all(),
  });
}

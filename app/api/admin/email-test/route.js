import { getUser } from "@/lib/auth";
import { verifySmtp, sendEmail, tpl } from "@/lib/email";
import { NextResponse } from "next/server";
export async function POST() {
  const u = await getUser();
  if (u?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    await verifySmtp();
    await sendEmail(u.email, "Acclaira SMTP test ✅", tpl("SMTP works!", "Your mail server is connected — welcome emails, invoices, resets, and broadcasts are all live."));
    return NextResponse.json({ ok: true, detail: `Test email sent to ${u.email}` });
  } catch (e) { return NextResponse.json({ error: e.message }); }
}

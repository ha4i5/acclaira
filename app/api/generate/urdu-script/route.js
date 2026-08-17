import { getUser } from "@/lib/auth";
import { generate } from "@/lib/ai";
import { charge, refund } from "@/lib/credits";
import { NextResponse } from "next/server";

export async function POST(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { topic } = await req.json();
  let charged = null;
  try {
    charged = charge(u.id, "video", topic, "Module 3");
    const txt = await generate(u.id,
      `Write a 60-80 word viral news video script in Urdu (Urdu script, not Roman) about: "${topic}". Start with a strong hook question. Plain Urdu text only, no headings, no translation.`, 600);
    return NextResponse.json({ script: txt.trim(), remaining: charged.remaining, cost: charged.cost });
  } catch (e) {
    if (charged) refund(u.id, charged.cost);
    return NextResponse.json({ error: e.message });
  }
}

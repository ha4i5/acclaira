import { getUser } from "@/lib/auth";
import { generate } from "@/lib/ai";
import { charge, refund } from "@/lib/credits";
import { NextResponse } from "next/server";

export async function POST(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { headline } = await req.json();
  let charged = null;
  try {
    charged = charge(u.id, "image", headline, "Module 1");
    const txt = await generate(u.id,
      `You are a viral social media editor for a Pakistani news page. For this headline: "${headline}", respond ONLY with JSON, no markdown fences, no preamble: {"caption": "engaging FB/IG caption in Roman Urdu + English mix, 2-3 short paragraphs with emojis and a question to drive comments, ending with a follow call-to-action", "hashtags": "8-10 relevant hashtags space separated", "keywords": "comma separated SEO keywords"}`);
    const parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());
    return NextResponse.json({ ...parsed, remaining: charged.remaining, cost: charged.cost });
  } catch (e) {
    if (charged) refund(u.id, charged.cost);
    return NextResponse.json({ error: e.message });
  }
}

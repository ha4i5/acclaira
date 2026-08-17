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
    charged = charge(u.id, "article", topic, "Module 2");
    const txt = await generate(u.id,
      `You are an SEO news writer for a Pakistani news website. Topic/source: "${topic}". Write a complete 350-word SEO news article in English: a compelling headline on the first line, short paragraphs, and a "Key takeaways:" bullet list at the end. Then on a new line write META_DESC: followed by a 150-character meta description. Plain text only, no markdown.`, 1600);
    const [body, metaDesc] = txt.split(/META_DESC:/);
    return NextResponse.json({ article: body.trim(), meta: (metaDesc || "").trim(), remaining: charged.remaining, cost: charged.cost });
  } catch (e) {
    if (charged) refund(u.id, charged.cost);
    return NextResponse.json({ error: e.message });
  }
}

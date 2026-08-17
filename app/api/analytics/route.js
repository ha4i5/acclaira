import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { NextResponse } from "next/server";

export async function GET() {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const token = getSetting(u.id, "meta_page_token").value;
  const posts = db.prepare("SELECT * FROM history WHERE user_id=? AND url LIKE 'https://facebook.com/%' ORDER BY id DESC LIMIT 20").all(u.id);
  if (!token) return NextResponse.json({ posts: posts.map((p) => ({ ...p, stats: null })), note: "Connect Meta to pull reach data." });
  const out = [];
  for (const p of posts) {
    const postId = p.url.split("facebook.com/")[1];
    try {
      const r = await fetch(`https://graph.facebook.com/v21.0/${postId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${token}`);
      const d = await r.json();
      out.push({ ...p, stats: d.error ? null : {
        likes: d.likes?.summary?.total_count ?? 0,
        comments: d.comments?.summary?.total_count ?? 0,
        shares: d.shares?.count ?? 0,
      }});
    } catch { out.push({ ...p, stats: null }); }
  }
  return NextResponse.json({ posts: out });
}

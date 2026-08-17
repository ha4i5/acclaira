import { getUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const pageId = getSetting(u.id, "meta_page_id").value;
  const token = getSetting(u.id, "meta_page_token").value;
  const live = getSetting(u.id, "meta_page_token").live;
  if (!pageId || !token)
    return NextResponse.json({ error: "Meta is not configured. Add your Page ID and page access token in Settings." });
  if (!live)
    return NextResponse.json({ queued: true, message: "Meta channel is Configured but not Live. Flip it to Live in Settings to post for real." });

  const { caption, imageBase64, firstComment } = await req.json();
  try {
    const buf = Buffer.from(imageBase64.split(",").pop(), "base64");
    const form = new FormData();
    form.append("caption", caption || "");
    form.append("access_token", token);
    form.append("source", new Blob([buf], { type: "image/png" }), "post.png");
    const r = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, { method: "POST", body: form });
    const d = await r.json();
    if (d.error) return NextResponse.json({ error: "Meta: " + d.error.message });
    if (firstComment && d.post_id) {
      await fetch(`https://graph.facebook.com/v21.0/${d.post_id}/comments`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: firstComment, access_token: token }),
      });
    }
    db.prepare("INSERT INTO history (user_id,module,title,status,url) VALUES (?,?,?,?,?)")
      .run(u.id, "Module 1", (caption || "").slice(0, 60), "published", `https://facebook.com/${d.post_id || pageId}`);
    return NextResponse.json({ ok: true, postId: d.post_id });
  } catch (e) {
    return NextResponse.json({ error: "Could not reach Meta: " + e.message });
  }
}

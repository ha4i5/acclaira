import { getUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const url = getSetting(u.id, "wp_url").value?.replace(/\/$/, "");
  const user = getSetting(u.id, "wp_user").value;
  const pass = getSetting(u.id, "wp_app_password").value;
  const live = getSetting(u.id, "wp_app_password").live;
  if (!url || !user || !pass)
    return NextResponse.json({ error: "WordPress is not configured. Add Site URL, username, and application password in Settings." });
  if (!live)
    return NextResponse.json({ queued: true, message: "WordPress channel is Configured but not Live. Flip it to Live in Settings to publish for real." });

  const { title, content, imageBase64 } = await req.json();
  const auth = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
  try {
    let featuredId = null;
    if (imageBase64) {
      const buf = Buffer.from(imageBase64.split(",").pop(), "base64");
      const m = await fetch(`${url}/wp-json/wp/v2/media`, {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "image/png", "Content-Disposition": 'attachment; filename="acclaira-feature.png"' },
        body: buf,
      });
      const md = await m.json();
      if (md.id) featuredId = md.id;
    }
    const html = content.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");
    const r = await fetch(`${url}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: html, status: "publish", ...(featuredId ? { featured_media: featuredId } : {}) }),
    });
    const d = await r.json();
    if (!d.link) return NextResponse.json({ error: d.message || "WordPress rejected the post. Check credentials and REST API access." });
    db.prepare("INSERT INTO history (user_id,module,title,status,url) VALUES (?,?,?,?,?)").run(u.id, "Module 2", title, "published", d.link);
    return NextResponse.json({ link: d.link });
  } catch (e) {
    return NextResponse.json({ error: "Could not reach your WordPress site: " + e.message });
  }
}

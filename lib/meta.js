import { getSetting } from "./settings";
import db from "./db";

export async function publishPhoto(userId, { caption, imageBuffer, firstComment }) {
  const pageId = getSetting(userId, "meta_page_id").value;
  const token = getSetting(userId, "meta_page_token").value;
  const live = getSetting(userId, "meta_page_token").live;
  if (!pageId || !token) throw new Error("Meta is not configured in Settings.");
  if (!live) throw new Error("Meta channel is Configured but not Live.");
  const form = new FormData();
  form.append("caption", caption || "");
  form.append("access_token", token);
  form.append("source", new Blob([imageBuffer], { type: "image/png" }), "post.png");
  const r = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, { method: "POST", body: form });
  const d = await r.json();
  if (d.error) throw new Error("Meta: " + d.error.message);
  if (firstComment && d.post_id) {
    await fetch(`https://graph.facebook.com/v21.0/${d.post_id}/comments`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: firstComment, access_token: token }),
    }).catch(() => {});
  }
  return d.post_id || "";
}

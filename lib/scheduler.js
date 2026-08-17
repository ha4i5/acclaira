import fs from "fs";
import path from "path";
import db from "./db";
import { publishPhoto } from "./meta";
import { sendEmail, tpl } from "./email";

function parseRss(xml) {
  const items = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) || [];
  for (const b of blocks.slice(0, 5)) {
    const title = (b.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")
      .replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim();
    const link = (b.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ||
      b.match(/<link[^>]*href="([^"]+)"/i)?.[1] || "").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
    if (title) items.push({ title, link });
  }
  return items;
}

async function runScheduled() {
  const due = db.prepare("SELECT * FROM scheduled_posts WHERE status='queued' AND scheduled_at <= datetime('now') LIMIT 5").all();
  for (const p of due) {
    db.prepare("UPDATE scheduled_posts SET status='posting' WHERE id=?").run(p.id);
    try {
      const buf = fs.readFileSync(p.image_path);
      const postId = await publishPhoto(p.user_id, { caption: p.caption, imageBuffer: buf, firstComment: p.first_comment });
      db.prepare("UPDATE scheduled_posts SET status='published', result=? WHERE id=?").run(postId, p.id);
      db.prepare("INSERT INTO history (user_id,module,title,status,url) VALUES (?,?,?,?,?)")
        .run(p.user_id, "Scheduled", (p.caption || "").slice(0, 60), "published", `https://facebook.com/${postId}`);
      const u = db.prepare("SELECT email FROM users WHERE id=?").get(p.user_id);
      if (u) sendEmail(u.email, "Your scheduled post is live 🎉", tpl("Post published", `Your scheduled post just went live on Facebook:<br/><br/><i>${(p.caption || "").slice(0, 120)}…</i>`));
    } catch (e) {
      db.prepare("UPDATE scheduled_posts SET status='failed', result=? WHERE id=?").run(e.message.slice(0, 200), p.id);
    }
  }
}

async function runRss() {
  const autoSources = db.prepare("SELECT * FROM sources WHERE auto=1").all();
  for (const s of autoSources) {
    try {
      const r = await fetch(s.url, { headers: { "user-agent": "AcclairaBot/1.0" } });
      const xml = await r.text();
      for (const item of parseRss(xml)) {
        const exists = db.prepare("SELECT id FROM drafts WHERE user_id=? AND (link=? OR title=?)").get(s.user_id, item.link, item.title);
        if (!exists) db.prepare("INSERT INTO drafts (user_id,title,link,source) VALUES (?,?,?,?)").run(s.user_id, item.title, item.link, s.url);
      }
    } catch {}
  }
}

let started = false;
export function startScheduler() {
  if (started) return; started = true;
  console.log("[acclaira] scheduler started");
  setInterval(() => runScheduled().catch(() => {}), 60 * 1000);
  setInterval(() => runRss().catch(() => {}), 15 * 60 * 1000);
  runRss().catch(() => {});
}

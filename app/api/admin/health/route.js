import { getUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { NextResponse } from "next/server";

async function check(name, fn) {
  try { const ok = await fn(); return { name, ok: !!ok, detail: ok === true ? "Connected" : ok }; }
  catch (e) { return { name, ok: false, detail: e.message.slice(0, 90) }; }
}

export async function GET() {
  const u = await getUser();
  if (u?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const id = u.id;
  const results = await Promise.all([
    check("Claude API", async () => {
      const k = getSetting(id, "claude_api_key").value;
      if (!k) return "Not configured";
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": k, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-haiku-4-5", max_tokens: 8, messages: [{ role: "user", content: "ok" }] }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      return true;
    }),
    check("Gemini API", async () => {
      const k = getSetting(id, "gemini_api_key").value;
      if (!k) return "Not configured";
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${k}`);
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      return true;
    }),
    check("WordPress", async () => {
      const url = getSetting(id, "wp_url").value?.replace(/\/$/, "");
      if (!url) return "Not configured";
      const user = getSetting(id, "wp_user").value, pass = getSetting(id, "wp_app_password").value;
      const r = await fetch(`${url}/wp-json/wp/v2/users/me`, {
        headers: { Authorization: "Basic " + Buffer.from(`${user}:${pass}`).toString("base64") },
      });
      if (!r.ok) throw new Error(`Site reachable but login failed (${r.status})`);
      return true;
    }),
    check("Meta (Facebook Page)", async () => {
      const token = getSetting(id, "meta_page_token").value;
      const page = getSetting(id, "meta_page_id").value;
      if (!token || !page) return "Not configured";
      const r = await fetch(`https://graph.facebook.com/v21.0/${page}?fields=name&access_token=${token}`);
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      return true;
    }),
  ]);
  return NextResponse.json(results);
}

import { getSetting } from "./settings";

export async function generate(userId, prompt, maxTokens = 1200) {
  const gemini = getSetting(userId, "gemini_api_key")?.value || process.env.GEMINI_API_KEY;
  const anthropic = getSetting(userId, "claude_api_key")?.value || process.env.ANTHROPIC_API_KEY;

  if (gemini) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gemini}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens }
      }),
    });
    const d = await r.json();
    if (d.error) throw new Error("Gemini: " + d.error.message);
    return d.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  }

  if (anthropic) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": anthropic, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }),
    });
    const d = await r.json();
    if (d.error) throw new Error("Claude: " + d.error.message);
    return (d.content || []).map((b) => b.text || "").join("");
  }

  throw new Error("No AI key configured. Add your Gemini API key in Settings → AI engines or in .env.");
}

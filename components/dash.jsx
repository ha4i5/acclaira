"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { C, Btn, Field, StatusLamp } from "./ui";
import { TEMPLATES, SIZES, drawThumb } from "./thumb";
import {
  Upload, Wand2, Download, Send, RefreshCw, Sparkles, CheckCircle2, ArrowRight,
  Link2, FileText, Mic, Type, Play, Volume2, Rss, Trash2, Plus, X
} from "lucide-react";

export function useToast() {
  const [toast, setToast] = useState(null);
  const notify = (m) => { setToast(m); setTimeout(() => setToast(null), 4200); };
  const el = toast ? (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 max-w-md w-[calc(100%-2rem)] rounded-xl px-4 py-3 text-sm text-white shadow-lg z-50" style={{ background: C.navy }}>{toast}</div>
  ) : null;
  return { notify, el };
}

const logHistory = (m, title, status, url = "") =>
  fetch("/api/history", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ module: m, title, status, url }) });

/* ============ MODULE 1 ============ */
export function Module1() {
  const { notify, el } = useToast();
  const [headline, setHeadline] = useState("");
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState(null);
  const [schedOpen, setSchedOpen] = useState(false);
  const [schedAt, setSchedAt] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("headline");
    if (q) setHeadline(q);
    fetch("/api/brands").then((r) => r.json()).then((d) => Array.isArray(d) && setBrands(d));
  }, []);
  const [tpl, setTpl] = useState(TEMPLATES[0]);
  const [size, setSize] = useState(SIZES[0]);
  const [img, setImg] = useState(null);
  const [generated, setGenerated] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [cap, setCap] = useState(null);
  const [posting, setPosting] = useState(false);
  const canvasRef = useRef(null);

  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const image = new Image();
    image.onload = () => { setImg(image); if (generated) render(image, tpl, size); };
    image.src = URL.createObjectURL(f);
  };
  const render = (image = img, t = tpl, s = size) => {
    const eff = brand ? { ...t, tag: brand.tag || t.tag, tagBg: brand.tag_bg || t.tagBg, accent: brand.accent || t.accent } : t;
    if (canvasRef.current) drawThumb(canvasRef.current, headline, image, eff, s, brand?.handle || "@acclaira");
  };
  const generate = async () => {
    render(); setGenerated(true); setAiBusy(true); setCap(null);
    const r = await fetch("/api/generate/caption", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ headline }) });
    const d = await r.json();
    if (d.error) notify(d.error); else { setCap(d); notify(`Generated — ${d.cost} credit used, ${d.remaining} left.`); }
    setAiBusy(false);
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = `acclaira-${size.id}.png`; a.click();
  };
  const post = async () => {
    setPosting(true);
    const r = await fetch("/api/publish/meta", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        caption: cap ? `${cap.caption}\n\n${cap.hashtags}` : headline,
        imageBase64: canvasRef.current.toDataURL("image/png"),
      }),
    });
    const d = await r.json();
    setPosting(false);
    notify(d.error || d.message || "Posted to your Facebook Page ✔");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">{el}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.line }}>
          <h3 className="font-display font-semibold mb-3" style={{ color: C.ink }}>1 · News headline</h3>
          <Field label="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Type or paste the news headline…" />
        </div>
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.line }}>
          <h3 className="font-display font-semibold mb-3" style={{ color: C.ink }}>2 · Image</h3>
          <label className="flex items-center justify-center gap-2.5 rounded-xl border-2 border-dashed px-4 py-6 text-sm cursor-pointer" style={{ borderColor: C.line, color: C.muted }}>
            <Upload size={16} /> {img ? "Image added — click to replace" : "Upload news / person image"}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>
          <p className="text-[11px] mt-2.5" style={{ color: C.muted }}>No image? A branded background is used automatically.</p>
        </div>
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.line }}>
          <h3 className="font-display font-semibold mb-3" style={{ color: C.ink }}>3 · Design & format</h3>
          {brands.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={() => { setBrand(null); if (generated) render(); }} className="text-xs rounded-full border px-3 py-1.5 font-semibold"
                style={{ borderColor: !brand ? C.violet : C.line, color: !brand ? C.violet : C.muted }}>Default brand</button>
              {brands.map((b) => (
                <button key={b.id} onClick={() => { setBrand(b); if (generated) setTimeout(() => render(), 30); }}
                  className="text-xs rounded-full border px-3 py-1.5 font-semibold"
                  style={{ borderColor: brand?.id === b.id ? C.violet : C.line, color: brand?.id === b.id ? C.violet : C.muted }}>{b.name}</button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => { setTpl(t); if (generated) render(img, t, size); }}
                className="rounded-xl border p-3 text-left" style={{ borderColor: tpl.id === t.id ? C.violet : C.line, borderWidth: tpl.id === t.id ? 2 : 1 }}>
                <span className="inline-block text-[9px] font-bold rounded px-1.5 py-0.5 mb-1.5" style={{ background: t.tagBg, color: t.tagText || "#fff" }}>{t.tag}</span>
                <p className="text-xs font-semibold" style={{ color: C.ink }}>{t.name}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {SIZES.map((s) => (
              <button key={s.id} onClick={() => { setSize(s); if (generated) render(img, tpl, s); }}
                className="flex-1 rounded-lg border px-2 py-2 text-xs font-semibold"
                style={{ borderColor: size.id === s.id ? C.violet : C.line, color: size.id === s.id ? C.violet : C.muted, background: size.id === s.id ? "#F1EFFB" : "#fff" }}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
        <Btn className="w-full flex items-center justify-center gap-2" onClick={generate}>
          <Wand2 size={15} /> {generated ? "Regenerate" : "Generate post"}
        </Btn>
      </div>
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.line }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold" style={{ color: C.ink }}>Preview · {size.w}×{size.h}</h3>
            {generated && <StatusLamp status="configured" />}
          </div>
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: C.line }}>
            {generated ? <canvas ref={canvasRef} className="w-full h-auto block" />
              : <div className="aspect-square flex items-center justify-center text-sm" style={{ background: C.paper, color: C.muted }}>Your generated post appears here</div>}
          </div>
          {generated && (
            <div className="flex gap-2.5 mt-4">
              <Btn variant="teal" className="flex-1 flex items-center justify-center gap-2" onClick={download}><Download size={15} /> Download</Btn>
              <Btn className="flex-1 flex items-center justify-center gap-2" onClick={post} disabled={posting}>
                {posting ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />} Post now
              </Btn>
            </div>
          )}
          {generated && (
            <Btn variant="ghost" className="w-full mt-2.5 text-xs" onClick={() => setSchedOpen(true)}>Schedule for later…</Btn>
          )}
          {schedOpen && (
            <div className="mt-3 rounded-xl border p-4 space-y-3" style={{ borderColor: C.line }}>
              <Field label="Publish at (server time)" type="datetime-local" value={schedAt} onChange={(e) => setSchedAt(e.target.value)} />
              <div className="flex gap-2.5">
                <Btn variant="ghost" className="flex-1" onClick={() => setSchedOpen(false)}>Cancel</Btn>
                <Btn className="flex-1" onClick={async () => {
                  if (!schedAt) return notify("Pick a date and time first.");
                  const r = await fetch("/api/schedule", { method: "POST", headers: { "content-type": "application/json" },
                    body: JSON.stringify({ caption: cap ? `${cap.caption}\n\n${cap.hashtags}` : headline, imageBase64: canvasRef.current.toDataURL("image/png"), scheduledAt: schedAt }) });
                  const d = await r.json();
                  notify(d.error || "Scheduled! See the Scheduled page — it posts automatically.");
                  if (!d.error) setSchedOpen(false);
                }}>Schedule</Btn>
              </div>
            </div>
          )}
        </div>
        {generated && (
          <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: C.line }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.teal }}>Caption</p>
              {aiBusy && <span className="text-[11px] flex items-center gap-1.5" style={{ color: C.muted }}><RefreshCw size={11} className="animate-spin" /> AI writing…</span>}
            </div>
            {cap ? (<>
              <p className="text-sm whitespace-pre-line" style={{ color: C.ink }}>{cap.caption}</p>
              <div><p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: C.teal }}>Hashtags</p>
                <p className="text-sm font-medium" style={{ color: C.violet }}>{cap.hashtags}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: C.teal }}>SEO keywords</p>
                <p className="text-sm" style={{ color: C.muted }}>{cap.keywords}</p></div>
            </>) : !aiBusy && <p className="text-sm" style={{ color: C.muted }}>Add a Claude or Gemini API key in Settings → AI engines to get AI captions.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ MODULE 2 ============ */
export function Module2() {
  const { notify, el } = useToast();
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState("");
  const [article, setArticle] = useState("");
  const [meta, setMeta] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [tpl, setTpl] = useState(TEMPLATES[0]);
  const [pubBusy, setPubBusy] = useState(false);
  const [link, setLink] = useState("");
  const canvasRef = useRef(null);
  const steps = ["Fetch & analyze", "Article draft", "Feature image", "Publish", "Social post"];

  const write = async () => {
    setAiBusy(true); setStep(1);
    const r = await fetch("/api/generate/article", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topic }) });
    const d = await r.json();
    if (d.error) { notify(d.error); setArticle(""); setStep(0); } else { setArticle(d.article); setMeta(d.meta); notify(`Article written — ${d.cost} credits used, ${d.remaining} left.`); }
    setAiBusy(false);
  };
  const renderFeature = (t = tpl) => {
    const headline = (article.split("\n")[0] || "News update").slice(0, 90);
    if (canvasRef.current) drawThumb(canvasRef.current, headline, null, t, { w: 1280, h: 720 }, "@acclaira");
  };
  const publish = async () => {
    setPubBusy(true);
    const title = article.split("\n")[0];
    const body = article.split("\n").slice(1).join("\n").trim();
    const r = await fetch("/api/publish/wordpress", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, content: body, imageBase64: canvasRef.current?.toDataURL("image/png") }),
    });
    const d = await r.json();
    setPubBusy(false);
    if (d.link) { setLink(d.link); setStep(4); notify("Published! Live URL captured."); }
    else notify(d.error || d.message || "Queued.");
    if (d.message) setStep(4);
  };

  return (
    <div className="space-y-5 max-w-3xl">{el}
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.line }}>
        <div className="flex flex-wrap gap-2 mb-5">
          {steps.map((s, i) => (
            <span key={s} className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5"
              style={{ background: i <= step ? C.tealBg : "#F1EFF8", color: i <= step ? C.tealDark : C.muted }}>
              {i < step ? <CheckCircle2 size={13} /> : <span className="font-bold">{i + 1}</span>} {s}
            </span>
          ))}
        </div>

        {step === 0 && (<>
          <Field label="News topic / source" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Paste headline, URL, or topic…" />
          <Btn className="mt-4 flex items-center gap-2" onClick={write}><Sparkles size={14} /> Fetch & write article <ArrowRight size={14} /></Btn>
        </>)}

        {step === 1 && (<>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.teal }}>AI article draft</p>
            {aiBusy && <span className="text-[11px] flex items-center gap-1.5" style={{ color: C.muted }}><RefreshCw size={11} className="animate-spin" /> AI writing…</span>}
          </div>
          <textarea value={aiBusy ? "Writing your SEO article…" : article} onChange={(e) => setArticle(e.target.value)} rows={13}
            className="w-full rounded-xl border px-4 py-3 text-sm leading-relaxed outline-none" style={{ borderColor: C.line, color: C.ink }} />
          {meta && <p className="text-[11px] mt-2 rounded-lg px-3 py-2" style={{ background: C.tealBg, color: C.tealDark }}><b>Meta description:</b> {meta}</p>}
          <div className="flex gap-2.5 mt-3">
            <Btn variant="ghost" onClick={() => setStep(0)}>Back</Btn>
            <Btn variant="ghost" onClick={write} disabled={aiBusy}>Rewrite</Btn>
            <Btn onClick={() => { setStep(2); setTimeout(() => renderFeature(), 60); }} disabled={aiBusy || !article}>Approve draft</Btn>
          </div>
        </>)}

        {step === 2 && (<>
          <div className="flex gap-2 mb-3">
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => { setTpl(t); renderFeature(t); }}
                className="text-[10px] font-bold rounded px-2 py-1"
                style={{ background: tpl.id === t.id ? C.violet : "#F1EFF8", color: tpl.id === t.id ? "#fff" : C.muted }}>{t.name}</button>
            ))}
          </div>
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: C.line }}><canvas ref={canvasRef} className="w-full h-auto block" /></div>
          <div className="flex gap-2.5 mt-4">
            <Btn variant="ghost" onClick={() => setStep(1)}>Back</Btn>
            <Btn variant="teal" className="flex items-center gap-2" onClick={() => {
              const a = document.createElement("a"); a.href = canvasRef.current.toDataURL("image/png"); a.download = "acclaira-feature.png"; a.click();
            }}><Download size={14} /> Download</Btn>
            <Btn onClick={() => setStep(3)}>Use this image</Btn>
          </div>
        </>)}

        {step === 3 && (<>
          <p className="text-sm mb-4" style={{ color: C.muted }}>Publishing to your WordPress with the feature image attached. If the channel isn't Live yet, it will queue safely.</p>
          <Btn className="flex items-center gap-2" onClick={publish} disabled={pubBusy}>
            {pubBusy ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />} Publish to WordPress
          </Btn>
        </>)}

        {step === 4 && (<>
          {link ? (
            <div className="rounded-xl border p-4 flex items-center gap-3 text-sm mb-4" style={{ borderColor: C.line }}>
              <Link2 size={16} style={{ color: C.violet }} />
              <a href={link} target="_blank" className="text-sm font-semibold underline" style={{ color: C.violet }}>{link}</a>
            </div>
          ) : (
            <p className="text-sm rounded-xl px-4 py-3 mb-4" style={{ background: C.amberBg, color: "#8A5A00" }}>
              Queued — flip WordPress to Live in Settings, then publish again to get the real URL.
            </p>
          )}
          <p className="text-sm mb-4" style={{ color: C.ink }}>Now generate the social post in <b>Module 1</b> — paste the article headline there, and use this URL as the first comment.</p>
        </>)}
      </div>
    </div>
  );
}

/* ============ MODULE 3 ============ */
export function Module3() {
  const { notify, el } = useToast();
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const write = async () => {
    setAiBusy(true);
    const r = await fetch("/api/generate/urdu-script", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topic }) });
    const d = await r.json();
    if (d.error) notify(d.error); else { setScript(d.script); notify(`Script ready — ${d.cost} credits used, ${d.remaining} left.`); }
    setAiBusy(false);
  };
  const preview = () => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(script);
      const voices = window.speechSynthesis.getVoices();
      const ur = voices.find((v) => v.lang.startsWith("ur")) || voices.find((v) => v.lang.startsWith("hi"));
      if (ur) u.voice = ur;
      u.rate = 0.95; u.onend = () => setSpeaking(false);
      setSpeaking(true); window.speechSynthesis.speak(u);
    } catch { notify("Voice preview isn't available in this browser."); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">{el}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.line }}>
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2" style={{ color: C.ink }}><FileText size={16} /> Urdu script</h3>
          <Field label="Topic / headline" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Petrol price cut announced tonight" />
          <Btn variant="ghost" className="mt-3 flex items-center gap-2 text-xs" onClick={write} disabled={aiBusy}>
            {aiBusy ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />} {aiBusy ? "AI likh raha hai…" : "Write script with AI"}
          </Btn>
          <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={6} dir="rtl"
            className="w-full mt-3 rounded-xl border px-4 py-3 text-[15px] leading-loose outline-none" style={{ borderColor: C.line, color: C.ink }} />
          {script && (
            <button onClick={preview} className="mt-2 flex items-center gap-2 text-xs font-semibold" style={{ color: C.violet }}>
              <Volume2 size={14} /> {speaking ? "Playing…" : "Preview voice in browser"}
            </button>
          )}
        </div>
        <div className="bg-white rounded-2xl border p-5 grid gap-4 sm:grid-cols-2" style={{ borderColor: C.line }}>
          <div>
            <label className="text-xs font-semibold flex items-center gap-1.5 mb-1.5" style={{ color: C.ink }}><Mic size={13} /> Voice</label>
            <select className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white" style={{ borderColor: C.line }}>
              <option>ur-PK-Wavenet-A (Male)</option><option>ur-PK-Wavenet-B (Female)</option><option>ElevenLabs — custom</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold flex items-center gap-1.5 mb-1.5" style={{ color: C.ink }}><Type size={13} /> Caption style</label>
            <select className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white" style={{ borderColor: C.line }}>
              <option>Word pop (viral)</option><option>Karaoke highlight</option><option>Clean subtitle</option>
            </select>
          </div>
        </div>
        <Btn className="w-full flex items-center justify-center gap-2" disabled={rendering} onClick={async () => {
          if (!script) return notify("Write or generate a script first.");
          setRendering(true);
          const cv = document.createElement("canvas");
          const { drawThumb, TEMPLATES } = await import("./thumb");
          drawThumb(cv, topic || script.split("۔")[0].slice(0, 60), null, TEMPLATES[2], { w: 1080, h: 1920 }, "@acclaira");
          const r = await fetch("/api/video/render", { method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ script, imageBase64: cv.toDataURL("image/png") }) });
          const d = await r.json();
          setRendering(false);
          if (d.error) notify(d.error);
          else { setVideoUrl(d.url); notify("Video rendered! Download below."); }
        }}>
          {rendering ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />} {rendering ? "Rendering… (up to 2 min)" : "Render video"}
        </Btn>
        {videoUrl && (
          <a href={videoUrl} className="block">
            <Btn variant="teal" className="w-full">Download MP4</Btn>
          </a>
        )}
      </div>
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.line }}>
        <h3 className="font-display font-semibold mb-3" style={{ color: C.ink }}>Preview · 1080×1920</h3>
        <div className="mx-auto w-full max-w-[240px] rounded-2xl overflow-hidden border relative" style={{ borderColor: C.line, aspectRatio: "9/16", background: `linear-gradient(170deg, ${C.violetDark}, ${C.navy})` }}>
          <div className="absolute top-3 left-3 text-[9px] font-bold text-white rounded px-2 py-0.5" style={{ background: "#D6244F" }}>تازہ ترین</div>
          <div className="absolute inset-x-0 bottom-16 px-3 text-center">
            <span className="inline-block font-display font-bold text-white text-sm leading-snug px-2 py-1 rounded" dir="rtl" style={{ background: "rgba(0,0,0,0.45)" }}>
              {(script.split("۔")[0] || "آپ کا اسکرپٹ یہاں").slice(0, 40)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ SETTINGS ============ */
const GROUPS = [
  { title: "Meta — Facebook & Instagram", liveKey: "meta_page_token", note: "Needs Meta App Review (pages_manage_posts, instagram_content_publish) — start early at developers.facebook.com.",
    fields: [["meta_app_id", "App ID"], ["meta_app_secret", "App secret"], ["meta_page_id", "Facebook Page ID"], ["meta_ig_id", "Instagram Business ID"], ["meta_page_token", "Long-lived page access token"]] },
  { title: "TikTok", liveKey: "tiktok_client_secret", fields: [["tiktok_client_key", "Client key"], ["tiktok_client_secret", "Client secret"]] },
  { title: "WordPress", liveKey: "wp_app_password", note: "WP Admin → Users → Profile → Application Passwords → create one named “Acclaira”.",
    fields: [["wp_url", "Site URL"], ["wp_user", "Username"], ["wp_app_password", "Application password"]] },
  { title: "AI engines", liveKey: "claude_api_key", note: "At least one key is required for AI captions, articles, and Urdu scripts.",
    fields: [["claude_api_key", "Claude API key"], ["gemini_api_key", "Gemini API key"]] },
  { title: "Urdu TTS", liveKey: "tts_key", fields: [["tts_key", "Provider API key"], ["tts_voice", "Default voice (e.g. ur-PK-Wavenet-A)"]] },
  { title: "Stripe", liveKey: "stripe_secret_key", fields: [["stripe_pub_key", "Publishable key"], ["stripe_secret_key", "Secret key"], ["stripe_webhook_secret", "Webhook signing secret"]] },
  { title: "JazzCash / Easypaisa", liveKey: "local_pay_secret", fields: [["local_pay_merchant", "Merchant ID"], ["local_pay_secret", "Integrity / hash key"]] },
];

export function SettingsClient() {
  const { notify, el } = useToast();
  const [vals, setVals] = useState({});
  const [lives, setLives] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      const v = {}, l = {};
      for (const k in d) { v[k] = d[k].value; l[k] = d[k].live; }
      setVals(v); setLives(l); setLoaded(true);
    });
  }, []);

  const saveGroup = async (g) => {
    const entries = g.fields.map(([k]) => ({ key: k, value: vals[k] || "", live: !!lives[g.liveKey] }));
    await fetch("/api/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entries }) });
    notify("Saved. " + (lives[g.liveKey] ? "This channel is LIVE." : "Channel stays Off air until you flip Go live."));
  };

  if (!loaded) return <p className="text-sm" style={{ color: C.muted }}>Loading settings…</p>;

  return (
    <div className="space-y-4 max-w-3xl">{el}
      <p className="text-sm" style={{ color: C.muted }}>Credentials are AES-256 encrypted in your database. Channels stay <b>Off air</b> until you flip <b>Go live</b> — nothing ever posts on its own.</p>
      {GROUPS.map((g) => {
        const filled = g.fields.some(([k]) => (vals[k] || "").trim());
        const status = lives[g.liveKey] && filled ? "live" : filled ? "configured" : "off";
        return (
          <div key={g.title} className="bg-white rounded-2xl border p-5" style={{ borderColor: C.line }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-[15px]" style={{ color: C.ink }}>{g.title}</h3>
              <StatusLamp status={status} />
            </div>
            {g.note && <p className="text-xs rounded-lg px-3 py-2 mb-4" style={{ background: C.amberBg, color: "#8A5A00" }}>{g.note}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              {g.fields.map(([k, label]) => (
                <Field key={k} label={label} type={/secret|password|token|key/i.test(k) ? "password" : "text"}
                  value={vals[k] || ""} onChange={(e) => setVals({ ...vals, [k]: e.target.value })}
                  placeholder={/url/.test(k) ? "https://…" : ""} />
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm font-medium" style={{ color: C.ink }}>
                <input type="checkbox" checked={!!lives[g.liveKey]} onChange={(e) => setLives({ ...lives, [g.liveKey]: e.target.checked })}
                  className="h-4 w-4 rounded" style={{ accentColor: C.teal }} />
                Go live
              </label>
              <Btn onClick={() => saveGroup(g)}>Save</Btn>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============ SOURCES ============ */
export function Sources() {
  const { notify, el } = useToast();
  const [list, setList] = useState([]);
  const [val, setVal] = useState("");
  const load = () => fetch("/api/sources").then((r) => r.json()).then(setList);
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!val.trim()) return;
    await fetch("/api/sources", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: val.trim() }) });
    setVal(""); load(); notify("Source added.");
  };
  const del = async (id) => {
    await fetch("/api/sources", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };
  return (
    <div className="max-w-2xl space-y-4">{el}
      <p className="text-sm" style={{ color: C.muted }}>
        Use RSS feeds, news sites, and pages <b>you own</b> — reading other people's Meta accounts is against platform rules, so Acclaira sticks to compliant sources.
      </p>
      <div className="bg-white rounded-2xl border p-5 flex gap-2.5" style={{ borderColor: C.line }}>
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="https://site.com/feed"
          className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none" style={{ borderColor: C.line }} />
        <Btn className="flex items-center gap-1.5" onClick={add}><Plus size={14} /> Add</Btn>
      </div>
      <div className="bg-white rounded-2xl border divide-y" style={{ borderColor: C.line }}>
        {list.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <Rss size={15} style={{ color: C.teal }} className="shrink-0" />
              <p className="text-sm font-medium truncate" style={{ color: C.ink }}>{s.url}</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer" style={{ color: s.auto ? C.tealDark : C.muted }}>
                <input type="checkbox" checked={!!s.auto} onChange={async (e) => {
                  await fetch("/api/sources", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ toggleAuto: e.target.checked, id: s.id }) });
                  load();
                }} style={{ accentColor: C.teal }} /> Auto
              </label>
              <button onClick={() => del(s.id)} className="p-2 rounded-lg" style={{ color: C.muted }} aria-label="Remove source"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="p-6 text-sm text-center" style={{ color: C.muted }}>No sources yet — add your first RSS feed above.</p>}
      </div>
    </div>
  );
}

/* ============ HISTORY ============ */
export function HistoryClient() {
  const [list, setList] = useState([]);
  useEffect(() => { fetch("/api/history").then((r) => r.json()).then(setList); }, []);
  return (
    <div className="bg-white rounded-2xl border divide-y max-w-3xl" style={{ borderColor: C.line }}>
      {list.map((h) => (
        <div key={h.id} className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: C.ink }}>{h.title}</p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{h.module} · {h.created_at}</p>
            {h.url && <a href={h.url} target="_blank" className="text-xs underline" style={{ color: C.violet }}>{h.url}</a>}
          </div>
          <StatusLamp status={h.status === "published" ? "live" : "configured"} />
        </div>
      ))}
      {list.length === 0 && <p className="p-6 text-sm text-center" style={{ color: "#6E6A8A" }}>Nothing yet — generate something in Module 1, 2, or 3.</p>}
    </div>
  );
}

export function LogoutButton() {
  const r = useRouter();
  return (
    <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); r.push("/"); }}
      className="flex items-center gap-2.5 px-6 py-5 text-sm" style={{ color: "#7A75A0" }}>
      <X size={15} /> Log out
    </button>
  );
}

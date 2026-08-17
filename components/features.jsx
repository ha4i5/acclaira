"use client";
import { useEffect, useState } from "react";
import { C, Btn, Field, StatusLamp } from "./ui";
import { useToast } from "./dash";
import { CalendarClock, Rss, Trash2, Plus, Sparkles, RefreshCw, ThumbsUp, ThumbsDown, BarChart3, Palette } from "lucide-react";

/* ---------- Scheduled posts ---------- */
export function ScheduledClient() {
  const { notify, el } = useToast();
  const [list, setList] = useState([]);
  const load = () => fetch("/api/schedule").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d));
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);
  const cancel = async (id) => {
    await fetch("/api/schedule", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    load(); notify("Scheduled post cancelled.");
  };
  const lamp = (s) => (s === "published" ? "live" : s === "queued" || s === "posting" ? "configured" : "off");
  return (
    <div className="max-w-3xl space-y-4">{el}
      <p className="text-sm" style={{ color: C.muted }}>
        Schedule posts from <b>Module 1</b> — generate, then pick “Schedule” instead of posting now. The server publishes them automatically at the exact time, even while you sleep.
      </p>
      <div className="bg-white rounded-2xl border divide-y" style={{ borderColor: C.line }}>
        {list.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: C.ink }}>{(p.caption || "Untitled").slice(0, 70)}</p>
              <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: C.muted }}>
                <CalendarClock size={12} /> {p.scheduled_at} {p.result && p.status === "failed" && <span style={{ color: "#BE1246" }}>· {p.result}</span>}
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <StatusLamp status={lamp(p.status)} />
              {p.status === "queued" && (
                <button onClick={() => cancel(p.id)} className="p-2 rounded-lg" style={{ color: C.muted }} aria-label="Cancel"><Trash2 size={15} /></button>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="p-6 text-sm text-center" style={{ color: C.muted }}>Nothing scheduled — queue your first post from Module 1.</p>}
      </div>
    </div>
  );
}

/* ---------- Drafts (RSS auto-mode) ---------- */
export function DraftsClient() {
  const { notify, el } = useToast();
  const [list, setList] = useState([]);
  const load = () => fetch("/api/drafts").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d));
  useEffect(() => { load(); }, []);
  const act = async (id, status) => {
    await fetch("/api/drafts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
    load();
  };
  return (
    <div className="max-w-3xl space-y-4">{el}
      <p className="text-sm" style={{ color: C.muted }}>
        Fresh headlines pulled automatically from sources with <b>Auto</b> switched on (checked every 15 minutes). Approve one to open it in Module 1.
      </p>
      <div className="bg-white rounded-2xl border divide-y" style={{ borderColor: C.line }}>
        {list.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: C.ink }}>{d.title}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: C.muted }}>{d.source}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href={`/dashboard/module-1?headline=${encodeURIComponent(d.title)}`} onClick={() => act(d.id, "approved")}>
                <Btn variant="teal" className="flex items-center gap-1.5 text-xs px-3 py-2"><ThumbsUp size={13} /> Make post</Btn>
              </a>
              <button onClick={() => act(d.id, "dismissed")} className="p-2 rounded-lg" style={{ color: C.muted }} aria-label="Dismiss"><ThumbsDown size={15} /></button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="p-6 text-sm text-center" style={{ color: C.muted }}>
            No drafts yet — turn on <b>Auto</b> for a source in News sources, and headlines will appear here.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- Brands ---------- */
export function BrandsClient() {
  const { notify, el } = useToast();
  const [list, setList] = useState([]);
  const load = () => fetch("/api/brands").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d));
  useEffect(() => { load(); }, []);
  const add = async () => {
    const r = await fetch("/api/brands", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });
    const d = await r.json();
    if (d.error) notify(d.error); else load();
  };
  const save = async (b) => {
    await fetch("/api/brands", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
    notify("Brand saved — pick it in Module 1.");
  };
  const del = async (id) => {
    await fetch("/api/brands", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };
  return (
    <div className="max-w-3xl space-y-4">{el}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: C.muted }}>Each brand gets its own watermark, tag, and colors on every thumbnail. Agency plan: up to 5 brands.</p>
        <Btn className="flex items-center gap-1.5" onClick={add}><Plus size={14} /> New brand</Btn>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((b, i) => (
          <div key={b.id} className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: C.line }}>
            <Field label="Brand name" value={b.name} onChange={(e) => { const l = [...list]; l[i] = { ...b, name: e.target.value }; setList(l); }} />
            <Field label="Watermark handle" value={b.handle} onChange={(e) => { const l = [...list]; l[i] = { ...b, handle: e.target.value }; setList(l); }} />
            <Field label="Tag text (e.g. BREAKING)" value={b.tag} onChange={(e) => { const l = [...list]; l[i] = { ...b, tag: e.target.value }; setList(l); }} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: C.ink }}>Tag color</label>
                <input type="color" value={b.tag_bg} onChange={(e) => { const l = [...list]; l[i] = { ...b, tag_bg: e.target.value }; setList(l); }}
                  className="h-10 w-full rounded-lg border cursor-pointer" style={{ borderColor: C.line }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: C.ink }}>Accent</label>
                <input type="color" value={b.accent} onChange={(e) => { const l = [...list]; l[i] = { ...b, accent: e.target.value }; setList(l); }}
                  className="h-10 w-full rounded-lg border cursor-pointer" style={{ borderColor: C.line }} />
              </div>
            </div>
            <div className="flex gap-2.5">
              <Btn className="flex-1" onClick={() => save(list[i])}>Save</Btn>
              <button onClick={() => del(b.id)} className="p-2.5 rounded-lg" style={{ color: C.muted }} aria-label="Delete brand"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && <p className="text-sm text-center py-8" style={{ color: C.muted }}>No brands yet — create your first one.</p>}
    </div>
  );
}

/* ---------- Analytics ---------- */
export function AnalyticsClient() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = async () => { setBusy(true); const r = await fetch("/api/analytics"); setData(await r.json()); setBusy(false); };
  useEffect(() => { load(); }, []);
  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: C.muted }}>Engagement pulled live from Meta for your published posts — see what went viral.</p>
        <Btn variant="ghost" className="flex items-center gap-1.5 text-xs" onClick={load} disabled={busy}>
          <RefreshCw size={13} className={busy ? "animate-spin" : ""} /> Refresh
        </Btn>
      </div>
      {data?.note && <p className="text-xs rounded-lg px-3 py-2" style={{ background: C.amberBg, color: "#8A5A00" }}>{data.note}</p>}
      <div className="bg-white rounded-2xl border divide-y" style={{ borderColor: C.line }}>
        {(data?.posts || []).map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: C.ink }}>{p.title}</p>
              <a href={p.url} target="_blank" className="text-xs underline" style={{ color: C.violet }}>View on Facebook</a>
            </div>
            {p.stats ? (
              <div className="flex gap-4 text-center shrink-0">
                {[["Likes", p.stats.likes], ["Comments", p.stats.comments], ["Shares", p.stats.shares]].map(([l, v]) => (
                  <div key={l}>
                    <p className="font-display font-bold" style={{ color: C.violet }}>{v}</p>
                    <p className="text-[10px]" style={{ color: C.muted }}>{l}</p>
                  </div>
                ))}
              </div>
            ) : <span className="text-xs" style={{ color: C.muted }}>No data</span>}
          </div>
        ))}
        {data && (data.posts || []).length === 0 && (
          <p className="p-6 text-sm text-center" style={{ color: C.muted }}>No published Facebook posts yet — publish from Module 1 and stats appear here.</p>
        )}
        {!data && <p className="p-6 text-sm text-center" style={{ color: C.muted }}>Loading…</p>}
      </div>
    </div>
  );
}

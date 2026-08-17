"use client";
import { useEffect, useState } from "react";
import { C, Btn, Field, StatusLamp } from "./ui";
import { useToast } from "./dash";
import {
  Users, Wallet, SlidersHorizontal, Activity, Inbox, BarChart3,
  RefreshCw, KeyRound, Trash2, Plus, X
} from "lucide-react";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border p-5 ${className}`} style={{ borderColor: C.line }}>{children}</div>
);

/* ---------- Overview ---------- */
function Stats() {
  const [s, setS] = useState(null);
  useEffect(() => { fetch("/api/admin/stats").then((r) => r.json()).then(setS); }, []);
  if (!s) return <p className="text-sm" style={{ color: C.muted }}>Loading…</p>;
  const tiles = [
    ["Users", s.users, `${s.active} active`],
    ["Revenue recorded", `$${s.revenue}`, `${s.creditsSold} credits sold`],
    ["Credits spent", s.creditsSpent, `${s.generations} generations`],
  ];
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        {tiles.map(([l, v, sub]) => (
          <Card key={l}>
            <p className="font-display font-bold text-3xl" style={{ color: C.violet }}>{v}</p>
            <p className="text-sm font-semibold mt-1" style={{ color: C.ink }}>{l}</p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{sub}</p>
          </Card>
        ))}
      </div>
      <Card>
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.teal }}>Usage by module</p>
        {s.byModule.map((m) => (
          <div key={m.module} className="flex items-center justify-between text-sm py-2 border-b last:border-0" style={{ borderColor: C.line }}>
            <span style={{ color: C.ink }}>{m.module}</span>
            <span style={{ color: C.muted }}>{m.c} generations · <b style={{ color: C.violet }}>{m.spent}</b> credits</span>
          </div>
        ))}
        {s.byModule.length === 0 && <p className="text-sm" style={{ color: C.muted }}>No generations yet.</p>}
      </Card>
    </div>
  );
}

/* ---------- Users ---------- */
function UsersTab({ notify }) {
  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);
  const load = () => fetch("/api/admin/users").then((r) => r.json()).then((d) => Array.isArray(d) && setUsers(d));
  useEffect(() => { load(); }, []);

  const act = async (payload, msg) => {
    const r = await fetch("/api/admin/users", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json();
    if (d.error) notify(d.error);
    else { notify(d.temp ? `Temporary password: ${d.temp} — send it to the user securely.` : msg); load(); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border overflow-x-auto" style={{ borderColor: C.line }}>
        <table className="w-full text-sm min-w-[720px]">
          <thead><tr className="text-left text-xs uppercase tracking-wide" style={{ color: C.muted, background: "#FBFAFE" }}>
            {["User", "Plan", "Credits", "Paid", "Gens", "Status", ""].map((h) => <th key={h} className="p-3.5 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t" style={{ borderColor: C.line }}>
                <td className="p-3.5"><p className="font-semibold" style={{ color: C.ink }}>{u.name || "—"} {u.role === "admin" && <span className="text-[10px] font-bold rounded px-1.5 py-0.5 ml-1" style={{ background: "#F1EFFB", color: C.violet }}>ADMIN</span>}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{u.email}</p></td>
                <td className="p-3.5 capitalize" style={{ color: C.ink }}>{u.plan}</td>
                <td className="p-3.5 font-semibold" style={{ color: C.violet }}>{u.credits}</td>
                <td className="p-3.5" style={{ color: C.muted }}>${u.paid}</td>
                <td className="p-3.5" style={{ color: C.muted }}>{u.generations}</td>
                <td className="p-3.5"><StatusLamp status={u.status === "active" ? "live" : "off"} /></td>
                <td className="p-3.5">
                  <button className="text-xs font-semibold" style={{ color: C.violet }} onClick={() => setEdit({ ...u })}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,16,46,0.6)" }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button className="absolute top-4 right-4" style={{ color: C.muted }} onClick={() => setEdit(null)} aria-label="Close"><X size={18} /></button>
            <h3 className="font-display font-bold text-lg mb-1" style={{ color: C.ink }}>{edit.email}</h3>
            <p className="text-xs mb-5" style={{ color: C.muted }}>Joined {edit.created_at?.slice(0, 10)} · ${edit.paid} paid · {edit.generations} generations</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: C.ink }}>Plan</label>
                <select value={edit.plan} onChange={(e) => setEdit({ ...edit, plan: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white" style={{ borderColor: C.line }}>
                  {["free", "starter", "pro", "agency"].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <Field label="Credits" type="number" value={edit.credits} onChange={(e) => setEdit({ ...edit, credits: parseInt(e.target.value || 0) })} />
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: C.ink }}>Status</label>
                <select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white" style={{ borderColor: C.line }}>
                  <option value="active">active</option><option value="suspended">suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: C.ink }}>Role</label>
                <select value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white" style={{ borderColor: C.line }}>
                  <option value="user">user</option><option value="admin">admin</option>
                </select>
              </div>
            </div>
            <Btn className="w-full mt-5" onClick={() => { act({ action: "update", ...edit }, "User updated."); setEdit(null); }}>Save changes</Btn>
            <div className="flex gap-2.5 mt-3">
              <Btn variant="ghost" className="flex-1 flex items-center justify-center gap-1.5 text-xs"
                onClick={() => act({ action: "reset_password", id: edit.id })}><KeyRound size={13} /> Reset password</Btn>
              <Btn variant="ghost" className="flex-1 flex items-center justify-center gap-1.5 text-xs" style={{ color: "#BE1246" }}
                onClick={() => { if (confirm("Delete this user and all their data?")) { act({ action: "delete", id: edit.id }, "User deleted."); setEdit(null); } }}>
                <Trash2 size={13} /> Delete user</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Funds ---------- */
function FundsTab({ notify }) {
  const [tx, setTx] = useState([]);
  const [f, setF] = useState({ email: "", amount: "", credits: "", method: "jazzcash", note: "" });
  const load = () => fetch("/api/admin/transactions").then((r) => r.json()).then((d) => Array.isArray(d) && setTx(d));
  useEffect(() => { load(); }, []);
  const add = async () => {
    const r = await fetch("/api/admin/transactions", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...f, amount: parseFloat(f.amount || 0), credits: parseInt(f.credits || 0) }),
    });
    const d = await r.json();
    if (d.error) notify(d.error);
    else { notify("Payment recorded and credits added."); setF({ email: "", amount: "", credits: "", method: "jazzcash", note: "" }); load(); }
  };
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.teal }}>Record a payment</p>
        <p className="text-xs mb-4" style={{ color: C.muted }}>For manual payments (JazzCash / Easypaisa / bank) — records the fund and instantly adds credits to the user.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="User email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="user@example.com" />
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.ink }}>Method</label>
            <select value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}
              className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white" style={{ borderColor: C.line }}>
              {["jazzcash", "easypaisa", "bank", "stripe", "manual"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <Field label="Amount (USD)" type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="49" />
          <Field label="Credits to add" type="number" value={f.credits} onChange={(e) => setF({ ...f, credits: e.target.value })} placeholder="250" />
          <div className="sm:col-span-2">
            <Field label="Note" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Pro plan — August" />
          </div>
        </div>
        <Btn className="mt-4 flex items-center gap-1.5" onClick={add}><Plus size={14} /> Add funds</Btn>
      </Card>
      <div className="bg-white rounded-2xl border divide-y" style={{ borderColor: C.line }}>
        {tx.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: C.ink }}>{t.email} <span className="font-normal text-xs capitalize" style={{ color: C.muted }}>· {t.method}</span></p>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>{t.note || "—"} · {t.created_at?.slice(0, 16)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold" style={{ color: C.tealDark }}>${t.amount}</p>
              <p className="text-xs" style={{ color: C.violet }}>+{t.credits} credits</p>
            </div>
          </div>
        ))}
        {tx.length === 0 && <p className="p-6 text-sm text-center" style={{ color: C.muted }}>No transactions recorded yet.</p>}
      </div>
    </div>
  );
}

/* ---------- Cost config ---------- */
function CostsTab({ notify }) {
  const [cfg, setCfg] = useState(null);
  useEffect(() => { fetch("/api/admin/config").then((r) => r.json()).then(setCfg); }, []);
  if (!cfg) return <p className="text-sm" style={{ color: C.muted }}>Loading…</p>;
  const save = async () => {
    await fetch("/api/admin/config", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cfg) });
    notify("Pricing saved — applies to every user immediately.");
  };
  const costRows = [
    ["cost_image", "Image / social post (Module 1)"],
    ["cost_article", "SEO article (Module 2)"],
    ["cost_video", "Urdu video script (Module 3)"],
    ["free_credits", "Free credits on signup"],
  ];
  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.teal }}>Credit costs</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {costRows.map(([k, l]) => (
            <Field key={k} label={l} type="number" value={cfg[k]} onChange={(e) => setCfg({ ...cfg, [k]: e.target.value })} />
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.teal }}>Package pricing</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {cfg.packages.map((p, i) => (
            <div key={p.id} className="rounded-xl border p-3" style={{ borderColor: C.line }}>
              <p className="font-display font-semibold text-sm mb-2" style={{ color: C.ink }}>{p.name}</p>
              <Field label="Price $" type="number" value={p.price}
                onChange={(e) => { const ps = [...cfg.packages]; ps[i] = { ...p, price: parseInt(e.target.value || 0) }; setCfg({ ...cfg, packages: ps }); }} />
              <div className="mt-2">
                <Field label="Credits" type="number" value={p.credits}
                  onChange={(e) => { const ps = [...cfg.packages]; ps[i] = { ...p, credits: parseInt(e.target.value || 0) }; setCfg({ ...cfg, packages: ps }); }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Btn onClick={save}>Save pricing</Btn>
    </div>
  );
}

/* ---------- API health ---------- */
function HealthTab() {
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    const r = await fetch("/api/admin/health");
    setRes(await r.json());
    setBusy(false);
  };
  useEffect(() => { run(); }, []);
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: C.muted }}>Live tests against each connected API using your saved credentials.</p>
        <Btn variant="ghost" className="flex items-center gap-1.5 text-xs" onClick={run} disabled={busy}>
          <RefreshCw size={13} className={busy ? "animate-spin" : ""} /> Re-test
        </Btn>
      </div>
      <div className="bg-white rounded-2xl border divide-y" style={{ borderColor: C.line }}>
        {(res || []).map((r) => (
          <div key={r.name} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: C.ink }}>{r.name}</p>
              <p className="text-xs mt-0.5" style={{ color: r.ok ? C.tealDark : C.muted }}>{r.detail}</p>
            </div>
            <StatusLamp status={r.ok ? "live" : r.detail === "Not configured" ? "off" : "configured"} />
          </div>
        ))}
        {!res && <p className="p-6 text-sm text-center" style={{ color: C.muted }}>Running checks…</p>}
      </div>
    </div>
  );
}

/* ---------- Email ---------- */
function EmailTab({ notify }) {
  const [b, setB] = useState({ subject: "", body: "", cta: "" });
  const [busy, setBusy] = useState(false);
  const [testBusy, setTestBusy] = useState(false);
  const test = async () => {
    setTestBusy(true);
    const r = await fetch("/api/admin/email-test", { method: "POST" });
    const d = await r.json();
    setTestBusy(false);
    notify(d.error || d.detail);
  };
  const send = async () => {
    if (!confirm("Send this email to ALL active users?")) return;
    setBusy(true);
    const r = await fetch("/api/admin/broadcast", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
    const d = await r.json();
    setBusy(false);
    notify(d.error || `Broadcast sent to ${d.sent}/${d.total} users.`);
    if (!d.error) setB({ subject: "", body: "", cta: "" });
  };
  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.teal }}>SMTP connection</p>
        <p className="text-sm mb-3" style={{ color: C.muted }}>
          Emails send through your own mailbox — configured in the server's <code>.env</code> (SMTP_HOST, SMTP_USER…). After editing .env, run <code>pm2 restart acclaira</code>.
        </p>
        <Btn variant="ghost" className="flex items-center gap-1.5 text-xs" onClick={test} disabled={testBusy}>
          <RefreshCw size={13} className={testBusy ? "animate-spin" : ""} /> Send test email to me
        </Btn>
      </Card>
      <Card>
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.teal }}>Marketing broadcast</p>
        <p className="text-xs mb-4" style={{ color: C.muted }}>Sends a branded email to every active user (max 500 per send).</p>
        <div className="space-y-3">
          <Field label="Subject" value={b.subject} onChange={(e) => setB({ ...b, subject: e.target.value })} placeholder="New: schedule your posts ⏰" />
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.ink }}>Message</label>
            <textarea rows={6} value={b.body} onChange={(e) => setB({ ...b, body: e.target.value })}
              placeholder="Write your announcement…" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={{ borderColor: C.line }} />
          </div>
          <Field label="Button label (optional — links to the app)" value={b.cta} onChange={(e) => setB({ ...b, cta: e.target.value })} placeholder="Try it now" />
          <Btn onClick={send} disabled={busy}>{busy ? "Sending…" : "Send to all users"}</Btn>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Inbox ---------- */
function InboxTab() {
  const [msgs, setMsgs] = useState([]);
  useEffect(() => { fetch("/api/admin/messages").then((r) => r.json()).then((d) => Array.isArray(d) && setMsgs(d)); }, []);
  return (
    <div className="bg-white rounded-2xl border divide-y max-w-3xl" style={{ borderColor: C.line }}>
      {msgs.map((m) => (
        <div key={m.id} className="p-4">
          <div className="flex justify-between items-baseline">
            <p className="text-sm font-semibold" style={{ color: C.ink }}>{m.name} <span className="font-normal text-xs" style={{ color: C.muted }}>· {m.email}</span></p>
            <span className="text-[11px]" style={{ color: C.muted }}>{m.created_at?.slice(0, 16)}</span>
          </div>
          <p className="text-sm mt-1.5" style={{ color: C.ink }}>{m.msg}</p>
        </div>
      ))}
      {msgs.length === 0 && <p className="p-6 text-sm text-center" style={{ color: C.muted }}>No messages yet.</p>}
    </div>
  );
}

/* ---------- Main ---------- */
export function AdminClient() {
  const { notify, el } = useToast();
  const [tab, setTab] = useState("overview");
  const tabs = [
    ["overview", "Overview", <BarChart3 size={14} key="o" />],
    ["users", "Users", <Users size={14} key="u" />],
    ["funds", "Funds", <Wallet size={14} key="f" />],
    ["costs", "Credit costs", <SlidersHorizontal size={14} key="c" />],
    ["health", "API status", <Activity size={14} key="h" />],
    ["email", "Email", <Inbox size={14} key="e" />],
    ["inbox", "Inbox", <Inbox size={14} key="i" />],
  ];
  return (
    <div className="max-w-4xl space-y-5">{el}
      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, l, ic]) => (
          <button key={id} onClick={() => setTab(id)} className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold"
            style={tab === id ? { background: C.violet, color: "#fff" } : { background: "#fff", color: C.muted, border: `1px solid ${C.line}` }}>
            {ic}{l}
          </button>
        ))}
      </div>
      {tab === "overview" && <Stats />}
      {tab === "users" && <UsersTab notify={notify} />}
      {tab === "funds" && <FundsTab notify={notify} />}
      {tab === "costs" && <CostsTab notify={notify} />}
      {tab === "health" && <HealthTab />}
      {tab === "email" && <EmailTab notify={notify} />}
      {tab === "inbox" && <InboxTab />}
    </div>
  );
}

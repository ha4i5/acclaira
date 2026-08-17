"use client";
import { useEffect, useState } from "react";
import { C, Btn, Field } from "./ui";
import { useToast } from "./dash";

export function AccountClient() {
  const { notify, el } = useToast();
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");
  const [pw, setPw] = useState({ current: "", next: "" });
  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => { setMe(d); setName(d.user?.name || ""); });
  }, []);
  const saveName = async () => {
    await fetch("/api/account", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
    notify("Profile saved.");
  };
  const savePw = async () => {
    const r = await fetch("/api/account", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
    });
    const d = await r.json();
    notify(d.error || "Password changed.");
    if (!d.error) setPw({ current: "", next: "" });
  };
  if (!me) return <p className="text-sm" style={{ color: C.muted }}>Loading…</p>;
  return (
    <div className="max-w-2xl space-y-4">{el}
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.line }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.teal }}>Profile</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Email" value={me.user.email} disabled />
        </div>
        <Btn className="mt-4" onClick={saveName}>Save profile</Btn>
      </div>
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.line }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.teal }}>Change password</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Current password" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <Field label="New password (6+ chars)" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
        </div>
        <Btn className="mt-4" onClick={savePw}>Change password</Btn>
      </div>
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.line }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.teal }}>Invite & earn</p>
        <p className="text-sm mb-3" style={{ color: C.muted }}>Share your link — every signup earns you bonus credits. <b style={{ color: C.violet }}>{me.user.referred || 0}</b> friends joined so far.</p>
        <div className="flex gap-2.5">
          <input readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${me.user.ref_code || ""}`}
            className="flex-1 rounded-lg border px-3 py-2.5 text-xs" style={{ borderColor: C.line, color: C.ink }} />
          <Btn variant="ghost" className="text-xs" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/register?ref=${me.user.ref_code}`); notify("Referral link copied!"); }}>Copy</Btn>
        </div>
      </div>
      <div className="bg-white rounded-2xl border divide-y" style={{ borderColor: C.line }}>
        <p className="p-4 text-xs font-bold uppercase tracking-wider" style={{ color: C.teal }}>Your payments</p>
        {me.transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold capitalize" style={{ color: C.ink }}>{t.method} · {t.note || "Top-up"}</p>
              <p className="text-xs" style={{ color: C.muted }}>{t.created_at?.slice(0, 16)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: C.tealDark }}>${t.amount}</p>
              <p className="text-xs" style={{ color: C.violet }}>+{t.credits} credits</p>
            </div>
          </div>
        ))}
        {me.transactions.length === 0 && <p className="p-5 text-sm" style={{ color: C.muted }}>No payments yet — see Billing for packages.</p>}
      </div>
    </div>
  );
}

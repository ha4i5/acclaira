"use client";
import { useState } from "react";
import Link from "next/link";
import { C, Logo, Btn, Field } from "./ui";

const Card = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center px-5" style={{ background: C.paper }}>
    <div className="w-full max-w-sm">
      <div className="flex justify-center mb-6"><Link href="/"><Logo /></Link></div>
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.line }}>{children}</div>
    </div>
  </div>
);

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async () => {
    await fetch("/api/auth/forgot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    setSent(true);
  };
  return (
    <Card>
      <h1 className="font-display font-semibold text-xl mb-1" style={{ color: C.ink }}>Forgot password</h1>
      {sent ? (
        <p className="text-sm mt-2" style={{ color: C.tealDark }}>If an account exists for that email, a reset link is on its way. Check your inbox (and spam).</p>
      ) : (<>
        <p className="text-xs mb-5" style={{ color: C.muted }}>We'll email you a link to set a new password.</p>
        <div className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Btn className="w-full" onClick={submit}>Send reset link</Btn>
        </div>
      </>)}
      <p className="text-xs mt-4 text-center" style={{ color: C.muted }}>
        <Link className="font-semibold" style={{ color: C.violet }} href="/login">Back to log in</Link>
      </p>
    </Card>
  );
}

export function ResetForm() {
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const submit = async () => {
    const token = new URLSearchParams(window.location.search).get("token");
    const r = await fetch("/api/auth/reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password: pw }) });
    const d = await r.json();
    if (d.error) setMsg(d.error); else setDone(true);
  };
  return (
    <Card>
      <h1 className="font-display font-semibold text-xl mb-1" style={{ color: C.ink }}>Set a new password</h1>
      {done ? (
        <p className="text-sm mt-2" style={{ color: C.tealDark }}>Password updated — <Link href="/login" className="font-semibold underline" style={{ color: C.violet }}>log in now</Link>.</p>
      ) : (<>
        <div className="space-y-4 mt-4">
          <Field label="New password (6+ chars)" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
          {msg && <p className="text-xs font-medium" style={{ color: "#BE1246" }}>{msg}</p>}
          <Btn className="w-full" onClick={submit}>Save password</Btn>
        </div>
      </>)}
    </Card>
  );
}

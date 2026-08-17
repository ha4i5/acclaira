"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { C, Logo, Btn, Field } from "./ui";

export default function AuthForm({ mode }) {
  const r = useRouter();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true); setErr("");
    const res = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, ref: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref") : null }) });
    const d = await res.json();
    setBusy(false);
    if (d.error) setErr(d.error); else r.push("/dashboard");
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: C.paper }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6"><Link href="/"><Logo /></Link></div>
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.line }}>
          <h1 className="font-display font-semibold text-xl mb-1" style={{ color: C.ink }}>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="text-xs mb-5" style={{ color: C.muted }}>{mode === "login" ? "Log in to your control room." : "Free to start — no card needed."}</p>
          <div className="space-y-4">
            {mode === "register" && <Field label="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ali Raza" />}
            <Field label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" />
            <Field label="Password" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="••••••••" />
            {mode === "login" && (
              <p className="text-xs -mt-1 text-right">
                <Link href="/forgot" className="font-semibold" style={{ color: C.violet }}>Forgot password?</Link>
              </p>
            )}
            {err && <p className="text-xs font-medium" style={{ color: "#BE1246" }}>{err}</p>}
            <Btn className="w-full" onClick={submit} disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</Btn>
          </div>
          <p className="text-xs mt-4 text-center" style={{ color: C.muted }}>
            {mode === "login" ? "New here? " : "Already have an account? "}
            <Link className="font-semibold" style={{ color: C.violet }} href={mode === "login" ? "/register" : "/login"}>
              {mode === "login" ? "Create account" : "Log in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

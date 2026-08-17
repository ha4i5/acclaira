"use client";
import Link from "next/link";
import { C, Logo, LogoMark, Btn, Field } from "./ui";
import { Newspaper, Globe, Video, ArrowRight, Check, Radio, Zap, Languages } from "lucide-react";
import { useState } from "react";

const TICKER = [
  "BREAKING — Acclaira turns one headline into a post, an article, and a video",
  "VIRAL — thumbnails designed to Meta & TikTok rules",
  "SEO — WordPress articles published with live URL",
  "URDU — AI voice over with word-by-word captions",
  "AUTO — caption, hashtags & keywords written for you",
];

export const Ticker = () => (
  <div className="overflow-hidden text-white" style={{ background: C.navy }}>
    <div className="ticker-track flex whitespace-nowrap py-2 w-max">
      {[...TICKER, ...TICKER].map((t, i) => (
        <span key={i} className="mx-6 text-xs font-semibold tracking-wide flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.teal }} />{t}
        </span>
      ))}
    </div>
  </div>
);

export const Nav = () => (
  <header className="sticky top-0 z-40 backdrop-blur bg-white/85 border-b" style={{ borderColor: C.line }}>
    <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
      <Link href="/" aria-label="Acclaira home"><Logo /></Link>
      <nav className="hidden sm:flex items-center gap-7 text-sm font-medium" style={{ color: C.muted }}>
        <Link href="/">Product</Link><Link href="/packages">Packages</Link><Link href="/contact">Contact</Link>
      </nav>
      <div className="flex items-center gap-2.5">
        <Link href="/login"><Btn variant="ghost">Log in</Btn></Link>
        <Link href="/register"><Btn>Start free</Btn></Link>
      </div>
    </div>
  </header>
);

export const Footer = () => (
  <footer className="text-white" style={{ background: C.navy }}>
    <div className="max-w-6xl mx-auto px-5 py-12 grid gap-8 sm:grid-cols-3">
      <div><Logo dark /><p className="text-sm mt-3 max-w-xs" style={{ color: "#9A95BB" }}>One headline in. A viral post, an SEO article, and an Urdu video out.</p></div>
      <div className="text-sm space-y-2.5" style={{ color: "#B9B4CE" }}>
        <p className="font-display font-semibold text-white mb-3">Product</p>
        <Link className="block" href="/packages">Packages</Link><Link className="block" href="/contact">Contact</Link>
      </div>
      <div className="text-sm space-y-2.5" style={{ color: "#B9B4CE" }}>
        <p className="font-display font-semibold text-white mb-3">Legal</p>
        <Link className="block" href="/privacy">Privacy policy</Link><Link className="block" href="/terms">Terms of service</Link>
      </div>
    </div>
    <div className="border-t border-white/10 py-4 text-center text-xs" style={{ color: "#7A75A0" }}>© 2026 Acclaira · acclaira.com</div>
  </footer>
);

export const Shell = ({ children }) => (
  <div className="bg-white min-h-screen flex flex-col"><Ticker /><Nav /><div className="flex-1">{children}</div><Footer /></div>
);

export function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] rounded-full px-3.5 py-1.5 mb-5" style={{ background: C.tealBg, color: C.tealDark }}>
          <Radio size={13} /> Your newsroom, on autopilot
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.08]" style={{ color: C.ink }}>
          One headline.<br /><span style={{ color: C.violet }}>Post. Article. Video.</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed max-w-md" style={{ color: C.muted }}>
          Acclaira turns breaking news into branded viral posts, SEO articles on your WordPress, and Urdu voice-over videos — captioned, hashtagged, and published.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register"><Btn className="flex items-center gap-2">Start free <ArrowRight size={15} /></Btn></Link>
          <Link href="/packages"><Btn variant="ghost">See packages</Btn></Link>
        </div>
        <p className="mt-4 text-xs" style={{ color: C.muted }}>No card needed · Built to Meta & TikTok posting rules</p>
      </div>
      <div className="relative mx-auto w-full max-w-sm">
        <div className="rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: C.line }}>
          <div className="aspect-square relative flex flex-col justify-end" style={{ background: `linear-gradient(160deg, ${C.violetDark}, ${C.navy})` }}>
            <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] font-bold text-white px-2.5 py-1 rounded" style={{ background: "#D6244F" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-white lamp-live" /> BREAKING
            </div>
            <div className="absolute top-4 right-4 opacity-90"><LogoMark size={26} /></div>
            <div className="p-5 pb-6">
              <p className="font-display font-bold text-white text-[22px] leading-snug">Govt announces major relief in petrol prices from tonight</p>
              <div className="mt-3 h-1 w-16 rounded" style={{ background: C.teal }} />
              <p className="mt-2.5 text-[11px] font-semibold" style={{ color: "#B9B4CE" }}>@acclaira · auto-generated</p>
            </div>
          </div>
          <div className="bg-white px-4 py-3 text-xs" style={{ color: C.muted }}>
            <span className="font-semibold" style={{ color: C.ink }}>Caption ready:</span> Big news for commuters tonight… 🔥 <span style={{ color: C.violet }}>#PetrolPrice #Breaking</span>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-3 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-lg flex items-center gap-1.5" style={{ background: C.tealDark }}>
          <Zap size={13} /> Generated in 12s
        </div>
      </div>
    </section>
  );
}

export function Modules() {
  const MODULES = [
    { icon: <Newspaper size={20} />, n: "Module 1", t: "Viral post generator", d: "Paste a headline, pick a design, get a branded thumbnail with caption, hashtags and keywords — posted to Facebook and Instagram by the rules." },
    { icon: <Globe size={20} />, n: "Module 2", t: "News → SEO article", d: "Reads news from your sources, writes the article, publishes to WordPress with a feature image, and drops the live URL in the first comment." },
    { icon: <Video size={20} />, n: "Module 3", t: "Urdu viral video", d: "Urdu voice over, word-by-word captions, auto cuts and crops — a vertical video rendered ready for Reels and TikTok." },
  ];
  return (
    <section className="border-t" style={{ background: C.paper, borderColor: C.line }}>
      <div className="max-w-6xl mx-auto px-5 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: C.teal }}>The pipeline</p>
        <h2 className="font-display font-bold text-3xl mb-10" style={{ color: C.ink }}>Three modules, one flow</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {MODULES.map((m) => (
            <div key={m.n} className="bg-white rounded-2xl border p-6" style={{ borderColor: C.line }}>
              <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white mb-4" style={{ background: C.violet }}>{m.icon}</div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.teal }}>{m.n}</p>
              <h3 className="font-display font-semibold text-lg mb-2" style={{ color: C.ink }}>{m.t}</h3>
              <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{m.d}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="text-white" style={{ background: C.violet }}>
        <div className="max-w-6xl mx-auto px-5 py-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <Languages size={28} style={{ color: C.teal }} />
            <div>
              <h3 className="font-display font-semibold text-xl">اردو میں وائرل ویڈیوز</h3>
              <p className="text-sm mt-1" style={{ color: "#CDC7EA" }}>Native Urdu voice over with viral-style captions — built for Pakistani news pages.</p>
            </div>
          </div>
          <Link href="/register"><Btn variant="teal">Try Module 3</Btn></Link>
        </div>
      </div>
    </section>
  );
}

export function PackagesGrid({ packages }) {
  return (
    <div className="grid md:grid-cols-3 gap-5 items-stretch">
      {packages.map((p) => (
        <div key={p.id} className="rounded-2xl border bg-white p-6 flex flex-col relative"
          style={{ borderColor: p.popular ? C.violet : C.line, borderWidth: p.popular ? 2 : 1 }}>
          {!!p.popular && <span className="absolute -top-3 left-6 text-[10px] font-bold uppercase tracking-wider text-white rounded-full px-2.5 py-1" style={{ background: C.violet }}>Most popular</span>}
          <h3 className="font-display font-semibold text-lg" style={{ color: C.ink }}>{p.name}</h3>
          <p className="mt-4 mb-5"><span className="font-display font-bold text-4xl" style={{ color: C.ink }}>${p.price}</span><span className="text-sm" style={{ color: C.muted }}> / month</span></p>
          <ul className="space-y-2.5 text-sm flex-1" style={{ color: C.ink }}>
            <li className="flex gap-2.5"><Check size={16} style={{ color: C.tealDark }} className="shrink-0 mt-0.5" />{p.credits} credits / month</li>
            <li className="flex gap-2.5"><Check size={16} style={{ color: C.tealDark }} className="shrink-0 mt-0.5" />{p.id === "starter" ? "Module 1" : p.id === "pro" ? "Modules 1 + 2" : "All 3 modules"}</li>
            <li className="flex gap-2.5"><Check size={16} style={{ color: C.tealDark }} className="shrink-0 mt-0.5" />{p.id === "starter" ? "Download thumbnails" : p.id === "pro" ? "WordPress + FB/IG auto-publish" : "Urdu video + TikTok + 5 seats"}</li>
          </ul>
          <Link href="/register" className="mt-6"><Btn variant={p.popular ? "primary" : "ghost"} className="w-full">Choose {p.name}</Btn></Link>
        </div>
      ))}
    </div>
  );
}

export function ContactForm() {
  const [state, setState] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);
  const submit = async () => {
    await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(state) });
    setSent(true);
  };
  if (sent) return <div className="rounded-2xl p-6 text-sm font-medium" style={{ background: C.tealBg, color: C.tealDark }}>Message sent. We'll reply at the email you provided.</div>;
  return (
    <div className="space-y-4">
      <Field label="Your name" value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} placeholder="Ali Raza" />
      <Field label="Email" type="email" value={state.email} onChange={(e) => setState({ ...state, email: e.target.value })} placeholder="you@example.com" />
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: C.ink }}>Message</label>
        <textarea rows={5} value={state.msg} onChange={(e) => setState({ ...state, msg: e.target.value })} placeholder="How can we help?"
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none bg-white" style={{ borderColor: C.line, color: C.ink }} />
      </div>
      <Btn onClick={submit}>Send message</Btn>
    </div>
  );
}

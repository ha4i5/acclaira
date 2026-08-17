"use client";
export const C = {
  violet: "#43318F", violetDark: "#352571", teal: "#3EC3AC", tealDark: "#0E8A72",
  navy: "#14102E", paper: "#F7F6FB", ink: "#241F45", muted: "#6E6A8A", line: "#E7E4F2",
  amber: "#D97706", amberBg: "#FEF3E2", tealBg: "#E6F7F3",
};

export const LogoMark = ({ size = 32, line = "#fff" }) => (
  <svg viewBox="0 0 256 228" width={size} height={(size * 228) / 256} aria-hidden="true">
    <g stroke={line} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M120,22 L22,202" strokeWidth="14" />
      <path d="M120,22 L178,202" strokeWidth="14" />
      <path d="M56,142 L152,142" strokeWidth="9" />
    </g>
    <g fill={C.teal}>
      <polygon points="30,182 202,105 208,119 36,196" />
      <polygon points="200,92 242,110 204,131" />
    </g>
  </svg>
);

export const Logo = ({ dark = false, size = 30 }) => (
  <span className="inline-flex items-center gap-2.5">
    <LogoMark size={size} line={dark ? "#fff" : C.violet} />
    <span className="font-display font-bold tracking-tight" style={{ color: dark ? "#fff" : C.violet, fontSize: size * 0.72 }}>acclaira</span>
  </span>
);

export const StatusLamp = ({ status }) => {
  const map = {
    off: { label: "Off air", dot: "#B9B4CE", bg: "#F1EFF8", text: C.muted },
    configured: { label: "Configured", dot: C.amber, bg: C.amberBg, text: "#8A5A00" },
    live: { label: "Live", dot: C.teal, bg: C.tealBg, text: C.tealDark },
  };
  const s = map[status] || map.off;
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.text }}>
      <span className={`h-2 w-2 rounded-full ${status === "live" ? "lamp-live" : ""}`} style={{ background: s.dot }} />{s.label}
    </span>
  );
};

export const Btn = ({ children, variant = "primary", className = "", ...rest }) => {
  const styles = {
    primary: { background: C.violet, color: "#fff" },
    teal: { background: C.teal, color: C.navy },
    ghost: { background: "#fff", color: C.violet, border: `1.5px solid ${C.line}` },
  };
  return (
    <button {...rest} style={styles[variant]}
      className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform active:scale-95 disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
};

export const Field = ({ label, hint, ...rest }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5" style={{ color: C.ink }}>{label}</label>
    <input {...rest} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none bg-white" style={{ borderColor: C.line, color: C.ink }} />
    {hint && <p className="text-[11px] mt-1.5" style={{ color: C.muted }}>{hint}</p>}
  </div>
);

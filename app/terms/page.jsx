import { Shell } from "@/components/Marketing";
const P = [
  "By using Acclaira you agree to publish content only through accounts and websites you own or are authorized to manage.",
  "You are responsible for the accuracy and legality of content you generate and publish, including compliance with Meta, TikTok, and Google platform policies and applicable copyright law.",
  "Credits reset monthly and do not roll over unless your package states otherwise. Refunds follow a 7-day money-back window on first purchase.",
  "We may suspend accounts that use the service for spam, misinformation campaigns, or content violating platform rules — this protects every customer's connected channels.",
  "Acclaira is provided as-is; scheduled maintenance and third-party API outages may temporarily pause publishing. Continued use after updates to these terms constitutes acceptance.",
];
export default function Terms() {
  return (
    <Shell>
      <div className="max-w-2xl mx-auto px-5 py-16 w-full">
        <h1 className="font-display font-bold text-3xl mb-6">Terms of service</h1>
        <div className="space-y-4 text-[15px] leading-relaxed">{P.map((p, i) => <p key={i}>{p}</p>)}</div>
        <p className="text-xs mt-8" style={{ color: "#6E6A8A" }}>Last updated August 2026 · Draft — replace with counsel-reviewed text before launch.</p>
      </div>
    </Shell>
  );
}

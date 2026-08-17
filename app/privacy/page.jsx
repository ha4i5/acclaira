import { Shell } from "@/components/Marketing";
const P = [
  "Acclaira stores your account details, connected-channel credentials, and generated content to operate the service. Credentials are encrypted at rest (AES-256) and never shared with third parties.",
  "Social platform tokens (Meta, TikTok) are used only to publish content you explicitly create and approve. Disconnect a channel any time from Settings to revoke access.",
  "Generated content, uploaded images, and analytics remain your property. We retain them while your account is active and delete them within 30 days of account deletion.",
  "We use essential cookies for login sessions only. Payment details are processed by Stripe or your selected local gateway and never touch our servers.",
  "For any privacy request, contact privacy@acclaira.com.",
];
export default function Privacy() {
  return (
    <Shell>
      <div className="max-w-2xl mx-auto px-5 py-16 w-full">
        <h1 className="font-display font-bold text-3xl mb-6">Privacy policy</h1>
        <div className="space-y-4 text-[15px] leading-relaxed">{P.map((p, i) => <p key={i}>{p}</p>)}</div>
        <p className="text-xs mt-8" style={{ color: "#6E6A8A" }}>Last updated August 2026 · Draft — replace with counsel-reviewed text before launch.</p>
      </div>
    </Shell>
  );
}

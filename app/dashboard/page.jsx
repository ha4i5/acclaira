import Link from "next/link";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function Overview() {
  const user = await getUser();
  const counts = db.prepare("SELECT module, COUNT(*) c FROM history WHERE user_id=? GROUP BY module").all(user.id);
  const get = (m) => counts.find((c) => c.module === m)?.c || 0;
  const cards = [
    ["Module 1 posts", get("Module 1"), "/dashboard/module-1"],
    ["Module 2 articles", get("Module 2"), "/dashboard/module-2"],
    ["Module 3 videos", get("Module 3"), "/dashboard/module-3"],
  ];
  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: "#241F45" }}>Control room</h1>
        <p className="text-xs mt-1" style={{ color: "#6E6A8A" }}>Signed in as {user.email} · {user.plan} plan · {user.credits} credits</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map(([l, n, href]) => (
          <Link key={l} href={href} className="bg-white rounded-2xl border p-5 block" style={{ borderColor: "#E7E4F2" }}>
            <p className="font-display font-bold text-3xl" style={{ color: "#43318F" }}>{n}</p>
            <p className="text-xs mt-1" style={{ color: "#6E6A8A" }}>{l}</p>
          </Link>
        ))}
      </div>
      <div className="rounded-2xl p-5 text-sm" style={{ background: "#FEF3E2", color: "#8A5A00" }}>
        <b>Getting started:</b> add your AI key in Settings → AI engines (required for generation), then connect WordPress and Meta. Channels stay Off air until you flip Go live.
      </div>
    </div>
  );
}

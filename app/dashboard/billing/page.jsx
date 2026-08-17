import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { PackagesGrid } from "@/components/Marketing";
export const dynamic = "force-dynamic";

export default async function Billing() {
  const user = await getUser();
  const packages = db.prepare("SELECT * FROM packages ORDER BY price").all();
  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="font-display font-bold text-2xl" style={{ color: "#241F45" }}>Billing & credits</h1>
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#E7E4F2" }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3EC3AC" }}>Current plan</p>
        <p className="font-display font-bold text-xl mt-1 capitalize" style={{ color: "#241F45" }}>{user.plan} · {user.credits} credits</p>
        <p className="text-xs mt-2" style={{ color: "#6E6A8A" }}>Checkout activates once Stripe or JazzCash keys are Live in Settings. Until then, admins can assign plans manually.</p>
      </div>
      <PackagesGrid packages={packages} />
    </div>
  );
}

import { Shell, PackagesGrid } from "@/components/Marketing";
import db from "@/lib/db";
export const dynamic = "force-dynamic";
export default function Packages() {
  const packages = db.prepare("SELECT * FROM packages ORDER BY price").all();
  return (
    <Shell>
      <div className="max-w-6xl mx-auto px-5 py-16 w-full">
        <p className="text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: "#3EC3AC" }}>Packages</p>
        <h1 className="font-display font-bold text-3xl mb-2">Pay for output, not seats</h1>
        <p className="text-sm mb-10" style={{ color: "#6E6A8A" }}>1 credit ≈ one thumbnail · 4 credits ≈ one article · 10 credits ≈ one video</p>
        <PackagesGrid packages={packages} />
        <p className="text-xs mt-8" style={{ color: "#6E6A8A" }}>Local payments (JazzCash / Easypaisa) available at checkout for Pakistan. Prices exclude tax.</p>
      </div>
    </Shell>
  );
}

import { AnalyticsClient } from "@/components/features";
export const dynamic = "force-dynamic";
export default function Page() {
  return (<div>
    <h1 className="font-display font-bold text-2xl mb-6" style={{ color: "#241F45" }}>Analytics</h1>
    <AnalyticsClient />
  </div>);
}

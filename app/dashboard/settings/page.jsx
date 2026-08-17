import { SettingsClient } from "@/components/dash";
export const dynamic = "force-dynamic";
export default function Page() {
  return (<div>
    <h1 className="font-display font-bold text-2xl mb-6" style={{ color: "#241F45" }}>Settings & connections</h1>
    <SettingsClient />
  </div>);
}

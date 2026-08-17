import { Module1 } from "@/components/dash";
export const dynamic = "force-dynamic";
export default function Page() {
  return (<div>
    <h1 className="font-display font-bold text-2xl mb-6" style={{ color: "#241F45" }}>Viral post generator</h1>
    <Module1 />
  </div>);
}

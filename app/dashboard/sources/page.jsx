import { Sources } from "@/components/dash";
export const dynamic = "force-dynamic";
export default function Page() {
  return (<div>
    <h1 className="font-display font-bold text-2xl mb-6" style={{ color: "#241F45" }}>News sources</h1>
    <Sources />
  </div>);
}

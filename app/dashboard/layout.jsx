import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getCost } from "@/lib/credits";
import { Logo } from "@/components/ui";
import { LogoutButton } from "@/components/dash";

export const dynamic = "force-dynamic";

const NAV = [
  ["/dashboard", "Overview"],
  ["/dashboard/module-1", "Module 1 · Viral posts"],
  ["/dashboard/module-2", "Module 2 · Articles"],
  ["/dashboard/module-3", "Module 3 · Urdu video"],
  ["/dashboard/drafts", "Auto-drafts"],
  ["/dashboard/scheduled", "Scheduled"],
  ["/dashboard/sources", "News sources"],
  ["/dashboard/brands", "Brands"],
  ["/dashboard/analytics", "Analytics"],
  ["/dashboard/history", "History"],
  ["/dashboard/billing", "Billing"],
  ["/dashboard/account", "Account"],
  ["/dashboard/settings", "Settings"],
];

export default async function DashLayout({ children }) {
  const user = await getUser();
  if (!user) redirect("/login");
  const nav = user.role === "admin" ? [...NAV, ["/dashboard/admin", "Admin"]] : NAV;
  const costs = { image: getCost("image"), article: getCost("article"), video: getCost("video") };
  return (
    <div className="min-h-screen flex" style={{ background: "#F7F6FB" }}>
      <aside className="w-60 shrink-0 hidden md:flex flex-col text-white" style={{ background: "#14102E" }}>
        <div className="px-5 pt-6 pb-6"><Logo dark size={26} /></div>
        <div className="mx-4 mb-5 rounded-xl px-4 py-3" style={{ background: "rgba(67,49,143,0.45)" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#3EC3AC" }}>Credits</p>
          <p className="font-display font-bold text-2xl leading-tight">{user.credits}</p>
          <p className="text-[10px] mt-0.5" style={{ color: "#B9B4CE" }}>
            post {costs.image} · article {costs.article} · video {costs.video}
          </p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className="block rounded-lg px-3 py-2.5 text-sm" style={{ color: "#B9B4CE" }}>{label}</Link>
          ))}
        </nav>
        <LogoutButton />
      </aside>
      <main className="flex-1 min-w-0 px-6 lg:px-10 py-8">
        {user.status === "suspended" && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm font-medium" style={{ background: "#FDF0F3", color: "#BE1246" }}>
            Your account is suspended — generation is paused. Contact support to restore access.
          </div>
        )}
        <p className="text-xs mb-6 md:hidden"><Link href="/dashboard" style={{ color: "#43318F", fontWeight: 600 }}>← Dashboard menu</Link></p>
        {children}
      </main>
    </div>
  );
}

import { Shell, ContactForm } from "@/components/Marketing";
export default function Contact() {
  return (
    <Shell>
      <div className="max-w-xl mx-auto px-5 py-16 w-full">
        <p className="text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: "#3EC3AC" }}>Contact</p>
        <h1 className="font-display font-bold text-3xl mb-2">Talk to us</h1>
        <p className="text-sm mb-8" style={{ color: "#6E6A8A" }}>Questions about packages, agency plans, or a custom template — we reply within a day.</p>
        <ContactForm />
      </div>
    </Shell>
  );
}

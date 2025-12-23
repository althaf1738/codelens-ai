import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact | InnovWayz" };

export default function ContactPage() {
  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Contact</h1>
        <p className="mt-3 text-slate-600">Tell us about your initiative. We typically reply within one business day.</p>
        <div className="mt-6">
          <div className="kbd">contact@innovwayz.com</div>
        </div>
      </div>
      <ContactForm />
    </section>
  );
}

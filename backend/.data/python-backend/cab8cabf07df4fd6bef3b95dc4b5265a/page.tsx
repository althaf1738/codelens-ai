import OfferingsGrid from "@/components/OfferingsGrid";

export const metadata = { title: "Offerings | InnovWayz" };

export default function OfferingsPage() {
  return (
    <>
      <section className="pb-6 pt-16 sm:pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Our Other Offerings</h1>
        <p className="mt-3 text-slate-600 max-w-prose">
          Digital Banking, RPA, IoT, and Fintech integrations to extend your capabilities.
        </p>
      </section>
      <OfferingsGrid />
    </>
  );
}

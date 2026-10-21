import type { Metadata } from "next";
import { pageContext } from "@/lib/page";
import { Page, SectionTitle } from "@/components/ui";
import { PlacesClient } from "./places-client";

export const metadata: Metadata = {
  title: "Cultural Map & Place Discovery · Interactive Atlas",
  description:
    "Explore sacred geography, living craft quarters, and architectural landmarks across India's cultural ecosystems.",
};

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { lang, t } = await pageContext();
  const sp = await searchParams;
  const initialCity = sp.city ?? "varanasi";

  return (
    <Page className="max-w-6xl pt-2">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-[#EFE9DC] via-[#E7DDCA] to-[#DFD7C7] p-8 sm:p-10 shadow-xs mb-6">
        <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-terracotta">
          <span>✦</span>
          <span>Interactive Cultural Atlas</span>
        </div>
        <h1 className="mt-2 font-serif text-page font-semibold text-charcoal md:text-page-lg">
          Explore Cultural Sites & Living Geography
        </h1>
        <p className="mt-2 max-w-2xl text-body text-secondary-text leading-relaxed">
          Discover sacred riverfronts, artisanal quarters, ancient stone observatories, and monument complexes across India&apos;s six pilot ecosystems.
        </p>
      </div>

      <PlacesClient
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        initialCity={initialCity}
      />
    </Page>
  );
}

import type { Metadata } from "next";
import { pageContext } from "@/lib/page";
import { Page } from "@/components/ui";
import { PlacesClient } from "./places-client";

export const metadata: Metadata = {
  title: "Cultural Map & Place Discovery · Interactive Atlas",
  description:
    "Explore sacred geography, living craft quarters, and architectural landmarks across India's cultural ecosystems.",
};

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; place?: string }>;
}) {
  await pageContext();
  const sp = await searchParams;
  const initialCity = sp.city ?? "varanasi";
  const initialPlaceId = sp.place;

  return (
    <Page className="max-w-[1536px] px-3 sm:px-6 pt-2">
      <div className="rounded-3xl border border-gold/25 bg-gradient-to-br from-[#171512] via-[#1a1714] to-[#12100d] p-6 sm:p-8 shadow-md mb-5">
        <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-gold">
          <span>✦</span>
          <span>Interactive Cultural Atlas</span>
        </div>
        <h1 className="mt-1.5 font-serif text-page font-semibold text-charcoal md:text-page-lg">
          Explore Cultural Sites & Sacred Geography
        </h1>
        <p className="mt-1.5 max-w-3xl text-body text-secondary-text leading-relaxed">
          Discover sacred riverfronts, artisanal weaving quarters, ancient stone observatories, and monument complexes across India&apos;s six pilot ecosystems.
        </p>
      </div>

      <PlacesClient
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        initialCity={initialCity}
        initialPlaceId={initialPlaceId}
      />
    </Page>
  );
}

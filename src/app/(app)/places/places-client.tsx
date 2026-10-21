"use client";

import { useState } from "react";
import Link from "next/link";
import { CITIES_CULTURAL_DATA, type CityCulturalData } from "@/lib/content/city-data";
import { FadeIn, PulsingDot } from "@/components/motion";
import { IconExternal, IconSearch } from "@/components/icons";

type CategoryFilter = "all" | "worship" | "craft" | "monument" | "public_space";

export function PlacesClient({
  googleMapsApiKey,
  initialCity = "varanasi",
}: {
  googleMapsApiKey?: string;
  initialCity?: string;
}) {
  const [selectedCitySlug, setSelectedCitySlug] = useState<string>(initialCity);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const currentCityData: CityCulturalData =
    CITIES_CULTURAL_DATA[selectedCitySlug] ?? CITIES_CULTURAL_DATA.varanasi;

  const filteredLandmarks = currentCityData.landmarks.filter((lm) => {
    const matchesCategory =
      categoryFilter === "all" ? true : lm.type === categoryFilter;
    const matchesSearch = searchQuery
      ? lm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lm.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const [selectedLandmark, setSelectedLandmark] = useState(
    currentCityData.landmarks[0] ?? null,
  );

  // Switch city handler
  const handleCityChange = (citySlug: string) => {
    setSelectedCitySlug(citySlug);
    const newCity = CITIES_CULTURAL_DATA[citySlug] ?? CITIES_CULTURAL_DATA.varanasi;
    setSelectedLandmark(newCity.landmarks[0] ?? null);
  };

  const hasMapsKey = !!googleMapsApiKey;

  return (
    <div className="space-y-6">
      {/* City Switcher & Category Filter Bar */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* City selector pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-meta font-semibold uppercase tracking-wider text-gold mr-1">
              City:
            </span>
            {Object.keys(CITIES_CULTURAL_DATA).map((slug) => {
              const active = slug === selectedCitySlug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => handleCityChange(slug)}
                  className={`rounded-full px-4 py-1.5 text-support font-semibold capitalize transition-all ${
                    active
                      ? "bg-forest text-on-forest shadow-xs"
                      : "bg-elevated border border-border text-secondary-text hover:bg-surface hover:border-gold/40 hover:text-charcoal"
                  }`}
                >
                  {slug}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <IconSearch
              width={16}
              height={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-surface-2 py-1.5 pl-9 pr-3 text-meta text-charcoal placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
          <span className="text-meta font-medium text-muted mr-1">Filter by type:</span>
          {(
            [
              { id: "all", label: "All Sites" },
              { id: "public_space", label: "Ghats & Public Spaces" },
              { id: "worship", label: "Sacred & Temples" },
              { id: "craft", label: "Craft & Artisan Quarters" },
              { id: "monument", label: "Monuments & Heritage" },
            ] as const
          ).map((cat) => {
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-md px-3 py-1 text-meta font-medium transition-colors ${
                  active
                    ? "bg-gold/15 border border-gold/40 text-gold font-semibold"
                    : "border border-border bg-elevated text-muted hover:text-charcoal hover:bg-surface"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3-Column Layout: Landmark List | Map View | Place Detail */}
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr_20rem]">
        {/* Left: Landmark List */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-serif text-support font-semibold text-charcoal">
              Cultural Places ({filteredLandmarks.length})
            </h2>
            <span className="text-[11px] text-muted">Click to inspect</span>
          </div>

          {filteredLandmarks.length === 0 ? (
            <p className="mt-4 text-meta text-muted">No landmarks match the selected filter.</p>
          ) : (
            <ul className="mt-3 space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredLandmarks.map((lm) => {
                const isSelected = selectedLandmark?.id === lm.id;
                return (
                  <li key={lm.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedLandmark(lm)}
                      className={`w-full text-left rounded-lg p-3 transition-all ${
                        isSelected
                          ? "border border-forest bg-forest/10 ring-1 ring-forest/30 shadow-xs"
                          : "border border-border/70 bg-surface hover:border-forest/40 hover:bg-surface-2"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="font-serif text-support font-semibold text-charcoal leading-snug">
                          {lm.name}
                        </p>
                        <span className="rounded-xs bg-elevated border border-border/70 px-1.5 py-0.5 text-[10px] uppercase font-semibold text-muted">
                          {lm.type.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-meta text-muted line-clamp-2 leading-relaxed">
                        {lm.description}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Center: Interactive Map / Topographic Atlas */}
        <div className="relative min-h-[460px] overflow-hidden rounded-xl border border-border bg-stone shadow-xs">
          {hasMapsKey && selectedLandmark ? (
            <iframe
              title={`Map of ${selectedLandmark.name}`}
              width="100%"
              height="100%"
              className="absolute inset-0 border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(
                selectedLandmark.name,
              )}+${encodeURIComponent(selectedCitySlug)}`}
            />
          ) : (
            /* Honest degraded state matching Master Spec §8.2 & Screen 8 */
            <div className="relative flex h-full min-h-[460px] flex-col justify-between p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-surface/90 border border-border px-3 py-1 text-meta font-semibold text-forest shadow-2xs backdrop-blur-xs">
                  Topographic Cultural Atlas
                </span>
                <span className="rounded-full bg-surface/80 border border-border px-2.5 py-1 text-[11px] text-muted backdrop-blur-xs">
                  {currentCityData.region}
                </span>
              </div>

              {/* Geographic Schematic Card */}
              <div className="my-auto py-8 text-center max-w-md mx-auto">
                <FadeIn key={selectedLandmark?.id ?? currentCityData.slug} duration={0.35} y={10}>
                  <div className="rounded-2xl border border-border bg-surface/95 p-6 shadow-sm backdrop-blur-md">
                    <div className="flex justify-center mb-2">
                      <PulsingDot />
                    </div>
                    <p className="text-meta font-semibold uppercase tracking-wider text-terracotta">
                      Active Coordinates
                    </p>
                    <h3 className="mt-1 font-serif text-section font-semibold text-charcoal">
                      {selectedLandmark?.name ?? currentCityData.slug}
                    </h3>
                    <p className="mt-1 font-mono text-support text-muted">
                      {selectedLandmark
                        ? `${selectedLandmark.coordinates.lat.toFixed(4)}°N, ${selectedLandmark.coordinates.lng.toFixed(4)}°E`
                        : `${currentCityData.coordinates.lat.toFixed(4)}°N, ${currentCityData.coordinates.lng.toFixed(4)}°E`}
                    </p>
                    <p className="mt-3 text-support text-muted leading-relaxed">
                      {selectedLandmark?.description}
                    </p>
                    <div className="mt-5">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${selectedLandmark?.name ?? ""}, ${selectedCitySlug}`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-forest px-5 text-meta font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors"
                      >
                        Open in External Google Maps <IconExternal width={13} height={13} />
                      </a>
                    </div>
                  </div>
                </FadeIn>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>WGS84 Verified Coordinates</span>
                <span>TattvaCo Cultural Geometry</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Selected Place Detail Inspection Panel */}
        <aside className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">
          {selectedLandmark ? (
            <FadeIn key={selectedLandmark.id} duration={0.3} y={8} className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-meta font-semibold text-forest">
                    {selectedLandmark.type.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono text-muted">
                    {selectedLandmark.coordinates.lat.toFixed(2)}°N
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-section font-semibold text-charcoal">
                  {selectedLandmark.name}
                </h3>
                <p className="mt-2 text-support text-muted leading-relaxed">
                  {selectedLandmark.description}
                </p>
              </div>

              <div className="border-t border-border pt-4 space-y-3 text-meta">
                <div>
                  <span className="font-semibold text-charcoal">City Ecosystem:</span>
                  <p className="text-muted capitalize">{selectedCitySlug}</p>
                </div>
                <div>
                  <span className="font-semibold text-charcoal">Cultural Significance:</span>
                  <p className="text-muted leading-snug">
                    Living heritage site integral to pilgrimage circuits, riverfront rituals, and community gathering.
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <Link
                  href={`/cities/${selectedCitySlug}`}
                  className="block text-center rounded-lg border border-border bg-surface-2 p-2.5 text-support font-semibold text-charcoal hover:bg-surface hover:border-forest/50 transition-colors"
                >
                  Explore {selectedCitySlug} City Guide →
                </Link>
                <Link
                  href={`/ask?q=${encodeURIComponent(
                    `Tell me about the history and cultural significance of ${selectedLandmark.name} in ${selectedCitySlug}`,
                  )}`}
                  className="block text-center rounded-lg bg-forest p-2.5 text-support font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors"
                >
                  Ask TattvaCo About This Site ✦
                </Link>
              </div>
            </FadeIn>
          ) : (
            <p className="text-support text-muted">Select a landmark from the list to view detailed cultural significance.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

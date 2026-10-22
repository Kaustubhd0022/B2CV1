"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { PILOT_PLACES, type PlaceDetail, type PlaceType } from "@/lib/data/pilot-places";
import { InteractiveCulturalMap } from "@/components/interactive-cultural-map";
import { PlaceDetailPanel } from "@/components/place-detail-panel";
import { IconSearch } from "@/components/icons";

interface PlacesClientProps {
  googleMapsApiKey?: string;
  initialCity?: string;
  initialPlaceId?: string;
}

const CITY_LABELS: Record<string, string> = {
  varanasi: "Varanasi",
  jaipur: "Jaipur",
  hampi: "Hampi",
  kochi: "Kochi",
  kolkata: "Kolkata",
  madurai: "Madurai",
};

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  varanasi: { lat: 25.3176, lng: 82.9739 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  hampi: { lat: 15.3351, lng: 76.46 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  madurai: { lat: 9.9252, lng: 78.1198 },
};

export function PlacesClient({
  googleMapsApiKey,
  initialCity = "varanasi",
  initialPlaceId,
}: PlacesClientProps) {
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [categoryFilter, setCategoryFilter] = useState<PlaceType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileTab, setMobileTab] = useState<"list" | "map" | "detail">("map");

  const cityPlaces = useMemo(() => {
    return PILOT_PLACES[selectedCity] ?? PILOT_PLACES.varanasi;
  }, [selectedCity]);

  const [selectedPlace, setSelectedPlace] = useState<PlaceDetail>(() => {
    if (initialPlaceId) {
      const found = cityPlaces.find((p) => p.id === initialPlaceId);
      if (found) return found;
    }
    return cityPlaces[0];
  });

  // Handle city selection change
  const handleCityChange = (citySlug: string) => {
    setSelectedCity(citySlug);
    setCategoryFilter("all");
    setSearchQuery("");
    const newPlaces = PILOT_PLACES[citySlug] ?? PILOT_PLACES.varanasi;
    if (newPlaces.length > 0) {
      setSelectedPlace(newPlaces[0]);
    }
  };

  // Filter places based on category and search query
  const filteredPlaces = useMemo(() => {
    return cityPlaces.filter((place) => {
      const matchesCategory =
        categoryFilter === "all" ? true : place.type === categoryFilter;
      const matchesSearch = searchQuery
        ? place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.typeLabel.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [cityPlaces, categoryFilter, searchQuery]);

  // Handle place selection from map or list
  const handleSelectPlace = (place: PlaceDetail) => {
    setSelectedPlace(place);
    // On mobile, automatically show the place detail tab
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileTab("detail");
    }
  };

  // Theme quick-filters on map
  const handleThemeSelect = (themeId: string) => {
    if (themeId === "ghats") setCategoryFilter("public_space");
    else if (themeId === "crafts") setCategoryFilter("craft");
    else if (themeId === "temples") setCategoryFilter("worship");
    else if (themeId === "heritage") setCategoryFilter("monument");
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: cityPlaces.length,
      worship: 0,
      public_space: 0,
      craft: 0,
      monument: 0,
    };
    cityPlaces.forEach((p) => {
      if (p.type in counts) {
        counts[p.type as keyof typeof counts] += 1;
      }
    });
    return counts;
  }, [cityPlaces]);

  return (
    <div className="space-y-4">
      {/* Top Filter and City Selector Toolbar (Reference Page 8) */}
      <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* City Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gold mr-1.5">
              Pilot City:
            </span>
            {Object.keys(CITY_LABELS).map((slug) => {
              const active = slug === selectedCity;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => handleCityChange(slug)}
                  className={`rounded-full px-3.5 py-1 text-meta font-semibold transition-all ${
                    active
                      ? "bg-gold text-[#12100e] shadow-xs"
                      : "bg-surface-2 border border-border/70 text-secondary-text hover:border-gold/40 hover:text-charcoal"
                  }`}
                >
                  {CITY_LABELS[slug]}
                </button>
              );
            })}
          </div>

          {/* Search Input Box */}
          <div className="relative w-full md:w-72">
            <IconSearch
              width={15}
              height={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder={`Search ${CITY_LABELS[selectedCity]} places...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-surface-2 py-1.5 pl-9 pr-3 text-meta text-charcoal placeholder:text-muted focus:border-gold focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills Row */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
          <span className="text-[11px] font-medium text-muted mr-1.5">Category:</span>
          {(
            [
              { id: "all", label: "All Sites", count: categoryCounts.all },
              { id: "public_space", label: "Ghats & Riverfronts", count: categoryCounts.public_space },
              { id: "worship", label: "Temples & Sacred", count: categoryCounts.worship },
              { id: "craft", label: "Craft & Artisan", count: categoryCounts.craft },
              { id: "monument", label: "Monuments & Heritage", count: categoryCounts.monument },
            ] as const
          ).map((cat) => {
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-gold/15 border border-gold/50 text-gold font-semibold"
                    : "border border-border/70 bg-surface-2/60 text-secondary-text hover:text-charcoal hover:bg-surface-2"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile View Toggle Bar (< 1024px) */}
      <div className="lg:hidden flex rounded-xl border border-border/80 bg-surface p-1 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileTab("list")}
          className={`flex-1 rounded-lg py-2 text-center text-meta font-semibold transition-colors ${
            mobileTab === "list"
              ? "bg-forest text-on-forest"
              : "text-muted hover:text-charcoal"
          }`}
        >
          Places List ({filteredPlaces.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("map")}
          className={`flex-1 rounded-lg py-2 text-center text-meta font-semibold transition-colors ${
            mobileTab === "map"
              ? "bg-forest text-on-forest"
              : "text-muted hover:text-charcoal"
          }`}
        >
          Interactive Map
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("detail")}
          className={`flex-1 rounded-lg py-2 text-center text-meta font-semibold transition-colors ${
            mobileTab === "detail"
              ? "bg-forest text-on-forest"
              : "text-muted hover:text-charcoal"
          }`}
        >
          Place Detail
        </button>
      </div>

      {/* Main 3-Panel Layout (Desktop: 3 Columns matching Reference Page 8) */}
      <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)_22rem] xl:grid-cols-[19rem_minmax(0,1fr)_24rem]">
        {/* Panel 1 (Left): Places List */}
        <div
          className={`min-w-0 rounded-2xl border border-border/80 bg-surface p-4 shadow-xs flex flex-col h-[640px] ${
            mobileTab === "list" ? "block" : "hidden lg:flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <h2 className="font-serif text-support font-semibold text-charcoal">
              {CITY_LABELS[selectedCity]} Places
            </h2>
            <span className="text-[11px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/25">
              {filteredPlaces.length} sites
            </span>
          </div>

          {filteredPlaces.length === 0 ? (
            <div className="my-auto py-8 text-center">
              <p className="text-support text-muted">No places match this query.</p>
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter("all");
                  setSearchQuery("");
                }}
                className="mt-3 text-meta font-semibold text-gold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <ul className="mt-3 space-y-2.5 overflow-y-auto pr-1 flex-1">
              {filteredPlaces.map((place) => {
                const isSelected = selectedPlace?.id === place.id;
                return (
                  <li key={place.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectPlace(place)}
                      className={`w-full text-left rounded-xl p-2.5 transition-all flex gap-3 ${
                        isSelected
                          ? "border border-gold bg-gold/10 ring-1 ring-gold/30 shadow-xs"
                          : "border border-border/70 bg-surface hover:border-gold/30 hover:bg-surface-2"
                      }`}
                    >
                      {/* Place Thumbnail */}
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone">
                        <Image
                          src={place.image}
                          alt={place.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      {/* Title & Meta */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-serif text-support font-semibold text-charcoal leading-snug truncate">
                            {place.name}
                          </h3>
                        </div>
                        <p className="text-[11px] uppercase tracking-wider text-gold font-medium mt-0.5">
                          {place.typeLabel}
                        </p>
                        <p className="mt-1 text-meta text-muted line-clamp-1">
                          {place.subtitle}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Panel 2 (Center): Interactive Cultural Map */}
        <div
          className={`min-w-0 h-[640px] ${
            mobileTab === "map" ? "block" : "hidden lg:block"
          }`}
        >
          <InteractiveCulturalMap
            places={filteredPlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={handleSelectPlace}
            cityName={CITY_LABELS[selectedCity]}
            citySlug={selectedCity}
            coordinates={CITY_COORDINATES[selectedCity]}
            googleMapsApiKey={googleMapsApiKey}
            onThemeSelect={handleThemeSelect}
          />
        </div>

        {/* Panel 3 (Right): Place Detail View */}
        <div
          className={`min-w-0 ${
            mobileTab === "detail" ? "block" : "hidden lg:block"
          }`}
        >
          {selectedPlace ? (
            <PlaceDetailPanel
              place={selectedPlace}
              onClose={() => setMobileTab("map")}
              isMobileDrawer={false}
            />
          ) : (
            <div className="h-[640px] flex items-center justify-center rounded-2xl border border-border bg-surface p-6 text-center text-muted">
              Select a place from the list or map to view cultural details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { CityCulturalData } from "@/lib/content/city-data";
import { IconExternal } from "./icons";
import { cx } from "./ui";

export function CityMapPanel({
  city,
  cityName,
  googleMapsApiKey,
}: {
  city: CityCulturalData;
  cityName: string;
  googleMapsApiKey?: string;
}) {
  const [activeLandmark, setActiveLandmark] = useState(city.landmarks[0]);
  const hasMapsKey = !!googleMapsApiKey;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 md:p-6" aria-labelledby="city-map-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full bg-terracotta" aria-hidden="true" />
            <h2 id="city-map-title" className="text-card font-semibold text-charcoal">
              {cityName} · Cultural Geography & Landmarks
            </h2>
          </div>
          <p className="mt-1 text-meta text-muted">
            {city.region} · Coordinates: {city.coordinates.lat.toFixed(4)}° N, {city.coordinates.lng.toFixed(4)}° E
          </p>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${city.coordinates.lat},${city.coordinates.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border px-3.5 text-meta font-semibold text-charcoal hover:bg-surface-2"
        >
          Open in Google Maps <IconExternal width={14} height={14} />
        </a>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Map View / Fallback Visualizer */}
        <div className="relative min-h-[320px] overflow-hidden rounded-md border border-border bg-stone">
          {hasMapsKey ? (
            <iframe
              title={`Map of ${cityName}`}
              width="100%"
              height="100%"
              className="absolute inset-0 border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(
                activeLandmark?.name ?? cityName,
              )}+${encodeURIComponent(cityName)}`}
            />
          ) : (
            // Honest degraded state (Master Spec Section 8.2 & Screen 10)
            <div className="relative flex h-full min-h-[320px] flex-col justify-between p-5">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full bg-canvas/80 px-3 py-1 text-meta font-medium text-muted backdrop-blur-sm">
                  Topographic Cultural Atlas Fallback
                </span>
                <span className="text-[11px] text-muted/80">
                  Google Maps API not configured · showing verified coordinates
                </span>
              </div>

              {/* Cultural Landmarks Schematic Overlay */}
              <div className="my-auto py-6">
                <div className="mx-auto max-w-sm rounded-xl border border-border bg-surface p-5 shadow-lg backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-gold/15 border border-gold/30 px-2.5 py-0.5 text-meta font-semibold text-gold">
                      {activeLandmark.type.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="font-mono text-meta text-muted">
                      {activeLandmark.coordinates.lat.toFixed(4)}°N, {activeLandmark.coordinates.lng.toFixed(4)}°E
                    </span>
                  </div>
                  <h3 className="mt-2 text-section font-semibold text-charcoal">{activeLandmark.name}</h3>
                  <p className="mt-1 text-support text-muted leading-relaxed">{activeLandmark.description}</p>
                  <div className="mt-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${activeLandmark.name}, ${cityName}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-meta font-semibold text-gold hover:underline"
                    >
                      Get directions for this landmark <IconExternal width={13} height={13} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-meta text-muted">
                <span>Verified by TattvaCo Cultural Knowledge Registry</span>
                <span>Spatial Reference: WGS84</span>
              </div>
            </div>
          )}
        </div>

        {/* Landmark Selector List */}
        <div>
          <h3 className="text-support font-semibold uppercase tracking-wider text-muted">Key Heritage Sites ({city.landmarks.length})</h3>
          <ul className="mt-3 space-y-2">
            {city.landmarks.map((landmark) => {
              const isSelected = activeLandmark.id === landmark.id;
              return (
                <li key={landmark.id}>
                  <button
                    type="button"
                    onClick={() => setActiveLandmark(landmark)}
                    className={cx(
                      "w-full rounded-md border p-3 text-left transition-colors",
                      isSelected
                        ? "border-forest bg-forest/10 ring-1 ring-forest/30 shadow-xs"
                        : "border-border bg-surface hover:border-forest/40 hover:bg-surface-2",
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-support font-semibold text-charcoal">{landmark.name}</span>
                      <span className="text-[11px] uppercase tracking-wider text-muted">
                        {landmark.type.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-meta text-muted">{landmark.description}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

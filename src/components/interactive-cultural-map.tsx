"use client";

import { useState } from "react";
import type { PlaceDetail } from "@/lib/data/pilot-places";
import { IconExternal } from "./icons";

interface InteractiveCulturalMapProps {
  places: PlaceDetail[];
  selectedPlace: PlaceDetail | null;
  onSelectPlace: (place: PlaceDetail) => void;
  cityName: string;
  citySlug: string;
  coordinates: { lat: number; lng: number };
  googleMapsApiKey?: string;
  onThemeSelect?: (theme: string) => void;
}

export function InteractiveCulturalMap({
  places,
  selectedPlace,
  onSelectPlace,
  cityName,
  citySlug,
  coordinates,
  googleMapsApiKey,
  onThemeSelect,
}: InteractiveCulturalMapProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"atlas" | "satellite">("atlas");
  const hasMapsKey = !!googleMapsApiKey;

  // River curve and contour paths based on city
  const isVaranasi = citySlug === "varanasi";
  const isHampi = citySlug === "hampi";
  const isKochi = citySlug === "kochi";
  const isKolkata = citySlug === "kolkata";

  return (
    <div className="relative flex flex-col h-full min-h-[500px] lg:min-h-[640px] rounded-2xl border border-border/80 bg-[#12100e] overflow-hidden shadow-sm">
      {/* Top Map Status Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-surface/90 border border-border/80 px-3.5 py-1.5 shadow-md backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
          <span className="text-meta font-semibold text-charcoal">
            Topographic Atlas · {cityName}
          </span>
          <span className="text-[11px] text-muted border-l border-border/80 pl-2 font-mono">
            {coordinates.lat.toFixed(3)}°N, {coordinates.lng.toFixed(3)}°E
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          {hasMapsKey && (
            <div className="flex rounded-full bg-surface/90 border border-border/80 p-0.5 shadow-md backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode("atlas")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  viewMode === "atlas"
                    ? "bg-forest text-on-forest"
                    : "text-muted hover:text-charcoal"
                }`}
              >
                Cultural Atlas
              </button>
              <button
                type="button"
                onClick={() => setViewMode("satellite")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  viewMode === "satellite"
                    ? "bg-forest text-on-forest"
                    : "text-muted hover:text-charcoal"
                }`}
              >
                Google Maps
              </button>
            </div>
          )}

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${selectedPlace?.name ?? cityName}, ${cityName}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-surface/90 border border-border/80 px-3 py-1.5 text-[11px] font-semibold text-charcoal shadow-md backdrop-blur-md hover:bg-surface hover:border-gold/40 transition-colors inline-flex items-center gap-1"
          >
            Open Maps <IconExternal width={11} height={11} />
          </a>
        </div>
      </div>

      {/* Main Map Canvas */}
      {viewMode === "satellite" && hasMapsKey && selectedPlace ? (
        <iframe
          title={`Map of ${selectedPlace.name}`}
          width="100%"
          height="100%"
          className="absolute inset-0 border-0 h-full w-full"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(
            selectedPlace.name,
          )}+${encodeURIComponent(cityName)}`}
        />
      ) : (
        /* Rich Interactive SVG Topographic Cultural Atlas */
        <div className="relative w-full h-full flex-1 overflow-hidden select-none">
          <svg
            viewBox="0 0 1000 700"
            className="w-full h-full object-cover transition-transform duration-300 ease-out"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
            }}
          >
            <defs>
              {/* Radial gradient for topographic background depth */}
              <radialGradient id="mapGlow" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="#1c1814" />
                <stop offset="60%" stopColor="#14110e" />
                <stop offset="100%" stopColor="#0c0a09" />
              </radialGradient>

              {/* River water gradient */}
              <linearGradient id="riverWater" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a2e38" />
                <stop offset="50%" stopColor="#132731" />
                <stop offset="100%" stopColor="#0e1f28" />
              </linearGradient>

              {/* Gold pin gradient */}
              <linearGradient id="goldPin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E6C875" />
                <stop offset="100%" stopColor="#D6B36A" />
              </linearGradient>

              {/* Grid pattern */}
              <pattern id="coordGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#2a241e" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>

            {/* Background canvas */}
            <rect width="1000" height="700" fill="url(#mapGlow)" />
            <rect width="1000" height="700" fill="url(#coordGrid)" />

            {/* Topographic Contour Lines */}
            <g stroke="#3a3026" strokeWidth="0.75" fill="none" opacity="0.35" strokeDasharray="3 3">
              <ellipse cx="480" cy="350" rx="420" ry="280" />
              <ellipse cx="490" cy="360" rx="360" ry="240" />
              <ellipse cx="500" cy="370" rx="300" ry="200" />
              <ellipse cx="510" cy="380" rx="240" ry="160" />
              <ellipse cx="520" cy="390" rx="180" ry="120" />
            </g>

            {/* Sacred River Curve (Ganga for Varanasi crescent bend, Tungabhadra for Hampi, etc.) */}
            {isVaranasi && (
              <g id="ganga-corridor">
                {/* River water body */}
                <path
                  d="M 680 0 C 640 180, 580 340, 520 480 C 460 600, 360 670, 280 700 L 420 700 C 510 670, 620 590, 700 460 C 760 320, 840 160, 900 0 Z"
                  fill="url(#riverWater)"
                  opacity="0.95"
                />
                {/* River bank contour */}
                <path
                  d="M 680 0 C 640 180, 580 340, 520 480 C 460 600, 360 670, 280 700"
                  stroke="#D6B36A"
                  strokeWidth="2.5"
                  fill="none"
                  strokeOpacity="0.6"
                />
                {/* Ghat stepped lines */}
                <path
                  d="M 670 10 C 632 185, 572 345, 512 485 C 452 605, 352 675, 272 700"
                  stroke="#8B7348"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="4 2"
                  strokeOpacity="0.5"
                />
                {/* River label along the crescent */}
                <text
                  x="630"
                  y="260"
                  fill="#789ba6"
                  fontSize="13"
                  fontFamily="serif"
                  fontStyle="italic"
                  letterSpacing="4"
                  opacity="0.8"
                  transform="rotate(68 630 260)"
                >
                  RIVER GANGA (UTTARAVAHINI CRESCENT)
                </text>
              </g>
            )}

            {isHampi && (
              <g id="tungabhadra-corridor">
                <path
                  d="M 0 320 C 250 300, 400 380, 650 330 C 850 290, 920 340, 1000 320 L 1000 400 C 920 420, 840 370, 640 410 C 390 460, 240 380, 0 400 Z"
                  fill="url(#riverWater)"
                  opacity="0.9"
                />
                <text x="450" y="375" fill="#789ba6" fontSize="12" fontFamily="serif" fontStyle="italic" letterSpacing="3" opacity="0.8">
                  TUNGABHADRA RIVER
                </text>
              </g>
            )}

            {isKochi && (
              <g id="kochi-lagoon">
                <path
                  d="M 750 0 C 720 200, 680 400, 650 700 L 1000 700 L 1000 0 Z"
                  fill="url(#riverWater)"
                  opacity="0.9"
                />
                <text x="800" y="320" fill="#789ba6" fontSize="12" fontFamily="serif" fontStyle="italic" letterSpacing="3" opacity="0.8" transform="rotate(85 800 320)">
                  VEMBANAD ESTUARY & ARABIAN SEA
                </text>
              </g>
            )}

            {isKolkata && (
              <g id="hooghly-corridor">
                <path
                  d="M 400 0 C 420 220, 380 440, 360 700 L 460 700 C 480 440, 520 220, 500 0 Z"
                  fill="url(#riverWater)"
                  opacity="0.9"
                />
                <text x="440" y="340" fill="#789ba6" fontSize="12" fontFamily="serif" fontStyle="italic" letterSpacing="3" opacity="0.8" transform="rotate(88 440 340)">
                  HOOGHLY RIVER (BHAGIRATHI)
                </text>
              </g>
            )}

            {/* Cultural Geography Pathways / Grid */}
            <g stroke="#3a3026" strokeWidth="1" fill="none" opacity="0.4">
              <path d="M 100 200 Q 300 300 500 250 T 900 200" />
              <path d="M 200 600 Q 400 500 600 550 T 800 600" />
              <path d="M 300 100 Q 350 400 320 650" />
              <path d="M 700 100 Q 650 400 680 650" />
            </g>

            {/* Interactive Cultural Place Pins */}
            {places.map((place) => {
              const posX = (place.mapPosition.x / 100) * 1000;
              const posY = (place.mapPosition.y / 100) * 700;
              const isSelected = selectedPlace?.id === place.id;

              return (
                <g
                  key={place.id}
                  className="cursor-pointer transition-all duration-200 group"
                  onClick={() => onSelectPlace(place)}
                >
                  {/* Pulsing ring for active or hovered pin */}
                  {isSelected && (
                    <circle
                      cx={posX}
                      cy={posY}
                      r="26"
                      fill="none"
                      stroke="#D6B36A"
                      strokeWidth="2"
                      opacity="0.75"
                      className="animate-ping"
                    />
                  )}

                  {/* Outer circle halo */}
                  <circle
                    cx={posX}
                    cy={posY}
                    r={isSelected ? "18" : "13"}
                    fill={isSelected ? "#1a1612" : "#221c16"}
                    stroke={isSelected ? "#D6B36A" : "#8c7043"}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    className="drop-shadow-md group-hover:stroke-gold transition-all"
                  />

                  {/* Inner Icon / Pin Badge */}
                  <circle
                    cx={posX}
                    cy={posY}
                    r={isSelected ? "7" : "5"}
                    fill={isSelected ? "url(#goldPin)" : "#a8894d"}
                  />

                  {/* Label next to pin */}
                  <g transform={`translate(${posX + 20}, ${posY + 4})`}>
                    <rect
                      x="-6"
                      y="-14"
                      width={place.name.length * 7.5 + 24}
                      height="22"
                      rx="4"
                      fill="#12100e"
                      stroke={isSelected ? "#D6B36A" : "#382e22"}
                      strokeWidth={isSelected ? "1.5" : "1"}
                      opacity={isSelected ? "0.95" : "0.85"}
                      className="group-hover:opacity-100 transition-opacity"
                    />
                    <text
                      x="4"
                      y="1"
                      fill={isSelected ? "#E6C875" : "#d4cbbe"}
                      fontSize="11"
                      fontWeight={isSelected ? "600" : "500"}
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {place.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Zoom and Reset Controls (Bottom Right) */}
          <div className="absolute bottom-16 right-4 z-10 flex flex-col gap-1.5 bg-surface/90 border border-border/80 rounded-xl p-1 shadow-md backdrop-blur-md">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.25))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal hover:bg-surface-2 hover:text-gold transition-colors font-bold text-base"
              title="Zoom In"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal hover:bg-surface-2 hover:text-gold transition-colors font-bold text-base"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-charcoal transition-colors text-xs"
              title="Reset View"
              aria-label="Reset zoom"
            >
              ⊙
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Rail: Explore by Theme (Reference Page 8) */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-full bg-surface/95 border border-border/80 px-4 py-2 shadow-lg backdrop-blur-md max-w-full overflow-x-auto">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gold mr-1 whitespace-nowrap">
            Explore by theme:
          </span>
          {[
            { id: "ghats", label: "Sacred Riverfronts" },
            { id: "crafts", label: "Silk & Craft Quarters" },
            { id: "temples", label: "Ancient Temples" },
            { id: "heritage", label: "Monuments & Guilds" },
          ].map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => onThemeSelect?.(theme.id)}
              className="rounded-full bg-surface-2 border border-border/70 px-3 py-0.5 text-[11px] font-medium text-secondary-text hover:text-charcoal hover:border-gold/40 hover:bg-surface transition-colors whitespace-nowrap"
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

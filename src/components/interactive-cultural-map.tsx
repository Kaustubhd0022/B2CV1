"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
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

declare global {
  interface Window {
    google?: any;
    __googleMapsLoadingPromise?: Promise<void>;
  }
}

const DEFAULT_MAPS_KEY = "AIzaSyDM-P7dfv8hZ7Tb6Jhe36XtlqeNzUjsuiw";

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.google?.maps) return Promise.resolve();

  if (window.__googleMapsLoadingPromise) {
    return window.__googleMapsLoadingPromise;
  }

  window.__googleMapsLoadingPromise = new Promise<void>((resolve, reject) => {
    // Check if script tag already exists
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return window.__googleMapsLoadingPromise;
}

// Marker pin color by place category
function getMarkerColor(type: string): string {
  switch (type) {
    case "worship":
      return "#B8860B"; // Sacred gold / amber
    case "public_space":
      return "#24131E"; // Deep plum / riverfront
    case "craft":
      return "#C05621"; // Terracotta / artisanal
    case "monument":
      return "#2E6930"; // Heritage forest green
    default:
      return "#24131E";
  }
}

// Create custom SVG marker pin icon
function createCustomPin(color: string, isSelected: boolean): string {
  const size = isSelected ? 42 : 32;
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.25}" viewBox="0 0 36 45" fill="none">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path d="M18 0C8.05887 0 0 8.05887 0 18C0 27.5 14.5 42 18 45C21.5 42 36 27.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="18" cy="18" r="9" fill="#FFFFFF"/>
      <circle cx="18" cy="18" r="5" fill="${color}"/>
      ${isSelected ? `<circle cx="18" cy="18" r="14" stroke="#FFF5F8" stroke-width="2" fill="none" opacity="0.9"/>` : ""}
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg.trim())}`;
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
  const apiKey = googleMapsApiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || DEFAULT_MAPS_KEY;
  const [viewMode, setViewMode] = useState<"google" | "satellite" | "atlas">("google");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());

  // Initialize Google Maps instance
  useEffect(() => {
    if (viewMode === "atlas") return;

    let isMounted = true;

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!isMounted || !mapContainerRef.current || !window.google?.maps) return;

        if (!mapInstanceRef.current) {
          const initialCenter = selectedPlace?.coordinates || coordinates;
          const map = new window.google.maps.Map(mapContainerRef.current, {
            center: initialCenter,
            zoom: 14,
            mapTypeId: viewMode === "satellite" ? "hybrid" : "roadmap",
            disableDefaultUI: true,
            gestureHandling: "greedy",
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#dbebf2" }],
              },
              {
                featureType: "landscape.natural",
                elementType: "geometry",
                stylers: [{ color: "#faf5f7" }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#eef5ed" }],
              },
              {
                featureType: "poi.place_of_worship",
                elementType: "geometry",
                stylers: [{ color: "#faeee7" }],
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#ffffff" }],
              },
            ],
          });

          mapInstanceRef.current = map;
          setMapLoaded(true);
        } else {
          mapInstanceRef.current.setMapTypeId(viewMode === "satellite" ? "hybrid" : "roadmap");
        }
      })
      .catch((err) => {
        console.warn("Google Maps script load error, falling back to embed:", err);
        if (isMounted) setMapError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey, coordinates, selectedPlace?.coordinates, viewMode]);

  // Update map markers when places or selectedPlace change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps || viewMode === "atlas") return;

    // Clear removed markers
    const currentPlaceIds = new Set(places.map((p) => p.id));
    markersMapRef.current.forEach((marker, id) => {
      if (!currentPlaceIds.has(id)) {
        marker.setMap(null);
        markersMapRef.current.delete(id);
      }
    });

    // Create or update markers
    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const color = getMarkerColor(place.type);
      const iconUrl = createCustomPin(color, isSelected);

      let marker = markersMapRef.current.get(place.id);
      if (!marker) {
        marker = new window.google.maps.Marker({
          position: { lat: place.coordinates.lat, lng: place.coordinates.lng },
          map,
          title: place.name,
          zIndex: isSelected ? 100 : 10,
        });

        marker.addListener("click", () => {
          onSelectPlace(place);
        });

        markersMapRef.current.set(place.id, marker);
      }

      marker.setIcon({
        url: iconUrl,
        scaledSize: new window.google.maps.Size(isSelected ? 42 : 32, isSelected ? 52 : 40),
        anchor: new window.google.maps.Point(isSelected ? 21 : 16, isSelected ? 52 : 40),
      });
      marker.setZIndex(isSelected ? 100 : 10);
    });
  }, [places, selectedPlace, onSelectPlace, viewMode]);

  // Center on selectedPlace when changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPlace || viewMode === "atlas") return;

    map.panTo({
      lat: selectedPlace.coordinates.lat,
      lng: selectedPlace.coordinates.lng,
    });
  }, [selectedPlace, viewMode]);

  // Recenter map on city change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || viewMode === "atlas") return;

    map.panTo(coordinates);
    map.setZoom(14);
  }, [coordinates, cityName, viewMode]);

  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
    } else {
      setZoomLevel((z) => Math.min(z + 0.25, 2.25));
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
    } else {
      setZoomLevel((z) => Math.max(z - 0.25, 0.75));
    }
  }, []);

  const handleRecenter = useCallback(() => {
    if (mapInstanceRef.current) {
      const center = selectedPlace?.coordinates || coordinates;
      mapInstanceRef.current.panTo(center);
      mapInstanceRef.current.setZoom(14);
    } else {
      setZoomLevel(1);
    }
  }, [coordinates, selectedPlace?.coordinates]);

  const isVaranasi = citySlug === "varanasi";
  const isHampi = citySlug === "hampi";
  const isKochi = citySlug === "kochi";
  const isKolkata = citySlug === "kolkata";

  return (
    <div className="relative flex flex-col h-full min-h-[520px] lg:min-h-[640px] rounded-[2rem] border border-[#F0DCE4] bg-white overflow-hidden shadow-sm">
      {/* Top Map Status & Mode Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* City & Coordinates Pill */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/95 border border-[#F0DCE4] px-4 py-1.5 shadow-md backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[#24131E] animate-pulse" />
          <span className="text-meta font-semibold text-[#20101B]">
            {viewMode === "atlas" ? "Topographic Atlas" : "Live Map"} · {cityName}
          </span>
          <span className="text-[11px] text-[#705664] border-l border-[#F0DCE4] pl-2 font-mono">
            {coordinates.lat.toFixed(3)}°N, {coordinates.lng.toFixed(3)}°E
          </span>
        </div>

        {/* Mode Selector & External Link */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Segmented View Mode Tabs */}
          <div className="flex rounded-full bg-white/95 border border-[#F0DCE4] p-1 shadow-md backdrop-blur-md">
            <button
              type="button"
              onClick={() => setViewMode("google")}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                viewMode === "google"
                  ? "bg-[#24131E] text-white shadow-xs"
                  : "text-[#5A4450] hover:text-[#20101B]"
              }`}
            >
              Google Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode("satellite")}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                viewMode === "satellite"
                  ? "bg-[#24131E] text-white shadow-xs"
                  : "text-[#5A4450] hover:text-[#20101B]"
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setViewMode("atlas")}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                viewMode === "atlas"
                  ? "bg-[#24131E] text-white shadow-xs"
                  : "text-[#5A4450] hover:text-[#20101B]"
              }`}
            >
              Atlas
            </button>
          </div>

          {/* Open in Google Maps External Tab */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${selectedPlace?.name ?? cityName}, ${cityName}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white/95 border border-[#F0DCE4] px-3 py-1.5 text-[11px] font-semibold text-[#20101B] shadow-md backdrop-blur-md hover:bg-[#FAF0F4] hover:border-[#D9BDC9] transition-colors inline-flex items-center gap-1"
          >
            Open Maps <IconExternal width={11} height={11} />
          </a>
        </div>
      </div>

      {/* Main Map Body */}
      {viewMode === "atlas" ? (
        /* Topographic Illustrated Canvas */
        <div className="relative w-full h-full flex-1 overflow-hidden select-none bg-[#12100e]">
          <svg
            viewBox="0 0 1000 700"
            className="w-full h-full object-cover transition-transform duration-300 ease-out"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
            }}
          >
            <defs>
              <radialGradient id="mapGlow" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="#1c1814" />
                <stop offset="60%" stopColor="#14110e" />
                <stop offset="100%" stopColor="#0c0a09" />
              </radialGradient>
              <linearGradient id="riverWater" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a2e38" />
                <stop offset="50%" stopColor="#132731" />
                <stop offset="100%" stopColor="#0e1f28" />
              </linearGradient>
              <linearGradient id="goldPin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E6C875" />
                <stop offset="100%" stopColor="#D6B36A" />
              </linearGradient>
              <pattern id="coordGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#2a241e" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>

            <rect width="1000" height="700" fill="url(#mapGlow)" />
            <rect width="1000" height="700" fill="url(#coordGrid)" />

            <g stroke="#3a3026" strokeWidth="0.75" fill="none" opacity="0.35" strokeDasharray="3 3">
              <ellipse cx="480" cy="350" rx="420" ry="280" />
              <ellipse cx="490" cy="360" rx="360" ry="240" />
              <ellipse cx="500" cy="370" rx="300" ry="200" />
              <ellipse cx="510" cy="380" rx="240" ry="160" />
            </g>

            {isVaranasi && (
              <g id="ganga-corridor">
                <path
                  d="M 680 0 C 640 180, 580 340, 520 480 C 460 600, 360 670, 280 700 L 420 700 C 510 670, 620 590, 700 460 C 760 320, 840 160, 900 0 Z"
                  fill="url(#riverWater)"
                  opacity="0.95"
                />
                <path
                  d="M 680 0 C 640 180, 580 340, 520 480 C 460 600, 360 670, 280 700"
                  stroke="#D6B36A"
                  strokeWidth="2.5"
                  fill="none"
                  strokeOpacity="0.6"
                />
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
                <path d="M 750 0 C 720 200, 680 400, 650 700 L 1000 700 L 1000 0 Z" fill="url(#riverWater)" opacity="0.9" />
                <text x="800" y="320" fill="#789ba6" fontSize="12" fontFamily="serif" fontStyle="italic" letterSpacing="3" opacity="0.8" transform="rotate(85 800 320)">
                  VEMBANAD ESTUARY & ARABIAN SEA
                </text>
              </g>
            )}

            {isKolkata && (
              <g id="hooghly-corridor">
                <path d="M 400 0 C 420 220, 380 440, 360 700 L 460 700 C 480 440, 520 220, 500 0 Z" fill="url(#riverWater)" opacity="0.9" />
                <text x="440" y="340" fill="#789ba6" fontSize="12" fontFamily="serif" fontStyle="italic" letterSpacing="3" opacity="0.8" transform="rotate(88 440 340)">
                  HOOGHLY RIVER (BHAGIRATHI)
                </text>
              </g>
            )}

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
                  {isSelected && (
                    <circle cx={posX} cy={posY} r="26" fill="none" stroke="#D6B36A" strokeWidth="2" opacity="0.75" className="animate-ping" />
                  )}
                  <circle
                    cx={posX}
                    cy={posY}
                    r={isSelected ? "18" : "13"}
                    fill={isSelected ? "#1a1612" : "#221c16"}
                    stroke={isSelected ? "#D6B36A" : "#8c7043"}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                  />
                  <circle cx={posX} cy={posY} r={isSelected ? "7" : "5"} fill={isSelected ? "url(#goldPin)" : "#a8894d"} />
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
                    />
                    <text x="4" y="1" fill={isSelected ? "#E6C875" : "#d4cbbe"} fontSize="11" fontWeight={isSelected ? "600" : "500"}>
                      {place.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      ) : mapError ? (
        /* Fallback Google Maps Embed if JS API blocked */
        <iframe
          title={`Google Map of ${selectedPlace?.name ?? cityName}`}
          width="100%"
          height="100%"
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
            `${selectedPlace?.name ?? cityName}, ${cityName}`,
          )}&zoom=14`}
        />
      ) : (
        /* Real Interactive Google Map Container */
        <div className="relative w-full h-full flex-1">
          <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

          {/* Loading indicator while Google Maps is initializing */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs">
              <div className="flex items-center gap-3 rounded-full border border-[#F0DCE4] bg-white px-5 py-2.5 shadow-md">
                <span className="size-3.5 rounded-full border-2 border-[#24131E] border-r-transparent animate-spin" />
                <span className="text-meta font-medium text-[#20101B]">Loading Google Map...</span>
              </div>
            </div>
          )}

          {/* Floating Place Selection Badge on Map */}
          {selectedPlace && mapLoaded && (
            <div className="absolute top-16 left-4 z-10 max-w-sm rounded-2xl border border-[#F0DCE4] bg-white/95 p-3.5 shadow-xl backdrop-blur-md transition-all">
              <div className="flex items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-stone border border-[#F0DCE4]">
                  <Image
                    src={selectedPlace.image}
                    alt={selectedPlace.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[#24131E]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      {selectedPlace.typeLabel}
                    </span>
                  </div>
                  <h4 className="font-serif text-support font-semibold text-[#20101B] truncate leading-tight mt-0.5">
                    {selectedPlace.name}
                  </h4>
                  <p className="text-[11px] text-[#705664] truncate leading-tight mt-0.5">
                    {selectedPlace.subtitle}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sleek Zoom and Reset Controls (Bottom Right) */}
      <div className="absolute bottom-16 right-4 z-10 flex flex-col gap-1.5 bg-white/95 border border-[#F0DCE4] rounded-2xl p-1.5 shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={handleZoomIn}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-[#20101B] hover:bg-[#FAF0F4] hover:text-[#24131E] transition-colors font-bold text-base"
          title="Zoom In"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-[#20101B] hover:bg-[#FAF0F4] hover:text-[#24131E] transition-colors font-bold text-base"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-[#705664] hover:bg-[#FAF0F4] hover:text-[#20101B] transition-colors text-xs"
          title="Recenter Map"
          aria-label="Recenter map"
        >
          ⊙
        </button>
      </div>

      {/* Bottom Floating Rail: Explore by Theme */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-full bg-white/95 border border-[#F0DCE4] px-4 py-2 shadow-lg backdrop-blur-md max-w-full overflow-x-auto">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 mr-1 whitespace-nowrap">
            ✦ Explore by theme:
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
              className="rounded-full bg-[#FAF0F4] border border-[#F0DCE4] px-3 py-1 text-[11px] font-medium text-[#5A4450] hover:text-[#20101B] hover:border-[#D9BDC9] hover:bg-white transition-all whitespace-nowrap"
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

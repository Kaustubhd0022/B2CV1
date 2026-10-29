"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { EASING, SPRING_CONFIG, COLOR_TINTS, MOTION_TIMINGS } from "@/lib/motion.config";

interface CityItem {
  slug: string;
  name: string;
  state: string;
  img: string;
}

export function PilotCitiesShowcase({
  cities,
  onHoverCity,
}: {
  cities: CityItem[];
  onHoverCity?: (tint: string | null) => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="mt-8 hidden sm:block">
      <div className="flex items-center justify-between">
        <p className="text-meta font-medium uppercase tracking-wider text-white/70">
          6 Pilot Cities
        </p>
        <span className="text-meta text-gold">Phase 1 Discovery</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2.5 md:grid-cols-6">
        {cities.map((city, index) => (
          <TiltCityCard
            key={city.slug}
            city={city}
            index={index}
            reducedMotion={Boolean(reducedMotion)}
            onHoverCity={onHoverCity}
          />
        ))}
      </div>
    </div>
  );
}

function TiltCityCard({
  city,
  index,
  reducedMotion,
  onHoverCity,
}: {
  city: CityItem;
  index: number;
  reducedMotion: boolean;
  onHoverCity?: (tint: string | null) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const tintColor = COLOR_TINTS[city.slug as keyof typeof COLOR_TINTS] || "rgba(198, 125, 40, 0.15)";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Gentle 3D perspective tilt (max 8 degrees)
    setRotateX(-(y / (rect.height / 2)) * 7);
    setRotateY((x / (rect.width / 2)) * 7);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverCity?.(tintColor);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    onHoverCity?.(null);
  };

  if (reducedMotion) {
    return (
      <div className="group relative aspect-[3/4] overflow-hidden rounded-md border border-white/15 bg-surface-2">
        <Image
          src={city.img}
          alt={city.name}
          fill
          sizes="120px"
          className="object-cover"
        />
        <div className="scrim-bottom absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-2">
          <p className="text-meta font-semibold leading-tight text-white">{city.name}</p>
          <p className="text-[10px] text-white/75">{city.state}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{
        opacity: 0,
        y: 35,
        rotateZ: index % 2 === 0 ? -1.5 : 1.5,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotateZ: 0,
      }}
      transition={{
        duration: MOTION_TIMINGS.citiesDuration,
        delay: MOTION_TIMINGS.citiesStart + index * MOTION_TIMINGS.citiesStagger,
        ease: EASING.natural,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-white/15 bg-[#18231e]/80 transition-shadow duration-300 hover:border-gold/60 hover:shadow-lg hover:shadow-amber-950/40 cursor-pointer"
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
          scale: isHovered ? 1.04 : 1,
          y: isHovered ? -3 : 0,
        }}
        transition={SPRING_CONFIG.cardHover}
        className="relative h-full w-full overflow-hidden"
      >
        <Image
          src={city.img}
          alt={city.name}
          fill
          sizes="120px"
          className={`object-cover transition-transform duration-500 ease-out ${
            isHovered ? "scale-108 brightness-105" : "scale-100"
          }`}
        />
        <div className="scrim-bottom absolute inset-0 transition-opacity duration-300 group-hover:opacity-90" />
        
        {/* Subtle gilded corner glow */}
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: `radial-gradient(circle at 50% 100%, ${tintColor} 0%, transparent 70%)`,
          }}
        />

        <div className="absolute inset-x-0 bottom-0 p-2 transition-transform duration-300">
          <p
            className={`text-meta font-semibold leading-tight text-white transition-transform duration-300 ${
              isHovered ? "-translate-y-0.5 text-[#F6D59E]" : "translate-y-0"
            }`}
          >
            {city.name}
          </p>
          <p className="text-[10px] text-white/75">{city.state}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { useState, useRef } from "react";
import { IconExternal } from "@/components/icons";
import { cx } from "@/components/ui";

export interface AcousticTrack {
  id: string;
  title: string;
  tradition: string; // e.g. "Banaras Gharana (Tabla & Shehnai)"
  scaleOrRaga?: string; // e.g. "Raga Bhairav · Subah-e-Banaras"
  sourceInstitution: string; // e.g. "Sangeet Natak Akademi Archives"
  sourceUrl: string;
  audioUrl?: string; // sample audio stream or synthesized cultural chime
  durationLabel?: string;
}

export function AcousticShrinePlayer({
  track,
  className,
}: {
  track: AcousticTrack;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayback = () => {
    if (!audioRef.current && track.audioUrl) {
      audioRef.current = new Audio(track.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      // Toggle simulated soundscape resonance state
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      className={cx(
        "rounded-2xl border border-purple-500/30 bg-gradient-to-r from-[#17131b] via-[#1a1420] to-[#141018] p-4 sm:p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlayback}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white shadow-md hover:bg-purple-500 transition-transform active:scale-95 cursor-pointer"
            aria-label={isPlaying ? "Pause acoustic audio" : "Listen to acoustic audio"}
          >
            {isPlaying ? (
              <span className="text-sm font-bold">❚❚</span>
            ) : (
              <span className="text-sm font-bold pl-0.5">▶</span>
            )}
          </button>

          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-purple-300">
              <span>🎵</span>
              <span>{track.tradition}</span>
              {track.scaleOrRaga && (
                <>
                  <span>·</span>
                  <span className="text-gold">{track.scaleOrRaga}</span>
                </>
              )}
            </div>
            <h4 className="mt-0.5 font-serif text-support font-bold text-white">
              {track.title}
            </h4>
          </div>
        </div>

        {/* Provenance Badge & Waveform */}
        <div className="flex items-center gap-3">
          {isPlaying && (
            <div className="flex items-end gap-1 h-5 px-2" aria-hidden="true">
              <span className="w-1 bg-purple-400 animate-pulse h-3 rounded-full" />
              <span className="w-1 bg-purple-300 animate-pulse h-5 rounded-full" />
              <span className="w-1 bg-purple-400 animate-pulse h-2 rounded-full" />
              <span className="w-1 bg-purple-300 animate-pulse h-4 rounded-full" />
            </div>
          )}

          <a
            href={track.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-1 text-[11px] font-medium text-purple-200 hover:text-white transition-colors"
          >
            <span>{track.sourceInstitution}</span>
            <IconExternal width={10} height={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

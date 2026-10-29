"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/languages";

export function CinematicLanguageSwitcher({
  currentLang = "en",
  onLanguageChange,
}: {
  currentLang?: string;
  onLanguageChange?: (lang: LanguageCode) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(currentLang);
  const [, startTransition] = useTransition();

  const currentLanguage =
    LANGUAGES.find((l) => l.code === selected) || LANGUAGES[0];

  const handleSelect = (lang: LanguageCode) => {
    setSelected(lang);
    setIsOpen(false);
    onLanguageChange?.(lang);

    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("hl", lang);
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="relative z-30">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md transition-all hover:border-gold/60 hover:bg-black/60 shadow-xs cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select preview language"
      >
        <span className="size-2 rounded-full bg-gold animate-pulse" aria-hidden="true" />
        <span className="text-white/95 font-semibold">{currentLanguage.native}</span>
        <span className="text-[10px] text-white/60">({currentLanguage.english})</span>
        <span className="text-xs text-gold/80 ml-0.5">▾</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-xl border border-white/20 bg-[#18231e]/95 py-1.5 shadow-2xl backdrop-blur-xl max-h-64 overflow-y-auto"
            role="listbox"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => handleSelect(l.code)}
                className={`w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                  selected === l.code
                    ? "bg-amber-600/25 text-gold font-semibold"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                role="option"
                aria-selected={selected === l.code}
              >
                <span>{l.native}</span>
                <span className="text-[10px] text-white/50">{l.english}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

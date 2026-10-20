import {
  Noto_Sans,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_Gujarati,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
  Noto_Sans_Oriya,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
  Noto_Serif,
  Plus_Jakarta_Sans,
} from "next/font/google";

// Noto families give verified coverage for all 11 launch scripts (Design §3).
// Script fonts are not preloaded: browsers only fetch them when those glyphs render.
// Display/UI face for Latin text (geometric, as in the cinematic reference); Indic scripts fall back to Noto.
export const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display", display: "swap" });
export const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-noto-sans", display: "swap" });
export const notoSerif = Noto_Serif({ subsets: ["latin"], variable: "--font-noto-serif", display: "swap" });
export const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-deva", display: "swap", preload: false });
export const beng = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-beng", display: "swap", preload: false });
export const guru = Noto_Sans_Gurmukhi({ subsets: ["gurmukhi"], variable: "--font-guru", display: "swap", preload: false });
export const gujr = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-gujr", display: "swap", preload: false });
export const orya = Noto_Sans_Oriya({ subsets: ["oriya"], variable: "--font-orya", display: "swap", preload: false });
export const taml = Noto_Sans_Tamil({ subsets: ["tamil"], variable: "--font-taml", display: "swap", preload: false });
export const telu = Noto_Sans_Telugu({ subsets: ["telugu"], variable: "--font-telu", display: "swap", preload: false });
export const knda = Noto_Sans_Kannada({ subsets: ["kannada"], variable: "--font-knda", display: "swap", preload: false });
export const mlym = Noto_Sans_Malayalam({ subsets: ["malayalam"], variable: "--font-mlym", display: "swap", preload: false });

export const fontVariables = [display, notoSans, notoSerif, deva, beng, guru, gujr, orya, taml, telu, knda, mlym]
  .map((f) => f.variable)
  .join(" ");

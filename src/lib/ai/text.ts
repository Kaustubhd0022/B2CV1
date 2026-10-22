/** Language-agnostic text helpers for retrieval scoring and citation verification. */

const STOP = new Set(
  "a an and are as at be by did do does for from had has have how i in is it its of on or that the their them they this to was were what when where which who why will with about into than then there these those can could would should between different".split(
    " ",
  ),
);

/** Unicode-aware tokens (letters, marks, digits), lowercased, stopwords removed. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFC")
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

/** Crude stem: lets "ghats"/"ghat", "observatories"/"observatory" match. */
export function stem(t: string) {
  if (!/^[a-z]+$/.test(t) || t.length < 5) return t;
  return t.replace(/(ies|es|s|ing|ed)$/, "");
}

/** Fraction of distinct query terms present in the text (0..1). */
export function overlapScore(query: string, text: string) {
  const q = [...new Set(tokenize(query).map(stem))];
  if (!q.length) return 0;
  const words = new Set(tokenize(text).map(stem));
  const hits = q.filter((t) => words.has(t)).length;
  return hits / q.length;
}

/** Normalisation used to compare a quoted span with its source passage. */
export function normalizeForQuote(s: string) {
  return s
    .normalize("NFC")
    .replace(/[‘’‚‛′`]/g, "'")
    .replace(/[“”„‟″]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanWords(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s]+/gu, " ").replace(/\s+/g, " ").trim();
}

/** True when `quote` appears verbatim (modulo whitespace/quote style/case) in `passage`. */
export function quoteInPassage(quote: string, passage: string) {
  const normPassage = normalizeForQuote(passage);
  const q = normalizeForQuote(quote).replace(/^["'.…\s]+|["'.…\s]+$/g, "");
  if (q.length >= 12 && normPassage.includes(q)) return true;
  // If the quote contains ellipsis ("..." or "…"), verify all non-trivial segments appear in passage
  if (q.includes("...") || q.includes("…")) {
    const parts = q.split(/\.{3,}|…/).map((p) => p.trim()).filter((p) => p.length >= 8);
    if (parts.length >= 2 && parts.every((p) => normPassage.includes(p))) return true;
  }
  // Punctuation-insensitive word sequence match fallback
  const cwPassage = cleanWords(passage);
  const cwQuote = cleanWords(quote);
  if (cwQuote.length >= 12 && cwPassage.includes(cwQuote)) return true;
  return false;
}

export function hasUrl(text: string) {
  return /https?:\/\/|www\.[a-z0-9-]+\.[a-z]/i.test(text);
}

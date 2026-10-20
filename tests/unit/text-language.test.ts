import { describe, expect, it } from "vitest";
import { classifySensitivity } from "@/lib/ai/sensitivity";
import { overlapScore, quoteInPassage, tokenize } from "@/lib/ai/text";
import { detectLanguages, LANGUAGES, scriptRatio } from "@/lib/i18n/languages";
import { uiCoverage, translator } from "@/lib/i18n/t";
import en from "@/lib/i18n/messages/en";
import { CATALOGUES } from "@/lib/i18n/messages";
import { normalizeEmail, normalizePhone, safeNext, maskTarget } from "@/lib/auth/normalize";
import { sanitizeProps } from "@/lib/analytics";

describe("quote verification", () => {
  it("matches verbatim quotes regardless of whitespace, case and quote style", () => {
    const p = "The name jantar is derived from yantra, a Sanskrit word meaning “instrument, machine”.";
    expect(quoteInPassage('derived from yantra, a Sanskrit word meaning "instrument, machine"', p)).toBe(true);
    expect(quoteInPassage("derived   from YANTRA", p)).toBe(true);
  });
  it("rejects paraphrases and very short quotes", () => {
    expect(quoteInPassage("comes from the word yantra", "The name jantar is derived from yantra.")).toBe(false);
    expect(quoteInPassage("yantra", "yantra")).toBe(false);
  });
  it("works for Indic scripts", () => {
    expect(quoteInPassage("दुर्गा पूजा कोलकाता का सबसे बड़ा", "दुर्गा पूजा कोलकाता का सबसे बड़ा त्योहार है।")).toBe(true);
  });
});

describe("tokenize / overlap", () => {
  it("keeps Indic tokens and drops English stopwords", () => {
    expect(tokenize("Why is the ghat important?")).toEqual(["ghat", "important"]);
    expect(tokenize("वाराणसी के घाट")).toContain("वाराणसी");
  });
  it("scores by query-term overlap", () => {
    expect(overlapScore("ghats of Varanasi", "The ghats in Varanasi are steps")).toBe(1);
    expect(overlapScore("lotus symbolism", "Jaipur observatory")).toBe(0);
  });
});

describe("sensitivity taxonomy (provisional)", () => {
  it.each([
    ["Which religion is superior?", "high_risk"],
    ["Who really owns the temple site at Ayodhya?", "high_risk"],
    ["How did caste shape Madurai's streets?", "sensitive"],
    ["What happened to temples during the partition?", "sensitive"],
    ["Did Rama really exist historically?", "sensitive"],
    ["Can Ayurveda cure cancer?", "sensitive"],
    ["Why is the lotus used in Indian art?", "routine"],
    ["Was Hampi really the second-largest city?", "routine"],
  ])("%s → %s", (q, risk) => {
    expect(classifySensitivity(q).risk).toBe(risk);
  });
});

describe("languages", () => {
  it("has exactly the 11 confirmed launch languages", () => {
    expect(LANGUAGES.map((l) => l.code)).toEqual(["en", "hi", "kn", "ml", "bn", "ta", "mr", "te", "gu", "pa", "or"]);
  });
  it("detects scripts, returning both Hindi and Marathi for Devanagari", () => {
    expect(detectLanguages("लोटस का अर्थ क्या है")).toEqual(["hi", "mr"]);
    expect(detectLanguages("தாமரை")).toEqual(["ta"]);
    expect(detectLanguages("ପଦ୍ମ")).toEqual(["or"]);
    expect(detectLanguages("123 ?!")).toEqual([]);
  });
  it("computes script ratios", () => {
    expect(scriptRatio("কলকাতা Durga", "Bengali")).toBeGreaterThan(0.5);
    expect(scriptRatio("Hello", "Bengali")).toBe(0);
  });
  it("reports UI coverage honestly and falls back to English per string", () => {
    expect(uiCoverage("en")).toBe(1);
    for (const l of LANGUAGES.filter((x) => x.code !== "en")) {
      const c = uiCoverage(l.code);
      expect(c).toBeGreaterThan(0.1);
      expect(c).toBeLessThan(1); // drafts cover the core journey only — never claimed complete
    }
    expect(translator("hi")("nav.ask")).toBe("पूछें");
    expect(translator("hi")("ask.dynamicNote")).toBe(en["ask.dynamicNote"]);
  });
  it("non-English catalogues only use keys that exist in English", () => {
    for (const [code, cat] of Object.entries(CATALOGUES)) {
      for (const k of Object.keys(cat ?? {})) expect(k in en, `${code}:${k}`).toBe(true);
    }
  });
  it("keeps interpolation placeholders consistent across translations", () => {
    for (const cat of Object.values(CATALOGUES)) {
      for (const [k, v] of Object.entries(cat ?? {})) {
        const want = (en[k as keyof typeof en].match(/\{\w+\}/g) ?? []).sort();
        expect((v!.match(/\{\w+\}/g) ?? []).sort(), k).toEqual(want);
      }
    }
  });
});

describe("auth input normalisation", () => {
  it("normalises email and phone", () => {
    expect(normalizeEmail("  Someone@Example.ORG ")).toBe("someone@example.org");
    expect(normalizeEmail("not-an-email")).toBeNull();
    expect(normalizePhone("+91 98765-43210")).toBe("+919876543210");
    expect(normalizePhone("9876543210")).toBeNull();
  });
  it("prevents open redirects", () => {
    expect(safeNext("/stories/x")).toBe("/stories/x");
    expect(safeNext("//evil.example")).toBe("/");
    expect(safeNext("https://evil.example")).toBe("/");
    expect(safeNext("/\\evil")).toBe("/");
    expect(safeNext(undefined)).toBe("/");
  });
  it("masks identifiers for display", () => {
    expect(maskTarget("email", "someone@example.org")).toBe("so•••••@example.org");
    expect(maskTarget("phone", "+919876543210")).not.toContain("98765");
  });
});

describe("analytics privacy", () => {
  it("drops properties that are not allow-listed (e.g. question text)", () => {
    expect(sanitizeProps("ask_submitted", { language: "hi", question: "secret", follow_up: true })).toEqual({ language: "hi", follow_up: true });
  });
});

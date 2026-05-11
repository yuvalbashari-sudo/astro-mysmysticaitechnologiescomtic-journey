/**
 * Local AI Validators — pure, framework-agnostic, unit-testable.
 *
 * No React, no DOM, no `import.meta`. Every function is a pure
 * (input → output) transform so they can be exercised from Vitest in
 * isolation and reused from edge functions or future surfaces.
 *
 * Locales: only HE/AR ("Local Version") get repair/validation. EN/RU
 * are pass-through for the helpers that take a locale.
 */

export type LocaleCode = "he" | "en" | "ru" | "ar";
export type LockedGender = "male" | "female" | undefined;

type ScriptName = "latin" | "hebrew" | "arabic" | "cyrillic";

const EXPECTED_SCRIPT: Record<LocaleCode, ScriptName> = {
  en: "latin",
  he: "hebrew",
  ru: "cyrillic",
  ar: "arabic",
};

function detectScript(ch: string): ScriptName | null {
  const code = ch.codePointAt(0);
  if (code === undefined) return null;
  if (code >= 0x0590 && code <= 0x05ff) return "hebrew";
  if (
    (code >= 0x0600 && code <= 0x06ff) ||
    (code >= 0x0750 && code <= 0x077f) ||
    (code >= 0xfb50 && code <= 0xfdff) ||
    (code >= 0xfe70 && code <= 0xfeff)
  )
    return "arabic";
  if ((code >= 0x0400 && code <= 0x04ff) || (code >= 0x0500 && code <= 0x052f))
    return "cyrillic";
  if ((code >= 0x0041 && code <= 0x007a) || (code >= 0x00c0 && code <= 0x024f))
    return "latin";
  return null;
}

// ── Pure metrics ─────────────────────────────────────────────────────

/** Ratio of Latin letters in a string, ignoring digits/punct/emoji. */
export function latinLeakRatio(text: string): number {
  if (!text) return 0;
  let latin = 0;
  let total = 0;
  for (const ch of text) {
    const s = detectScript(ch);
    if (!s) continue;
    total += 1;
    if (s === "latin") latin += 1;
  }
  return total === 0 ? 0 : latin / total;
}

/**
 * Strict locale check used for the "Local Version" gate.
 *
 * - Empty/numeric-only strings are valid.
 * - For HE/AR we tolerate up to 15% Latin loanwords (brand names, "AI"),
 *   but reject any third-script characters (e.g. Cyrillic in HE).
 * - For EN/RU the same rule with the relevant scripts.
 */
export function isValidLocale(text: string, locale: LocaleCode): boolean {
  if (!text || typeof text !== "string") return true;
  const expected = EXPECTED_SCRIPT[locale];
  let expectedCount = 0;
  let foreignCount = 0;
  let latinLoanCount = 0;
  let totalLetters = 0;

  for (const ch of text) {
    const script = detectScript(ch);
    if (!script) continue;
    totalLetters += 1;
    if (script === expected) {
      expectedCount += 1;
      continue;
    }
    if (locale !== "en" && script === "latin") {
      latinLoanCount += 1;
      continue;
    }
    foreignCount += 1;
  }

  if (totalLetters === 0) return true;
  if (foreignCount > 0) return false;
  if (locale !== "en") {
    const loanRatio = latinLoanCount / totalLetters;
    if (loanRatio > 0.5 && expectedCount === 0) return false;
    if (loanRatio > 0.15 && expectedCount > 0 && latinLoanCount > 6)
      return false;
  }
  return true;
}

/** True if the text still contains dual-gender slash forms in HE/AR. */
export function hasMixedGenderSlashes(text: string, locale: LocaleCode): boolean {
  if (!text) return false;
  if (locale === "he") {
    if (/[\u0590-\u05FF]+\s*\/\s*ה(?:[^\u0590-\u05FF]|$)/.test(text)) return true;
    if (/[\u0590-\u05FF]+\s*\/\s*ות(?:[^\u0590-\u05FF]|$)/.test(text)) return true;
    if (/[\u0590-\u05FF]+\s*\/\s*ים(?:[^\u0590-\u05FF]|$)/.test(text)) return true;
    if (/[\u0590-\u05FF]+\s*\/\s*[\u0590-\u05FF]+/.test(text)) return true;
    return false;
  }
  if (locale === "ar") {
    return /[\u0600-\u06FF]+\s*\/\s*[\u0600-\u06FF]+/.test(text);
  }
  return false;
}

/**
 * RTL integrity check — returns false when HE/AR text contains long Latin
 * runs that would visually break direction, or stray bidi override marks.
 */
export function hasRtlIntegrity(text: string, locale: LocaleCode): boolean {
  if (locale !== "he" && locale !== "ar") return true;
  if (!text) return true;
  if (/[\u202A-\u202E\u2066-\u2069]/.test(text)) return false;
  if (/[A-Za-z]{12,}/.test(text)) return false;
  return true;
}

// ── Pure transforms ──────────────────────────────────────────────────

/** Removes stray RTL/LTR control marks (LRM/RLM/embedding/override). */
export function stripBidiControls(text: string): string {
  if (!text) return text;
  return text.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
}

const HE_LETTER = "[\\u0590-\\u05FF]";
const HE_SUFFIX_HE = new RegExp(`(${HE_LETTER}+)\\s*\\/\\s*ה(?=[^\\u0590-\\u05FF]|$)`, "g");
const HE_SUFFIX_OT = new RegExp(`(${HE_LETTER}+)\\s*\\/\\s*ות(?=[^\\u0590-\\u05FF]|$)`, "g");
const HE_SUFFIX_IM = new RegExp(`(${HE_LETTER}+)\\s*\\/\\s*ים(?=[^\\u0590-\\u05FF]|$)`, "g");
const HE_PAIR = new RegExp(`(${HE_LETTER}+)\\s*\\/\\s*(${HE_LETTER}+)`, "g");
const AR_LETTER = "[\\u0600-\\u06FF\\u0750-\\u077F\\uFB50-\\uFDFF\\uFE70-\\uFEFF]";
const AR_PAIR = new RegExp(`(${AR_LETTER}+)\\s*\\/\\s*(${AR_LETTER}+)`, "g");

/**
 * Repairs dual-gender slash forms using the locked gender.
 * Pure, idempotent. EN/RU pass through unchanged.
 */
export function repairSlashForms(
  text: string,
  locale: LocaleCode,
  gender: LockedGender,
): { text: string; changed: boolean } {
  if (!text || (locale !== "he" && locale !== "ar")) return { text, changed: false };
  let out = text;
  if (locale === "he") {
    out = out.replace(HE_SUFFIX_HE, (_m, base: string) =>
      gender === "female" ? `${base}ה` : base,
    );
    out = out.replace(HE_SUFFIX_OT, (_m, base: string) =>
      gender === "female" ? `${base}ות` : base,
    );
    out = out.replace(HE_SUFFIX_IM, (_m, base: string) =>
      gender === "female" ? base : `${base}ים`,
    );
    out = out.replace(HE_PAIR, (m, masc: string, fem: string) => {
      if (/^\d+$/.test(masc) || /^\d+$/.test(fem)) return m;
      if (gender === "female") return fem;
      if (gender === "male") return masc;
      return masc;
    });
  } else {
    out = out.replace(AR_PAIR, (_m, masc: string, fem: string) => {
      if (gender === "female") return fem;
      if (gender === "male") return masc;
      return masc;
    });
  }
  return { text: out, changed: out !== text };
}

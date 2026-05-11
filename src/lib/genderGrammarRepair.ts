/**
 * Gender Grammar Repair (Hebrew + Arabic)
 *
 * Final safety net for AI-generated text in the Local Version (HE/AR).
 * Even with strict prompt-side gender locks, models occasionally emit
 * dual-gender slash forms like "את/ה", "חש/ה", "יקר/ה", or
 * "صديقي/صديقتي". This repairs them in-place based on the locked gender.
 *
 * - When gender is "male" → keep the base form (left of the slash).
 * - When gender is "female" → keep the feminine form (combine base + ה
 *   for Hebrew, or pick the right side for Arabic explicit pairs).
 * - When gender is unknown → strip the slash to a neutral form (prefer
 *   the base / left side) so we never display "/" inside the body.
 *
 * The repair is purely textual; it never asks the model again, so it is
 * safe to run on every successful response (including streamed ones).
 */

import type { Language } from "@/i18n/types";

export type LockedGender = "male" | "female" | undefined;

// ── Hebrew ────────────────────────────────────────────────────────────
//
// Dominant pattern: "<base>/ה"  → masculine form is <base>, feminine is <base>+ה.
// Examples: את/ה, חש/ה, מרגיש/ה, יקר/ה, אהוב/ה, חזק/ה, מוכן/ה.
//
// Secondary patterns:
//   "<base>/ות"  (plural fem)  → keep base for male, base+ות for female.
//   "<base>/ים"  (plural masc) → male keeps base+ים, female keeps base.
//   Explicit pair "<masc>/<fem>" with both sides Hebrew letters.
const HE_LETTER = "[\u0590-\u05FF]";
const HE_SUFFIX_HE = new RegExp(`(${HE_LETTER}+)\\s*/\\s*ה(?=[^${"\\u0590-\\u05FF"}]|$)`, "g");
const HE_SUFFIX_OT = new RegExp(`(${HE_LETTER}+)\\s*/\\s*ות(?=[^${"\\u0590-\\u05FF"}]|$)`, "g");
const HE_SUFFIX_IM = new RegExp(`(${HE_LETTER}+)\\s*/\\s*ים(?=[^${"\\u0590-\\u05FF"}]|$)`, "g");
const HE_PAIR = new RegExp(`(${HE_LETTER}+)\\s*/\\s*(${HE_LETTER}+)`, "g");

function repairHebrew(text: string, gender: LockedGender): string {
  let out = text;
  // <base>/ה
  out = out.replace(HE_SUFFIX_HE, (_m, base: string) =>
    gender === "female" ? `${base}ה` : base,
  );
  // <base>/ות
  out = out.replace(HE_SUFFIX_OT, (_m, base: string) =>
    gender === "female" ? `${base}ות` : base,
  );
  // <base>/ים
  out = out.replace(HE_SUFFIX_IM, (_m, base: string) =>
    gender === "female" ? base : `${base}ים`,
  );
  // Explicit <masc>/<fem> Hebrew pair (catches anything still left).
  out = out.replace(HE_PAIR, (m, masc: string, fem: string) => {
    // Heuristic: skip if it looks like a date / fraction.
    if (/^\d+$/.test(masc) || /^\d+$/.test(fem)) return m;
    if (gender === "female") return fem;
    if (gender === "male") return masc;
    return masc; // neutral fallback → masculine base (no slashes shown to user)
  });
  return out;
}

// ── Arabic ────────────────────────────────────────────────────────────
//
// AR slash forms typically appear as "<masc>/<fem>" with both sides in
// Arabic letters (e.g. "صديقي/صديقتي", "عزيزي/عزيزتي", "أنتَ/أنتِ").
const AR_LETTER = "[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]";
const AR_PAIR = new RegExp(`(${AR_LETTER}+)\\s*/\\s*(${AR_LETTER}+)`, "g");

function repairArabic(text: string, gender: LockedGender): string {
  return text.replace(AR_PAIR, (_m, masc: string, fem: string) => {
    if (gender === "female") return fem;
    if (gender === "male") return masc;
    return masc;
  });
}

/**
 * Public entry point. No-op for non HE/AR locales — those languages do
 * not have the gendered second-person grammar problem at the same level.
 */
export function repairGenderGrammar(
  text: string,
  locale: Language,
  gender: LockedGender,
): { repaired: string; changed: boolean } {
  if (!text || typeof text !== "string") return { repaired: text, changed: false };
  if (locale !== "he" && locale !== "ar") return { repaired: text, changed: false };

  const repaired = locale === "he" ? repairHebrew(text, gender) : repairArabic(text, gender);
  return { repaired, changed: repaired !== text };
}

/**
 * Convenience: removes stray RTL/LTR control marks left behind by
 * model output that mixed scripts. Cheap to run before render.
 */
export function stripBidiControls(text: string): string {
  if (!text) return text;
  // U+200E LRM, U+200F RLM, U+202A–U+202E embedding/override marks.
  return text.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
}

/**
 * Locale Guard — centralized localization helpers + dev-time validator.
 *
 * Goal: prevent mixed-language UI from creeping back in. Every dynamic value
 * that ships to the screen (zodiac sign, element, month, label, CTA, share
 * text, unlock copy) should be routed through one of these helpers.
 *
 * The helpers are thin wrappers over the existing localization sources
 * (`astroLocale`, `dateTimeFormat`, the i18n translation tables) so we keep
 * a single source of truth for each domain.
 *
 * Fallback rule: missing translations fall back to English, NEVER to Hebrew.
 *
 * Dev guard: in dev mode, `assertNoMixedLanguage` scans a string and logs a
 * `[locale-guard]` warning when it detects characters from a script that
 * doesn't belong to the active locale (e.g. Hebrew in an `en` UI).
 */

import type { Language } from "@/i18n/types";
import { getSignNameByKey, getElementName } from "@/lib/astroLocale";
import { formatMonthName } from "@/lib/dateTimeFormat";
import { en } from "@/i18n/translations/en";
import { he } from "@/i18n/translations/he";
import { ru } from "@/i18n/translations/ru";
import { ar } from "@/i18n/translations/ar";

const translationTables: Record<Language, Record<string, string>> = {
  en: en as unknown as Record<string, string>,
  he: he as unknown as Record<string, string>,
  ru: ru as unknown as Record<string, string>,
  ar: ar as unknown as Record<string, string>,
};

type ScriptName = "latin" | "hebrew" | "arabic" | "cyrillic";

/** Which script is the canonical one for each locale. */
const EXPECTED_SCRIPT: Record<Language, ScriptName> = {
  en: "latin",
  he: "hebrew",
  ru: "cyrillic",
  ar: "arabic",
};

/** Single-character script detector by Unicode block. */
function detectScript(ch: string): ScriptName | null {
  const code = ch.codePointAt(0);
  if (code === undefined) return null;
  // Hebrew block
  if (code >= 0x0590 && code <= 0x05ff) return "hebrew";
  // Arabic blocks (incl. supplements)
  if ((code >= 0x0600 && code <= 0x06ff) || (code >= 0x0750 && code <= 0x077f) || (code >= 0xfb50 && code <= 0xfdff) || (code >= 0xfe70 && code <= 0xfeff)) return "arabic";
  // Cyrillic blocks
  if ((code >= 0x0400 && code <= 0x04ff) || (code >= 0x0500 && code <= 0x052f)) return "cyrillic";
  // Basic Latin letters + Latin Extended
  if ((code >= 0x0041 && code <= 0x007a) || (code >= 0x00c0 && code <= 0x024f)) return "latin";
  return null;
}

/**
 * Dev-only: warns when `text` contains a script that doesn't match the
 * active `lang`. Punctuation, numbers, emoji, and symbols are ignored.
 */
export function assertNoMixedLanguage(text: string, lang: Language, context = ""): void {
  if (!text) return;
  // Cheap dev-guard. Vite exposes `import.meta.env.DEV`.
  let isDev = false;
  try {
    isDev = Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV);
  } catch {
    isDev = false;
  }
  if (!isDev) return;

  const expected = EXPECTED_SCRIPT[lang];
  // Locales whose strings frequently include Latin loanwords (proper nouns,
  // brand names, "AI", etc.). Never warn on Latin in those — only warn on
  // non-Latin scripts that don't belong to the active locale.
  const allowsLatinLoanwords = lang !== "en";

  for (const ch of text) {
    const script = detectScript(ch);
    if (!script) continue;
    if (script === expected) continue;
    if (allowsLatinLoanwords && script === "latin") continue;
    // Mismatch.
    // eslint-disable-next-line no-console
    console.warn(
      `[locale-guard] Mixed language detected: expected "${lang}" (${expected}), found ${script} in ${JSON.stringify(text)}${context ? ` — ${context}` : ""}`,
    );
    return;
  }
}

/** Localized zodiac sign by key (`aries`, `taurus`, …). */
export function getLocalizedZodiacSign(signKey: string, locale: Language): string {
  const out = getSignNameByKey(signKey, locale);
  assertNoMixedLanguage(out, locale, `zodiac:${signKey}`);
  return out;
}

/** Localized element name by key (`fire` | `earth` | `air` | `water`). */
export function getLocalizedElement(elementKey: string, locale: Language): string {
  const out = getElementName(elementKey, locale);
  assertNoMixedLanguage(out, locale, `element:${elementKey}`);
  return out;
}

/**
 * Localized month name. Accepts a Date, an ISO date string, or a 1-based
 * month index (1=January … 12=December).
 */
export function getLocalizedMonth(month: Date | string | number, locale: Language): string {
  let date: Date;
  if (typeof month === "number") {
    // 1-based month → mid-month date in current year for stable formatting.
    const m = Math.max(1, Math.min(12, Math.floor(month)));
    date = new Date(new Date().getFullYear(), m - 1, 15);
  } else if (typeof month === "string") {
    date = new Date(month);
  } else {
    date = month;
  }
  const out = formatMonthName(date, locale);
  assertNoMixedLanguage(out, locale, `month`);
  return out;
}

/**
 * Hard-coded localized fallback strings used when a translation key is
 * missing or when we need to swallow a raw server/runtime error and still
 * show something readable to the user. Each locale has its own copy — we
 * NEVER fall back to English in a non-English UI.
 */
const LOCALIZED_FALLBACKS: Record<Language, { loading: string; error: string; empty: string }> = {
  en: { loading: "Loading...", error: "Something went wrong, try again", empty: "—" },
  he: { loading: "טוען תוכן...", error: "שגיאה בשירות, נסו שוב", empty: "—" },
  ru: { loading: "Загрузка...", error: "Ошибка сервиса, попробуйте снова", empty: "—" },
  ar: { loading: "جارٍ التحميل...", error: "خطأ في الخدمة، حاولوا مرة أخرى", empty: "—" },
};

/** Returns the localized loading/error/empty fallback for the active locale. */
export function getLocalizedFallback(locale: Language, kind: "loading" | "error" | "empty" = "loading"): string {
  const bucket = LOCALIZED_FALLBACKS[locale] || LOCALIZED_FALLBACKS.en;
  return bucket[kind];
}

/**
 * Localized translation-table label by key. If the active locale is missing
 * the key we return the localized fallback for the active locale — we
 * NEVER cross-language fall back (no English text in HE/RU/AR UI, and no
 * Hebrew text in EN/RU/AR UI).
 *
 * Set `crossFallback = true` only for keys that are guaranteed to be
 * universally readable (proper nouns, brand names) — defaults to false.
 */
export function getLocalizedLabel(labelKey: string, locale: Language, crossFallback = false): string {
  const table = translationTables;
  const localized = table[locale]?.[labelKey];
  if (typeof localized === "string" && localized.length > 0) {
    assertNoMixedLanguage(localized, locale, `label:${labelKey}`);
    return localized;
  }
  if (crossFallback) {
    const fallback = table.en?.[labelKey];
    if (typeof fallback === "string" && fallback.length > 0) return fallback;
  }
  // Strict same-locale fallback. Better an empty-state placeholder than
  // leaking English text into a Hebrew/Russian/Arabic screen.
  return getLocalizedFallback(locale, "empty");
}

/**
 * Sanitize an unknown server/runtime error message before showing it to the
 * user. Raw server `error` strings frequently contain English text, code
 * identifiers (e.g. `FEATURE_PROMPTS is not defined`), or stack traces.
 * We log them for developers and return a localized fallback instead.
 */
export function safeErrorText(rawError: unknown, locale: Language, context = ""): string {
  if (rawError != null) {
    const asString =
      typeof rawError === "string"
        ? rawError
        : typeof (rawError as { message?: unknown }).message === "string"
          ? (rawError as { message: string }).message
          : "";
    if (asString) {
      // eslint-disable-next-line no-console
      console.warn(`[locale-guard] suppressed raw error${context ? ` (${context})` : ""}:`, asString);
    }
  }
  return getLocalizedFallback(locale, "error");
}

export const localeGuard = {
  getLocalizedZodiacSign,
  getLocalizedElement,
  getLocalizedMonth,
  getLocalizedLabel,
  getLocalizedFallback,
  safeErrorText,
  assertNoMixedLanguage,
};

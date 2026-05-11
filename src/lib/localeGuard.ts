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
import { mysticalProfile } from "@/lib/mysticalProfile";
import { repairGenderGrammar, stripBidiControls } from "@/lib/genderGrammarRepair";

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

/**
 * Returns true when `text` belongs to the active locale's script.
 *
 * - Empty/whitespace/numeric-only strings are valid (nothing to mismatch).
 * - Punctuation, digits, emoji, symbols are ignored.
 * - In non-EN locales we tolerate Latin loanwords (brand names, "AI", proper
 *   nouns) but reject when they clearly dominate the string.
 *
 * Used by `enforceLocale` to BLOCK wrong-language text from rendering.
 */
const MAX_FOREIGN_RATIO = 0.15;

export function isValidLanguage(text: string, locale: Language): boolean {
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
    if (script === expected) { expectedCount += 1; continue; }
    if (locale !== "en" && script === "latin") { latinLoanCount += 1; continue; }
    foreignCount += 1;
  }

  if (totalLetters === 0) return true;
  // Hard reject: ANY truly foreign-script character (e.g. Hebrew in EN/RU/AR).
  if (foreignCount > 0) return false;
  if (locale !== "en") {
    const loanRatio = latinLoanCount / totalLetters;
    // Only reject when Latin clearly dominates (e.g. an English sentence
    // accidentally rendered in a Hebrew UI). Short loanwords are fine.
    if (loanRatio > 0.5 && expectedCount === 0) return false;
    if (loanRatio > MAX_FOREIGN_RATIO && expectedCount > 0 && latinLoanCount > 6) return false;
  }
  return true;
}

/**
 * BLOCKING enforcement helper. If `text` doesn't match the active locale,
 * log a warning and return a safe localized fallback INSTEAD of the bad text.
 * Use this for any dynamic value that could leak wrong-language text to UI.
 */
export function enforceLocale(
  text: string | null | undefined,
  locale: Language,
  fallback?: string,
  context = "",
): string {
  if (!text) return fallback ?? getLocalizedFallback(locale, "loading");
  // Always try silent autocorrect first — patches single English-word leaks
  // (e.g. "Guide" inside Hebrew paragraphs) before validation/blocking.
  let working = text;
  if (locale !== "en") {
    const fix = autoCorrectLocale(text, locale);
    if (fix.changed) working = fix.corrected;
  }
  // HE/AR: repair dual-gender slash forms (את/ה, חש/ה, …) using the
  // locked profile gender so readers never see mixed grammar.
  if (locale === "he" || locale === "ar") {
    try {
      working = stripBidiControls(working);
      const g = mysticalProfile.getEffectiveGender?.();
      const repair = repairGenderGrammar(working, locale, g);
      if (repair.changed) working = repair.repaired;
    } catch {/* defensive: never crash UI on repair */}
  }
  if (isValidLanguage(working, locale)) return working;
  // eslint-disable-next-line no-console
  console.warn(
    `[locale-guard] BLOCKED wrong-language text for locale "${locale}"${context ? ` (${context})` : ""}:`,
    JSON.stringify(working.slice(0, 120)),
  );
  return fallback ?? getLocalizedFallback(locale, "loading");
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
 *
 * Production-safe: `loading` uses contextual phrasing ("Content loading...")
 * rather than the bare "Loading..." token, so users in any locale see a
 * complete, natural sentence even when something fails to render.
 */
const LOCALIZED_FALLBACKS: Record<Language, { loading: string; error: string; empty: string }> = {
  en: { loading: "Content loading...", error: "Something went wrong, try again", empty: "—" },
  he: { loading: "התוכן בטעינה...", error: "שגיאה בשירות, נסו שוב", empty: "—" },
  ru: { loading: "Контент загружается...", error: "Ошибка сервиса, попробуйте снова", empty: "—" },
  ar: { loading: "يتم تحميل المحتوى...", error: "خطأ في الخدمة، حاولوا مرة أخرى", empty: "—" },
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

// ─────────────────────────────────────────────────────────────────────
// Silent auto-correction dictionary
// ─────────────────────────────────────────────────────────────────────
//
// When the AI (or a stray label) leaks a SINGLE common English word into a
// non-English string we don't want to nuke the entire text — we just patch
// the offending word in place. Keys are lowercased English source words;
// values are the localized replacement.
//
// Keep this list short and HIGH-CONFIDENCE: only words that have a single
// unambiguous translation across all reading contexts.
const AUTOCORRECT_DICTIONARY: Record<Exclude<Language, "en">, Record<string, string>> = {
  he: {
    loading: "טוען", error: "שגיאה", yes: "כן", no: "לא",
    today: "היום", tomorrow: "מחר", yesterday: "אתמול",
    love: "אהבה", money: "כסף", career: "קריירה", health: "בריאות",
    family: "משפחה", home: "בית", work: "עבודה",
    fire: "אש", water: "מים", earth: "אדמה", air: "אוויר",
    moon: "ירח", sun: "שמש", star: "כוכב", stars: "כוכבים",
    planet: "כוכב לכת", planets: "כוכבי לכת", zodiac: "מזל",
    next: "הבא", back: "חזרה", close: "סגירה", share: "שיתוף",
    copy: "העתקה", continue: "המשך", unlock: "פתיחה", reading: "קריאה",
    guide: "מדריך", guides: "מדריכים", guidance: "הכוונה",
    advisor: "יועץ", oracle: "אורקל", tarot: "טארוט",
    energy: "אנרגיה", light: "אור", soul: "נשמה", heart: "לב",
    life: "חיים", future: "עתיד", past: "עבר", present: "הווה",
    mystery: "מסתורין", cosmic: "קוסמי", universe: "יקום",
    spirit: "רוח", balance: "איזון", growth: "צמיחה",
    wisdom: "חוכמה", journey: "מסע", path: "דרך",
    message: "מסר", sign: "סימן", insight: "תובנה",
    intuition: "אינטואיציה", destiny: "גורל", fate: "מזל",
    healing: "ריפוי", clarity: "בהירות", harmony: "הרמוניה",
    truth: "אמת", power: "כוח", magic: "קסם",
    horoscope: "הורוסקופ", chart: "מפה", forecast: "תחזית",
  },
  ru: {
    loading: "загрузка",
    error: "ошибка",
    yes: "да",
    no: "нет",
    today: "сегодня",
    tomorrow: "завтра",
    love: "любовь",
    money: "деньги",
    career: "карьера",
    health: "здоровье",
    family: "семья",
    home: "дом",
    work: "работа",
    fire: "огонь",
    water: "вода",
    earth: "земля",
    air: "воздух",
    moon: "Луна",
    sun: "Солнце",
    star: "звезда",
    stars: "звёзды",
    next: "далее",
    back: "назад",
    close: "закрыть",
    share: "поделиться",
    copy: "копировать",
    continue: "продолжить",
    unlock: "открыть",
    reading: "чтение",
  },
  ar: {
    loading: "تحميل", error: "خطأ", yes: "نعم", no: "لا",
    today: "اليوم", tomorrow: "غداً", yesterday: "أمس",
    love: "الحب", money: "المال", career: "المهنة", health: "الصحة",
    family: "العائلة", home: "المنزل", work: "العمل",
    fire: "النار", water: "الماء", earth: "الأرض", air: "الهواء",
    moon: "القمر", sun: "الشمس", star: "نجم", stars: "نجوم",
    planet: "كوكب", planets: "كواكب", zodiac: "البرج",
    next: "التالي", back: "رجوع", close: "إغلاق", share: "مشاركة",
    copy: "نسخ", continue: "متابعة", unlock: "فتح", reading: "قراءة",
    guide: "مرشد", guides: "مرشدون", guidance: "إرشاد",
    advisor: "مستشار", oracle: "عرّاف", tarot: "تاروت",
    energy: "طاقة", light: "نور", soul: "روح", heart: "قلب",
    life: "حياة", future: "المستقبل", past: "الماضي", present: "الحاضر",
    mystery: "سرّ", cosmic: "كوني", universe: "الكون",
    spirit: "الروح", balance: "توازن", growth: "نموّ",
    wisdom: "حكمة", journey: "رحلة", path: "طريق",
    message: "رسالة", sign: "إشارة", insight: "بصيرة",
    intuition: "حدس", destiny: "قدر", fate: "مصير",
    healing: "شفاء", clarity: "وضوح", harmony: "انسجام",
    truth: "حقيقة", power: "قوة", magic: "سحر",
    horoscope: "الأبراج", chart: "خريطة", forecast: "توقعات",
  },
};

/** Count Latin-script letters vs. expected-script letters in a string. */
function countScripts(text: string, locale: Language): { expected: number; latin: number; total: number } {
  const expectedScript = EXPECTED_SCRIPT[locale];
  let expected = 0;
  let latin = 0;
  let total = 0;
  for (const ch of text) {
    const s = detectScript(ch);
    if (!s) continue;
    total += 1;
    if (s === expectedScript) expected += 1;
    else if (s === "latin") latin += 1;
  }
  return { expected, latin, total };
}

/**
 * Silently patch a small English-word leak inside an otherwise localized
 * string. Returns the corrected text. Only triggers when:
 *   - locale is not English
 *   - the string is mostly in the expected script
 *   - the offending Latin words are present in the dictionary
 *
 * If the mismatch is too large (e.g. half the sentence is English) we leave
 * the text alone so the caller can decide to fall back / retry.
 */
export function autoCorrectLocale(text: string, locale: Language): { corrected: string; changed: boolean } {
  if (!text || locale === "en") return { corrected: text, changed: false };
  const { expected, latin, total } = countScripts(text, locale);
  if (total === 0 || latin === 0) return { corrected: text, changed: false };
  // Only auto-correct when expected language clearly dominates.
  if (expected === 0 || latin / total > 0.4) return { corrected: text, changed: false };

  const dict = AUTOCORRECT_DICTIONARY[locale as Exclude<Language, "en">];
  let changed = false;
  const corrected = text.replace(/[A-Za-z]+/g, (word) => {
    const replacement = dict[word.toLowerCase()];
    if (replacement) {
      changed = true;
      trackLocaleEvent("autocorrect_applied", { locale, word });
      return replacement;
    }
    return word;
  });
  return { corrected, changed };
}

// ─────────────────────────────────────────────────────────────────────
// Attribute / metadata validation
// ─────────────────────────────────────────────────────────────────────
//
// Use these for the long-tail localization surfaces that don't render as
// visible body text: tooltips, aria-labels, placeholders, share/copy
// payloads, meta descriptions, toast messages, etc.
//
// The flow is always the same:
//   1. Try to auto-correct a small leak.
//   2. If still invalid, log + emit analytics + return localized fallback.

type AttributeKind =
  | "tooltip"
  | "aria-label"
  | "placeholder"
  | "share"
  | "copy"
  | "meta-description"
  | "error"
  | "generic";

export function validateAttribute(
  text: string | null | undefined,
  locale: Language,
  kind: AttributeKind = "generic",
  fallback?: string,
): string {
  if (!text) return fallback ?? getLocalizedFallback(locale, "empty");
  if (isValidLanguage(text, locale)) return text;

  // Try auto-correction first — single-word leaks should self-heal.
  const { corrected, changed } = autoCorrectLocale(text, locale);
  if (changed && isValidLanguage(corrected, locale)) {
    return corrected;
  }

  trackLocaleEvent("language_validation_failed", { locale, kind, sample: text.slice(0, 80) });
  // eslint-disable-next-line no-console
  console.warn(
    `[locale-guard] BLOCKED ${kind} for locale "${locale}":`,
    JSON.stringify(text.slice(0, 120)),
  );
  trackLocaleEvent("fallback_used", { locale, kind });
  return fallback ?? (kind === "error" ? getLocalizedFallback(locale, "error") : getLocalizedFallback(locale, "empty"));
}

// ─────────────────────────────────────────────────────────────────────
// Lightweight analytics hook
// ─────────────────────────────────────────────────────────────────────
//
// We don't want a hard dependency on a specific analytics SDK here — the
// locale guard runs everywhere. Instead we fan events out to:
//   1. window.dataLayer (GTM-style) when available
//   2. window.analytics.track (Segment-style) when available
//   3. console.info in dev so developers can see them while testing
//
// Events:
//   - language_validation_failed
//   - retry_triggered
//   - fallback_used
//   - autocorrect_applied
type LocaleAnalyticsEvent =
  | "language_validation_failed"
  | "retry_triggered"
  | "fallback_used"
  | "autocorrect_applied";

export function trackLocaleEvent(event: LocaleAnalyticsEvent, payload: Record<string, unknown> = {}): void {
  try {
    const w = (typeof window !== "undefined" ? window : undefined) as
      | (Window & {
          dataLayer?: Array<Record<string, unknown>>;
          analytics?: { track?: (e: string, p: Record<string, unknown>) => void };
        })
      | undefined;
    if (w?.dataLayer && Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event, ...payload });
    }
    if (w?.analytics?.track) {
      w.analytics.track(event, payload);
    }
    let isDev = false;
    try {
      isDev = Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV);
    } catch {
      isDev = false;
    }
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(`[locale-analytics] ${event}`, payload);
    }
  } catch {
    /* analytics must never throw */
  }
}

// ─────────────────────────────────────────────────────────────────────
// AI generation retry helper
// ─────────────────────────────────────────────────────────────────────
//
// Wraps an AI generation call with a single language-validation retry. The
// caller passes a `generate(strict)` async function that performs the actual
// AI request — on the retry pass `strict` is `true`, signalling that the
// caller should add an extra "respond ONLY in <locale>" instruction to the
// prompt.
//
// Returns either a valid (or auto-corrected) string OR the localized
// fallback when both attempts produce wrong-language text.

export async function generateWithLocaleRetry(
  generate: (strict: boolean) => Promise<string>,
  locale: Language,
  context = "ai-generation",
): Promise<{ text: string; usedFallback: boolean; usedRetry: boolean; usedAutoCorrect: boolean }> {
  // First attempt
  let raw = "";
  try {
    raw = (await generate(false)) ?? "";
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`[locale-guard] ${context} first attempt threw`, e);
    raw = "";
  }

  if (raw && isValidLanguage(raw, locale)) {
    return { text: raw, usedFallback: false, usedRetry: false, usedAutoCorrect: false };
  }

  // Try silent auto-correction before retrying — cheaper than a second AI call.
  if (raw) {
    const { corrected, changed } = autoCorrectLocale(raw, locale);
    if (changed && isValidLanguage(corrected, locale)) {
      return { text: corrected, usedFallback: false, usedRetry: false, usedAutoCorrect: true };
    }
  }

  // Retry once with stricter instruction.
  trackLocaleEvent("retry_triggered", { locale, context });
  let retryRaw = "";
  try {
    retryRaw = (await generate(true)) ?? "";
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`[locale-guard] ${context} retry threw`, e);
    retryRaw = "";
  }

  if (retryRaw && isValidLanguage(retryRaw, locale)) {
    return { text: retryRaw, usedFallback: false, usedRetry: true, usedAutoCorrect: false };
  }

  // Final auto-correct pass on the retry response.
  if (retryRaw) {
    const { corrected, changed } = autoCorrectLocale(retryRaw, locale);
    if (changed && isValidLanguage(corrected, locale)) {
      return { text: corrected, usedFallback: false, usedRetry: true, usedAutoCorrect: true };
    }
  }

  trackLocaleEvent("language_validation_failed", { locale, context, retried: true });
  trackLocaleEvent("fallback_used", { locale, context });
  // eslint-disable-next-line no-console
  console.warn(`[locale-guard] ${context} failed validation after retry — using localized fallback`);
  return { text: getLocalizedFallback(locale, "loading"), usedFallback: true, usedRetry: true, usedAutoCorrect: false };
}

export const localeGuard = {
  getLocalizedZodiacSign,
  getLocalizedElement,
  getLocalizedMonth,
  getLocalizedLabel,
  getLocalizedFallback,
  safeErrorText,
  assertNoMixedLanguage,
  isValidLanguage,
  enforceLocale,
  autoCorrectLocale,
  validateAttribute,
  trackLocaleEvent,
  generateWithLocaleRetry,
};


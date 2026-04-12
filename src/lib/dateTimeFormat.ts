import type { Language } from "@/i18n/types";

const LOCALE_MAP: Record<Language, string> = {
  he: "he-IL",
  en: "en-US",
  ru: "ru-RU",
  ar: "ar-SA",
};

/** Get the Intl locale string for a given app language */
export function getLocale(lang: Language): string {
  return LOCALE_MAP[lang] || "en-US";
}

/** Format a date for display: "April 11, 2026" (EN) / "11 באפריל 2026" (HE) */
export function formatDate(date: Date | string, lang: Language): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(getLocale(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format a short date: "04/11/2026" (EN) / "11/04/2026" (HE) */
export function formatShortDate(date: Date | string, lang: Language): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(getLocale(lang), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Format time only: "3:45 PM" (EN) / "15:45" (HE) */
export function formatTime(date: Date | string, lang: Language): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(getLocale(lang), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: lang === "en",
  });
}

/** Format date + time: "April 11, 2026, 3:45 PM" (EN) / "11 באפריל 2026, 15:45" (HE) */
export function formatDateTime(date: Date | string, lang: Language): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(getLocale(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: lang === "en",
  });
}

/** Format with weekday: "Sunday, April 11, 2026" (EN) / "יום ראשון, 11 באפריל 2026" (HE) */
export function formatFullDate(date: Date | string, lang: Language): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(getLocale(lang), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format month name only: "April" (EN) / "אפריל" (HE) */
export function formatMonthName(date: Date | string, lang: Language): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(getLocale(lang), { month: "long" });
}

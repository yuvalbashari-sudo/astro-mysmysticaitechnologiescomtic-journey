/**
 * Central assistant identity configuration.
 * The internal identifier stays constant; display names are localized via i18n (advisor_name key).
 */
export const assistantId = "norielle";

/** Fallback name (English) — prefer using t.advisor_name from i18n when available */
export const assistantName = "Norielle";

/** Localized display names for the advisor */
export const advisorDisplayName: Record<string, string> = {
  he: "נוריאל",
  en: "Norielle",
  ru: "Нориэль",
  ar: "نورييل",
};

/** Get the advisor display name for a given language code */
export const getAdvisorName = (lang: string): string =>
  advisorDisplayName[lang] || advisorDisplayName.en;

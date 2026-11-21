import type { Language } from "@/i18n/types";

const scripts: Record<Language, RegExp> = {
  he: /\p{Script_Extensions=Hebrew}/u,
  en: /\p{Script_Extensions=Latin}/u,
  ru: /\p{Script_Extensions=Cyrillic}/u,
  ar: /\p{Script_Extensions=Arabic}/u,
};

/** Symbols, punctuation and numbers can accompany prose in all four languages. */
export function matchesReadingScript(text: string, language: Language): boolean {
  return (text.normalize("NFKC").match(/\p{L}/gu) ?? []).every(letter => scripts[language].test(letter));
}

export function isLocalizedReading(text: unknown, language: Language): text is string {
  return typeof text === "string" && /\p{L}/u.test(text) && matchesReadingScript(text, language);
}

const languageNames = { he: "Hebrew", en: "English", ru: "Russian", ar: "Arabic" };
export function readingLanguageInstruction(language: Language): string {
  const target = languageNames[language];
  return `Write all headings and prose in ${target} using its own script. Translate card names and astrological terms. Paraphrase the question in ${target}. When a person's name has no known spelling in ${target}, use second person. Do not quote foreign words, alternate spellings or time zone identifiers.`;
}

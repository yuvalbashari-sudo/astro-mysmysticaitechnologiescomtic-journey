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

const houses = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const angles = {
  he: { ASC: "האופק העולה", DSC: "האופק היורד", MC: "רום השמים", IC: "תחתית השמים" },
  ru: { ASC: "Асцендент", DSC: "Десцендент", MC: "Середина неба", IC: "Основание неба" },
  ar: { ASC: "الطالع", DSC: "الغارب", MC: "وسط السماء", IC: "قاع السماء" },
};

/** Conventional chart notation is data, so render its localized equivalent before checking prose. */
export function localizeChartNotation(text: string, language: Language) {
  if (language === "en") return text;
  return text.replace(/(?<![\p{L}\p{N}])[A-Z]+(?![\p{L}\p{N}])/gu, token => {
    const number = houses.indexOf(token);
    if (number >= 0) return String(number + 1);
    return Object.prototype.hasOwnProperty.call(angles[language], token) ? angles[language][token as keyof typeof angles.he] : token;
  });
}

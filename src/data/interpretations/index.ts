import type { Language } from "@/i18n/types";
import { getElementName, getSignNameByKey } from "@/lib/astroLocale";
import type { TarotWorldCard } from "../tarotWorldData";
import type { ZodiacSign } from "../zodiacData";
import tarotEn from "./tarot.en.json";
import tarotRu from "./tarot.ru.json";
import tarotAr from "./tarot.ar.json";
import zodiacEn from "./zodiac.en.json";
import zodiacRu from "./zodiac.ru.json";
import zodiacAr from "./zodiac.ar.json";

type CardReading = Pick<TarotWorldCard["meanings"], "general" | "love" | "career" | "spiritual" | "advice">;
type SignReading = Pick<ZodiacSign, "personality" | "monthlyEnergy" | "love" | "money" | "career" | "health" | "spiritual" | "sensual">;
type Translated<T> = Record<Exclude<Language, "he">, Record<string, T>>;

const cards: Translated<CardReading> = { en: tarotEn, ru: tarotRu, ar: tarotAr };
const signs: Translated<SignReading> = { en: zodiacEn, ru: zodiacRu, ar: zodiacAr };
const elements: Record<string, string> = { "אש": "fire", "אדמה": "earth", "אוויר": "air", "מים": "water" };

export function cardReading(slug: string, card: TarotWorldCard, language: Language): CardReading {
  return language === "he" ? card.meanings : cards[language][slug];
}

export function signReading(slug: string, sign: ZodiacSign, language: Language): SignReading {
  return language === "he" ? sign : signs[language][slug];
}

export function signLabels(slug: string, sign: ZodiacSign, language: Language) {
  const elementKey = elements[sign.element];
  return { name: getSignNameByKey(slug, language), elementKey, element: getElementName(elementKey, language) };
}

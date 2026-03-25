/**
 * Unified tarot card model combining Major and Minor Arcana.
 * Single import for the gallery and any future features.
 */
import type { Language } from "@/i18n/types";
import { majorArcanaCards, type MajorArcanaCard } from "./majorArcanaCards";
import { minorArcanaCards, type MinorArcanaCard, type MinorArcanaSuit } from "./minorArcanaCards";

export type TarotSuitFilter = "all" | "major" | MinorArcanaSuit;

export interface UnifiedTarotCard {
  id: string;
  slug: string;
  name: Record<Language, string>;
  image: string;
  suit: "major" | MinorArcanaSuit;
  shortMeaning: Record<Language, string>;
}

/** Convert Major Arcana to the unified shape */
function toUnified(card: MajorArcanaCard): UnifiedTarotCard {
  return {
    id: card.id,
    slug: card.id,
    name: card.name,
    image: card.image,
    suit: "major",
    shortMeaning: {
      he: "ארקנה עליונה — משמעות עמוקה",
      en: "Major Arcana — deep significance",
      ru: "Старший Аркан — глубокое значение",
      ar: "أركانا كبرى — أهمية عميقة",
    },
  };
}

function minorToUnified(card: MinorArcanaCard): UnifiedTarotCard {
  return {
    id: card.id,
    slug: card.slug,
    name: card.name,
    image: card.image,
    suit: card.suit,
    shortMeaning: card.shortMeaning,
  };
}

export const allTarotCards: UnifiedTarotCard[] = [
  ...majorArcanaCards.map(toUnified),
  ...minorArcanaCards.map(minorToUnified),
];

export function filterBySuit(suit: TarotSuitFilter): UnifiedTarotCard[] {
  if (suit === "all") return allTarotCards;
  return allTarotCards.filter((c) => c.suit === suit);
}

/** Suit filter labels per language */
export const suitFilterLabels: Record<TarotSuitFilter, Record<Language, string>> = {
  all: { he: "כל הקלפים", en: "All Cards", ru: "Все карты", ar: "جميع البطاقات" },
  major: { he: "ארקנה עליונה", en: "Major Arcana", ru: "Старшие Арканы", ar: "الأركانا الكبرى" },
  swords: { he: "חרבות", en: "Swords", ru: "Мечи", ar: "السيوف" },
  cups: { he: "גביעים", en: "Cups", ru: "Кубки", ar: "الكؤوس" },
  wands: { he: "מטות", en: "Wands", ru: "Жезлы", ar: "العصي" },
  pentacles: { he: "מטבעות", en: "Pentacles", ru: "Пентакли", ar: "النجوم" },
};

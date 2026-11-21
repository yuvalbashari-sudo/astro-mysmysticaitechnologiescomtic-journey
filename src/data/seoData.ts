import { majorArcana } from "./tarotWorldData";
import { allTarotCards } from "./allTarotCards";

/**
 * SEO slug mappings for tarot cards and zodiac signs.
 */

export function cardSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/^the-/, "the-");
}

export function zodiacSlug(name: string): string {
  return name.toLowerCase();
}

// Reverse lookup: slug → English name
export const TAROT_SLUG_MAP: Record<string, string> = Object.fromEntries(
  [
    ...majorArcana.map(card => [cardSlug(card.name), card.name]),
    ...allTarotCards.filter(card => card.suit !== "major").map(card => [card.slug, card.name.en])
  ]
);

export const ZODIAC_SLUG_MAP: Record<string, string> = {
  aries: "aries",
  taurus: "taurus",
  gemini: "gemini",
  cancer: "cancer",
  leo: "leo",
  virgo: "virgo",
  libra: "libra",
  scorpio: "scorpio",
  sagittarius: "sagittarius",
  capricorn: "capricorn",
  aquarius: "aquarius",
  pisces: "pisces",
};

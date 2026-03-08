import { TarotWorldCard } from "./tarotWorldData";

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
export const TAROT_SLUG_MAP: Record<string, string> = {
  "the-fool": "The Fool",
  "the-magician": "The Magician",
  "the-high-priestess": "The High Priestess",
  "the-empress": "The Empress",
  "the-emperor": "The Emperor",
  "the-hierophant": "The Hierophant",
  "the-lovers": "The Lovers",
  "the-chariot": "The Chariot",
  "strength": "Strength",
  "the-wheel-of-fortune": "The Wheel of Fortune",
  "justice": "Justice",
  "the-hanged-man": "The Hanged Man",
  "death": "Death",
  "the-star": "The Star",
  "the-moon": "The Moon",
  "the-sun": "The Sun",
  "judgement": "Judgement",
  "the-world": "The World",
};

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

// SEO meta data per card (English)
export function tarotSeoMeta(card: { name: string; hebrewName: string; number: number }) {
  return {
    title: `${card.name} Tarot Card Meaning — ${card.hebrewName} | ASTROLOGAI`,
    description: `Discover the meaning of ${card.name} (${card.hebrewName}) tarot card. Love, career, spiritual interpretation and symbolism. Free tarot reading at ASTROLOGAI.`,
  };
}

export function zodiacSeoMeta(sign: { name: string; hebrewName: string; symbol: string }) {
  return {
    title: `${sign.name} ${sign.symbol} Zodiac Sign — ${sign.hebrewName} | ASTROLOGAI`,
    description: `Everything about ${sign.name} (${sign.hebrewName}): personality, love, career, compatibility, spiritual traits. Get your personal reading at ASTROLOGAI.`,
  };
}

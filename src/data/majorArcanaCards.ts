import foolImg from "@/assets/tarot/fool.jpg";
import magicianImg from "@/assets/tarot/magician.jpg";
import highPriestessImg from "@/assets/tarot/high-priestess.jpg";
import empressImg from "@/assets/tarot/empress.jpg";
import emperorImg from "@/assets/tarot/emperor.jpg";
import hierophantImg from "@/assets/tarot/hierophant.jpg";
import loversImg from "@/assets/tarot/lovers.jpg";
import chariotImg from "@/assets/tarot/chariot.jpg";
import strengthImg from "@/assets/tarot/strength.jpg";
import hermitImg from "@/assets/tarot/hermit.jpg";
import wheelImg from "@/assets/tarot/wheel-of-fortune.jpg";
import justiceImg from "@/assets/tarot/justice.jpg";
import hangedManImg from "@/assets/tarot/hanged-man.jpg";
import deathImg from "@/assets/tarot/death.jpg";
import temperanceImg from "@/assets/tarot/temperance.jpg";
import devilImg from "@/assets/tarot/devil.jpg";
import towerImg from "@/assets/tarot/tower.jpg";
import starImg from "@/assets/tarot/star.jpg";
import moonImg from "@/assets/tarot/moon.jpg";
import sunImg from "@/assets/tarot/sun.jpg";
import judgementImg from "@/assets/tarot/judgement.jpg";
import worldImg from "@/assets/tarot/world.jpg";

import type { Language } from "@/i18n/types";

export interface MajorArcanaCard {
  id: string;
  number: number;
  name: {
    he: string;
    en: string;
    ru: string;
    ar: string;
  };
  image: string;
  arcana: "major";
  symbol: string;
}

export const majorArcanaCards: MajorArcanaCard[] = [
  { id: "the-fool", number: 0, name: { he: "השוטה", en: "The Fool", ru: "Шут", ar: "الأحمق" }, image: foolImg, arcana: "major", symbol: "🃏" },
  { id: "the-magician", number: 1, name: { he: "הקוסם", en: "The Magician", ru: "Маг", ar: "الساحر" }, image: magicianImg, arcana: "major", symbol: "🎩" },
  { id: "the-high-priestess", number: 2, name: { he: "הכוהנת הגדולה", en: "The High Priestess", ru: "Верховная Жрица", ar: "الكاهنة العظمى" }, image: highPriestessImg, arcana: "major", symbol: "🌙" },
  { id: "the-empress", number: 3, name: { he: "הקיסרית", en: "The Empress", ru: "Императрица", ar: "الإمبراطورة" }, image: empressImg, arcana: "major", symbol: "👑" },
  { id: "the-emperor", number: 4, name: { he: "הקיסר", en: "The Emperor", ru: "Император", ar: "الإمبراطور" }, image: emperorImg, arcana: "major", symbol: "🏛️" },
  { id: "the-hierophant", number: 5, name: { he: "ההירופנט", en: "The Hierophant", ru: "Иерофант", ar: "الكاهن الأعلى" }, image: hierophantImg, arcana: "major", symbol: "🔑" },
  { id: "the-lovers", number: 6, name: { he: "האוהבים", en: "The Lovers", ru: "Влюблённые", ar: "العشّاق" }, image: loversImg, arcana: "major", symbol: "💕" },
  { id: "the-chariot", number: 7, name: { he: "המרכבה", en: "The Chariot", ru: "Колесница", ar: "العربة" }, image: chariotImg, arcana: "major", symbol: "🏇" },
  { id: "strength", number: 8, name: { he: "הכוח", en: "Strength", ru: "Сила", ar: "القوة" }, image: strengthImg, arcana: "major", symbol: "🦁" },
  { id: "the-hermit", number: 9, name: { he: "הנזיר", en: "The Hermit", ru: "Отшельник", ar: "الناسك" }, image: hermitImg, arcana: "major", symbol: "🏔️" },
  { id: "the-wheel-of-fortune", number: 10, name: { he: "גלגל המזל", en: "The Wheel of Fortune", ru: "Колесо Фортуны", ar: "عجلة الحظ" }, image: wheelImg, arcana: "major", symbol: "🎡" },
  { id: "justice", number: 11, name: { he: "הצדק", en: "Justice", ru: "Справедливость", ar: "العدالة" }, image: justiceImg, arcana: "major", symbol: "⚖️" },
  { id: "the-hanged-man", number: 12, name: { he: "התלוי", en: "The Hanged Man", ru: "Повешенный", ar: "المعلّق" }, image: hangedManImg, arcana: "major", symbol: "🙃" },
  { id: "death", number: 13, name: { he: "המוות", en: "Death", ru: "Смерть", ar: "الموت" }, image: deathImg, arcana: "major", symbol: "💀" },
  { id: "temperance", number: 14, name: { he: "המתינות", en: "Temperance", ru: "Умеренность", ar: "الاعتدال" }, image: temperanceImg, arcana: "major", symbol: "⚗️" },
  { id: "the-devil", number: 15, name: { he: "השטן", en: "The Devil", ru: "Дьявол", ar: "الشيطان" }, image: devilImg, arcana: "major", symbol: "😈" },
  { id: "the-tower", number: 16, name: { he: "המגדל", en: "The Tower", ru: "Башня", ar: "البرج" }, image: towerImg, arcana: "major", symbol: "🗼" },
  { id: "the-star", number: 17, name: { he: "הכוכב", en: "The Star", ru: "Звезда", ar: "النجمة" }, image: starImg, arcana: "major", symbol: "⭐" },
  { id: "the-moon", number: 18, name: { he: "הירח", en: "The Moon", ru: "Луна", ar: "القمر" }, image: moonImg, arcana: "major", symbol: "🌙" },
  { id: "the-sun", number: 19, name: { he: "השמש", en: "The Sun", ru: "Солнце", ar: "الشمس" }, image: sunImg, arcana: "major", symbol: "☀️" },
  { id: "judgement", number: 20, name: { he: "השיפוט", en: "Judgement", ru: "Суд", ar: "الحكم" }, image: judgementImg, arcana: "major", symbol: "📯" },
  { id: "the-world", number: 21, name: { he: "העולם", en: "The World", ru: "Мир", ar: "العالم" }, image: worldImg, arcana: "major", symbol: "🌍" },
];

/**
 * Get a card's localized display name.
 * Priority: current language → English fallback → Hebrew fallback.
 * Hebrew is only used as final fallback (never shown to non-Hebrew users if English exists).
 */
export function getCardName(card: MajorArcanaCard, language: Language): string {
  return card.name[language] || card.name.en || card.name.he;
}

/**
 * Find a MajorArcanaCard by its English name (matching the old TarotCard.name field).
 */
export function findMajorArcanaByEnglishName(englishName: string): MajorArcanaCard | undefined {
  return majorArcanaCards.find((c) => c.name.en === englishName);
}

/**
 * Get the localized name for a card given its English name and current language.
 * Falls back: language → English → Hebrew.
 */
export function getLocalizedCardName(englishName: string, language: Language): string {
  const card = findMajorArcanaByEnglishName(englishName);
  if (!card) return englishName;
  return card.name[language] || card.name.en || card.name.he;
}

/**
 * Draw N random Major Arcana cards (Fisher-Yates shuffle).
 */
export function drawMajorArcana(count: number = 3): MajorArcanaCard[] {
  const shuffled = [...majorArcanaCards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get a deterministic daily card index based on a seed and date.
 */
export function getDailyMajorArcanaIndex(seed: string, date: string): number {
  let hash = 0;
  const str = `${seed}-${date}`;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash = hash & hash;
  }
  return Math.abs(hash) % majorArcanaCards.length;
}

/**
 * Get a MajorArcanaCard's image. Always use card.image directly.
 */
export function getCardImage(card: MajorArcanaCard): string {
  return card.image;
}

/** Valid Major Arcana English names — the ONLY cards allowed in the app. */
const VALID_CARD_NAMES = new Set(majorArcanaCards.map(c => c.name.en));

/**
 * Debug safeguard: returns true if the name belongs to the Major Arcana set.
 * Logs a warning in dev if an unknown card appears.
 */
export function isValidMajorArcana(englishName: string): boolean {
  const valid = VALID_CARD_NAMES.has(englishName);
  if (!valid && import.meta.env.DEV) {
    console.warn(`[Tarot] Unknown card rejected: "${englishName}" — not in Major Arcana dataset`);
  }
  return valid;
}

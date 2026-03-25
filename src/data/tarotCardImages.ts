/**
 * Unified card image lookup.
 * Builds from allTarotCards (78 cards) so every card — Major and Minor — is covered.
 * Legacy consumers that do `tarotCardImages["The Fool"]` still work.
 */
import { allTarotCards } from "@/data/allTarotCards";
import cardBackImg from "@/assets/tarot/card-back.jpg";

// Map English name → resolved image path for all 78 cards
const imageMap: Record<string, string> = {};
for (const card of allTarotCards) {
  imageMap[card.name.en] = card.image;
  // Also index by slug for any code that uses slug-based lookups
  imageMap[card.slug] = card.image;
}

export const tarotCardImages: Record<string, string> = imageMap;

export const cardBack = cardBackImg;

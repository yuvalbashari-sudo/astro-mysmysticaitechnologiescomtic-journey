import { useLanguage } from "@/i18n/LanguageContext";
import { allTarotCards } from "@/data/allTarotCards";

// Build a lookup from English name → localized names for all 78 cards
const cardNameMap = new Map<string, Record<string, string>>();
for (const card of allTarotCards) {
  cardNameMap.set(card.name.en, card.name as unknown as Record<string, string>);
}

/**
 * Hook that returns a function to get the localized card display name.
 * Supports the full 78-card deck (Major + Minor Arcana).
 */
export function useCardName() {
  const { language } = useLanguage();

  return (englishName: string, hebrewFallback?: string): string => {
    const names = cardNameMap.get(englishName);
    if (names) {
      return names[language] || names.en || englishName;
    }
    // Fallback for unknown cards
    if (language === "he" && hebrewFallback) return hebrewFallback;
    return englishName;
  };
}

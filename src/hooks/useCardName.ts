import { useLanguage } from "@/i18n/LanguageContext";
import { getLocalizedCardName } from "@/data/majorArcanaCards";

/**
 * Hook that returns a function to get the localized card display name.
 * Usage: const cardName = useCardName();
 *        cardName("The Fool") → "השוטה" (in Hebrew) or "The Fool" (in English)
 * 
 * For cards with hebrewName already available, pass both:
 *        cardName("The Fool", "השוטה") → uses majorArcanaCards lookup, falls back to hebrewName
 */
export function useCardName() {
  const { language } = useLanguage();

  return (englishName: string, hebrewFallback?: string): string => {
    const localized = getLocalizedCardName(englishName, language);
    // If the lookup returned the english name unchanged and we have a hebrew fallback for Hebrew lang
    if (localized === englishName && language === "he" && hebrewFallback) {
      return hebrewFallback;
    }
    return localized;
  };
}

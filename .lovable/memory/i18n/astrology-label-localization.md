# Memory: i18n/astrology-label-localization
Updated: now

All visual labels within the astrology experience (natal chart SVG elements, BirthChartModal UI, TarotGuidePage, SimpleNatalChart) are fully localized across all 4 supported languages (Hebrew, English, Russian, Arabic). A centralized `src/lib/astroLocale.ts` utility provides localized planet names, zodiac sign names, and chart UI labels. The BirthChartModal passes the active site language to the AI interpretation edge function. The TarotGuidePage uses i18n translation keys for all content and respects RTL/LTR direction. No hardcoded Hebrew remains in chart components or guide pages.

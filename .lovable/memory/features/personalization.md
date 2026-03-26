User name personalization and multilingual tone system. userName stored in mysticalProfile (localStorage). Name input in DailyCardModal ready phase. ALL three edge functions have name personalization:

1. **mystical-advisor** — LANG_TONE_GUIDES, LANG_NAME_GUIDES, LANG_NO_NAME_GUIDES per language (he/en/ru/ar).
2. **mystical-reading** — Universal name personalization injected at serve() level for ALL reading types (forecast, rising, compatibility, palm, dailyCard, birthChart, tarotSpread). userName passed from client via `streamMysticalReading` which auto-injects it from `mysticalProfile.getUserName()`.
3. **tarot-reading** — userName passed as top-level param from all 3 callers (TarotModal, ImmersiveTarotExperience, TarotWorldModal). Name personalization injected into system prompt.

Each language has native tone instructions that avoid machine-translation feel. All prompts ban generic zodiac phrasing ("בן מזל X", "for Virgos", "для Дев", "لبرج العذراء") in every language. Name used naturally at openings and emotional moments, never overused. Fallback when no name: warm direct second-person address.

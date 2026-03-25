Full 78-card deck is the source of truth for ALL tarot features. The legacy Major Arcana-only restriction has been fully removed.

## Source of truth
- `src/data/allTarotCards.ts` — unified 78-card deck (auto-discovered from assets)
- `allReadingCards` / `drawReadingCards()` — used by all reading/drawing flows
- `tarotCardImages` map is now built dynamically from allTarotCards (covers all 78 cards)
- `useCardName` hook now uses allTarotCards for localization (all suits supported)

## Legacy files (still exist but scoped)
- `src/data/majorArcanaCards.ts` — kept for backward compat but NOT the primary source
- `src/data/tarotWorldData.ts` — TarotWorldModal-specific flow (uses its own majorArcana array)

## Key rule
Never restrict card selection, image lookup, or name resolution to Major Arcana only.

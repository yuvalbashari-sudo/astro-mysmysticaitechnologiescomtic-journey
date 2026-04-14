# Memory: features/aura-result-system

The aura system uses a layered energetic identity model that translates planetary hierarchies into 600+ unique, deterministic profiles. Each result consists of a primary aura family (e.g., solar_gold, moon_silver_blue), secondary supporting tones, and an energetic modifier (e.g., radiant, magnetic, ethereal).

## Architecture (v4 — Locale-Driven)

The core engine (`src/lib/auraResultBank.ts`) outputs **stable internal keys** (`primaryAura`, `modifier`, `titleKey`), never hardcoded single-language titles. No language is the source of truth.

Localized display is handled entirely by `src/lib/auraLocale.ts`, which provides:
- `buildLocalizedTitle(lang, primaryAuraKey, modifierKey)` — correct word order per language (RTL: noun+adj, LTR: adj+noun)
- `getAuraName()`, `getModifierName()`, `getAuraSubtitle()`, `getAuraMeaning()`, `getSectionLabels()`
- Full dictionaries for: English, Hebrew, Russian, Arabic

The `AuraResult` type includes a `titleKey` field (e.g., `"soft_moon_silver_blue"`) for stable identity reference.

Moon's aura family was renamed from `lunar_blue` to `moon_silver_blue` with updated silver-blue visual colors (#A8C4D8).

UI components (`AstralLightReveal`, `AuraResultCard`) import from `auraLocale.ts` — no inline i18n dictionaries.

## Visual Mode System (v5)

A centralized visual mode config (`src/lib/auraVisualMode.ts`) controls the astral figure rendering complexity:
- `AURA_VISUAL_MODE`: `"off"` | `"minimal"` | `"subtle"` | `"full"`
- Currently set to `"minimal"` — disables the heavy astral figure SVG scene
- `"full"` restores the complete astral figure, constellations, beams, and climax effects
- `"subtle"` is reserved for future partial astral presence

In minimal mode, `MinimalAuraEffect` renders a lightweight aura glow layer using CSS-based animations, radial gradients colored by primaryAura/secondaryAuras, and modifier-influenced pulse speed. All heavy SVG/filter/particle code is preserved but gated behind `renderFullScene` in `AstralLightReveal.tsx`.

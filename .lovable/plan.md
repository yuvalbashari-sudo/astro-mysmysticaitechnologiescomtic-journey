
## Goal
Replace the central Sparkles orb block at the top of `MobileAiInsightOverlay` with an in-hero top row (logo + utility icons) that occupies the same vertical space, so headline/CTA/composition stay put. Hide global `MysticalTopBar` on mobile to avoid duplication. Keep full 4-language support with RTL/LTR.

## Changes

### 1. `src/components/MysticalTopBar.tsx`
- Early-return `null` when `isMobile` is true. Desktop untouched.

### 2. `src/components/MobileAiInsightOverlay.tsx`
Replace the existing top "AI orb mark + Norielle • AI label" block (the circular Sparkles badge) with a single in-hero row of the **same approximate height** (~64–72px including label area).

Layout (inside the existing hero container, no extra padding added):
```
[ 🌐 lang ] [ ♿ ]      ASTROLOGAI      [ 📖 guide ] [ 💬 wa ]
```

- Container: `flex items-center justify-between gap-2`, height ~56px + ~12px bottom margin → matches the previous orb+label vertical footprint.
- Center: "ASTROLOGAI" wordmark, gold gradient (reuse styling from `MysticalTopBar`), `fontSize: 22px`, `letter-spacing: 0.18em`, single line.
- Left cluster: `<MysticalLanguageDropdown />` (already supports HE/EN/AR/RU + RTL/LTR via `LanguageContext`) + accessibility `Link` to `/accessibility` (♿ icon, 36×36 round).
- Right cluster: Guides icon `BookOpen` → `Link to="/tarot-guides"` (36×36 round) + WhatsApp icon button (36×36 round, green gradient — reuse existing `whatsappBtn` styles).
- Icon style: 36×36, `hsl(var(--deep-blue-light)/0.5)` bg, `hsl(var(--gold)/0.2)` border, `hsl(var(--gold)/0.7)` icon — lighter than topbar so it reads as overlay, not chrome.
- `dir` is inherited from `LanguageContext` so the row mirrors automatically in HE/AR vs LTR for EN/RU. `justify-between` keeps logo centered visually in both directions.
- z-index: `z-10` within hero stack, `pointer-events-auto`.

### 3. Vertical preservation
Measure replaced block: orb (~56px) + label (~16px) + gap (~8px) ≈ 80px. New row height ~56px + 16px bottom spacing ≈ 72px — within ±10px tolerance, headline/CTA stay in the same position. No changes to `paddingTop`, no changes to anything below the row.

### 4. Out of scope
- Hero headline, CTA, Norielle bubble, scroll cue — untouched.
- Desktop `MysticalTopBar`, HeroSection, SeoContentSection, chat panel — untouched.
- Language logic — already complete in `MysticalLanguageDropdown` + `LanguageContext`; just reused.

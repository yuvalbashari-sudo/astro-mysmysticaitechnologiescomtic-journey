---
name: Mobile AI Insight Hero
description: First-screen mobile-only overlay above the homepage hero — single AI-insight CTA opening Norielle's chat, dismissible to reveal existing menu.
type: feature
---
On mobile (`md:hidden`), a full-viewport AI-insight overlay appears as the first screen via `MobileAiInsightOverlay.tsx`, mounted in `src/pages/Index.tsx` directly after `<HeroSection>`. Desktop is completely untouched.

## Structure
- Glowing AI orb mark + "Norielle • AI" label (top)
- Headline: "I found something about your path" (localized HE/EN/RU/AR)
- Supporting line: "A personal insight based on your current energy"
- Single glowing pill CTA: "Reveal My Personal Insight" → opens `AdvisorChatPanel`
- Norielle avatar + speech bubble ("There's something important here") near bottom — also opens chat
- "Continue exploring" chevron dismisses the overlay to reveal the existing crystal ball + 4-entry menu below

## Behavior
- Dismissal persisted in `sessionStorage` key `astrologai_ai_insight_dismissed_v1` (returns next session)
- Body scroll locked while visible
- Z-index 80 — above hero portal but below modals/chat panel
- Full RTL support (HE/AR) including bubble tail flip

## Constraints
- Mobile-only: do NOT render on `md+` screens
- Existing hero menu (Monthly Forecast, Compatibility, Tarot, Full Chart, Daily Horoscope, crystal ball) remains intact below — accessible after dismiss
- The CTA must open `AdvisorChatPanel`, not any specific reading flow

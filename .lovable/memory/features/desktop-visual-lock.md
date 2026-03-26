Desktop UI visual baseline locked as of 2026-03-26. Do NOT change desktop layout, spacing, alignment, positioning, typography scale, modal layout, card placement, or responsive desktop structure unless the user explicitly requests it.

## Rules
- Apply layout/UI fixes to **mobile only** using mobile-specific breakpoints (`max-width` or `isMobile` guards)
- Do NOT make shared CSS changes that unintentionally affect desktop
- New features may be added on desktop as long as they don't break the approved layout structure
- Before completing any mobile or feature update, verify desktop visual experience remains intact

## NOT restricted (always editable)
- Subscription plans, usage limits, access control, paywalls, gated features
- Onboarding logic, content updates
- Advisor personality, self-introduction, messaging, AI behavior
- Backend logic, product rules, business logic
- Adding new features/sections (as long as existing layout is preserved)

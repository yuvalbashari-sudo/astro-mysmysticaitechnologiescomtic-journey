
The user reverted and now the new mobile hero overlay is gone — they only see the scrolled-down content (SEO section with "גלו את סודות היקום עם ASTROLOGAI"). The TopBar with logo + icons is back, but `MobileAiInsightOverlay` is no longer rendering.

Likely cause: the revert removed the `<MobileAiInsightOverlay />` mount from `src/pages/Index.tsx`, OR the sessionStorage dismiss flag is stuck at "1" so it never shows.

Let me check.

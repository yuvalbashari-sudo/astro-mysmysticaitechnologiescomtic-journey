

## Connect Norielle to the Astrocartography result + tactile tap feedback

### Changes — three surgical edits

**1. `src/components/AstrocartographyModal.tsx` — register reading + reposition avatar**

- Import `useReadingContext`. When `phase === "result"`, register the reading so the advisor opens with full context:
  ```ts
  setActiveReading({
    type: "astrocartography",
    label: t.astrocarto_result_title,
    summary: `${t.astrocarto_result_title}\n\n${t.astrocarto_result_desc}${topCities ? `\n\nTop locations: ${topCities}` : ""}\n\n${t.astrocarto_result_footer}`,
  });
  ```
  Cleanup resets to `null` on unmount / phase change.

- Reposition the mobile avatar out of the top-right collision zone (currently overlaps `TextSizeControl` + close button):
  ```ts
  const avatarStyle = isMobile
    ? { bottom: 18, right: 14, top: "auto" as const, left: "auto" as const, width: 88, height: 88 }
    : undefined;
  ```
  This restores reliable tap targeting and gives `AvatarHoverTeaser` natural room to float above the avatar.

- **No auto-pulse, no forced teaser.** The teaser surfaces only via natural hover/tap (existing `AvatarHoverTeaser` behavior).

**2. `src/components/CinematicModalShell.tsx` — tactile tap micro-interaction**

Replace the avatar button's brightness-only feedback with a felt scale + gold-glow burst, so the tap is visibly acknowledged the instant it happens (in parallel with the advisor panel mounting):

```tsx
whileTap={{
  scale: 0.96,
  boxShadow: "0 0 0 3px hsl(var(--gold) / 0.35), 0 6px 24px hsl(270 60% 45% / 0.35), 0 0 36px hsl(var(--gold) / 0.45)",
}}
whileHover={{ scale: 1.04, filter: "brightness(1.08)" }}
transition={{ type: "spring", stiffness: 380, damping: 24 }}
```

Existing pulse ring stays. `setAdvisorOpen(true)` still fires immediately on click — the spring-back plays alongside the advisor's slide-in for a continuous tap → open feel.

**3. `src/components/AdvisorChatPanel.tsx` — route astrocartography to astrology**

One-line addition inside the existing `readingCategory` `useMemo`: treat `type === "astrocartography"` as the `"astrology"` domain so chat opens with astro-aware suggestion chips and Norielle's astrology persona — never a generic empty state.

### Untouched
`AvatarHoverTeaser` internals, the form-phase centered avatar, the analyzing phase, `AstrocartographySection`, `src/lib/astrocartography.ts`, filter buttons, map sizing in `index.css`, and every other modal/call site (the tap micro-interaction is a global polish — Tarot, Compatibility, Forecast all benefit identically).

### Result
- Tap Norielle → instant scale-down + gold glow burst (clearly felt as a reaction to the user's action), spring-back as the advisor opens with the astrocartography reading in scope and astrology chips ready.
- Teaser appears only on hover/tap — never auto-triggered on result load.
- Avatar lives in the bottom-right of the result screen, free from the close button and `TextSizeControl`.


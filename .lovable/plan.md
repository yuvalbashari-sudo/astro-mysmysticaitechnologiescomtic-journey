

## Apply final mobile avatarStyle for Astrocartography

Single edit in `src/components/AstrocartographyModal.tsx` — replace the current mobile `avatarStyle` with the approved snippet:

```ts
const avatarStyle = isMobile
  ? {
      position: "fixed" as const,
      bottom: 28,
      right: 18,
      top: "auto" as const,
      left: "auto" as const,
      width: 88,
      height: 88,
      zIndex: 110,
      pointerEvents: "auto" as const,
    }
  : undefined;
```

This finalizes Norielle on the mobile Astrocartography result:
- **In-frame, prominent**: 88×88, calm bottom-right with safe margins (28/18).
- **Reliably tappable**: `position: fixed` + `zIndex: 110` lifts the avatar above the result scroller (`z-[102]`), and `pointerEvents: "auto"` guarantees the tap reaches `setAdvisorOpen(true)`.
- **No other changes**: reading-context wiring, astrology routing in `AdvisorChatPanel`, tactile tap micro-interaction in `CinematicModalShell`, the map, filters, desktop, and every other modal stay exactly as-is.


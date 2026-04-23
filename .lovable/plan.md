

## Lower Norielle + place teaser below the avatar (mobile Astrocartography)

Two surgical edits. No redesign, no desktop changes, no logic changes, no size changes.

### 1. `src/components/AstrocartographyModal.tsx` — lower the avatar

Replace the mobile `avatarStyle` with the approved snippet (adds `position: "absolute"`, lowers to `bottom: 20`):

```ts
const avatarStyle = isMobile
  ? {
      position: "absolute" as const,
      bottom: 20,
      right: 16,
      top: "auto" as const,
      left: "auto" as const,
      width: 88,
      height: 88,
      zIndex: 110,
      pointerEvents: "auto" as const,
    }
  : undefined;
```

This anchors Norielle to the bottom-right of the shell viewport, fully inside the frame, same 88×88 size, same tap behavior.

### 2. `src/components/AvatarHoverTeaser.tsx` — render teaser BELOW the avatar

Currently the teaser card is positioned **above** the avatar via `bottom: calc(100% + GAP)` and right-anchored, which causes it to escape sideways near the right edge.

Change to:
- **Vertical**: `top: calc(100% + 12px)` (hangs below the avatar) instead of `bottom: calc(100% + ...)`.
- **Horizontal**: center the card under the avatar with `left: 50%; transform: translateX(-50%)` and reuse the existing `horizontalShift` math (applied as an additional translateX) to clamp inside the viewport when the avatar is near a side edge.
- **Clipping guard**: flip to "above the avatar" only as a fallback when the card would clip the bottom of the viewport (e.g. very short viewports). Default = below.
- **Arrow/notch**: flip the existing pointer arrow so it points up (toward the avatar) when the card is below.

This is a global teaser change — desired per the user's request — and safe because every shell modal already places the avatar in the bottom-right with the result content above it, leaving room for a short (~160px) card to hang below. The fallback guard preserves correctness on edge cases.

### Untouched
Astrocartography logic, the map, filters, result text, desktop avatar, the close button, `TextSizeControl`, reading-context wiring, advisor astrology routing, tactile tap micro-interaction in `CinematicModalShell`, avatar size, all other modals' avatar positions.

### Result
- Norielle sits a few pixels lower, fully inside the mobile Astrocartography result frame, bottom-right, same size, fully tappable.
- The teaser card appears **directly below** Norielle, centered under her icon, clamped inside the viewport — never escapes sideways.


## Targeted fix

Switch the mobile/tablet Tarot avatar from viewport-fixed to shell-absolute centering, so it renders consistently centered in both English (LTR) and Hebrew (RTL).

### Change

In `src/components/TarotModal.tsx`, line 459, update only the `avatarStyle` prop on `CinematicModalShell`:

```tsx
avatarStyle={(isMobileTarot || isTablet) ? {
  position: "absolute" as const,
  top: 16,
  left: "50%",
  transform: "translateX(-50%)",
  bottom: "auto" as const,
  right: "auto" as const,
  insetInlineStart: "unset" as const,
  insetInlineEnd: "unset" as const,
  width: 56,
  height: 56,
  zIndex: 106,
  pointerEvents: "auto" as const,
} : undefined}
```

The only change vs. current code is `position: "fixed"` → `position: "absolute"`.

### Why this fixes English drift

The shell's outer wrapper is `fixed inset-0` and is mounted via portal directly under `<body>`. Using `position: absolute` anchors the avatar to that shell rather than to the viewport, sidestepping any transformed ancestor or scrollbar-width quirks that can shift a `fixed` element off-center on LTR layouts. RTL behavior is preserved because `left: 50%` + `translateX(-50%)` is a physical centering that ignores writing direction; Hebrew remains visually centered as before.

### Out of scope (no changes)

- Desktop branch (still `undefined`).
- Avatar image, size, glow, border, click behavior, advisor chat panel.
- Tarot cards, text, translations, share buttons, reading logic, result layout, CTA.
- `CinematicModalShell.tsx`, `AvatarHoverTeaser.tsx`, tablet detection logic.
- No auto-publish.

### Verification

- English mobile (<768px) and tablet (768–1023px): avatar visually centered between close button (left) and Free badge (right), above the result title.
- Hebrew mobile/tablet: avatar still centered, no RTL drift.
- Avatar remains tappable and opens the existing advisor chat.
- Desktop (≥1024px): avatar position unchanged.
- Cards, share buttons, AI interpretation, and CTA remain fully visible.

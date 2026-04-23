
## Add protective circular backdrop behind Norielle avatar

Single-file edit: `src/components/AvatarHoverTeaser.tsx`.

### Changes

**1. Wrapper style update**
Update the outer wrapper `style` from:
```tsx
style={{ ...style, overflow: "visible" }}
```
to:
```tsx
style={{ ...style, overflow: "visible", isolation: "isolate", zIndex: 50 }}
```

**2. Insert circular backdrop before `<AnimatePresence>`**
```tsx
<div
  aria-hidden="true"
  style={{
    position: "absolute",
    inset: -10,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, hsl(222 50% 4% / 0.98) 0%, hsl(222 50% 4% / 0.88) 55%, hsl(222 50% 4% / 0) 100%)",
    backdropFilter: "blur(8px) saturate(120%)",
    WebkitBackdropFilter: "blur(8px) saturate(120%)",
    pointerEvents: "none",
    zIndex: 0,
  }}
/>
```

**3. Wrap `{children}` for layering above the backdrop**
```tsx
<div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
  {children}
</div>
```

### Untouched
- Teaser card visuals, animation (motion offsets, box-shadow pulse), timing (280ms hover delay, 2.6s mobile auto-hide), content, gradient typography.
- Avatar size, glow ring, hover/tap behavior.
- All call sites (`HeroSection`, `TarotModal`, `CinematicModalShell`, `MonthlyForecastModal`, `ReadingsHistoryModal`, `BirthChartModal`, `AstrocartographyModal`, `CompatibilityModal`, `ImmersiveTarotExperience`).
- `TarotModal` layout, title typography, badges, close button.

### Result
A clean, dark, blurred circular backing sits behind the avatar in every screen — masking any underlying title text or background content that would otherwise bleed through the PNG's transparent edges (including the gold "THE CARDS CHOSEN FOR YOU" title in the Tarot result screen).


## Fix Norielle teaser — anchor below avatar, viewport-clamped

Single-file edit: **`src/components/AvatarHoverTeaser.tsx`**.

### Changes

1. **Flip anchor from above → below**
   - Replace `bottom: calc(100% + ...)` with `top: calc(100% + GAP_BELOW)` where `GAP_BELOW = 14`.
   - Remove `LEFT_OFFSET` side-bias and the `right:` based positioning.

2. **Center horizontally under avatar**
   - Default style: `left: 50%`, `transform: translateX(calc(-50% + ${horizontalShift}px))`.
   - Direction-agnostic — works for RTL and LTR identically. Drop `getAnchorSide` logic (or keep `anchor` prop as a no-op for API stability).

3. **Horizontal viewport clamp**
   - In the `compute()` effect, calculate the centered card's natural left/right edges from the avatar's `getBoundingClientRect()` center and the resolved `cardWidth`.
   - If the natural left < 12px safe margin → `horizontalShift = SAFE_MARGIN - naturalLeft`.
   - If the natural right > `vw - 12px` → `horizontalShift = (vw - SAFE_MARGIN) - naturalRight`.
   - Otherwise `horizontalShift = 0`.

4. **Vertical clamp (below-only)**
   - Compute `cardBottom = rect.bottom + GAP_BELOW + ESTIMATED_HEIGHT` (height ~160).
   - If `cardBottom > vh - SAFE_MARGIN`, reduce the effective gap toward a minimum of 6px (`effectiveGap = Math.max(6, GAP_BELOW - overflow)`).
   - Never flip back above the avatar.

5. **Responsive width** — preserve existing `Math.max(240, Math.min(320, vw - 24))`.

6. **Animation**
   - Change initial/exit `y` from `8`/`6` (drop-down feel above) to `-6`/`-4` so the card eases **downward** from the avatar to its resting position below.

7. **Direction-safe text** — keep `direction` and `textAlign` driven by `isRTL` inside the card. No changes to copy, gradient, glow, hover/tap timing, or `disabled` behavior.

### Untouched
- All call sites and the teaser API (`text`, `highlightText`, `anchor`, `disabled`, `className`, `style`).
- Avatar button, modal shells, hero, tarot/forecast/history modals.
- Card visual design, ornamental hairline, box-shadow pulse, 280ms hover delay, 2.6s mobile auto-hide.

### Result
Teaser always opens directly beneath Norielle's avatar, centered to it, and stays fully inside the viewport — including top-corner placements in modal scenes.

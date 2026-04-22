

## Fix mobile filter pills getting cut off (RTL)

### Problem
On mobile RTL (Hebrew), the filter pills row (אהבה / קריירה / מגורים / התפתחות) is horizontally scrollable, but:
1. The first pill ("התפתחות" in RTL = rightmost) appears clipped at the right edge with no visual affordance.
2. Horizontal padding `px-5` is applied to the scroll track, but RTL scroll-start positioning leaves the leading pill partially hidden behind the container edge.
3. No fade/scroll hint indicates more content exists.

### Fix — `src/components/AstrocartographySection.tsx` (filters block, lines 179–212 only)

1. **Wrap the scroll row in a relative container** with edge fade masks (gradient overlays on left + right) so clipped pills feel intentional and indicate scrollability.
2. **Increase horizontal padding** of the inner scroll track from `px-5` to `px-6` on mobile, and add `scroll-px-6` so snap/scroll respects the padding.
3. **Add `scroll-smooth snap-x snap-mandatory`** with `snap-start` on each pill for a polished scroll feel.
4. **Ensure RTL scroll-start**: add `dir="rtl"` awareness — since the parent already inherits RTL, set `justify-start` explicitly and add a small `gap` increase (`gap-2.5`) so pills don't visually merge near the fade.
5. **Reduce pill horizontal padding slightly** (`px-3` instead of `px-3.5`) and keep icon `w-3.5 h-3.5` so all 4 pills fit better in a 390px viewport without aggressive clipping (they'll still scroll if needed for longer translations).

### Untouched
- Map container, raster image, SVG overlay, planetary lines, city markers, insight card, recommendations, accordion, desktop layout, all interactions and logic.

### Result
Filter pills no longer feel "cut off." Edges have soft gold-to-transparent fades that signal horizontal scrollability, all 4 pills are visible or gracefully indicated as scrollable, and the row feels intentional and premium on mobile RTL.


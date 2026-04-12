

# Limit Constellation Effect to 5 Seconds, Then Fade Out Stars

## What changes
Only `src/components/AstralLightReveal.tsx` is modified.

### 1. Add a new state: `showConstellations`
- Starts as `true`
- After 5 seconds (scaled by `fastMode`), set to `false`

### 2. Fade out stars and beams at the 5-second mark
- Wrap the rotating `<motion.g>` group containing constellations and beams in an `<AnimatePresence>` block
- When `showConstellations` becomes `false`, the group fades out over ~1 second with `exit={{ opacity: 0 }}` transition
- The figure, its aura/glow, chakras, and all body effects remain visible and unchanged

### 3. Keep the figure's established colors
- The absorption and climax effects (body glow, aura envelope, energy rays) continue to display at their final intensity
- Only the orbiting planet nodes, mini constellation stars, curved energy beams, and traveling particles disappear

### 4. Adjust timing
- Add a timer at `5000 * S` (where S is the speed multiplier) that sets `showConstellations = false`
- The `onComplete` timer and overall duration remain unchanged (the figure holds its glow until the map transition)

## Scope
- Only `src/components/AstralLightReveal.tsx`
- No changes to BirthChartModal, timing of onComplete, or any other component


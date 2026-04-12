

# Why the Astral Animation Disappeared

## Root Cause
The "returning user" feature added in the last update stores the full chart result in `localStorage` (`astrologai_birthchart_cache`). When the modal opens, it detects cached data and **skips directly to the result phase** (line 152: `setPhase("result")`), bypassing the `"loading"` phase where AstralLightReveal plays.

Reverting code versions doesn't fix this because the cached data lives in **your browser**, not in the code.

## Fix (in `src/components/BirthChartModal.tsx`)

### Option chosen: Show the astral animation even for cached results, but shorter

1. **When cache is found, go through `"loading"` phase instead of jumping to `"result"`**
   - Change the auto-restore logic (lines 144-157) to set `phase = "loading"` instead of `phase = "result"`
   - Pre-fill `chartData` and `resultText` from cache so no recalculation is needed
   - The AstralLightReveal plays its sequence, then transitions to the result as normal

2. **Add a `fastMode` flag for cached restores**
   - Pass a prop or use a ref to tell AstralLightReveal to use a shorter duration (e.g. 5s instead of 10s) for returning users
   - This keeps the premium feel without making users wait the full animation every time

3. **Keep the welcome-back message**
   - Show "Welcome back" during the shortened loading phase instead of on the result screen

## Scope
- Only `src/components/BirthChartModal.tsx` modified
- No changes to AstralLightReveal, layout, or other components


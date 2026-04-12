

## Plan: Admin-Only Aura Debug Panel with Live Forced Presets

### Problem
No way to inspect why the same aura result keeps appearing. Need full pipeline visibility and the ability to force different dominant planets that actually re-render the entire result screen.

### Critical Design Rule
Forced presets must replace the **actual influence map** used by the component — not just display debug values. This means the preset overrides `computeInfluences` output so all downstream `useMemo` chains (auraResult, auraColors, sortedPlanets, localized title, glow, pills) re-render naturally.

### Files

**Create: `src/components/AuraDebugPanel.tsx`**
- Collapsible panel, fixed bottom-right, dark bg, monospace, ~320px wide
- Only renders when `isAdminTestMode()` is true
- Sections:
  1. **Pipeline Inspector** — activeDataSource, usedAdminOverride, presetName, currentLocale, direction, dominantPlanet, secondaryPlanets, primaryAuraKey, secondaryAuraKeys, modifierKey, titleKey, localizedVisibleTitle, localizedSubtitle, bindingSource, blendMode, glowIntensity, whetherFallbackWasUsed, fallbackReason, resultTimestamp
  2. **Raw Influence Map** — the original `computeInfluences` output (unsorted), then sorted table of all 10 planets with winner highlighted and gap between #1 and #2
  3. **Selection Reasoning** — deterministic text: why dominant selected, why secondaries, why modifier, fallback/override status
  4. **10 Forced Preset Buttons** — Sun/Moon/Mercury/Venus/Mars/Jupiter/Saturn/Uranus/Neptune/Pluto Dominant
  5. **Reset Controls** — "Clear Forced Preset" (removes sessionStorage key) and "Restore Real Result" (removes preset + clears localStorage chart cache)

**Modify: `src/components/AstralLightReveal.tsx`**
- Export `computeInfluences` (currently file-scoped)
- Add state: `const [forcedPreset, setForcedPreset] = useState<string | null>(sessionStorage.getItem("astrologai_admin_forced_preset"))`
- Replace the influences computation:
  ```typescript
  const realInfluences = useMemo(() => computeInfluences(chartData), [chartData]);
  const isForced = isAdminTestMode() && forcedPreset !== null;
  const influences = useMemo(() => {
    if (isForced) return JSON.parse(forcedPreset!);
    return realInfluences;
  }, [realInfluences, forcedPreset, isForced]);
  ```
- This means `auraResult`, `auraColors`, `sortedPlanets`, localized title — everything downstream — automatically re-renders from the forced map
- Render `AuraDebugPanel` at the bottom when admin mode is active, passing: `realInfluences`, `influences`, `auraResult`, `language`, and a callback `onPresetChange` that updates `forcedPreset` state + sessionStorage
- Pass `onPresetClear` callback that clears sessionStorage and resets state

**Modify: `src/lib/auraResultBank.ts`**
- Add and export `getSelectionReasoning(influences, auraResult)`:
  ```typescript
  export function getSelectionReasoning(
    influences: Record<string, number>,
    result: AuraResult
  ): string[] {
    const sorted = Object.entries(influences).sort((a, b) => b[1] - a[1]);
    const gap = sorted[0][1] - (sorted[1]?.[1] ?? 0);
    return [
      `dominantPlanet: ${sorted[0][0]} (score: ${sorted[0][1]}, gap: +${gap} over ${sorted[1]?.[0] ?? 'none'})`,
      `secondaryPlanets: ${result.secondaryPlanets.join(', ')}`,
      `modifier: ${result.modifier} (rule-based from ${result.dominantPlanet} + ${result.secondaryPlanets[0] ?? 'none'})`,
      `fallback: ${sorted[0][1] === 0 ? 'YES — zero scores' : 'not used'}`,
    ];
  }
  ```

### Forced Preset Maps

Each preset sets one planet to ~40 and distributes others:
```text
Sun:     { sun:40, moon:12, mercury:10, venus:9, mars:8, jupiter:7, saturn:6, uranus:4, neptune:3, pluto:1 }
Moon:    { moon:40, sun:12, venus:10, neptune:9, mercury:8, mars:7, jupiter:6, saturn:4, uranus:3, pluto:1 }
Mercury: { mercury:40, uranus:12, sun:10, ... }
...rotated for each planet
```

### Why This Actually Re-Renders Everything

The forced preset replaces the `influences` variable that feeds into:
- `auraResult = useMemo(() => getAuraResult(influences), [influences])` — new dominant planet, new modifier, new aura family
- `auraColors = useMemo(...)` — new glow colors
- `sortedPlanets = useMemo(...)` — new constellation order
- All localized title/subtitle calls use `auraResult.primaryAura` and `auraResult.modifier`
- Visual profile (coreColor, auraColor, intensity) changes

No secondary binding needed — the entire render tree recomputes from the single `influences` override.

### Session Safety
- Presets stored in `sessionStorage` only — cleared on tab close
- "Restore Real Result" also clears `localStorage` key `astrologai_birthchart_cache` to force fresh calculation
- Never touches real user production data

### What Does NOT Change
- Normal user flow, result UI design, product copy, onboarding — all untouched
- Non-admin users see nothing different




# Replace Unicode Zodiac Symbols with PNG Icons in Natal Chart Wheel

## Problem
The natal chart wheel (`NatalChartWheel.tsx`) uses Unicode text characters (♈, ♉, ♊...) for zodiac signs, while the hero zodiac wheel uses high-quality PNG illustrations from `src/assets/zodiac-icons/`. The user wants visual consistency.

## Changes (single file: `src/components/NatalChartWheel.tsx`)

### 1. Import the zodiac PNG icons
Add the same 12 PNG imports used in `HeroSection.tsx`:
```typescript
import ariesIcon from "@/assets/zodiac-icons/aries.png";
// ... all 12 signs
```

Create a `ZODIAC_ICONS` array matching the order of `ZODIAC_SIGNS`.

### 2. Replace `<text>` elements with `<image>` elements in the zodiac symbols section (lines 239-257)
Currently renders:
```tsx
<text fontSize={size * 0.04}>{sign.symbol}</text>
```

Replace with SVG `<image>` elements:
```tsx
<image
  href={ZODIAC_ICONS[i]}
  x={x - iconSize/2}
  y={y - iconSize/2}
  width={iconSize}
  height={iconSize}
  filter="url(#softGlow)"
/>
```

Where `iconSize = size * 0.065` (slightly larger than the text was, to make the icons clearly visible).

### 3. Keep everything else unchanged
- Planet markers, house lines, aspect lines, center glow — all untouched
- Sign band arcs remain the same
- Ascendant marker unchanged

## Scope
- Only `src/components/NatalChartWheel.tsx` modified
- Uses existing PNG assets already in the project


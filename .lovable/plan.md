

## Plan: Extend Star/Light Ray Effect Duration from 5s to 10s

### Problem
The constellation and light beam effects disappear after 5 seconds, which is too fast — users don't have time to understand what's happening.

### Change

**`src/components/AstralLightReveal.tsx` — Line 314**

Change:
```typescript
const constFadeTimer = setTimeout(() => setShowConstellations(false), 5000 * S);
```
To:
```typescript
const constFadeTimer = setTimeout(() => setShowConstellations(false), 10000 * S);
```

Single line change. No other files affected.


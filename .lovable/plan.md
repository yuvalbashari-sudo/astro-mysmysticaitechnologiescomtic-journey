

## Fix: Live Aura Result Sync

### Root Cause
Line 298-301 in `AstralLightReveal.tsx`: the completion timer runs inside a `useEffect` with `[]` deps, capturing the initial `auraResult` in a stale closure. When admin presets change `influences` → `auraResult` updates locally, but `onAuraResult` in the parent is never re-called. The `AuraResultCard` at line 625 renders from the parent's stale `auraResult` state.

### Changes

**`src/components/AstralLightReveal.tsx`**
1. Add a ref to track the latest `auraResult`:
   ```typescript
   const auraResultRef = useRef(auraResult);
   useEffect(() => { auraResultRef.current = auraResult; }, [auraResult]);
   ```
2. Fix the timer to use the ref instead of the stale closure:
   ```typescript
   onAuraResult?.(auraResultRef.current);
   ```
3. Add a live sync effect for admin mode — whenever `auraResult` changes and reveal is already complete, push it to the parent immediately:
   ```typescript
   useEffect(() => {
     if (showInfluences) {
       onAuraResult?.(auraResult);
     }
   }, [auraResult, showInfluences]);
   ```
4. On preset clear/restore, reset reveal-related animation state (`showInfluences` stays true so the sync effect keeps working).

**`src/components/BirthChartModal.tsx`**
- On `handleClose`, reset `auraResult` to `null` so stale identities don't persist across sessions.

**`src/components/AuraDebugPanel.tsx`**
- Change `usedAdminOverride` to reflect whether a forced preset is active (use `isForced` prop) instead of subscription admin status.

### What Does NOT Change
- Normal user flow, UI design, product copy, onboarding — all untouched.
- Non-admin users see no difference.


## Goal

Consolidate the Local Version (HE/AR) AI text pipeline behind **one** module so that language enforcement, gender lock, English-leak repair, bidi cleanup, grammar repair, fallback handling, and **version tagging** are guaranteed on every AI response — without redesigning UI or touching the US Version (EN/RU) behavior.

## Current state (where the fragmentation lives)

13 components hit AI through two paths:

- `streamMysticalReading` (`src/lib/aiStreaming.ts`) — used by `DailyCardModal`, `MonthlyForecastModal`, `BirthChartModal`, `CompatibilityModal`, `RisingSignModal`.
- Direct `fetch()` calls — used by `DailyHoroscopeCard` (one-shot JSON), `AdvisorChatPanel` / `DailyCardAdvisorPanel` / `AstrologerIntroModal` (advisor SSE), `TarotModal` / `ImmersiveTarotExperience` / `TarotWorldModal` (tarot SSE).

Locale/gender helpers live in three files (`localeGuard.ts`, `genderGrammarRepair.ts`, `genderGate.ts`) and are wired only into the `streamMysticalReading` path + the daily-horoscope `enforceLocale` render call. The 6 direct-`fetch` callers run no finalize step → that is the source of most residual leaks.

## Target architecture

### `src/lib/localAiPipeline.ts` (new — only entry point components use)

1. `buildLocalAiContext(language)` → returns a **frozen** `LOCAL_AI_CONTEXT`:
   ```
   { language, gender, zodiacSign, userName, tone, astroPrefs, localeRules,
     pipelineVersion, promptVersion, validatorVersion }
   ```
   Built from `mysticalProfile` + `genderGate.ensureGender()`. `gender` filtered to `male|female|undefined`. Returned object is `Object.freeze`d so it cannot mutate mid-request.
2. `callLocalAi({ endpoint, payload, mode, onDelta?, onDone?, onError?, onReplace?, signal? })` — the only way the app talks to `daily-horoscope`, `mystical-reading`, `tarot-reading`, `mystical-advisor`. Captures a snapshot of `LOCAL_AI_CONTEXT` at call time so language/gender are immutable for the request lifetime.
3. `finalizeLocalAi(text, ctx)` — the single validator/repair step (HE/AR only; pass-through for EN/RU). **Idempotent and atomic** — guarded by an internal `_finalized` flag so it cannot run twice on the same payload.
4. `getLocalFallback(kind, language)` — re-exports the existing localized fallback so components stop importing from `localeGuard` directly.

### `src/lib/localAiVersion.ts` (new — version constants)

Single source of truth for version tags, bumped manually on relevant changes:

```ts
export const PIPELINE_VERSION = "local-ai-v1";   // bump on pipeline shape
export const PROMPT_VERSION   = "he-ar-lock-v1"; // bump on edge prompt builders
export const VALIDATOR_VERSION = "grammar-guard-v1"; // bump on validator logic
```

Used by:
- `buildLocalAiContext` → embedded in the frozen context.
- `callLocalAi` → injected into every outgoing request body as `__meta: { pipelineVersion, promptVersion, validatorVersion, requestId }`.
- Edge functions → echoed back in the response for telemetry, and recorded in `cost_logs` / `daily_horoscopes` rows when present.
- Telemetry counter → bucketed by version triple so dashboards can compare deployments.
- Dev `[ai-pipeline]` console logs → prefix every line.

Bumping is documented inline:
- Pipeline shape change → bump `PIPELINE_VERSION`.
- Edge prompt builder edit → bump `PROMPT_VERSION`.
- Validator algorithm change → bump `VALIDATOR_VERSION`.

### `src/lib/localAiValidators.ts` (new — pure, framework-agnostic, unit-testable)

Extracted from the current scattered code:

- `isValidLocale(text, locale)`
- `hasMixedGenderSlashes(text, locale)`
- `hasRtlIntegrity(text, locale)`
- `stripBidiControls(text)`
- `repairSlashForms(text, locale, gender)`
- `latinLeakRatio(text)`

No React, no DOM, no `import.meta` — directly importable from Vitest.

### Streaming stabilization (HE/AR only)

`callLocalAi({ mode: 'stream' })` adds a chunk stabilizer between SSE parser and `onDelta`:

- Token deltas append to `pendingBuffer`; flushed only on stable boundaries (whitespace, `.`, `,`, `\n`, `?`, `!`, `׃`, `؟`, `،`, `…`, em-dash) or after 32 chars.
- Half-tokens ending with `/` followed by an incomplete grammar suffix (`את/`, `חש/`, `أنت/`) are held until the next boundary so users never see the broken interim form.
- Final flush on stream end, immediately before `finalizeLocalAi`.
- EN/RU bypass the stabilizer entirely.

### Atomic finalize

- Each request tagged with a unique `requestId` (also added to `__meta`).
- `finalizeLocalAi` writes `result._finalized = true` and bails early if seen twice.
- Strict regenerate uses a new request object → new finalize pass.

### Prompt isolation

Each edge function (`mystical-reading`, `tarot-reading`, `mystical-advisor`, `daily-horoscope`) gets a single in-file helper:

```
buildSystemPrompt({ lang, gender, userName, zodiac, ... })
  → if (lang === 'he' || lang === 'ar') return buildLocalSystemPrompt(...)
  → else                                  return buildUsSystemPrompt(...)
```

`buildLocalSystemPrompt` and `buildUsSystemPrompt` live side-by-side but share **no** string fragments — HE/AR fallbacks are written in HE/AR, EN/RU fallbacks in EN/RU. Prompt version returned alongside the response payload for traceability.

### Strict locale mode + retry safety

`callLocalAi` runs at most **3 attempts** for HE/AR:

1. Normal stream/json + finalize.
2. If finalize fails: `__strict: true` → server adds strongest LOCK + Latin-ban prefix.
3. If still failing: lower temperature + explicit example block.
4. If attempt 3 fails: stop. Render localized HE/AR fallback (`getLocalFallback("error", language)`). Dev-only log of the failed text under `[ai-pipeline:fallback]` with the version tags so we know which `pipelineVersion`/`promptVersion`/`validatorVersion` produced it.

EN/RU keeps today's single-retry behavior.

### Validation telemetry (dev-only)

In-memory counter, bucketed by `{ endpoint, pipelineVersion, promptVersion, validatorVersion }`:

```
{ calls, leakRepairs, grammarRepairs, strictRetries, fallbacks }
```

- Updated by `finalizeLocalAi` and the retry path.
- Exposed under `window.__lovableAiTelemetry` only when `import.meta.env.DEV`.
- `[ai-pipeline:telemetry]` console table emitted every 10 finalize calls.
- Production builds never instantiate the counter.

### Framework-agnostic reusability

Pipeline + validators are plain TS — no React imports, no DOM access outside the SSE `fetch`. Future AI features (notifications, embeds, server-rendered emails) can import `finalizeLocalAi`, validators, and the version constants directly.

## Migration steps (surgical)

1. Create `src/lib/localAiVersion.ts` (version constants).
2. Create `src/lib/localAiValidators.ts` (pure functions extracted from `localeGuard.ts` + `genderGrammarRepair.ts`).
3. Create `src/lib/localAiValidators.test.ts` (Vitest, ≥12 cases: Latin leakage, slash forms, bidi marks, gender male/female/unknown, EN/RU pass-through).
4. Create `src/lib/localAiPipeline.ts` (`buildLocalAiContext`, `callLocalAi`, `finalizeLocalAi`, telemetry, chunk stabilizer, `__meta` injection).
5. Refactor `aiStreaming.ts` — `streamMysticalReading` becomes a thin wrapper delegating to `callLocalAi({ endpoint: 'mystical-reading', mode: 'stream' })`. Public signature unchanged.
6. Refactor `DailyHoroscopeCard.tsx` `generateHoroscope` → `callLocalAi({ endpoint: 'daily-horoscope', mode: 'json' })`.
7. Refactor advisor SSE callers (`AdvisorChatPanel`, `DailyCardAdvisorPanel`, `AstrologerIntroModal`).
8. Refactor tarot SSE callers (`TarotModal`, `ImmersiveTarotExperience`, `TarotWorldModal`).
9. Edge functions — collapse scattered HE/AR + EN/RU strings into per-file `buildLocalSystemPrompt` / `buildUsSystemPrompt`. Echo `__meta` back in responses. Same wording, no behavior change.
10. Mark old helpers internal — `localeGuard.autoCorrectLocale` / `enforceLocale` keep working but get JSDoc note pointing callers to `localAiPipeline`.

## Files touched

- **New**: `src/lib/localAiPipeline.ts`, `src/lib/localAiValidators.ts`, `src/lib/localAiValidators.test.ts`, `src/lib/localAiVersion.ts`.
- **Edited (logic moved out, no UI change)**: `src/lib/aiStreaming.ts`; `src/components/DailyHoroscopeCard.tsx`, `AdvisorChatPanel.tsx`, `DailyCardAdvisorPanel.tsx`, `AstrologerIntroModal.tsx`, `TarotModal.tsx`, `ImmersiveTarotExperience.tsx`, `TarotWorldModal.tsx`.
- **Edge functions (prompt-builder consolidation + `__meta` echo)**: `mystical-reading/index.ts`, `tarot-reading/index.ts`, `mystical-advisor/index.ts`, `daily-horoscope/index.ts`.
- **Untouched**: every component's JSX/markup; all US-only behavior; `mysticalProfile.ts`, `genderGate.ts`, `genderGrammarRepair.ts`, `localeGuard.ts` (kept as primitives).

## Risks & mitigations

- **Large surface area** — 7 components + 4 edge functions. Mitigation: ship in 3 commits (version+validators+tests → pipeline + `streamMysticalReading` wrapper → component migrations + edge consolidation). Telemetry visible between each.
- **Streaming stabilizer adds latency** — capped to ≤32 chars or one punctuation. Quantified via dev telemetry.
- **EN/RU regression** — `finalizeLocalAi` and stabilizer no-op for non-HE/AR; signatures unchanged.
- **Edge prompt rewrites** — limited to consolidating existing blocks per file. No wording or model changes.
- **Version tag drift** — single source of truth in `localAiVersion.ts`; constants imported, never hardcoded in components.

## Final report (delivered after implementation)

- Duplicated systems removed.
- New modules created.
- Every flow now using the shared pipeline.
- Where each pre-refactor inconsistency originated.
- Telemetry counters observed in dev runs, bucketed by version triple.

---

**Approve this plan and I'll implement it. If you'd prefer a smaller first pass (e.g. version constants + validators + pipeline + `streamMysticalReading` wrapper only, leaving the 6 component migrations and edge consolidation as follow-ups), say so and I'll trim the scope.**
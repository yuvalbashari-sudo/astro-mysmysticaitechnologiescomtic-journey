---
name: Strict Language Enforcement
description: Hard locale lock at AI boundary + runtime enforceLocale blocker for wrong-language text in EN/HE/RU/AR.
type: feature
---
Strict per-locale enforcement (no fallback-based mixing):

1. **AI edge functions** — `mystical-reading`, `mystical-advisor`, `tarot-reading`, `daily-horoscope` all prepend a uniform "ABSOLUTE LANGUAGE RULE" prefix for EVERY locale (including HE), naming the locale + langName and forbidding any other-language output.

2. **Client validator** — `src/lib/localeGuard.ts` exports:
   - `isValidLanguage(text, locale)` — script-based detector (any foreign-script char → invalid; Latin loanwords tolerated up to ~15% in non-EN).
   - `enforceLocale(text, locale, fallback?, ctx)` — BLOCKS wrong-language strings, returns localized fallback (`טוען תוכן…` / `Loading…` / `Загрузка…` / `جارٍ التحميل…`).
   - Apply to any server-provided one-shot string (e.g. daily horoscope `data.content`). Don't wrap streaming partial tokens.

3. **Errors** — never surface raw server `errData.error`; use `safeErrorText(err, locale)` or per-feature `errorMessages.*` from i18n.

4. **Direction lock** — `LanguageContext` sets `document.documentElement.dir` from `languageConfig[lang].dir`. HE/AR=rtl, EN/RU=ltr.

5. **Element icons / dictionary keys** — `MysticalDashboard.ELEMENT_ICONS` keyed by element NAME in all 4 locales.

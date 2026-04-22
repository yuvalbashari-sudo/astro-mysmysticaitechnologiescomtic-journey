

## Build AstrocartographyModal — premium standalone experience

### Files

**New:** `src/components/AstrocartographyModal.tsx`
**Edit:** `src/components/HeroSection.tsx` (add 6th menu item + state + render modal)
**Edit:** `src/i18n/types.ts` (add 10 keys)
**Edit:** `src/i18n/translations/{he,en,ru,ar}.ts` (add localized strings)

### Component architecture — `AstrocartographyModal.tsx`

Built on `CinematicModalShell` (provides Norielle's persistent corner avatar + chat — no avatar reinvention). State machine: `phase: 'form' | 'analyzing' | 'result'`. Local `textSize` state via existing `TextSizeControl`. Dedicated cache key `astrologai_astrocarto_cache` + admin bypass via `isAdminTestMode()`.

#### Form phase (clean, breathable hierarchy)

Stacked with intentional breathing room (`space-y-4 md:space-y-5`):

1. **Norielle whisper chip** — compact glass pill (`max-w-fit`, `px-3 py-2`, `rounded-full`, `border border-gold/20`, `bg-deep-blue-light/40`, `backdrop-blur-md`, soft gold glow shadow). 32px circular Norielle avatar (reusing `astrologerAvatar` + same gold border treatment from `AvatarHoverTeaser`) inline with italic gold/85 text: `אני כאן ללוות אתכם לגילוי המקומות בעולם שבהם האנרגיה שלכם נפתחת`. Visually matches existing Norielle teaser pattern. Soft whisper, not a banner.
2. **Title** (Cinzel gold, `text-3xl md:text-4xl`, `leading-tight`): `מפת האסטרו־קרטוגרפיה האישית שלכם`
3. **Subtitle** (font-body, `text-base md:text-lg`, `text-gold/70`, `leading-relaxed`): `גלו איפה בעולם האנרגיה שלכם נפתחת לאהבה, הצלחה והתפתחות`
4. **Intro line** (`text-sm md:text-base`, `text-foreground/75`): `כדי לחשוף את מפת האנרגיה האישית שלכם בעולם, הזינו את פרטי הלידה שלכם`
5. **`<BirthDetailsForm showTime showCity submitLabel={t.astrocarto_form_cta} onSubmit={handleSubmit}>`** — CTA `חשפו את המפה שלי`. Wrapped in a `relative` container with a blurred radial-gradient halo div behind the button (`absolute inset-0 -m-2 blur-xl bg-gradient-radial from-gold/25 via-gold/10 to-transparent opacity-70`) — premium subtle glow, no aggressive pulse.

Norielle's persistent avatar (from shell) sits bottom-right; avatarStyle nudged so it doesn't overlap the form CTA on mobile.

#### Analyzing phase (1600ms)

Centered (`flex flex-col items-center justify-center min-h-[60vh] gap-6`):
- Slowly rotating gold sigil — `Sparkles` icon (48px) inside a soft blurred gold halo, `animate-spin` 6s linear
- Shimmer text (`text-lg md:text-xl text-gold/85 font-heading`): `מנתחים את הקווים האנרגטיים שלכם בעולם...`
- `AnimatePresence` wraps phases for smooth fade transitions (`opacity` + slight `y`, 0.5s easeInOut)
- `setTimeout(() => setPhase('result'), 1600)` triggered on entering analyzing

#### Result phase (map-dominant, tight header)

Layout (`pt-2 md:pt-3 space-y-3`):
1. **`<TextSizeControl value={textSize} onChange={setTextSize} />`** — anchored top-right via `flex justify-end` row, exact same component, same styling as `BirthChartModal`. Untouched.
2. **Result title** (Cinzel gold, `TEXT_SIZE_CLASSES[textSize].heading`, `text-center`): `מפת האסטרו־קרטוגרפיה האישית שלכם`
3. **Description** (`TEXT_SIZE_CLASSES[textSize].body / subheading`, `text-foreground/80`, `text-center`, `max-w-prose mx-auto`): `קווים אלו מראים היכן בעולם האנרגיה שלכם מתחזקת בתחומים שונים`
4. **Hint chip** (centered, gold-on-glass pill with `MapPin` icon, `inline-flex gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm`): `לחצו על מיקום במפה כדי לגלות את ההשפעה עליו`
5. **`<AstrocartographySection />`** — untouched; dominant hero element, visible without scroll on standard mobile (390×844)
6. **Emotional footer** (italic centered, `TEXT_SIZE_CLASSES[textSize].body`, `text-gold/75`, `mt-4`): `אולי המקום הבא שלכם כבר מחכה לכם`
7. **`<ResultShareBar resultText={...} shareTitle={t.astrocarto_result_title} />`**

`TextSizeControl` actually drives title/description/footer typography via the existing `TEXT_SIZE_CLASSES` map.

### Hero entry point — `HeroSection.tsx`

Add 6th menu item: `key: 'astrocarto'`, `icon: MapPin`, `label: t.hero_menu_astrocarto`, teal/cyan accent gradient (differentiates from gold/pink/red existing items). Wire `astroOpen` state, render `<AstrocartographyModal isOpen={astroOpen} onClose={() => setAstroOpen(false)} />`. Mirror the existing menu item structure for both mobile grid and desktop side column.

### Localization — 10 keys

Add to `src/i18n/types.ts` and all 4 language files:

| Key | HE (exact) |
|---|---|
| `hero_menu_astrocarto` | מפת אסטרו־קרטוגרפיה |
| `astrocarto_norielle_intro` | אני כאן ללוות אתכם לגילוי המקומות בעולם שבהם האנרגיה שלכם נפתחת |
| `astrocarto_subtitle` | גלו איפה בעולם האנרגיה שלכם נפתחת לאהבה, הצלחה והתפתחות |
| `astrocarto_form_intro` | כדי לחשוף את מפת האנרגיה האישית שלכם בעולם, הזינו את פרטי הלידה שלכם |
| `astrocarto_form_cta` | חשפו את המפה שלי |
| `astrocarto_analyzing` | מנתחים את הקווים האנרגטיים שלכם בעולם... |
| `astrocarto_result_title` | מפת האסטרו־קרטוגרפיה האישית שלכם |
| `astrocarto_result_desc` | קווים אלו מראים היכן בעולם האנרגיה שלכם מתחזקת בתחומים שונים |
| `astrocarto_result_hint` | לחצו על מיקום במפה כדי לגלות את ההשפעה עליו |
| `astrocarto_result_footer` | אולי המקום הבא שלכם כבר מחכה לכם |

EN/RU/AR get natural, premium translations matching Norielle's calm, mystical, feminine tone — no technical or generic phrasing.

### Untouched

`AstrocartographySection.tsx`, `BirthDetailsForm`, `BirthChartModal`, `TextSizeControl`, `CinematicModalShell`, `AvatarHoverTeaser`, all caching/limits/admin bypass for other features, all other modals, hero menu items already present.

### Result

A sibling feature to `BirthChartModal`: same shell, same Norielle treatment, same accessibility controls, same CTA glow language, same emotional cadence. Form → 1.6s anticipation → map-dominant result. Native to the ecosystem from the first frame.


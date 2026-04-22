
## Refine Norielle avatar in Astrocartography form phase

Single-file change: `src/components/AstrocartographyModal.tsx`. No shell, no other phases touched.

### Changes

**1. Form wrapper top padding** (line 106)
- `pt-4 md:pt-6` → `pt-10 md:pt-12`
- Pushes avatar safely below close button into visible scroll area.
- Tighter vertical rhythm: `space-y-6 md:space-y-7` → `space-y-5 md:space-y-6` so avatar/title/subtitle group as one block.

**2. Avatar size — moderate guide presence** (lines 118–119)
- Mobile: `86px` → `108px`
- Desktop: `106px` → `128px`

**3. Refined premium styling** (lines 120–122)
- Border: `2px solid hsl(var(--gold) / 0.45)` → `2.5px solid hsl(var(--gold) / 0.55)`
- boxShadow upgraded to layered halo:
  ```
  0 0 0 5px hsl(var(--gold) / 0.10),
  0 0 0 1px hsl(var(--gold) / 0.25),
  0 6px 32px hsl(270 65% 45% / 0.42),
  0 0 44px hsl(var(--gold) / 0.28)
  ```
- Pulsing ring tweak (line 135): scale `[1, 1.5, 1.5]`, opacity `[0.6, 0, 0]` for a slightly stronger but still elegant bloom.

### Hierarchy preserved
- Title remains primary focal point (size, gold textShadow unchanged).
- Avatar reads as warm guide above heading, fully visible on open at 390×844, no clipping.
- Form CTA still appears within reasonable scroll on mobile.

### Untouched
- Analyzing phase, result phase, `CinematicModalShell`, all other modals, localization, layout below the title.

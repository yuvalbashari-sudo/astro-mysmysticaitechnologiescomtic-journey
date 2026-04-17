

## Goal
In the **Norielle chat panel** (the floating chat shown in screenshot), remove the yellow star icon from the header, enlarge the Norielle name, and add the existing `A / A+ / A++` text-size control directly below it — mirroring exactly what was already done in `AstrologerIntroModal`.

## Target file
`src/components/AdvisorChatPanel.tsx` — header block (lines ~390–444)

## Changes

**1. Remove star icon**
Delete the entire `motion.div` (lines 400–416) containing the gold-gradient circle and `<Sparkles>` icon.

**2. Restructure header to vertical, centered layout**
Replace the current `flex items-center justify-between` row (with avatar + name on left, X on right) with:
- A centered vertical stack: enlarged Norielle name on top, `TextSizeControl` directly below
- The X close button absolutely positioned to the top-end corner so it doesn't disrupt the centered composition
- Keep the active reading label (e.g. "Tarot reading") as a small subtitle under the name when present

**3. Enlarge the name**
Change `text-[17px]` → `text-2xl md:text-3xl` with the same gold gradient styling already in place.

**4. Wire up `TextSizeControl`**
- Import `TextSizeControl` from `@/components/TextSizeControl`
- Import `useFontScale` from `@/contexts/FontScaleContext`
- Read `{ scale, setScale }` and render `<TextSizeControl value={scale} onChange={setScale} />` directly under the name (same pattern as `AstrologerIntroModal.tsx` lines 218–223)

**5. Cleanup**
Remove the now-unused `Sparkles` import from the lucide-react import line if no other reference uses it (a quick scan of the file is needed — Sparkles may also be used in the empty state, in which case keep the import).

## Preserved (do NOT touch)
- Panel container, gradients, border, shadow, animation
- Backdrop, positioning logic (`forceRightAnchor`)
- Messages area, input field, send button, suggestion chips, limit-reached card
- Avatar image (`norielleAvatar`) used elsewhere in the panel body
- All chat / streaming logic

## Result
The Norielle floating chat header becomes:
```
              [Norielle – Your Personal Guide]   [X]
                       A   A+   A++
              ────────────────────────────────
                       (chat content)
```
Consistent with the already-redesigned `AstrologerIntroModal` header.


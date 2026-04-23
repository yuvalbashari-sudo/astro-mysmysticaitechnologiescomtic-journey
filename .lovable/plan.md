
## Fix Norielle avatar overflow in Astrocartography result view

Single-file edit: `src/components/AstrocartographyModal.tsx` (lines 81–84).

The mobile `avatarStyle` passed into `CinematicModalShell` for the Astrocartography modal currently anchors the Norielle avatar at `bottom: 14, right: 12` with size `78×78`. In the result view, the avatar visually overflows at the top edge near the close button and gold title, and the user wants it pushed **down 20px** (clear of the top edge, toward the gold title) and **enlarged to 98px**.

### Change
Update the mobile avatar style to anchor from the top, shifted down so it no longer clips the modal edge:

```ts
const avatarStyle = isMobile
  ? { top: 20, right: 12, bottom: "auto" as const, left: "auto" as const, width: 98, height: 98 }
  : undefined;
```

- `width / height`: `78` → `98`
- Anchor flipped: `bottom: 14` → `top: 20` (avatar sits 20px from the top of the modal frame, toward the gold title — no longer overflowing)
- `right: 12` preserved
- Desktop (`undefined`) untouched — uses CinematicModalShell defaults

### Untouched
- Form-phase centered avatar (lines 108–138).
- Analyzing and result phase content, title, CTA, map.
- `CinematicModalShell`, `AvatarHoverTeaser`, all other modals and call sites.
- Avatar glow, ring pulse, hover/tap behavior, teaser.

### Result
In the Astrocartography result view on mobile, the Norielle avatar appears 20px below the top edge (no longer overflowing) at a clearer 98×98 size, sitting cleanly to the right of the gold title.

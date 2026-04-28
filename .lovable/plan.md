Surgical fix to ensure the Norielle avatar no longer overlaps the close (X) button on the mobile/tablet Tarot selection screen, while keeping the result-screen behavior intact.

## Changes

### 1. `src/components/TarotModal.tsx`
- Keep `isTarotResultScreen` detection (cards present + not in any pre-result phase).
- `tarotAvatarStyle` for `(isMobileTarot || isTablet)`:
  - Selection screen: `top: 84` (below the close button row).
  - Result screen: `top: 16` (centered in header between X and Free badge).
  - Common: `position: "absolute"`, `left: "50%"`, `transform: "translateX(-50%)"`, `bottom/right/insetInlineStart/insetInlineEnd: "auto"/"unset"`, `width/height: 56`, `zIndex: 106`, `pointerEvents: "auto"`.
- Desktop: `tarotAvatarStyle = undefined` → shell default.

### 2. `src/components/CinematicModalShell.tsx`
- Verify the avatar wrapper (`AvatarHoverTeaser`) honors the incoming `avatarStyle` exactly. The existing code already spreads `avatarStyle` and passes through `position: "absolute"`. No structural change unless needed; if the wrapper still defaults to `relative`, ensure `AvatarHoverTeaser` drops the `relative` class when `style.position` is set (already handled per prior edit).

## Out of scope (unchanged)
- Avatar image, size, glow, border, click behavior, advisor chat panel.
- Tarot cards, buttons, text, translations, reading logic, result content, share buttons, CTA.
- Desktop avatar position.
- No publishing.

## Verification
- Mobile/tablet Tarot selection: avatar centered horizontally, sitting at `top: 84` — does NOT overlap the X button.
- Mobile/tablet Tarot result: avatar centered horizontally at `top: 16`.
- Avatar remains tappable and opens the advisor chat.
- Desktop Tarot: avatar position unchanged (shell default bottom-right).
Cinematic scene shell — NOT a modal. Key principles:
- Oracle is THE scene (brightness 0.5, saturate 1.15). She is never hidden behind a box.
- No container box. No border. No card wrapper. Children float directly in the scene.
- Content starts below oracle's face via spacer (38vh desktop, 28vh mobile).
- A "rising fog" gradient behind content provides text legibility — subtle transition from transparent to hsl(deep-blue / 0.75). No hard edge.
- Vignette is edges-only (90%×80% ellipse, transparent to 50%), oracle's center stays fully clear.
- Content max-width 560px desktop, full-width mobile.
- Close button and free badge: fixed, lightweight, backdrop-blur.
- All reading modals (tarot, compatibility, horoscope, palm, zodiac, etc.) use this shell.
- fullscreen prop bypasses the floating layout for experiences that need full control.

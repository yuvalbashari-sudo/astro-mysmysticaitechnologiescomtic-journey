The crystal ball on mobile uses a 3-layer composition to remove the model's baked-in ball:

1. **Background image** (heroFigure, z-default): Has a radial mask hole — `ellipse 200x190px at 50% calc(50%+187px)` — that erases the model's built-in static sphere from the artwork (transparent at 46%, black at 52%)
2. **CrystalBallEnergy** (z-[15]): Renders the rotating cosmic video as the ONLY visible crystal ball, scaled 1.55x with clip-path circle(34.5%), offset -20px upward
3. **Hands overlay** (heroFigure copy, **z-[22]** — ABOVE video): Uses a ring-shaped mask `ellipse 195x180px at 51% calc(50%+184px)` that shows only the fingers/hands surrounding the ball (transparent at 36-40%, black at 48-74%, then fades to transparent at 100%)

Key z-index stack on mobile: background < video (z-15) < hands (z-22)

No contact shadow div on mobile (removed). Glass highlight overlay is hidden on mobile. No TarotCardReveal overlay on mobile.

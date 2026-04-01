The crystal ball on mobile uses a 3-layer composition to remove the model's baked-in ball:

1. **Background image** (heroFigure, z-default): Has an aggressive radial mask hole — `ellipse 230x220px at 50% calc(50%+187px)` — that fully erases the model's built-in static sphere from the artwork
2. **CrystalBallEnergy** (z-[15]): Renders the rotating cosmic video as the ONLY visible crystal ball, scaled 1.55x with clip-path circle(34.5%), offset -20px upward
3. **Hands overlay** (heroFigure copy, **z-[22]** — ABOVE video): Uses a ring-shaped mask `ellipse 220x200px at 51% calc(50%+184px)` that shows only the fingers/hands surrounding the ball, with inner transparent zone at 40% to avoid showing ball remnants

Key z-index stack on mobile: background < video (z-15) < hands (z-22) < contact shadow (z-23)

Contact shadow: 220x180px at calc(50%+224px), very subtle radial gradient starting transparent at 55%.

Glass highlight overlay is hidden on mobile. No TarotCardReveal overlay on mobile.

The crystal ball on mobile uses a 3-layer approach:
1. **Background image** (heroFigure) has a radial mask punching out the ball area (ellipse 140x140px at 51% calc(50%+228px)) so the model's built-in static ball is hidden
2. **CrystalBallEnergy** (z-[15]) renders the rotating video as the ONLY visible crystal ball, scaled 1.55x with 55% mask radius
3. **Hands overlay** (z-[14]) shows only the fingertips via a ring-shaped mask from a second copy of heroFigure

Glass highlight overlay is hidden on mobile. No TarotCardReveal overlay on mobile.

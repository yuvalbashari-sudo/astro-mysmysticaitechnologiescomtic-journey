Unified cinematic modal system: all reading modals use CinematicModalShell for consistent oracle woman background, particles, and depth. Key design rules:
- Oracle brightness 0.45 with saturate(1.1) — always visible behind content
- Vignette is edges-only (radial 80%×70%, transparent center to 40%), oracle face stays clear
- Non-fullscreen content: narrower floating panel (max-w-[540px] desktop), highly translucent (55-65% opacity), heavy backdrop-blur(20px)
- Content scrolls naturally with a top spacer (18vh) on desktop so oracle face shows above
- No centered modal box look — content flows down the page like a scene layer
- Mobile: full-width with px-3, pt-16 for close button clearance
- Close button: fixed top-left, free badge: fixed top-right

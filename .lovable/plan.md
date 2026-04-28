## Targeted fix

Update only the `avatarStyle` prop passed to `CinematicModalShell` in `src/components/TarotModal.tsx` so the top-centered Norielle avatar applies to both mobile and tablet, but not desktop.

### Changes

1. Add tablet detection alongside the existing `isMobileTarot` (line 179). `useIsMobile` covers <768px; tablet covers 768-1023px:

   ```ts
   const isMobileTarot = useIsMobile();
   const [isTablet, setIsTablet] = useState<boolean>(
     () => typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024
   );
   useEffect(() => {
     const mql = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
     const onChange = () => setIsTablet(mql.matches);
     mql.addEventListener("change", onChange);
     onChange();
     return () => mql.removeEventListener("change", onChange);
   }, []);
   ```

2. Replace the `avatarStyle` prop on `CinematicModalShell` (line 451) with:

   ```ts
   avatarStyle={(isMobileTarot || isTablet) ? {
     position: "fixed" as const,
     top: 16,
     left: "50%",
     transform: "translateX(-50%)",
     bottom: "auto" as const,
     right: "auto" as const,
     insetInlineStart: "unset" as const,
     insetInlineEnd: "unset" as const,
     width: 56,
     height: 56,
     zIndex: 106,
     pointerEvents: "auto" as const,
   } : undefined}
   ```

   Desktop (≥1024px) keeps `undefined` → shell uses its existing default placement.

### Out of scope (no changes)

- Avatar image, glow, border, click behavior, advisor chat panel.
- Tarot cards, text, translations, share buttons, reading logic, result layout, CTA.
- Desktop placement.
- No auto-publish.

### Verification

- Mobile (<768px): Norielle avatar centered at the top, between close button (left) and Free badge (right), above "הקלפים שנבחרו עבורכם".
- Tablet (768–1023px): same top-center placement.
- Desktop (≥1024px): avatar remains in the existing default shell position.
- Avatar tappable on all sizes; opens the existing advisor chat.
- Cards, share buttons, AI interpretation, and CTA remain fully visible and unobstructed.

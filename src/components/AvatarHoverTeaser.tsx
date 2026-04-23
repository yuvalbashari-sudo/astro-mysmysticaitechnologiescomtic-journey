import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n";

interface AvatarHoverTeaserProps {
  children: React.ReactNode;
  /** Override default headline */
  text?: string;
  /** Override default supporting line */
  highlightText?: string;
  /** Disable teaser */
  disabled?: boolean;
  /** Force tooltip anchor side. If omitted, auto-detects based on screen position */
  anchor?: "left" | "right" | "auto";
  /** Additional className for the wrapper */
  className?: string;
  /** Additional style for the wrapper */
  style?: React.CSSProperties;
}

/**
 * Premium floating insight card that appears next to the avatar.
 * Desktop: appears on hover (with intentional delay). Mobile: appears briefly on tap.
 * Children remain fully clickable.
 */
const AvatarHoverTeaser = ({
  children,
  text,
  highlightText,
  disabled = false,
  anchor = "auto",
  className = "",
  style,
}: AvatarHoverTeaserProps) => {
  const { language } = useLanguage();
  const isRTL = language === "he" || language === "ar";

  const headlineByLang = useMemo(() => ({
    he: "תובנה אישית מחכה לך",
    en: "A personal insight is waiting for you",
    ru: "Персональное озарение ждёт вас",
    ar: "بصيرة شخصية بانتظارك",
  }[language]), [language]);

  const supportingByLang = useMemo(() => ({
    he: "מבט מדויק על מה שמשפיע עליך עכשיו",
    en: "A precise look at what's influencing you right now",
    ru: "Точный взгляд на то, что влияет на вас сейчас",
    ar: "نظرة دقيقة على ما يؤثر عليك الآن",
  }[language]), [language]);

  const resolvedHeadline = text ?? headlineByLang;
  const resolvedSupporting = highlightText ?? supportingByLang;

  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const showTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  };

  useEffect(() => () => clearTimers(), []);

  const getAnchorSide = useCallback((): "left" | "right" => {
    if (anchor !== "auto") return anchor;
    const el = wrapperRef.current;
    if (!el) return "left";
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    return centerX < window.innerWidth / 2 ? "right" : "left";
  }, [anchor]);

  // Responsive card width: shrinks on small viewports so it never clips off-screen.
  const [cardWidth, setCardWidth] = useState(320);

  const GAP_BELOW = 14;
  const MIN_GAP_BELOW = 6;
  const [horizontalShift, setHorizontalShift] = useState(0);
  const [effectiveGap, setEffectiveGap] = useState(GAP_BELOW);

  useEffect(() => {
    if (!visible) return;
    const compute = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const SAFE_MARGIN = 12;

      const maxByViewport = vw - SAFE_MARGIN * 2;
      const next = Math.max(240, Math.min(320, maxByViewport));
      setCardWidth(next);

      // Centered horizontally under the avatar — clamp if it would overflow.
      const avatarCenter = rect.left + rect.width / 2;
      const naturalLeft = avatarCenter - next / 2;
      const naturalRight = naturalLeft + next;
      let shift = 0;
      if (naturalLeft < SAFE_MARGIN) {
        shift = SAFE_MARGIN - naturalLeft;
      } else if (naturalRight > vw - SAFE_MARGIN) {
        shift = vw - SAFE_MARGIN - naturalRight;
      }
      setHorizontalShift(shift);

      // Vertical clamp — card sits BELOW avatar; if it would overflow the bottom,
      // reduce the gap toward MIN_GAP_BELOW. Never flip above.
      const ESTIMATED_HEIGHT = 160;
      const cardBottom = rect.bottom + GAP_BELOW + ESTIMATED_HEIGHT;
      if (cardBottom > vh - SAFE_MARGIN) {
        const overflow = cardBottom - (vh - SAFE_MARGIN);
        setEffectiveGap(Math.max(MIN_GAP_BELOW, GAP_BELOW - overflow));
      } else {
        setEffectiveGap(GAP_BELOW);
      }
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [visible]);

  // Card is positioned BELOW the avatar, horizontally centered with viewport clamp.
  const cardPosition: React.CSSProperties = {
    top: `calc(100% + ${effectiveGap}px)`,
    left: "50%",
    transform: `translateX(calc(-50% + ${horizontalShift}px))`,
  };

  // Desktop: intentional delay before appearing (feels considered, not reactive)
  const handleMouseEnter = () => {
    if (disabled) return;
    clearTimers();
    showTimerRef.current = window.setTimeout(() => setVisible(true), 280);
  };

  const handleMouseLeave = () => {
    clearTimers();
    setVisible(false);
  };

  // Mobile tap: show insight card briefly without preventing the underlying button click.
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    if (e.pointerType === "touch") {
      clearTimers();
      setVisible(true);
      hideTimerRef.current = window.setTimeout(() => setVisible(false), 2600);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      style={{ ...style, overflow: "visible" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
    >
      <AnimatePresence>
        {visible && !disabled && (
          <motion.div
            className="absolute pointer-events-none z-[300]"
            style={{
              ...cardPosition,
              width: cardWidth,
              padding: "24px 26px",
              borderRadius: 20,
              background:
                "radial-gradient(120% 100% at 0% 0%, hsl(43 60% 18% / 0.32) 0%, transparent 55%), linear-gradient(155deg, hsl(222 47% 9% / 0.88) 0%, hsl(222 50% 6% / 0.92) 100%)",
              backdropFilter: "blur(20px) saturate(140%)",
              WebkitBackdropFilter: "blur(20px) saturate(140%)",
              border: "1px solid hsl(var(--gold) / 0.28)",
              boxShadow:
                "0 20px 60px hsl(222 60% 2% / 0.6), 0 0 40px hsl(var(--gold) / 0.08), inset 0 1px 0 hsl(var(--gold) / 0.12)",
              direction: isRTL ? "rtl" : "ltr",
              textAlign: isRTL ? "right" : "left",
            }}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              boxShadow: [
                "0 20px 60px hsl(222 60% 2% / 0.6), 0 0 40px hsl(var(--gold) / 0.08), inset 0 1px 0 hsl(var(--gold) / 0.12)",
                "0 20px 60px hsl(222 60% 2% / 0.6), 0 0 56px hsl(var(--gold) / 0.14), inset 0 1px 0 hsl(var(--gold) / 0.12)",
                "0 20px 60px hsl(222 60% 2% / 0.6), 0 0 40px hsl(var(--gold) / 0.08), inset 0 1px 0 hsl(var(--gold) / 0.12)",
              ],
            }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{
              opacity: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
              boxShadow: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            {/* Subtle ornamental glow accent */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: -1,
                left: "10%",
                right: "10%",
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.5), transparent)",
              }}
            />

            <h3
              className="font-heading"
              style={{
                margin: 0,
                fontSize: 20,
                lineHeight: 1.3,
                fontWeight: 600,
                letterSpacing: "0.01em",
                background:
                  "linear-gradient(135deg, hsl(var(--gold-light)) 0%, hsl(var(--gold)) 60%, hsl(var(--gold-dark)) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {resolvedHeadline}
            </h3>

            <p
              className="font-body"
              style={{
                margin: "10px 0 0",
                fontSize: 14,
                lineHeight: 1.6,
                color: "hsl(var(--foreground) / 0.72)",
                fontWeight: 400,
              }}
            >
              {resolvedSupporting}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
};

export default AvatarHoverTeaser;

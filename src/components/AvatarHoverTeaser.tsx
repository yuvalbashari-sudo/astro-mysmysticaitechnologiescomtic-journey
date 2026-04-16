import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { assistantName } from "@/lib/assistantConfig";
import { useLanguage } from "@/i18n";

interface AvatarHoverTeaserProps {
  children: React.ReactNode;
  /** Override default CTA text */
  text?: string;
  /** Override the gold highlighted portion */
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
 * Wraps any avatar button with a premium micro-tooltip.
 * Desktop: appears on hover. Mobile: appears briefly on tap (auto-hides), without blocking the click.
 * Children (the avatar button) remain fully clickable.
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

  // Warm, guide-oriented one-liners. A variant is picked per mount for subtle freshness.
  const variants = useMemo(() => ({
    he: [
      `${assistantName} כאן כדי להאיר לך את הדרך`,
      `רוצה תובנה אישית למה שמגיע עכשיו?`,
      `בוא נראה מה הכוכבים מספרים על המסע שלך`,
    ],
    en: [
      `${assistantName} is here to help you find your direction`,
      `Want a personal insight for what's coming next?`,
      `Let's see what the stars say about your path`,
    ],
    ru: [
      `${assistantName} рядом, чтобы подсветить ваш путь`,
      `Хотите личный взгляд на то, что впереди?`,
      `Посмотрим, что звёзды говорят о вашем пути`,
    ],
    ar: [
      `${assistantName} هنا ليرشدك في طريقك`,
      `تريد إضاءة شخصية لما هو قادم؟`,
      `لنرَ ما تقوله النجوم عن مسارك`,
    ],
  }[language]), [language]);

  const ctaByLang = useMemo(() => ({
    he: "בחר נושא להתחלה",
    en: "Choose a topic to begin",
    ru: "Выберите тему, чтобы начать",
    ar: "اختر موضوعًا للبدء",
  }[language]), [language]);

  const pickedText = useMemo(
    () => variants[Math.floor(Math.random() * variants.length)],
    [variants]
  );

  const resolvedText = text ?? pickedText;
  const resolvedHighlight = highlightText ?? ctaByLang;

  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  useEffect(() => () => clearHideTimer(), []);

  const getAnchorSide = useCallback((): "left" | "right" => {
    if (anchor !== "auto") return anchor;
    const el = wrapperRef.current;
    if (!el) return "left";
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    return centerX < window.innerWidth / 2 ? "right" : "left";
  }, [anchor]);

  const side = visible ? getAnchorSide() : "left";
  const isLeft = side === "left";

  const tooltipPosition: React.CSSProperties = isLeft
    ? { right: "calc(100% + 10px)", bottom: 12 }
    : { left: "calc(100% + 10px)", bottom: 12 };

  const arrowPosition: React.CSSProperties = isLeft
    ? {
        right: -4,
        bottom: 14,
        transform: "rotate(45deg)",
        borderBottom: "none",
        borderLeft: "none",
      }
    : {
        left: -4,
        bottom: 14,
        transform: "rotate(45deg)",
        borderTop: "none",
        borderRight: "none",
      };

  // Mobile tap: show teaser briefly without preventing the underlying button click.
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    if (e.pointerType === "touch") {
      clearHideTimer();
      setVisible(true);
      hideTimerRef.current = window.setTimeout(() => setVisible(false), 2200);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      style={{ ...style, overflow: "visible" }}
      onMouseEnter={() => !disabled && setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onPointerDown={handlePointerDown}
    >
      <AnimatePresence>
        {visible && !disabled && (
          <motion.div
            className="absolute pointer-events-none z-[200]"
            style={{
              ...tooltipPosition,
              maxWidth: 260,
              padding: "12px 18px",
              borderRadius: 14,
              background: "hsl(222 47% 8% / 0.78)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid hsl(var(--gold) / 0.22)",
              boxShadow:
                "0 8px 24px hsl(222 47% 4% / 0.45), 0 0 16px hsl(var(--gold) / 0.06)",
            }}
            initial={{ opacity: 0, scale: 0.94, x: isLeft ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.94, x: isLeft ? 4 : -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <p
              className="font-body"
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.5,
                color: "hsl(var(--foreground) / 0.85)",
              }}
            >
              {resolvedText}
            </p>
            <p
              className="font-body"
              style={{
                margin: "4px 0 0",
                fontSize: 14,
                lineHeight: 1.4,
                color: "hsl(var(--gold))",
                fontWeight: 500,
              }}
            >
              {resolvedHighlight}
            </p>
            <div
              className="absolute"
              style={{
                ...arrowPosition,
                width: 8,
                height: 8,
                background: "hsl(222 47% 8% / 0.78)",
                border: "1px solid hsl(var(--gold) / 0.22)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
};

export default AvatarHoverTeaser;

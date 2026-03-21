import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AvatarHoverTeaserProps {
  children: React.ReactNode;
  /** Override default Hebrew CTA text */
  text?: string;
  /** Override the gold highlighted portion */
  highlightText?: string;
  /** Disable teaser (e.g. on mobile) */
  disabled?: boolean;
  /** Tooltip anchor side relative to avatar */
  anchor?: "left" | "right";
  /** Additional className for the wrapper */
  className?: string;
  /** Additional style for the wrapper */
  style?: React.CSSProperties;
}

/**
 * Wraps any avatar button with a premium micro-tooltip on desktop hover.
 * The tooltip appears to the specified side (default: left) of the avatar.
 * Children (the avatar button) remain fully clickable.
 */
const AvatarHoverTeaser = ({
  children,
  text = "רוצים הכוונה?",
  highlightText = "לחצו לשיחה",
  disabled = false,
  anchor = "left",
  className = "",
  style,
}: AvatarHoverTeaserProps) => {
  const [hovered, setHovered] = useState(false);

  const isLeft = anchor === "left";

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

  return (
    <div
      className={`relative ${className}`}
      style={style}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && !disabled && (
          <motion.div
            className="absolute pointer-events-none z-[1]"
            style={{
              ...tooltipPosition,
              whiteSpace: "nowrap",
              padding: "12px 20px",
              borderRadius: 12,
              background: "hsl(222 47% 8% / 0.75)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid hsl(var(--gold) / 0.18)",
              boxShadow:
                "0 6px 20px hsl(222 47% 4% / 0.4), 0 0 12px hsl(var(--gold) / 0.04)",
              direction: "rtl",
            }}
            initial={{ opacity: 0, scale: 0.92, x: isLeft ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.92, x: isLeft ? 4 : -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <p
              className="font-body"
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.5,
                color: "hsl(var(--foreground) / 0.8)",
              }}
            >
              {text}{" "}
              <span style={{ color: "hsl(var(--gold))" }}>{highlightText}</span>
            </p>
            {/* Directional arrow */}
            <div
              className="absolute"
              style={{
                ...arrowPosition,
                width: 8,
                height: 8,
                background: "hsl(222 47% 8% / 0.75)",
                border: "1px solid hsl(var(--gold) / 0.18)",
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

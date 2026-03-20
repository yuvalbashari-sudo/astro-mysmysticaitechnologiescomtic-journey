import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  /** Content for the LEFT zone (interpretation / results) */
  leftContent: ReactNode;
  /** Content for the RIGHT zone (form / cards / interactive element) */
  rightContent: ReactNode;
  /** Whether on mobile — falls back to stacked single column */
  isMobile: boolean;
  /** Scroll ref for the left content zone */
  leftScrollRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Cinematic 3-zone desktop layout.
 * LEFT = reading / result content
 * CENTER = oracle woman (provided by CinematicModalShell background)
 * RIGHT = form / cards / interactive
 *
 * On mobile, renders stacked (right on top, left below).
 */
const CinematicDesktopLayout = ({ leftContent, rightContent, isMobile, leftScrollRef }: Props) => {
  if (isMobile) {
    return (
      <div className="px-4 pt-4 pb-10">
        {rightContent}
        <div className="mt-6">{leftContent}</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* LEFT: Result / interpretation — transparent overlay */}
      <motion.div
        ref={leftScrollRef as React.RefObject<HTMLDivElement>}
        className="absolute overflow-y-auto pointer-events-auto scrollbar-hide"
        style={{
          top: "calc(10vh + 50px)",
          left: "3vw",
          width: "min(480px, calc(100vw - 560px))",
          maxWidth: "480px",
          maxHeight: "80vh",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Subtle radiance for legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 35%, hsl(222 47% 6% / 0.7), transparent 85%)",
            filter: "blur(50px)",
          }}
        />
        <div className="relative" style={{ padding: "0 16px 60px" }}>
          {leftContent}
        </div>
      </motion.div>

      {/* RIGHT: Interactive element */}
      <motion.div
        className="absolute overflow-y-auto pointer-events-auto scrollbar-hide"
        style={{
          top: "calc(10vh + 50px)",
          right: "3vw",
          width: "min(400px, 28vw)",
          maxHeight: "80vh",
        }}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative" style={{ padding: "0 8px 40px" }}>
          {rightContent}
        </div>
      </motion.div>
    </div>
  );
};

export default CinematicDesktopLayout;

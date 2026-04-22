import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useT } from "@/i18n";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Small, elegant accessibility (♿) FAB available globally on mobile.
 *
 * - Mobile-only (md:hidden) — desktop already exposes the link in its top bar.
 * - Bottom-left so it never collides with the WhatsApp/Oracle buttons on the right.
 * - Hidden on the accessibility page itself to avoid redundancy.
 * - Compact, premium gold/glass styling to match the hero language without
 *   becoming a "card" — strictly a single icon control.
 */
const MobileAccessibilityFab = () => {
  const t = useT();
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  if (!isMobile) return null;
  if (pathname === "/accessibility") return null;
  if (pathname === "/") return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 220, damping: 22 }}
      className="fixed md:hidden"
      style={{
        // Sit above bottom safe area, always reachable, never blocking the
        // WhatsApp/Oracle FABs on the right side.
        left: 14,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)",
        zIndex: 130, // above MobileOptionsSheet (z-[120]) so it stays reachable
      }}
    >
      <Link
        to="/accessibility"
        aria-label={t.a11y_link_label}
        title={t.a11y_link_label}
        className="flex items-center justify-center rounded-full transition-transform active:scale-95"
        style={{
          width: 40,
          height: 40,
          fontSize: 18,
          lineHeight: 1,
          background:
            "linear-gradient(135deg, hsl(225 50% 9% / 0.92), hsl(225 55% 5% / 0.92))",
          border: "1px solid hsl(var(--gold) / 0.35)",
          color: "hsl(var(--gold) / 0.9)",
          boxShadow:
            "0 6px 18px hsl(225 60% 3% / 0.55), 0 0 14px hsl(var(--gold) / 0.18)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        ♿
      </Link>
    </motion.div>
  );
};

export default MobileAccessibilityFab;

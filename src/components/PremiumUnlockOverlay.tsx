import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { premiumUnlock } from "@/lib/premiumUnlock";
import { analytics } from "@/lib/analytics";
import type { FeatureKey } from "@/lib/pricingConfig";
import { useSiteAdmin } from "@/hooks/use-site-admin";
import { useLanguage, useT } from "@/i18n/LanguageContext";

interface Props {
  readingId: string;
  featureKey: FeatureKey;
  children: ReactNode;
  disabled?: boolean;
  forceUnlock?: boolean;
  onUnlockStart?: () => void;
  isReady?: boolean;
}

const PremiumUnlockOverlay = ({ readingId, featureKey, children, disabled = false, forceUnlock = false, onUnlockStart, isReady = true }: Props) => {
  const t = useT();
  const { dir } = useLanguage();
  const admin = useSiteAdmin();
  const [unlocked, setUnlocked] = useState(() => premiumUnlock.isUnlocked(readingId));
  const startedReading = useRef<string | null>(null);

  useEffect(() => {
    const sync = () => setUnlocked(premiumUnlock.isUnlocked(readingId));
    sync();
    window.addEventListener("astrologai:unlock-changed", sync);
    return () => window.removeEventListener("astrologai:unlock-changed", sync);
  }, [readingId]);

  useEffect(() => {
    if (!admin || !readingId || isReady || !onUnlockStart || startedReading.current === readingId) return;
    startedReading.current = readingId;
    onUnlockStart();
  }, [admin, readingId, isReady, onUnlockStart]);

  const handleUnlock = () => {
    onUnlockStart?.();
    premiumUnlock.markUnlocked(readingId);
    setUnlocked(true);
    analytics.track("reading_unlocked", { readingId, featureKey });
  };

  if (admin || forceUnlock || unlocked || disabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative" dir={dir}>
      {/* Blurred preview of the reading */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none"
        style={{
          filter: "blur(14px)",
          maskImage: "linear-gradient(to bottom, hsl(0 0% 0%) 0%, hsl(0 0% 0% / 0.6) 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, hsl(0 0% 0%) 0%, hsl(0 0% 0% / 0.6) 60%, transparent 100%)",
          maxHeight: "320px",
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {/* Unlock panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative -mt-24 mx-auto w-full max-w-md rounded-3xl overflow-hidden p-7 text-center backdrop-blur-md"
        style={{
          background: "linear-gradient(160deg, hsl(222 36% 11% / 0.96), hsl(222 48% 5% / 0.98))",
          border: "1px solid hsl(var(--gold) / 0.25)",
          boxShadow: "0 0 60px hsl(var(--gold) / 0.1), 0 25px 50px hsl(0 0% 0% / 0.55)",
        }}
      >
        {/* Top gold glow */}
        <div
          className="absolute top-0 inset-x-0 h-28 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% -20%, hsl(var(--gold) / 0.18), transparent 70%)",
          }}
        />

        <div
          className="relative w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{
            background: "radial-gradient(circle, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.04) 70%)",
            border: "1px solid hsl(var(--gold) / 0.25)",
          }}
        >
          <Lock className="w-5 h-5 text-gold/85" />
        </div>

        <p
          className="font-body text-xs uppercase tracking-[0.25em] mb-2"
          style={{ color: "hsl(var(--gold) / 0.7)" }}
        >
          {t.unlock_preview_label}
        </p>

        <h3 className="font-heading text-2xl text-gold mb-3">{t.unlock_cta_label}</h3>

        <button
          type="button"
          onClick={handleUnlock}
          className="w-full btn-gold py-3.5 rounded-xl font-body font-bold text-sm tracking-wider flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {t.unlock_cta_label}
        </button>
      </motion.div>

    </div>
  );
};

export default PremiumUnlockOverlay;

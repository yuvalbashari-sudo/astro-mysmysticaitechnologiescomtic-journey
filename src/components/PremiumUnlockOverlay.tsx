import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import PromoVideoModal from "./PromoVideoModal";
import PaymentGatingModal from "./PaymentGatingModal";
import { premiumUnlock } from "@/lib/premiumUnlock";
import { entitlements, type GatingMessage } from "@/lib/entitlements";
import { FEATURE_RULES, type FeatureKey, type ResetCycle } from "@/lib/pricingConfig";
import { subscriptionManager } from "@/lib/subscriptionManager";
import { useLanguage, useT } from "@/i18n/LanguageContext";

interface Props {
  /**
   * Stable per-reading id. A new id (e.g. new tarot draw, new compatibility
   * pair, new natal chart) re-triggers the gate. Same id stays unlocked for
   * the rest of the session.
   */
  readingId: string;
  /** Which feature this gate represents (drives price + reset cycle copy). */
  featureKey: FeatureKey;
  /** The full reading content. Hidden behind blur until unlocked. */
  children: ReactNode;
  /**
   * If true, the overlay is suspended — used while the reading is still
   * streaming or while a question phase hasn't completed. Defaults to false.
   */
  disabled?: boolean;
  /**
   * Optional custom gating message override. Used for surfaces that don't
   * have a built-in gating prompt (e.g. monthly forecast, natal chart).
   */
  customGatingMessage?: GatingMessage;
  /**
   * Explicit bypass flag. ONLY this flag bypasses the gate — never tier,
   * email, or environment. Defaults to false. Reserve for support tooling.
   */
  forceUnlock?: boolean;
}

/**
 * PremiumUnlockOverlay
 *
 * Wraps a full premium reading. Until the user passes the unlock flow
 * (preview → unlock CTA → promo video → payment/upgrade modal) the children
 * are blurred and an unlock panel sits on top. Admin tier and previously
 * unlocked readings render the children directly.
 */
const PremiumUnlockOverlay = ({ readingId, featureKey, children, disabled = false, customGatingMessage, forceUnlock = false }: Props) => {
  const t = useT();
  const { dir } = useLanguage();

  const [unlocked, setUnlocked] = useState<boolean>(() => premiumUnlock.isUnlocked(readingId));
  const [promoOpen, setPromoOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Re-evaluate unlock state whenever the reading id changes, and listen
  // for global unlock events (e.g. another surface unlocked the same id).
  useEffect(() => {
    const sync = () => setUnlocked(premiumUnlock.isUnlocked(readingId));
    sync();
    setPromoOpen(false);
    setPaymentOpen(false);
    window.addEventListener("astrologai:unlock-changed", sync);
    return () => window.removeEventListener("astrologai:unlock-changed", sync);
  }, [readingId]);

  // Build the gating message for this feature. We always show the existing
  // PaymentGatingModal so the user gets pay-per-use + upgrade options, even
  // for their very first reading.
  const { gatingMessage, resetCycle } = useMemo<{
    gatingMessage: GatingMessage | null;
    resetCycle: ResetCycle;
  }>(() => {
    if (customGatingMessage) {
      return { gatingMessage: customGatingMessage, resetCycle: "none" };
    }
    const access = entitlements.checkAccess(featureKey);
    // If quota is exhausted, use the real denied message.
    if (access.allowed === false) {
      return {
        gatingMessage: entitlements.getGatingMessage(access.promptKey, access.priceILS),
        resetCycle: access.resetCycle,
      };
    }
    // Otherwise synthesize a message based on the feature's pay-per-use price.
    const tier = subscriptionManager.getCurrentTier();
    const rule = FEATURE_RULES[tier][featureKey];
    const price = rule.payPerUsePrice || 0;
    let promptKey: import("@/lib/entitlements").GatingPromptKey;
    switch (featureKey) {
      case "compatibility_reading":
        promptKey = tier === "free" ? "compatibility_free_exhausted" : "compatibility_sub_exhausted";
        break;
      case "palm_reading":
        promptKey = tier === "free" ? "palm_free" : "palm_sub_full";
        break;
      case "tarot_reading":
      default:
        promptKey = tier === "free" ? "tarot_free_exhausted" : "tarot_sub_exhausted";
    }
    return {
      gatingMessage: entitlements.getGatingMessage(promptKey, price),
      resetCycle: rule.resetCycle,
    };
  }, [featureKey, readingId, customGatingMessage]);

  const handleUnlock = () => {
    premiumUnlock.markUnlocked(readingId);
    setUnlocked(true);
    setPromoOpen(false);
    setPaymentOpen(false);
  };

  // Bypass paths: explicit forceUnlock prop, an already-unlocked reading, or
  // an externally-controlled `disabled` flag (e.g. while the AI is still
  // streaming). Nothing else bypasses — not tier, not email, not env.
  if (forceUnlock || unlocked || disabled) {
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

        <p className="font-body text-sm text-foreground/70 leading-relaxed mb-6 max-w-sm mx-auto">
          {t.unlock_subtitle}
        </p>

        <button
          onClick={() => setPromoOpen(true)}
          className="w-full btn-gold py-3.5 rounded-xl font-body font-bold text-sm tracking-wider flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {t.unlock_cta_label}
        </button>
      </motion.div>

      {/*
        Promo video IS the unlock mechanism (payment disabled for now).
        Continuing or finishing the video unlocks the full reading directly.
        PaymentGatingModal kept imported for future re-enablement.
      */}
      <PromoVideoModal
        isOpen={promoOpen}
        onClose={() => setPromoOpen(false)}
        onContinue={() => {
          setPromoOpen(false);
          handleUnlock();
        }}
      />
    </div>
  );
};

export default PremiumUnlockOverlay;

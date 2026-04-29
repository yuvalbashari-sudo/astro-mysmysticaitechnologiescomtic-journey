import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Sparkles } from "lucide-react";
import { createPortal } from "react-dom";
import { useLanguage, useT } from "@/i18n/LanguageContext";
import { analytics } from "@/lib/analytics";
import promoVideo from "@/assets/promo.mp4";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Called when the user chooses to continue to the full reading */
  onContinue: () => void;
  /** Seconds before the continue/skip CTA appears (default 4s) */
  unlockAfterSeconds?: number;
}

/**
 * Promotional video shown before unlocking the full reading.
 * - Auto-plays muted, user can unmute.
 * - Continue/Skip CTA appears after `unlockAfterSeconds`.
 * - On continue, calls onContinue() and closes.
 */
const PromoVideoModal = ({ isOpen, onClose, onContinue, unlockAfterSeconds = 4 }: Props) => {
  const { dir } = useLanguage();
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(unlockAfterSeconds);

  useEffect(() => {
    if (!isOpen) return;
    setUnlocked(false);
    setSecondsLeft(unlockAfterSeconds);
    setMuted(true);

    document.body.style.overflow = "hidden";

    // Try autoplay (muted should always succeed)
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }

    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setUnlocked(true);
          clearInterval(tick);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      clearInterval(tick);
      document.body.style.overflow = "";
    };
  }, [isOpen, unlockAfterSeconds]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (!next) v.play().catch(() => {});
  };

  const handleContinue = (source: "ended" | "continue_button" | "skip_button" = "continue_button") => {
    analytics.track("video_completed", { source });
    onContinue();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000]"
          style={{ width: "100vw", height: "100vh", background: "#000" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          dir={dir}
        >
          {/* Premium dark backdrop */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, hsl(222 50% 4% / 0.6), hsl(222 60% 2% / 0.95))",
            }}
          />

          {/* Full-screen video — contained, never cropped */}
          <video
            ref={videoRef}
            src={promoVideo}
            autoPlay
            muted
            playsInline
            controls={false}
            onEnded={() => {
              setUnlocked(true);
              // Auto-reveal full reading when video finishes naturally.
              handleContinue();
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100vw",
              height: "100vh",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              background: "#000",
            }}
          />

          {/* Close (top, safe-area aware) */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute z-20 w-11 h-11 rounded-full flex items-center justify-center text-foreground/80 hover:text-gold transition-colors backdrop-blur-md"
            style={{
              top: "calc(env(safe-area-inset-top, 0px) + 16px)",
              insetInlineEnd: "calc(env(safe-area-inset-right, 0px) + 16px)",
              background: "hsl(0 0% 0% / 0.55)",
              border: "1px solid hsl(var(--gold) / 0.3)",
            }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mute toggle (top-start, safe-area aware) */}
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="absolute z-20 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
            style={{
              top: "calc(env(safe-area-inset-top, 0px) + 16px)",
              insetInlineStart: "calc(env(safe-area-inset-left, 0px) + 16px)",
              background: "hsl(0 0% 0% / 0.55)",
              border: "1px solid hsl(var(--gold) / 0.3)",
              color: "hsl(var(--gold))",
            }}
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Bottom CTA bar — fixed, with safe-area spacing, never covers video meaningfully */}
          <div
            className="absolute inset-x-0 z-20 flex flex-col items-center justify-center gap-2 px-4"
            style={{
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
            }}
          >
            {!unlocked ? (
              <motion.p
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-body text-sm text-foreground/70 px-4 py-2 rounded-full backdrop-blur-md"
                style={{
                  background: "hsl(0 0% 0% / 0.5)",
                  border: "1px solid hsl(var(--gold) / 0.18)",
                }}
              >
                {t.promo_video_wait_hint?.replace("{s}", String(secondsLeft)) ??
                  `Continue available in ${secondsLeft}s…`}
              </motion.p>
            ) : (
              <motion.div
                key="unlocked"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full flex flex-col items-center gap-2"
              >
                <button
                  onClick={handleContinue}
                  className="w-full sm:w-auto sm:min-w-[280px] btn-gold py-3.5 px-8 rounded-xl font-body font-bold text-sm tracking-wider flex items-center justify-center gap-2"
                  style={{
                    boxShadow:
                      "0 10px 40px hsl(0 0% 0% / 0.6), 0 0 30px hsl(var(--gold) / 0.25)",
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  {t.promo_video_continue_label ?? "Continue to full reading"}
                </button>
                <button
                  onClick={handleContinue}
                  className="text-xs text-foreground/60 hover:text-foreground/90 transition-colors font-body px-3 py-1 rounded-full"
                  style={{ background: "hsl(0 0% 0% / 0.4)" }}
                >
                  {t.promo_video_skip_label ?? "Skip"}
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default PromoVideoModal;

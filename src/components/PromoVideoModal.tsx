import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Sparkles } from "lucide-react";
import { createPortal } from "react-dom";
import { useLanguage, useT } from "@/i18n/LanguageContext";
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

  const handleContinue = () => {
    onContinue();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          dir={dir}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, hsl(222 50% 6% / 0.92), hsl(222 60% 3% / 0.98))",
              backdropFilter: "blur(12px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal card */}
          <motion.div
            className="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, hsl(222 36% 10%), hsl(222 48% 5%))",
              border: "1px solid hsl(var(--gold) / 0.25)",
              boxShadow:
                "0 0 80px hsl(var(--gold) / 0.12), 0 30px 60px hsl(0 0% 0% / 0.6)",
            }}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top gold glow */}
            <div
              className="absolute top-0 inset-x-0 h-32 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% -20%, hsl(var(--gold) / 0.15), transparent 70%)",
              }}
            />

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 end-3 z-20 w-9 h-9 rounded-full flex items-center justify-center text-foreground/60 hover:text-gold transition-colors"
              style={{
                background: "hsl(var(--gold) / 0.08)",
                border: "1px solid hsl(var(--gold) / 0.18)",
              }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-5 sm:p-7">
              {/* Video container */}
              <div
                className="relative w-full rounded-2xl overflow-hidden bg-black"
                style={{
                  aspectRatio: "16 / 9",
                  border: "1px solid hsl(var(--gold) / 0.18)",
                  boxShadow: "0 0 40px hsl(var(--gold) / 0.08) inset",
                }}
              >
                <video
                  ref={videoRef}
                  src={promoVideo}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  onEnded={() => setUnlocked(true)}
                  controls={false}
                />

                {/* Mute toggle */}
                <button
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="absolute bottom-3 end-3 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                  style={{
                    background: "hsl(0 0% 0% / 0.55)",
                    border: "1px solid hsl(var(--gold) / 0.3)",
                    color: "hsl(var(--gold))",
                  }}
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                {/* Subtle vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, transparent 60%, hsl(0 0% 0% / 0.35) 100%)",
                  }}
                />
              </div>

              {/* CTA area */}
              <div className="mt-5 flex flex-col items-center text-center min-h-[96px] justify-center">
                {!unlocked ? (
                  <motion.p
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-body text-sm text-foreground/55"
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
                    className="w-full flex flex-col items-center gap-3"
                  >
                    <button
                      onClick={handleContinue}
                      className="w-full sm:w-auto sm:min-w-[280px] btn-gold py-3.5 px-8 rounded-xl font-body font-bold text-sm tracking-wider flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t.promo_video_continue_label ?? "Continue to full reading"}
                    </button>
                    <button
                      onClick={handleContinue}
                      className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors font-body"
                    >
                      {t.promo_video_skip_label ?? "Skip"}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default PromoVideoModal;

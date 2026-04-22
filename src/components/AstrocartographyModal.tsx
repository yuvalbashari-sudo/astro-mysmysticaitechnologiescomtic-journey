import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, MapPin } from "lucide-react";
import CinematicModalShell from "@/components/CinematicModalShell";
import BirthDetailsForm, { type BirthDetails } from "@/components/BirthDetailsForm";
import astrologerAvatar from "@/assets/astrologer-avatar-cta.png";
import AstrocartographySection from "@/components/AstrocartographySection";
import ResultShareBar from "@/components/ResultShareBar";
import TextSizeControl, { type TextSize, TEXT_SIZE_CLASSES } from "@/components/TextSizeControl";
import { useIsMobile } from "@/hooks/use-mobile";
import { useT } from "@/i18n/LanguageContext";
import { mysticalProfile } from "@/lib/mysticalProfile";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = "form" | "analyzing" | "result";

const ANALYZING_MS = 1600;

/**
 * Standalone Astrocartography experience.
 * form → 1.6s anticipation → map-dominant result.
 * Sibling to BirthChartModal: same shell, same Norielle, same TextSizeControl.
 */
const AstrocartographyModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<Phase>("form");
  const [textSize, setTextSize] = useState<TextSize>("default");
  const [attempted, setAttempted] = useState(false);
  const [details, setDetails] = useState<BirthDetails>({
    userName: "",
    gender: mysticalProfile.getUserGender() || "",
    birthDate: "",
    birthTime: "",
    birthCity: "",
  });

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setPhase("form");
        setAttempted(false);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Auto-advance from analyzing → result
  useEffect(() => {
    if (phase !== "analyzing") return;
    const timer = setTimeout(() => setPhase("result"), ANALYZING_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleSubmit = useCallback(() => {
    setAttempted(true);
    if (
      !details.userName.trim() ||
      !details.gender ||
      !details.birthDate ||
      !details.birthTime ||
      !details.birthCity.trim()
    ) {
      return;
    }
    // Persist whatever bits we have for cross-feature memory
    try {
      mysticalProfile.recordUserName(details.userName.trim());
      if (details.gender) mysticalProfile.recordGender(details.gender as any);
    } catch { /* ignore */ }
    setPhase("analyzing");
  }, [details]);

  const sizes = TEXT_SIZE_CLASSES[textSize];

  // Norielle avatar position — keep clear of the form CTA on mobile
  const avatarStyle = isMobile
    ? { bottom: 14, right: 12, top: "auto" as const, left: "auto" as const, width: 78, height: 78 }
    : undefined;

  const shareText = `${t.astrocarto_result_title}\n\n${t.astrocarto_result_desc}\n\n${t.astrocarto_result_footer}`;

  return (
    <CinematicModalShell
      isOpen={isOpen}
      onClose={onClose}
      avatarStyle={avatarStyle}
      hideFreeBadge
      topOverlay
      hideAdvisor={phase === "form"}
    >
      <AnimatePresence mode="wait">
        {/* ── FORM PHASE ─────────────────────────────────────────── */}
        {phase === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5 md:space-y-6 pt-10 md:pt-12"
          >
            {/* Norielle — centered above the title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center"
            >
              <div
                className="relative rounded-full overflow-hidden"
                style={{
                  width: isMobile ? 108 : 128,
                  height: isMobile ? 108 : 128,
                  border: "2.5px solid hsl(var(--gold) / 0.55)",
                  boxShadow:
                    "0 0 0 5px hsl(var(--gold) / 0.10), 0 0 0 1px hsl(var(--gold) / 0.25), 0 6px 32px hsl(270 65% 45% / 0.42), 0 0 44px hsl(var(--gold) / 0.28)",
                }}
              >
                <img
                  src={astrologerAvatar}
                  alt=""
                  className="w-full h-full object-cover scale-105"
                  style={{ objectPosition: "center 42%" }}
                  draggable={false}
                />
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ border: "2px solid hsl(var(--gold) / 0.4)" }}
                  animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
                />
              </div>
            </motion.div>

            {/* Title — single dominant element */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="font-heading leading-[1.15] text-3xl md:text-4xl text-center px-2"
              style={{
                color: "hsl(var(--gold))",
                textShadow: "0 2px 28px hsl(222 47% 4%), 0 0 36px hsl(var(--gold) / 0.18)",
              }}
            >
              {t.astrocarto_result_title}
            </motion.h2>

            {/* Subtitle — soft, 1-2 lines */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="font-body text-sm md:text-base leading-relaxed text-center max-w-[34ch] mx-auto"
              style={{ color: "hsl(var(--gold) / 0.72)" }}
            >
              {t.astrocarto_subtitle}
            </motion.p>

            {/* Subtle gold divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.32 }}
              className="mx-auto h-px w-16"
              style={{
                background: "linear-gradient(to right, transparent, hsl(var(--gold) / 0.45), transparent)",
              }}
              aria-hidden
            />

            {/* Intro guidance — quiet supporting line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="font-body text-sm md:text-base leading-relaxed text-center"
              style={{ color: "hsl(var(--foreground) / 0.7)" }}
            >
              {t.astrocarto_form_intro}
            </motion.p>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.42 }}
              className="pt-1"
            >
              <BirthDetailsForm
                values={details}
                onChange={(patch) => setDetails((prev) => ({ ...prev, ...patch }))}
                attempted={attempted}
                showTime
                showCity
              />
            </motion.div>

            {/* CTA with subtle gold halo */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative pt-2"
            >
              {/* Halo */}
              <div
                aria-hidden
                className="absolute inset-0 -m-3 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, hsl(var(--gold) / 0.22) 0%, hsl(var(--gold) / 0.08) 45%, transparent 70%)",
                  filter: "blur(20px)",
                  opacity: 0.75,
                }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="relative btn-gold w-full text-base font-heading flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {t.astrocarto_form_cta}
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* ── ANALYZING PHASE ────────────────────────────────────── */}
        {phase === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center"
          >
            <div className="relative">
              {/* Soft gold halo behind sigil */}
              <div
                aria-hidden
                className="absolute inset-0 -m-8 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, hsl(var(--gold) / 0.25) 0%, hsl(var(--gold) / 0.08) 50%, transparent 75%)",
                  filter: "blur(16px)",
                }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Sparkles
                  className="w-12 h-12"
                  style={{
                    color: "hsl(var(--gold))",
                    filter: "drop-shadow(0 0 12px hsl(var(--gold) / 0.55))",
                  }}
                />
              </motion.div>
            </div>

            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="font-heading text-lg md:text-xl"
              style={{
                color: "hsl(var(--gold) / 0.9)",
                textShadow: "0 0 20px hsl(var(--gold) / 0.25)",
              }}
            >
              {t.astrocarto_analyzing}
            </motion.p>
          </motion.div>
        )}

        {/* ── RESULT PHASE ───────────────────────────────────────── */}
        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pt-2 md:pt-3 space-y-3 md:space-y-4 pb-6"
          >
            {/* TextSizeControl — anchored top-right */}
            <div className="flex justify-end">
              <TextSizeControl value={textSize} onChange={setTextSize} />
            </div>

            {/* Title */}
            <h2
              className={`font-heading text-center ${sizes.heading}`}
              style={{
                color: "hsl(var(--gold))",
                textShadow: "0 2px 20px hsl(222 47% 6%), 0 0 28px hsl(var(--gold) / 0.18)",
              }}
            >
              {t.astrocarto_result_title}
            </h2>

            {/* Description */}
            <p
              className={`font-body text-center max-w-prose mx-auto ${sizes.subheading}`}
              style={{ color: "hsl(var(--foreground) / 0.8)", lineHeight: 1.6 }}
            >
              {t.astrocarto_result_desc}
            </p>

            {/* Hint chip */}
            <div className="flex justify-center">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs md:text-sm font-body backdrop-blur-md"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--gold) / 0.14), hsl(var(--gold) / 0.06))",
                  border: "1px solid hsl(var(--gold) / 0.25)",
                  color: "hsl(var(--gold) / 0.9)",
                }}
              >
                <MapPin className="w-3.5 h-3.5" />
                {t.astrocarto_result_hint}
              </span>
            </div>

            {/* THE MAP — dominant hero */}
            <div className="pt-1">
              <AstrocartographySection />
            </div>

            {/* Emotional footer */}
            <p
              className={`text-center italic mt-4 ${sizes.body}`}
              style={{
                color: "hsl(var(--gold) / 0.75)",
                textShadow: "0 1px 12px hsl(222 47% 6%)",
              }}
            >
              {t.astrocarto_result_footer}
            </p>

            {/* Share */}
            <div className="pt-2">
              <ResultShareBar
                resultText={shareText}
                shareTitle={t.astrocarto_result_title}
                shareSubtitle={details.userName || undefined}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CinematicModalShell>
  );
};

export default AstrocartographyModal;

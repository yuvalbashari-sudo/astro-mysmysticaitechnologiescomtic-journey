import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/i18n/LanguageContext";

interface Props { onComplete: () => void; }

const zodiacSymbols = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const Particle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div className="absolute w-1 h-1 rounded-full" style={{ left: `${x}%`, top: `${y}%`, background: "hsl(var(--gold) / 0.6)", boxShadow: "0 0 6px hsl(var(--gold) / 0.4)" }} animate={{ opacity: [0, 0.8, 0], scale: [0, 1.5, 0], y: [0, -30 - Math.random() * 20] }} transition={{ duration: 2.5 + Math.random(), repeat: Infinity, delay }} />
);

const ONBOARDING_SEEN_KEY = "astrologai_onboarding_seen";

const MysticalOnboarding = ({ onComplete }: Props) => {
  const t = useT();
  const [step, setStep] = useState(0);
  const [autoProgress, setAutoProgress] = useState(true);
  const hasSeenBefore = typeof window !== "undefined" && localStorage.getItem(ONBOARDING_SEEN_KEY) === "true";

  const steps = [
    { title: t.onboarding_step1_title, text: t.onboarding_step1_text, cta: t.onboarding_step1_cta, duration: 3500 },
    { title: t.onboarding_step2_title, text: t.onboarding_step2_text, cta: t.onboarding_step2_cta, duration: 3000 },
    { title: t.onboarding_step3_title, text: t.onboarding_step3_text, cta: t.onboarding_step3_cta, duration: 2500 },
  ];

  const goNext = useCallback(() => {
    if (step < steps.length - 1) { setStep((s) => s + 1); setAutoProgress(true); }
    else { localStorage.setItem(ONBOARDING_SEEN_KEY, "true"); onComplete(); }
  }, [step, onComplete, steps.length]);

  const handleSkip = useCallback(() => { localStorage.setItem(ONBOARDING_SEEN_KEY, "true"); onComplete(); }, [onComplete]);

  useEffect(() => {
    if (!autoProgress) return;
    const timer = setTimeout(() => setAutoProgress(false), steps[step].duration);
    return () => clearTimeout(timer);
  }, [step, autoProgress, steps]);

  const particles = Array.from({ length: 18 }, (_, i) => ({ delay: Math.random() * 3, x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 }));
  const currentStep = steps[step];

  return (
    <div className="relative min-h-[440px] flex flex-col items-center justify-center overflow-hidden" style={{ padding: "48px 40px" }}>
      {hasSeenBefore && (
        <motion.button onClick={handleSkip} className="absolute top-4 left-4 z-20 font-body transition-colors duration-300" style={{ color: "hsl(var(--gold) / 0.4)", fontSize: "13px" }} whileHover={{ color: "hsl(var(--gold) / 0.7)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {t.onboarding_skip}
        </motion.button>
      )}
      {particles.map((p, i) => <Particle key={i} {...p} />)}
      {step === 1 && zodiacSymbols.map((sym, i) => (
        <motion.span key={`z-${i}`} className="absolute pointer-events-none select-none" style={{ left: `${8 + (i % 4) * 25}%`, top: `${15 + Math.floor(i / 4) * 30}%`, color: "hsl(var(--gold) / 0.08)", fontSize: "22px" }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 0.25, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.25 }}>{sym}</motion.span>
      ))}
      <AnimatePresence mode="wait">
        <motion.div key={step} className="relative z-10 flex flex-col items-center text-center" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.97 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          {/* Icon orb */}
          <motion.div
            className="rounded-full mb-8 flex items-center justify-center"
            style={{
              width: 88, height: 88,
              background: step === 2
                ? "radial-gradient(circle, hsl(var(--gold) / 0.2), hsl(var(--crimson) / 0.06), transparent)"
                : "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)",
              border: "1px solid hsl(var(--gold) / 0.2)",
              boxShadow: "0 0 50px hsl(var(--gold) / 0.12), inset 0 0 20px hsl(var(--gold) / 0.04)",
            }}
            animate={step === 0
              ? { scale: [1, 1.1, 1], boxShadow: ["0 0 30px hsl(43 80% 55% / 0.1)", "0 0 60px hsl(43 80% 55% / 0.25)", "0 0 30px hsl(43 80% 55% / 0.1)"] }
              : step === 1
              ? { scale: [1, 1.15, 1], rotate: [0, 180, 360] }
              : { scale: [1, 1.2, 1], boxShadow: ["0 0 30px hsl(43 80% 55% / 0.15)", "0 0 80px hsl(43 80% 55% / 0.35)", "0 0 30px hsl(43 80% 55% / 0.15)"] }}
            transition={{ duration: step === 2 ? 1.8 : 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.span style={{ fontSize: "32px" }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>
              {step === 0 ? "✦" : step === 1 ? "☽" : "⭐"}
            </motion.span>
          </motion.div>

          {/* Title */}
          <h3 className="font-heading gold-gradient-text mb-6" style={{ fontSize: "52px", lineHeight: 1.25, textShadow: "0 2px 30px hsl(222 47% 6%), 0 0 60px hsl(222 47% 6% / 0.85)", wordWrap: "break-word" }}>
            {currentStep.title}
          </h3>

          {/* Body */}
          <p className="font-body mx-auto leading-relaxed mb-10" style={{ fontSize: "32px", lineHeight: 1.7, maxWidth: "90%", color: "hsl(var(--foreground) / 0.65)", textShadow: "0 2px 15px hsl(222 47% 6%)", wordWrap: "break-word" }}>
            {currentStep.text}
          </p>

          {/* Step indicators */}
          <div className="flex items-center gap-2.5 mb-8">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: i === step ? 28 : 7,
                  height: 7,
                  background: i === step
                    ? "linear-gradient(90deg, hsl(var(--gold)), hsl(var(--gold-light)))"
                    : "hsl(var(--gold) / 0.15)",
                  borderRadius: 4,
                  boxShadow: i === step ? "0 0 12px hsl(var(--gold) / 0.3)" : "none",
                }}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            ))}
          </div>

          {/* CTA */}
          <motion.button
            onClick={goNext}
            className="btn-gold font-body flex items-center justify-center gap-2"
            style={{ fontSize: "40px", padding: "35px 90px", minWidth: 450 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {currentStep.cta}
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MysticalOnboarding;
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: () => void;
}

const zodiacSymbols = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const steps = [
  {
    title: "המסע המיסטי שלך מתחיל",
    text: "קחו רגע של שקט פנימי. עצמו את העיניים לרגע, נשמו עמוק — ופתחו את עצמכם לתובנות שמחכות להתגלות.",
    cta: "המשיכו",
    duration: 3500,
  },
  {
    title: "האנרגיה האישית שלך",
    text: "המערכת מתכוונת אל האנרגיה הייחודית שלכם — קוראת את הדפוסים הסמליים, את הקשרים הנסתרים ואת המסרים שמחכים להתגלות.",
    cta: "המשיכו לגילוי",
    duration: 3000,
  },
  {
    title: "התובנות מתחילות להתגלות",
    text: "האותות מתפענחים, הסמלים מתחברים לתמונה שלמה. הקריאה האישית שלכם מוכנה.",
    cta: "גלו את התוצאה שלכם",
    duration: 2500,
  },
];

// Particle component for cosmic dust
const Particle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      background: "hsl(var(--gold) / 0.6)",
      boxShadow: "0 0 6px hsl(var(--gold) / 0.4)",
    }}
    animate={{
      opacity: [0, 0.8, 0],
      scale: [0, 1.5, 0],
      y: [0, -30 - Math.random() * 20],
    }}
    transition={{ duration: 2.5 + Math.random(), repeat: Infinity, delay }}
  />
);

const ONBOARDING_SEEN_KEY = "astrologai_onboarding_seen";

const MysticalOnboarding = ({ onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [autoProgress, setAutoProgress] = useState(true);
  const hasSeenBefore = typeof window !== "undefined" && localStorage.getItem(ONBOARDING_SEEN_KEY) === "true";

  const goNext = useCallback(() => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      setAutoProgress(true);
    } else {
      localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
      onComplete();
    }
  }, [step, onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    onComplete();
  }, [onComplete]);

  // Auto-advance timer — user can also click CTA to skip
  useEffect(() => {
    if (!autoProgress) return;
    const timer = setTimeout(() => {
      setAutoProgress(false);
    }, steps[step].duration);
    return () => clearTimeout(timer);
  }, [step, autoProgress]);

  const particles = Array.from({ length: 18 }, (_, i) => ({
    delay: Math.random() * 3,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
  }));

  const currentStep = steps[step];

  return (
    <div className="relative min-h-[380px] flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden">
      {/* Skip button for returning users */}
      {hasSeenBefore && (
        <motion.button
          onClick={handleSkip}
          className="absolute top-3 left-3 z-20 text-gold/40 hover:text-gold/70 font-body text-xs transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          דלגו ←
        </motion.button>
      )}

      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Floating zodiac symbols — step 2 only */}
      {step === 1 &&
        zodiacSymbols.map((sym, i) => (
          <motion.span
            key={`z-${i}`}
            className="absolute text-gold/10 text-lg pointer-events-none select-none"
            style={{
              left: `${8 + (i % 4) * 25}%`,
              top: `${15 + Math.floor(i / 4) * 30}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.25, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.25 }}
          >
            {sym}
          </motion.span>
        ))}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="relative z-10 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.97 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Central glow orb */}
          <motion.div
            className="w-20 h-20 rounded-full mb-6 flex items-center justify-center"
            style={{
              background: step === 2
                ? "radial-gradient(circle, hsl(var(--gold) / 0.25), hsl(var(--crimson) / 0.08), transparent)"
                : "radial-gradient(circle, hsl(var(--gold) / 0.2), transparent)",
              border: "1px solid hsl(var(--gold) / 0.25)",
              boxShadow: "0 0 40px hsl(var(--gold) / 0.15)",
            }}
            animate={
              step === 0
                ? { scale: [1, 1.1, 1], boxShadow: ["0 0 30px hsl(43 80% 55% / 0.1)", "0 0 60px hsl(43 80% 55% / 0.25)", "0 0 30px hsl(43 80% 55% / 0.1)"] }
                : step === 1
                ? { scale: [1, 1.15, 1], rotate: [0, 180, 360] }
                : { scale: [1, 1.2, 1], boxShadow: ["0 0 30px hsl(43 80% 55% / 0.15)", "0 0 80px hsl(43 80% 55% / 0.35)", "0 0 30px hsl(43 80% 55% / 0.15)"] }
            }
            transition={{ duration: step === 2 ? 1.8 : 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.span
              className="text-2xl"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {step === 0 ? "✦" : step === 1 ? "🔮" : "⭐"}
            </motion.span>
          </motion.div>

          {/* Title */}
          <h3 className="font-heading text-xl md:text-2xl gold-gradient-text mb-3">
            {currentStep.title}
          </h3>

          {/* Text */}
          <p className="text-foreground/65 font-body text-sm md:text-base max-w-sm mx-auto leading-relaxed mb-8">
            {currentStep.text}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: i === step ? 24 : 6,
                  height: 6,
                  background: i === step ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.2)",
                  borderRadius: 3,
                }}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            ))}
          </div>

          {/* CTA */}
          <motion.button
            onClick={goNext}
            className="btn-gold font-body text-sm flex items-center justify-center gap-2"
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

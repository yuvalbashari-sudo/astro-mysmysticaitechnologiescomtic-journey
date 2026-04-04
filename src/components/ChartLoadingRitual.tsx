import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/LanguageContext";

interface Props {
  userName?: string;
  onComplete: () => void;
}

const STEPS_HE = [
  { icon: "🌌", text: "מחשב את מיקומי כוכבי הלכת..." },
  { icon: "☉", text: "ממפה את מזל השמש והמהות הפנימית..." },
  { icon: "☽", text: "חושף את עולמך הרגשי דרך הירח..." },
  { icon: "⬆️", text: "קובע את המזל העולה והרושם הראשוני..." },
  { icon: "🏠", text: "מסדר את הבתים האסטרולוגיים..." },
  { icon: "✨", text: "מסנתז את מפת הלידה המלאה שלך..." },
];

const STEPS_EN = [
  { icon: "🌌", text: "Calculating planetary positions..." },
  { icon: "☉", text: "Mapping your Sun sign and inner essence..." },
  { icon: "☽", text: "Revealing your emotional world through the Moon..." },
  { icon: "⬆️", text: "Determining your Rising sign and first impression..." },
  { icon: "🏠", text: "Arranging the astrological houses..." },
  { icon: "✨", text: "Synthesizing your complete natal chart..." },
];

const ChartLoadingRitual = ({ userName, onComplete }: Props) => {
  const t = useT();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Detect language from translations
  const isHebrew = t.meta_title?.includes("טארוט") || t.meta_title?.includes("ASTROLOGAI");
  const steps = isHebrew ? STEPS_HE : STEPS_EN;

  useEffect(() => {
    const totalDuration = 4500;
    const stepDuration = totalDuration / steps.length;

    const stepInterval = setInterval(() => {
      setStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, totalDuration / 100);

    const completeTimer = setTimeout(onComplete, totalDuration + 300);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Cosmic orb */}
      <motion.div
        className="relative mb-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {/* Outer ring */}
        <div
          className="w-40 h-40 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, hsl(43 80% 55% / 0.15), transparent 30%, hsl(215 70% 50% / 0.1) 50%, transparent 70%, hsl(43 80% 55% / 0.15))",
            border: "1px solid hsl(43 80% 55% / 0.15)",
          }}
        />
        {/* Inner pulsing core */}
        <motion.div
          className="absolute inset-6 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(43 80% 55% / 0.2), hsl(222 47% 8% / 0.9))",
            border: "1px solid hsl(43 80% 55% / 0.2)",
          }}
          animate={{
            boxShadow: [
              "0 0 20px hsl(43 80% 55% / 0.1), inset 0 0 30px hsl(43 80% 55% / 0.05)",
              "0 0 50px hsl(43 80% 55% / 0.2), inset 0 0 50px hsl(43 80% 55% / 0.1)",
              "0 0 20px hsl(43 80% 55% / 0.1), inset 0 0 30px hsl(43 80% 55% / 0.05)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Center symbol */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <span className="text-3xl" style={{ filter: "drop-shadow(0 0 10px hsl(43 80% 55% / 0.3))" }}>
            {steps[step]?.icon || "✨"}
          </span>
        </motion.div>
      </motion.div>

      {/* Title */}
      {userName && (
        <motion.h3
          className="font-heading text-xl md:text-2xl gold-gradient-text mb-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isHebrew ? `${userName}, מחשבים את המפה שלך...` : `${userName}, calculating your chart...`}
        </motion.h3>
      )}

      {/* Step text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          className="font-body text-sm md:text-base text-center max-w-sm"
          style={{ color: "hsl(var(--foreground) / 0.6)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {steps[step]?.text}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div
        className="w-48 h-0.5 mt-8 rounded-full overflow-hidden"
        style={{ background: "hsl(var(--gold) / 0.1)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, hsl(var(--gold) / 0.3), hsl(var(--gold) / 0.7), hsl(var(--gold) / 0.3))",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
};

export default ChartLoadingRitual;

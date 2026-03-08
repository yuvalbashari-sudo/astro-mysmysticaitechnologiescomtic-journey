import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Props {
  question: string;
  onComplete: () => void;
}

const RITUAL_TEXTS = [
  "מפרשים את הכוונה שמאחורי שאלתכם...",
  "הקלפים מסתנכרנים עם האנרגיה שסביבכם...",
  "המסר מתחיל להתבהר...",
];

const TarotAnalysisRitual = ({ question, onComplete }: Props) => {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setTextIndex(1), 1800);
    const t2 = setTimeout(() => setTextIndex(2), 3600);
    const t3 = setTimeout(() => onComplete(), 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <motion.div
      className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Cosmic bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, hsl(222 35% 12%), hsl(222 45% 4%))" }}
      />

      {/* Pulsing energy */}
      <motion.div
        className="absolute w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold) / 0.08), transparent 70%)",
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`ap-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 1.5 + Math.random() * 2.5,
            height: 1.5 + Math.random() * 2.5,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            background: i % 3 === 0 ? "hsl(var(--gold) / 0.5)" : "hsl(var(--celestial) / 0.3)",
          }}
          animate={{
            opacity: [0, 0.7, 0],
            y: [0, -(20 + Math.random() * 40)],
            x: [(Math.random() - 0.5) * 20],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Orbiting ring */}
      <motion.div
        className="absolute w-40 h-40 rounded-full pointer-events-none"
        style={{
          border: "1px solid hsl(var(--gold) / 0.1)",
        }}
        animate={{ rotate: 360, opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      {/* Spinning symbol */}
      <motion.div
        className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center mb-8"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold) / 0.12), transparent)",
          border: "1px solid hsl(var(--gold) / 0.15)",
        }}
        animate={{
          rotate: [0, 360],
          boxShadow: [
            "0 0 20px hsl(43 80% 55% / 0.1)",
            "0 0 40px hsl(43 80% 55% / 0.25)",
            "0 0 20px hsl(43 80% 55% / 0.1)",
          ],
        }}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          boxShadow: { duration: 2, repeat: Infinity },
        }}
      >
        <Sparkles className="w-8 h-8 text-gold/70" />
      </motion.div>

      {/* Ritual text */}
      <motion.p
        key={textIndex}
        className="relative z-10 font-heading text-base md:text-lg gold-gradient-text text-center mb-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
      >
        {RITUAL_TEXTS[textIndex]}
      </motion.p>

      {/* User's question echo */}
      {question && (
        <motion.div
          className="relative z-10 max-w-sm mx-auto px-5 py-3 rounded-xl text-center"
          style={{
            background: "hsl(var(--gold) / 0.04)",
            border: "1px solid hsl(var(--gold) / 0.08)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0.5] }}
          transition={{ delay: 0.5, duration: 2 }}
        >
          <p className="text-foreground/40 font-body text-xs leading-relaxed line-clamp-2" dir="rtl">
            "{question}"
          </p>
        </motion.div>
      )}

      {/* Progress dots */}
      <motion.div
        className="relative z-10 flex items-center gap-2 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: i <= textIndex ? "hsl(var(--gold) / 0.6)" : "hsl(var(--gold) / 0.15)",
            }}
            animate={i <= textIndex ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default TarotAnalysisRitual;

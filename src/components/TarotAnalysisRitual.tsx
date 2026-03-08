import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import { useLanguage, type Language } from "@/i18n";

interface Props {
  question: string;
  onComplete: () => void;
}

const RITUAL_PHASES: Record<Language, { text: string; icon: string }[]> = {
  he: [
    { text: "מפרשים את הכוונה שמאחורי שאלתכם...", icon: "🔍" },
    { text: "הקלפים מסתנכרנים עם האנרגיה שסביבכם...", icon: "✦" },
    { text: "המסר מתחיל להתבהר...", icon: "🌟" },
  ],
  en: [
    { text: "Interpreting the intention behind your question...", icon: "🔍" },
    { text: "The cards are syncing with the energy around you...", icon: "✦" },
    { text: "The message is beginning to unfold...", icon: "🌟" },
  ],
  ru: [
    { text: "Раскрываем намерение за вашим вопросом...", icon: "🔍" },
    { text: "Карты синхронизируются с вашей энергией...", icon: "✦" },
    { text: "Послание начинает проясняться...", icon: "🌟" },
  ],
  ar: [
    { text: "نفسّر النية الكامنة خلف سؤالك...", icon: "🔍" },
    { text: "تتزامن البطاقات مع الطاقة من حولك...", icon: "✦" },
    { text: "تبدأ الرسالة بالاتضاح...", icon: "🌟" },
  ],
};

const TarotAnalysisRitual = ({ question, onComplete }: Props) => {
  const { language, dir } = useLanguage();
  const ritualPhases = RITUAL_PHASES[language];
  const [phaseIndex, setPhaseIndex] = useState(0);
  const stableComplete = useCallback(onComplete, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhaseIndex(1), 2200);
    const t2 = setTimeout(() => setPhaseIndex(2), 4400);
    const t3 = setTimeout(() => stableComplete(), 6200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [stableComplete]);

  return (
    <motion.div
      className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Multi-layer cosmic background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 40%, hsl(222 35% 13%), hsl(222 50% 3%))" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 60%, hsl(var(--gold) / 0.025), transparent 45%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 75% 30%, hsl(var(--celestial) / 0.025), transparent 45%)" }} />

      {/* Expanding energy rings */}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={`ring-${ring}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 120 + ring * 80,
            height: 120 + ring * 80,
            border: `1px solid hsl(var(--gold) / ${0.08 - ring * 0.02})`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.35, 0.15],
            rotate: ring % 2 === 0 ? [0, 360] : [360, 0],
          }}
          transition={{
            scale: { duration: 3 + ring * 0.5, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 3 + ring * 0.5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20 + ring * 5, repeat: Infinity, ease: "linear" },
          }}
        />
      ))}

      {/* Central pulsing energy */}
      <motion.div
        className="absolute w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold) / 0.06), hsl(var(--gold) / 0.02) 40%, transparent 70%)",
        }}
        animate={{
          scale: [0.8, 1.3, 0.8],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles — varying speeds and sizes */}
      {[...Array(28)].map((_, i) => {
        const size = 1 + Math.random() * 3;
        const isGold = i % 3 !== 2;
        return (
          <motion.div
            key={`ap-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size,
              height: size,
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              background: isGold
                ? `hsl(var(--gold) / ${0.3 + Math.random() * 0.3})`
                : `hsl(var(--celestial) / ${0.2 + Math.random() * 0.2})`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              y: [0, -(15 + Math.random() * 45)],
              x: [(Math.random() - 0.5) * 25],
            }}
            transition={{
              duration: 2.5 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeOut",
            }}
          />
        );
      })}

      {/* Sacred geometry lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.035 }}>
        <motion.line
          x1="50%" y1="15%" x2="25%" y2="75%"
          stroke="hsl(43, 80%, 55%)"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        <motion.line
          x1="50%" y1="15%" x2="75%" y2="75%"
          stroke="hsl(43, 80%, 55%)"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
        />
        <motion.line
          x1="25%" y1="75%" x2="75%" y2="75%"
          stroke="hsl(43, 80%, 55%)"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
        />
        {/* Inner triangle */}
        <motion.line
          x1="50%" y1="55%" x2="37%" y2="35%"
          stroke="hsl(43, 80%, 55%)"
          strokeWidth="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 1.5, ease: "easeInOut" }}
        />
        <motion.line
          x1="50%" y1="55%" x2="63%" y2="35%"
          stroke="hsl(43, 80%, 55%)"
          strokeWidth="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 2, ease: "easeInOut" }}
        />
        <motion.line
          x1="37%" y1="35%" x2="63%" y2="35%"
          stroke="hsl(43, 80%, 55%)"
          strokeWidth="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 2.5, ease: "easeInOut" }}
        />
      </svg>

      {/* Central mystical eye with layered glow */}
      <motion.div
        className="relative z-10 mb-8"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute -inset-5 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(var(--gold) / 0.06), transparent 60%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        {/* Decorative rotating ring */}
        <motion.div
          className="absolute -inset-3 rounded-full pointer-events-none"
          style={{
            border: "1px dashed hsl(var(--gold) / 0.12)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Main icon container */}
        <motion.div
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, hsl(var(--gold) / 0.12), hsl(var(--gold) / 0.03) 70%, transparent)",
            border: "1px solid hsl(var(--gold) / 0.2)",
          }}
          animate={{
            boxShadow: [
              "0 0 25px hsl(43 80% 55% / 0.1), inset 0 0 15px hsl(43 80% 55% / 0.04)",
              "0 0 50px hsl(43 80% 55% / 0.25), inset 0 0 25px hsl(43 80% 55% / 0.08)",
              "0 0 25px hsl(43 80% 55% / 0.1), inset 0 0 15px hsl(43 80% 55% / 0.04)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Eye className="w-8 h-8 text-gold/80" />
        </motion.div>
      </motion.div>

      {/* Ritual text with AnimatePresence */}
      <div className="relative z-10 h-14 flex items-center justify-center mb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseIndex}
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-lg">{ritualPhases[phaseIndex].icon}</span>
            <p className="font-heading text-base md:text-lg gold-gradient-text text-center">
              {ritualPhases[phaseIndex].text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Elegant divider */}
      <motion.div
        className="relative z-10 flex items-center justify-center gap-3 my-4"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="w-16 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.2))" }} />
        <motion.span
          className="text-gold/30 text-[10px]"
          animate={{ rotate: [0, 180, 360], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          ✦
        </motion.span>
        <div className="w-16 h-px" style={{ background: "linear-gradient(90deg, hsl(var(--gold) / 0.2), transparent)" }} />
      </motion.div>

      {/* User's question echo — elegant card */}
      {question && (
        <motion.div
          className="relative z-10 max-w-sm mx-auto px-6 py-4 rounded-2xl text-center"
          style={{
            background: "linear-gradient(145deg, hsl(var(--gold) / 0.04), hsl(var(--gold) / 0.01))",
            border: "1px solid hsl(var(--gold) / 0.08)",
            boxShadow: "0 0 20px hsl(var(--gold) / 0.03)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {/* Quote marks */}
          <span className="absolute top-2 right-4 text-gold/10 text-2xl font-heading">״</span>
          <span className="absolute bottom-1 left-4 text-gold/10 text-2xl font-heading">״</span>
          <p className="text-foreground/40 font-body text-[13px] leading-[1.8] line-clamp-2 px-3" dir={dir}>
            {question}
          </p>
        </motion.div>
      )}

      {/* Progress indicator — mystical steps */}
      <motion.div
        className="relative z-10 flex items-center gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[0, 1, 2].map((i) => {
          const isActive = i === phaseIndex;
          const isDone = i < phaseIndex;
          return (
            <div key={i} className="flex items-center gap-3">
              <motion.div
                className="relative flex items-center justify-center"
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: isDone
                      ? "hsl(var(--gold) / 0.7)"
                      : isActive
                        ? "hsl(var(--gold) / 0.5)"
                        : "hsl(var(--gold) / 0.1)",
                    boxShadow: isActive
                      ? "0 0 10px hsl(var(--gold) / 0.3)"
                      : isDone
                        ? "0 0 6px hsl(var(--gold) / 0.15)"
                        : "none",
                    transition: "all 0.5s ease",
                  }}
                />
                {isActive && (
                  <motion.div
                    className="absolute -inset-1.5 rounded-full"
                    style={{ border: "1px solid hsl(var(--gold) / 0.2)" }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              {i < 2 && (
                <motion.div
                  className="w-8 h-px"
                  style={{
                    background: isDone
                      ? "hsl(var(--gold) / 0.25)"
                      : "hsl(var(--gold) / 0.06)",
                    transition: "background 0.5s ease",
                  }}
                />
              )}
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default TarotAnalysisRitual;

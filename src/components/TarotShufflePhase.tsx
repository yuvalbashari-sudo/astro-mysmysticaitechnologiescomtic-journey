import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useT } from "@/i18n/LanguageContext";

interface Props {
  onComplete: () => void;
}

const TarotShufflePhase = ({ onComplete }: Props) => {
  const t = useT();
  const [phase, setPhase] = useState<"idle" | "shuffling" | "settling" | "done">("idle");
  const [intensity, setIntensity] = useState(0);

  const handleShuffle = () => {
    setPhase("shuffling");
    setIntensity(1);

    // Intensify at 1.5s
    setTimeout(() => setIntensity(2), 1500);

    // Settle at 3.5s
    setTimeout(() => {
      setPhase("settling");
      setIntensity(0);
    }, 3500);

    // Done at 5s
    setTimeout(() => {
      setPhase("done");
      setTimeout(onComplete, 600);
    }, 5000);
  };

  // Card positions for the deck stack
  const deckCards = 8;
  const isShuffling = phase === "shuffling";
  const isSettling = phase === "settling";
  const isDone = phase === "done";

  return (
    <motion.div
      className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Cosmic background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, hsl(222 35% 12%), hsl(222 45% 4%))" }}
      />

      {/* Energy pulse on shuffle */}
      <AnimatePresence>
        {isShuffling && intensity >= 2 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, hsl(var(--gold) / 0.08), transparent 60%)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Floating particles - more during shuffle */}
      {[...Array(isShuffling ? 30 : 12)].map((_, i) => (
        <motion.div
          key={`sp-${i}-${isShuffling}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 1.5 + Math.random() * (isShuffling ? 3 : 1.5),
            height: 1.5 + Math.random() * (isShuffling ? 3 : 1.5),
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            background: i % 3 === 0
              ? `hsl(var(--gold) / ${isShuffling ? "0.7" : "0.35"})`
              : `hsl(var(--celestial) / ${isShuffling ? "0.4" : "0.2"})`,
          }}
          animate={{
            opacity: [0, isShuffling ? 0.9 : 0.5, 0],
            y: [0, -(20 + Math.random() * (isShuffling ? 60 : 25))],
            x: isShuffling ? [0, (Math.random() - 0.5) * 40] : [0],
          }}
          transition={{
            duration: isShuffling ? 1.5 + Math.random() : 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * (isShuffling ? 0.1 : 0.4),
            ease: "easeOut",
          }}
        />
      ))}

      {/* Title */}
      <motion.h3
        className="relative z-10 font-heading text-xl md:text-2xl gold-gradient-text mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isShuffling ? "הקלפים מתערבבים..." : isSettling || isDone ? "הקלפים מוכנים" : "טקס ערבוב הקלפים"}
      </motion.h3>
      <motion.p
        className="relative z-10 text-foreground/50 font-body text-xs mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {isShuffling
          ? "האנרגיה הקוסמית בוחרת את הקלפים שלכם..."
          : isSettling || isDone
            ? "הקלפים נבחרו עבורכם"
            : "לחצו כדי לערבב את הקלפים ולהתחיל את הטקס"}
      </motion.p>

      {/* Card deck area */}
      <div className="relative z-10 w-48 h-64 flex items-center justify-center mb-10">
        {/* Deck glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(var(--gold) / 0.1), transparent)",
          }}
          animate={{
            opacity: isShuffling ? [0.3, 0.8, 0.3] : [0.2, 0.4, 0.2],
            scale: isShuffling ? [1, 1.2, 1] : [1, 1.05, 1],
          }}
          transition={{ duration: isShuffling ? 0.8 : 2.5, repeat: Infinity }}
        />

        {/* Deck cards */}
        {[...Array(deckCards)].map((_, i) => {
          const isTop = i === deckCards - 1;
          // During shuffle: cards fan out in a circle
          const shuffleAngle = isShuffling
            ? (i / deckCards) * 360 + (intensity >= 2 ? i * 15 : i * 8)
            : 0;
          const shuffleRadius = isShuffling ? (intensity >= 2 ? 90 : 60) : 0;
          const shuffleX = isShuffling
            ? Math.cos((shuffleAngle * Math.PI) / 180) * shuffleRadius
            : 0;
          const shuffleY = isShuffling
            ? Math.sin((shuffleAngle * Math.PI) / 180) * shuffleRadius
            : 0;
          const shuffleRotate = isShuffling
            ? shuffleAngle + (intensity >= 2 ? 720 : 180)
            : (i - deckCards / 2) * 1.5;

          return (
            <motion.div
              key={`deck-${i}`}
              className="absolute rounded-lg"
              style={{
                width: 80,
                height: 120,
                background: `linear-gradient(135deg, hsl(var(--gold) / ${0.08 + i * 0.02}), hsl(222 40% ${10 + i}%))`,
                border: `1px solid hsl(var(--gold) / ${isTop ? 0.4 : 0.12 + i * 0.02})`,
                boxShadow: isTop
                  ? "0 4px 20px hsl(var(--gold) / 0.15)"
                  : `0 ${1 + i * 0.5}px ${2 + i}px hsl(222 40% 4% / 0.5)`,
                zIndex: i,
              }}
              animate={
                isShuffling
                  ? {
                      x: shuffleX,
                      y: shuffleY,
                      rotate: shuffleRotate,
                      scale: intensity >= 2 ? [1, 1.05, 1] : 1,
                    }
                  : isSettling || isDone
                    ? {
                        x: 0,
                        y: -i * 2,
                        rotate: 0,
                        scale: 1,
                      }
                    : {
                        y: [-i * 2, -i * 2 - 3, -i * 2],
                        rotate: (i - deckCards / 2) * 1.5,
                      }
              }
              transition={
                isShuffling
                  ? {
                      duration: intensity >= 2 ? 0.6 : 1,
                      repeat: intensity >= 2 ? Infinity : 0,
                      repeatType: "reverse" as const,
                      ease: "easeInOut",
                      delay: i * 0.05,
                    }
                  : isSettling
                    ? { duration: 0.8, ease: "easeOut", delay: i * 0.05 }
                    : { duration: 2.5, repeat: Infinity, delay: i * 0.1 }
              }
            >
              {/* Card back pattern */}
              <div
                className="absolute inset-1 rounded opacity-30"
                style={{
                  background: `repeating-conic-gradient(hsl(var(--gold) / 0.15) 0% 25%, transparent 0% 50%) 50% / 12px 12px`,
                }}
              />
              {/* Center symbol */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg opacity-20">✦</span>
              </div>
            </motion.div>
          );
        })}

        {/* Swirling ring during intense shuffle */}
        <AnimatePresence>
          {isShuffling && intensity >= 2 && (
            <motion.div
              className="absolute w-56 h-56 rounded-full pointer-events-none"
              style={{
                border: "1px solid hsl(var(--gold) / 0.2)",
                boxShadow: "0 0 30px hsl(var(--gold) / 0.1), inset 0 0 30px hsl(var(--gold) / 0.05)",
              }}
              initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.8, 1.1, 0.8], rotate: 360 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* CTA Button */}
      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.button
            key="shuffle-btn"
            onClick={handleShuffle}
            className="relative z-10 btn-gold font-heading flex items-center justify-center gap-2 mx-auto px-10 py-3.5 rounded-xl text-sm tracking-wider"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.04, boxShadow: "0 0 40px hsl(43 80% 55% / 0.4)" }}
            whileTap={{ scale: 0.97 }}
          >
            <Sparkles className="w-4 h-4" />
            שקשקו את הקלפים
          </motion.button>
        )}
        {isShuffling && (
          <motion.div
            key="shuffling-status"
            className="relative z-10 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-gold/70" />
            <span className="font-body text-xs text-gold/60">הקלפים מתערבבים...</span>
          </motion.div>
        )}
        {(isSettling || isDone) && (
          <motion.p
            key="settling-status"
            className="relative z-10 font-body text-xs text-gold/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            ✦ הקלפים מוכנים עבורכם ✦
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TarotShufflePhase;

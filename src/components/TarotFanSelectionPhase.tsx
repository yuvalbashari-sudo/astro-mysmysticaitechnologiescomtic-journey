import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cardBack } from "@/data/tarotCardImages";
import { drawReadingCards, type ReadingCard } from "@/data/allTarotCards";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  cardCount: number;
  onComplete: (cards: ReadingCard[]) => void;
}

const POOL_SIZE = 15;

const TarotFanSelectionPhase = ({ cardCount, onComplete }: Props) => {
  const t = useT();
  const { language } = useLanguage();
  const isMobile = useIsMobile();

  const [pool] = useState<ReadingCard[]>(() => drawReadingCards(POOL_SIZE));
  const [selected, setSelected] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const handleSelect = useCallback(
    (idx: number) => {
      if (done || selected.includes(idx)) return;
      const next = [...selected, idx];
      setSelected(next);
      if (next.length >= cardCount) {
        setDone(true);
        setTimeout(() => {
          onComplete(next.map((i) => pool[i]));
        }, 1200);
      }
    },
    [selected, done, cardCount, onComplete, pool],
  );

  const totalCards = POOL_SIZE;
  const arcDeg = isMobile ? 60 : 80;
  const pivotR = isMobile ? 340 : 480;
  const cardW = isMobile ? 52 : 80;
  const cardH = isMobile ? 80 : 124;
  const containerH = isMobile ? 300 : 400;

  // Revealed cards shown above the fan
  const revealedCards = selected.map((i) => pool[i]);

  return (
    <motion.div
      className="p-4 md:p-10 flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, hsl(222 35% 12%), hsl(222 45% 4%))" }}
      />

      {/* Floating particles */}
      {[...Array(isMobile ? 8 : 16)].map((_, i) => (
        <motion.div
          key={`fp-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 1.5 + Math.random() * 2,
            height: 1.5 + Math.random() * 2,
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            background: i % 3 === 0 ? "hsl(var(--gold) / 0.5)" : "hsl(var(--celestial) / 0.25)",
          }}
          animate={{ opacity: [0, 0.6, 0], y: [0, -(15 + Math.random() * 25)] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      {/* Title */}
      <motion.h3
        className="relative z-10 font-heading text-lg md:text-xl gold-gradient-text mb-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {t.tarot_fan_title || "Choose your cards"}
      </motion.h3>
      <motion.p
        className="relative z-10 text-foreground/50 font-body text-xs mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        {(t.tarot_fan_hint || "Select {n} cards from the spread").replace("{n}", String(cardCount))}
      </motion.p>

      {/* Revealed cards row — shows face-up cards as they're selected */}
      <div className="relative z-20 flex items-center justify-center gap-3 mb-4 min-h-[100px] md:min-h-[140px]">
        <AnimatePresence>
          {revealedCards.map((card, i) => (
            <motion.div
              key={`revealed-${selected[i]}`}
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  width: isMobile ? 56 : 80,
                  height: isMobile ? 84 : 120,
                  border: "1.5px solid hsl(var(--gold) / 0.4)",
                  boxShadow: "0 0 20px hsl(var(--gold) / 0.2), 0 8px 24px hsl(0 0% 0% / 0.5)",
                }}
              >
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.name[language] || card.name.en}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center gap-1"
                    style={{
                      background: "linear-gradient(145deg, hsl(222 30% 16%), hsl(222 40% 10%))",
                    }}
                  >
                    <span className="text-2xl">{card.symbol}</span>
                    <span className="text-[9px] font-heading text-gold/80 text-center px-1 leading-tight">
                      {card.name[language] || card.name.en}
                    </span>
                  </div>
                )}
              </div>
              <motion.span
                className="font-heading text-[10px] md:text-xs text-gold/80 mt-1.5 text-center max-w-[70px] leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {card.name[language] || card.name.en}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Selection counter */}
      <motion.div
        className="relative z-10 flex items-center gap-2 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {Array.from({ length: cardCount }).map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              background: i < selected.length
                ? "hsl(var(--gold) / 0.8)"
                : "hsl(var(--gold) / 0.15)",
              boxShadow: i < selected.length
                ? "0 0 8px hsl(var(--gold) / 0.4)"
                : "none",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </motion.div>

      {/* Fan of cards */}
      <div className="relative z-10 mx-auto" style={{ height: containerH, width: "100%", maxWidth: isMobile ? 360 : 600 }}>
        {/* Emergence glow */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            bottom: isMobile ? -20 : -30,
            width: isMobile ? 260 : 420,
            height: isMobile ? 60 : 90,
            background: "radial-gradient(ellipse, hsl(var(--gold) / 0.1) 0%, hsl(var(--gold) / 0.03) 40%, transparent 70%)",
            filter: "blur(12px)",
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {pool.slice(0, totalCards).map((_, idx) => {
          const step = arcDeg / (totalCards - 1);
          const angle = -arcDeg / 2 + idx * step;
          const rad = (angle * Math.PI) / 180;
          const tx = Math.sin(rad) * pivotR;
          const ty = -Math.cos(rad) * pivotR + pivotR * 0.72;
          const isSelected = selected.includes(idx);

          return (
            <motion.button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={done || isSelected}
              className="absolute group"
              style={{
                width: cardW,
                height: cardH,
                left: "50%",
                bottom: 0,
                marginLeft: -cardW / 2,
                transformOrigin: `50% ${pivotR + cardH / 2}px`,
                zIndex: isSelected ? 30 : 10 + idx,
                cursor: done || isSelected ? "default" : "pointer",
              }}
              initial={{ opacity: 0, y: 120, rotate: 0, scale: 0.5 }}
              animate={{
                opacity: isSelected ? 0.3 : 1,
                y: isSelected ? -20 : 0,
                x: tx,
                rotate: angle,
                scale: isSelected ? 0.85 : 1,
                translateY: ty,
              }}
              transition={
                isSelected
                  ? { duration: 0.4, ease: "easeOut" }
                  : { delay: 0.3 + idx * 0.06, type: "spring", stiffness: 80, damping: 14 }
              }
              whileHover={
                !isSelected && !done
                  ? { translateY: ty - (isMobile ? 18 : 32), scale: 1.08, zIndex: 50, transition: { duration: 0.2 } }
                  : {}
              }
              whileTap={!isSelected && !done ? { scale: 0.95 } : {}}
            >
              <div
                className="relative w-full h-full rounded-[4px] md:rounded-[6px] overflow-hidden"
                style={{
                  boxShadow: isSelected
                    ? "0 0 20px hsl(var(--gold) / 0.3), 0 4px 15px rgba(0,0,0,0.5)"
                    : "0 4px 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)",
                }}
              >
                <img
                  src={cardBack}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: isSelected ? "brightness(1.2) saturate(1.2)" : "brightness(0.8) saturate(0.9)" }}
                  draggable={false}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.35) 100%)" }}
                />
                {/* Shimmer */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(105deg, transparent 35%, hsl(var(--gold) / 0.1) 45%, hsl(var(--gold) / 0.18) 50%, hsl(var(--gold) / 0.1) 55%, transparent 65%)",
                      backgroundSize: "250% 100%",
                      animation: `shimmer-sweep ${3 + idx * 0.3}s ease-in-out infinite`,
                    }}
                  />
                </div>
                {/* Gold border inset */}
                <div
                  className="absolute inset-[2px] rounded-[3px]"
                  style={{ border: "1px solid hsl(var(--gold) / 0.18)" }}
                />
                {/* Center symbol */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-sm md:text-base opacity-40 group-hover:opacity-70 transition-opacity"
                    style={{ color: "hsl(var(--gold-light))", filter: "drop-shadow(0 0 4px hsl(var(--gold) / 0.2))" }}
                  >
                    ✦
                  </span>
                </div>
                {/* Selection glow */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-[4px] pointer-events-none"
                    style={{ boxShadow: "inset 0 0 15px hsl(var(--gold) / 0.25), 0 0 25px hsl(var(--gold) / 0.2)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-[4px] md:rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ boxShadow: "inset 0 0 10px hsl(var(--gold) / 0.08), 0 0 15px hsl(var(--gold) / 0.12)" }}
                />
              </div>

              {/* Selection spark */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className="absolute -inset-3 pointer-events-none"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.3), transparent 60%)" }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Done message */}
      <AnimatePresence>
        {done && (
          <motion.div
            className="relative z-10 flex items-center gap-2 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Sparkles className="w-4 h-4 text-gold/70" />
            <span className="font-body text-xs text-gold/60">{t.tarot_fan_done || "Your cards have been chosen..."}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TarotFanSelectionPhase;

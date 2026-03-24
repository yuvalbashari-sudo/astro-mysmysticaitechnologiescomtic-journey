import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Sparkles, Star } from "lucide-react";
import { majorArcana, type TarotWorldCard } from "@/data/tarotWorldData";
import { tarotCardImages, cardBack } from "@/data/tarotCardImages";
import { useT } from "@/i18n/LanguageContext";
import { useCardName } from "@/hooks/useCardName";
import AstrologerAvatarButton from "./AstrologerAvatarButton";

const DAILY_CARD_KEY = "astrologai_daily_card";
const DAILY_USER_SEED_KEY = "astrologai_user_seed";

function getUserSeed(): string {
  let seed = localStorage.getItem(DAILY_USER_SEED_KEY);
  if (!seed) {
    seed = crypto.randomUUID();
    localStorage.setItem(DAILY_USER_SEED_KEY, seed);
  }
  return seed;
}

function hashToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getDailyCardIndex(total: number): number {
  return hashToNumber(`${getUserSeed()}-${getTodayDate()}`) % total;
}

function getSavedDailyCard(): { card: TarotWorldCard; date: string } | null {
  try {
    const raw = localStorage.getItem(DAILY_CARD_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.date !== getTodayDate()) {
      localStorage.removeItem(DAILY_CARD_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

interface Props {
  isMobile: boolean;
  onOpenFullReading: () => void;
  onAvatarClick: () => void;
}

const InlineDailyCard = ({ isMobile, onOpenFullReading, onAvatarClick }: Props) => {
  const t = useT();
  const cardName = useCardName();
  const [card, setCard] = useState<TarotWorldCard | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const saved = getSavedDailyCard();
    if (saved) {
      setCard(saved.card);
      setDrawn(true);
      setFlipped(true);
    }
  }, []);

  const handleDraw = useCallback(() => {
    if (drawn) return; // already drawn, don't re-draw
    const idx = getDailyCardIndex(majorArcana.length);
    const selectedCard = majorArcana[idx];
    setCard(selectedCard);
    setDrawn(true);
    setTimeout(() => setFlipped(true), 600);
  }, [drawn]);

  const cardImage = card ? tarotCardImages[card.name] : null;

  // ── COLLAPSED STATE: compact bar to draw the card ──
  if (!flipped) {
    const cardW = isMobile ? 48 : 64;
    const cardH = cardW * 1.5;

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.8 }}
        className="relative rounded-2xl backdrop-blur-xl pointer-events-auto cursor-pointer"
        style={{
          padding: isMobile ? "8px 12px" : "12px 18px",
          background: "linear-gradient(145deg, hsl(var(--deep-blue-light) / 0.82), hsl(var(--deep-blue) / 0.88))",
          border: "1px solid hsl(var(--gold) / 0.18)",
          boxShadow: "0 4px 24px hsl(var(--deep-blue) / 0.5), 0 0 20px hsl(var(--gold) / 0.06)",
        }}
        onClick={handleDraw}
        whileHover={{
          scale: 1.03,
          boxShadow: "0 4px 30px hsl(var(--deep-blue) / 0.5), 0 0 30px hsl(var(--gold) / 0.12)",
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          {/* Card back thumbnail */}
          <div
            className="relative flex-shrink-0 rounded-lg overflow-hidden"
            style={{
              width: cardW,
              height: cardH,
              border: "1px solid hsl(var(--gold) / 0.25)",
              boxShadow: "0 2px 10px hsl(var(--deep-blue) / 0.4)",
            }}
          >
            <img src={cardBack} alt="" className="w-full h-full object-cover" />
          </div>

          {/* Text */}
          <div className="flex flex-col items-start gap-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <Sun
                className="flex-shrink-0"
                style={{
                  width: isMobile ? 12 : 14,
                  height: isMobile ? 12 : 14,
                  color: "hsl(var(--gold))",
                }}
              />
              <span
                className="font-heading tracking-wider"
                style={{ color: "hsl(var(--gold))", fontSize: isMobile ? 11 : 13 }}
              >
                {t.daily_title}
              </span>
            </div>
            <span
              className="font-body"
              style={{ color: "hsl(var(--foreground) / 0.6)", fontSize: isMobile ? 10 : 11 }}
            >
              {t.daily_cta}
            </span>
            <motion.div
              className="flex items-center gap-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles style={{ width: 10, height: 10, color: "hsl(var(--gold) / 0.4)" }} />
              <span className="font-body" style={{ color: "hsl(var(--gold) / 0.4)", fontSize: 9 }}>
                {t.daily_note}
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── EXPANDED STATE: compact vertical card with meaning ──
  if (!card) return null;

  const expandedCardW = isMobile ? 100 : 130;
  const expandedCardH = expandedCardW * 1.5;
  const avatarSize = isMobile ? 36 : 42;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl backdrop-blur-xl pointer-events-auto"
      style={{
        padding: isMobile ? "14px 16px 14px 16px" : "18px 22px 18px 22px",
        maxWidth: isMobile ? 260 : 300,
        width: "auto",
        background: "linear-gradient(145deg, hsl(var(--deep-blue-light) / 0.85), hsl(var(--deep-blue) / 0.92))",
        border: "1px solid hsl(var(--gold) / 0.2)",
        boxShadow: "0 8px 40px hsl(var(--deep-blue) / 0.6), 0 0 30px hsl(var(--gold) / 0.06)",
      }}
    >
      {/* Title */}
      <div className="flex items-center gap-1.5 mb-2">
        <Sun
          className="flex-shrink-0"
          style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14, color: "hsl(var(--gold))" }}
        />
        <span
          className="font-heading tracking-wider"
          style={{ color: "hsl(var(--gold))", fontSize: isMobile ? 11 : 12 }}
        >
          {t.daily_title}
        </span>
      </div>

      {/* Card + name stack */}
      <div className="flex flex-col items-center">
        {/* Revealed card */}
        <motion.div
          className="relative rounded-xl overflow-hidden"
          style={{
            width: expandedCardW,
            height: expandedCardH,
            border: "2px solid hsl(var(--gold) / 0.3)",
            boxShadow: "0 0 20px hsl(var(--gold) / 0.12), 0 8px 30px hsl(var(--deep-blue) / 0.5)",
          }}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {cardImage ? (
            <img
              src={cardImage}
              alt={cardName(card.name, card.hebrewName)}
              className="w-full h-full object-contain"
              style={{ background: "hsl(var(--deep-blue))" }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "hsl(var(--deep-blue))" }}
            >
              <span className="text-3xl">{card.symbol}</span>
            </div>
          )}
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 30%, hsl(var(--gold) / 0.15) 50%, transparent 70%)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
          />
          {/* Glow ring */}
          <motion.div
            className="absolute -inset-px rounded-xl pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 8px hsl(var(--gold) / 0.1)",
                "0 0 18px hsl(var(--gold) / 0.2)",
                "0 0 8px hsl(var(--gold) / 0.1)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Card name */}
        <motion.h3
          className="font-heading gold-gradient-text text-center mt-2"
          style={{ fontSize: isMobile ? 15 : 18 }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {card.symbol} {cardName(card.name, card.hebrewName)}
        </motion.h3>

        {/* Short meaning */}
        <motion.p
          className="font-body text-center mt-1 leading-snug"
          style={{
            color: "hsl(var(--foreground) / 0.55)",
            fontSize: isMobile ? 10 : 11,
            maxWidth: isMobile ? 200 : 240,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {card.meanings.daily}
        </motion.p>

        {/* CTA button */}
        <motion.button
          className="mt-3 flex items-center gap-1.5 rounded-full font-body cursor-pointer"
          style={{
            padding: isMobile ? "6px 14px" : "7px 18px",
            fontSize: isMobile ? 11 : 12,
            background: "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.08))",
            border: "1px solid hsl(var(--gold) / 0.3)",
            color: "hsl(var(--gold))",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onOpenFullReading();
          }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 16px hsl(var(--gold) / 0.15)" }}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Star style={{ width: 12, height: 12 }} />
          {t.hero_open_full_reading}
        </motion.button>
      </div>

      <AstrologerAvatarButton
        size={avatarSize}
        onClick={onAvatarClick}
        style={{
          bottom: isMobile ? -14 : -16,
          right: isMobile ? -10 : -14,
        }}
      />
    </motion.div>
  );
};

export default InlineDailyCard;

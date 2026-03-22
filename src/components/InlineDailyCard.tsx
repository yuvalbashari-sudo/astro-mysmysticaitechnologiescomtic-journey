import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Sparkles } from "lucide-react";
import { majorArcana, type TarotWorldCard } from "@/data/tarotWorldData";
import { tarotCardImages, cardBack } from "@/data/tarotCardImages";
import { useT } from "@/i18n/LanguageContext";

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
}

const InlineDailyCard = ({ isMobile, onOpenFullReading }: Props) => {
  const t = useT();
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
    if (drawn) {
      onOpenFullReading();
      return;
    }
    const idx = getDailyCardIndex(majorArcana.length);
    const selectedCard = majorArcana[idx];
    setCard(selectedCard);
    setDrawn(true);
    setTimeout(() => setFlipped(true), 600);
  }, [drawn, onOpenFullReading]);

  const cardImage = card ? tarotCardImages[card.name] : null;
  const cardW = isMobile ? 48 : 64;
  const cardH = cardW * 1.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3, duration: 0.8 }}
      className="flex items-center gap-3 rounded-2xl backdrop-blur-xl pointer-events-auto cursor-pointer"
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
      {/* Card thumbnail with flip */}
      <div
        className="relative flex-shrink-0"
        style={{ width: cardW, height: cardH, perspective: 600 }}
      >
        <motion.div
          style={{
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
          }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Back face */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              border: "1px solid hsl(var(--gold) / 0.25)",
              boxShadow: "0 2px 10px hsl(var(--deep-blue) / 0.4)",
            }}
          >
            <img src={cardBack} alt="" className="w-full h-full object-cover" />
          </div>
          {/* Front face */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              border: "1px solid hsl(var(--gold) / 0.3)",
              boxShadow: "0 0 15px hsl(var(--gold) / 0.15)",
            }}
          >
            {cardImage && (
              <img
                src={cardImage}
                alt={card?.hebrewName || ""}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </motion.div>

        {/* Glow after flip */}
        {flipped && (
          <motion.div
            className="absolute -inset-1 rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.4, 0.15],
              boxShadow: [
                "0 0 10px hsl(var(--gold) / 0.1)",
                "0 0 25px hsl(var(--gold) / 0.25)",
                "0 0 10px hsl(var(--gold) / 0.1)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent 70%)",
            }}
          />
        )}
      </div>

      {/* Text content */}
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
            style={{
              color: "hsl(var(--gold))",
              fontSize: isMobile ? 11 : 13,
            }}
          >
            {t.daily_title}
          </span>
        </div>

        {flipped && card ? (
          <>
            <span
              className="font-heading"
              style={{
                color: "hsl(var(--gold-light))",
                fontSize: isMobile ? 13 : 15,
                textShadow: "0 0 12px hsl(var(--gold) / 0.2)",
              }}
            >
              {card.symbol} {card.hebrewName}
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="font-body"
              style={{
                color: "hsl(var(--gold) / 0.55)",
                fontSize: isMobile ? 9 : 10,
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              {t.hero_open_full_reading} ✦
            </motion.span>
          </>
        ) : (
          <>
            <span
              className="font-body"
              style={{
                color: "hsl(var(--foreground) / 0.6)",
                fontSize: isMobile ? 10 : 11,
              }}
            >
              {t.daily_cta}
            </span>
            <motion.div
              className="flex items-center gap-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles
                style={{
                  width: 10,
                  height: 10,
                  color: "hsl(var(--gold) / 0.4)",
                }}
              />
              <span
                className="font-body"
                style={{
                  color: "hsl(var(--gold) / 0.4)",
                  fontSize: 9,
                }}
              >
                {t.daily_note}
              </span>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default InlineDailyCard;

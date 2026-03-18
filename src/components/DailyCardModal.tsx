import { useState, useEffect, useRef, useCallback } from "react";
import TextSizeControl, { type TextSize } from "@/components/TextSizeControl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Sun, Lock, Share2, Copy, Check, Loader2, Clock, Crown } from "lucide-react";
import { majorArcana, type TarotWorldCard } from "@/data/tarotWorldData";
import { tarotCardImages, cardBack } from "@/data/tarotCardImages";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";
import { mysticalProfile } from "@/lib/mysticalProfile";
import ShareResultSection from "@/components/ShareResultSection";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useReadingContext } from "@/contexts/ReadingContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DAILY_CARD_KEY = "astrologai_daily_card";
const DAILY_USER_SEED_KEY = "astrologai_user_seed";
const VIDEO_DURATION_MS = 15000; // fallback duration estimate
const CARD_REVEAL_BEFORE_END_MS = 1500; // reveal card 1-1.5s before video ends

interface DailyCardData {
  card: TarotWorldCard;
  date: string;
  aiText?: string;
}

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
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getSavedDailyCard(): DailyCardData | null {
  try {
    const raw = localStorage.getItem(DAILY_CARD_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as DailyCardData;
    if (data.date !== getTodayDate()) {
      localStorage.removeItem(DAILY_CARD_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveDailyCard(data: DailyCardData) {
  localStorage.setItem(DAILY_CARD_KEY, JSON.stringify(data));
}

function getDailyCardIndex(totalCards: number): number {
  const seed = getUserSeed();
  const date = getTodayDate();
  const hash = hashToNumber(`${seed}-${date}`);
  return hash % totalCards;
}

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const remaining = midnight.getTime() - now.getTime();
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours} שעות ו-${minutes} דקות`;
}

const Particles = React.memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 15 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: Math.random() * 3 + 1,
          height: Math.random() * 3 + 1,
          background: `hsl(var(--gold) / ${Math.random() * 0.4 + 0.1})`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30 - Math.random() * 40, 0],
          opacity: [0.2, 0.8, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 3 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 3,
        }}
      />
    ))}
  </div>
));

type Phase = "ready" | "video" | "result" | "locked";

const DailyCardModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language } = useLanguage();
  const { setActiveReading } = useReadingContext();
  const [phase, setPhase] = useState<Phase>("ready");
  const [card, setCard] = useState<TarotWorldCard | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [textSize, setTextSize] = useState<TextSize>("default");
  const [showCardOverlay, setShowCardOverlay] = useState(false);

  // Check for existing daily card on open
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedDailyCard();
      if (saved) {
        setCard(saved.card);
        setTimeLeft(getTimeUntilMidnight());
        if (saved.aiText) {
          setAiText(saved.aiText);
          aiTextRef.current = saved.aiText;
          setPhase("locked");
        } else {
          setPhase("locked");
        }
      } else {
        setPhase("ready");
      }
    }
  }, [isOpen]);

  // Countdown timer for locked state
  useEffect(() => {
    if (phase !== "locked") return;
    const saved = getSavedDailyCard();
    if (!saved) return;
    const interval = setInterval(() => {
      const remaining = getTimeUntilMidnight();
      setTimeLeft(remaining);
      if (saved.date !== getTodayDate()) {
        localStorage.removeItem(DAILY_CARD_KEY);
        setPhase("ready");
        setCard(null);
        setAiText("");
        aiTextRef.current = "";
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleDraw = useCallback(() => {
    const saved = getSavedDailyCard();
    if (saved) {
      setCard(saved.card);
      setTimeLeft(getTimeUntilMidnight());
      if (saved.aiText) {
        setAiText(saved.aiText);
        aiTextRef.current = saved.aiText;
      }
      setPhase("locked");
      toast(t.daily_already_drawn);
      return;
    }

    // Select card deterministically
    const cardIndex = getDailyCardIndex(majorArcana.length);
    const selectedCard = majorArcana[cardIndex];
    setCard(selectedCard);
    setShowCardOverlay(false);
    setPhase("video");
  }, [t.daily_already_drawn]);

  // Fallback timer for video phase in case events don't fire
  useEffect(() => {
    if (phase !== "video" || !card) return;
    const fallback = setTimeout(() => {
      setShowCardOverlay(true);
      setTimeout(() => {
        setPhase("result");
        startAiReading(card);
      }, 2500);
    }, VIDEO_DURATION_MS + 2000);
    return () => clearTimeout(fallback);
  }, [phase, card]);

  const startAiReading = (selectedCard: TarotWorldCard) => {
    setAiLoading(true);
    setAiError(null);
    aiTextRef.current = "";

    saveDailyCard({ card: selectedCard, date: getTodayDate() });

    streamMysticalReading(
      "dailyCard",
      {
        cardName: selectedCard.name,
        cardHebrewName: selectedCard.hebrewName,
        cardNumber: selectedCard.number,
        cardSymbol: selectedCard.symbol,
        generalMeaning: selectedCard.meanings.general,
        dailyMeaning: selectedCard.meanings.daily,
        spiritualMeaning: selectedCard.meanings.spiritual,
        advice: selectedCard.meanings.advice,
      },
      (delta) => {
        aiTextRef.current += delta;
        setAiText(aiTextRef.current);
      },
      () => {
        setAiLoading(false);
        setActiveReading({ type: "dailyCard", label: `קלף יומי — ${selectedCard.hebrewName}`, summary: aiTextRef.current });
        const saved = getSavedDailyCard();
        if (saved) {
          saveDailyCard({ ...saved, aiText: aiTextRef.current });
        }
        mysticalProfile.recordDailyCard(selectedCard.hebrewName, selectedCard.symbol);
        readingsStorage.save({
          type: "tarot",
          title: `קלף יומי — ${selectedCard.hebrewName}`,
          subtitle: "הקלף שנבחר עבורכם להיום",
          symbol: selectedCard.symbol,
          data: { card: selectedCard.hebrewName, aiReading: aiTextRef.current },
        });
      },
      (err) => {
        setAiLoading(false);
        setAiError(err);
        toast(err);
      },
      language,
    );
  };

  const handleClose = () => {
    onClose();
    // Pause video if playing
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setTimeout(() => {
      if (phase !== "locked" && phase !== "result") {
        setCard(null);
        setAiText("");
        aiTextRef.current = "";
        setAiLoading(false);
        setAiError(null);
      }
      setShowCardOverlay(false);
      setCopied(false);
    }, 300);
  };

  useEffect(() => {
    if (aiLoading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiText, aiLoading]);

  const handleShare = () => {
    if (!card) return;
    const text = `🔮 ${t.daily_title}: ${card.symbol} ${card.hebrewName}\n\n✨ ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!aiText) return;
    await navigator.clipboard.writeText(`🔮 ${t.daily_title} — ${card?.hebrewName}\n\n${aiText.slice(0, 400)}...`);
    setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000);
  };

  const cardImage = card ? tarotCardImages[card.name] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-background/85 backdrop-blur-xl" onClick={handleClose} />

          <motion.div
            ref={scrollRef}
            className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl"
            style={{
              background: "linear-gradient(160deg, hsl(0 30% 8% / 0.98), hsl(222 47% 6% / 0.99), hsl(0 20% 6% / 0.98))",
              border: "1px solid hsl(var(--gold) / 0.15)",
              boxShadow: "0 0 80px hsl(var(--crimson) / 0.08), 0 0 40px hsl(var(--gold) / 0.06), inset 0 1px 0 hsl(var(--gold) / 0.1)",
            }}
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Particles />

            {/* Video preload removed — using inline video in video phase */}

            <button
              onClick={handleClose}
              className="absolute top-4 left-4 z-30 w-9 h-9 rounded-full flex items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors"
              style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}
            >
              <X className="w-4 h-4 text-gold/70" />
            </button>

            {phase !== "video" && (
              <div className="absolute top-4 right-4 z-20">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-bold font-body tracking-wider"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))",
                    border: "1px solid hsl(var(--gold) / 0.3)",
                    color: "hsl(var(--gold))",
                  }}
                >
                  ✦ חינם
                </span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* PHASE: Ready */}
              {phase === "ready" && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative p-8 md:p-12 text-center"
                >
                  <motion.div
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center relative"
                    style={{
                      background: "radial-gradient(circle, hsl(var(--crimson) / 0.15), hsl(var(--gold) / 0.08), transparent)",
                      border: "1px solid hsl(var(--gold) / 0.2)",
                    }}
                    animate={{
                      boxShadow: [
                        "0 0 20px hsl(var(--gold) / 0.1)",
                        "0 0 50px hsl(var(--gold) / 0.25)",
                        "0 0 20px hsl(var(--gold) / 0.1)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sun className="w-9 h-9 text-gold" />
                  </motion.div>

                  <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-3">{t.daily_title}</h2>
                  <p className="text-foreground/60 font-body text-sm md:text-base max-w-md mx-auto leading-relaxed mb-2">{t.daily_desc}</p>
                  <p className="text-foreground/40 font-body text-xs mb-8">{t.daily_note}</p>

                  <div className="section-divider max-w-[100px] mx-auto mb-8" />

                  <div className="relative w-28 h-40 mx-auto mb-8">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-xl overflow-hidden"
                        style={{
                          border: "1px solid hsl(var(--gold) / 0.2)",
                          boxShadow: "0 4px 20px hsl(0 0% 0% / 0.3)",
                          zIndex: 3 - i,
                        }}
                        animate={{
                          rotate: (i - 1) * 5,
                          x: (i - 1) * 8,
                          y: i * 2,
                        }}
                      >
                        <img src={cardBack} alt="Card" className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    onClick={handleDraw}
                    className="btn-gold font-body flex items-center justify-center gap-2 mx-auto text-base px-8 py-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Sparkles className="w-5 h-5" />
                    {t.daily_cta}
                  </motion.button>
                </motion.div>
              )}

              {/* PHASE: Video ritual */}
              {phase === "video" && card && (
                <motion.div
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative overflow-hidden rounded-2xl"
                  style={{ minHeight: 450 }}
                >
                  {/* Video background — visible */}
                  <video
                    src="/videos/daily-tarot-ritual.mp4"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ minHeight: 450 }}
                    autoPlay
                    playsInline
                    muted
                    ref={videoRef}
                    onTimeUpdate={() => {
                      const v = videoRef.current;
                      if (v && v.duration) {
                        const remaining = (v.duration - v.currentTime) * 1000;
                        if (remaining <= CARD_REVEAL_BEFORE_END_MS) {
                          setShowCardOverlay(true);
                        }
                      }
                    }}
                    onEnded={() => {
                      setTimeout(() => {
                        setPhase("result");
                        if (card) startAiReading(card);
                      }, 800);
                    }}
                    onError={() => {
                      // Video failed — go straight to result
                      setPhase("result");
                      if (card) startAiReading(card);
                    }}
                  />

                  {/* Dark gradient overlay for readability */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(to bottom, transparent 30%, hsl(222 50% 3% / 0.7) 80%, hsl(222 50% 3% / 0.95) 100%)",
                    }}
                  />

                  {/* Card reveal overlay — appears near video end */}
                  <AnimatePresence>
                    {showCardOverlay && (
                      <motion.div
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      >
                        {/* Radial glow behind card */}
                        <motion.div
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            width: 350,
                            height: 350,
                            background: "radial-gradient(circle, hsl(var(--gold) / 0.2), hsl(var(--crimson) / 0.08), transparent)",
                            filter: "blur(50px)",
                          }}
                          initial={{ scale: 0.3, opacity: 0 }}
                          animate={{ scale: 1.4, opacity: 1 }}
                          transition={{ duration: 1.8, ease: "easeOut" }}
                        />

                        {/* The actual daily card */}
                        <motion.div
                          className="relative w-44 h-64 md:w-52 md:h-76 rounded-xl overflow-hidden"
                          style={{
                            border: "2px solid hsl(var(--gold) / 0.5)",
                            boxShadow: "0 0 60px hsl(var(--gold) / 0.25), 0 0 120px hsl(var(--crimson) / 0.12), 0 20px 60px hsl(0 0% 0% / 0.5)",
                          }}
                          initial={{ scale: 0.4, opacity: 0, y: 60, rotateY: -90 }}
                          animate={{ scale: 1, opacity: 1, y: 0, rotateY: 0 }}
                          transition={{
                            duration: 1.5,
                            ease: [0.22, 1, 0.36, 1],
                            opacity: { duration: 0.8 },
                          }}
                        >
                          {cardImage ? (
                            <img src={cardImage} alt={card.hebrewName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(222 30% 12%), hsl(0 20% 10%))" }}>
                              <span className="text-5xl">{card.symbol}</span>
                            </div>
                          )}

                          {/* Shimmer sweep */}
                          <motion.div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: "linear-gradient(105deg, transparent 30%, hsl(var(--gold) / 0.2) 50%, transparent 70%)",
                            }}
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                          />
                        </motion.div>

                        {/* Card name */}
                        <motion.h2
                          className="font-heading text-2xl md:text-3xl gold-gradient-text mt-5 relative z-10"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                        >
                          {card.hebrewName}
                        </motion.h2>
                        <motion.p
                          className="text-foreground/50 font-body text-sm relative z-10 mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                        >
                          {t.daily_card_chosen}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Loading text before card appears */}
                  {!showCardOverlay && (
                    <motion.div
                      className="absolute bottom-8 left-0 right-0 z-10 text-center"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <p className="font-body text-gold/80 text-lg">{t.daily_shuffle}</p>
                      <p className="font-body text-foreground/40 text-xs mt-1">{t.daily_shuffle_focus}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* PHASE: Result (AI interpretation) */}
              {(phase === "result" || phase === "locked") && card && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative p-6 md:p-10"
                >
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-5 mb-4">
                      <motion.div
                        className="relative w-36 h-52 md:w-44 md:h-64 rounded-xl overflow-hidden flex-shrink-0"
                        style={{
                          border: "2px solid hsl(var(--gold) / 0.3)",
                          boxShadow: "0 0 30px hsl(var(--gold) / 0.12), 0 8px 30px hsl(0 0% 0% / 0.3)",
                        }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        {cardImage ? (
                          <img src={cardImage} alt={card.hebrewName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(222 30% 12%), hsl(0 20% 10%))" }}>
                            <span className="text-4xl">{card.symbol}</span>
                          </div>
                        )}
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: "linear-gradient(105deg, transparent 30%, hsl(var(--gold) / 0.12) 50%, transparent 70%)",
                          }}
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                        />
                      </motion.div>
                    </div>

                    <motion.h2
                      className="font-heading text-2xl md:text-3xl gold-gradient-text mb-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {card.hebrewName}
                    </motion.h2>
                    <motion.p
                      className="text-foreground/50 font-body text-sm mb-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {t.daily_arcana_label} {card.number}
                    </motion.p>

                    {phase === "locked" && (
                      <motion.div
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full"
                        style={{
                          background: "hsl(var(--gold) / 0.06)",
                          border: "1px solid hsl(var(--gold) / 0.12)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Clock className="w-3.5 h-3.5 text-gold/60" />
                        <span className="font-body text-xs text-gold/70">
                          {t.daily_next_card} {timeLeft}
                        </span>
                      </motion.div>
                    )}

                    <motion.div className="section-divider max-w-[120px] mx-auto mt-4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }} />

                    <motion.div
                      className="flex items-center justify-center gap-3 mt-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                        <Share2 className="w-3.5 h-3.5" />{t.forecast_share}
                      </motion.button>
                      <motion.button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? t.share_copied : t.share_copy}
                      </motion.button>
                    </motion.div>
                  </div>

                  {aiText ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex justify-end mb-6"><TextSizeControl value={textSize} onChange={setTextSize} /></div>
                      {renderMysticalText(aiText, textSize)}
                      {aiLoading && (
                        <motion.div
                          className="flex items-center justify-center gap-2 mt-6"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Loader2 className="w-4 h-4 text-gold/60 animate-spin" />
                          <span className="font-body text-xs text-gold/50">{t.daily_loading}</span>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : aiError ? (
                    <div
                      className="text-center rounded-xl p-4"
                      style={{
                        background: "hsl(var(--crimson) / 0.08)",
                        border: "1px solid hsl(var(--crimson) / 0.15)",
                      }}
                    >
                      <p className="text-foreground/50 font-body text-xs">{aiError}</p>
                    </div>
                  ) : aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <motion.div
                        className="w-16 h-16 rounded-full mb-6"
                        style={{
                          background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)",
                          border: "1px solid hsl(var(--gold) / 0.2)",
                        }}
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <motion.p
                        className="font-body text-gold/70 text-sm"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {t.daily_loading}
                      </motion.p>
                    </div>
                  ) : null}

                  {!aiLoading && (aiText || aiError) && (
                    <>
                      <ShareResultSection
                        symbol={card.symbol}
                        title={`קלף יומי — ${card.hebrewName}`}
                        subtitle="הקלף שנבחר עבורכם להיום"
                      />
                      <div className="section-divider max-w-[200px] mx-auto my-8" />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="text-center rounded-xl p-6"
                        style={{
                          background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))",
                          border: "1px solid hsl(var(--gold) / 0.12)",
                        }}
                      >
                        <Crown className="w-6 h-6 text-gold mx-auto mb-3" />
                        <h4 className="font-heading text-base text-gold mb-2">{t.daily_premium_title}</h4>
                        <p className="text-foreground/60 font-body text-xs mb-4 max-w-sm mx-auto leading-relaxed">{t.daily_premium_desc}</p>
                        <button onClick={handleClose} className="btn-gold font-body text-xs inline-flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" />{t.daily_premium_cta}
                        </button>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyCardModal;

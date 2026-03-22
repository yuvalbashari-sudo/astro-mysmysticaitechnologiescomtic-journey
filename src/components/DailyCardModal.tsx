import React, { useState, useEffect, useRef, useCallback } from "react";
import CinematicModalShell from "@/components/CinematicModalShell";
import AstrologerIntroModal from "@/components/AstrologerIntroModal";
import AstrologerAvatarButton from "@/components/AstrologerAvatarButton";
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
const RITUAL_DURATION_MS = 5500; // duration of the card awakening ritual

interface DailyCardData {
  card: TarotWorldCard;
  date: string;
  aiText?: string;
  language?: string;
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

function getTimeUntilMidnight(format: string): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const remaining = midnight.getTime() - now.getTime();
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  return format.replace("{hours}", String(hours)).replace("{minutes}", String(minutes));
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

type Phase = "ready" | "ritual" | "result" | "locked";

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
  const [ritualStep, setRitualStep] = useState(0);
  const [textSize, setTextSize] = useState<TextSize>("default");
  const [showCardOverlay, setShowCardOverlay] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [astrologerOpen, setAstrologerOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Check for existing daily card on open — also re-check when language changes
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedDailyCard();
      if (saved) {
        setCard(saved.card);
        setTimeLeft(getTimeUntilMidnight(t.daily_time_format));
        if (saved.aiText && saved.language === language) {
          setAiText(saved.aiText);
          aiTextRef.current = saved.aiText;
          setPhase("locked");
        } else if (saved.aiText && saved.language !== language) {
          // Language changed — re-generate AI text
          setPhase("result");
          startAiReading(saved.card);
        } else {
          setPhase("locked");
        }
      } else {
        setPhase("ready");
      }
    }
  }, [isOpen, language]);

  // Countdown timer for locked state
  useEffect(() => {
    if (phase !== "locked") return;
    const saved = getSavedDailyCard();
    if (!saved) return;
    const interval = setInterval(() => {
      const remaining = getTimeUntilMidnight(t.daily_time_format);
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
      setTimeLeft(getTimeUntilMidnight(t.daily_time_format));
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
    setRitualStep(0);
    setPhase("ritual");
  }, [t.daily_already_drawn]);

  // Ritual animation sequence (no video)
  useEffect(() => {
    if (phase !== "ritual" || !card) return;

    // Step 1: show shuffling text, Step 2: reveal card overlay
    const step1 = setTimeout(() => setRitualStep(1), 800);
    const step2 = setTimeout(() => {
      setShowCardOverlay(true);
      setRitualStep(2);
    }, RITUAL_DURATION_MS - 1500);
    const step3 = setTimeout(() => {
      setPhase("result");
      startAiReading(card);
    }, RITUAL_DURATION_MS + 1000);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  }, [phase, card]);

  const startAiReading = (selectedCard: TarotWorldCard) => {
    setAiLoading(true);
    setAiError(null);
    aiTextRef.current = "";
    setAiText("");

    saveDailyCard({ card: selectedCard, date: getTodayDate(), language });

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
        gender,
      },
      (delta) => {
        aiTextRef.current += delta;
        setAiText(aiTextRef.current);
      },
      () => {
        setAiLoading(false);
        const label = `${t.daily_title} — ${selectedCard.hebrewName}`;
        setActiveReading({ type: "dailyCard", label, summary: aiTextRef.current });
        const saved = getSavedDailyCard();
        if (saved) {
          saveDailyCard({ ...saved, aiText: aiTextRef.current, language });
        }
        mysticalProfile.recordDailyCard(selectedCard.hebrewName, selectedCard.symbol);
        readingsStorage.save({
          type: "tarot",
          title: label,
          subtitle: t.daily_card_chosen,
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
    await navigator.clipboard.writeText(`🔮 ${t.daily_title} — ${card?.hebrewName}\n\n${aiText}`);
    setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000);
  };

  const cardImage = card ? tarotCardImages[card.name] : null;

  return (
    <>
      <CinematicModalShell isOpen={isOpen} onClose={handleClose} scrollRef={scrollRef as React.RefObject<HTMLDivElement>} wide hideAdvisor transparent>
            <AnimatePresence mode="wait">
              {/* PHASE: Ready */}
              {phase === "ready" && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex flex-col items-end justify-center text-center min-h-[70vh] px-4"
                  style={{ paddingRight: isMobileViewport ? 4 : 5 }}
                >
                  {/* ── Premium container ── */}
                  <div
                    className="relative z-10 w-full max-w-[840px] rounded-[28px] px-10 py-14 md:px-12 md:py-16 flex flex-col items-center"
                    style={{
                      background: "linear-gradient(175deg, hsl(222 40% 10% / 0.94), hsl(222 45% 6% / 0.97))",
                      border: "1px solid hsl(var(--gold) / 0.1)",
                      boxShadow: `
                        0 24px 80px hsl(0 0% 0% / 0.6),
                        0 8px 32px hsl(0 0% 0% / 0.3),
                        0 0 0 1px hsl(var(--gold) / 0.04),
                        inset 0 1px 0 hsl(var(--gold) / 0.07),
                        inset 0 -1px 0 hsl(222 40% 3% / 0.5)
                      `,
                    }}
                  >
                    {/* Outer glow — very subtle */}
                    <div
                      className="absolute -inset-px rounded-[28px] pointer-events-none"
                      style={{
                        background: "linear-gradient(175deg, hsl(var(--gold) / 0.06), transparent 40%)",
                        borderRadius: "inherit",
                      }}
                    />

                    {/* Icon */}
                    <motion.div
                      className="w-14 h-14 mb-7 rounded-full flex items-center justify-center relative"
                      style={{
                        background: "radial-gradient(circle, hsl(var(--gold) / 0.1), transparent 80%)",
                        border: "1px solid hsl(var(--gold) / 0.15)",
                        boxShadow: "0 0 24px hsl(var(--gold) / 0.08)",
                      }}
                      animate={{
                        boxShadow: [
                          "0 0 20px hsl(var(--gold) / 0.06)",
                          "0 0 30px hsl(var(--gold) / 0.12)",
                          "0 0 20px hsl(var(--gold) / 0.06)",
                        ],
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                    >
                      <Sun className="w-6 h-6 text-gold" />
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      className="font-heading text-[2.6rem] md:text-[3.2rem] leading-tight mb-3"
                      style={{
                        color: "hsl(var(--gold))",
                        textShadow: "0 2px 20px hsl(var(--gold) / 0.2)",
                        fontWeight: 600,
                      }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      {t.daily_title}
                    </motion.h2>

                    {/* Divider */}
                    <motion.div
                      className="flex items-center gap-2.5 mb-5"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="w-12 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.2))" }} />
                      <span className="text-gold/25 text-[9px]">✦</span>
                      <div className="w-12 h-px" style={{ background: "linear-gradient(90deg, hsl(var(--gold) / 0.2), transparent)" }} />
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                      className="text-foreground/60 font-body text-[17px] md:text-[19px] max-w-[560px] leading-[1.7] mb-1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {t.daily_desc}
                    </motion.p>
                    <motion.p
                      className="text-foreground/30 font-body text-[13px] mb-9"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                    >
                      {t.daily_note}
                    </motion.p>

                    {/* Gender Selection */}
                    <motion.div
                      className="w-full max-w-[260px] mb-9"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-[11px] text-gold/45 font-body mb-3 tracking-[0.12em] uppercase">{t.forecast_gender_label}</label>
                      <div className="flex gap-2">
                        {(["male", "female"] as const).map((g) => (
                          <motion.button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className="flex-1 py-3 rounded-xl font-body text-[13px] transition-all duration-200"
                            style={{
                              background: gender === g
                                ? "linear-gradient(145deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.05))"
                                : "hsl(222 40% 12% / 0.6)",
                              border: gender === g
                                ? "1px solid hsl(var(--gold) / 0.35)"
                                : "1px solid hsl(222 30% 20% / 0.5)",
                              color: gender === g
                                ? "hsl(var(--gold))"
                                : "hsl(var(--foreground) / 0.5)",
                              boxShadow: gender === g
                                ? "0 0 12px hsl(var(--gold) / 0.06), inset 0 1px 0 hsl(var(--gold) / 0.08)"
                                : "inset 0 1px 0 hsl(222 30% 18% / 0.3)",
                            }}
                            whileHover={{ scale: 1.03, borderColor: gender === g ? undefined : "hsl(222 30% 25% / 0.6)" }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {g === "male" ? t.forecast_gender_male : t.forecast_gender_female}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Card fan preview */}
                    <motion.div
                      className="relative w-[88px] mx-auto mb-10"
                      style={{ height: 124 }}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35, duration: 0.6 }}
                    >
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-lg overflow-hidden"
                          style={{
                            border: "1px solid hsl(var(--gold) / 0.15)",
                            boxShadow: `0 8px 24px hsl(0 0% 0% / 0.35), 0 0 8px hsl(var(--gold) / ${i === 1 ? 0.06 : 0.02})`,
                            zIndex: 3 - i,
                          }}
                          animate={{
                            rotate: (i - 1) * 5,
                            x: (i - 1) * 8,
                            y: i * 1.5,
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          <img src={cardBack} alt="Card" className="w-full h-full object-cover" />
                        </motion.div>
                      ))}
                      {/* Card glow */}
                      <motion.div
                        className="absolute pointer-events-none"
                        style={{
                          inset: "-20px -16px",
                          background: "radial-gradient(ellipse at 50% 60%, hsl(var(--gold) / 0.06), transparent 65%)",
                          filter: "blur(12px)",
                        }}
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 3.5, repeat: Infinity }}
                      />
                    </motion.div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={handleDraw}
                      className="relative font-body flex items-center justify-center gap-2.5 text-[15px] px-9 py-3.5 rounded-full overflow-hidden font-medium tracking-wide"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                        color: "hsl(var(--primary-foreground))",
                        boxShadow: "0 4px 20px hsl(var(--gold) / 0.2), 0 8px 30px hsl(0 0% 0% / 0.25)",
                        letterSpacing: "0.04em",
                      }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.04, boxShadow: "0 6px 28px hsl(var(--gold) / 0.3), 0 10px 35px hsl(0 0% 0% / 0.3)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Sparkles className="w-4 h-4" />
                      {t.daily_cta}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* PHASE: Ritual (card reveal animation — no video) */}
              {phase === "ritual" && card && (
                <motion.div
                  key="ritual"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative overflow-hidden rounded-2xl flex flex-col items-center justify-center"
                  style={{ minHeight: 450 }}
                >
                  {/* Slow breathing ambient glow — center */}
                  <motion.div
                    className="absolute pointer-events-none"
                    style={{
                      width: "60%", height: "50%",
                      left: "20%", top: "25%",
                      background: "radial-gradient(ellipse 100% 100% at 50% 50%, hsl(var(--gold) / 0.05), hsl(var(--celestial) / 0.03), transparent 70%)",
                      filter: "blur(60px)",
                    }}
                    animate={{ opacity: [0.15, 0.4, 0.15], scale: [0.95, 1.08, 0.95] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Secondary glow — lower, warmer */}
                  <motion.div
                    className="absolute pointer-events-none"
                    style={{
                      width: "40%", height: "30%",
                      left: "30%", top: "55%",
                      background: "radial-gradient(ellipse at 50% 50%, hsl(var(--crimson) / 0.04), transparent 70%)",
                      filter: "blur(45px)",
                    }}
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  />

                  {/* Ultra-soft floating particles — very slow drift */}
                  {[...Array(12)].map((_, i) => {
                    const size = 1 + (i % 3) * 0.8;
                    const startX = 10 + (i * 7) % 80;
                    const startY = 15 + (i * 11) % 65;
                    const isGold = i % 3 !== 2;
                    return (
                      <motion.div
                        key={`rp-${i}`}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: size,
                          height: size,
                          left: `${startX}%`,
                          top: `${startY}%`,
                          background: isGold
                            ? "hsl(var(--gold) / 0.35)"
                            : "hsl(var(--celestial) / 0.25)",
                        }}
                        animate={{
                          opacity: [0, 0.5, 0],
                          y: [0, -(12 + (i % 4) * 8)],
                          x: [0, (i % 2 === 0 ? 6 : -6)],
                        }}
                        transition={{
                          duration: 5 + (i % 3) * 2,
                          repeat: Infinity,
                          delay: (i * 0.7) % 4,
                          ease: "easeOut",
                        }}
                      />
                    );
                  })}

                  {/* Card awakening — summoned, not loaded */}
                  <AnimatePresence>
                    {showCardOverlay && (
                      <motion.div
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        {/* Stage 1: Oracle hand glow — warm energy gathering at center */}
                        <motion.div
                          className="absolute pointer-events-none"
                          style={{
                            width: 200, height: 200,
                            background: "radial-gradient(circle, hsl(var(--gold) / 0.12), hsl(var(--gold) / 0.04), transparent 70%)",
                            filter: "blur(35px)",
                          }}
                          initial={{ scale: 0.2, opacity: 0 }}
                          animate={{ scale: [0.2, 1.6, 1.2], opacity: [0, 0.8, 0.5] }}
                          transition={{ duration: 2.5, ease: "easeOut" }}
                        />

                        {/* Stage 2: Energy particles converging inward toward card position */}
                        {[...Array(10)].map((_, i) => {
                          const angle = (i / 10) * Math.PI * 2;
                          const radius = 140 + (i % 3) * 40;
                          return (
                            <motion.div
                              key={`aw-${i}`}
                              className="absolute rounded-full pointer-events-none"
                              style={{
                                width: 2 + (i % 2),
                                height: 2 + (i % 2),
                                background: i % 3 === 0
                                  ? "hsl(var(--gold) / 0.6)"
                                  : "hsl(var(--celestial) / 0.4)",
                              }}
                              initial={{
                                x: Math.cos(angle) * radius,
                                y: Math.sin(angle) * radius,
                                opacity: 0,
                              }}
                              animate={{
                                x: 0,
                                y: 0,
                                opacity: [0, 0.7, 0],
                              }}
                              transition={{
                                duration: 2.2,
                                delay: 0.3 + i * 0.12,
                                ease: "easeIn",
                              }}
                            />
                          );
                        })}

                        {/* Stage 3: Radial glow bloom — card is forming */}
                        <motion.div
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            width: 350,
                            height: 350,
                            background: "radial-gradient(circle, hsl(var(--gold) / 0.15), hsl(var(--crimson) / 0.06), transparent)",
                            filter: "blur(50px)",
                          }}
                          initial={{ scale: 0.1, opacity: 0 }}
                          animate={{ scale: [0.1, 0.6, 1.3], opacity: [0, 0.3, 0.7] }}
                          transition={{ duration: 2.8, delay: 0.8, ease: "easeOut" }}
                        />

                        {/* Stage 4: The card — gentle emergence with slow flip */}
                        <motion.div
                          className="relative w-44 h-64 md:w-52 md:h-76 rounded-xl overflow-hidden"
                          style={{
                            border: "2px solid hsl(var(--gold) / 0.5)",
                            transformStyle: "preserve-3d",
                            perspective: 1000,
                          }}
                          initial={{
                            scale: 0.3,
                            opacity: 0,
                            y: 40,
                            rotateY: 180,
                            filter: "blur(8px)",
                          }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            rotateY: 0,
                            filter: "blur(0px)",
                          }}
                          transition={{
                            duration: 2.2,
                            delay: 1.2,
                            ease: [0.16, 1, 0.3, 1],
                            opacity: { duration: 1.2, delay: 1.2 },
                            filter: { duration: 1.5, delay: 1.4 },
                            rotateY: { duration: 2, delay: 1.3, ease: [0.22, 1, 0.36, 1] },
                          }}
                        >
                          {cardImage ? (
                            <img src={cardImage} alt={card.hebrewName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(222 30% 12%), hsl(0 20% 10%))" }}>
                              <span className="text-5xl">{card.symbol}</span>
                            </div>
                          )}

                          {/* Shimmer sweep — delayed until card is fully revealed */}
                          <motion.div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: "linear-gradient(105deg, transparent 30%, hsl(var(--gold) / 0.18) 50%, transparent 70%)",
                            }}
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{ duration: 1.8, delay: 3, ease: "easeInOut" }}
                          />
                        </motion.div>

                        {/* Stage 5: Final soft glow pulse around the card */}
                        <motion.div
                          className="absolute pointer-events-none rounded-xl"
                          style={{
                            width: "clamp(200px, 60%, 260px)",
                            aspectRatio: "2 / 3",
                            boxShadow: "0 0 60px hsl(var(--gold) / 0.2), 0 0 120px hsl(var(--crimson) / 0.08), 0 20px 60px hsl(0 0% 0% / 0.4)",
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.6, 0.3, 0.5, 0.3] }}
                          transition={{ duration: 3, delay: 3.2, ease: "easeInOut" }}
                        />

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
                      className="relative z-10 text-center"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <p className="font-body text-gold/80 text-lg">{t.daily_shuffle}</p>
                      <p className="font-body text-foreground/40 text-xs mt-1">{t.daily_shuffle_focus}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* PHASE: Result / Locked — compact in-flow daily card */}
              {(phase === "result" || phase === "locked") && card && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="px-4 pb-10 pt-6 md:px-0 md:pb-16 md:pt-8"
                >
                  <div className="mx-auto w-full max-w-[840px]">
                    <motion.div
                      className="relative rounded-[28px] overflow-visible"
                      style={{
                        background: "linear-gradient(145deg, hsl(var(--deep-blue-light) / 0.84), hsl(var(--deep-blue) / 0.92))",
                        border: "1px solid hsl(var(--gold) / 0.18)",
                        boxShadow: "0 16px 60px hsl(var(--deep-blue) / 0.45), 0 0 24px hsl(var(--gold) / 0.06)",
                      }}
                    >
                      <div
                        className="absolute inset-x-0 top-0 pointer-events-none"
                        style={{
                          height: "120px",
                          background: "radial-gradient(circle at top, hsl(var(--gold) / 0.12), transparent 72%)",
                        }}
                      />

                      <div className="relative flex flex-col items-center gap-3 px-5 pb-6 pt-5 text-center md:px-7 md:pb-7 md:pt-6">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" style={{ color: "hsl(var(--gold))" }} />
                          <span className="font-heading tracking-[0.24em] text-[11px] md:text-xs" style={{ color: "hsl(var(--gold))" }}>
                            {t.daily_title}
                          </span>
                        </div>

                        <p className="max-w-[26ch] font-body text-sm leading-relaxed md:text-[15px]" style={{ color: "hsl(var(--foreground) / 0.72)" }}>
                          {t.daily_card_chosen}
                        </p>

                        <motion.div
                          className="relative overflow-hidden rounded-2xl"
                          style={{
                            width: "clamp(140px, 22vw, 190px)",
                            aspectRatio: "2 / 3",
                            border: "2px solid hsl(var(--gold) / 0.28)",
                            boxShadow: "0 0 30px hsl(var(--gold) / 0.12), 0 18px 40px hsl(0 0% 0% / 0.35)",
                            background: "hsl(var(--deep-blue))",
                          }}
                          initial={{ scale: 0.92, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {cardImage ? (
                            <img src={cardImage} alt={card.hebrewName} className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="text-5xl">{card.symbol}</span>
                            </div>
                          )}
                          <motion.div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: "linear-gradient(105deg, transparent 30%, hsl(var(--gold) / 0.12) 50%, transparent 70%)" }}
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
                          />
                        </motion.div>

                        <div className="flex flex-col items-center gap-1">
                          <h2 className="font-heading text-[26px] leading-none gold-gradient-text md:text-[30px]">
                            {card.hebrewName}
                          </h2>
                          <p className="font-body text-xs md:text-sm" style={{ color: "hsl(var(--foreground) / 0.5)" }}>
                            {t.daily_arcana_label} {card.number}
                          </p>
                        </div>

                        {phase === "locked" && (
                          <div
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
                            style={{
                              background: "hsl(var(--gold) / 0.06)",
                              border: "1px solid hsl(var(--gold) / 0.12)",
                            }}
                          >
                            <Clock className="h-3.5 w-3.5" style={{ color: "hsl(var(--gold) / 0.7)" }} />
                            <span className="font-body text-[11px] md:text-xs" style={{ color: "hsl(var(--gold) / 0.75)" }}>
                              {t.daily_next_card} {timeLeft}
                            </span>
                          </div>
                        )}

                        <div className="w-full max-w-[30ch] font-body text-sm leading-relaxed md:text-[15px]" style={{ color: "hsl(var(--foreground) / 0.72)" }}>
                          {aiText ? (
                            <div className="text-left [&>div]:space-y-3">{renderMysticalText(aiText, textSize)}</div>
                          ) : aiError ? (
                            <div className="rounded-2xl px-4 py-3 text-center" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}>
                              <p className="font-body text-xs" style={{ color: "hsl(var(--foreground) / 0.6)" }}>{aiError}</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3 py-2">
                              <motion.div
                                className="h-12 w-12 rounded-full"
                                style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}
                                animate={{ scale: [1, 1.12, 1], rotate: [0, 180, 360] }}
                                transition={{ duration: 3, repeat: Infinity }}
                              />
                              <motion.p className="font-body text-xs md:text-sm" style={{ color: "hsl(var(--gold) / 0.75)" }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                                {t.daily_loading}
                              </motion.p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <motion.button
                            onClick={handleShare}
                            className="flex items-center gap-2 rounded-full px-4 py-2 font-body text-xs md:text-sm"
                            style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <Share2 className="h-4 w-4" />{t.forecast_share}
                          </motion.button>
                          <motion.button
                            onClick={handleCopy}
                            className="flex items-center gap-2 rounded-full px-4 py-2 font-body text-xs md:text-sm"
                            style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? t.share_copied : t.share_copy}
                          </motion.button>
                        </div>

                        {!aiLoading && (aiText || aiError) && (
                          <motion.button
                            onClick={handleClose}
                            className="mt-1 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-sm md:text-base"
                            style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.22), hsl(var(--gold) / 0.1))", border: "1px solid hsl(var(--gold) / 0.25)", color: "hsl(var(--gold))" }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <Sparkles className="h-4 w-4" />{t.daily_premium_cta}
                          </motion.button>
                        )}
                      </div>

                      <AstrologerAvatarButton
                        size={isMobileViewport ? 36 : 42}
                        onClick={() => setAstrologerOpen(true)}
                        entranceDelay={0.8}
                        style={{
                          bottom: isMobileViewport ? 14 : 16,
                          right: isMobileViewport ? 14 : 16,
                          zIndex: 12,
                        }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
      </CinematicModalShell>
      <AstrologerIntroModal isOpen={astrologerOpen} onClose={() => setAstrologerOpen(false)} />
    </>
  );
};

export default DailyCardModal;

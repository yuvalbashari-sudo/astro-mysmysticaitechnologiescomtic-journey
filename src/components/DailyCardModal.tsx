import React, { useState, useEffect, useRef, useCallback } from "react";
import CinematicModalShell from "@/components/CinematicModalShell";
import DailyCardAdvisorPanel from "@/components/DailyCardAdvisorPanel";
import AstrologerAvatarButton from "@/components/AstrologerAvatarButton";
import TextSizeControl, { type TextSize } from "@/components/TextSizeControl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Sun, Lock, Share2, Copy, Check, Loader2, Clock, Crown } from "lucide-react";
import { allReadingCards, type ReadingCard } from "@/data/allTarotCards";
import { cardBack } from "@/data/tarotCardImages";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";
import { mysticalProfile } from "@/lib/mysticalProfile";
import ShareResultSection from "@/components/ShareResultSection";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useCardName } from "@/hooks/useCardName";
import { useReadingContext } from "@/contexts/ReadingContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DAILY_CARD_KEY = "astrologai_daily_card";
const DAILY_USER_SEED_KEY = "astrologai_user_seed";
const RITUAL_DURATION_MS = 4200;

interface DailyCardData {
  card: ReadingCard;
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
  const cardName = useCardName();
  const { setActiveReading } = useReadingContext();
  const [phase, setPhase] = useState<Phase>("ready");
  const [card, setCard] = useState<ReadingCard | null>(null);
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
  const [userName, setUserName] = useState(() => mysticalProfile.getUserName() || "");
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

    // Select card deterministically from full 78-card deck
    const cardIndex = getDailyCardIndex(allReadingCards.length);
    const selectedCard = allReadingCards[cardIndex];
    setCard(selectedCard);
    setShowCardOverlay(false);
    setRitualStep(0);
    setPhase("ritual");
  }, [t.daily_already_drawn]);

  // Ritual animation sequence — crystal ball → emerge → flip → reveal
  useEffect(() => {
    if (phase !== "ritual" || !card) return;

    // Step 0: energy gathering (crystal ball glow)
    // Step 1: card begins emerging (0.8s)
    const step1 = setTimeout(() => setRitualStep(1), 800);
    // Step 2: card visible, beginning flip (1.8s)
    const step2 = setTimeout(() => {
      setShowCardOverlay(true);
      setRitualStep(2);
    }, 1800);
    // Step 3: card fully revealed, glow burst (3.2s)
    const step3 = setTimeout(() => setRitualStep(3), 3200);
    // Step 4: transition to result phase
    const step4 = setTimeout(() => {
      setPhase("result");
      startAiReading(card);
    }, RITUAL_DURATION_MS);

    // Fallback safety: if animation fails, force result after 6s
    const fallback = setTimeout(() => {
      setPhase((prev) => {
        if (prev === "ritual") {
          startAiReading(card);
          return "result";
        }
        return prev;
      });
    }, 6000);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
      clearTimeout(fallback);
    };
  }, [phase, card]);

  const startAiReading = (selectedCard: TarotWorldCard) => {
    setAiLoading(true);
    setAiError(null);
    aiTextRef.current = "";
    setAiText("");

    // Save userName to profile if provided
    if (userName.trim()) {
      mysticalProfile.recordUserName(userName.trim());
    }

    saveDailyCard({ card: selectedCard, date: getTodayDate(), language });

    const majorCard = findMajorArcanaByEnglishName(selectedCard.name);
    const localizedName = majorCard ? getMajorCardName(majorCard, language) : cardName(selectedCard.name, selectedCard.hebrewName);

    streamMysticalReading(
      "dailyCard",
      {
        cardName: selectedCard.name,
        cardLocalizedName: localizedName,
        cardHebrewName: selectedCard.hebrewName,
        cardNumber: selectedCard.number,
        cardSymbol: selectedCard.symbol,
        generalMeaning: selectedCard.meanings.general,
        dailyMeaning: selectedCard.meanings.daily,
        spiritualMeaning: selectedCard.meanings.spiritual,
        advice: selectedCard.meanings.advice,
        gender,
        userName: userName.trim() || undefined,
      },
      (delta) => {
        aiTextRef.current += delta;
        setAiText(aiTextRef.current);
      },
      () => {
        setAiLoading(false);
        const label = `${t.daily_title} — ${localizedName}`;
        setActiveReading({ type: "dailyCard", label, summary: aiTextRef.current });
        const saved = getSavedDailyCard();
        if (saved) {
          saveDailyCard({ ...saved, aiText: aiTextRef.current, language });
        }
        mysticalProfile.recordDailyCard(localizedName, selectedCard.symbol);
        readingsStorage.save({
          type: "tarot",
          title: label,
          subtitle: t.daily_card_chosen,
          symbol: selectedCard.symbol,
          data: { card: localizedName, aiReading: aiTextRef.current },
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
    const text = `🔮 ${t.daily_title}: ${card.symbol} ${cardName(card.name, card.hebrewName)}\n\n✨ ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!aiText) return;
    await navigator.clipboard.writeText(`🔮 ${t.daily_title} — ${card?.hebrewName}\n\n${aiText}`);
    setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000);
  };

  const cardImage = card ? (card.image || tarotCardImages[card.name]) : null;

  return (
    <>
      {/* Advisor side panel — pushes content on desktop */}
      <DailyCardAdvisorPanel isOpen={astrologerOpen} onClose={() => setAstrologerOpen(false)} />

      <CinematicModalShell isOpen={isOpen} onClose={handleClose} scrollRef={scrollRef as React.RefObject<HTMLDivElement>} wide hideAdvisor transparent>
        <div
          className="transition-all duration-300 ease-out"
          style={{
            marginLeft: !isMobileViewport && astrologerOpen ? "680px" : "0",
          }}
        >
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
                  {/* ── Glass container ── */}
                  <div
                    className="relative z-10 w-full max-w-md rounded-3xl px-8 py-10 md:px-10 md:py-12 flex flex-col items-center"
                    style={{
                      background: "linear-gradient(170deg, hsl(222 47% 8% / 0.88), hsl(222 47% 5% / 0.92))",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      border: "1px solid hsl(var(--gold) / 0.12)",
                      boxShadow: "0 16px 50px hsl(0 0% 0% / 0.5), 0 0 1px hsl(var(--gold) / 0.1), inset 0 1px 0 hsl(var(--gold) / 0.08)",
                    }}
                  >
                    {/* Ambient glow behind container */}
                    <motion.div
                      className="absolute -inset-10 pointer-events-none rounded-3xl"
                      style={{
                        background: "radial-gradient(ellipse at 50% 40%, hsl(var(--gold) / 0.04), transparent 70%)",
                        filter: "blur(40px)",
                      }}
                      animate={{ opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Icon */}
                    <motion.div
                      className="w-16 h-16 mb-5 rounded-full flex items-center justify-center relative"
                      style={{
                        background: "radial-gradient(circle, hsl(var(--gold) / 0.12), hsl(var(--gold) / 0.04) 70%, transparent)",
                        border: "1px solid hsl(var(--gold) / 0.18)",
                      }}
                      animate={{
                        boxShadow: [
                          "0 0 20px hsl(var(--gold) / 0.06)",
                          "0 0 35px hsl(var(--gold) / 0.15)",
                          "0 0 20px hsl(var(--gold) / 0.06)",
                        ],
                      }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                    >
                      <Sun className="w-7 h-7 text-gold/90" />
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      className="font-heading text-3xl md:text-4xl gold-gradient-text mb-2"
                      style={{ textShadow: "0 0 30px hsl(var(--gold) / 0.15)" }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      {t.daily_title}
                    </motion.h2>

                    {/* Decorative divider */}
                    <motion.div
                      className="flex items-center gap-2 mb-4"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="w-10 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.25))" }} />
                      <span className="text-gold/30 text-[10px]">✦</span>
                      <div className="w-10 h-px" style={{ background: "linear-gradient(90deg, hsl(var(--gold) / 0.25), transparent)" }} />
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                      className="text-foreground/50 font-body text-sm md:text-base max-w-xs leading-relaxed mb-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {t.daily_desc}
                    </motion.p>
                    <motion.p
                      className="text-foreground/25 font-body text-[11px] mb-7"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                    >
                      {t.daily_note}
                    </motion.p>

                    {/* Name Input */}
                    <motion.div
                      className="w-full max-w-[280px] mb-5"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28 }}
                    >
                      <label className="block text-xs text-gold/50 font-body mb-2.5 tracking-wider uppercase">{t.daily_name_label}</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder={t.daily_name_placeholder}
                        className="w-full py-2.5 px-4 rounded-lg font-body text-sm text-foreground/80 placeholder:text-foreground/25 focus:outline-none transition-all duration-300"
                        style={{
                          background: "hsl(var(--deep-blue-light) / 0.3)",
                          border: "1px solid hsl(var(--gold) / 0.08)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.3)";
                          e.currentTarget.style.boxShadow = "0 0 12px hsl(var(--gold) / 0.08)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.08)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                        dir="auto"
                      />
                    </motion.div>

                    {/* Gender Selection */}
                    <motion.div
                      className="w-full max-w-[280px] mb-7"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-xs text-gold/50 font-body mb-2.5 tracking-wider uppercase">{t.forecast_gender_label}</label>
                      <div className="flex gap-2.5">
                        {(["male", "female"] as const).map((g) => (
                          <motion.button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className="flex-1 py-2.5 rounded-lg font-body text-sm transition-all duration-300"
                            style={{
                              background: gender === g
                                ? "linear-gradient(135deg, hsl(var(--gold) / 0.18), hsl(var(--gold) / 0.06))"
                                : "hsl(var(--deep-blue-light) / 0.3)",
                              border: gender === g
                                ? "1px solid hsl(var(--gold) / 0.4)"
                                : "1px solid hsl(var(--gold) / 0.08)",
                              color: gender === g
                                ? "hsl(var(--gold))"
                                : "hsl(var(--foreground) / 0.4)",
                              boxShadow: gender === g
                                ? "0 0 12px hsl(var(--gold) / 0.08), inset 0 1px 0 hsl(var(--gold) / 0.1)"
                                : "none",
                            }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {g === "male" ? t.forecast_gender_male : t.forecast_gender_female}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Card fan preview */}
                    <motion.div
                      className="relative w-24 h-34 mx-auto mb-7"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35, duration: 0.6 }}
                    >
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-lg overflow-hidden"
                          style={{
                            border: "1px solid hsl(var(--gold) / 0.18)",
                            boxShadow: "0 6px 20px hsl(0 0% 0% / 0.3)",
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
                      <motion.div
                        className="absolute -inset-6 rounded-full pointer-events-none"
                        style={{
                          background: "radial-gradient(circle, hsl(var(--gold) / 0.05), transparent 70%)",
                          filter: "blur(15px)",
                        }}
                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    </motion.div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={handleDraw}
                      className="relative font-body flex items-center justify-center gap-2.5 text-sm md:text-base px-8 py-3.5 rounded-full overflow-hidden font-medium"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                        color: "hsl(var(--primary-foreground))",
                        boxShadow: "0 0 24px hsl(var(--gold) / 0.2), 0 4px 16px hsl(0 0% 0% / 0.25)",
                        letterSpacing: "0.04em",
                      }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05, boxShadow: "0 0 35px hsl(var(--gold) / 0.3), 0 6px 20px hsl(0 0% 0% / 0.3)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Sparkles className="w-4.5 h-4.5" />
                      {t.daily_cta}
                    </motion.button>

                  </div>
                </motion.div>
              )}

              {phase === "ritual" && card && (
                <motion.div
                  key="ritual"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="relative flex flex-col items-center justify-center"
                  style={{ minHeight: "70vh" }}
                >
                  {/* ── Crystal ball glow — energy gathering ── */}
                  <motion.div
                    className="absolute pointer-events-none rounded-full"
                    style={{
                      width: isMobileViewport ? 180 : 260,
                      height: isMobileViewport ? 180 : 260,
                      background: "radial-gradient(circle, hsl(var(--gold) / 0.2), hsl(var(--celestial) / 0.1), transparent 70%)",
                      filter: "blur(30px)",
                    }}
                    animate={{
                      scale: ritualStep >= 2 ? [1, 0.3] : [0.3, 1.2, 0.3],
                      opacity: ritualStep >= 2 ? [0.7, 0] : [0, 0.7, 0],
                    }}
                    transition={{
                      duration: ritualStep >= 2 ? 0.8 : 2,
                      repeat: ritualStep >= 2 ? 0 : Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* ── Pulsing rings ── */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={`ring-${i}`}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: isMobileViewport ? 120 + i * 50 : 180 + i * 70,
                        height: isMobileViewport ? 120 + i * 50 : 180 + i * 70,
                        border: `1px solid hsl(var(--gold) / ${0.15 - i * 0.04})`,
                      }}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={ritualStep < 2
                        ? { scale: [0.5, 1.5 + i * 0.3], opacity: [0.4, 0] }
                        : { scale: 2 + i, opacity: 0 }
                      }
                      transition={{
                        duration: 2,
                        repeat: ritualStep < 2 ? Infinity : 0,
                        delay: i * 0.4,
                        ease: "easeOut",
                      }}
                    />
                  ))}

                  {/* ── Golden sparks converging ── */}
                  {ritualStep >= 1 && [...Array(12)].map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    const dist = 100 + (i % 3) * 25;
                    return (
                      <motion.div
                        key={`spark-${i}`}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: 2 + (i % 3),
                          height: 2 + (i % 3),
                          background: i % 2 === 0 ? "hsl(var(--gold))" : "hsl(var(--celestial) / 0.7)",
                        }}
                        initial={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0 }}
                        animate={{ x: 0, y: 0, opacity: [0, 0.9, 0], scale: [0, 1.5, 0] }}
                        transition={{ duration: 1, delay: 0.04 * i, ease: "easeIn" }}
                      />
                    );
                  })}

                  {/* ── The card — RELIABLE APPROACH: back cross-fades to front ── */}
                  {showCardOverlay && (
                    <motion.div
                      className="relative z-10 flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.3, y: 60 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {/* Card container */}
                      <div
                        className="relative rounded-xl overflow-hidden"
                        style={{
                          width: isMobileViewport ? 160 : 200,
                          height: isMobileViewport ? 240 : 300,
                          border: "2px solid hsl(var(--gold) / 0.4)",
                          boxShadow: ritualStep >= 3
                            ? "0 0 60px hsl(var(--gold) / 0.25), 0 0 80px hsl(280 50% 50% / 0.1), 0 20px 60px hsl(0 0% 0% / 0.5)"
                            : "0 8px 30px hsl(0 0% 0% / 0.4)",
                        }}
                      >
                        {/* Card FRONT — always present, guaranteed visible */}
                        <div className="absolute inset-0">
                          {cardImage ? (
                            <img src={cardImage} alt={cardName(card.name, card.hebrewName)} className="w-full h-full object-cover" />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: "linear-gradient(135deg, hsl(222 30% 12%), hsl(0 20% 10%))" }}
                            >
                              <span className="text-5xl">{card.symbol}</span>
                            </div>
                          )}
                        </div>

                        {/* Card BACK — overlays front, fades out to reveal */}
                        <motion.div
                          className="absolute inset-0 z-10"
                          initial={{ opacity: 1 }}
                          animate={{ opacity: ritualStep >= 3 ? 0 : 1 }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                        >
                          <img src={cardBack} alt="" className="w-full h-full object-cover" />
                        </motion.div>

                        {/* Shimmer sweep after reveal */}
                        {ritualStep >= 3 && (
                          <motion.div
                            className="absolute inset-0 pointer-events-none z-20"
                            style={{
                              background: "linear-gradient(105deg, transparent 30%, hsl(var(--gold) / 0.2) 50%, transparent 70%)",
                            }}
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
                          />
                        )}

                        {/* Glowing edge aura */}
                        <motion.div
                          className="absolute -inset-px rounded-xl pointer-events-none z-20"
                          animate={{
                            boxShadow: ritualStep >= 3
                              ? [
                                  "inset 0 0 15px hsl(var(--gold) / 0.15)",
                                  "inset 0 0 25px hsl(var(--gold) / 0.25)",
                                  "inset 0 0 15px hsl(var(--gold) / 0.15)",
                                ]
                              : "inset 0 0 10px hsl(var(--gold) / 0.08)",
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>

                      {/* Glow burst on final reveal */}
                      {ritualStep >= 3 && (
                        <motion.div
                          className="absolute pointer-events-none rounded-full"
                          style={{
                            width: isMobileViewport ? 300 : 400,
                            height: isMobileViewport ? 300 : 400,
                            background: "radial-gradient(circle, hsl(var(--gold) / 0.18), hsl(280 50% 50% / 0.06), transparent 70%)",
                            filter: "blur(30px)",
                          }}
                          initial={{ scale: 0.3, opacity: 0 }}
                          animate={{ scale: [0.3, 1.2, 0.9], opacity: [0, 0.8, 0.3] }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      )}

                      {/* Card name */}
                      <motion.h2
                        className="font-heading text-2xl md:text-3xl gold-gradient-text mt-5 relative z-10"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: ritualStep >= 3 ? 1 : 0, y: ritualStep >= 3 ? 0 : 15 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {card.symbol} {cardName(card.name, card.hebrewName)}
                      </motion.h2>
                      <motion.p
                        className="text-foreground/50 font-body text-sm relative z-10 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: ritualStep >= 3 ? 1 : 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {t.daily_card_chosen}
                      </motion.p>
                    </motion.div>
                  )}

                  {/* Loading text before card emerges */}
                  {!showCardOverlay && (
                    <motion.div
                      className="relative z-10 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.p
                        className="font-body text-lg"
                        style={{ color: "hsl(var(--gold) / 0.85)" }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {t.daily_shuffle}
                      </motion.p>
                      <motion.p
                        className="font-body text-xs mt-1.5"
                        style={{ color: "hsl(var(--foreground) / 0.35)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {t.daily_shuffle_focus}
                      </motion.p>
                    </motion.div>
                   )}

                </motion.div>
              )}

              {/* PHASE: Result / Locked — structured daily card */}
              {(phase === "result" || phase === "locked") && card && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="px-4 pb-10 pt-6 md:px-0 md:pb-16 md:pt-8"
                >
                  <div className="mx-auto w-full max-w-[620px]">
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

                       <div className="relative flex flex-col items-center gap-4 px-7 pb-8 pt-7 text-center md:px-10 md:pb-10 md:pt-8">
                        <div className="flex items-center gap-2">
                          <Sun className="h-5 w-5" style={{ color: "hsl(var(--gold))" }} />
                          <span className="font-heading tracking-[0.24em] text-base md:text-lg" style={{ color: "hsl(var(--gold))" }}>
                            {t.daily_title}
                          </span>
                        </div>

                        <p className="max-w-[32ch] font-body text-lg leading-relaxed md:text-xl" style={{ color: "hsl(var(--foreground) / 0.72)", lineHeight: 1.8 }}>
                          {t.daily_card_chosen}
                        </p>

                        <motion.div
                          className="relative overflow-hidden rounded-2xl"
                          style={{
                            width: "clamp(200px, 30vw, 280px)",
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
                            <img src={cardImage} alt={cardName(card.name, card.hebrewName)} className="h-full w-full object-contain" />
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

                        <div className="flex flex-col items-center gap-1.5">
                          <h2 className="font-heading text-[36px] leading-none gold-gradient-text md:text-[44px]">
                            {cardName(card.name, card.hebrewName)}
                          </h2>
                          <p className="font-body text-base md:text-lg" style={{ color: "hsl(var(--foreground) / 0.5)" }}>
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

                        {/* Structured AI reading content */}
                        <div className="w-full max-w-[42ch] font-body text-lg leading-relaxed md:text-xl" style={{ color: "hsl(var(--foreground) / 0.72)", lineHeight: 1.8 }}>
                          {aiText ? (
                            <div className="text-start space-y-5">
                              {renderMysticalText(aiText, textSize)}
                            </div>
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

                        {/* Advisor CTA — conversion-driven */}
                        {!aiLoading && (aiText || aiError) && (
                          <motion.div
                            className="w-full max-w-[42ch] mt-2"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                          >
                            {/* Decorative separator */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.2))" }} />
                              <span className="text-gold/40 text-xs">✦</span>
                              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsl(var(--gold) / 0.2), transparent)" }} />
                            </div>

                            {/* CTA text */}
                            <p className="text-center font-body text-sm md:text-base mb-3" style={{ color: "hsl(var(--gold) / 0.85)" }}>
                              {t.daily_advisor_cta_text}
                            </p>

                            {/* Advisor button — prominent */}
                            <div className="flex justify-center">
                              <motion.button
                                onClick={() => setAstrologerOpen(true)}
                                className="flex items-center gap-2.5 rounded-full px-6 py-3 font-body text-sm md:text-base font-medium"
                                style={{
                                  background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                                  color: "hsl(var(--primary-foreground))",
                                  boxShadow: "0 0 24px hsl(var(--gold) / 0.2), 0 4px 16px hsl(0 0% 0% / 0.25)",
                                }}
                                whileHover={{ scale: 1.05, boxShadow: "0 0 35px hsl(var(--gold) / 0.3), 0 6px 20px hsl(0 0% 0% / 0.3)" }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <Crown className="h-4 w-4" />
                                {t.daily_premium_title}
                              </motion.button>
                            </div>
                          </motion.div>
                        )}

                        {/* Action buttons */}
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

                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Advisor avatar — fixed on top of all phases */}
            <AstrologerAvatarButton
              size={isMobileViewport ? 140 : 198}
              onClick={() => setAstrologerOpen(true)}
              entranceDelay={0.5}
              style={{
                position: "fixed",
                bottom: isMobileViewport ? 6 : 10,
                right: isMobileViewport ? 6 : 10,
                zIndex: 200,
              }}
            />
        </div>
      </CinematicModalShell>
    </>
  );
};

export default DailyCardModal;

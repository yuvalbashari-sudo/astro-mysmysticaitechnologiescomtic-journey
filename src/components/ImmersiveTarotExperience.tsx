import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Briefcase, DollarSign, Sparkles, ChevronLeft } from "lucide-react";
import { createPortal } from "react-dom";
import heroFigure from "@/assets/hero-mystic-figure.jpg";
import { drawTarotCards, type TarotCard } from "@/data/tarotData";
import { tarotCardImages, cardBack } from "@/data/tarotCardImages";
import { tarotMemory } from "@/lib/tarotMemory";
import { mysticalProfile } from "@/lib/mysticalProfile";
import { readingsStorage } from "@/lib/readingsStorage";
import { renderMysticalText } from "@/lib/aiStreaming";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useReadingContext } from "@/contexts/ReadingContext";
import { toast } from "@/components/ui/sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = "question" | "drawing" | "reveal" | "interpretation";

interface QuestionOption {
  key: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}

/* ── AI streaming ───────────────── */
async function streamTarotReading(
  spreadType: string,
  cards: { hebrewName: string; symbol: string; positionLabel: string; name: string }[],
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  userQuestion?: string,
  language?: string,
) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tarot-reading`;
  const memoryContext = tarotMemory.buildMemoryContext(cards);
  const profileContext = mysticalProfile.buildContextForAI();
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        spreadType,
        cards,
        context: { memoryContext, profileContext, userQuestion: userQuestion || undefined },
        language: language || "he",
      }),
    });
    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({ error: "Error" }));
      onError(errData.error || "Error");
      return;
    }
    if (!resp.body) { onError("No response body"); return; }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;
    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { streamDone = true; break; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { textBuffer = line + "\n" + textBuffer; break; }
      }
    }
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }
    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Network error");
  }
}

/* ── (removed: EnergyParticle and MysticalTable — clean scene) ── */

/* ── Floating Card (cinematic, grounded) ──────────────── */
const FloatingCard = ({
  card,
  index,
  isSelected,
  isFlipped,
  onClick,
  totalCards,
  isMobile,
  showBurst,
}: {
  card: TarotCard;
  index: number;
  isSelected: boolean;
  isFlipped: boolean;
  onClick: () => void;
  totalCards: number;
  isMobile: boolean;
  showBurst: boolean;
}) => {
  const mid = (totalCards - 1) / 2;
  const distFromCenter = Math.abs(index - mid);
  const depthScale = 1 - distFromCenter * 0.025;
  const cardW = (isMobile ? 58 : 100) * depthScale;
  const cardH = cardW * 1.55;
  const spread = isMobile ? 36 : 58;
  const centerOffset = mid * spread;
  const x = index * spread - centerOffset;
  const arcY = distFromCenter * distFromCenter * (isMobile ? 4 : 6);
  const baseRotation = (index - mid) * (isMobile ? 5 : 4);
  const floatDelay = index * 0.4;

  // Swap image at midpoint of flip for reliable reveal
  const [showFront, setShowFront] = useState(false);

  useEffect(() => {
    if (isFlipped && !showFront) {
      const timer = setTimeout(() => setShowFront(true), 350);
      return () => clearTimeout(timer);
    }
  }, [isFlipped, showFront]);

  const frontImgSrc = tarotCardImages[card.name] || cardBack;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        width: cardW,
        height: cardH,
        zIndex: isSelected ? 30 : Math.round(10 + (totalCards - distFromCenter)),
      }}
      initial={{ opacity: 0, y: 100, rotateZ: baseRotation * 2 }}
      animate={{
        opacity: isFlipped && !isSelected ? 0.5 : 1,
        x,
        y: isSelected ? -(isMobile ? 60 : 90) : arcY,
        rotateZ: isSelected ? 0 : baseRotation,
        scale: isSelected ? (isMobile ? 1.3 : 1.35) : depthScale,
      }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={!isSelected ? {
        y: arcY - (isMobile ? 12 : 16),
        scale: depthScale * 1.06,
        transition: { duration: 0.25, ease: "easeOut" }
      } : {}}
      onClick={!isSelected ? onClick : undefined}
    >
      <motion.div
        className="w-full h-full relative"
        animate={{ y: [0, -2.5, 0, 2, 0] }}
        transition={{ duration: 5, delay: floatDelay, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Drop shadow */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: "80%", height: 8, bottom: -6, left: "10%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, hsl(0 0% 0% / 0.55) 0%, transparent 70%)",
            filter: "blur(5px)",
          }}
          animate={{
            opacity: isSelected ? 0.2 : 0.7,
            scaleX: isSelected ? 1.4 : 1,
            y: isSelected ? 20 : 0,
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Bottom edge glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "70%", height: 12, bottom: 0, left: "15%",
            background: "radial-gradient(ellipse 100% 100% at 50% 100%, hsl(var(--gold) / 0.15) 0%, transparent 80%)",
            filter: "blur(4px)", borderRadius: "0 0 8px 8px",
          }}
        />

        {/* Card body — rotates on Y, image swaps at midpoint */}
        <motion.div
          className="w-full h-full rounded-xl overflow-hidden"
          animate={{
            rotateY: isFlipped ? 180 : 0,
            scale: isFlipped ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{ perspective: 900 }}
        >
          <div
            className="w-full h-full rounded-xl overflow-hidden"
            style={{
              boxShadow: showFront
                ? "0 0 40px hsl(var(--gold) / 0.3), 0 16px 48px hsl(0 0% 0% / 0.5)"
                : `0 ${isSelected ? 20 : 8}px ${isSelected ? 40 : 20}px hsl(0 0% 0% / ${isSelected ? 0.5 : 0.4})`,
              border: showFront ? "1px solid hsl(var(--gold) / 0.3)" : "1px solid hsl(var(--gold) / 0.1)",
            }}
          >
            <img
              src={showFront ? frontImgSrc : cardBack}
              alt={showFront ? card.hebrewName : ""}
              className="w-full h-full object-cover"
              style={{
                imageRendering: "auto",
                /* Mirror the front image since parent is rotated 180deg */
                transform: showFront ? "scaleX(-1)" : "none",
              }}
            />
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                boxShadow: showFront
                  ? "inset 0 0 8px 1px hsl(var(--gold) / 0.15), inset 0 1px 0 hsl(var(--gold) / 0.18)"
                  : "inset 0 0 6px 1px hsl(var(--gold) / 0.1), inset 0 1px 0 hsl(var(--gold) / 0.12)",
              }}
            />
          </div>
        </motion.div>

        {/* Light burst on reveal */}
        <AnimatePresence>
          {showBurst && (
            <>
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.5) 0%, transparent 60%)" }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: [0, 1, 0], scale: [0.7, 1.4, 1.8] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
              {[...Array(6)].map((_, pi) => {
                const a = (pi / 6) * Math.PI * 2;
                return (
                  <motion.div
                    key={`bp-${pi}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{ width: 3, height: 3, left: "50%", top: "50%", background: "hsl(var(--gold) / 0.9)" }}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{ x: Math.cos(a) * 50, y: Math.sin(a) * 50, opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                  />
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* Card name under revealed card */}
        <AnimatePresence>
          {showFront && isSelected && (
            <motion.div
              className="absolute left-0 right-0 text-center pointer-events-none"
              style={{ top: cardH + 8 }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span
                className="font-heading text-gold/85"
                style={{ fontSize: isMobile ? 9 : 12, textShadow: "0 0 10px hsl(var(--gold) / 0.3)" }}
              >
                {card.hebrewName}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

/* ── Main Component ─────────────── */
const ImmersiveTarotExperience = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language } = useLanguage();
  const { setActiveReading } = useReadingContext();
  const [phase, setPhase] = useState<Phase>("question");
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [selectedCardIndices, setSelectedCardIndices] = useState<Set<number>>(new Set());
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [revealedCard, setRevealedCard] = useState<TarotCard | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const questionOptions = useMemo((): QuestionOption[] => [
    {
      key: "love",
      icon: <Heart className="w-6 h-6" />,
      label: language === "he" ? "אהבה" : language === "ar" ? "الحب" : language === "ru" ? "Любовь" : "Love",
      color: "340 60% 55%",
    },
    {
      key: "career",
      icon: <Briefcase className="w-6 h-6" />,
      label: language === "he" ? "קריירה" : language === "ar" ? "المهنة" : language === "ru" ? "Карьера" : "Career",
      color: "215 60% 55%",
    },
    {
      key: "money",
      icon: <DollarSign className="w-6 h-6" />,
      label: language === "he" ? "כסף" : language === "ar" ? "المال" : language === "ru" ? "Деньги" : "Money",
      color: "43 80% 55%",
    },
    {
      key: "general",
      icon: <Sparkles className="w-6 h-6" />,
      label: language === "he" ? "כללי" : language === "ar" ? "عام" : language === "ru" ? "Общее" : "General",
      color: "270 50% 60%",
    },
  ], [language]);

  const handleQuestionSelect = useCallback((key: string) => {
    setSelectedQuestion(key);
    setTimeout(() => {
      setDrawnCards(drawTarotCards(7));
      setPhase("drawing");
    }, 600);
  }, []);

  const [burstIndices, setBurstIndices] = useState<Set<number>>(new Set());

  const handleCardSelect = useCallback((index: number) => {
    setSelectedCardIndices(prev => {
      if (prev.has(index)) return prev; // no deselection
      if (prev.size >= 3) return prev;
      const next = new Set(prev);
      next.add(index);

      // Flip immediately
      setFlippedIndices(fi => new Set(fi).add(index));
      // Light burst
      setBurstIndices(bi => new Set(bi).add(index));
      setTimeout(() => setBurstIndices(bi => { const n = new Set(bi); n.delete(index); return n; }), 900);

      if (next.size === 3) {
        setTimeout(() => setPhase("reveal"), 2000);
      }
      return next;
    });
  }, []);

  const handleRevealComplete = useCallback(() => {
    setPhase("interpretation");
    setAiLoading(true);
    aiTextRef.current = "";
    setAiText("");

    const posLabels = [
      language === "he" ? "עבר" : "Past",
      language === "he" ? "הווה" : "Present",
      language === "he" ? "עתיד" : "Future",
    ];

    const cards = Array.from(selectedCardIndices).map(i => drawnCards[i]);
    const cardsPayload = cards.map((c, i) => ({
      hebrewName: c.hebrewName,
      symbol: c.symbol,
      name: c.name,
      positionLabel: posLabels[i] || "",
    }));

    const spreadType = selectedQuestion === "love" ? "love" : selectedQuestion === "career" ? "career" : "timeline";

    streamTarotReading(
      spreadType,
      cardsPayload,
      (delta) => {
        aiTextRef.current += delta;
        setAiText(aiTextRef.current);
      },
      () => {
        setAiLoading(false);
        setActiveReading({
          type: "tarot",
          label: `${t.readings_type_tarot} — ${selectedQuestion}`,
          summary: aiTextRef.current,
        });
        tarotMemory.recordReading(spreadType, cardsPayload);
        mysticalProfile.recordTarotCards(
          cardsPayload.map(c => ({ name: c.name, hebrewName: c.hebrewName, symbol: c.symbol })),
          spreadType
        );
        readingsStorage.save({
          type: "tarot",
          title: `${t.readings_type_tarot}`,
          subtitle: cards.map(c => c.hebrewName).join(" • "),
          symbol: "🔮",
          data: { spread: spreadType, cards },
        });
      },
      (err) => { setAiLoading(false); toast(err); },
      selectedQuestion || undefined,
      language,
    );
  }, [selectedQuestion, language, t, setActiveReading, selectedCardIndices, drawnCards]);

  useEffect(() => {
    if (phase === "reveal") {
      const timer = setTimeout(handleRevealComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, handleRevealComplete]);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setPhase("question");
      setSelectedQuestion(null);
      setDrawnCards([]);
      setSelectedCardIndices(new Set());
      setFlippedIndices(new Set());
      setBurstIndices(new Set());
      setRevealedCard(null);
      setAiText("");
      setAiLoading(false);
      aiTextRef.current = "";
    }, 500);
  }, [onClose]);

  const handleBack = useCallback(() => {
    if (phase === "interpretation" || phase === "reveal") {
      handleClose();
    } else if (phase === "drawing") {
      setPhase("question");
      setSelectedQuestion(null);
      setDrawnCards([]);
      setSelectedCardIndices(new Set());
      setFlippedIndices(new Set());
    }
  }, [phase, handleClose]);

  const chosenCards = useMemo(
    () => Array.from(selectedCardIndices).map(i => drawnCards[i]),
    [selectedCardIndices, drawnCards]
  );

  if (!isOpen) return null;

  const overlay = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* ── Background: Oracle woman persists ── */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: phase === "question" ? 1.03 : 1.06 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <img
              src={heroFigure}
              alt=""
              className="w-full h-full object-cover"
              style={{
                objectPosition: isMobile ? "center calc(0% + 70px)" : "center calc(0% + 100px)",
                filter: `brightness(${phase === "reveal" ? 0.55 : phase === "drawing" ? 0.45 : 0.4})`,
                transition: "filter 1s ease-out",
              }}
            />
          </motion.div>

          {/* ── Mystical overlay gradients ── */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 65% 55% at 50% 50%, transparent 30%, hsl(var(--deep-blue) / 0.85) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, hsl(var(--deep-blue) / 0.6) 0%, transparent 30%)" }}
            />
          </div>

          {/* ── Subtle ambient glow from hands area ── */}
          <AnimatePresence>
            {(phase === "drawing" || phase === "reveal") && (
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: "25%",
                  right: "25%",
                  bottom: isMobile ? "35%" : "38%",
                  height: "20%",
                  background: "radial-gradient(ellipse 100% 100% at 50% 80%, hsl(var(--gold) / 0.05) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          {/* ── Ambient particles ── */}
          {[...Array(isMobile ? 10 : 20)].map((_, i) => (
            <motion.div
              key={`p-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: i % 3 === 0 ? 3 : 1.5,
                height: i % 3 === 0 ? 3 : 1.5,
                left: `${5 + Math.random() * 90}%`,
                top: `${15 + Math.random() * 70}%`,
                background: i % 2 === 0 ? "hsl(var(--gold) / 0.5)" : "hsl(var(--celestial) / 0.4)",
              }}
              animate={{
                opacity: [0, 0.7, 0],
                y: [0, -(20 + Math.random() * 30)],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeOut",
              }}
            />
          ))}

          {/* ── Close button ── */}
          <motion.button
            className="fixed top-5 left-5 z-[95] w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer"
            style={{
              background: "hsl(var(--deep-blue) / 0.6)",
              border: "1px solid hsl(var(--gold) / 0.2)",
            }}
            onClick={handleClose}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-4 h-4 text-gold/70" />
          </motion.button>

          {/* ── Back button ── */}
          <AnimatePresence>
            {phase !== "question" && phase !== "interpretation" && (
              <motion.button
                className="fixed top-5 left-16 z-[95] w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer"
                style={{
                  background: "hsl(var(--deep-blue) / 0.6)",
                  border: "1px solid hsl(var(--gold) / 0.2)",
                }}
                onClick={handleBack}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-4 h-4 text-gold/70" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* ── Phase Content ── */}
          <div className="absolute inset-0 z-[92] flex items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              {/* ─── PHASE 1: Question Selection ─── */}
              {phase === "question" && (
                <motion.div
                  key="question"
                  className="pointer-events-auto text-center w-full max-w-lg px-6"
                  style={{ marginTop: isMobile ? "30vh" : "25vh" }}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="text-gold/50 text-[11px] tracking-[0.3em] uppercase font-body mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {language === "he" ? "קריאת טארוט" : "Tarot Reading"}
                  </motion.div>
                  <motion.h2
                    className="font-heading text-2xl md:text-3xl mb-8"
                    style={{
                      color: "hsl(var(--gold))",
                      textShadow: "0 0 20px hsl(var(--gold) / 0.3)",
                      lineHeight: 1.3,
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    {language === "he" ? "על מה תרצה לקבל מסר?" : language === "ar" ? "ما الذي تريد معرفته؟" : language === "ru" ? "О чём вы хотите узнать?" : "What would you like guidance on?"}
                  </motion.h2>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {questionOptions.map((opt, i) => (
                      <motion.button
                        key={opt.key}
                        type="button"
                        className="relative rounded-xl p-4 md:p-5 backdrop-blur-xl cursor-pointer border-0 appearance-none outline-none group"
                        style={{
                          background: selectedQuestion === opt.key
                            ? `linear-gradient(145deg, hsl(${opt.color} / 0.2), hsl(${opt.color} / 0.08))`
                            : "linear-gradient(145deg, hsl(var(--deep-blue-light) / 0.6), hsl(var(--deep-blue) / 0.4))",
                          border: selectedQuestion === opt.key
                            ? `1px solid hsl(${opt.color} / 0.5)`
                            : "1px solid hsl(var(--gold) / 0.12)",
                          boxShadow: selectedQuestion === opt.key
                            ? `0 0 30px hsl(${opt.color} / 0.15)`
                            : "0 4px 20px hsl(var(--deep-blue) / 0.3)",
                          transition: "all 0.3s ease-out",
                        }}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ scale: 1.04, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleQuestionSelect(opt.key)}
                      >
                        <div
                          className="flex flex-col items-center gap-2"
                          style={{ color: `hsl(${opt.color})` }}
                        >
                          {opt.icon}
                          <span className="font-heading text-sm md:text-base tracking-wide">
                            {opt.label}
                          </span>
                        </div>
                        <motion.div
                          className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background: `radial-gradient(circle, hsl(${opt.color} / 0.08), transparent 70%)`,
                          }}
                        />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ─── PHASE 2: Card Drawing ─── */}
              {phase === "drawing" && (
                <motion.div
                  key="drawing"
                  className="pointer-events-auto text-center w-full px-4"
                  style={{ marginTop: isMobile ? "32vh" : "28vh" }}
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="text-gold/50 font-heading text-base md:text-lg mb-1"
                    style={{ textShadow: "0 0 20px hsl(var(--gold) / 0.2)" }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {selectedCardIndices.size < 3
                      ? (language === "he"
                        ? `בחרו ${3 - selectedCardIndices.size} קלפים`
                        : `Choose ${3 - selectedCardIndices.size} cards`)
                      : (language === "he" ? "הקלפים נבחרו ✦" : "Cards chosen ✦")}
                  </motion.div>
                  <motion.div
                    className="text-foreground/30 font-body text-xs mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: selectedCardIndices.size < 3 ? 0.7 : 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    {language === "he" ? "הקשיבו לאינטואיציה" : "Listen to your intuition"}
                  </motion.div>

                  {/* Card fan — cinematic arc */}
                  <div
                    className="relative flex items-center justify-center mx-auto"
                    style={{
                      height: isMobile ? 180 : 280,
                      maxWidth: isMobile ? 340 : 520,
                    }}
                  >
                    {drawnCards.map((card, i) => (
                      <FloatingCard
                        key={`card-${i}`}
                        card={card}
                        index={i}
                        isSelected={selectedCardIndices.has(i)}
                        isFlipped={flippedIndices.has(i)}
                        onClick={() => handleCardSelect(i)}
                        totalCards={drawnCards.length}
                        isMobile={isMobile}
                        showBurst={burstIndices.has(i)}
                      />
                    ))}
                  </div>

                  {/* Minimal progress dots */}
                  <motion.div
                    className="mt-6 flex items-center justify-center gap-2.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 1 }}
                  >
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          background: i < selectedCardIndices.size
                            ? "hsl(var(--gold))"
                            : "hsl(var(--gold) / 0.15)",
                          boxShadow: i < selectedCardIndices.size
                            ? "0 0 8px hsl(var(--gold) / 0.5)"
                            : "none",
                        }}
                        animate={i < selectedCardIndices.size ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.4 }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* ─── PHASE 3: Reveal ─── */}
              {phase === "reveal" && (
                <motion.div
                  key="reveal"
                  className="pointer-events-none text-center"
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-end justify-center gap-5 md:gap-8">
                    {chosenCards.map((card, i) => {
                      const isCenter = i === 1;
                      const w = isMobile ? (isCenter ? 105 : 90) : (isCenter ? 170 : 150);
                      const h = w * 1.55;
                      return (
                        <motion.div
                          key={card.name}
                          className="relative"
                          style={{ width: w, height: h }}
                          initial={{ opacity: 0, y: 40, rotateY: 180 }}
                          animate={{ opacity: 1, y: 0, rotateY: 0 }}
                          transition={{ delay: i * 0.4 + 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {/* Shadow on table */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              width: "85%",
                              height: "10%",
                              bottom: -10,
                              left: "7.5%",
                              background: "radial-gradient(ellipse, hsl(0 0% 0% / 0.5) 0%, transparent 70%)",
                              filter: "blur(8px)",
                            }}
                          />
                          <img
                            src={tarotCardImages[card.name] || cardBack}
                            alt={card.hebrewName}
                            className="w-full h-full object-cover rounded-lg"
                            style={{
                              imageRendering: "auto",
                              boxShadow: isCenter
                                ? "0 0 50px hsl(var(--gold) / 0.4), 0 12px 40px hsl(var(--deep-blue) / 0.7)"
                                : "0 0 30px hsl(var(--gold) / 0.2), 0 8px 28px hsl(var(--deep-blue) / 0.5)",
                              filter: isCenter ? "none" : "brightness(0.85)",
                            }}
                          />
                          <div
                            className="absolute inset-0 rounded-lg pointer-events-none"
                            style={{
                              boxShadow: `inset 0 0 ${isCenter ? 10 : 6}px 1px hsl(var(--gold) / ${isCenter ? 0.18 : 0.1}), inset 0 1px 0 hsl(var(--gold) / 0.15)`,
                            }}
                          />
                          <motion.div
                            className="absolute -inset-2 rounded-xl pointer-events-none"
                            style={{ border: `1px solid hsl(var(--gold) / ${isCenter ? 0.35 : 0.15})` }}
                            animate={{
                              boxShadow: isCenter
                                ? [
                                    "0 0 20px hsl(var(--gold) / 0.15)",
                                    "0 0 40px hsl(var(--gold) / 0.35)",
                                    "0 0 20px hsl(var(--gold) / 0.15)",
                                  ]
                                : [
                                    "0 0 10px hsl(var(--gold) / 0.06)",
                                    "0 0 20px hsl(var(--gold) / 0.12)",
                                    "0 0 10px hsl(var(--gold) / 0.06)",
                                  ],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                          />
                          <motion.div
                            className="absolute -bottom-7 left-0 right-0 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.4 + 1 }}
                          >
                            <span className="font-heading text-sm md:text-base text-gold/85">
                              {card.hebrewName}
                            </span>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Burst particles */}
                  {[...Array(12)].map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    return (
                      <motion.div
                        key={`burst-${i}`}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: 3,
                          height: 3,
                          left: "50%",
                          top: "50%",
                          background: i % 2 === 0 ? "hsl(var(--gold))" : "hsl(var(--celestial))",
                        }}
                        initial={{ x: 0, y: 0, opacity: 0 }}
                        animate={{
                          x: Math.cos(angle) * 120,
                          y: Math.sin(angle) * 120,
                          opacity: [0, 0.8, 0],
                          scale: [0, 2, 0],
                        }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      />
                    );
                  })}
                </motion.div>
              )}

              {/* ─── PHASE 4: Interpretation ─── */}
              {phase === "interpretation" && (
                <motion.div
                  key="interpretation"
                  className="pointer-events-auto w-full px-4 md:px-8 overflow-hidden"
                  style={{ maxWidth: isMobile ? "100%" : "72rem", marginTop: isMobile ? "3vh" : "3vh", maxHeight: isMobile ? "92vh" : "90vh" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Cards — primary visual focus */}
                  <motion.div
                    className="flex items-end justify-center gap-3 md:gap-6 mb-6 md:mb-8"
                    initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {chosenCards.map((card, i) => {
                      const isCenter = i === 1;
                      const w = isMobile ? (isCenter ? 115 : 95) : (isCenter ? 200 : 170);
                      const h = w * 1.55;
                      return (
                        <motion.div
                          key={card.name}
                          className="relative flex flex-col items-center"
                          initial={{ opacity: 0, y: 30, scale: 0.85 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {/* Background blur/focus layer */}
                          <div
                            className="absolute -inset-4 rounded-2xl pointer-events-none"
                            style={{
                              background: isCenter
                                ? "radial-gradient(ellipse, hsl(var(--gold) / 0.06) 0%, transparent 70%)"
                                : "none",
                              filter: "blur(12px)",
                            }}
                          />
                          {/* Card shadow */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              width: "80%",
                              height: 12,
                              bottom: 28,
                              left: "10%",
                              background: "radial-gradient(ellipse, hsl(0 0% 0% / 0.6) 0%, transparent 70%)",
                              filter: "blur(10px)",
                            }}
                          />
                          <div className="relative" style={{ width: w, height: h }}>
                            <img
                              src={tarotCardImages[card.name] || cardBack}
                              alt={card.hebrewName}
                              className="w-full h-full object-cover rounded-xl"
                              style={{
                                imageRendering: "auto",
                                boxShadow: isCenter
                                  ? "0 0 60px hsl(var(--gold) / 0.35), 0 16px 48px hsl(0 0% 0% / 0.6)"
                                  : "0 0 30px hsl(var(--gold) / 0.18), 0 10px 32px hsl(0 0% 0% / 0.5)",
                                filter: isCenter ? "contrast(1.05) saturate(1.05)" : "brightness(0.85) contrast(1.02)",
                              }}
                            />
                            {/* Inner glow overlay */}
                            <div
                              className="absolute inset-0 rounded-xl pointer-events-none"
                              style={{
                                boxShadow: `inset 0 0 ${isCenter ? 14 : 8}px 2px hsl(var(--gold) / ${isCenter ? 0.2 : 0.1}), inset 0 1px 0 hsl(var(--gold) / 0.2)`,
                              }}
                            />
                            {/* Pulsing outer glow for center card */}
                            {isCenter && (
                              <motion.div
                                className="absolute -inset-1.5 rounded-xl pointer-events-none"
                                style={{ border: "1px solid hsl(var(--gold) / 0.25)" }}
                                animate={{
                                  boxShadow: [
                                    "0 0 15px hsl(var(--gold) / 0.1)",
                                    "0 0 35px hsl(var(--gold) / 0.25)",
                                    "0 0 15px hsl(var(--gold) / 0.1)",
                                  ],
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              />
                            )}
                          </div>
                          {/* Card name */}
                          <motion.span
                            className="font-heading mt-3 text-center"
                            style={{
                              fontSize: isCenter ? (isMobile ? 13 : 16) : (isMobile ? 11 : 14),
                              color: isCenter ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.7)",
                              textShadow: isCenter ? "0 0 12px hsl(var(--gold) / 0.3)" : "none",
                              letterSpacing: "0.05em",
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 + i * 0.15 }}
                          >
                            {card.hebrewName}
                          </motion.span>
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  {/* Interpretation text — delayed entry */}
                  <motion.div
                    ref={scrollRef}
                    className="mx-auto rounded-2xl overflow-y-auto"
                    style={{
                      maxWidth: isMobile ? "100%" : "52rem",
                      maxHeight: isMobile ? "42vh" : "48vh",
                      background: "linear-gradient(165deg, hsl(222 45% 8% / 0.92), hsl(222 50% 5% / 0.95))",
                      border: "1px solid hsl(var(--gold) / 0.12)",
                      boxShadow: "0 0 40px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(var(--gold) / 0.06)",
                    }}
                    initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="p-6 md:p-10">
                      {/* Section title */}
                      <motion.h3
                        className="font-heading text-center mb-6"
                        style={{
                          fontSize: isMobile ? "1.15rem" : "1.5rem",
                          color: "hsl(var(--gold))",
                          textShadow: "0 0 20px hsl(var(--gold) / 0.25)",
                          letterSpacing: "0.08em",
                        }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      >
                        {language === "he" ? "✦ הפירוש שלך ✦" : "✦ Your Reading ✦"}
                      </motion.h3>

                      {aiText ? (
                        <motion.div
                          className="font-body text-foreground/90"
                          style={{
                            fontSize: isMobile ? "1.05rem" : "1.25rem",
                            lineHeight: isMobile ? 1.7 : 1.8,
                            maxWidth: "48rem",
                            margin: "0 auto",
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8, duration: 0.5 }}
                        >
                          {renderMysticalText(aiText)}
                        </motion.div>
                      ) : aiLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-8 h-8 text-gold/50" />
                          </motion.div>
                          <p className="text-gold/50 font-body text-lg">
                            {language === "he" ? "מפענחת את המסר..." : "Deciphering the message..."}
                          </p>
                        </div>
                      ) : null}

                      {aiLoading && aiText && (
                        <motion.span
                          className="inline-block w-1.5 h-5 bg-gold/50 rounded-full ml-1 align-middle"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Bottom CTA */}
                  {!aiLoading && aiText && (
                    <motion.div
                      className="mt-6 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.button
                        type="button"
                        className="btn-gold font-heading text-sm tracking-wider cursor-pointer"
                        onClick={handleClose}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {language === "he" ? "סיום ✦" : "Finish ✦"}
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(overlay, document.body) : null;
};

export default ImmersiveTarotExperience;

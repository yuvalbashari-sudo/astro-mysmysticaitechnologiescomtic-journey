import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import AvatarHoverTeaser from "./AvatarHoverTeaser";
import AdvisorChatPanel from "./AdvisorChatPanel";
import AstrologerAvatarButton from "./AstrologerAvatarButton";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Briefcase, DollarSign, Sparkles, ChevronLeft } from "lucide-react";
import { createPortal } from "react-dom";
import heroFigure from "@/assets/hero-mystic-figure.jpg";
import { drawReadingCards, type ReadingCard } from "@/data/allTarotCards";
import { majorArcanaCards, getCardName, type MajorArcanaCard } from "@/data/majorArcanaCards";
import { tarotCardImages, cardBack } from "@/data/tarotCardImages";
import cardFrameImg from "@/assets/tarot/card-frame.png";
import { tarotMemory } from "@/lib/tarotMemory";
import { mysticalProfile } from "@/lib/mysticalProfile";
import { readingsStorage } from "@/lib/readingsStorage";
import { renderMysticalText } from "@/lib/aiStreaming";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useCardName } from "@/hooks/useCardName";
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

/* ── Premium Floating Card ──────────────── */
const FloatingCard = ({
  card, index, isSelected, isFlipped, onClick, totalCards, isMobile, showBurst,
}: {
  card: ReadingCard; index: number; isSelected: boolean; isFlipped: boolean;
  onClick: () => void; totalCards: number; isMobile: boolean; showBurst: boolean;
}) => {
  const cardName = useCardName();
  const mid = (totalCards - 1) / 2;
  const distFromCenter = Math.abs(index - mid);
  const depthScale = 1 - distFromCenter * 0.02;
  const cardW = (isMobile ? 64 : 115) * depthScale;
  const cardH = cardW * 1.54;
  const spread = isMobile ? 44 : 72;
  const centerOffset = mid * spread;
  const x = index * spread - centerOffset;
  const arcY = distFromCenter * distFromCenter * (isMobile ? 3 : 4.5);
  const baseRotation = (index - mid) * (isMobile ? 4 : 3);
  const floatDelay = index * 0.4;

  const [showFront, setShowFront] = useState(false);

  useEffect(() => {
    if (isFlipped && !showFront) {
      const timer = setTimeout(() => setShowFront(true), 320);
      return () => clearTimeout(timer);
    }
  }, [isFlipped, showFront]);

  const hasCustomImage = !!tarotCardImages[card.name.en];
  const frontImgSrc = tarotCardImages[card.name.en] || card.image || cardBack;

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
        y: isSelected ? -(isMobile ? 70 : 100) : arcY,
        rotateZ: isSelected ? 0 : baseRotation,
        scale: isSelected ? (isMobile ? 1.38 : 1.45) : depthScale,
      }}
      transition={{ duration: 0.65, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={!isSelected && !isFlipped ? {
        y: arcY - (isMobile ? 16 : 22),
        scale: depthScale * 1.04,
        transition: { duration: 0.25, ease: "easeOut" },
      } : {}}
      onClick={!isSelected ? onClick : undefined}
    >
      <motion.div
        className="w-full h-full relative"
        animate={{ y: [0, -2.5, 0, 2, 0] }}
        transition={{ duration: 5, delay: floatDelay, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Cinematic radial light behind selected card */}
        {isSelected && showFront && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: "250%", height: "250%",
              left: "-75%", top: "-75%",
              background: "radial-gradient(circle, hsl(var(--gold) / 0.12) 0%, hsl(var(--gold) / 0.04) 35%, transparent 65%)",
              filter: "blur(12px)",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6], scale: 1 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Ambient glow behind card */}
        <motion.div
          className="absolute pointer-events-none rounded-xl"
          style={{
            inset: -6,
            background: isSelected && showFront
              ? "radial-gradient(ellipse, hsl(var(--gold) / 0.18) 0%, transparent 70%)"
              : "radial-gradient(ellipse, hsl(var(--celestial) / 0.06) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
          animate={{
            opacity: isSelected ? [0.7, 1, 0.7] : 0.5,
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Drop shadow — strong and soft */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: "90%", height: 14, bottom: -12, left: "5%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, hsl(0 0% 0% / 0.7) 0%, transparent 70%)",
            filter: "blur(8px)",
          }}
          animate={{
            opacity: isSelected ? 0.2 : 0.8,
            scaleX: isSelected ? 1.6 : 1,
            y: isSelected ? 28 : 0,
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Card body — rotates on Y, image swaps at midpoint */}
        <div style={{ perspective: 900, width: "100%", height: "100%" }}>
        <motion.div
          className="w-full h-full rounded-xl"
          animate={{
            rotateY: isFlipped ? 180 : 0,
            scale: isFlipped ? [1, 1.06, 1] : 1,
          }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="w-full h-full rounded-xl overflow-hidden relative"
            style={{
              boxShadow: showFront
                ? "0 0 50px hsl(var(--gold) / 0.3), 0 20px 55px hsl(0 0% 0% / 0.6), 0 0 2px hsl(var(--gold) / 0.4)"
                : `0 ${isSelected ? 24 : 12}px ${isSelected ? 48 : 28}px hsl(0 0% 0% / ${isSelected ? 0.6 : 0.5}), 0 0 1px hsl(var(--gold) / 0.2)`,
              transition: "box-shadow 0.3s ease-out",
            }}
          >
            {showFront && !hasCustomImage ? (
              <div className="w-full h-full flex flex-col items-center justify-center"
                style={{
                  background: "linear-gradient(160deg, hsl(222 40% 14%), hsl(222 47% 8%))",
                  border: "2px solid hsl(var(--gold) / 0.3)",
                  borderRadius: "inherit",
                }}>
                <span className="text-center font-heading text-gold px-2" style={{ fontSize: cardW > 90 ? "0.85rem" : "0.6rem", lineHeight: 1.3, textShadow: "0 0 12px hsl(var(--gold) / 0.4)" }}>
                  {card.symbol}
                </span>
                <span className="text-center font-heading text-gold/90 px-2 mt-1" style={{ fontSize: cardW > 90 ? "0.75rem" : "0.5rem", lineHeight: 1.3 }}>
                  {cardName(card.name.en, card.name.he)}
                </span>
              </div>
            ) : (
              <img
                src={showFront ? frontImgSrc : cardBack}
                alt={showFront ? cardName(card.name.en, card.name.he) : ""}
                className="w-full h-full object-cover"
                style={{
                  backfaceVisibility: "hidden",
                  transform: `translateZ(0)${showFront ? " scaleX(-1)" : ""}`,
                  willChange: "transform",
                }}
              />
            )}
            {/* Premium frame overlay */}
            <img
              src={cardFrameImg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                transform: showFront ? "scaleX(-1)" : "none",
                opacity: 0.8,
                mixBlendMode: "screen",
              }}
            />
            {/* Specular highlight — glossy sheen */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, hsl(0 0% 100% / 0.07) 0%, transparent 35%, transparent 65%, hsl(0 0% 100% / 0.02) 100%)",
                borderRadius: "inherit",
              }}
            />
            {/* Inner glow — edge lighting */}
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                boxShadow: showFront
                  ? "inset 0 0 14px 2px hsl(var(--gold) / 0.12), inset 0 1px 0 hsl(var(--gold) / 0.18)"
                  : "inset 0 0 8px 1px hsl(var(--gold) / 0.06), inset 0 1px 0 hsl(var(--gold) / 0.08)",
                transition: "box-shadow 0.3s ease-out",
              }}
            />
          </div>
        </motion.div>
        </div>

        {/* Enhanced reveal burst — multi-layer */}
        <AnimatePresence>
          {showBurst && (
            <>
              {/* Core flash */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.6) 0%, hsl(var(--gold) / 0.15) 40%, transparent 70%)" }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 0], scale: [0.6, 1.5, 2] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              {/* Soft outer halo */}
              <motion.div
                className="absolute -inset-8 rounded-2xl pointer-events-none"
                style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.2) 0%, transparent 60%)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              {/* Radial particles */}
              {[...Array(10)].map((_, pi) => {
                const a = (pi / 10) * Math.PI * 2;
                const dist = 35 + Math.random() * 30;
                const size = 2 + Math.random() * 2;
                return (
                  <motion.div
                    key={`bp-${pi}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: size, height: size,
                      left: "50%", top: "50%",
                      background: pi % 3 === 0 ? "hsl(var(--celestial) / 0.9)" : "hsl(var(--gold) / 0.9)",
                    }}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{
                      x: Math.cos(a) * dist,
                      y: Math.sin(a) * dist,
                      opacity: [0, 1, 0],
                      scale: [0, 1.8, 0],
                    }}
                    transition={{ duration: 0.8, delay: pi * 0.03, ease: "easeOut" }}
                  />
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* Pulsing glow ring on selected card — slow, elegant */}
        {isSelected && showFront && (
          <motion.div
            className="absolute -inset-2 rounded-xl pointer-events-none"
            style={{ border: "1px solid hsl(var(--gold) / 0.2)" }}
            animate={{
              boxShadow: [
                "0 0 14px hsl(var(--gold) / 0.08)",
                "0 0 32px hsl(var(--gold) / 0.2)",
                "0 0 14px hsl(var(--gold) / 0.08)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Card name under revealed card */}
        <AnimatePresence>
          {showFront && isSelected && (
            <motion.div
              className="absolute left-0 right-0 text-center pointer-events-none"
              style={{ top: cardH + 12 }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span
                className="font-heading text-gold"
                style={{
                  fontSize: isMobile ? 10 : 13,
                  textShadow: "0 0 14px hsl(var(--gold) / 0.4), 0 1px 3px hsl(0 0% 0% / 0.6)",
                  letterSpacing: "0.05em",
                }}
              >
                {cardName(card.name.en, card.name.he)}
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
  const cardName = useCardName();
  const { setActiveReading } = useReadingContext();
  const [phase, setPhase] = useState<Phase>("question");
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [drawnCards, setDrawnCards] = useState<MajorArcanaCard[]>([]);
  const [selectedCardIndices, setSelectedCardIndices] = useState<Set<number>>(new Set());
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [revealedCard, setRevealedCard] = useState<MajorArcanaCard | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [textSizeLevel, setTextSizeLevel] = useState<0 | 1 | 2>(0);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const questionOptions = useMemo((): QuestionOption[] => [
    {
      key: "love",
      icon: <Heart className="w-12 h-12" />,
      label: t.imm_tarot_category_love,
      color: "340 60% 55%",
    },
    {
      key: "career",
      icon: <Briefcase className="w-12 h-12" />,
      label: t.imm_tarot_category_career,
      color: "215 60% 55%",
    },
    {
      key: "money",
      icon: <DollarSign className="w-12 h-12" />,
      label: t.imm_tarot_category_money,
      color: "43 80% 55%",
    },
    {
      key: "general",
      icon: <Sparkles className="w-12 h-12" />,
      label: t.imm_tarot_category_general,
      color: "270 50% 60%",
    },
  ], [language, t]);

  const handleQuestionSelect = useCallback((key: string) => {
    setSelectedQuestion(key);
    setTimeout(() => {
      setDrawnCards(drawMajorArcana(7));
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
      t.tarot_pos_past,
      t.tarot_pos_present,
      t.tarot_pos_future,
    ];

    const cards = Array.from(selectedCardIndices).map(i => drawnCards[i]);
    const cardsPayload = cards.map((c, i) => ({
      hebrewName: c.name.he,
      symbol: c.symbol,
      name: c.name.en,
      localizedName: getCardName(c, language),
      positionLabel: posLabels[i] || "",
    }));

    const spreadType = selectedQuestion === "love" ? "love" : selectedQuestion === "career" ? "career" : "timeline";
    const selectedQuestionLabel = questionOptions.find((option) => option.key === selectedQuestion)?.label || selectedQuestion || t.imm_tarot_category_general;

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
          label: `${t.readings_type_tarot} — ${selectedQuestionLabel}`,
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
          subtitle: cards.map(c => cardName(c.name.en, c.name.he)).join(" • "),
          symbol: "🔮",
          data: { spread: spreadType, cards: cards.map(c => ({ name: c.name.en, id: c.id })) },
        });
      },
      (err) => { setAiLoading(false); toast(err); },
      selectedQuestion || undefined,
      language,
    );
  }, [selectedQuestion, language, t, setActiveReading, selectedCardIndices, drawnCards, questionOptions]);

  useEffect(() => {
    if (phase === "reveal") {
      const timer = setTimeout(handleRevealComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, handleRevealComplete]);

  const handleClose = useCallback(() => {
    onClose();
    setAdvisorOpen(false);
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
          className="fixed inset-0 z-[140] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* ── Background: Oracle woman persists ── */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
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

          

          {/* ── Phase Content ── */}
          <div className={`absolute inset-0 z-[92] pointer-events-none ${phase === "interpretation" ? "" : "flex items-center justify-center"}`}>
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
                    className="text-gold/50 text-[22px] tracking-[0.3em] uppercase font-body mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {t.imm_tarot_label}
                  </motion.div>
                  <motion.h2
                    className="font-heading text-4xl md:text-5xl mb-10"
                    style={{
                      color: "hsl(var(--gold))",
                      textShadow: "0 0 20px hsl(var(--gold) / 0.3)",
                      lineHeight: 1.3,
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    {t.imm_tarot_question_title}
                  </motion.h2>

                  <div className="grid grid-cols-2 gap-5 md:gap-6">
                    {questionOptions.map((opt, i) => (
                      <motion.button
                        key={opt.key}
                        type="button"
                        className="relative rounded-xl p-8 md:p-10 backdrop-blur-xl cursor-pointer border-0 appearance-none outline-none group"
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
                          className="flex flex-col items-center gap-3"
                          style={{ color: `hsl(${opt.color})` }}
                        >
                          {opt.icon}
                          <span className="font-heading text-xl md:text-2xl tracking-wide">
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
                    className="text-gold font-heading font-bold mb-2"
                    style={{ fontSize: isMobile ? "1.8rem" : "3rem", textShadow: "0 0 30px hsl(var(--gold) / 0.4)", letterSpacing: "0.05em" }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {selectedCardIndices.size < 3
                      ? t.imm_tarot_choose_cards.replace("{n}", String(3 - selectedCardIndices.size))
                      : t.imm_tarot_cards_chosen}
                  </motion.div>
                  <motion.div
                    className="font-heading font-bold tracking-wider"
                    style={{
                      fontSize: isMobile ? "1.5rem" : "2.2rem",
                      color: "hsl(var(--gold))",
                      textShadow: "0 0 30px hsl(var(--gold) / 0.4), 0 0 60px hsl(var(--gold) / 0.15)",
                      letterSpacing: "0.08em",
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: selectedCardIndices.size < 3 ? 1 : 0,
                      scale: 1,
                      textShadow: [
                        "0 0 30px hsl(43 80% 55% / 0.4), 0 0 60px hsl(43 80% 55% / 0.15)",
                        "0 0 40px hsl(43 80% 55% / 0.6), 0 0 80px hsl(43 80% 55% / 0.25)",
                        "0 0 30px hsl(43 80% 55% / 0.4), 0 0 60px hsl(43 80% 55% / 0.15)",
                      ],
                    }}
                    transition={{ delay: 0.5, duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {t.imm_tarot_listen_intuition}
                  </motion.div>

                  {/* Card fan — cinematic arc */}
                  <div
                    className="relative flex items-center justify-center mx-auto"
                    style={{
                      height: isMobile ? 180 : 280,
                      maxWidth: isMobile ? 340 : 520,
                      zIndex: 10,
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
                          key={card.name.en}
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
                          <div className="relative w-full h-full">
                            <img
                              src={tarotCardImages[card.name.en] || cardBack}
                              alt={cardName(card.name.en, card.name.he)}
                              className="w-full h-full object-cover rounded-lg"
                              style={{
                                imageRendering: "-webkit-optimize-contrast" as any,
                                backfaceVisibility: "hidden",
                                transform: "translateZ(0)",
                                boxShadow: isCenter
                                  ? "0 0 50px hsl(var(--gold) / 0.4), 0 12px 40px hsl(var(--deep-blue) / 0.7)"
                                  : "0 0 30px hsl(var(--gold) / 0.2), 0 8px 28px hsl(var(--deep-blue) / 0.5)",
                                filter: isCenter
                                  ? "contrast(1.1) saturate(1.08)"
                                  : "brightness(0.85) contrast(1.06)",
                                willChange: "transform",
                              }}
                            />
                            <img
                              src={cardFrameImg}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-lg"
                              style={{ opacity: 0.85, mixBlendMode: "screen" }}
                            />
                            <div
                              className="absolute inset-0 pointer-events-none rounded-lg"
                              style={{ background: "linear-gradient(135deg, hsl(0 0% 100% / 0.06) 0%, transparent 40%)" }}
                            />
                            <div
                              className="absolute inset-0 rounded-lg pointer-events-none"
                              style={{
                                boxShadow: `inset 0 0 ${isCenter ? 12 : 7}px 1px hsl(var(--gold) / ${isCenter ? 0.18 : 0.1}), inset 0 1px 0 hsl(var(--gold) / 0.15)`,
                              }}
                            />
                          </div>
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
                              {cardName(card.name.en, card.name.he)}
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
                  className="pointer-events-auto w-full overflow-hidden"
                  style={{ maxHeight: isMobile ? "92vh" : "90vh" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {isMobile ? (
                    /* ── Mobile: stacked layout (unchanged) ── */
                    <div className="px-4" style={{ marginTop: "3vh" }}>
                      {/* Cards row */}
                      <motion.div
                        className="flex items-end justify-center gap-3 mb-6"
                        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {chosenCards.map((card, i) => {
                          const isCenter = i === 1;
                          const w = isCenter ? 166 : 137;
                          const h = w * 1.55;
                          return (
                            <motion.div
                              key={card.name.en}
                              className="relative flex flex-col items-center"
                              initial={{ opacity: 0, y: 30, scale: 0.85 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ delay: 0.2 + i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <div className="relative" style={{ width: w, height: h }}>
                                <img
                                  src={tarotCardImages[card.name.en] || cardBack}
                                  alt={cardName(card.name.en, card.name.he)}
                                  className="w-full h-full object-cover rounded-xl"
                                  style={{
                                    imageRendering: "-webkit-optimize-contrast" as any,
                                    backfaceVisibility: "hidden",
                                    transform: "translateZ(0)",
                                    boxShadow: isCenter
                                      ? "0 0 60px hsl(var(--gold) / 0.35), 0 16px 48px hsl(0 0% 0% / 0.6)"
                                      : "0 0 30px hsl(var(--gold) / 0.18), 0 10px 32px hsl(0 0% 0% / 0.5)",
                                    filter: isCenter ? "contrast(1.1) saturate(1.08)" : "brightness(0.85) contrast(1.06)",
                                    willChange: "transform",
                                  }}
                                />
                                <img src={cardFrameImg} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-xl" style={{ opacity: 0.85, mixBlendMode: "screen" }} />
                              </div>
                              <motion.span
                                className="font-heading mt-3 text-center"
                                style={{ fontSize: isCenter ? 26 : 22, color: isCenter ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.7)" }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 + i * 0.15 }}
                              >
                                {cardName(card.name.en, card.name.he)}
                              </motion.span>
                            </motion.div>
                          );
                        })}
                      </motion.div>

                      {/* Interpretation text */}
                      <motion.div
                        ref={scrollRef}
                        className="rounded-2xl overflow-y-auto"
                        style={{
                          maxHeight: "42vh",
                          background: "linear-gradient(165deg, hsl(222 45% 8% / 0.92), hsl(222 50% 5% / 0.95))",
                          border: "1px solid hsl(var(--gold) / 0.12)",
                          boxShadow: "0 0 40px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(var(--gold) / 0.06)",
                        }}
                        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="p-6">
                          {/* Text size control — mobile */}
                          <div className="flex items-center gap-1.5 mb-4" style={{ direction: "ltr" }}>
                            {([0, 1, 2] as const).map((level) => {
                              const labels = ["A", "A+", "A++"];
                              const active = textSizeLevel === level;
                              return (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => setTextSizeLevel(level)}
                                  className="font-heading cursor-pointer transition-all duration-200"
                                  style={{
                                    fontSize: `${0.6 + level * 0.07}rem`,
                                    padding: "3px 8px",
                                    borderRadius: "999px",
                                    background: active ? "hsl(var(--gold) / 0.12)" : "transparent",
                                    border: `1px solid ${active ? "hsl(var(--gold) / 0.3)" : "hsl(var(--gold) / 0.08)"}`,
                                    color: active ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.4)",
                                    boxShadow: active ? "0 0 10px hsl(var(--gold) / 0.08)" : "none",
                                  }}
                                >
                                  {labels[level]}
                                </button>
                              );
                            })}
                          </div>
                          <div style={{ zoom: [1, 1.15, 1.3][textSizeLevel], transition: "zoom 0.25s ease" }}>
                          <motion.h3
                            className="font-heading text-center mb-6"
                            style={{ fontSize: "1.15rem", color: "hsl(var(--gold))", textShadow: "0 0 20px hsl(var(--gold) / 0.25)", letterSpacing: "0.08em" }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                          >
                            {t.imm_tarot_your_reading}
                          </motion.h3>
                          {aiText ? (
                            <motion.div className="font-body text-foreground/90" style={{ fontSize: "1.05rem", lineHeight: 1.7 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                              {renderMysticalText(aiText)}
                            </motion.div>
                          ) : aiLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                                <Sparkles className="w-8 h-8 text-gold/50" />
                              </motion.div>
                              <p className="text-gold/50 font-body text-lg">{t.imm_tarot_deciphering}</p>
                            </div>
                          ) : null}
                          {aiLoading && aiText && (
                            <motion.span className="inline-block w-1.5 h-5 bg-gold/50 rounded-full ml-1 align-middle" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                          )}
                          </div>{/* end mobile zoom wrapper */}
                        </div>
                      </motion.div>

                      {!aiLoading && aiText && (
                        <motion.div className="mt-6 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                          <motion.button type="button" className="btn-gold font-heading text-sm tracking-wider cursor-pointer" onClick={handleClose} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                            {t.imm_tarot_finish}
                          </motion.button>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    /* ── Desktop: absolute 3-zone layout ── */
                    <div className="absolute inset-0">
                      {/* LEFT: Transparent overlay — text floats over the oracle */}
                      <motion.div
                        ref={scrollRef}
                        className="absolute overflow-y-auto pointer-events-auto scrollbar-hide"
                        style={{
                          top: "calc(12vh + 50px)",
                          left: "3vw",
                          width: "min(480px, calc(100vw - 560px))",
                          maxWidth: "480px",
                          maxHeight: "80vh",
                          /* No background, no box — pure transparent overlay */
                        }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {/* Subtle radiance behind text for legibility — NOT a box */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: "radial-gradient(ellipse 100% 80% at 50% 35%, hsl(222 47% 6% / 0.7), transparent 85%)",
                            filter: "blur(50px)",
                          }}
                        />

                        <div className="relative" style={{ padding: "0 16px 60px" }}>

                          {/* ── Text size control ── */}
                          <motion.div
                            className="flex items-center gap-1.5 mb-5"
                            style={{ direction: "ltr" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                          >
                            {([0, 1, 2] as const).map((level) => {
                              const labels = ["A", "A+", "A++"];
                              const active = textSizeLevel === level;
                              return (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => setTextSizeLevel(level)}
                                  className="font-heading cursor-pointer transition-all duration-200"
                                  style={{
                                    fontSize: `${0.65 + level * 0.08}rem`,
                                    padding: "4px 10px",
                                    borderRadius: "999px",
                                    background: active ? "hsl(var(--gold) / 0.12)" : "transparent",
                                    border: `1px solid ${active ? "hsl(var(--gold) / 0.3)" : "hsl(var(--gold) / 0.08)"}`,
                                    color: active ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.4)",
                                    boxShadow: active ? "0 0 12px hsl(var(--gold) / 0.1)" : "none",
                                    backdropFilter: "blur(8px)",
                                    textShadow: "0 2px 10px hsl(222 47% 6%)",
                                  }}
                                >
                                  {labels[level]}
                                </button>
                              );
                            })}
                          </motion.div>

                          <div style={{ zoom: [1, 1.15, 1.3][textSizeLevel], transition: "zoom 0.25s ease" }}>
                          {/* ── Emotional opening whisper ── */}
                          <motion.div
                            className="mb-8 text-center"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 1 }}
                          >
                            <motion.p
                              className="font-body italic"
                              style={{
                                fontSize: "1.05rem",
                                color: "hsl(var(--foreground) / 0.5)",
                                lineHeight: 1.8,
                                letterSpacing: "0.03em",
                                textShadow: "0 2px 30px hsl(222 47% 6%), 0 0 60px hsl(222 47% 6% / 0.9), 0 0 10px hsl(222 47% 6%)",
                              }}
                              animate={{ opacity: [0.4, 0.65, 0.4] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                              {t.imm_tarot_message_right_moment}
                            </motion.p>
                          </motion.div>

                          {/* Sacred ornament */}
                          <motion.div
                            className="flex items-center justify-center gap-4 mb-6"
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                          >
                            <div className="h-px flex-1 max-w-[40px]" style={{ background: "linear-gradient(to right, transparent, hsl(var(--gold) / 0.25))" }} />
                            <span style={{ color: "hsl(var(--gold) / 0.35)", fontSize: "10px", letterSpacing: "0.4em", textShadow: "0 0 15px hsl(var(--gold) / 0.2)" }}>✦ ✦ ✦</span>
                            <div className="h-px flex-1 max-w-[40px]" style={{ background: "linear-gradient(to left, transparent, hsl(var(--gold) / 0.25))" }} />
                          </motion.div>

                          {/* Title — glowing inscription */}
                          <motion.h3
                            className="font-heading text-center mb-2"
                            style={{
                              fontSize: "1.5rem",
                              color: "hsl(var(--gold))",
                              textShadow: "0 0 50px hsl(var(--gold) / 0.3), 0 2px 30px hsl(222 47% 6%), 0 0 10px hsl(222 47% 6%)",
                              letterSpacing: "0.2em",
                            }}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4, duration: 0.8 }}
                          >
                            {t.imm_tarot_message_revealed}
                          </motion.h3>

                          {/* Whispered subtitle */}
                          <motion.p
                            className="font-body text-center italic mb-10"
                            style={{
                              fontSize: "0.82rem",
                              color: "hsl(var(--foreground) / 0.35)",
                              letterSpacing: "0.1em",
                              textShadow: "0 2px 25px hsl(222 47% 6%), 0 0 10px hsl(222 47% 6%)",
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.6 }}
                          >
                            {t.imm_tarot_cards_speak}
                          </motion.p>

                          {/* ── The living text ── */}
                          {aiText ? (
                            <motion.div
                              className="font-body"
                              style={{
                                maxWidth: "420px",
                                margin: "0 auto",
                                textShadow: "0 2px 30px hsl(222 47% 6%), 0 0 60px hsl(222 47% 6% / 0.85), 0 0 10px hsl(222 47% 6%)",
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.8, duration: 1 }}
                            >
                              {renderMysticalText(aiText)}
                            </motion.div>
                          ) : aiLoading ? (
                            <motion.div
                              className="flex flex-col items-center justify-center py-20 gap-7"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.0, duration: 0.6 }}
                            >
                              <motion.div
                                className="relative"
                                animate={{ scale: [1, 1.06, 1] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <div
                                  className="w-16 h-16 rounded-full flex items-center justify-center"
                                  style={{
                                    background: "radial-gradient(circle, hsl(var(--gold) / 0.1) 0%, transparent 70%)",
                                  }}
                                >
                                  <Sparkles className="w-5 h-5 text-gold/30" />
                                </div>
                                <motion.div
                                  className="absolute inset-0 rounded-full pointer-events-none"
                                  style={{ border: "1px solid hsl(var(--gold) / 0.08)" }}
                                  animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                                />
                              </motion.div>
                              <p className="text-gold/30 font-body text-sm tracking-[0.25em] italic"
                                style={{ textShadow: "0 2px 20px hsl(222 47% 6% / 0.9)" }}
                              >
                                {t.imm_tarot_deciphering}
                              </p>
                            </motion.div>
                          ) : null}

                          {/* Streaming cursor */}
                          {aiLoading && aiText && (
                            <motion.span
                              className="inline-block w-0.5 h-5 rounded-full ml-1 align-middle"
                              style={{ background: "hsl(var(--gold) / 0.35)" }}
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            />
                          )}

                          {/* ── Closing ritual ── */}
                          {!aiLoading && aiText && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.8, duration: 1 }}
                            >
                              <div className="h-10" />

                              <div className="flex items-center justify-center gap-3 mb-6">
                                <div className="h-px w-6" style={{ background: "linear-gradient(to right, transparent, hsl(var(--gold) / 0.15))" }} />
                                <motion.span
                                  style={{ color: "hsl(var(--gold) / 0.25)", fontSize: "7px", textShadow: "0 0 10px hsl(var(--gold) / 0.15)" }}
                                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                >
                                  ✦
                                </motion.span>
                                <div className="h-px w-6" style={{ background: "linear-gradient(to left, transparent, hsl(var(--gold) / 0.15))" }} />
                              </div>

                              <motion.p
                                className="text-center font-body italic mb-10"
                                style={{
                                  fontSize: "0.82rem",
                                  color: "hsl(var(--foreground) / 0.3)",
                                  letterSpacing: "0.06em",
                                  lineHeight: 1.8,
                                  textShadow: "0 2px 25px hsl(222 47% 6%), 0 0 10px hsl(222 47% 6%)",
                                }}
                                animate={{ opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                              >
                                {t.imm_tarot_breathe_message}
                              </motion.p>

                              <div className="text-center">
                                <motion.button
                                  type="button"
                                  className="font-heading text-sm tracking-[0.2em] cursor-pointer px-8 py-3 rounded-full"
                                  style={{
                                    background: "linear-gradient(135deg, hsl(var(--gold) / 0.12), hsl(var(--gold) / 0.06))",
                                    border: "1px solid hsl(var(--gold) / 0.2)",
                                    color: "hsl(var(--gold) / 0.85)",
                                    boxShadow: "0 0 30px hsl(var(--gold) / 0.06), 0 4px 20px hsl(0 0% 0% / 0.3)",
                                    backdropFilter: "blur(12px)",
                                  }}
                                  onClick={handleClose}
                                  whileHover={{
                                    scale: 1.04,
                                    y: -2,
                                    boxShadow: "0 0 40px hsl(var(--gold) / 0.12)",
                                    borderColor: "hsl(var(--gold) / 0.3)",
                                  }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  {t.imm_tarot_finish}
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                          </div>{/* end zoom wrapper */}
                        </div>
                      </motion.div>

                      {/* RIGHT: Tarot cards — anchored right, horizontal row */}
                      <motion.div
                        className="absolute flex flex-row items-end justify-center gap-4 pointer-events-none"
                        style={{
                          top: "calc(8vh + 50px)",
                          right: "2vw",
                          width: "min(520px, 35vw)",
                        }}
                        initial={{ opacity: 0, x: 40, filter: "blur(6px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {chosenCards.map((card, i) => {
                          const isCenter = i === 1;
                          const w = isCenter ? 170 : 145;
                          const h = w * 1.55;
                          return (
                            <motion.div
                              key={card.name.en}
                              className="relative flex flex-col items-center"
                              initial={{ opacity: 0, y: 30, scale: 0.85 }}
                              animate={{ opacity: 1, y: isCenter ? -20 : 0, scale: 1 }}
                              transition={{ delay: 0.2 + i * 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <div
                                className="absolute -inset-4 rounded-2xl pointer-events-none"
                                style={{
                                  background: isCenter ? "radial-gradient(ellipse, hsl(var(--gold) / 0.06) 0%, transparent 70%)" : "none",
                                  filter: "blur(12px)",
                                }}
                              />
                              <div className="relative" style={{ width: w, height: h }}>
                                <img
                                  src={tarotCardImages[card.name.en] || cardBack}
                                  alt={cardName(card.name.en, card.name.he)}
                                  className="w-full h-full object-cover rounded-xl"
                                  style={{
                                    imageRendering: "-webkit-optimize-contrast" as any,
                                    backfaceVisibility: "hidden",
                                    transform: "translateZ(0)",
                                    boxShadow: isCenter
                                      ? "0 0 60px hsl(var(--gold) / 0.35), 0 16px 48px hsl(0 0% 0% / 0.6)"
                                      : "0 0 30px hsl(var(--gold) / 0.18), 0 10px 32px hsl(0 0% 0% / 0.5)",
                                    filter: isCenter ? "contrast(1.1) saturate(1.08)" : "brightness(0.85) contrast(1.06)",
                                    willChange: "transform",
                                  }}
                                />
                                <img src={cardFrameImg} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-xl" style={{ opacity: 0.85, mixBlendMode: "screen" }} />
                                <div className="absolute inset-0 pointer-events-none rounded-xl" style={{ background: "linear-gradient(135deg, hsl(0 0% 100% / 0.06) 0%, transparent 40%)" }} />
                                <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: `inset 0 0 ${isCenter ? 14 : 8}px 2px hsl(var(--gold) / ${isCenter ? 0.2 : 0.1}), inset 0 1px 0 hsl(var(--gold) / 0.2)` }} />
                                {isCenter && (
                                  <motion.div
                                    className="absolute -inset-1.5 rounded-xl pointer-events-none"
                                    style={{ border: "1px solid hsl(var(--gold) / 0.25)" }}
                                    animate={{ boxShadow: ["0 0 15px hsl(var(--gold) / 0.1)", "0 0 35px hsl(var(--gold) / 0.25)", "0 0 15px hsl(var(--gold) / 0.1)"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                  />
                                )}
                              </div>
                              <motion.span
                                className="font-heading mt-3 text-center"
                                style={{ fontSize: isCenter ? 30 : 26, color: isCenter ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.7)", textShadow: isCenter ? "0 0 12px hsl(var(--gold) / 0.3)" : "none", letterSpacing: "0.05em" }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 + i * 0.15 }}
                              >
                                {cardName(card.name.en, card.name.he)}
                              </motion.span>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Advisor chat panel */}
          <AdvisorChatPanel isOpen={advisorOpen} onClose={() => setAdvisorOpen(false)} forceRightAnchor />

          {/* Persistent Astrologer avatar — always visible across all phases */}
          <AvatarHoverTeaser
            disabled={isMobile}
            anchor="left"
            className="fixed flex items-center justify-center pointer-events-auto"
            style={{
              bottom: 5,
              right: isMobile ? 8 : 10,
              zIndex: 200,
            }}
          >
            <AstrologerAvatarButton
              size={isMobile ? 80 : 140}
              onClick={() => setAdvisorOpen(true)}
              entranceDelay={1.2}
              className="relative"
              style={{
                filter: "drop-shadow(0 0 18px hsl(270 60% 45% / 0.35)) drop-shadow(0 4px 12px hsl(222 47% 6% / 0.5))",
              }}
            />
          </AvatarHoverTeaser>

          {/* ── Close button — rendered last to sit on top of everything ── */}
          <motion.button
            className="fixed top-5 left-5 z-[200] w-[60px] h-[60px] rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer pointer-events-auto"
            style={{
              background: "hsl(var(--deep-blue) / 0.6)",
              border: "1px solid hsl(var(--gold) / 0.2)",
            }}
            onClick={handleClose}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6 text-gold/70" />
          </motion.button>

          {/* ── Back button ── */}
          <AnimatePresence>
            {phase !== "question" && phase !== "interpretation" && (
              <motion.button
                className="fixed top-5 left-16 z-[200] w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer pointer-events-auto"
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

        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(overlay, document.body) : null;
};

export default ImmersiveTarotExperience;

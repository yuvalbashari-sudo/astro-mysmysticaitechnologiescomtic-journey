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

/* ── Energy Particle from hands to cards ── */
const EnergyParticle = ({ index, phase, isMobile }: { index: number; phase: Phase; isMobile: boolean }) => {
  const startX = (Math.random() - 0.5) * (isMobile ? 80 : 160);
  const startY = isMobile ? -60 : -100;
  const endY = isMobile ? 40 : 80;
  const duration = 2 + Math.random() * 2;
  const delay = Math.random() * 3;
  const size = 1.5 + Math.random() * 2;

  if (phase !== "drawing" && phase !== "reveal") return null;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: "50%",
        top: isMobile ? "38%" : "42%",
        background: index % 3 === 0
          ? "hsl(var(--gold) / 0.8)"
          : index % 3 === 1
            ? "hsl(270 60% 70% / 0.7)"
            : "hsl(var(--celestial) / 0.6)",
        filter: "blur(0.5px)",
      }}
      animate={{
        x: [startX, startX * 0.3 + (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40],
        y: [startY, startY * 0.3, endY],
        opacity: [0, 0.9, 0.6, 0],
        scale: [0.5, 1.2, 0.8, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
};

/* ── Mystical Table Surface ── */
const MysticalTable = ({ phase, isMobile }: { phase: Phase; isMobile: boolean }) => {
  const showTable = phase === "drawing" || phase === "reveal";

  return (
    <AnimatePresence>
      {showTable && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            bottom: isMobile ? "8%" : "5%",
            width: isMobile ? "95%" : "70%",
            maxWidth: 900,
            height: isMobile ? "30%" : "35%",
            perspective: "800px",
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Table surface with perspective */}
          <div
            className="absolute inset-0 rounded-t-[40%] overflow-hidden"
            style={{
              transform: "rotateX(25deg)",
              transformOrigin: "bottom center",
              background: `
                radial-gradient(ellipse 80% 60% at 50% 40%,
                  hsl(25 30% 12% / 0.9) 0%,
                  hsl(20 25% 8% / 0.95) 40%,
                  hsl(15 20% 5% / 0.98) 80%,
                  transparent 100%
                )
              `,
              boxShadow: "inset 0 2px 30px hsl(var(--gold) / 0.06), inset 0 -2px 20px hsl(0 0% 0% / 0.4)",
            }}
          >
            {/* Wood grain texture overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  repeating-linear-gradient(
                    87deg,
                    transparent 0px,
                    hsl(25 40% 20% / 0.04) 2px,
                    transparent 4px,
                    hsl(20 30% 15% / 0.03) 8px
                  )
                `,
              }}
            />

            {/* Engraved mystical symbols - central circle */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: isMobile ? 120 : 220,
                height: isMobile ? 120 : 220,
                left: "50%",
                top: "40%",
                transform: "translate(-50%, -50%)",
                border: "1px solid hsl(var(--gold) / 0.08)",
                boxShadow: "0 0 20px hsl(var(--gold) / 0.04), inset 0 0 15px hsl(var(--gold) / 0.03)",
              }}
              animate={{
                boxShadow: [
                  "0 0 20px hsl(var(--gold) / 0.04), inset 0 0 15px hsl(var(--gold) / 0.03)",
                  "0 0 30px hsl(var(--gold) / 0.08), inset 0 0 20px hsl(var(--gold) / 0.06)",
                  "0 0 20px hsl(var(--gold) / 0.04), inset 0 0 15px hsl(var(--gold) / 0.03)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Inner engraved circle */}
            <div
              className="absolute rounded-full"
              style={{
                width: isMobile ? 70 : 130,
                height: isMobile ? 70 : 130,
                left: "50%",
                top: "40%",
                transform: "translate(-50%, -50%)",
                border: "1px solid hsl(var(--gold) / 0.05)",
              }}
            />

            {/* Engraved lines radiating outward */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`eng-${i}`}
                className="absolute"
                style={{
                  width: 1,
                  height: isMobile ? 30 : 55,
                  left: "50%",
                  top: "40%",
                  transformOrigin: "top center",
                  transform: `translate(-50%, 0) rotate(${i * 45}deg) translateY(${isMobile ? 35 : 65}px)`,
                  background: "hsl(var(--gold) / 0.06)",
                }}
              />
            ))}

            {/* Top light reflection on table */}
            <motion.div
              className="absolute inset-x-0 top-0"
              style={{
                height: "40%",
                background: "linear-gradient(to bottom, hsl(var(--gold) / 0.06) 0%, transparent 100%)",
              }}
              animate={{
                opacity: phase === "reveal" ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Table edge / front lip */}
          <div
            className="absolute bottom-0 left-[5%] right-[5%] rounded-b-lg"
            style={{
              height: isMobile ? 6 : 10,
              background: "linear-gradient(to bottom, hsl(25 25% 15% / 0.8), hsl(20 20% 8% / 0.9))",
              boxShadow: "0 4px 15px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(var(--gold) / 0.08)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Floating Card (on table) ──────────────── */
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
  const cardW = isMobile ? 62 : 105;
  const cardH = cardW * 1.55;
  const spread = isMobile ? 38 : 62;
  const centerOffset = ((totalCards - 1) / 2) * spread;
  const x = index * spread - centerOffset;
  const baseRotation = (index - (totalCards - 1) / 2) * 4.5;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        width: cardW,
        height: cardH,
        perspective: "1000px",
        zIndex: isSelected ? 20 : 10 - Math.abs(index - (totalCards - 1) / 2),
      }}
      initial={{ opacity: 0, y: 80, rotateZ: baseRotation }}
      animate={{
        opacity: 1,
        x,
        y: isSelected ? -50 : Math.abs(index - (totalCards - 1) / 2) * 6,
        rotateZ: isSelected ? 0 : baseRotation,
        scale: isSelected ? 1.18 : 1,
      }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={!isSelected ? {
        y: -24,
        scale: 1.08,
        transition: { duration: 0.3, ease: "easeOut" }
      } : {}}
      onClick={!isSelected ? onClick : undefined}
    >
      {/* Card shadow on table */}
      <motion.div
        className="absolute rounded-xl pointer-events-none"
        style={{
          width: "90%",
          height: "12%",
          bottom: -8,
          left: "5%",
          background: "radial-gradient(ellipse, hsl(0 0% 0% / 0.5) 0%, transparent 70%)",
          filter: "blur(6px)",
        }}
        animate={{
          opacity: isSelected ? 0.3 : 0.6,
          scaleX: isSelected ? 1.2 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="w-full h-full relative rounded-xl overflow-hidden"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          scale: isFlipped ? [1, 1.06, 1.02] : 1,
        }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            boxShadow: isSelected
              ? "0 0 40px hsl(var(--gold) / 0.5), 0 12px 40px hsl(var(--deep-blue) / 0.7), inset 0 0 12px hsl(var(--gold) / 0.15)"
              : "0 6px 24px hsl(var(--deep-blue) / 0.6), 0 0 12px hsl(270 50% 50% / 0.1), inset 0 0 8px hsl(var(--gold) / 0.06)",
            border: isSelected ? "1px solid hsl(var(--gold) / 0.4)" : "1px solid hsl(var(--gold) / 0.1)",
          }}
        >
          <img src={cardBack} alt="" className="w-full h-full object-cover" style={{ imageRendering: "auto" }} />
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              boxShadow: "inset 0 0 6px 1px hsl(var(--gold) / 0.12), inset 0 1px 0 hsl(var(--gold) / 0.15)",
            }}
          />
        </div>
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "0 0 50px hsl(var(--gold) / 0.35), 0 12px 40px hsl(var(--deep-blue) / 0.7), inset 0 0 12px hsl(var(--gold) / 0.12)",
            border: "1px solid hsl(var(--gold) / 0.3)",
          }}
        >
          <img src={tarotCardImages[card.name] || cardBack} alt={card.hebrewName} className="w-full h-full object-cover" style={{ imageRendering: "auto" }} />
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              boxShadow: "inset 0 0 8px 1px hsl(var(--gold) / 0.15), inset 0 1px 0 hsl(var(--gold) / 0.2)",
            }}
          />
        </div>
      </motion.div>

      {/* Light burst on reveal */}
      <AnimatePresence>
        {showBurst && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, hsl(var(--gold) / 0.6) 0%, hsl(var(--gold) / 0.15) 40%, transparent 70%)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.3, 1.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Card name under revealed card */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            className="absolute left-0 right-0 text-center pointer-events-none"
            style={{ top: cardH + 6 }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <span className="font-heading text-gold/80" style={{ fontSize: isMobile ? 9 : 11 }}>
              {card.hebrewName}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [auraIntensity, setAuraIntensity] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (phase === "drawing") setAuraIntensity(0.6);
    else if (phase === "reveal") setAuraIntensity(0.9);
    else if (phase === "interpretation") setAuraIntensity(0.5);
    else setAuraIntensity(0.3);
  }, [phase]);

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
            {/* Bottom gradient for table blending */}
            <AnimatePresence>
              {(phase === "drawing" || phase === "reveal") && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, hsl(20 15% 5% / 0.7) 0%, transparent 40%)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* ── Mystical Table ── */}
          <MysticalTable phase={phase} isMobile={isMobile} />

          {/* ── Soft upward light on oracle during card phases ── */}
          <AnimatePresence>
            {(phase === "drawing" || phase === "reveal") && (
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: "30%",
                  right: "30%",
                  bottom: isMobile ? "30%" : "35%",
                  height: "30%",
                  background: "radial-gradient(ellipse 100% 80% at 50% 100%, hsl(var(--gold) / 0.06) 0%, transparent 70%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
              />
            )}
          </AnimatePresence>

          {/* ── Energy particles from oracle hands toward cards ── */}
          {[...Array(isMobile ? 12 : 24)].map((_, i) => (
            <EnergyParticle key={`ep-${i}`} index={i} phase={phase} isMobile={isMobile} />
          ))}

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
                  style={{ marginTop: isMobile ? "38vh" : "36vh" }}
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="text-gold/60 font-heading text-lg md:text-xl mb-2"
                    style={{ textShadow: "0 0 15px hsl(var(--gold) / 0.25)" }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {language === "he"
                      ? `בחרו ${3 - selectedCardIndices.size} קלפים`
                      : `Choose ${3 - selectedCardIndices.size} cards`}
                  </motion.div>
                  <motion.div
                    className="text-foreground/40 font-body text-xs mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {language === "he" ? "הקשיבו לאינטואיציה ובחרו" : "Listen to your intuition and choose"}
                  </motion.div>

                  {/* Card fan — on the mystical table */}
                  <div className="relative flex items-center justify-center" style={{ height: isMobile ? 160 : 240 }}>
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

                  {/* Selected count indicator */}
                  <motion.div
                    className="mt-8 flex items-center justify-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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
                  className="pointer-events-auto w-full max-w-5xl px-4 md:px-8 overflow-hidden"
                  style={{ marginTop: isMobile ? "6vh" : "5vh", maxHeight: isMobile ? "88vh" : "85vh" }}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-8 md:gap-12`}>
                    {/* Left: Cards display */}
                    <motion.div
                      className={`flex ${isMobile ? "flex-row justify-center" : "flex-col items-center"} gap-4 ${isMobile ? "" : "w-56"} flex-shrink-0`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      {chosenCards.map((card, i) => {
                        const isCenter = i === 1;
                        const w = isMobile ? (isCenter ? 82 : 70) : (isCenter ? 135 : 115);
                        const h = w * 1.55;
                        return (
                          <motion.div
                            key={card.name}
                            className="relative"
                            style={{ width: w, height: h }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + i * 0.15 }}
                          >
                            <img
                              src={tarotCardImages[card.name] || cardBack}
                              alt={card.hebrewName}
                              className="w-full h-full object-cover rounded-lg"
                              style={{
                                imageRendering: "auto",
                                boxShadow: isCenter
                                  ? "0 0 35px hsl(var(--gold) / 0.3), 0 10px 30px hsl(var(--deep-blue) / 0.6)"
                                  : "0 0 20px hsl(var(--gold) / 0.15), 0 6px 20px hsl(var(--deep-blue) / 0.4)",
                                filter: isCenter ? "none" : "brightness(0.8)",
                              }}
                            />
                            <div
                              className="absolute inset-0 rounded-lg pointer-events-none"
                              style={{
                                boxShadow: `inset 0 0 ${isCenter ? 10 : 6}px 1px hsl(var(--gold) / ${isCenter ? 0.18 : 0.1}), inset 0 1px 0 hsl(var(--gold) / 0.15)`,
                              }}
                            />
                            <div className="text-center mt-2">
                              <span className={`font-heading ${isCenter ? "text-sm md:text-base text-gold/90" : "text-xs md:text-sm text-gold/60"}`}>
                                {card.hebrewName}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    {/* Right: Interpretation text */}
                    <motion.div
                      ref={scrollRef}
                      className="flex-1 rounded-2xl overflow-y-auto"
                      style={{
                        maxHeight: isMobile ? "50vh" : "72vh",
                        background: "linear-gradient(145deg, hsl(var(--deep-blue-light) / 0.7), hsl(var(--deep-blue) / 0.8))",
                        border: "1px solid hsl(var(--gold) / 0.1)",
                        boxShadow: "0 0 30px hsl(var(--deep-blue) / 0.4), inset 0 1px 0 hsl(var(--gold) / 0.05)",
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      <div className="p-6 md:p-10">
                        {aiText ? (
                          <div
                            className="font-body text-foreground/90 text-base md:text-lg"
                            style={{ lineHeight: 1.85 }}
                          >
                            {renderMysticalText(aiText)}
                          </div>
                        ) : aiLoading ? (
                          <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="w-7 h-7 text-gold/50" />
                            </motion.div>
                            <p className="text-gold/50 font-body text-base">
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
                  </div>

                  {/* Bottom CTA */}
                  {!aiLoading && aiText && (
                    <motion.div
                      className="mt-8 text-center"
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

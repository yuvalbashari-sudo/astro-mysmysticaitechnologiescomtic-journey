import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Heart, Briefcase, Eye, Compass, Crown, Share2, Copy, Check, Layers, Star, Sun, MessageCircle } from "lucide-react";
import { drawTarotCards, TarotCard } from "@/data/tarotData";
import { tarotCardImages, cardBack } from "@/data/tarotCardImages";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import { tarotMemory } from "@/lib/tarotMemory";
import { mysticalProfile } from "@/lib/mysticalProfile";
import ShareResultSection from "@/components/ShareResultSection";
import MysticalOnboarding from "@/components/MysticalOnboarding";
import { renderMysticalText } from "@/lib/aiStreaming";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import TarotShufflePhase from "@/components/TarotShufflePhase";
import TarotQuestionPhase from "@/components/TarotQuestionPhase";
import TarotAnalysisRitual from "@/components/TarotAnalysisRitual";

interface Props { isOpen: boolean; onClose: () => void; }

type SpreadType = "daily" | "love" | "career" | "decision" | "timeline" | "universe";

interface SpreadOption {
  key: SpreadType;
  icon: React.ReactNode;
  cardCount: number;
  positionLabels: string[];
  descKey: string;
}

// These will be populated with translations inside the component
function getSpreadOptions(t: ReturnType<typeof useT>): SpreadOption[] {
  return [
    { key: "timeline", icon: <Compass className="w-7 h-7" />, cardCount: 3, positionLabels: [t.tarot_pos_past, t.tarot_pos_present, t.tarot_pos_future], descKey: "tarot_spread_timeline_desc" },
    { key: "love", icon: <Heart className="w-7 h-7" />, cardCount: 3, positionLabels: [t.tarot_pos_heart, t.tarot_pos_energy, t.tarot_pos_direction], descKey: "tarot_spread_love_desc" },
    { key: "career", icon: <Briefcase className="w-7 h-7" />, cardCount: 3, positionLabels: [t.tarot_pos_current, t.tarot_pos_challenge, t.tarot_pos_opportunity], descKey: "tarot_spread_career_desc" },
    { key: "decision", icon: <Eye className="w-7 h-7" />, cardCount: 3, positionLabels: [t.tarot_pos_dilemma, t.tarot_pos_hidden, t.tarot_pos_right_path], descKey: "tarot_spread_decision_desc" },
    { key: "daily", icon: <Sun className="w-7 h-7" />, cardCount: 1, positionLabels: [t.tarot_pos_daily_card], descKey: "tarot_spread_daily_desc" },
    { key: "universe", icon: <Star className="w-7 h-7" />, cardCount: 1, positionLabels: [t.tarot_pos_universe_msg], descKey: "tarot_spread_universe_desc" },
  ];
}

function getSpreadLabels(t: ReturnType<typeof useT>): Record<SpreadType, string> {
  return {
    timeline: t.tarot_spread_timeline,
    love: t.tarot_spread_love,
    career: t.tarot_spread_career,
    decision: t.tarot_spread_decision,
    daily: t.tarot_spread_daily,
    universe: t.tarot_spread_universe,
  };
}

// Stream AI tarot reading
async function streamTarotReading(
  spreadType: string,
  cards: { hebrewName: string; symbol: string; positionLabel: string; name: string }[],
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  userQuestion?: string,
  errorMessages?: { unexpected: string; service: string; connection: string },
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
      body: JSON.stringify({ spreadType, cards, context: { memoryContext, profileContext, userQuestion: userQuestion || undefined }, language: language || "he" }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({ error: errorMessages.unexpected }));
      onError(errData.error || errorMessages.service);
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
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
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
    onError(e instanceof Error ? e.message : errorMessages.connection);
  }
}

const TarotModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language } = useLanguage();
  const SPREAD_OPTIONS = getSpreadOptions(t);
  const SPREAD_LABELS = getSpreadLabels(t);

  const isMobileTarot = useIsMobile();
  const [selectedSpreadKey, setSelectedSpreadKey] = useState<SpreadType>("timeline");
  const selectedSpread = SPREAD_OPTIONS.find(s => s.key === selectedSpreadKey) || SPREAD_OPTIONS[0];
  const [cards, setCards] = useState<TarotCard[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTablePhase, setIsTablePhase] = useState(false);
  const [isShufflePhase, setIsShufflePhase] = useState(false);
  const [isQuestionPhase, setIsQuestionPhase] = useState(false);
  const [isAnalysisPhase, setIsAnalysisPhase] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [tableCards, setTableCards] = useState<TarotCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [activeRevealIndex, setActiveRevealIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // AI state
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const needsQuestion = selectedSpreadKey !== "daily";

  const handleDraw = () => {
    if (needsQuestion) {
      setIsQuestionPhase(true);
    } else {
      setIsLoading(true);
    }
  };

  const handleQuestionSubmit = (question: string) => {
    setUserQuestion(question);
    setIsQuestionPhase(false);
    if (question.trim()) {
      setIsAnalysisPhase(true);
    } else {
      setIsLoading(true);
    }
  };

  const handleAnalysisComplete = () => {
    setIsAnalysisPhase(false);
    setIsLoading(true);
  };

  const handleOnboardingComplete = () => {
    setIsLoading(false);
    setIsShufflePhase(true);
  };

  const handleShuffleComplete = () => {
    const drawn = drawTarotCards(selectedSpread.cardCount);
    setTableCards(drawn);
    setFlippedIndices(new Set());
    setIsShufflePhase(false);
    setIsTablePhase(true);
  };

  const handleCardFlip = (index: number) => {
    if (flippedIndices.has(index) || activeRevealIndex !== null) return;
    
    // Phase 1: Focus/lift (0.6s)
    setActiveRevealIndex(index);
    
    // Phase 2: Flip after lift
    setTimeout(() => {
      const newFlipped = new Set(flippedIndices);
      newFlipped.add(index);
      setFlippedIndices(newFlipped);
      
      // Phase 3: Reset active after reveal completes
      setTimeout(() => {
        setActiveRevealIndex(null);
        
        // All cards flipped → transition to results
        if (newFlipped.size === tableCards.length) {
          setTimeout(() => {
            setCards(tableCards);
            setIsTablePhase(false);
            startAIReading(tableCards);
            readingsStorage.save({
              type: "tarot",
              title: `${t.readings_type_tarot} — ${SPREAD_LABELS[selectedSpread.key]}`,
              subtitle: tableCards.map(c => c.hebrewName).join(" • "),
              symbol: "🔮",
              data: { spread: selectedSpread.key, cards: tableCards },
            });
          }, 1800);
        }
      }, 1200);
    }, 800);
  };


  const startAIReading = (drawnCards: TarotCard[]) => {
    setAiLoading(true);
    aiTextRef.current = "";
    setAiText("");

    const cardsPayload = drawnCards.map((c, i) => ({
      hebrewName: c.hebrewName,
      symbol: c.symbol,
      name: c.name,
      positionLabel: selectedSpread.positionLabels[i],
    }));

    streamTarotReading(
      selectedSpread.key,
      cardsPayload,
      (delta) => {
        aiTextRef.current += delta;
        setAiText(aiTextRef.current);
      },
      () => {
        setAiLoading(false);
        tarotMemory.recordReading(selectedSpread.key, cardsPayload);
        mysticalProfile.recordTarotCards(
          cardsPayload.map(c => ({ name: c.name, hebrewName: c.hebrewName, symbol: c.symbol })),
          selectedSpread.key
        );
      },
      (err) => { setAiLoading(false); toast(err); },
      userQuestion,
      { unexpected: t.tarot_error_unexpected, service: t.tarot_error_service, connection: t.tarot_error_connection },
      language,
    );
  };

  // Scroll to top when results appear
  useEffect(() => {
    if (cards && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [cards]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCards(null);
      setIsLoading(false);
      setIsTablePhase(false);
      setIsShufflePhase(false);
      setIsQuestionPhase(false);
      setIsAnalysisPhase(false);
      setUserQuestion("");
      setTableCards([]);
      setFlippedIndices(new Set());
      setActiveRevealIndex(null);
      setCopied(false);
      setAiText("");
      setAiLoading(false);
      aiTextRef.current = "";
      setSelectedSpreadKey("timeline");
    }, 300);
  };

  const handleShare = () => {
    if (!cards) return;
    const text = `🔮 ${t.readings_type_tarot} — ${SPREAD_LABELS[selectedSpread.key]}:\n${cards.map(c => `${c.symbol} ${c.hebrewName}`).join("\n")}\n\n✨ ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!cards) return;
    const textToCopy = aiText || cards.map(c => `${c.symbol} ${c.hebrewName}`).join(" • ");
    await navigator.clipboard.writeText(`🔮 ${textToCopy}`);
    setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          <motion.div
            ref={scrollRef}
            className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl mx-2 sm:mx-auto"
            style={{ background: "linear-gradient(145deg, hsl(222 40% 8% / 0.97), hsl(222 47% 6% / 0.98))", border: "1px solid hsl(var(--gold) / 0.2)", boxShadow: "0 0 60px hsl(var(--gold) / 0.1)" }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <button onClick={handleClose} className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors" style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}><X className="w-4 h-4 text-gold/70" /></button>
            <div className="absolute top-4 right-4 z-20"><span className="px-3 py-1 rounded-full text-[10px] font-bold font-body tracking-wider" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))", border: "1px solid hsl(var(--gold) / 0.3)", color: "hsl(var(--gold))" }}>{t.common_free}</span></div>

            <AnimatePresence mode="wait">
              {!cards && !isLoading && !isTablePhase && !isShufflePhase && !isQuestionPhase && !isAnalysisPhase ? (
                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-4 pt-10 pb-6 md:px-8 md:pt-14 md:pb-8 text-center relative overflow-hidden">

                  {/* Dark velvet table surface */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: `
                      radial-gradient(ellipse at 50% 100%, hsl(var(--gold) / 0.05) 0%, transparent 50%),
                      radial-gradient(ellipse at 50% 50%, hsl(222 35% 10%) 0%, hsl(222 47% 5%) 100%)
                    `,
                  }} />
                  {/* Floating dust particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div key={`dust-${i}`} className="absolute rounded-full pointer-events-none"
                      style={{ width: 1.5, height: 1.5, left: `${15 + Math.random() * 70}%`, top: `${20 + Math.random() * 60}%`, background: "hsl(var(--gold) / 0.25)" }}
                      animate={{ opacity: [0, 0.5, 0], y: [0, -15] }}
                      transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, delay: i * 1.2 }}
                    />
                  ))}

                  {/* Title area */}
                  <div className="relative z-10 mb-6 md:mb-10">
                    <h2 className="font-heading text-xl md:text-3xl gold-gradient-text mb-2">{t.tarot_title}</h2>
                    <p className="text-gold/35 font-body text-[11px] md:text-xs tracking-[0.15em]">{t.tarot_spread_choose}</p>
                  </div>

                  {/* ── Authentic Tarot Fan Spread ── */}
                  {(() => {
                    const fanCards = SPREAD_OPTIONS;
                    const count = fanCards.length;
                    const isMob = isMobileTarot;
                    const arcDeg = isMob ? 36 : 48;
                    const cardW = isMob ? 68 : 105;
                    const cardH = isMob ? 112 : 174;
                    const pivotR = isMob ? 180 : 280;
                    const containerH = isMob ? 230 : 350;

                    // Symbols for each spread type (engraved on the card face)
                    const spreadSymbols: Record<SpreadType, string> = {
                      timeline: "⏳",
                      love: "♡",
                      career: "⚝",
                      decision: "◈",
                      daily: "☀",
                      universe: "✧",
                    };

                    return (
                      <div className="relative mx-auto" style={{ height: containerH, maxWidth: isMob ? 340 : 620 }}>
                        {fanCards.map((spread, idx) => {
                          const step = arcDeg / (count - 1);
                          const angle = -arcDeg / 2 + idx * step;
                          const rad = (angle * Math.PI) / 180;
                          const tx = Math.sin(rad) * pivotR;
                          const ty = -Math.cos(rad) * pivotR + pivotR * 0.72;

                          return (
                            <motion.button
                              key={spread.key}
                              onClick={() => {
                                setSelectedSpreadKey(spread.key);
                                setTimeout(() => {
                                  if (spread.key !== "daily") {
                                    setIsQuestionPhase(true);
                                  } else {
                                    setIsLoading(true);
                                  }
                                }, 250);
                              }}
                              className="absolute cursor-pointer group"
                              style={{
                                width: cardW,
                                height: cardH,
                                left: "50%",
                                bottom: 0,
                                marginLeft: -cardW / 2,
                                transformOrigin: `50% ${pivotR + cardH / 2}px`,
                                zIndex: 10 + idx,
                                perspective: 600,
                              }}
                              initial={{ opacity: 0, y: 80, rotate: 0, scale: 0.7 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                x: tx,
                                rotate: angle,
                                scale: 1,
                                translateY: ty,
                              }}
                              transition={{ delay: 0.15 + idx * 0.08, type: "spring", stiffness: 100, damping: 16 }}
                              whileHover={{
                                translateY: ty - (isMob ? 18 : 30),
                                scale: 1.06,
                                zIndex: 50,
                                transition: { duration: 0.2 },
                              }}
                              whileTap={{ scale: 0.97 }}
                            >
                              {/* The tarot card */}
                              <div className="relative w-full h-full rounded-[4px] md:rounded-[6px] overflow-hidden" style={{
                                boxShadow: "0 6px 25px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), 0 0 1px hsl(var(--gold) / 0.15)",
                              }}>
                                {/* Card back image as base */}
                                <img src={cardBack} alt="" className="absolute inset-0 w-full h-full object-cover" style={{
                                  filter: "brightness(0.75) saturate(0.9)",
                                }} />

                                {/* Dark overlay to darken the back */}
                                <div className="absolute inset-0" style={{
                                  background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.4) 100%)",
                                }} />

                                {/* Golden shimmer sweep */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                  <div className="absolute inset-0" style={{
                                    background: "linear-gradient(105deg, transparent 35%, hsl(var(--gold) / 0.12) 45%, hsl(var(--gold) / 0.22) 50%, hsl(var(--gold) / 0.12) 55%, transparent 65%)",
                                    backgroundSize: "250% 100%",
                                    animation: `shimmer-sweep ${3 + idx * 0.5}s ease-in-out infinite`,
                                  }} />
                                </div>

                                {/* Gold thin border inset */}
                                <div className="absolute inset-[2px] md:inset-[3px] rounded-[3px] md:rounded-[4px]" style={{
                                  border: "1px solid hsl(var(--gold) / 0.2)",
                                }} />

                                {/* Center symbol */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 md:gap-2 z-10">
                                  <span className="text-lg md:text-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" style={{
                                    filter: "drop-shadow(0 0 6px hsl(var(--gold) / 0.3))",
                                    color: "hsl(var(--gold-light))",
                                  }}>
                                    {spreadSymbols[spread.key]}
                                  </span>
                                </div>

                                {/* Card name — appears on hover */}
                                <div className="absolute bottom-0 inset-x-0 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
                                  style={{
                                    background: "linear-gradient(transparent, rgba(0,0,0,0.85) 40%)",
                                    padding: isMob ? "6px 4px 5px" : "10px 6px 8px",
                                  }}
                                >
                                  <span className="font-heading text-[8px] md:text-[10px] text-gold/90 leading-tight block text-center">
                                    {SPREAD_LABELS[spread.key]}
                                  </span>
                                  <span className="text-[6px] md:text-[7px] text-gold/40 font-body block text-center mt-0.5">
                                    {spread.cardCount === 1 ? t.tarot_one_card : `${spread.cardCount} ${t.tarot_n_cards}`}
                                  </span>
                                </div>

                                {/* Hover golden edge glow */}
                                <div className="absolute inset-0 rounded-[4px] md:rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                  style={{
                                    boxShadow: "inset 0 0 12px hsl(var(--gold) / 0.1), 0 0 20px hsl(var(--gold) / 0.15)",
                                  }}
                                />
                              </div>
                            </motion.button>
                          );
                        })}

                        {/* Soft table glow beneath fan pivot */}
                        <div className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{
                          bottom: isMob ? -10 : -15,
                          width: isMob ? 180 : 300,
                          height: isMob ? 20 : 30,
                          background: "radial-gradient(ellipse, hsl(var(--gold) / 0.08), transparent 70%)",
                          filter: "blur(10px)",
                        }} />
                      </div>
                    );
                  })()}

                  <p className="relative z-10 text-[9px] md:text-[10px] text-muted-foreground/30 font-body mt-6">{t.tarot_note}</p>
                </motion.div>
              ) : isQuestionPhase ? (
                <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TarotQuestionPhase spreadType={selectedSpreadKey} spreadLabel={SPREAD_LABELS[selectedSpreadKey]} onSubmit={handleQuestionSubmit} /></motion.div>
              ) : isAnalysisPhase ? (
                <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TarotAnalysisRitual question={userQuestion} onComplete={handleAnalysisComplete} /></motion.div>
              ) : isLoading ? (
                <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MysticalOnboarding onComplete={handleOnboardingComplete} /></motion.div>
              ) : isShufflePhase ? (
                <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TarotShufflePhase onComplete={handleShuffleComplete} /></motion.div>
              ) : isTablePhase ? (
                <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden">
                  {/* Velvet table background */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 60%, hsl(222 35% 12%), hsl(222 45% 6%))" }} />
                  {/* Table edge glow */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 100%, hsl(var(--gold) / 0.06), transparent 50%)" }} />

                  {/* Darkening overlay when a card is being revealed */}
                  <AnimatePresence>
                    {activeRevealIndex !== null && (
                      <motion.div
                        className="absolute inset-0 z-20 pointer-events-none"
                        style={{ background: "hsl(222 45% 4% / 0.6)", backdropFilter: "blur(2px)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Floating particles */}
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={`tp-${i}`}
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

                  {/* Step indicator */}
                  <motion.div className="relative z-10 flex items-center justify-center gap-3 mb-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center gap-2">
                        <motion.div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-heading"
                          style={{
                            background: step <= 2 ? "linear-gradient(135deg, hsl(var(--gold) / 0.3), hsl(var(--gold) / 0.15))" : "hsl(var(--muted) / 0.2)",
                            border: `1px solid hsl(var(--gold) / ${step === 2 ? "0.5" : step === 1 ? "0.3" : "0.1"})`,
                            color: step <= 2 ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))",
                          }}
                        >
                          {step <= 1 ? "✓" : step}
                        </motion.div>
                        {step < 3 && <div className="w-8 h-px" style={{ background: `linear-gradient(90deg, hsl(var(--gold) / ${step < 2 ? "0.3" : "0.1"}), hsl(var(--gold) / 0.05))` }} />}
                      </div>
                    ))}
                  </motion.div>
                  <p className="relative z-10 text-gold/40 font-body text-[10px] tracking-wider mb-2">{t.tarot_step_label} 2 — {t.tarot_step2_desc}</p>

                  <motion.h3
                    className="relative z-10 font-heading text-lg gold-gradient-text mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {t.tarot_table_title}
                  </motion.h3>
                  <motion.p
                    className="relative z-10 text-foreground/40 font-body text-xs mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {t.tarot_table_hint}
                  </motion.p>

                  {/* Tarot table cards */}
                  <div className="relative z-30 flex items-center justify-center gap-4 sm:gap-6 mb-6">
                    {tableCards.map((card, i) => {
                      const isFlipped = flippedIndices.has(i);
                      const isActive = activeRevealIndex === i;
                      const cardW = tableCards.length === 1 ? 170 : 140;
                      const cardH = tableCards.length === 1 ? 245 : 205;
                      return (
                        <motion.div
                          key={i}
                          className="relative"
                          style={{ perspective: 1000, width: cardW, height: cardH, zIndex: isActive ? 50 : isFlipped ? 10 : 5, cursor: !isFlipped && activeRevealIndex === null ? "pointer" : "default" }}
                          initial={{ opacity: 0, y: 40, rotate: (i - Math.floor(tableCards.length / 2)) * 6 }}
                          animate={{
                            opacity: 1,
                            y: isActive ? -20 : 0,
                            rotate: isActive ? 0 : (i - Math.floor(tableCards.length / 2)) * 6,
                            scale: isActive ? 1.15 : 1,
                          }}
                          transition={isActive ? { duration: 0.6, ease: "easeOut" } : { delay: 0.6 + i * 0.2, type: "spring", stiffness: 200 }}
                          onClick={() => handleCardFlip(i)}
                          whileHover={!isFlipped && activeRevealIndex === null ? { y: -10, scale: 1.06 } : {}}
                          whileTap={!isFlipped && activeRevealIndex === null ? { scale: 0.97 } : {}}
                        >
                          {/* Pre-flip hover glow */}
                          {!isFlipped && !isActive && (
                            <motion.div
                              className="absolute -inset-3 rounded-xl pointer-events-none"
                              style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.08), transparent 70%)" }}
                              animate={{ opacity: [0.2, 0.5, 0.2] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                            />
                          )}

                          {/* Active reveal: intensified particle swirl */}
                          {isActive && (
                            <>
                              {[...Array(10)].map((_, pi) => (
                                <motion.div
                                  key={`swirl-${pi}`}
                                  className="absolute rounded-full pointer-events-none"
                                  style={{
                                    width: 2 + Math.random() * 3,
                                    height: 2 + Math.random() * 3,
                                    left: "50%",
                                    top: "50%",
                                    background: pi % 2 === 0 ? "hsl(var(--gold) / 0.8)" : "hsl(var(--celestial) / 0.6)",
                                  }}
                                  animate={{
                                    x: [0, Math.cos(pi * 0.628) * (40 + pi * 8), Math.cos(pi * 0.628) * (25 + pi * 5)],
                                    y: [0, Math.sin(pi * 0.628) * (40 + pi * 8) - 20, Math.sin(pi * 0.628) * (25 + pi * 5) - 30],
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                  }}
                                  transition={{ duration: 1.2, delay: pi * 0.06, ease: "easeOut" }}
                                />
                              ))}
                              {/* Golden glow around card */}
                              <motion.div
                                className="absolute -inset-4 rounded-2xl pointer-events-none"
                                style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.2), transparent 60%)" }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: [0, 0.8, 0.5], scale: [0.8, 1.3, 1.1] }}
                                transition={{ duration: 0.8 }}
                              />
                            </>
                          )}

                          {/* Energy pulse ring on flip */}
                          {isFlipped && (
                            <>
                              <motion.div
                                className="absolute pointer-events-none rounded-full"
                                style={{
                                  left: "50%", top: "50%",
                                  width: 20, height: 20,
                                  marginLeft: -10, marginTop: -10,
                                  border: "2px solid hsl(var(--gold) / 0.6)",
                                }}
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: [0, 8], opacity: [0.8, 0] }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                              />
                              <motion.div
                                className="absolute pointer-events-none rounded-full"
                                style={{
                                  left: "50%", top: "50%",
                                  width: 14, height: 14,
                                  marginLeft: -7, marginTop: -7,
                                  border: "1px solid hsl(var(--gold) / 0.4)",
                                }}
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: [0, 10], opacity: [0.5, 0] }}
                                transition={{ duration: 1.5, delay: 0.15, ease: "easeOut" }}
                              />
                              {/* Light burst */}
                              <motion.div
                                className="absolute -inset-6 pointer-events-none"
                                style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.35), transparent 50%)" }}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: [0, 1, 0.3], scale: [0.5, 1.5, 1] }}
                                transition={{ duration: 0.8 }}
                              />
                            </>
                          )}

                          <motion.div
                            className="relative w-full h-full"
                            style={{ transformStyle: "preserve-3d" }}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                          >
                            {/* Card back */}
                            <div
                              className="absolute inset-0 rounded-xl flex items-center justify-center"
                              style={{
                                backfaceVisibility: "hidden",
                                background: "linear-gradient(145deg, hsl(222 35% 14%), hsl(222 45% 8%))",
                                border: "1px solid hsl(var(--gold) / 0.2)",
                                boxShadow: isActive
                                  ? "0 15px 50px hsl(0 0% 0% / 0.6), 0 0 30px hsl(var(--gold) / 0.2)"
                                  : "0 8px 30px hsl(0 0% 0% / 0.4), 0 0 15px hsl(var(--gold) / 0.08)",
                              }}
                            >
                              <div className="w-[60%] h-[70%] rounded-lg border flex items-center justify-center" style={{ borderColor: "hsl(var(--gold) / 0.15)", background: "linear-gradient(135deg, hsl(var(--gold) / 0.06), hsl(var(--gold) / 0.02))" }}>
                                <motion.span
                                  className="text-gold/30 text-2xl"
                                  animate={isActive ? { opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] } : { opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.05, 0.95] }}
                                  transition={{ duration: isActive ? 0.6 : 2.5, repeat: Infinity, delay: isActive ? 0 : i * 0.3 }}
                                >
                                  ✦
                                </motion.span>
                              </div>
                            </div>

                            {/* Card front */}
                            <div
                              className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-1 p-2"
                              style={{
                                backfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                                background: "linear-gradient(145deg, hsl(222 30% 16%), hsl(222 40% 10%))",
                                border: "1.5px solid hsl(var(--gold) / 0.4)",
                                boxShadow: "0 10px 40px hsl(0 0% 0% / 0.5), 0 0 25px hsl(var(--gold) / 0.2)",
                              }}
                            >
                              {tarotCardImages[card.name]
                                ? <img src={tarotCardImages[card.name]} alt={card.hebrewName} className="w-[85%] h-[68%] object-cover rounded-lg" style={{ border: "1px solid hsl(var(--gold) / 0.25)", imageRendering: "auto" }} />
                                : <span className="text-5xl mb-1">{card.symbol}</span>}
                              <span className="font-heading text-xs md:text-sm text-gold text-center leading-tight mt-1.5">{card.hebrewName}</span>
                              <span className="text-[10px] text-muted-foreground/60 font-body">{selectedSpread.positionLabels[i]}</span>
                            </div>
                          </motion.div>

                          {/* Persistent breathing glow for revealed cards */}
                          {isFlipped && !isActive && (
                            <motion.div
                              className="absolute -inset-2 rounded-xl pointer-events-none"
                              style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.1), transparent 60%)" }}
                              animate={{ opacity: [0.3, 0.6, 0.3] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Card name reveal below table */}
                  <AnimatePresence>
                    {flippedIndices.size > 0 && (
                      <motion.div
                        className="relative z-10 flex flex-wrap items-center justify-center gap-3 mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {tableCards.map((card, i) => (
                          flippedIndices.has(i) && (
                            <motion.div
                              key={`name-${i}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                              style={{ background: "hsl(var(--gold) / 0.08)", border: "1px solid hsl(var(--gold) / 0.15)" }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <span className="text-sm">{card.symbol}</span>
                              <span className="font-heading text-xs text-gold">{card.hebrewName}</span>
                            </motion.div>
                          )
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Progress text */}
                  <motion.p
                    className="relative z-10 text-gold/50 font-body text-xs"
                    key={flippedIndices.size}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {flippedIndices.size === tableCards.length
                      ? t.tarot_table_all_revealed
                      : `${flippedIndices.size} / ${tableCards.length} ${t.tarot_table_progress}`}
                  </motion.p>
                </motion.div>
              ) : cards ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <motion.p className="text-gold/50 font-body text-xs mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{SPREAD_LABELS[selectedSpread.key]}</motion.p>
                    <motion.h2 className="font-heading text-2xl gold-gradient-text mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{t.tarot_cards_title}</motion.h2>

                    {/* Card display */}
                     <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 flex-wrap">
                      {cards.map((card, i) => (
                        <motion.div
                          key={i}
                          className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl"
                          style={{ background: "hsl(var(--gold) / 0.06)", border: "1px solid hsl(var(--gold) / 0.15)" }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.2 }}
                        >
                          {tarotCardImages[card.name]
                            ? <img src={tarotCardImages[card.name]} alt={card.hebrewName} className="w-20 h-28 sm:w-24 sm:h-34 md:w-28 md:h-40 object-cover rounded-lg shadow-lg" style={{ border: "1px solid hsl(var(--gold) / 0.2)" }} />
                            : <span className="text-4xl">{card.symbol}</span>}
                          <span className="font-body text-sm text-gold mt-1">{card.hebrewName}</span>
                          <span className="text-xs text-muted-foreground font-body">{selectedSpread.positionLabels[i]}</span>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div className="section-divider max-w-[120px] mx-auto" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8 }} />

                    {/* Share buttons */}
                    <motion.div className="flex items-center justify-center gap-3 mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                      <motion.button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-3.5 h-3.5" />{t.forecast_share}</motion.button>
                      <motion.button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? t.share_copied : t.share_copy}</motion.button>
                    </motion.div>
                  </div>

                  {/* AI Dynamic Interpretation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="rounded-2xl p-6 md:p-8 mt-6"
                    style={{ background: "linear-gradient(145deg, hsl(var(--deep-blue-light) / 0.6), hsl(var(--deep-blue) / 0.4))", border: "1px solid hsl(var(--gold) / 0.15)", boxShadow: "0 0 40px hsl(var(--gold) / 0.05)" }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <Layers className="w-5 h-5 text-gold" />
                      <h3 className="font-heading text-lg gold-gradient-text">{t.tarot_mystical_interp}</h3>
                    </div>

                     <div className="flex items-center justify-center gap-4 mb-6">
                      {cards.map((card, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                          {tarotCardImages[card.name]
                            ? <img src={tarotCardImages[card.name]} alt={card.hebrewName} className="w-14 h-20 md:w-16 md:h-22 object-cover rounded-md" style={{ border: "1px solid hsl(var(--gold) / 0.2)" }} />
                            : <span className="text-xl">{card.symbol}</span>}
                          <span className="text-xs text-gold/60 font-body">{card.hebrewName}</span>
                        </div>
                      ))}
                    </div>

                    <div className="section-divider max-w-[80px] mx-auto mb-6" />

                    {aiLoading && !aiText && (
                      <div className="flex items-center justify-center gap-2 py-8">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Sparkles className="w-5 h-5 text-gold" /></motion.div>
                        <span className="text-gold/70 font-body text-sm">{t.tarot_combined_loading}</span>
                      </div>
                    )}

                    {aiText && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} dir="rtl">
                        {renderMysticalText(aiText)}
                      </motion.div>
                    )}
                  </motion.div>

                  <ShareResultSection symbol={cards[0].symbol} title={cards.map(c => c.hebrewName).join(" • ")} subtitle={t.readings_type_tarot} />

                  {/* Premium CTA */}
                  <div className="section-divider max-w-[200px] mx-auto my-8" />
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-center rounded-xl p-6" style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))", border: "1px solid hsl(var(--gold) / 0.12)" }}>
                    <Crown className="w-6 h-6 text-gold mx-auto mb-3" />
                    <h4 className="font-heading text-base text-gold mb-2">{t.tarot_premium_title}</h4>
                    <p className="text-foreground/60 font-body text-xs mb-4 max-w-sm mx-auto leading-relaxed">{t.tarot_premium_desc}</p>
                    <a href="#premium" onClick={handleClose} className="btn-gold font-body text-xs inline-flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" />{t.tarot_premium_cta}</a>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TarotModal;

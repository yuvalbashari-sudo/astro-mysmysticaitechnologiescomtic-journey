import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Crown, Share2, Copy, Check, Lock, ChevronRight, Loader2 } from "lucide-react";
import { spreads, drawCardsForSpread, getInterpretation, type SpreadConfig, type TarotWorldCard } from "@/data/tarotWorldData";
import { tarotCardImages, cardBack } from "@/data/tarotCardImages";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import ShareResultSection from "@/components/ShareResultSection";
import DailyCardModal from "@/components/DailyCardModal";
import { useT } from "@/i18n/LanguageContext";

interface Props { isOpen: boolean; onClose: () => void; }

type Phase = "select" | "shuffle" | "reveal" | "showcase" | "result";

// Roman numeral converter
const toRoman = (n: number): string => {
  if (n === 0) return "0";
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  let r = "";
  for (let i = 0; i < vals.length; i++) { while (n >= vals[i]) { r += syms[i]; n -= vals[i]; } }
  return r;
};

// Floating particles
const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => (
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
);

// Smoke overlay
const SmokeEffect = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="absolute w-full h-full"
        style={{
          background: `radial-gradient(ellipse at ${30 + i * 20}% ${50 + i * 10}%, hsl(var(--crimson) / 0.04), transparent 70%)`,
        }}
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 2 }}
      />
    ))}
  </div>
);

// Stream AI reading
async function streamTarotReading(
  spreadType: string,
  cards: { hebrewName: string; symbol: string; positionLabel: string }[],
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tarot-reading`;
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ spreadType, cards }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({ error: "שגיאה לא צפויה" }));
      onError(errData.error || "שגיאה בשירות");
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

    // Flush remaining
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
    onError(e instanceof Error ? e.message : "שגיאה בחיבור");
  }
}

// Simple markdown-like renderer for Hebrew mystical text
function renderMysticalText(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      return;
    }
    if (trimmed === "---") {
      elements.push(<div key={i} className="section-divider max-w-[80px] mx-auto my-6" />);
      return;
    }
    if (trimmed.startsWith("### ✨")) {
      elements.push(
        <div key={i} className="mt-6 rounded-xl p-5 text-center" style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.06), hsl(var(--gold) / 0.04))", border: "1px solid hsl(var(--gold) / 0.12)" }}>
          <Sparkles className="w-5 h-5 text-gold mx-auto mb-2" />
          <h3 className="font-heading text-sm text-gold mb-2">{trimmed.replace("### ✨ ", "").replace("### ✨", "")}</h3>
        </div>
      );
      return;
    }
    if (trimmed.startsWith("### ")) {
      elements.push(
        <div key={i} className="flex items-center gap-3 mt-6 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(0 30% 15%), hsl(222 30% 12%))", border: "1px solid hsl(var(--gold) / 0.25)", boxShadow: "0 0 15px hsl(var(--gold) / 0.08)" }}>
            <span className="text-lg">{trimmed.match(/[\p{Emoji}]/u)?.[0] || "✦"}</span>
          </div>
          <h3 className="font-heading text-base text-gold">{trimmed.replace("### ", "")}</h3>
        </div>
      );
      return;
    }
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      const label = trimmed.slice(2, -2);
      elements.push(
        <div key={i} className="flex items-center gap-2 mt-4 mb-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--gold) / 0.1)" }}>
            <span className="text-xs">{label.match(/[\p{Emoji}]/u)?.[0] || "✦"}</span>
          </div>
          <h4 className="font-heading text-xs text-gold">{label.replace(/[\p{Emoji}]\s?/u, "").trim()}</h4>
        </div>
      );
      return;
    }
    if (trimmed.startsWith("״") || trimmed.startsWith('"')) {
      elements.push(
        <div key={i} className="rounded-xl p-4 text-center mt-2 mb-2" style={{ background: "hsl(var(--gold) / 0.04)", border: "1px solid hsl(var(--gold) / 0.1)" }}>
          <p className="text-gold/80 font-body text-sm leading-relaxed italic">{trimmed}</p>
        </div>
      );
      return;
    }
    // Regular paragraph
    elements.push(
      <p key={i} className="text-foreground/70 font-body text-sm leading-[1.85] text-right">{trimmed.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
    );
  });

  return <div className="space-y-0">{elements}</div>;
}

// Helper to get translated spread info
function useTranslatedSpread(t: ReturnType<typeof useT>) {
  const nameMap: Record<string, string> = {
    daily: t.tarot_world_spread_daily_name,
    timeline: t.tarot_world_spread_timeline_name,
    love: t.tarot_world_spread_love_name,
    career: t.tarot_world_spread_career_name,
    decision: t.tarot_world_spread_decision_name,
    universe: t.tarot_world_spread_universe_name,
  };
  const descMap: Record<string, string> = {
    daily: t.tarot_world_spread_daily_desc,
    timeline: t.tarot_world_spread_timeline_desc,
    love: t.tarot_world_spread_love_desc,
    career: t.tarot_world_spread_career_desc,
    decision: t.tarot_world_spread_decision_desc,
    universe: t.tarot_world_spread_universe_desc,
  };
  const posMap: Record<string, string[]> = {
    daily: [t.tarot_world_pos_today],
    timeline: [t.tarot_world_pos_past, t.tarot_world_pos_present, t.tarot_world_pos_future],
    love: [t.tarot_world_pos_heart, t.tarot_world_pos_energy, t.tarot_world_pos_direction],
    career: [t.tarot_world_pos_current, t.tarot_world_pos_challenge, t.tarot_world_pos_opportunity],
    decision: [t.tarot_world_pos_dilemma, t.tarot_world_pos_hidden, t.tarot_world_pos_right_path],
    universe: [t.tarot_world_pos_message],
  };
  return { nameMap, descMap, posMap };
}

const TarotWorldModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { nameMap, descMap, posMap } = useTranslatedSpread(t);
  const [phase, setPhase] = useState<Phase>("select");
  const [showDailyCard, setShowDailyCard] = useState(false);
  const [selectedSpread, setSelectedSpread] = useState<SpreadConfig | null>(null);
  const [drawnCards, setDrawnCards] = useState<TarotWorldCard[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [shuffleStep, setShuffleStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setPhase("select");
      setSelectedSpread(null);
      setDrawnCards([]);
      setRevealedIndices(new Set());
      setShuffleStep(0);
      setShowPremium(false);
      setAiText("");
      setAiLoading(false);
      setAiError(null);
      aiTextRef.current = "";
    }, 300);
  };

  const handleSelectSpread = (spread: SpreadConfig) => {
    // Intercept daily card to open dedicated modal
    if (spread.key === "daily") {
      setShowDailyCard(true);
      return;
    }

    setSelectedSpread(spread);
    setPhase("shuffle");
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setShuffleStep(step);
      if (step >= 8) {
        clearInterval(interval);
        const cards = drawCardsForSpread(spread);
        setDrawnCards(cards);
        setTimeout(() => setPhase("reveal"), 500);
      }
    }, 300);
  };

  const handleRevealCard = useCallback((index: number) => {
    if (!selectedSpread) return;
    if (revealedIndices.has(index)) return;
    
    if (!selectedSpread.isFree && revealedIndices.size >= selectedSpread.freeRevealCount) {
      setShowPremium(true);
      return;
    }
    
    setRevealedIndices(prev => new Set(prev).add(index));
  }, [selectedSpread, revealedIndices]);

  const allRevealed = selectedSpread && revealedIndices.size === selectedSpread.cardCount;

  useEffect(() => {
    if (allRevealed && selectedSpread && drawnCards.length > 0) {
      const timer = setTimeout(() => setPhase("showcase"), 1200);
      return () => clearTimeout(timer);
    }
  }, [allRevealed, selectedSpread, drawnCards]);

  // Trigger AI when entering result phase
  useEffect(() => {
    if (phase === "result" && selectedSpread && drawnCards.length > 0 && !aiText && !aiLoading) {
      setAiLoading(true);
      setAiError(null);
      aiTextRef.current = "";

      const cards = drawnCards.map((c, i) => ({
        hebrewName: c.hebrewName,
        symbol: c.symbol,
        positionLabel: posMap[selectedSpread.key]?.[i] || selectedSpread.positionLabels[i],
      }));

      streamTarotReading(
        selectedSpread.key,
        cards,
        (delta) => {
          aiTextRef.current += delta;
          setAiText(aiTextRef.current);
        },
        () => {
          setAiLoading(false);
          // Save reading
          readingsStorage.save({
            type: "tarot",
            title: `טארוט — ${nameMap[selectedSpread.key] || selectedSpread.hebrewName}`,
            subtitle: drawnCards.map(c => c.hebrewName).join(" • "),
            symbol: selectedSpread.icon,
            data: { spread: selectedSpread.key, cards: drawnCards.map(c => c.hebrewName), aiReading: aiTextRef.current },
          });
        },
        (err) => {
          setAiLoading(false);
          setAiError(err);
          toast(err);
        },
      );
    }
  }, [phase, selectedSpread, drawnCards, aiText, aiLoading]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (aiLoading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiText, aiLoading]);

  const handleShare = () => {
    if (!drawnCards.length || !selectedSpread) return;
    const text = `🔮 ${selectedSpread.hebrewName}:\n${drawnCards.map(c => `${c.symbol} ${c.hebrewName}`).join("\n")}\n\n✨ ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!drawnCards.length) return;
    const textToCopy = aiText || drawnCards.map(c => `${c.symbol} ${c.hebrewName}`).join(" • ");
    await navigator.clipboard.writeText(`🔮 ${textToCopy}`);
    setCopied(true);
    toast(t.share_copy_toast);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-background/85 backdrop-blur-xl" onClick={handleClose} />
          
          <motion.div
            ref={scrollRef}
            className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl"
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
            <SmokeEffect />

            <button onClick={handleClose} className="absolute top-4 left-4 z-30 w-9 h-9 rounded-full flex items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors" style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}>
              <X className="w-4 h-4 text-gold/70" />
            </button>

            <AnimatePresence mode="wait">
              {/* PHASE 1: Selection */}
              {phase === "select" && (
                <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }} className="relative p-6 md:p-10">
                  <div className="text-center mb-8">
                    <motion.div
                      className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center relative"
                      style={{ background: "radial-gradient(circle, hsl(var(--crimson) / 0.15), hsl(var(--gold) / 0.08), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}
                      animate={{ boxShadow: ["0 0 20px hsl(var(--gold) / 0.1)", "0 0 40px hsl(var(--gold) / 0.2)", "0 0 20px hsl(var(--gold) / 0.1)"] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <span className="text-3xl">🔮</span>
                    </motion.div>
                    <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-3">{t.tarot_world_title}</h2>
                    <p className="text-foreground/60 font-body text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                      {t.tarot_world_desc}
                    </p>
                  </div>
                  <div className="section-divider max-w-[150px] mx-auto mb-8" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {spreads.map((spread, i) => (
                      <motion.button
                        key={spread.key}
                        onClick={() => handleSelectSpread(spread)}
                        className="group relative text-right p-5 rounded-xl transition-all"
                        style={{
                          background: "linear-gradient(145deg, hsl(var(--deep-blue-light) / 0.5), hsl(0 20% 10% / 0.3))",
                          border: "1px solid hsl(var(--gold) / 0.1)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        whileHover={{
                          y: -3,
                          boxShadow: "0 8px 30px hsl(var(--gold) / 0.1), 0 0 20px hsl(var(--crimson) / 0.06)",
                          borderColor: "hsl(var(--gold) / 0.3)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--gold) / 0.08)", border: "1px solid hsl(var(--gold) / 0.12)" }}>
                            <span className="text-xl">{spread.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-heading text-sm text-gold group-hover:text-gold-light transition-colors">{spread.hebrewName}</h3>
                              {spread.isFree ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-body" style={{ background: "hsl(var(--gold) / 0.15)", border: "1px solid hsl(var(--gold) / 0.25)", color: "hsl(var(--gold))" }}>{t.tarot_world_free}</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-body" style={{ background: "hsl(var(--crimson) / 0.15)", border: "1px solid hsl(var(--crimson) / 0.25)", color: "hsl(var(--crimson-light))" }}>{t.tarot_world_premium}</span>
                              )}
                            </div>
                            <p className="text-foreground/50 font-body text-xs leading-relaxed">{spread.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gold/30 group-hover:text-gold/60 transition-colors flex-shrink-0 mt-1 rotate-180" />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <p className="text-center text-[10px] text-muted-foreground font-body mt-8">{t.tarot_world_daily_note}</p>
                </motion.div>
              )}

              {/* PHASE 2: Shuffle */}
              {phase === "shuffle" && (
                <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative p-12 md:p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="relative w-32 h-44 mb-8">
                    {[0, 1, 2, 3, 4].map(i => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-xl overflow-hidden"
                        style={{
                          border: "1px solid hsl(var(--gold) / 0.3)",
                          boxShadow: "0 4px 20px hsl(0 0% 0% / 0.3)",
                        }}
                        animate={{
                          x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 8) * Math.sin(shuffleStep * 0.8), 0],
                          y: [0, -5 - i * 3, 0],
                          rotate: [(i - 2) * 3, (i - 2) * 6 * Math.cos(shuffleStep * 0.5), (i - 2) * 3],
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <img src={cardBack} alt="Card" className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                  </div>
                  <motion.p className="font-body text-gold/80 text-base mb-2" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                    {t.tarot_world_shuffle}
                  </motion.p>
                  <p className="font-body text-foreground/40 text-xs">{t.tarot_world_shuffle_focus}</p>
                </motion.div>
              )}

              {/* PHASE 3: Reveal */}
              {phase === "reveal" && selectedSpread && (
                <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative p-6 md:p-10">
                  <div className="text-center mb-8">
                    <h2 className="font-heading text-2xl gold-gradient-text mb-2">{selectedSpread.hebrewName}</h2>
                    <p className="text-foreground/50 font-body text-sm">{t.tarot_world_reveal_hint}</p>
                  </div>

                  <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap mb-8">
                    {drawnCards.map((card, i) => {
                      const isRevealed = revealedIndices.has(i);
                      const isLocked = !selectedSpread.isFree && !isRevealed && revealedIndices.size >= selectedSpread.freeRevealCount;
                      return (
                        <motion.div
                          key={i}
                          className="relative cursor-pointer"
                          initial={{ opacity: 0, y: 30, rotateY: 0 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.2 }}
                          whileHover={!isRevealed ? { y: -8, scale: 1.05 } : {}}
                          onClick={() => handleRevealCard(i)}
                        >
                          <div className="relative w-28 h-40 md:w-36 md:h-52" style={{ perspective: "600px" }}>
                            <motion.div
                              className="absolute inset-0 rounded-xl overflow-hidden"
                              animate={{ rotateY: isRevealed ? 180 : 0 }}
                              transition={{ duration: 0.8, type: "spring", damping: 15 }}
                              style={{ transformStyle: "preserve-3d" }}
                            >
                              {/* Card back */}
                              <div
                                className="absolute inset-0 rounded-xl overflow-hidden"
                                style={{
                                  backfaceVisibility: "hidden",
                                  border: "2px solid hsl(var(--gold) / 0.3)",
                                  boxShadow: isLocked ? "0 0 20px hsl(var(--crimson) / 0.15)" : "0 0 25px hsl(var(--gold) / 0.15), 0 8px 30px hsl(0 0% 0% / 0.4)",
                                }}
                              >
                                <img src={cardBack} alt="Card back" className="w-full h-full object-cover" />
                                {/* Overlay for position label */}
                                <div className="absolute inset-0 flex flex-col items-center justify-end pb-3" style={{ background: "linear-gradient(to top, hsl(0 0% 0% / 0.7), transparent 40%)" }}>
                                  <span className="font-body text-[10px] text-gold/60">{selectedSpread.positionLabels[i]}</span>
                                  {isLocked && <span className="font-body text-[9px] text-crimson-light/60 mt-0.5">פרימיום</span>}
                                </div>
                                {isLocked && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                                    <Lock className="w-5 h-5 text-gold/40" />
                                  </div>
                                )}
                              </div>

                              {/* Card front */}
                              <div
                                className="absolute inset-0 rounded-xl overflow-hidden"
                                style={{
                                  backfaceVisibility: "hidden",
                                  transform: "rotateY(180deg)",
                                  border: "2px solid hsl(var(--gold) / 0.4)",
                                  boxShadow: "0 0 30px hsl(var(--gold) / 0.2), 0 8px 30px hsl(0 0% 0% / 0.4)",
                                }}
                              >
                                <img 
                                  src={tarotCardImages[card.name] || ""} 
                                  alt={card.hebrewName} 
                                  className="w-full h-full object-cover"
                                />
                                {/* Bottom overlay with card name */}
                                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-2 pt-6" style={{ background: "linear-gradient(to top, hsl(0 0% 0% / 0.8), transparent)" }}>
                                  <span className="font-heading text-[10px] md:text-xs text-gold text-center px-2 leading-tight"
                                    style={{ textShadow: "0 0 10px hsl(var(--gold) / 0.4)" }}>
                                    {card.hebrewName}
                                  </span>
                                  <span className="font-body text-[8px] md:text-[9px] text-foreground/40 mt-0.5">{selectedSpread.positionLabels[i]}</span>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                          {isRevealed && (
                            <motion.div
                              className="absolute -inset-2 rounded-2xl -z-10"
                              style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.12), transparent)" }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: [0.5, 1, 0.5], scale: 1 }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {showPremium && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center rounded-xl p-6 mb-4 max-w-md mx-auto"
                        style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.1), hsl(var(--gold) / 0.06))", border: "1px solid hsl(var(--gold) / 0.15)" }}
                      >
                        <Crown className="w-6 h-6 text-gold mx-auto mb-3" />
                        <h4 className="font-heading text-sm text-gold mb-2">{t.tarot_world_premium_title}</h4>
                        <p className="text-foreground/50 font-body text-xs mb-4 leading-relaxed">
                          {t.tarot_world_premium_desc}
                        </p>
                        <a href="#premium" onClick={handleClose} className="btn-gold font-body text-xs inline-flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" />{t.tarot_world_premium_cta}
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {allRevealed && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gold/60 font-body text-sm">
                      <Sparkles className="w-4 h-4 inline-block ml-1" />{t.tarot_world_all_revealed}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* PHASE 3.5: Showcase - Full card reveal */}
              {phase === "showcase" && selectedSpread && drawnCards.length > 0 && (
                <motion.div
                  key="showcase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative p-6 md:p-10 flex flex-col items-center justify-center min-h-[500px]"
                >
                  <motion.h2
                    className="font-heading text-2xl md:text-3xl gold-gradient-text mb-8 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {drawnCards.length === 1 ? t.tarot_world_cards_chosen_single : t.tarot_world_cards_chosen_plural}
                  </motion.h2>

                  <div className="flex items-center justify-center gap-6 flex-wrap mb-8">
                    {drawnCards.map((card, i) => (
                      <motion.div
                        key={i}
                        className="relative"
                        initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ delay: 0.3 + i * 0.3, duration: 0.8, type: "spring", damping: 12 }}
                      >
                        <div
                          className="relative w-44 h-64 md:w-56 md:h-80 rounded-xl overflow-hidden"
                          style={{
                            border: "2px solid hsl(var(--gold) / 0.5)",
                            boxShadow: "0 0 40px hsl(var(--gold) / 0.25), 0 0 80px hsl(215 70% 50% / 0.15), 0 20px 60px hsl(0 0% 0% / 0.5)",
                          }}
                        >
                          <img
                            src={tarotCardImages[card.name] || ""}
                            alt={card.hebrewName}
                            className="w-full h-full object-cover"
                          />
                          {/* Shimmer overlay */}
                          <motion.div
                            className="absolute inset-0"
                            style={{
                              background: "linear-gradient(105deg, transparent 40%, hsl(var(--gold) / 0.15) 45%, hsl(var(--gold) / 0.25) 50%, hsl(var(--gold) / 0.15) 55%, transparent 60%)",
                            }}
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2, delay: 0.8 + i * 0.3, ease: "easeInOut" }}
                          />
                        </div>
                        {/* Card name below */}
                        <motion.div
                          className="text-center mt-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + i * 0.3 }}
                        >
                          <span className="font-heading text-base md:text-lg text-gold" style={{ textShadow: "0 0 15px hsl(var(--gold) / 0.3)" }}>
                            {card.hebrewName}
                          </span>
                          <p className="font-body text-[11px] text-foreground/40 mt-1">{selectedSpread.positionLabels[i]}</p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Cosmic particles around cards */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: 2 + Math.random() * 3,
                          height: 2 + Math.random() * 3,
                          background: `hsl(var(--gold) / ${0.3 + Math.random() * 0.4})`,
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                        }}
                        animate={{
                          y: [0, -20 - Math.random() * 30, 0],
                          x: [0, (Math.random() - 0.5) * 20, 0],
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.5, 0.5],
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </motion.div>

                  {/* Continue button */}
                  <motion.button
                    className="btn-gold font-body text-sm mt-4 flex items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + drawnCards.length * 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPhase("result")}
                  >
                    <Sparkles className="w-4 h-4" />
                    גלו את הפירוש המלא
                  </motion.button>
                </motion.div>
              )}

              {/* PHASE 4: AI Results */}
              {phase === "result" && selectedSpread && drawnCards.length > 0 && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative p-6 md:p-10">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                      <span className="text-3xl">{selectedSpread.icon}</span>
                    </motion.div>
                    <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mt-3 mb-2">{selectedSpread.hebrewName}</h2>
                    <p className="text-foreground/50 font-body text-sm">{drawnCards.map(c => `${c.symbol} ${c.hebrewName}`).join("  •  ")}</p>
                    
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <motion.button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "hsl(142 70% 35% / 0.15)", border: "1px solid hsl(142 70% 45% / 0.25)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                        <Share2 className="w-3.5 h-3.5" />{t.forecast_share}
                      </motion.button>
                      <motion.button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "hsl(var(--gold) / 0.12)", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? t.share_copied : t.share_copy}
                      </motion.button>
                    </div>
                  </div>

                  <div className="section-divider max-w-[120px] mx-auto mb-8" />

                  {/* AI Generated Content */}
                  {aiText ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {renderMysticalText(aiText)}
                      
                      {aiLoading && (
                        <motion.div className="flex items-center justify-center gap-2 mt-6" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                          <Loader2 className="w-4 h-4 text-gold/60 animate-spin" />
                          <span className="font-body text-xs text-gold/50">{t.tarot_world_ai_loading}</span>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : aiError ? (
                    /* Fallback to static content on error */
                    <div className="space-y-8">
                      <div className="text-center rounded-xl p-4 mb-6" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}>
                        <p className="text-foreground/50 font-body text-xs">{aiError} — מציג פירוש קלאסי</p>
                      </div>
                      {drawnCards.map((card, i) => {
                        const isFreeLocked = !selectedSpread.isFree && i >= selectedSpread.freeRevealCount;
                        const interp = getInterpretation(card, selectedSpread.key, selectedSpread.positionLabels[i]);
                        return (
                          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.3 }}>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(0 30% 15%), hsl(222 30% 12%))", border: "1px solid hsl(var(--gold) / 0.25)", boxShadow: "0 0 20px hsl(var(--gold) / 0.1)" }}>
                                <span className="text-2xl">{card.symbol}</span>
                              </div>
                              <div className="text-right">
                                <h3 className="font-heading text-lg text-gold">{card.hebrewName}</h3>
                                <span className="font-body text-xs text-foreground/40">{interp.positionLabel}</span>
                              </div>
                            </div>
                            {isFreeLocked ? (
                              <div className="rounded-xl p-6 text-center" style={{ background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.4), hsl(0 20% 8% / 0.3))", border: "1px solid hsl(var(--gold) / 0.08)" }}>
                                <p className="text-foreground/40 font-body text-sm leading-relaxed mb-4" style={{ filter: "blur(3px)", userSelect: "none" }}>{interp.spreadMeaning.substring(0, 80)}...</p>
                                <Lock className="w-5 h-5 text-gold/30 mx-auto mb-2" />
                                <p className="text-foreground/40 font-body text-xs">הקלף הזה מחכה לכם בקריאה המלאה ✦</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.4), hsl(0 20% 8% / 0.3))", border: "1px solid hsl(var(--gold) / 0.08)" }}>
                                  <p className="text-foreground/70 font-body text-sm leading-[1.85] text-right">{interp.mainMeaning}</p>
                                </div>
                                <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.06), hsl(var(--gold) / 0.04))", border: "1px solid hsl(var(--gold) / 0.1)" }}>
                                  <p className="text-foreground/70 font-body text-sm leading-[1.85] text-right">{interp.spreadMeaning}</p>
                                </div>
                                <div className="rounded-xl p-4 text-center" style={{ background: "hsl(var(--gold) / 0.04)", border: "1px solid hsl(var(--gold) / 0.1)" }}>
                                  <p className="text-gold/80 font-body text-sm leading-relaxed italic">״{interp.advice}״</p>
                                </div>
                              </div>
                            )}
                            {i < drawnCards.length - 1 && <div className="section-divider max-w-[80px] mx-auto mt-8" />}
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Loading state */
                    <div className="flex flex-col items-center justify-center py-12">
                      <motion.div
                        className="w-16 h-16 rounded-full mb-6"
                        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <motion.p className="font-body text-gold/70 text-sm mb-1" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                        הקלפים מגלים את המסר שלהם...
                      </motion.p>
                      <p className="font-body text-foreground/30 text-xs">פירוש אישי נוצר עבורכם</p>
                    </div>
                  )}

                  {/* Share Section */}
                  {!aiLoading && (aiText || aiError) && (
                    <ShareResultSection
                      symbol={drawnCards[0]?.symbol || "🔮"}
                      title={selectedSpread.hebrewName}
                      subtitle={`${drawnCards.length} קלפים`}
                    />
                  )}

                  {/* Premium CTA */}
                  {!selectedSpread.isFree && !aiLoading && (aiText || aiError) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-center rounded-xl p-6 mt-8"
                      style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))", border: "1px solid hsl(var(--gold) / 0.12)" }}
                    >
                      <Crown className="w-6 h-6 text-gold mx-auto mb-3" />
                      <h4 className="font-heading text-base text-gold mb-2">{t.tarot_world_premium_title}</h4>
                      <p className="text-foreground/50 font-body text-xs mb-4 max-w-sm mx-auto leading-relaxed">
                        {t.tarot_world_premium_desc}
                      </p>
                      <a href="#premium" onClick={handleClose} className="btn-gold font-body text-xs inline-flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />{t.tarot_premium_cta}
                      </a>
                    </motion.div>
                  )}

                  {/* New reading */}
                  {!aiLoading && (
                    <div className="text-center mt-6">
                      <motion.button
                        onClick={() => { setPhase("select"); setSelectedSpread(null); setDrawnCards([]); setRevealedIndices(new Set()); setShowPremium(false); setAiText(""); setAiError(null); aiTextRef.current = ""; }}
                        className="font-body text-xs text-gold/50 hover:text-gold transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        ← קריאה חדשה
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Daily Card Modal */}
    <DailyCardModal isOpen={showDailyCard} onClose={() => setShowDailyCard(false)} />
    </>
  );
};

export default TarotWorldModal;

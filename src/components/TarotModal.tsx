import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Heart, Briefcase, Eye, Compass, Crown, Share2, Copy, Check, Layers, Star, Sun, MessageCircle } from "lucide-react";
import { drawTarotCards, TarotCard } from "@/data/tarotData";
import { tarotCardImages } from "@/data/tarotCardImages";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import ShareResultSection from "@/components/ShareResultSection";
import MysticalOnboarding from "@/components/MysticalOnboarding";
import { renderMysticalText } from "@/lib/aiStreaming";
import { useT } from "@/i18n/LanguageContext";

interface Props { isOpen: boolean; onClose: () => void; }

type SpreadType = "daily" | "love" | "career" | "decision" | "timeline" | "universe";

interface SpreadOption {
  key: SpreadType;
  icon: React.ReactNode;
  cardCount: number;
  positionLabels: string[];
}

// These will be populated with translations inside the component
function getSpreadOptions(t: ReturnType<typeof useT>): SpreadOption[] {
  return [
    { key: "timeline", icon: <Compass className="w-4 h-4" />, cardCount: 3, positionLabels: [t.tarot_pos_past, t.tarot_pos_present, t.tarot_pos_future] },
    { key: "love", icon: <Heart className="w-4 h-4" />, cardCount: 3, positionLabels: [t.tarot_pos_heart, t.tarot_pos_energy, t.tarot_pos_direction] },
    { key: "career", icon: <Briefcase className="w-4 h-4" />, cardCount: 3, positionLabels: [t.tarot_pos_current, t.tarot_pos_challenge, t.tarot_pos_opportunity] },
    { key: "decision", icon: <Eye className="w-4 h-4" />, cardCount: 3, positionLabels: [t.tarot_pos_dilemma, t.tarot_pos_hidden, t.tarot_pos_right_path] },
    { key: "daily", icon: <Sun className="w-4 h-4" />, cardCount: 1, positionLabels: [t.tarot_pos_daily_card] },
    { key: "universe", icon: <Star className="w-4 h-4" />, cardCount: 1, positionLabels: [t.tarot_pos_universe_msg] },
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

const TarotModal = ({ isOpen, onClose }: Props) => {
  const t = useT();

  const [selectedSpread, setSelectedSpread] = useState<SpreadOption>(SPREAD_OPTIONS[0]);
  const [cards, setCards] = useState<TarotCard[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI state
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDraw = () => { setIsLoading(true); };

  const handleOnboardingComplete = () => {
    const drawn = drawTarotCards(selectedSpread.cardCount);
    setCards(drawn);
    setIsLoading(false);

    // Start AI reading immediately
    startAIReading(drawn);

    readingsStorage.save({
      type: "tarot",
      title: `${t.readings_type_tarot} — ${SPREAD_LABELS[selectedSpread.key]}`,
      subtitle: drawn.map(c => c.hebrewName).join(" • "),
      symbol: "🔮",
      data: { spread: selectedSpread.key, cards: drawn },
    });
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
      () => setAiLoading(false),
      (err) => { setAiLoading(false); toast(err); },
    );
  };

  // Auto-scroll during streaming
  useEffect(() => {
    if (aiLoading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiText, aiLoading]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCards(null);
      setIsLoading(false);
      setCopied(false);
      setAiText("");
      setAiLoading(false);
      aiTextRef.current = "";
      setSelectedSpread(SPREAD_OPTIONS[0]);
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
          <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleClose} />
          <motion.div
            ref={scrollRef}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: "linear-gradient(145deg, hsl(222 40% 8% / 0.97), hsl(222 47% 6% / 0.98))", border: "1px solid hsl(var(--gold) / 0.2)", boxShadow: "0 0 60px hsl(var(--gold) / 0.1)" }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <button onClick={handleClose} className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors" style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}><X className="w-4 h-4 text-gold/70" /></button>
            <div className="absolute top-4 right-4 z-20"><span className="px-3 py-1 rounded-full text-[10px] font-bold font-body tracking-wider" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))", border: "1px solid hsl(var(--gold) / 0.3)", color: "hsl(var(--gold))" }}>{t.common_free}</span></div>

            <AnimatePresence mode="wait">
              {!cards && !isLoading ? (
                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 md:p-12 text-center">
                  <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}><Eye className="w-7 h-7 text-gold" /></motion.div>
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">{t.tarot_title}</h2>
                  <p className="text-foreground/70 font-body text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">{t.tarot_desc}</p>

                  {/* Spread type selector */}
                  <div className="mb-8">
                    <p className="text-gold/60 font-body text-xs mb-4">בחרו סוג קריאה</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md mx-auto">
                      {SPREAD_OPTIONS.map((spread) => (
                        <motion.button
                          key={spread.key}
                          onClick={() => setSelectedSpread(spread)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-body transition-all ${selectedSpread.key === spread.key ? "ring-1 ring-gold/40" : ""}`}
                          style={{
                            background: selectedSpread.key === spread.key
                              ? "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))"
                              : "hsl(var(--deep-blue-light) / 0.3)",
                            border: `1px solid hsl(var(--gold) / ${selectedSpread.key === spread.key ? "0.3" : "0.08"})`,
                            color: selectedSpread.key === spread.key ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.6)",
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span className="text-gold/70">{spread.icon}</span>
                          <span>{SPREAD_LABELS[spread.key]}</span>
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-body mt-3">
                      {selectedSpread.cardCount === 1 ? "קלף אחד" : `${selectedSpread.cardCount} קלפים`} • {selectedSpread.positionLabels.join(" · ")}
                    </p>
                  </div>

                  <motion.button onClick={handleDraw} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Sparkles className="w-4 h-4" />{t.tarot_cta}</motion.button>
                  <p className="text-[11px] text-muted-foreground font-body mt-6">{t.tarot_note}</p>
                </motion.div>
              ) : isLoading ? (
                <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MysticalOnboarding onComplete={handleOnboardingComplete} /></motion.div>
              ) : cards ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <motion.p className="text-gold/50 font-body text-xs mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{SPREAD_LABELS[selectedSpread.key]}</motion.p>
                    <motion.h2 className="font-heading text-2xl gold-gradient-text mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{t.tarot_cards_title}</motion.h2>

                    {/* Card display */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                      {cards.map((card, i) => (
                        <motion.div
                          key={i}
                          className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl"
                          style={{ background: "hsl(var(--gold) / 0.06)", border: "1px solid hsl(var(--gold) / 0.15)" }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.2 }}
                        >
                          {tarotCardImages[card.name]
                            ? <img src={tarotCardImages[card.name]} alt={card.hebrewName} className="w-14 h-20 object-cover rounded-lg shadow-lg" style={{ border: "1px solid hsl(var(--gold) / 0.2)" }} />
                            : <span className="text-3xl">{card.symbol}</span>}
                          <span className="font-body text-xs text-gold mt-1">{card.hebrewName}</span>
                          <span className="text-[10px] text-muted-foreground font-body">{selectedSpread.positionLabels[i]}</span>
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
                      <h3 className="font-heading text-lg gold-gradient-text">פירוש מיסטי</h3>
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-6">
                      {cards.map((card, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          {tarotCardImages[card.name]
                            ? <img src={tarotCardImages[card.name]} alt={card.hebrewName} className="w-10 h-14 object-cover rounded" style={{ border: "1px solid hsl(var(--gold) / 0.2)" }} />
                            : <span className="text-lg">{card.symbol}</span>}
                          <span className="text-[10px] text-gold/60 font-body">{card.hebrewName}</span>
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

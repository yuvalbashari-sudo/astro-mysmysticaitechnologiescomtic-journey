import { useState, useEffect, useRef } from "react";
import { antiAbuse } from "@/lib/antiAbuse";
import { notifyUsageChanged } from "@/components/RemainingReadingsBadge";
import CinematicModalShell from "@/components/CinematicModalShell";
import TextSizeControl, { type TextSize } from "@/components/TextSizeControl";
import MysticalReadingAtmosphere from "@/components/MysticalReadingAtmosphere";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Heart, Briefcase, Eye, Compass, Crown, Share2, Copy, Check, Layers, Star, Sun, MessageCircle } from "lucide-react";
import { drawReadingCards, type ReadingCard } from "@/data/allTarotCards";
import { cardBack } from "@/data/tarotCardImages";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import { tarotMemory } from "@/lib/tarotMemory";
import { mysticalProfile } from "@/lib/mysticalProfile";
import ShareResultSection from "@/components/ShareResultSection";
import MysticalOnboarding from "@/components/MysticalOnboarding";
import { renderMysticalText } from "@/lib/aiStreaming";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useReadingContext } from "@/contexts/ReadingContext";
import TarotFanSelectionPhase from "@/components/TarotFanSelectionPhase";
import TarotQuestionPhase from "@/components/TarotQuestionPhase";
import TarotAnalysisRitual from "@/components/TarotAnalysisRitual";
import PaymentGatingModal from "@/components/PaymentGatingModal";
import { entitlements, type GatingMessage } from "@/lib/entitlements";

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
  const userName = mysticalProfile.getUserName() || undefined;
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ spreadType, cards, context: { memoryContext, profileContext, userQuestion: userQuestion || undefined }, language: language || "he", userName }),
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
  const localizedName = (card: ReadingCard) => card.name[language] || card.name.en;
  const { setActiveReading } = useReadingContext();
  const SPREAD_OPTIONS = getSpreadOptions(t);
  const SPREAD_LABELS = getSpreadLabels(t);

  const isMobileTarot = useIsMobile();
  const [mobileTopicPhase, setMobileTopicPhase] = useState(false);
  const [selectedSpreadKey, setSelectedSpreadKey] = useState<SpreadType>("timeline");
  const selectedSpread = SPREAD_OPTIONS.find(s => s.key === selectedSpreadKey) || SPREAD_OPTIONS[0];
  const [cards, setCards] = useState<ReadingCard[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTablePhase, setIsTablePhase] = useState(false);
  const [isShufflePhase, setIsShufflePhase] = useState(false);
  const [isQuestionPhase, setIsQuestionPhase] = useState(false);
  const [isAnalysisPhase, setIsAnalysisPhase] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [tableCards, setTableCards] = useState<ReadingCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [activeRevealIndex, setActiveRevealIndex] = useState<number | null>(null);
   const [copied, setCopied] = useState(false);

  // AI state
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [textSize, setTextSize] = useState<TextSize>("default");

  // Entitlements gating state
  const [gatingOpen, setGatingOpen] = useState(false);
  const [gatingMsg, setGatingMsg] = useState<GatingMessage | null>(null);
  const [gatingResetCycle, setGatingResetCycle] = useState<import("@/lib/pricingConfig").ResetCycle>("daily");

  // Live entitlement check — used to block render even before useEffect fires
  const liveAccess = entitlements.checkAccess("tarot_reading", "free");
  const isLiveBlocked = isOpen && !liveAccess.allowed && 'promptKey' in liveAccess;
  const liveGatingMsg = isLiveBlocked && 'promptKey' in liveAccess
    ? entitlements.getGatingMessage(liveAccess.promptKey, liveAccess.priceILS)
    : null;
  const liveResetCycle = isLiveBlocked && 'resetCycle' in liveAccess ? liveAccess.resetCycle : "daily";

  const needsQuestion = selectedSpreadKey !== "daily" && selectedSpreadKey !== "timeline";

  const handleDraw = () => {
    // Anti-abuse check
    const abuseCheck = antiAbuse.fullCheck("tarot_reading");
    if (!abuseCheck.allowed) {
      if (abuseCheck.reason === "rate_limit") {
        toast(t.lead_error_rate_limit);
        return;
      }
      if (abuseCheck.reason === "cooldown") {
        toast(t.lead_error_wait);
        return;
      }
      return;
    }

    const access = entitlements.checkAccess("tarot_reading", "free"); // TODO: use actual user tier
    if (!access.allowed && 'promptKey' in access) {
      const msg = entitlements.getGatingMessage(access.promptKey, access.priceILS);
      setGatingMsg(msg);
      setGatingResetCycle(access.resetCycle);
      setGatingOpen(true);
      return;
    }
    // Record usage NOW — before any reading UI starts — so the quota is consumed immediately
    entitlements.recordFeatureUse("tarot_reading", "free");
    notifyUsageChanged();
    antiAbuse.recordSuccessfulAction("tarot_reading");
    if (needsQuestion) {
      setIsQuestionPhase(true);
    } else {
      setIsLoading(true);
    }
  };

  const handleQuestionSubmit = (question: string) => {
    // Check entitlements before proceeding to reading
    const abuseCheck = antiAbuse.fullCheck("tarot_reading");
    if (!abuseCheck.allowed) {
      if (abuseCheck.reason === "rate_limit") toast(t.lead_error_rate_limit);
      else if (abuseCheck.reason === "cooldown") toast(t.lead_error_wait);
      return;
    }
    const access = entitlements.checkAccess("tarot_reading", "free");
    if (!access.allowed && 'promptKey' in access) {
      const msg = entitlements.getGatingMessage(access.promptKey, access.priceILS);
      setGatingMsg(msg);
      setGatingResetCycle(access.resetCycle);
      setGatingOpen(true);
      setIsQuestionPhase(false);
      return;
    }
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

  const handleFanSelectionComplete = (selectedCards: ReadingCard[]) => {
    setTableCards(selectedCards);
    setFlippedIndices(new Set());

    // Preload card images on mobile before showing table
    if (isMobileTarot) {
      const imageUrls = selectedCards.map(c => c.image).filter(Boolean) as string[];
      if (imageUrls.length > 0) {
        Promise.all(imageUrls.map(src => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          });
        })).then(() => {
          setIsTablePhase(true);
          setIsShufflePhase(false);
        });
      } else {
        setIsTablePhase(true);
        setIsShufflePhase(false);
      }
    } else {
      setIsShufflePhase(false);
      setIsTablePhase(true);
    }
  };

  const handleCardFlip = (index: number) => {
    if (flippedIndices.has(index) || activeRevealIndex !== null) return;
    
    // Mobile: faster, lighter timing sequence
    const liftDelay = isMobileTarot ? 400 : 800;
    const settleDelay = isMobileTarot ? 700 : 1200;
    const transitionDelay = isMobileTarot ? 1200 : 1800;
    
    // Phase 1: Focus/lift
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
              subtitle: tableCards.map(c => localizedName(c)).join(" • "),
              symbol: "🔮",
              data: { spread: selectedSpread.key, cards: tableCards },
            });
          }, transitionDelay);
        }
      }, settleDelay);
    }, liftDelay);
  };


  const startAIReading = (drawnCards: ReadingCard[]) => {
    setAiLoading(true);
    aiTextRef.current = "";
    setAiText("");

    const cardsPayload = drawnCards.map((c, i) => ({
      hebrewName: c.name.he,
      symbol: c.symbol,
      name: c.name.en,
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
        setActiveReading({ type: "tarot", label: `${t.readings_type_tarot} — ${SPREAD_LABELS[selectedSpread.key]}`, summary: aiTextRef.current });
        tarotMemory.recordReading(selectedSpread.key, cardsPayload);
        mysticalProfile.recordTarotCards(
          cardsPayload.map(c => ({ name: c.name, hebrewName: c.hebrewName, symbol: c.symbol })),
          selectedSpread.key
        );
        // Usage already recorded in handleDraw — no duplicate recording needed
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
      setMobileTopicPhase(false);
      setGatingOpen(false);
      setGatingMsg(null);
    }, 300);
  };

  // Pre-check entitlements when modal opens — block before any UI renders
  useEffect(() => {
    if (!isOpen) return;
    const access = entitlements.checkAccess("tarot_reading", "free");
    if (!access.allowed && 'promptKey' in access) {
      const msg = entitlements.getGatingMessage(access.promptKey, access.priceILS);
      setGatingMsg(msg);
      setGatingResetCycle(access.resetCycle);
      setGatingOpen(true);
      return;
    }
    // On mobile, auto-enter topic phase when modal opens
    if (isMobileTarot) {
      setMobileTopicPhase(true);
    }
  }, [isOpen, isMobileTarot]);

  const handleShare = () => {
    if (!cards) return;
    const text = `🔮 ${t.readings_type_tarot} — ${SPREAD_LABELS[selectedSpread.key]}:\n${cards.map(c => `${c.symbol} ${localizedName(c)}`).join("\n")}\n\n✨ ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!cards) return;
    const textToCopy = aiText || cards.map(c => `${c.symbol} ${localizedName(c)}`).join(" • ");
    await navigator.clipboard.writeText(`🔮 ${textToCopy}`);
    setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000);
  };

  // No pre-calculated vars needed — cards sized via CSS in the container

  return (
    <>
    <CinematicModalShell isOpen={isOpen && !gatingOpen && !isLiveBlocked} onClose={handleClose} scrollRef={scrollRef as React.RefObject<HTMLDivElement>} fullscreen avatarStyle={isMobileTarot ? { position: "absolute" as const, top: 8, left: "50%", right: "auto", bottom: "auto", transform: "translateX(-50%)", width: 73, height: 73, maxWidth: "calc(100% - 16px)", maxHeight: "calc(100% - 16px)" } : undefined}>
            <MysticalReadingAtmosphere theme="tarot" />

            <AnimatePresence mode="wait">
              {/* ── Mobile Topic Selection Phase ── */}
              {mobileTopicPhase && isMobileTarot && !cards && !isLoading && !isTablePhase && !isShufflePhase && !isQuestionPhase && !isAnalysisPhase ? (
                <motion.div
                  key="mobile-topic"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16"
                >
                  {/* Background */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: "radial-gradient(ellipse at 50% 30%, hsl(222 35% 14%), hsl(222 50% 4%))",
                  }} />
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: "radial-gradient(circle at 30% 70%, hsl(var(--gold) / 0.03), transparent 50%)",
                  }} />

                  {/* Floating particles */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={`tp-${i}`}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: 1 + Math.random() * 2,
                        height: 1 + Math.random() * 2,
                        left: `${5 + Math.random() * 90}%`,
                        top: `${5 + Math.random() * 90}%`,
                        background: i % 2 === 0 ? "hsl(var(--gold) / 0.4)" : "hsl(var(--celestial) / 0.25)",
                      }}
                      animate={{ opacity: [0, 0.6, 0], y: [0, -(10 + Math.random() * 20)] }}
                      transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}

                  {/* Eye icon */}
                  <motion.div
                    className="relative z-10 w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                    style={{
                      background: "radial-gradient(circle, hsl(var(--gold) / 0.1), transparent 70%)",
                      border: "1px solid hsl(var(--gold) / 0.18)",
                    }}
                    animate={{
                      boxShadow: [
                        "0 0 20px hsl(43 80% 55% / 0.08)",
                        "0 0 40px hsl(43 80% 55% / 0.18)",
                        "0 0 20px hsl(43 80% 55% / 0.08)",
                      ],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                  >
                    <Eye className="w-6 h-6 text-gold/80" />
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    className="relative z-10 font-heading text-4xl gold-gradient-text mb-2 text-center"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    {t.tarot_title}
                  </motion.h2>
                  <motion.p
                    className="relative z-10 text-foreground/50 font-body text-lg mb-8 text-center max-w-[320px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {t.tarot_spread_choose}
                  </motion.p>

                  {/* Topic buttons */}
                  <div className="relative z-10 w-full max-w-[300px] flex flex-col gap-3">
                    {SPREAD_OPTIONS.filter(s => s.key !== "daily" && s.key !== "universe").map((spread, idx) => (
                      <motion.button
                        key={spread.key}
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-start"
                        style={{
                          background: "linear-gradient(135deg, hsl(222 32% 13% / 0.95), hsl(222 42% 9% / 0.98))",
                          border: "1px solid hsl(var(--gold) / 0.12)",
                          boxShadow: "0 2px 12px hsl(222 47% 3% / 0.5), inset 0 1px 0 hsl(var(--gold) / 0.04)",
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.08 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setSelectedSpreadKey(spread.key);
                          // Check entitlements before proceeding
                          const abuseCheck = antiAbuse.fullCheck("tarot_reading");
                          if (!abuseCheck.allowed) {
                            if (abuseCheck.reason === "rate_limit") toast(t.lead_error_rate_limit);
                            else if (abuseCheck.reason === "cooldown") toast(t.lead_error_wait);
                            setMobileTopicPhase(false);
                            return;
                          }
                          const access = entitlements.checkAccess("tarot_reading", "free");
                            if (!access.allowed && 'promptKey' in access) {
                            const msg = entitlements.getGatingMessage(access.promptKey, access.priceILS);
                            setGatingMsg(msg);
                            setGatingResetCycle(access.resetCycle);
                            setGatingOpen(true);
                            setMobileTopicPhase(false);
                            return;
                          }
                          // Record usage NOW — before any reading UI starts
                          entitlements.recordFeatureUse("tarot_reading", "free");
                          notifyUsageChanged();
                          antiAbuse.recordSuccessfulAction("tarot_reading");
                          // Set next phase BEFORE clearing topic phase to prevent fan layout flash
                          if (spread.key !== "daily") {
                            setIsQuestionPhase(true);
                          } else {
                            setIsLoading(true);
                          }
                          setMobileTopicPhase(false);
                        }}
                      >
                        <span className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{
                          background: "radial-gradient(circle, hsl(var(--gold) / 0.1), transparent 70%)",
                          border: "1px solid hsl(var(--gold) / 0.15)",
                        }}>
                          <span className="text-gold/80">{spread.icon}</span>
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-heading text-xl text-gold/90 block">{SPREAD_LABELS[spread.key]}</span>
                          <span className="text-base text-foreground/40 font-body">
                            {spread.cardCount === 1 ? t.tarot_one_card : `${spread.cardCount} ${t.tarot_n_cards}`}
                          </span>
                        </div>
                        <Sparkles className="w-4 h-4 text-gold/30 flex-shrink-0" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : !cards && !isLoading && !isTablePhase && !isShufflePhase && !isQuestionPhase && !isAnalysisPhase && !mobileTopicPhase ? (
                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative overflow-hidden min-h-screen flex flex-col items-end justify-end">

                  {/* Subtle readability vignette — no box */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: "radial-gradient(ellipse 70% 50% at 50% 75%, hsl(222 47% 5% / 0.55) 0%, transparent 70%)",
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
                  {/* Title — floating above the cards */}
                  <div className="absolute top-0 left-0 right-0 z-20 text-center pt-16 md:pt-20 pointer-events-none">
                    <motion.h2
                      className="font-heading text-xl md:text-3xl gold-gradient-text mb-2"
                      style={{ textShadow: "0 2px 20px hsl(222 47% 3% / 0.95), 0 0 40px hsl(var(--gold) / 0.15)" }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    >{t.tarot_title}</motion.h2>
                    <motion.p
                      className="text-gold/40 font-body text-[11px] md:text-xs tracking-[0.2em]"
                      style={{ textShadow: "0 1px 10px hsl(222 47% 3% / 0.9)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                    >{t.tarot_spread_choose}</motion.p>
                  </div>

                  {/* ── Cards emerging from oracle's hands ── */}
                  {(() => {
                    const fanCards = SPREAD_OPTIONS;
                    const count = fanCards.length;
                    const isMob = isMobileTarot;
                    const arcDeg = isMob ? 36 : 48;
                    const cardW = isMob ? 68 : 105;
                    const cardH = isMob ? 112 : 174;
                    const pivotR = isMob ? 220 : 340;
                    const containerH = isMob ? 320 : 440;

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
                      <div className="relative mx-auto mb-4" style={{ height: containerH, maxWidth: isMob ? 340 : 620 }}>
                        {/* Mystical energy at the emergence point */}
                        <motion.div
                          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                          style={{
                            bottom: isMob ? -30 : -40,
                            width: isMob ? 250 : 420,
                            height: isMob ? 80 : 120,
                            background: "radial-gradient(ellipse, hsl(var(--gold) / 0.12) 0%, hsl(var(--gold) / 0.04) 40%, transparent 70%)",
                            filter: "blur(15px)",
                          }}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: [0.4, 0.8, 0.4], scale: 1 }}
                          transition={{ opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }, scale: { duration: 1, ease: "easeOut" } }}
                        />

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
                                // Check entitlements before proceeding
                                const abuseCheck = antiAbuse.fullCheck("tarot_reading");
                                if (!abuseCheck.allowed) {
                                  if (abuseCheck.reason === "rate_limit") toast(t.lead_error_rate_limit);
                                  else if (abuseCheck.reason === "cooldown") toast(t.lead_error_wait);
                                  return;
                                }
                                const access = entitlements.checkAccess("tarot_reading", "free");
                                if (!access.allowed && 'promptKey' in access) {
                                  const msg = entitlements.getGatingMessage(access.promptKey, access.priceILS);
                                  setGatingMsg(msg);
                                  setGatingResetCycle(access.resetCycle);
                                  setGatingOpen(true);
                                  return;
                                }
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
                              initial={{ opacity: 0, y: 180, rotate: 0, scale: 0.5 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                x: tx,
                                rotate: angle,
                                scale: 1,
                                translateY: ty,
                              }}
                              transition={{ delay: 0.4 + idx * 0.12, type: "spring", stiffness: 70, damping: 14 }}
                              whileHover={{
                                translateY: ty - (isMob ? 22 : 38),
                                scale: 1.08,
                                zIndex: 50,
                                transition: { duration: 0.25, ease: "easeOut" },
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

                                {/* Card name — always visible on mobile, hover-reveal on desktop */}
                                <div className={`absolute bottom-0 inset-x-0 z-10 transition-all duration-300 ${isMob ? "opacity-100 translate-y-0" : "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"}`}
                                  style={{
                                    background: isMob
                                      ? "linear-gradient(transparent 0%, rgba(0,0,0,0.9) 30%)"
                                      : "linear-gradient(transparent, rgba(0,0,0,0.85) 40%)",
                                    padding: isMob ? "8px 4px 6px" : "10px 6px 8px",
                                  }}
                                >
                                  <span className={`font-heading text-gold/90 leading-tight block text-center ${isMob ? "text-[9px]" : "text-[10px]"}`}>
                                    {SPREAD_LABELS[spread.key]}
                                  </span>
                                  <span className={`text-gold/40 font-body block text-center mt-0.5 ${isMob ? "text-[7px]" : "text-[7px]"}`}>
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

                        {/* Bottom fade — cards emerge from below screen edge */}
                        <div className="absolute left-0 right-0 pointer-events-none" style={{
                          bottom: isMob ? -40 : -50,
                          height: isMob ? 80 : 100,
                          background: "linear-gradient(to top, hsl(222 47% 4% / 0.9) 0%, transparent 100%)",
                        }} />
                      </div>
                    );
                  })()}

                  <p className="relative z-10 text-[9px] md:text-[10px] text-muted-foreground/30 font-body text-center w-full pb-6 md:pb-8" style={{ textShadow: "0 1px 6px hsl(222 47% 3% / 0.8)" }}>{t.tarot_note}</p>
                </motion.div>
              ) : isQuestionPhase ? (
                <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                  <TarotQuestionPhase spreadType={selectedSpreadKey} spreadLabel={SPREAD_LABELS[selectedSpreadKey]} onSubmit={handleQuestionSubmit} />
                  {isMobileTarot && (
                    <motion.div className="flex justify-center -mt-4 pb-6">
                      <motion.button
                        type="button"
                        className="px-5 py-2 rounded-full font-body text-sm tracking-wide"
                        style={{
                          background: "hsl(222 32% 12% / 0.7)",
                          border: "1px solid hsl(var(--gold) / 0.15)",
                          color: "hsl(var(--gold) / 0.55)",
                          backdropFilter: "blur(8px)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsQuestionPhase(false);
                          setIsShufflePhase(true);
                        }}
                      >
                        {t.tarot_skip_to_reading} ›
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              ) : isAnalysisPhase ? (
                <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                  <TarotAnalysisRitual question={userQuestion} onComplete={handleAnalysisComplete} />
                  {isMobileTarot && (
                    <motion.button
                      type="button"
                      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-full font-body text-sm tracking-wide"
                      style={{
                        background: "hsl(222 32% 12% / 0.7)",
                        border: "1px solid hsl(var(--gold) / 0.15)",
                        color: "hsl(var(--gold) / 0.6)",
                        backdropFilter: "blur(8px)",
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsAnalysisPhase(false);
                        setIsShufflePhase(true);
                      }}
                    >
                      {t.tarot_skip_to_reading} ›
                    </motion.button>
                  )}
                </motion.div>
              ) : isLoading ? (
                <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MysticalOnboarding onComplete={handleOnboardingComplete} /></motion.div>
              ) : isShufflePhase ? (
                <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TarotShufflePhase onComplete={handleShuffleComplete} /></motion.div>
              ) : isTablePhase ? (
                <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 md:p-10 flex flex-col items-center justify-center min-h-screen relative overflow-hidden" style={{ maxWidth: "100vw" }}>
                  {/* Subtle center vignette */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 55%, hsl(222 47% 5% / 0.45) 0%, transparent 70%)" }} />

                  {/* Darkening overlay when a card is being revealed */}
                  <AnimatePresence>
                    {activeRevealIndex !== null && (
                      <motion.div
                        className="absolute inset-0 z-20 pointer-events-none"
                        style={{
                          background: "hsl(222 45% 4% / 0.6)",
                          ...(isMobileTarot ? {} : { backdropFilter: "blur(2px)" }),
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: isMobileTarot ? 0.25 : 0.4 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Floating particles — reduced on mobile */}
                  {[...Array(isMobileTarot ? 5 : 15)].map((_, i) => (
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

                  {/* Tarot table cards — rebuilt with proper viewport-fitting layout */}
                  <div className="relative z-30 w-full overflow-hidden px-2 md:px-4 mb-6 flex items-center justify-center">
                    <div
                      className="flex flex-col items-center gap-3"
                      style={{
                        height: tableCards.length === 1 ? "auto" : `calc(100vh - 18rem)`,
                        maxHeight: tableCards.length === 1 ? "min(20rem, 40vh)" : `calc(100vh - 18rem)`,
                        width: "100%",
                        maxWidth: tableCards.length === 1 ? "10rem" : "12rem",
                      }}
                    >
                      {tableCards.map((card, i) => {
                        const isFlipped = flippedIndices.has(i);
                        const isActive = activeRevealIndex === i;
                        const cardCount = tableCards.length;
                        // Each card gets equal share of remaining height after gaps
                        // gap-3 = 0.75rem, (cardCount-1) gaps
                        const flexBasis = `calc((100% - ${(cardCount - 1) * 0.75}rem) / ${cardCount})`;

                        return (
                          <div
                            key={i}
                            className="relative flex items-center justify-center"
                            style={{
                              flex: `0 0 ${flexBasis}`,
                              height: flexBasis,
                              maxHeight: flexBasis,
                              minHeight: 0,
                              width: "100%",
                              zIndex: isActive ? 50 : isFlipped ? 10 : 5,
                            }}
                          >
                            {/* Card wrapper — height 100% of slot, width derived from aspect ratio */}
                            <motion.div
                              className="relative"
                              style={{
                                height: "100%",
                                aspectRatio: "2 / 3",
                                maxWidth: "100%",
                                perspective: 1000,
                                cursor: !isFlipped && activeRevealIndex === null ? "pointer" : "default",
                              }}
                              initial={{ opacity: 0, y: 24 }}
                              animate={{
                                opacity: 1,
                                y: isActive ? -12 : 0,
                              }}
                              transition={isActive ? { duration: 0.6, ease: "easeOut" } : { delay: 0.6 + i * 0.2, type: "spring", stiffness: 200 }}
                              onClick={() => handleCardFlip(i)}
                              whileHover={!isFlipped && activeRevealIndex === null ? { y: -6 } : {}}
                              whileTap={!isFlipped && activeRevealIndex === null ? { y: -2 } : {}}
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

                              {/* Active reveal: particle swirl — simplified on mobile */}
                              {isActive && (
                                <>
                                  {[...Array(isMobileTarot ? 3 : 10)].map((_, pi) => (
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
                                      transition={{ duration: isMobileTarot ? 0.8 : 1.2, delay: pi * (isMobileTarot ? 0.1 : 0.06), ease: "easeOut" }}
                                    />
                                  ))}
                                  <motion.div
                                    className="absolute -inset-4 rounded-2xl pointer-events-none"
                                    style={{ background: `radial-gradient(circle, hsl(var(--gold) / ${isMobileTarot ? "0.12" : "0.2"}), transparent 60%)` }}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: [0, isMobileTarot ? 0.5 : 0.8, isMobileTarot ? 0.3 : 0.5], scale: [0.8, 1.3, 1.1] }}
                                    transition={{ duration: isMobileTarot ? 0.5 : 0.8 }}
                                  />
                                </>
                              )}

                              {/* Energy pulse ring on flip — single ring on mobile */}
                              {isFlipped && (
                                <>
                                  <motion.div
                                    className="absolute pointer-events-none rounded-full"
                                    style={{
                                      left: "50%", top: "50%",
                                      width: 20, height: 20,
                                      marginLeft: -10, marginTop: -10,
                                      border: `${isMobileTarot ? "1px" : "2px"} solid hsl(var(--gold) / ${isMobileTarot ? "0.4" : "0.6"})`,
                                    }}
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{ scale: [0, isMobileTarot ? 5 : 8], opacity: [isMobileTarot ? 0.5 : 0.8, 0] }}
                                    transition={{ duration: isMobileTarot ? 0.8 : 1.2, ease: "easeOut" }}
                                  />
                                  {!isMobileTarot && (
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
                                  )}
                                  <motion.div
                                    className="absolute -inset-6 pointer-events-none"
                                    style={{ background: `radial-gradient(circle, hsl(var(--gold) / ${isMobileTarot ? "0.15" : "0.35"}), transparent 50%)` }}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: [0, isMobileTarot ? 0.5 : 1, isMobileTarot ? 0.15 : 0.3], scale: [0.5, isMobileTarot ? 1.2 : 1.5, 1] }}
                                    transition={{ duration: isMobileTarot ? 0.5 : 0.8 }}
                                  />
                                </>
                              )}

                              <motion.div
                                className="relative w-full h-full"
                                style={{ transformStyle: "preserve-3d" }}
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: isMobileTarot ? 0.6 : 1, ease: [0.25, 0.1, 0.25, 1] }}
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
                                  {card.image
                                    ? <img src={card.image} alt={localizedName(card)} className="w-[85%] h-[68%] object-contain rounded-lg" style={{ border: "1px solid hsl(var(--gold) / 0.25)", imageRendering: "auto" }} />
                                    : <span className="text-5xl mb-1">{card.symbol}</span>}
                                  <span className="font-heading text-xs md:text-sm text-gold text-center leading-tight mt-1.5">{localizedName(card)}</span>
                                  <span className="text-[10px] text-muted-foreground/60 font-body">{selectedSpread.positionLabels[i]}</span>
                                </div>
                              </motion.div>

                              {/* Persistent breathing glow for revealed cards — disabled on mobile for perf */}
                              {isFlipped && !isActive && !isMobileTarot && (
                                <motion.div
                                  className="absolute -inset-2 rounded-xl pointer-events-none"
                                  style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.1), transparent 60%)" }}
                                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                />
                              )}
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
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
                              <span className="font-heading text-xs text-gold">{localizedName(card)}</span>
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
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 md:p-10 min-h-screen relative overflow-hidden" style={{ maxWidth: "100vw" }}>
                  {/* Subtle readability vignette */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 40%, hsl(222 47% 5% / 0.55) 0%, transparent 75%)" }} />
                  {/* Header */}
                  <div className="text-center mb-6 relative z-10 pt-10">
                    <motion.p className="text-gold/50 font-body text-xs mb-2" style={{ textShadow: "0 2px 8px hsl(222 47% 5% / 0.8)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{SPREAD_LABELS[selectedSpread.key]}</motion.p>
                    <motion.h2 className="font-heading text-2xl gold-gradient-text mb-4" style={{ textShadow: "0 2px 12px hsl(222 47% 5% / 0.8)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{t.tarot_cards_title}</motion.h2>

                    {/* Card display */}
                    <div className="w-full max-w-3xl mx-auto overflow-hidden">
                      <div className="flex items-center justify-center gap-3 sm:gap-5 mb-8 flex-wrap px-2">
                        {cards.map((card, i) => (
                          <motion.div
                            key={i}
                            className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl backdrop-blur-sm shrink-0"
                            style={{ background: "hsl(var(--deep-blue) / 0.4)", border: "1px solid hsl(var(--gold) / 0.1)", maxWidth: cards.length === 1 ? 200 : 160 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.2 }}
                          >
                            {card.image
                              ? <img src={card.image} alt={localizedName(card)} className="rounded-lg shadow-lg object-contain" style={{ border: "1px solid hsl(var(--gold) / 0.2)", width: "min(6rem, 15vw)", height: "min(8.5rem, 22vh)", aspectRatio: "2/3" }} />
                              : <span className="text-4xl">{card.symbol}</span>}
                            <span className="font-body text-sm text-gold mt-1">{localizedName(card)}</span>
                            <span className="text-xs text-muted-foreground font-body">{selectedSpread.positionLabels[i]}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <motion.div className="section-divider max-w-[120px] mx-auto" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8 }} />

                    {/* Share buttons */}
                    <motion.div className="flex items-center justify-center gap-3 mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                      <motion.button onClick={handleShare} className="flex items-center gap-3 px-6 py-3 rounded-full text-base font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-5 h-5" />{t.forecast_share}</motion.button>
                      <motion.button onClick={handleCopy} className="flex items-center gap-3 px-6 py-3 rounded-full text-base font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}{copied ? t.share_copied : t.share_copy}</motion.button>
                    </motion.div>
                  </div>

                  {/* AI Dynamic Interpretation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="rounded-2xl p-6 md:p-8 mt-6 backdrop-blur-sm relative z-10"
                    style={{ background: "hsl(var(--deep-blue) / 0.35)", border: "1px solid hsl(var(--gold) / 0.08)", boxShadow: "0 0 40px hsl(var(--deep-blue) / 0.3)" }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <Layers className="w-5 h-5 text-gold" />
                      <h3 className="font-heading text-lg gold-gradient-text">{t.tarot_mystical_interp}</h3>
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-6 flex-wrap max-w-full overflow-hidden px-2">
                      {cards.map((card, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                          {card.image
                            ? <img src={card.image} alt={localizedName(card)} className="w-14 h-20 md:w-16 md:h-22 object-contain rounded-md" style={{ border: "1px solid hsl(var(--gold) / 0.2)" }} />
                            : <span className="text-xl">{card.symbol}</span>}
                          <span className="text-xs text-gold/60 font-body">{localizedName(card)}</span>
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
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-end mb-6"><TextSizeControl value={textSize} onChange={setTextSize} /></div>
                        {renderMysticalText(aiText, textSize)}
                      </motion.div>
                    )}
                  </motion.div>

                  <ShareResultSection symbol={cards[0].symbol} title={cards.map(c => localizedName(c)).join(" • ")} subtitle={t.readings_type_tarot} />

                  {/* Premium CTA */}
                  <div className="section-divider max-w-[200px] mx-auto my-8" />
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-center rounded-xl p-10 backdrop-blur-sm relative z-10" style={{ background: "hsl(var(--deep-blue) / 0.35)", border: "1px solid hsl(var(--gold) / 0.08)" }}>
                    <Crown className="w-10 h-10 text-gold mx-auto mb-5" />
                    <h4 className="font-heading text-2xl text-gold mb-4">{t.tarot_premium_title}</h4>
                    <p className="text-foreground/60 font-body text-lg mb-6 max-w-lg mx-auto leading-relaxed">{t.tarot_premium_desc}</p>
                    <a href="#premium" onClick={handleClose} className="btn-gold font-body text-lg inline-flex items-center gap-3 px-8 py-4"><Sparkles className="w-5 h-5" />{t.tarot_premium_cta}</a>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
    </CinematicModalShell>
    <PaymentGatingModal
      isOpen={gatingOpen || isLiveBlocked}
      onClose={() => {
        setGatingOpen(false);
        handleClose();
      }}
      gatingMessage={gatingMsg || liveGatingMsg}
      resetCycle={gatingOpen ? gatingResetCycle : liveResetCycle}
      onPayPerUse={() => {
        setGatingOpen(false);
        if (needsQuestion) {
          setIsQuestionPhase(true);
        } else {
          setIsLoading(true);
        }
      }}
    />
    </>
  );
};

export default TarotModal;

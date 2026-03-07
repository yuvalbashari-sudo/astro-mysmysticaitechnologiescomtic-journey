import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Crown, Share2, Copy, Check, Lock, ChevronRight } from "lucide-react";
import { spreads, drawCardsForSpread, getInterpretation, type SpreadConfig, type SpreadType, type TarotWorldCard } from "@/data/tarotWorldData";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";

interface Props { isOpen: boolean; onClose: () => void; }

type Phase = "select" | "shuffle" | "reveal" | "result";

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

const TarotWorldModal = ({ isOpen, onClose }: Props) => {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedSpread, setSelectedSpread] = useState<SpreadConfig | null>(null);
  const [drawnCards, setDrawnCards] = useState<TarotWorldCard[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [shuffleStep, setShuffleStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setPhase("select");
      setSelectedSpread(null);
      setDrawnCards([]);
      setRevealedIndices(new Set());
      setShuffleStep(0);
      setShowPremium(false);
    }, 300);
  };

  const handleSelectSpread = (spread: SpreadConfig) => {
    setSelectedSpread(spread);
    setPhase("shuffle");
    // Run shuffle animation
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
    
    // Check premium: if not free, only allow freeRevealCount cards
    if (!selectedSpread.isFree && revealedIndices.size >= selectedSpread.freeRevealCount) {
      setShowPremium(true);
      return;
    }
    
    setRevealedIndices(prev => new Set(prev).add(index));
  }, [selectedSpread, revealedIndices]);

  const allRevealed = selectedSpread && revealedIndices.size === selectedSpread.cardCount;

  useEffect(() => {
    if (allRevealed && selectedSpread && drawnCards.length > 0) {
      // Auto transition to result after small delay
      const timer = setTimeout(() => setPhase("result"), 1200);
      return () => clearTimeout(timer);
    }
  }, [allRevealed, selectedSpread, drawnCards]);

  // Save reading when result is shown
  useEffect(() => {
    if (phase === "result" && selectedSpread && drawnCards.length > 0) {
      readingsStorage.save({
        type: "tarot",
        title: `טארוט — ${selectedSpread.hebrewName}`,
        subtitle: drawnCards.map(c => c.hebrewName).join(" • "),
        symbol: selectedSpread.icon,
        data: { spread: selectedSpread.key, cards: drawnCards.map(c => c.hebrewName) },
      });
    }
  }, [phase, selectedSpread, drawnCards]);

  const handleShare = () => {
    if (!drawnCards.length || !selectedSpread) return;
    const text = `🔮 ${selectedSpread.hebrewName}:\n${drawnCards.map(c => `${c.symbol} ${c.hebrewName}`).join("\n")}\n\n✨ קבלו גם אתם קריאת טארוט:\n${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!drawnCards.length) return;
    await navigator.clipboard.writeText(`🔮 ${drawnCards.map(c => `${c.symbol} ${c.hebrewName}`).join(" • ")}`);
    setCopied(true);
    toast("הטקסט הועתק ✦");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-background/85 backdrop-blur-xl" onClick={handleClose} />
          
          <motion.div
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

            {/* Close button */}
            <button onClick={handleClose} className="absolute top-4 left-4 z-30 w-9 h-9 rounded-full flex items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors" style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}>
              <X className="w-4 h-4 text-gold/70" />
            </button>

            <AnimatePresence mode="wait">
              {/* PHASE 1: Selection */}
              {phase === "select" && (
                <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }} className="relative p-6 md:p-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center relative"
                      style={{ background: "radial-gradient(circle, hsl(var(--crimson) / 0.15), hsl(var(--gold) / 0.08), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}
                      animate={{ boxShadow: ["0 0 20px hsl(var(--gold) / 0.1)", "0 0 40px hsl(var(--gold) / 0.2)", "0 0 20px hsl(var(--gold) / 0.1)"] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <span className="text-3xl">🔮</span>
                    </motion.div>
                    <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-3">עולם הטארוט</h2>
                    <p className="text-foreground/60 font-body text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                      הקלפים מחכים לכם. בחרו את סוג הקריאה וקבלו הדרכה אינטואיטיבית, מסרים נסתרים ותובנות סמליות עמוקות מהארקנה הגדולה
                    </p>
                  </div>
                  <div className="section-divider max-w-[150px] mx-auto mb-8" />

                  {/* Spread options grid */}
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
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-body" style={{ background: "hsl(var(--gold) / 0.15)", border: "1px solid hsl(var(--gold) / 0.25)", color: "hsl(var(--gold))" }}>חינם</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-body" style={{ background: "hsl(var(--crimson) / 0.15)", border: "1px solid hsl(var(--crimson) / 0.25)", color: "hsl(var(--crimson-light))" }}>✦ פרימיום</span>
                              )}
                            </div>
                            <p className="text-foreground/50 font-body text-xs leading-relaxed">{spread.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gold/30 group-hover:text-gold/60 transition-colors flex-shrink-0 mt-1 rotate-180" />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <p className="text-center text-[10px] text-muted-foreground font-body mt-8">✦ קלף יומי — בחינם • שאר הקריאות כוללות תצוגה מקדימה חינמית ✦</p>
                </motion.div>
              )}

              {/* PHASE 2: Shuffle */}
              {phase === "shuffle" && (
                <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative p-12 md:p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="relative w-32 h-44 mb-8">
                    {/* Shuffling cards */}
                    {[0, 1, 2, 3, 4].map(i => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: "linear-gradient(145deg, hsl(0 40% 18%), hsl(0 30% 12%))",
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
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full" style={{ border: "1px solid hsl(var(--gold) / 0.3)", background: "radial-gradient(circle, hsl(var(--gold) / 0.1), transparent)" }}>
                            <div className="w-full h-full flex items-center justify-center text-lg">✦</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.p className="font-body text-gold/80 text-base mb-2" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                    הקלפים נערבבים...
                  </motion.p>
                  <p className="font-body text-foreground/40 text-xs">התרכזו בשאלה שבליבכם</p>
                </motion.div>
              )}

              {/* PHASE 3: Reveal */}
              {phase === "reveal" && selectedSpread && (
                <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative p-6 md:p-10">
                  <div className="text-center mb-8">
                    <h2 className="font-heading text-2xl gold-gradient-text mb-2">{selectedSpread.hebrewName}</h2>
                    <p className="text-foreground/50 font-body text-sm">לחצו על כל קלף כדי לחשוף אותו</p>
                  </div>

                  <div className={`flex items-center justify-center gap-4 md:gap-6 flex-wrap mb-8`}>
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
                                className="absolute inset-0 rounded-xl flex flex-col items-center justify-center"
                                style={{
                                  backfaceVisibility: "hidden",
                                  background: "linear-gradient(145deg, hsl(0 40% 18%), hsl(0 25% 10%))",
                                  border: "1px solid hsl(var(--gold) / 0.3)",
                                  boxShadow: isLocked
                                    ? "0 0 20px hsl(var(--crimson) / 0.15)"
                                    : "0 0 25px hsl(var(--gold) / 0.15), 0 8px 30px hsl(0 0% 0% / 0.4)",
                                }}
                              >
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center" style={{ border: "1px solid hsl(var(--gold) / 0.25)", background: "radial-gradient(circle, hsl(var(--gold) / 0.08), transparent)" }}>
                                  {isLocked ? <Lock className="w-5 h-5 text-gold/40" /> : <span className="text-xl">✦</span>}
                                </div>
                                <span className="font-body text-[10px] text-gold/40 mt-2">{selectedSpread.positionLabels[i]}</span>
                                {isLocked && <span className="font-body text-[9px] text-crimson-light/60 mt-1">פרימיום</span>}
                              </div>

                              {/* Card front */}
                              <div
                                className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-2"
                                style={{
                                  backfaceVisibility: "hidden",
                                  transform: "rotateY(180deg)",
                                  background: "linear-gradient(145deg, hsl(222 40% 10%), hsl(0 20% 8%))",
                                  border: "1px solid hsl(var(--gold) / 0.35)",
                                  boxShadow: "0 0 30px hsl(var(--gold) / 0.15), 0 8px 30px hsl(0 0% 0% / 0.4)",
                                }}
                              >
                                <motion.span className="text-3xl md:text-4xl" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                  {card.symbol}
                                </motion.span>
                                <span className="font-heading text-xs md:text-sm text-gold text-center px-2">{card.hebrewName}</span>
                                <span className="font-body text-[9px] text-foreground/40">{selectedSpread.positionLabels[i]}</span>
                              </div>
                            </motion.div>
                          </div>
                          {/* Glow effect when revealed */}
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

                  {/* Premium prompt inline */}
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
                        <h4 className="font-heading text-sm text-gold mb-2">גלו את הקריאה המלאה</h4>
                        <p className="text-foreground/50 font-body text-xs mb-4 leading-relaxed">
                          חשפו את כל הקלפים וקבלו פירוש מעמיק, מסר רוחני אישי ותובנות סמליות שמיועדות רק לכם
                        </p>
                        <a href="#premium" onClick={handleClose} className="btn-gold font-body text-xs inline-flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" />פתחו קריאה מלאה
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {allRevealed && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gold/60 font-body text-sm">
                      <Sparkles className="w-4 h-4 inline-block ml-1" />כל הקלפים נחשפו — הדוח שלכם מתגלה...
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* PHASE 4: Results */}
              {phase === "result" && selectedSpread && drawnCards.length > 0 && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative p-6 md:p-10">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                      <span className="text-3xl">{selectedSpread.icon}</span>
                    </motion.div>
                    <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mt-3 mb-2">{selectedSpread.hebrewName}</h2>
                    <p className="text-foreground/50 font-body text-sm">{drawnCards.map(c => `${c.symbol} ${c.hebrewName}`).join("  •  ")}</p>
                    
                    {/* Share buttons */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <motion.button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "hsl(142 70% 35% / 0.15)", border: "1px solid hsl(142 70% 45% / 0.25)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                        <Share2 className="w-3.5 h-3.5" />שתפו
                      </motion.button>
                      <motion.button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "hsl(var(--gold) / 0.12)", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "הועתק!" : "העתקה"}
                      </motion.button>
                    </div>
                  </div>

                  <div className="section-divider max-w-[120px] mx-auto mb-8" />

                  {/* Card results */}
                  <div className="space-y-8">
                    {drawnCards.map((card, i) => {
                      const isFreeLocked = !selectedSpread.isFree && i >= selectedSpread.freeRevealCount;
                      const interp = getInterpretation(card, selectedSpread.key, selectedSpread.positionLabels[i]);
                      
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.3 }}
                        >
                          {/* Card header */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 relative" style={{ background: "linear-gradient(135deg, hsl(0 30% 15%), hsl(222 30% 12%))", border: "1px solid hsl(var(--gold) / 0.25)", boxShadow: "0 0 20px hsl(var(--gold) / 0.1)" }}>
                              <motion.span className="text-2xl" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }}>{card.symbol}</motion.span>
                            </div>
                            <div className="text-right">
                              <h3 className="font-heading text-lg text-gold">{card.hebrewName}</h3>
                              <span className="font-body text-xs text-foreground/40">{interp.positionLabel}</span>
                            </div>
                          </div>

                          {isFreeLocked ? (
                            /* Locked card - teaser */
                            <div className="rounded-xl p-6 text-center" style={{ background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.4), hsl(0 20% 8% / 0.3))", border: "1px solid hsl(var(--gold) / 0.08)" }}>
                              <p className="text-foreground/40 font-body text-sm leading-relaxed mb-4" style={{ filter: "blur(3px)", userSelect: "none" }}>
                                {interp.spreadMeaning.substring(0, 80)}...
                              </p>
                              <Lock className="w-5 h-5 text-gold/30 mx-auto mb-2" />
                              <p className="text-foreground/40 font-body text-xs">
                                הקלף הזה מחכה לכם בקריאה המלאה ✦
                              </p>
                            </div>
                          ) : (
                            /* Revealed card - full interpretation */
                            <div className="space-y-3">
                              {/* Main meaning */}
                              <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.4), hsl(0 20% 8% / 0.3))", border: "1px solid hsl(var(--gold) / 0.08)" }}>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--gold) / 0.1)" }}>
                                    <span className="text-xs">✦</span>
                                  </div>
                                  <h4 className="font-heading text-xs text-gold">משמעות הקלף</h4>
                                </div>
                                <p className="text-foreground/70 font-body text-sm leading-[1.85] text-right">{interp.mainMeaning}</p>
                              </div>

                              {/* Spread-specific meaning */}
                              <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.06), hsl(var(--gold) / 0.04))", border: "1px solid hsl(var(--gold) / 0.1)" }}>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--crimson) / 0.12)" }}>
                                    <span className="text-xs">{selectedSpread.icon}</span>
                                  </div>
                                  <h4 className="font-heading text-xs text-gold">{selectedSpread.hebrewName} — {interp.positionLabel}</h4>
                                </div>
                                <p className="text-foreground/70 font-body text-sm leading-[1.85] text-right">{interp.spreadMeaning}</p>
                              </div>

                              {/* Spiritual message */}
                              <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, hsl(215 70% 15% / 0.3), hsl(var(--deep-blue) / 0.3))", border: "1px solid hsl(var(--gold) / 0.08)" }}>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--celestial) / 0.15)" }}>
                                    <Sparkles className="w-3 h-3 text-gold" />
                                  </div>
                                  <h4 className="font-heading text-xs text-gold">מסר רוחני</h4>
                                </div>
                                <p className="text-foreground/70 font-body text-sm leading-[1.85] text-right">{interp.spiritualMessage}</p>
                              </div>

                              {/* Advice */}
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

                  {/* Premium CTA at bottom for partial readings */}
                  {!selectedSpread.isFree && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className="text-center rounded-xl p-6 mt-8"
                      style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))", border: "1px solid hsl(var(--gold) / 0.12)" }}
                    >
                      <Crown className="w-6 h-6 text-gold mx-auto mb-3" />
                      <h4 className="font-heading text-base text-gold mb-2">גלו את הקריאה המלאה</h4>
                      <p className="text-foreground/50 font-body text-xs mb-4 max-w-sm mx-auto leading-relaxed">
                        קבלו פירוש מעמיק לכל הקלפים, מסרים רוחניים אישיים ותובנות סמליות שנועדו רק לנשמה שלכם
                      </p>
                      <a href="#premium" onClick={handleClose} className="btn-gold font-body text-xs inline-flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />הזמינו קריאה פרימיום
                      </a>
                    </motion.div>
                  )}

                  {/* New reading button */}
                  <div className="text-center mt-6">
                    <motion.button
                      onClick={() => { setPhase("select"); setSelectedSpread(null); setDrawnCards([]); setRevealedIndices(new Set()); setShowPremium(false); }}
                      className="font-body text-xs text-gold/50 hover:text-gold transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      ← קריאה חדשה
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TarotWorldModal;

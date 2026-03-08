import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Heart, Briefcase, Eye, Lightbulb, Crown, Share2, Copy, Check, Layers } from "lucide-react";
import { drawTarotCards, TarotCard } from "@/data/tarotData";
import { tarotCardImages } from "@/data/tarotCardImages";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import ShareResultSection from "@/components/ShareResultSection";
import MysticalOnboarding from "@/components/MysticalOnboarding";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";

interface Props { isOpen: boolean; onClose: () => void; }

const cardSections = [
  { key: "meaning", label: "משמעות הקלף", icon: Eye },
  { key: "love", label: "אהבה", icon: Heart },
  { key: "career", label: "קריירה", icon: Briefcase },
  { key: "spiritual", label: "מסר רוחני", icon: Sparkles },
  { key: "advice", label: "עצה", icon: Lightbulb },
] as const;

const TarotModal = ({ isOpen, onClose }: Props) => {
  const [cards, setCards] = useState<TarotCard[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleDraw = () => {
    setIsLoading(true);
  };

  const handleOnboardingComplete = () => {
    const drawn = drawTarotCards(3);
    setCards(drawn);
    setIsLoading(false);
    readingsStorage.save({
      type: "tarot",
      title: `פתיחת טארוט`,
      subtitle: drawn.map(c => c.hebrewName).join(" • "),
      symbol: "🔮",
      data: { cards: drawn },
    });
  };

  const handleClose = () => { onClose(); setTimeout(() => { setCards(null); setIsLoading(false); setActiveCard(0); }, 300); };

  const handleShare = () => {
    if (!cards) return;
    const text = `🔮 קריאת הטארוט שלי:\n${cards.map(c => `${c.symbol} ${c.hebrewName}`).join("\n")}\n\n✨ פתחו גם אתם טארוט בחינם:\n${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!cards) return;
    await navigator.clipboard.writeText(`🔮 ${cards.map(c => `${c.symbol} ${c.hebrewName}`).join(" • ")}`);
    setCopied(true); toast("הטקסט הועתק בהצלחה ✦"); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleClose} />
          <motion.div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "linear-gradient(145deg, hsl(222 40% 8% / 0.97), hsl(222 47% 6% / 0.98))", border: "1px solid hsl(var(--gold) / 0.2)", boxShadow: "0 0 60px hsl(var(--gold) / 0.1)" }} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}>
            <button onClick={handleClose} className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors" style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}><X className="w-4 h-4 text-gold/70" /></button>
            <div className="absolute top-4 right-4 z-20"><span className="px-3 py-1 rounded-full text-[10px] font-bold font-body tracking-wider" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))", border: "1px solid hsl(var(--gold) / 0.3)", color: "hsl(var(--gold))" }}>✦ חינם</span></div>

            <AnimatePresence mode="wait">
              {!cards && !isLoading ? (
                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 md:p-12 text-center">
                  <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
                    <Eye className="w-7 h-7 text-gold" />
                  </motion.div>
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">פתיחת טארוט</h2>
                  <p className="text-foreground/70 font-body text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">שלושה קלפים ייבחרו עבורכם מהארקנה הגדולה. כל קלף נושא מסר רוחני עמוק על אהבה, קריירה ונתיב הנשמה. התרכזו בשאלה שבליבכם ולחצו לפתוח.</p>
                  <motion.button onClick={handleDraw} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Sparkles className="w-4 h-4" />פתחו את הקלפים</motion.button>
                  <p className="text-[11px] text-muted-foreground font-body mt-6">✦ שלושה קלפים מהארקנה הגדולה — בחינם ✦</p>
                </motion.div>
              ) : isLoading ? (
                <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <MysticalOnboarding onComplete={handleOnboardingComplete} />
                </motion.div>
              ) : cards ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10">
                  <div className="text-center mb-6">
                    <motion.h2 className="font-heading text-2xl gold-gradient-text mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>הקלפים שנבחרו עבורכם</motion.h2>
                    {/* Card selector */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                      {cards.map((card, i) => (
                        <motion.button key={i} onClick={() => setActiveCard(i)} className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all ${activeCard === i ? "ring-1 ring-gold/40" : ""}`} style={{ background: activeCard === i ? "hsl(var(--gold) / 0.1)" : "hsl(var(--deep-blue-light) / 0.3)", border: `1px solid hsl(var(--gold) / ${activeCard === i ? "0.3" : "0.08"})` }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.2 }} whileHover={{ scale: 1.05 }}>
                          {tarotCardImages[card.name] ? (
                            <img src={tarotCardImages[card.name]} alt={card.hebrewName} className="w-10 h-14 object-cover rounded" />
                          ) : (
                            <span className="text-2xl">{card.symbol}</span>
                          )}
                          <span className={`font-body text-xs ${activeCard === i ? "text-gold" : "text-foreground/60"}`}>{card.hebrewName}</span>
                          <span className="text-[10px] text-muted-foreground font-body">קלף {i + 1}</span>
                        </motion.button>
                      ))}
                    </div>
                    <motion.div className="section-divider max-w-[120px] mx-auto" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8 }} />
                    <motion.div className="flex items-center justify-center gap-3 mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                      <motion.button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-3.5 h-3.5" />שתפו בוואטסאפ</motion.button>
                      <motion.button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? "הועתק!" : "העתקת טקסט"}</motion.button>
                    </motion.div>
                  </div>
                  {/* Active card details */}
                  <AnimatePresence mode="wait">
                    <motion.div key={activeCard} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <div className="text-center mb-4">
                        {tarotCardImages[cards[activeCard].name] ? (
                          <img src={tarotCardImages[cards[activeCard].name]} alt={cards[activeCard].hebrewName} className="w-32 h-48 object-cover rounded-lg mx-auto shadow-lg" style={{ border: "2px solid hsl(var(--gold) / 0.3)" }} />
                        ) : (
                          <span className="text-4xl">{cards[activeCard].symbol}</span>
                        )}
                        <h3 className="font-heading text-lg text-gold mt-2">{cards[activeCard].hebrewName}</h3>
                      </div>
                      {cardSections.map((section, i) => {
                        const IconComp = section.icon;
                        return (
                          <motion.div key={section.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-xl p-5 md:p-6" style={{ background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.5), hsl(var(--deep-blue) / 0.3))", border: "1px solid hsl(var(--gold) / 0.08)" }}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--gold) / 0.1)", border: "1px solid hsl(var(--gold) / 0.15)" }}><IconComp className="w-4 h-4 text-gold" /></div>
                              <h3 className="font-heading text-sm text-gold">{section.label}</h3>
                            </div>
                            <p className="text-foreground/75 font-body text-sm leading-[1.85] text-right">{cards[activeCard][section.key as keyof TarotCard]}</p>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                  <ShareResultSection symbol={cards[activeCard].symbol} title={cards[activeCard].hebrewName} subtitle="קריאת טארוט" />
                  <div className="section-divider max-w-[200px] mx-auto my-8" />
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-center rounded-xl p-6" style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))", border: "1px solid hsl(var(--gold) / 0.12)" }}>
                    <Crown className="w-6 h-6 text-gold mx-auto mb-3" />
                    <h4 className="font-heading text-base text-gold mb-2">רוצים קריאה מלאה?</h4>
                    <p className="text-foreground/60 font-body text-xs mb-4 max-w-sm mx-auto leading-relaxed">הזמינו קריאת טארוט אישית מלאה עם 10 קלפים, פירוש מפורט ותשובות לשאלות שלכם</p>
                    <a href="#premium" onClick={handleClose} className="btn-gold font-body text-xs inline-flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" />הזמינו קריאה פרימיום</a>
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

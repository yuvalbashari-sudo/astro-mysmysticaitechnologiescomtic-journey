import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Sparkles, Crown, Share2, Copy, Check, Loader2 } from "lucide-react";
import { getZodiacSign } from "@/data/zodiacData";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";

interface Props { isOpen: boolean; onClose: () => void; }

const MonthlyForecastModal = ({ isOpen, onClose }: Props) => {
  const [birthDate, setBirthDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signInfo, setSignInfo] = useState<{ name: string; symbol: string; dateRange: string; element: string } | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const monthName = new Date().toLocaleDateString("he-IL", { month: "long" });

  const handleSubmit = async () => {
    if (!birthDate) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const date = new Date(birthDate);
    const sign = getZodiacSign(date);
    setSignInfo({ name: sign.hebrewName, symbol: sign.symbol, dateRange: sign.dateRange, element: sign.element });
    setIsLoading(false);
    setAiLoading(true);
    aiTextRef.current = "";

    streamMysticalReading(
      "forecast",
      { signName: sign.hebrewName, signSymbol: sign.symbol, birthDate, element: sign.element, dateRange: sign.dateRange, monthName },
      (delta) => { aiTextRef.current += delta; setAiText(aiTextRef.current); },
      () => {
        setAiLoading(false);
        readingsStorage.save({
          type: "forecast",
          title: `תחזית חודשית — ${sign.hebrewName}`,
          subtitle: sign.dateRange,
          symbol: sign.symbol,
          data: { signName: sign.hebrewName, birthDate, aiReading: aiTextRef.current },
        });
      },
      (err) => { setAiLoading(false); setAiError(err); toast(err); },
    );
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSignInfo(null); setBirthDate(""); setIsLoading(false);
      setAiText(""); setAiLoading(false); setAiError(null); aiTextRef.current = "";
    }, 300);
  };

  useEffect(() => {
    if (aiLoading && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [aiText, aiLoading]);

  const handleShare = () => {
    if (!signInfo) return;
    const text = `✨ התחזית החודשית שלי — ${signInfo.name} ${signInfo.symbol}\nחודש ${monthName}\n\n🔮 גלו גם את התחזית שלכם:\n${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!aiText) return;
    await navigator.clipboard.writeText(`✨ ${signInfo?.name} — תחזית חודשית\n\n${aiText.slice(0, 300)}...`);
    setCopied(true); toast("הטקסט הועתק ✦"); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleClose} />
          {[...Array(12)].map((_, i) => (
            <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-gold/40 pointer-events-none" style={{ left: `${20 + Math.random() * 60}%`, top: `${10 + Math.random() * 80}%` }} animate={{ opacity: [0, 0.8, 0], y: [0, -40], scale: [0, 1.5, 0] }} transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }} />
          ))}

          <motion.div ref={scrollRef} className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "linear-gradient(145deg, hsl(222 40% 8% / 0.97), hsl(222 47% 6% / 0.98))", border: "1px solid hsl(var(--gold) / 0.2)", boxShadow: "0 0 60px hsl(var(--gold) / 0.1)" }} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}>
            <button onClick={handleClose} className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors" style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}><X className="w-4 h-4 text-gold/70" /></button>
            <div className="absolute top-4 right-4 z-20"><span className="px-3 py-1 rounded-full text-[10px] font-bold font-body tracking-wider" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))", border: "1px solid hsl(var(--gold) / 0.3)", color: "hsl(var(--gold))" }}>✦ חינם</span></div>

            <AnimatePresence mode="wait">
              {!signInfo && !isLoading ? (
                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 md:p-12 text-center">
                  <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ boxShadow: ["0 0 20px hsl(43 80% 55% / 0.1)", "0 0 40px hsl(43 80% 55% / 0.2)", "0 0 20px hsl(43 80% 55% / 0.1)"] }} transition={{ duration: 3, repeat: Infinity }}>
                    <Calendar className="w-7 h-7 text-gold" />
                  </motion.div>
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">התחזית החודשית שלך</h2>
                  <p className="text-foreground/70 font-body text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">גלו את האנרגיה שמקיפה אתכם החודש דרך המזל שלכם ותאריך הלידה. קבלו תובנות על אהבה, קריירה, בריאות ומסר רוחני אישי.</p>
                  <div className="max-w-xs mx-auto mb-8">
                    <label className="block text-sm text-gold/70 font-body mb-2 text-right">תאריך לידה</label>
                    <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                  </div>
                  <motion.button onClick={handleSubmit} disabled={!birthDate} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Sparkles className="w-4 h-4" />גלו את התחזית שלי</motion.button>
                  <p className="text-[11px] text-muted-foreground font-body mt-6">✦ ניתוח מיסטי מבוסס על המזל שלכם — לגמרי בחינם ✦</p>
                </motion.div>
              ) : isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 md:p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <motion.div className="w-20 h-20 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.2), transparent)", border: "1px solid hsl(var(--gold) / 0.3)" }} animate={{ scale: [1, 1.2, 1], boxShadow: ["0 0 20px hsl(43 80% 55% / 0.15)", "0 0 50px hsl(43 80% 55% / 0.35)", "0 0 20px hsl(43 80% 55% / 0.15)"] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  <motion.p className="font-body text-gold/80 text-base" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>הכוכבים מפענחים את המסר שלכם...</motion.p>
                </motion.div>
              ) : signInfo ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div className="text-5xl mb-3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>{signInfo.symbol}</motion.div>
                    <motion.h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{signInfo.name}</motion.h2>
                    <motion.p className="text-muted-foreground font-body text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{signInfo.dateRange} • יסוד {signInfo.element}</motion.p>
                    <motion.div className="section-divider max-w-[120px] mx-auto mt-4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }} />
                    <motion.p className="text-gold/60 font-body text-xs mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>תחזית חודש {monthName}</motion.p>
                    <motion.div className="flex items-center justify-center gap-3 mt-5" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                      <motion.button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-3.5 h-3.5" />שתפו בוואטסאפ</motion.button>
                      <motion.button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? "הועתק!" : "העתקת טקסט"}</motion.button>
                    </motion.div>
                  </div>

                  {/* AI Content */}
                  {aiText ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {renderMysticalText(aiText)}
                      {aiLoading && (
                        <motion.div className="flex items-center justify-center gap-2 mt-6" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                          <Loader2 className="w-4 h-4 text-gold/60 animate-spin" />
                          <span className="font-body text-xs text-gold/50">הכוכבים מדברים...</span>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : aiError ? (
                    <div className="text-center rounded-xl p-4" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}>
                      <p className="text-foreground/50 font-body text-xs">{aiError}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <motion.div className="w-16 h-16 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }} />
                      <motion.p className="font-body text-gold/70 text-sm" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>כותבים את התחזית שלכם...</motion.p>
                    </div>
                  )}

                  {/* Premium */}
                  {!aiLoading && (aiText || aiError) && (
                    <>
                      <div className="section-divider max-w-[200px] mx-auto my-8" />
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="text-center rounded-xl p-6" style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))", border: "1px solid hsl(var(--gold) / 0.12)" }}>
                        <Crown className="w-6 h-6 text-gold mx-auto mb-3" />
                        <h4 className="font-heading text-base text-gold mb-2">רוצים לצלול עמוק יותר?</h4>
                        <p className="text-foreground/60 font-body text-xs mb-4 max-w-sm mx-auto leading-relaxed">הזמינו קריאה אישית מלאה הכוללת מפת לידה מפורטת, התאמה זוגית, קריאת טארוט ועוד</p>
                        <a href="#premium" onClick={handleClose} className="btn-gold font-body text-xs inline-flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" />הזמינו קריאה פרימיום</a>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MonthlyForecastModal;

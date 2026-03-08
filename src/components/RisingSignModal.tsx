import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Sparkles, Crown, Share2, Copy, Check, Loader2, Calendar } from "lucide-react";
import { getRisingSign } from "@/data/risingSignData";
import { getZodiacSign } from "@/data/zodiacData";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";
import ShareResultSection from "@/components/ShareResultSection";
import MysticalOnboarding from "@/components/MysticalOnboarding";

interface Props { isOpen: boolean; onClose: () => void; }

interface SignInfoState {
  name: string;
  symbol: string;
  element: string;
  sunSign: string;
  sunSymbol: string;
  sunElement: string;
}

const RisingSignModal = ({ isOpen, onClose }: Props) => {
  const [birthTime, setBirthTime] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signInfo, setSignInfo] = useState<SignInfoState | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (!birthTime || !birthDate) return;
    setIsLoading(true);
  };

  const handleOnboardingComplete = () => {
    const [h, m] = birthTime.split(":").map(Number);
    const rising = getRisingSign(h, m);
    const sunSign = getZodiacSign(new Date(birthDate));
    setSignInfo({
      name: rising.hebrewName,
      symbol: rising.symbol,
      element: rising.element,
      sunSign: sunSign.hebrewName,
      sunSymbol: sunSign.symbol,
      sunElement: sunSign.element,
    });
    setIsLoading(false);
    setAiLoading(true);
    aiTextRef.current = "";

    streamMysticalReading(
      "rising",
      {
        signName: rising.hebrewName,
        signSymbol: rising.symbol,
        element: rising.element,
        birthTime,
        birthDate,
        sunSignName: sunSign.hebrewName,
        sunSignSymbol: sunSign.symbol,
        sunElement: sunSign.element,
      },
      (delta) => { aiTextRef.current += delta; setAiText(aiTextRef.current); },
      () => {
        setAiLoading(false);
        readingsStorage.save({
          type: "rising",
          title: `מזל עולה — ${rising.hebrewName}`,
          subtitle: `מזל שמש: ${sunSign.hebrewName} | יסוד ${rising.element}`,
          symbol: rising.symbol,
          data: { signName: rising.hebrewName, sunSign: sunSign.hebrewName, birthTime, birthDate, aiReading: aiTextRef.current },
        });
      },
      (err) => { setAiLoading(false); setAiError(err); toast(err); },
    );
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSignInfo(null); setBirthTime(""); setBirthDate(""); setIsLoading(false);
      setAiText(""); setAiLoading(false); setAiError(null); aiTextRef.current = "";
    }, 300);
  };

  useEffect(() => {
    if (aiLoading && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [aiText, aiLoading]);

  const handleShare = () => {
    if (!signInfo) return;
    const text = `✨ המזל העולה שלי — ${signInfo.name} ${signInfo.symbol}\n☀️ מזל שמש: ${signInfo.sunSign} ${signInfo.sunSymbol}\n\n🔮 גלו גם את המזל העולה שלכם:\n${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!aiText) return;
    await navigator.clipboard.writeText(`✨ מזל עולה — ${signInfo?.name} | מזל שמש — ${signInfo?.sunSign}\n\n${aiText.slice(0, 300)}...`);
    setCopied(true); toast("הטקסט הועתק ✦"); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleClose} />
          <motion.div ref={scrollRef} className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "linear-gradient(145deg, hsl(222 40% 8% / 0.97), hsl(222 47% 6% / 0.98))", border: "1px solid hsl(var(--gold) / 0.2)", boxShadow: "0 0 60px hsl(var(--gold) / 0.1)" }} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}>
            <button onClick={handleClose} className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors" style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}><X className="w-4 h-4 text-gold/70" /></button>
            <div className="absolute top-4 right-4 z-20"><span className="px-3 py-1 rounded-full text-[10px] font-bold font-body tracking-wider" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))", border: "1px solid hsl(var(--gold) / 0.3)", color: "hsl(var(--gold))" }}>✦ חינם</span></div>

            <AnimatePresence mode="wait">
              {!signInfo && !isLoading ? (
                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 md:p-12 text-center">
                  <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
                    <Clock className="w-7 h-7 text-gold" />
                  </motion.div>
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">ניתוח מזל עולה ושמש</h2>
                  <p className="text-foreground/70 font-body text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">הזינו את תאריך ושעת הלידה שלכם לקבלת ניתוח משולב — מזל השמש שלכם (המהות הפנימית) יחד עם המזל העולה (הפנים שאתם מציגים לעולם).</p>
                  <div className="max-w-xs mx-auto space-y-5 mb-8">
                    <div>
                      <label className="block text-sm text-gold/70 font-body mb-2 text-right">
                        <Calendar className="w-3.5 h-3.5 inline-block ml-1" />
                        תאריך לידה
                      </label>
                      <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                    </div>
                    <div>
                      <label className="block text-sm text-gold/70 font-body mb-2 text-right">
                        <Clock className="w-3.5 h-3.5 inline-block ml-1" />
                        שעת לידה
                      </label>
                      <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                    </div>
                  </div>
                  <motion.button onClick={handleSubmit} disabled={!birthTime || !birthDate} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Sparkles className="w-4 h-4" />גלו את הניתוח המשולב שלי</motion.button>
                </motion.div>
              ) : isLoading ? (
                <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <MysticalOnboarding onComplete={handleOnboardingComplete} />
                </motion.div>
              ) : signInfo ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10">
                  <div className="text-center mb-8">
                    <motion.div className="flex items-center justify-center gap-3 text-4xl mb-3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                      <span>{signInfo.sunSymbol}</span>
                      <span className="text-gold/40 text-2xl">✦</span>
                      <span>{signInfo.symbol}</span>
                    </motion.div>
                    <motion.h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      {signInfo.sunSign} ☀️ + {signInfo.name} ⬆️
                    </motion.h2>
                    <motion.p className="text-muted-foreground font-body text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                      מזל שמש: {signInfo.sunSign} ({signInfo.sunElement}) · מזל עולה: {signInfo.name} ({signInfo.element})
                    </motion.p>
                    <motion.div className="section-divider max-w-[120px] mx-auto mt-4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }} />
                    <motion.div className="flex items-center justify-center gap-3 mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                      <motion.button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-3.5 h-3.5" />שתפו בוואטסאפ</motion.button>
                      <motion.button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? "הועתק!" : "העתקת טקסט"}</motion.button>
                    </motion.div>
                  </div>

                  {aiText ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {renderMysticalText(aiText)}
                      {aiLoading && (
                        <motion.div className="flex items-center justify-center gap-2 mt-6" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                          <Loader2 className="w-4 h-4 text-gold/60 animate-spin" />
                          <span className="font-body text-xs text-gold/50">הניתוח המשולב מתגלה...</span>
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
                      <motion.p className="font-body text-gold/70 text-sm" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>מנתחים את מזל השמש והמזל העולה שלכם...</motion.p>
                    </div>
                  )}

                  {!aiLoading && (aiText || aiError) && (
                    <>
                      <ShareResultSection symbol={signInfo.symbol} title={`${signInfo.sunSign} + ${signInfo.name}`} subtitle={`מזל שמש ועולה`} />
                      <div className="section-divider max-w-[200px] mx-auto my-8" />
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="text-center rounded-xl p-6" style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))", border: "1px solid hsl(var(--gold) / 0.12)" }}>
                        <Crown className="w-6 h-6 text-gold mx-auto mb-3" />
                        <h4 className="font-heading text-base text-gold mb-2">רוצים לצלול עמוק יותר?</h4>
                        <p className="text-foreground/60 font-body text-xs mb-4 max-w-sm mx-auto leading-relaxed">הזמינו קריאה אישית מלאה הכוללת מפת לידה מפורטת עם המזל העולה, בתי המזלות ועוד</p>
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

export default RisingSignModal;

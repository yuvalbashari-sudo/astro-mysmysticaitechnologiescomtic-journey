import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Heart, MessageCircle, Flame, AlertTriangle, Lightbulb, Crown, Share2, Copy, Check } from "lucide-react";
import { getSignFromDate, getSignHebrew, getSignSymbol, getCompatibility, CompatibilityResult } from "@/data/compatibilityData";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";

interface Props { isOpen: boolean; onClose: () => void; }

const sections = [
  { key: "overallMatch", label: "התאמה כללית", icon: Sparkles },
  { key: "emotionalConnection", label: "חיבור רגשי", icon: Heart },
  { key: "communicationStyle", label: "תקשורת", icon: MessageCircle },
  { key: "passionLevel", label: "תשוקה", icon: Flame },
  { key: "challengesAndGrowth", label: "אתגרים וצמיחה", icon: AlertTriangle },
  { key: "advice", label: "עצת הכוכבים", icon: Lightbulb },
] as const;

const CompatibilityModal = ({ isOpen, onClose }: Props) => {
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [result, setResult] = useState<{ compatibility: CompatibilityResult; sign1: string; sign2: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!date1 || !date2) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 2500));
    const s1 = getSignFromDate(new Date(date1));
    const s2 = getSignFromDate(new Date(date2));
    const compat = getCompatibility(s1, s2);
    setResult({ compatibility: compat, sign1: s1, sign2: s2 });
    setIsLoading(false);
    readingsStorage.save({
      type: "compatibility",
      title: `התאמה זוגית — ${getSignHebrew(s1)} + ${getSignHebrew(s2)}`,
      subtitle: `ציון: ${compat.score}%`,
      symbol: `${getSignSymbol(s1)}💕${getSignSymbol(s2)}`,
      data: { compatibility: compat, sign1: s1, sign2: s2, date1, date2 },
    });
  };

  const handleClose = () => { onClose(); setTimeout(() => { setResult(null); setDate1(""); setDate2(""); setIsLoading(false); }, 300); };

  const handleShare = () => {
    if (!result) return;
    const text = `💕 התאמה זוגית: ${getSignHebrew(result.sign1)} ${getSignSymbol(result.sign1)} + ${getSignHebrew(result.sign2)} ${getSignSymbol(result.sign2)}\nציון: ${result.compatibility.score}%\n\n🔮 בדקו גם את ההתאמה שלכם בחינם:\n${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `💕 ${getSignHebrew(result.sign1)} + ${getSignHebrew(result.sign2)} — ציון התאמה: ${result.compatibility.score}%`;
    await navigator.clipboard.writeText(text);
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
              {!result && !isLoading ? (
                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 md:p-12 text-center">
                  <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--crimson) / 0.15), transparent)", border: "1px solid hsl(var(--crimson) / 0.2)" }}>
                    <Heart className="w-7 h-7 text-crimson-light" />
                  </motion.div>
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">התאמה זוגית</h2>
                  <p className="text-foreground/70 font-body text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">גלו את רמת ההתאמה הקוסמית ביניכם. הזינו את תאריכי הלידה של שניכם וקבלו ניתוח מעמיק על הקשר, הרגש, התשוקה והצמיחה המשותפת.</p>
                  <div className="max-w-xs mx-auto mb-4">
                    <label className="block text-sm text-gold/70 font-body mb-2 text-right">תאריך לידה — שלי</label>
                    <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                  </div>
                  <div className="max-w-xs mx-auto mb-8">
                    <label className="block text-sm text-gold/70 font-body mb-2 text-right">תאריך לידה — בן/בת הזוג</label>
                    <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                  </div>
                  <motion.button onClick={handleSubmit} disabled={!date1 || !date2} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Sparkles className="w-4 h-4" />גלו את ההתאמה שלנו</motion.button>
                </motion.div>
              ) : isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 md:p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <motion.div className="w-20 h-20 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--crimson) / 0.2), transparent)", border: "1px solid hsl(var(--crimson) / 0.3)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  <motion.p className="font-body text-gold/80 text-base" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>בודקים את ההתאמה הקוסמית ביניכם...</motion.p>
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10">
                  <div className="text-center mb-8">
                    <motion.div className="text-4xl mb-3 flex items-center justify-center gap-3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                      <span>{getSignSymbol(result.sign1)}</span><span className="text-gold">💕</span><span>{getSignSymbol(result.sign2)}</span>
                    </motion.div>
                    <motion.h2 className="font-heading text-xl md:text-2xl gold-gradient-text mb-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{getSignHebrew(result.sign1)} + {getSignHebrew(result.sign2)}</motion.h2>
                    <motion.div className="mt-4 mb-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
                      <span className="text-4xl font-heading gold-gradient-text">{result.compatibility.score}%</span>
                      <p className="text-gold/60 font-body text-xs mt-1">ציון התאמה קוסמית</p>
                    </motion.div>
                    <motion.div className="section-divider max-w-[120px] mx-auto mt-4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6 }} />
                    <motion.div className="flex items-center justify-center gap-3 mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                      <motion.button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-3.5 h-3.5" />שתפו בוואטסאפ</motion.button>
                      <motion.button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? "הועתק!" : "העתקת טקסט"}</motion.button>
                    </motion.div>
                  </div>
                  <div className="space-y-4">
                    {sections.map((section, i) => {
                      const IconComp = section.icon;
                      return (
                        <motion.div key={section.key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="rounded-xl p-5 md:p-6" style={{ background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.5), hsl(var(--deep-blue) / 0.3))", border: "1px solid hsl(var(--gold) / 0.08)" }}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--gold) / 0.1)", border: "1px solid hsl(var(--gold) / 0.15)" }}><IconComp className="w-4 h-4 text-gold" /></div>
                            <h3 className="font-heading text-sm text-gold">{section.label}</h3>
                          </div>
                          <p className="text-foreground/75 font-body text-sm leading-[1.85] text-right">{result.compatibility[section.key as keyof CompatibilityResult]}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="section-divider max-w-[200px] mx-auto my-8" />
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-center rounded-xl p-6" style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))", border: "1px solid hsl(var(--gold) / 0.12)" }}>
                    <Crown className="w-6 h-6 text-gold mx-auto mb-3" />
                    <h4 className="font-heading text-base text-gold mb-2">רוצים ניתוח זוגי מעמיק?</h4>
                    <p className="text-foreground/60 font-body text-xs mb-4 max-w-sm mx-auto leading-relaxed">הזמינו קריאה זוגית מלאה הכוללת מפות לידה של שניכם, ניתוח סינסטרי מפורט ועוד</p>
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

export default CompatibilityModal;

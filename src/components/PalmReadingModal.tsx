import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Hand, Heart, Briefcase, Eye, Flame, Crown, Share2, Copy, Check } from "lucide-react";
import { generatePalmReading, PalmReadingResult } from "@/data/palmData";
import { toast } from "@/components/ui/sonner";

interface Props { isOpen: boolean; onClose: () => void; }

const sections = [
  { key: "overview", label: "תמונה כללית", icon: Eye },
  { key: "heartLine", label: "קו הלב", icon: Heart },
  { key: "headLine", label: "קו הראש", icon: Sparkles },
  { key: "lifeLine", label: "קו החיים", icon: Flame },
  { key: "fateLine", label: "קו הגורל", icon: Crown },
  { key: "loveInsight", label: "תובנת אהבה", icon: Heart },
  { key: "careerInsight", label: "תובנת קריירה", icon: Briefcase },
  { key: "spiritualMessage", label: "מסר רוחני", icon: Eye },
] as const;

const PalmReadingModal = ({ isOpen, onClose }: Props) => {
  const [name, setName] = useState("");
  const [result, setResult] = useState<PalmReadingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 2500));
    setResult(generatePalmReading(name));
    setIsLoading(false);
  };

  const handleClose = () => { onClose(); setTimeout(() => { setResult(null); setName(""); setIsLoading(false); }, 300); };

  const handleShare = () => {
    if (!result) return;
    const text = `✋ קריאת כף היד שלי:\n${result.overview.slice(0, 100)}...\n\n🔮 גלו גם את קריאת כף היד שלכם בחינם:\n${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`✋ קריאת כף היד שלי:\n${result.overview.slice(0, 150)}...`);
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
                  <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
                    <Hand className="w-7 h-7 text-gold" />
                  </motion.div>
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">קריאת כף יד</h2>
                  <p className="text-foreground/70 font-body text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">כף היד שלכם מספרת סיפור שלם — על אהבה, גורל, כוח פנימי ונתיב רוחני. הזינו את שמכם וקבלו קריאה מיסטית מעמיקה.</p>
                  <div className="max-w-xs mx-auto mb-8">
                    <label className="block text-sm text-gold/70 font-body mb-2 text-right">השם שלכם</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="הזינו את שמכם" className="mystical-input font-body text-center" dir="rtl" />
                  </div>
                  <motion.button onClick={handleSubmit} disabled={!name.trim()} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Hand className="w-4 h-4" />קראו את כף היד שלי</motion.button>
                  <p className="text-[11px] text-muted-foreground font-body mt-6">✦ קריאה מיסטית מבוססת על אנרגיית השם — בחינם ✦</p>
                </motion.div>
              ) : isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 md:p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <motion.div className="w-20 h-20 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.2), transparent)", border: "1px solid hsl(var(--gold) / 0.3)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  <motion.p className="font-body text-gold/80 text-base" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>קוראים את הקווים בכף ידכם...</motion.p>
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10">
                  <div className="text-center mb-8">
                    <motion.div className="text-5xl mb-3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>✋</motion.div>
                    <motion.h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>קריאת כף היד — {name}</motion.h2>
                    <motion.p className="text-muted-foreground font-body text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{result.dominantHand}</motion.p>
                    <motion.div className="section-divider max-w-[120px] mx-auto mt-4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }} />
                    <motion.div className="flex items-center justify-center gap-3 mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                      <motion.button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-3.5 h-3.5" />שתפו בוואטסאפ</motion.button>
                      <motion.button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? "הועתק!" : "העתקת טקסט"}</motion.button>
                    </motion.div>
                  </div>
                  <div className="space-y-4">
                    {sections.map((section, i) => {
                      const IconComp = section.icon;
                      return (
                        <motion.div key={section.key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="rounded-xl p-5 md:p-6" style={{ background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.5), hsl(var(--deep-blue) / 0.3))", border: "1px solid hsl(var(--gold) / 0.08)" }}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--gold) / 0.1)", border: "1px solid hsl(var(--gold) / 0.15)" }}><IconComp className="w-4 h-4 text-gold" /></div>
                            <h3 className="font-heading text-sm text-gold">{section.label}</h3>
                          </div>
                          <p className="text-foreground/75 font-body text-sm leading-[1.85] text-right">{result[section.key as keyof PalmReadingResult]}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="section-divider max-w-[200px] mx-auto my-8" />
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-center rounded-xl p-6" style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))", border: "1px solid hsl(var(--gold) / 0.12)" }}>
                    <Crown className="w-6 h-6 text-gold mx-auto mb-3" />
                    <h4 className="font-heading text-base text-gold mb-2">רוצים קריאה אישית מעמיקה?</h4>
                    <p className="text-foreground/60 font-body text-xs mb-4 max-w-sm mx-auto leading-relaxed">הזמינו קריאה אישית מלאה הכוללת ניתוח מפורט של כל קווי כף היד, סימנים מיוחדים ועוד</p>
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

export default PalmReadingModal;

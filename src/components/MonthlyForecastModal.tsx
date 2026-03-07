import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Sparkles, Heart, Coins, Briefcase, Activity, Eye, Flame, Star, Crown } from "lucide-react";
import { getZodiacSign, ZodiacSign } from "@/data/zodiacData";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const reportSections = [
  { key: "personality", label: "אישיות כללית", icon: Star },
  { key: "monthlyEnergy", label: "אנרגיית החודש", icon: Sparkles },
  { key: "love", label: "אהבה", icon: Heart },
  { key: "money", label: "כסף ושפע", icon: Coins },
  { key: "career", label: "קריירה", icon: Briefcase },
  { key: "health", label: "בריאות", icon: Activity },
  { key: "spiritual", label: "מסר רוחני", icon: Eye },
  { key: "sensual", label: "אנרגיה סנסואלית", icon: Flame },
] as const;

const MonthlyForecastModal = ({ isOpen, onClose }: Props) => {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<ZodiacSign | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!birthDate) return;
    setIsLoading(true);
    // Simulate mystical loading
    await new Promise((r) => setTimeout(r, 2000));
    const date = new Date(birthDate);
    const sign = getZodiacSign(date);
    setResult(sign);
    setIsLoading(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setResult(null);
      setBirthDate("");
      setIsLoading(false);
    }, 300);
  };

  const monthName = new Date().toLocaleDateString("he-IL", { month: "long" });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Floating particles behind modal */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold/40 pointer-events-none"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                y: [0, -40],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              background: "linear-gradient(145deg, hsl(222 40% 8% / 0.97), hsl(222 47% 6% / 0.98))",
              border: "1px solid hsl(var(--gold) / 0.2)",
              boxShadow: "0 0 60px hsl(var(--gold) / 0.1), 0 0 120px hsl(var(--gold) / 0.05), inset 0 1px 0 hsl(var(--gold) / 0.1)",
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors"
              style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}
            >
              <X className="w-4 h-4 text-gold/70" />
            </button>

            {/* Free badge */}
            <div className="absolute top-4 right-4 z-20">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold font-body tracking-wider"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))",
                  border: "1px solid hsl(var(--gold) / 0.3)",
                  color: "hsl(var(--gold))",
                }}
              >
                ✦ חינם
              </span>
            </div>

            <AnimatePresence mode="wait">
              {!result && !isLoading ? (
                /* ── Input State ── */
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 md:p-12 text-center"
                >
                  {/* Decorative top */}
                  <motion.div
                    className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{
                      background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)",
                      border: "1px solid hsl(var(--gold) / 0.2)",
                    }}
                    animate={{ boxShadow: ["0 0 20px hsl(43 80% 55% / 0.1)", "0 0 40px hsl(43 80% 55% / 0.2)", "0 0 20px hsl(43 80% 55% / 0.1)"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Calendar className="w-7 h-7 text-gold" />
                  </motion.div>

                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">
                    התחזית החודשית שלך
                  </h2>
                  <p className="text-foreground/70 font-body text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
                    גלו את האנרגיה שמקיפה אתכם החודש דרך המזל שלכם ותאריך הלידה. 
                    קבלו תובנות על אהבה, קריירה, בריאות ומסר רוחני אישי.
                  </p>

                  <div className="max-w-xs mx-auto mb-8">
                    <label className="block text-sm text-gold/70 font-body mb-2 text-right">
                      תאריך לידה
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="mystical-input font-body text-center"
                      style={{ direction: "ltr" }}
                    />
                  </div>

                  <motion.button
                    onClick={handleSubmit}
                    disabled={!birthDate}
                    className="btn-gold font-body flex items-center justify-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles className="w-4 h-4" />
                    גלו את התחזית שלי
                  </motion.button>

                  <p className="text-[11px] text-muted-foreground font-body mt-6">
                    ✦ ניתוח מיסטי מבוסס על המזל שלכם — לגמרי בחינם ✦
                  </p>
                </motion.div>
              ) : isLoading ? (
                /* ── Loading State ── */
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12 md:p-16 text-center flex flex-col items-center justify-center min-h-[300px]"
                >
                  <motion.div
                    className="w-20 h-20 rounded-full mb-6"
                    style={{
                      background: "radial-gradient(circle, hsl(var(--gold) / 0.2), transparent)",
                      border: "1px solid hsl(var(--gold) / 0.3)",
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        "0 0 20px hsl(43 80% 55% / 0.15)",
                        "0 0 50px hsl(43 80% 55% / 0.35)",
                        "0 0 20px hsl(43 80% 55% / 0.15)",
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.p
                    className="font-body text-gold/80 text-base"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    הכוכבים מפענחים את המסר שלכם...
                  </motion.p>

                  {/* Loading particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-gold/50"
                      animate={{
                        x: [0, Math.cos((i / 8) * Math.PI * 2) * 60],
                        y: [0, Math.sin((i / 8) * Math.PI * 2) * 60],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </motion.div>
              ) : result ? (
                /* ── Result State ── */
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 md:p-10"
                >
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      className="text-5xl mb-3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                    >
                      {result.symbol}
                    </motion.div>
                    <motion.h2
                      className="font-heading text-2xl md:text-3xl gold-gradient-text mb-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {result.hebrewName}
                    </motion.h2>
                    <motion.p
                      className="text-muted-foreground font-body text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {result.dateRange} • יסוד {result.element}
                    </motion.p>
                    <motion.div
                      className="section-divider max-w-[120px] mx-auto mt-4"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.5 }}
                    />
                    <motion.p
                      className="text-gold/60 font-body text-xs mt-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      תחזית חודש {monthName}
                    </motion.p>
                  </div>

                  {/* Sections */}
                  <div className="space-y-4">
                    {reportSections.map((section, i) => {
                      const IconComp = section.icon;
                      const content = result[section.key as keyof ZodiacSign];
                      return (
                        <motion.div
                          key={section.key}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="rounded-xl p-5 md:p-6"
                          style={{
                            background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.5), hsl(var(--deep-blue) / 0.3))",
                            border: "1px solid hsl(var(--gold) / 0.08)",
                          }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background: "hsl(var(--gold) / 0.1)",
                                border: "1px solid hsl(var(--gold) / 0.15)",
                              }}
                            >
                              <IconComp className="w-4 h-4 text-gold" />
                            </div>
                            <h3 className="font-heading text-sm text-gold">{section.label}</h3>
                          </div>
                          <p className="text-foreground/75 font-body text-sm leading-[1.85] text-right">
                            {content}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="section-divider max-w-[200px] mx-auto my-8" />

                  {/* Premium upsell */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="text-center rounded-xl p-6"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))",
                      border: "1px solid hsl(var(--gold) / 0.12)",
                    }}
                  >
                    <Crown className="w-6 h-6 text-gold mx-auto mb-3" />
                    <h4 className="font-heading text-base text-gold mb-2">
                      רוצים לצלול עמוק יותר?
                    </h4>
                    <p className="text-foreground/60 font-body text-xs mb-4 max-w-sm mx-auto leading-relaxed">
                      הזמינו קריאה אישית מלאה הכוללת מפת לידה מפורטת, התאמה זוגית, קריאת טארוט ועוד — 
                      הכל מותאם אישית רק בשבילכם
                    </p>
                    <a href="#premium" onClick={handleClose} className="btn-gold font-body text-xs inline-flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      הזמינו קריאה פרימיום
                    </a>
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

export default MonthlyForecastModal;

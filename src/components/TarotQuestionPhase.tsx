import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, PenLine } from "lucide-react";

interface Props {
  spreadType: string;
  spreadLabel: string;
  onSubmit: (question: string) => void;
}

const PLACEHOLDERS: Record<string, string> = {
  love: "האם נכון לי להיכנס לקשר הזה?",
  career: "מה מעכב אותי בקריירה שלי?",
  decision: "איך נכון לי לקבל את ההחלטה שמולי?",
  universe: "מה היקום רוצה שאדע עכשיו?",
  timeline: "מה הסיפור שמתפתח סביבי?",
};

const TarotQuestionPhase = ({ spreadType, spreadLabel, onSubmit }: Props) => {
  const [question, setQuestion] = useState("");

  const placeholder = PLACEHOLDERS[spreadType] || "מה השאלה שמעסיקה אתכם?";

  return (
    <motion.div
      className="p-6 md:p-10 text-center relative overflow-hidden min-h-[480px] flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Cosmic background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 40%, hsl(222 35% 14%), hsl(222 45% 5%))" }}
      />

      {/* Floating particles */}
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={`qp-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 1.5 + Math.random() * 2,
            height: 1.5 + Math.random() * 2,
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            background: i % 3 === 0 ? "hsl(var(--gold) / 0.4)" : "hsl(var(--celestial) / 0.25)",
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -(15 + Math.random() * 30)],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none">
        <line x1="20%" y1="15%" x2="40%" y2="30%" stroke="hsl(43, 80%, 55%)" strokeWidth="0.5" />
        <line x1="40%" y1="30%" x2="30%" y2="50%" stroke="hsl(43, 80%, 55%)" strokeWidth="0.5" />
        <line x1="60%" y1="20%" x2="75%" y2="35%" stroke="hsl(43, 80%, 55%)" strokeWidth="0.5" />
        <line x1="75%" y1="35%" x2="65%" y2="55%" stroke="hsl(43, 80%, 55%)" strokeWidth="0.5" />
      </svg>

      {/* Icon */}
      <motion.div
        className="relative z-10 w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold) / 0.12), transparent)",
          border: "1px solid hsl(var(--gold) / 0.2)",
        }}
        animate={{
          boxShadow: [
            "0 0 15px hsl(43 80% 55% / 0.1)",
            "0 0 30px hsl(43 80% 55% / 0.2)",
            "0 0 15px hsl(43 80% 55% / 0.1)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <PenLine className="w-6 h-6 text-gold" />
      </motion.div>

      {/* Title */}
      <motion.h2
        className="relative z-10 font-heading text-xl md:text-2xl gold-gradient-text mb-2"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        לפני שהקלפים נפתחים
      </motion.h2>

      {/* Spread badge */}
      <motion.div
        className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
        style={{
          background: "hsl(var(--gold) / 0.06)",
          border: "1px solid hsl(var(--gold) / 0.15)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <span className="text-xs text-gold/70 font-body">{spreadLabel}</span>
      </motion.div>

      {/* Description */}
      <motion.p
        className="relative z-10 text-foreground/60 font-body text-sm mb-6 max-w-md mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        dir="rtl"
      >
        הקלפים מגיבים טוב יותר כאשר יש כוונה ברורה. כתבו את השאלה, ההתלבטות או התחום שמעסיק אתכם כעת.
      </motion.p>

      {/* Divider */}
      <motion.div
        className="section-divider max-w-[100px] mx-auto mb-6 relative z-10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.35 }}
      />

      {/* Question input */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <label className="block text-xs text-gold/60 font-body mb-2 text-right" dir="rtl">
          מה השאלה או הבקשה שלכם?
        </label>
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, hsl(222 35% 12% / 0.9), hsl(222 45% 8% / 0.95))",
            border: "1px solid hsl(var(--gold) / 0.15)",
            boxShadow: "0 0 25px hsl(var(--gold) / 0.05), inset 0 1px 0 hsl(var(--gold) / 0.05)",
          }}
        >
          {/* Subtle inner glow */}
          <div
            className="absolute inset-0 pointer-events-none rounded-xl"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, hsl(var(--gold) / 0.04), transparent 60%)",
            }}
          />
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={placeholder}
            dir="rtl"
            rows={4}
            maxLength={500}
            className="w-full bg-transparent text-foreground/90 font-body text-sm p-4 resize-none focus:outline-none placeholder:text-foreground/25 leading-relaxed relative z-10"
            style={{ caretColor: "hsl(var(--gold))" }}
          />
          {/* Character counter */}
          <div className="flex justify-between items-center px-4 pb-2 relative z-10">
            <span className="text-[10px] text-foreground/20 font-body">
              {question.length}/500
            </span>
            <span className="text-[10px] text-gold/30 font-body">
              נסחו שאלה פתוחה, אישית וברורה ככל האפשר
            </span>
          </div>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        onClick={() => onSubmit(question)}
        disabled={!question.trim()}
        className="relative z-10 btn-gold font-heading flex items-center justify-center gap-2 mx-auto px-8 py-3.5 rounded-xl text-sm tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={question.trim() ? { scale: 1.04, boxShadow: "0 0 40px hsl(43 80% 55% / 0.4)" } : {}}
        whileTap={question.trim() ? { scale: 0.97 } : {}}
      >
        <Sparkles className="w-4 h-4" />
        המשיכו לפתיחת הקלפים
      </motion.button>

      {/* Skip option */}
      <motion.button
        onClick={() => onSubmit("")}
        className="relative z-10 text-[11px] text-foreground/30 font-body mt-4 hover:text-foreground/50 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        דלגו והמשיכו ללא שאלה ←
      </motion.button>
    </motion.div>
  );
};

export default TarotQuestionPhase;

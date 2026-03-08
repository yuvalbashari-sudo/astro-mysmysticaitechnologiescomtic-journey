import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye } from "lucide-react";
import { useLanguage, type Language } from "@/i18n";

interface Props {
  spreadType: string;
  spreadLabel: string;
  onSubmit: (question: string) => void;
}

const PLACEHOLDERS: Record<Language, Record<string, string[]>> = {
  he: {
    love: [
      "האם נכון לי להיכנס לקשר הזה?",
      "מה מחזיק אותי מלהתחבר ברגש?",
      "מה הצעד הבא שלי באהבה?",
    ],
    career: [
      "מה מעכב אותי בקריירה שלי?",
      "מה הצעד הנכון עבורי בקריירה?",
      "האם אני בכיוון הנכון מקצועית?",
    ],
    decision: [
      "איך נכון לי לקבל את ההחלטה שמולי?",
      "מה אני לא רואה בסיטואציה הזו?",
      "מה יקרה אם אבחר את הכיוון הזה?",
    ],
    universe: [
      "מה היקום רוצה שאדע עכשיו?",
      "מה המסר שמחכה לי היום?",
      "מה הנשמה שלי מנסה להגיד לי?",
    ],
    timeline: [
      "מה הסיפור שמתפתח סביבי?",
      "מה ההשפעות שפועלות עליי כרגע?",
      "לאן התהליך הזה מוביל אותי?",
    ],
  },
  en: {
    love: [
      "Is this relationship right for me?",
      "What is blocking emotional connection?",
      "What should my next step in love be?",
    ],
    career: [
      "What is holding me back in my career?",
      "What is the right next career move for me?",
      "Am I on the right professional path?",
    ],
    decision: [
      "How should I approach this decision?",
      "What am I not seeing in this situation?",
      "What will happen if I choose this path?",
    ],
    universe: [
      "What does the universe want me to know now?",
      "What message is waiting for me today?",
      "What is my soul trying to tell me?",
    ],
    timeline: [
      "What story is unfolding around me?",
      "What energies are influencing me right now?",
      "Where is this process leading me?",
    ],
  },
  ru: {
    love: [
      "Подходит ли мне эта связь?",
      "Что мешает мне открыться чувствам?",
      "Какой мой следующий шаг в любви?",
    ],
    career: [
      "Что сдерживает меня в карьере?",
      "Какой следующий шаг в карьере верный?",
      "Я двигаюсь в правильном направлении?",
    ],
    decision: [
      "Как лучше принять это решение?",
      "Чего я не вижу в этой ситуации?",
      "Что будет, если я выберу этот путь?",
    ],
    universe: [
      "Что Вселенная хочет сказать мне сейчас?",
      "Какое послание ждёт меня сегодня?",
      "Что пытается сказать моя душа?",
    ],
    timeline: [
      "Какой сюжет разворачивается вокруг меня?",
      "Какие влияния действуют на меня сейчас?",
      "Куда ведёт этот процесс?",
    ],
  },
  ar: {
    love: [
      "هل هذه العلاقة مناسبة لي؟",
      "ما الذي يمنعني من الارتباط عاطفياً؟",
      "ما هي خطوتي القادمة في الحب؟",
    ],
    career: [
      "ما الذي يعيقني في مساري المهني؟",
      "ما هي الخطوة المهنية الصحيحة لي؟",
      "هل أنا على الطريق المهني الصحيح؟",
    ],
    decision: [
      "كيف أتخذ القرار الصحيح الآن؟",
      "ما الذي لا أراه في هذا الموقف؟",
      "ماذا سيحدث إذا اخترت هذا الاتجاه؟",
    ],
    universe: [
      "ماذا يريد الكون أن يخبرني الآن؟",
      "ما الرسالة التي تنتظرني اليوم؟",
      "ماذا تحاول روحي أن تقول لي؟",
    ],
    timeline: [
      "ما القصة التي تتكشف من حولي؟",
      "ما التأثيرات التي تعمل عليّ الآن؟",
      "إلى أين يقودني هذا المسار؟",
    ],
  },
};

const SPREAD_ICONS: Record<string, string> = {
  love: "💕",
  career: "✨",
  decision: "⚖️",
  universe: "🌌",
  timeline: "⏳",
};

const UI_COPY: Record<Language, {
  title: string;
  description: string;
  questionLabel: string;
  guidance: string;
  continueCta: string;
  skipCta: string;
  validation: string;
}> = {
  he: {
    title: "לפני שהקלפים נפתחים",
    description: "הקלפים מגיבים טוב יותר כאשר יש כוונה ברורה. כתבו את השאלה, ההתלבטות או התחום שמעסיק אתכם כעת.",
    questionLabel: "מה השאלה שלכם?",
    guidance: "ככל שהשאלה תהיה ברורה ואישית יותר, כך הקריאה תהיה מדויקת יותר.",
    continueCta: "המשיכו לפתיחת הקלפים",
    skipCta: "דלגו והמשיכו ללא שאלה",
    validation: "כדי שהקלפים יוכלו להעניק מסר מדויק יותר, נסחו שאלה מעט מפורטת יותר.",
  },
  en: {
    title: "Before the cards are revealed",
    description: "Cards respond better when your intention is clear. Write your question, dilemma, or the area that currently occupies your mind.",
    questionLabel: "What is your question?",
    guidance: "The clearer and more personal your question is, the more accurate the reading will be.",
    continueCta: "Continue to reveal the cards",
    skipCta: "Skip and continue without a question",
    validation: "For a more precise message, please write a slightly more detailed question.",
  },
  ru: {
    title: "Перед открытием карт",
    description: "Карты лучше откликаются на чёткое намерение. Напишите вопрос, сомнение или тему, которая волнует вас сейчас.",
    questionLabel: "Какой у вас вопрос?",
    guidance: "Чем яснее и личнее вопрос, тем точнее будет чтение.",
    continueCta: "Продолжить к открытию карт",
    skipCta: "Пропустить и продолжить без вопроса",
    validation: "Чтобы получить более точное послание, сформулируйте вопрос чуть подробнее.",
  },
  ar: {
    title: "قبل أن تنكشف البطاقات",
    description: "تستجيب البطاقات بشكل أفضل عندما تكون نيتك واضحة. اكتب سؤالك أو حيرتك أو المجال الذي يشغلك الآن.",
    questionLabel: "ما سؤالك؟",
    guidance: "كلما كان السؤال أوضح وأكثر شخصية، كانت القراءة أدق.",
    continueCta: "تابع لكشف البطاقات",
    skipCta: "تخطَّ وتابع بدون سؤال",
    validation: "للحصول على رسالة أدق، يُرجى صياغة سؤال أكثر تفصيلاً قليلاً.",
  },
};

const TarotQuestionPhase = ({ spreadType, spreadLabel, onSubmit }: Props) => {
  const { language, dir } = useLanguage();
  const copy = UI_COPY[language];
  const [question, setQuestion] = useState("");
  const [validationMsg, setValidationMsg] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholdersBySpread = PLACEHOLDERS[language];
  const placeholders = placeholdersBySpread[spreadType] || placeholdersBySpread["timeline"];
  const spreadIcon = SPREAD_ICONS[spreadType] || "🔮";

  // Rotate placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleSubmit = () => {
    if (question.trim().length > 0 && question.trim().length < 5) {
      setValidationMsg(copy.validation);
      return;
    }
    setValidationMsg("");
    onSubmit(question);
  };

  return (
    <motion.div
      className="p-5 pb-8 md:p-10 text-center relative overflow-hidden min-h-[520px] flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Layered cosmic background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(222 35% 14%), hsl(222 50% 4%))" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 30% 70%, hsl(var(--gold) / 0.03), transparent 50%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 70% 20%, hsl(var(--celestial) / 0.03), transparent 50%)" }}
      />

      {/* Floating particles — slow and calm */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`qp-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 1 + Math.random() * 2.5,
            height: 1 + Math.random() * 2.5,
            left: `${3 + Math.random() * 94}%`,
            top: `${3 + Math.random() * 94}%`,
            background: i % 4 === 0
              ? "hsl(var(--gold) / 0.5)"
              : i % 4 === 1
                ? "hsl(var(--celestial) / 0.3)"
                : i % 4 === 2
                  ? "hsl(var(--gold) / 0.25)"
                  : "hsl(var(--celestial) / 0.15)",
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -(12 + Math.random() * 25)],
            x: [(Math.random() - 0.5) * 10],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: i * 0.35,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Constellation SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none">
        <line x1="15%" y1="12%" x2="35%" y2="28%" stroke="hsl(43, 80%, 55%)" strokeWidth="0.5" />
        <line x1="35%" y1="28%" x2="28%" y2="48%" stroke="hsl(43, 80%, 55%)" strokeWidth="0.5" />
        <line x1="28%" y1="48%" x2="42%" y2="62%" stroke="hsl(43, 80%, 55%)" strokeWidth="0.5" />
        <line x1="62%" y1="18%" x2="78%" y2="32%" stroke="hsl(43, 80%, 55%)" strokeWidth="0.5" />
        <line x1="78%" y1="32%" x2="68%" y2="52%" stroke="hsl(43, 80%, 55%)" strokeWidth="0.5" />
        <line x1="68%" y1="52%" x2="82%" y2="68%" stroke="hsl(43, 80%, 55%)" strokeWidth="0.5" />
        {/* Star dots */}
        <circle cx="15%" cy="12%" r="1.5" fill="hsl(43, 80%, 55%)" opacity="0.15" />
        <circle cx="35%" cy="28%" r="1" fill="hsl(43, 80%, 55%)" opacity="0.12" />
        <circle cx="62%" cy="18%" r="1.5" fill="hsl(43, 80%, 55%)" opacity="0.15" />
        <circle cx="78%" cy="32%" r="1" fill="hsl(43, 80%, 55%)" opacity="0.12" />
      </svg>

      {/* Mystical eye icon with breathing glow */}
      <motion.div
        className="relative z-10 w-[72px] h-[72px] mx-auto mb-5 rounded-full flex items-center justify-center"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold) / 0.1), hsl(var(--gold) / 0.02) 70%, transparent)",
          border: "1px solid hsl(var(--gold) / 0.18)",
        }}
        animate={{
          boxShadow: [
            "0 0 20px hsl(43 80% 55% / 0.08), inset 0 0 15px hsl(43 80% 55% / 0.03)",
            "0 0 40px hsl(43 80% 55% / 0.18), inset 0 0 25px hsl(43 80% 55% / 0.06)",
            "0 0 20px hsl(43 80% 55% / 0.08), inset 0 0 15px hsl(43 80% 55% / 0.03)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        initial={{ scale: 0.8, opacity: 0 }}
      >
        {/* Outer decorative ring */}
        <motion.div
          className="absolute inset-[-6px] rounded-full pointer-events-none"
          style={{ border: "1px solid hsl(var(--gold) / 0.08)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <Eye className="w-7 h-7 text-gold/80" />
      </motion.div>

      {/* Title */}
      <motion.h2
        className="relative z-10 font-heading text-xl md:text-2xl gold-gradient-text mb-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
      >
        {copy.title}
      </motion.h2>

      {/* Spread badge */}
      <motion.div
        className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
        style={{
          background: "linear-gradient(135deg, hsl(var(--gold) / 0.06), hsl(var(--gold) / 0.02))",
          border: "1px solid hsl(var(--gold) / 0.12)",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
      >
        <span className="text-sm">{spreadIcon}</span>
        <span className="text-xs text-gold/70 font-body">{spreadLabel}</span>
      </motion.div>

      {/* Description */}
      <motion.p
        className="relative z-10 text-foreground/55 font-body text-[13px] md:text-sm mb-5 max-w-sm mx-auto leading-[1.8]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        dir={dir}
      >
        {copy.description}
      </motion.p>

      {/* Elegant divider */}
      <motion.div
        className="relative z-10 flex items-center justify-center gap-3 mb-5"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.35 }}
      >
        <div className="w-12 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.25))" }} />
        <span className="text-gold/30 text-[10px]">✦</span>
        <div className="w-12 h-px" style={{ background: "linear-gradient(90deg, hsl(var(--gold) / 0.25), transparent)" }} />
      </motion.div>

      {/* Question input area */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto mb-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <label className="block text-xs text-gold/50 font-body mb-2.5 text-right" dir={dir}>
          {copy.questionLabel}
        </label>

        <motion.div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, hsl(222 32% 13% / 0.95), hsl(222 42% 9% / 0.98))",
            border: `1px solid hsl(var(--gold) / ${isFocused ? "0.3" : "0.1"})`,
            boxShadow: isFocused
              ? "0 0 30px hsl(var(--gold) / 0.08), 0 0 60px hsl(var(--gold) / 0.03), inset 0 1px 0 hsl(var(--gold) / 0.06)"
              : "0 0 20px hsl(var(--gold) / 0.03), inset 0 1px 0 hsl(var(--gold) / 0.04)",
            transition: "border-color 0.4s ease, box-shadow 0.4s ease",
          }}
        >
          {/* Top decorative line */}
          <motion.div
            className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, hsl(var(--gold) / ${isFocused ? "0.2" : "0.08"}), transparent)`,
              transition: "background 0.4s ease",
            }}
          />

          {/* Inner glow */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, hsl(var(--gold) / 0.03), transparent 55%)",
            }}
          />

          {/* Corner accents */}
          <div className="absolute top-2 right-2 w-3 h-3 pointer-events-none" style={{ borderTop: "1px solid hsl(var(--gold) / 0.1)", borderRight: "1px solid hsl(var(--gold) / 0.1)", borderRadius: "0 4px 0 0" }} />
          <div className="absolute top-2 left-2 w-3 h-3 pointer-events-none" style={{ borderTop: "1px solid hsl(var(--gold) / 0.1)", borderLeft: "1px solid hsl(var(--gold) / 0.1)", borderRadius: "4px 0 0 0" }} />
          <div className="absolute bottom-2 right-2 w-3 h-3 pointer-events-none" style={{ borderBottom: "1px solid hsl(var(--gold) / 0.06)", borderRight: "1px solid hsl(var(--gold) / 0.06)", borderRadius: "0 0 4px 0" }} />
          <div className="absolute bottom-2 left-2 w-3 h-3 pointer-events-none" style={{ borderBottom: "1px solid hsl(var(--gold) / 0.06)", borderLeft: "1px solid hsl(var(--gold) / 0.06)", borderRadius: "0 0 0 4px" }} />

          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              if (validationMsg) setValidationMsg("");
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholders[placeholderIdx]}
            dir={dir}
            rows={4}
            maxLength={500}
            className="w-full bg-transparent text-foreground/90 font-body text-sm p-5 pt-4 resize-none focus:outline-none placeholder:text-foreground/20 leading-[1.9] relative z-10"
            style={{ caretColor: "hsl(var(--gold))" }}
          />

          {/* Bottom bar */}
          <div className="flex justify-between items-center px-5 pb-3 relative z-10">
            <motion.span
              className="text-[10px] font-body"
              style={{ color: question.length > 450 ? "hsl(var(--crimson) / 0.6)" : "hsl(var(--foreground) / 0.15)" }}
            >
              {question.length}/500
            </motion.span>
            <span className="text-[10px] text-gold/25 font-body">
              ✦
            </span>
          </div>
        </motion.div>

        {/* Micro guidance */}
        <motion.p
          className="text-[10px] text-foreground/25 font-body mt-2.5 text-right leading-relaxed"
          dir={dir}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {copy.guidance}
        </motion.p>
      </motion.div>

      {/* Validation message */}
      <AnimatePresence>
        {validationMsg && (
          <motion.div
            className="relative z-10 max-w-sm mx-auto mb-3 px-4 py-2.5 rounded-xl text-center"
            style={{
              background: "hsl(var(--gold) / 0.06)",
              border: "1px solid hsl(var(--gold) / 0.12)",
            }}
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
          >
            <p className="text-foreground/50 font-body text-[11px] leading-relaxed" dir="rtl">
              {validationMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!question.trim()}
        className="relative z-10 group font-heading flex items-center justify-center gap-2.5 mx-auto px-9 py-4 rounded-2xl text-sm tracking-wider disabled:opacity-25 disabled:cursor-not-allowed overflow-hidden"
        style={{
          background: question.trim()
            ? "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))"
            : "hsl(var(--gold) / 0.06)",
          border: `1px solid hsl(var(--gold) / ${question.trim() ? "0.35" : "0.08"})`,
          color: question.trim() ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.4)",
          boxShadow: question.trim() ? "0 0 25px hsl(var(--gold) / 0.1)" : "none",
          transition: "all 0.4s ease",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={question.trim() ? {
          scale: 1.03,
          boxShadow: "0 0 45px hsl(43 80% 55% / 0.25), 0 0 80px hsl(43 80% 55% / 0.08)",
        } : {}}
        whileTap={question.trim() ? { scale: 0.97 } : {}}
      >
        {/* Button glow overlay */}
        {question.trim() && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ background: "radial-gradient(circle at 50% 50%, hsl(var(--gold) / 0.06), transparent 70%)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
        <Sparkles className="w-4 h-4 relative z-10" />
        <span className="relative z-10">המשיכו לפתיחת הקלפים</span>
      </motion.button>

      {/* Skip option */}
      <motion.button
        onClick={() => onSubmit("")}
        className="relative z-10 text-[11px] text-foreground/20 font-body mt-5 hover:text-foreground/40 transition-colors duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        דלגו והמשיכו ללא שאלה
      </motion.button>
    </motion.div>
  );
};

export default TarotQuestionPhase;

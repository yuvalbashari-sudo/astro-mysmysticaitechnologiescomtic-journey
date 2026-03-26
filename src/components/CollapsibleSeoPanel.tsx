import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useLanguage } from "@/i18n";

const CollapsibleSeoPanel = () => {
  const [expanded, setExpanded] = useState(false);
  const { language } = useLanguage();
  const isHe = language === "he" || language === "ar";

  const teaser = isHe
    ? "גלו קריאות טארוט מבוססות AI, ניתוח כף יד, התאמה זוגית לפי מזלות ותובנות רוחניות מותאמות אישית..."
    : "Discover powerful AI tarot readings, palm analysis, zodiac compatibility insights, and personalized spiritual guidance...";

  const fullContent = isHe ? [
    {
      title: "קריאת טארוט אונליין",
      text: "קריאת הטארוט שלנו מבוססת על 78 קלפי טארוט — 22 קלפי ארקנה מאז'ורית ו-56 קלפי ארקנה מינורית. שאלו שאלה, בחרו קלפים וקבלו פירוש מעמיק המשלב מסורת עתיקה עם בינה מלאכותית מתקדמת.",
    },
    {
      title: "קריאת כף יד בבינה מלאכותית",
      text: "העלו תמונות של כפות הידיים וקבלו ניתוח מפורט של קווי החיים, הלב, הגורל והאינטואיציה. מערכת ה-AI מנתחת צורת יד, אצבעות ותילים לתובנות אישיות מדויקות.",
    },
    {
      title: "בדיקת התאמה זוגית לפי מזלות",
      text: "בדקו את הכימיה הקוסמית בינכם לבין בן או בת הזוג. ניתוח מקיף של תאימות רגשית, רומנטית, תקשורתית ורוחנית בין כל 12 המזלות.",
    },
    {
      title: "הדרכה רוחנית מותאמת אישית",
      text: "ASTROLOGAI משלבת מסורות רוחניות עתיקות עם טכנולוגיית AI מתקדמת כדי להעניק לכם חוויה מיסטית פרימיום. קלף יומי חינמי, הורוסקופ חודשי, מפת לידה מפורטת.",
    },
  ] : [
    {
      title: "Online Tarot Reading",
      text: "Our tarot reading uses all 78 tarot cards — 22 Major Arcana and 56 Minor Arcana. Ask a question, select your cards, and receive a deep interpretation combining ancient tradition with advanced AI.",
    },
    {
      title: "AI Palm Reading Analysis",
      text: "Upload photos of your palms and receive a detailed analysis of your life line, heart line, fate line, and intuition line. Our AI examines hand shape, fingers, and mounts for precise personal insights.",
    },
    {
      title: "Zodiac Compatibility Test",
      text: "Discover the cosmic chemistry between you and your partner. A comprehensive analysis of emotional, romantic, communicative, and spiritual compatibility across all 12 zodiac signs.",
    },
    {
      title: "Personalized Spiritual Guidance",
      text: "ASTROLOGAI combines ancient spiritual traditions with advanced AI technology to deliver a premium mystical experience. Free daily card, monthly horoscope, and detailed birth chart.",
    },
  ];

  const buttonLabel = expanded
    ? (isHe ? "הסתר" : "Show less")
    : (isHe ? "גלו עוד ✦" : "Explore deeper ✦");

  return (
    <section
      className="relative w-full max-w-2xl px-4"
      aria-label={isHe ? "תוכן נוסף" : "Additional content"}
    >
      {/* Expanded content appears ABOVE the teaser (grows upward) */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="seo-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden rounded-xl mb-3"
            style={{
              background: "hsl(var(--background) / 0.92)",
              backdropFilter: "blur(16px)",
              border: "1px solid hsl(var(--gold) / 0.1)",
            }}
          >
            <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
              {fullContent.map((block, i) => (
                <article key={i} className="text-center">
                  <h3 className="mb-1 font-heading text-xs tracking-wide text-gold/70">
                    {block.title}
                  </h3>
                  <p className="font-body text-[11px] leading-[1.8] text-foreground/40">
                    {block.text}
                  </p>
                </article>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teaser + toggle - always visible */}
      <div className="text-center">
        <p className="font-body text-[11px] leading-relaxed text-muted-foreground/50 mb-2">
          {teaser}
        </p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 font-body text-[11px] tracking-wide transition-all duration-300 hover:bg-gold/5"
          style={{
            borderColor: "hsl(var(--gold) / 0.15)",
            color: "hsl(var(--gold) / 0.6)",
            background: "hsl(var(--gold) / 0.03)",
          }}
          aria-expanded={expanded}
        >
          {buttonLabel}
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex"
          >
            <ChevronUp className="h-3 w-3" />
          </motion.span>
        </button>
      </div>

      {/* Fallback for crawlers with JS disabled */}
      <noscript>
        <div className="mt-4 space-y-3">
          {fullContent.map((block, i) => (
            <div key={i} className="text-center">
              <h3 className="mb-1 text-xs text-gold/70">{block.title}</h3>
              <p className="text-[11px] text-foreground/40">{block.text}</p>
            </div>
          ))}
        </div>
      </noscript>
    </section>
  );
};

export default CollapsibleSeoPanel;

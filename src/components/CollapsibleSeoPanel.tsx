import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
      text: "קריאת הטארוט שלנו מבוססת על 78 קלפי טארוט — 22 קלפי ארקנה מאז'ורית ו-56 קלפי ארקנה מינורית. שאלו שאלה, בחרו קלפים וקבלו פירוש מעמיק המשלב מסורת עתיקה עם בינה מלאכותית מתקדמת. כל קריאה מותאמת אישית לשם, לתאריך הלידה ולשאלה שלכם.",
    },
    {
      title: "קריאת כף יד בבינה מלאכותית",
      text: "העלו תמונות של כפות הידיים וקבלו ניתוח מפורט של קווי החיים, הלב, הגורל והאינטואיציה. מערכת ה-AI מנתחת צורת יד, אצבעות ותילים לתובנות אישיות מדויקות על עבר, הווה ועתיד.",
    },
    {
      title: "בדיקת התאמה זוגית לפי מזלות",
      text: "בדקו את הכימיה הקוסמית בינכם לבין בן או בת הזוג. ניתוח מקיף של תאימות רגשית, רומנטית, תקשורתית ורוחנית בין כל 12 המזלות — מטלה ועד דגים.",
    },
    {
      title: "הדרכה רוחנית מותאמת אישית",
      text: "ASTROLOGAI משלבת מסורות רוחניות עתיקות עם טכנולוגיית AI מתקדמת כדי להעניק לכם חוויה מיסטית פרימיום. קלף יומי חינמי, הורוסקופ חודשי, מפת לידה מפורטת — כל הכלים להבנת עצמכם והיקום.",
    },
  ] : [
    {
      title: "Online Tarot Reading",
      text: "Our tarot reading uses all 78 tarot cards — 22 Major Arcana and 56 Minor Arcana. Ask a question, select your cards, and receive a deep interpretation that combines ancient tradition with advanced artificial intelligence. Every reading is personalized to your name, birth date, and question.",
    },
    {
      title: "AI Palm Reading Analysis",
      text: "Upload photos of your palms and receive a detailed analysis of your life line, heart line, fate line, and intuition line. Our AI system examines hand shape, fingers, and mounts for precise personal insights about your past, present, and future.",
    },
    {
      title: "Zodiac Compatibility Test",
      text: "Discover the cosmic chemistry between you and your partner. A comprehensive analysis of emotional, romantic, communicative, and spiritual compatibility across all 12 zodiac signs — from Aries to Pisces.",
    },
    {
      title: "Personalized Spiritual Guidance",
      text: "ASTROLOGAI combines ancient spiritual traditions with advanced AI technology to deliver a premium mystical experience. Free daily card, monthly horoscope, detailed birth chart — all the tools for understanding yourself and the universe.",
    },
  ];

  const buttonLabel = expanded
    ? (isHe ? "הסתר" : "Show less")
    : (isHe ? "גלו עוד ✦" : "Explore deeper ✦");

  return (
    <section
      className="relative z-10 w-full px-4 py-6"
      aria-label={isHe ? "תוכן נוסף" : "Additional content"}
    >
      <div className="mx-auto max-w-2xl">
        {/* Teaser - always visible & indexable */}
        <p className="text-center font-body text-xs leading-relaxed text-muted-foreground/60">
          {teaser}
        </p>

        {/* Toggle button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mx-auto mt-3 flex items-center gap-1.5 rounded-full border px-4 py-1.5 font-body text-[11px] tracking-wide transition-colors duration-300"
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
            <ChevronDown className="h-3 w-3" />
          </motion.span>
        </button>

        {/* Expanded content - in DOM for SEO, animated for UX */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="seo-expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-6 space-y-5">
                {fullContent.map((block, i) => (
                  <article key={i} className="text-center">
                    <h3 className="mb-1.5 font-heading text-xs tracking-wide text-gold/70">
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

        {/* Fallback: hidden noscript block ensures full content is always in DOM for crawlers */}
        <noscript>
          <div className="mt-6 space-y-4">
            {fullContent.map((block, i) => (
              <div key={i} className="text-center">
                <h3 className="mb-1 text-xs text-gold/70">{block.title}</h3>
                <p className="text-[11px] text-foreground/40">{block.text}</p>
              </div>
            ))}
          </div>
        </noscript>
      </div>
    </section>
  );
};

export default CollapsibleSeoPanel;

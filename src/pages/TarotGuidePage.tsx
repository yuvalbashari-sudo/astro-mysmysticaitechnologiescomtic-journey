import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, BookOpen, Heart, AlertTriangle, Layers } from "lucide-react";
import StarField from "@/components/StarField";

const sections = [
  {
    icon: BookOpen,
    title: "מה זה טארוט?",
    blocks: [
      "טארוט הוא מערכת של 78 קלפים שמשמשת ככלי להתבוננות פנימית, הכוונה רוחנית וחיבור לאינטואיציה.",
      "כל קלף נושא סמל, סיפור ומשמעות – יחד הם יוצרים מפה של החוויה האנושית: מהתחלות חדשות ועד שלמות.",
      "טארוט לא \"מנחש את העתיד\" – הוא מאיר דפוסים, מעלה שאלות חשובות ופותח דלת להבנה עמוקה יותר של עצמכם.",
    ],
  },
  {
    icon: Heart,
    title: "איך לבחור חפיסה",
    blocks: [
      "החפיסה הראשונה שלכם צריכה לדבר אליכם ויזואלית. עיצוב שמושך אתכם יעזור לכם להתחבר לקלפים באופן טבעי.",
      "למתחילים, חפיסת Rider-Waite-Smith היא הבחירה הקלאסית – האיורים שלה עשירים בסמלים וקלים לפירוש.",
      "אל תקנו חפיסה רק כי היא \"פופולרית\". החזיקו אותה, דפדפו בה, הרגישו אם היא מדברת אליכם. החיבור האישי הוא הדבר החשוב ביותר.",
    ],
  },
  {
    icon: Layers,
    title: "איך להתחיל לקרוא",
    blocks: [
      "התחילו עם קלף אחד ביום. כל בוקר שלפו קלף, הסתכלו עליו, והקשיבו למה שהוא מעורר בכם – לפני שאתם קוראים פירושים.",
      "למדו את 22 קלפי הארקנה הגדולה קודם. אלו הקלפים שמייצגים ארכיטיפים ומסעות חיים גדולים.",
      "כשאתם מוכנים, נסו פריסה של 3 קלפים: עבר, הווה, עתיד. זו פריסה פשוטה אבל עוצמתית שנותנת תמונה ברורה.",
      "כתבו יומן טארוט. רשמו מה שלפתם, מה הרגשתם, ומה קרה באותו יום. עם הזמן תראו דפוסים מדהימים.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "טעויות של מתחילים",
    bullets: [
      "שינון פירושים מבלי להקשיב לאינטואיציה – הקלפים מדברים אליכם באופן אישי.",
      "פחד מקלפים \"שליליים\" – קלפים כמו המוות או המגדל מסמלים שינוי, לא אסון.",
      "שאילת אותה שאלה שוב ושוב – אם לא אהבתם את התשובה, עבדו איתה במקום לברוח ממנה.",
      "לקרוא לאחרים לפני שמכירים את עצמכם – קודם תרגלו על עצמכם.",
      "ציפייה לתשובות \"כן/לא\" – הטארוט עובד עם ניואנסים, שכבות ותובנות.",
    ],
  },
];

const TarotGuidePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <StarField />

      {/* Hero */}
      <section className="relative pt-16 pb-12 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        <motion.div
          className="relative z-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
          <h1 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-4 leading-tight">
            איך להתחיל עם טארוט
          </h1>
          <p className="text-foreground/70 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
            המדריך המלא למתחילים – מהקלף הראשון ועד להבנה עמוקה
          </p>
        </motion.div>
      </section>

      {/* Intro */}
      <section className="px-4 pb-8 max-w-2xl mx-auto relative z-10">
        <motion.p
          className="text-foreground/60 text-sm md:text-base leading-relaxed text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          טארוט הוא הרבה יותר מ״ניחוש עתידות״. זהו כלי עתיק לחקירה עצמית,
          שמשלב סמלים, ארכיטיפים ואינטואיציה כדי לעזור לכם לראות את החיים בבהירות חדשה.
          במדריך הזה תלמדו את הצעדים הראשונים – בקצב שלכם.
        </motion.p>
      </section>

      {/* Content Sections */}
      <div className="px-4 pb-12 max-w-2xl mx-auto relative z-10 space-y-5">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="rounded-2xl p-5 md:p-7"
            style={{
              background: "linear-gradient(145deg, rgba(10, 10, 20, 0.7), rgba(15, 15, 30, 0.85))",
              border: "1px solid hsl(var(--gold) / 0.18)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "inset 0 1px 0 hsl(var(--gold) / 0.06)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent 70%)",
                  border: "1px solid hsl(var(--gold) / 0.2)",
                }}
              >
                <section.icon className="w-5 h-5 text-gold" />
              </div>
              <h2 className="font-heading text-xl md:text-2xl text-gold">{section.title}</h2>
            </div>

            {section.blocks && (
              <div className="space-y-3">
                {section.blocks.map((block, j) => (
                  <p key={j} className="text-foreground/80 text-sm md:text-base leading-[2]">
                    {block}
                  </p>
                ))}
              </div>
            )}

            {section.bullets && (
              <ul className="space-y-2 pr-1">
                {section.bullets.map((bullet, j) => (
                  <li key={j} className="flex items-start gap-2 text-foreground/80 text-sm md:text-base leading-[1.9]">
                    <span className="text-gold mt-1 shrink-0">✦</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <section className="px-4 pb-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-md mx-auto"
        >
          <p className="text-foreground/60 text-sm mb-5">
            רוצים להעמיק עוד? התחילו קריאה אישית עכשיו ✨
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn-gold inline-flex items-center gap-2 font-heading text-base"
          >
            <span>התחילו קריאה</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default TarotGuidePage;

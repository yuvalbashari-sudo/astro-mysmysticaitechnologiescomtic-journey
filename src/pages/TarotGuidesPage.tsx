import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, ArrowRight } from "lucide-react";
import StarField from "@/components/StarField";
import { getTarotGuides, type GuideEntry } from "@/data/guideContent";
import { useLanguage } from "@/i18n";

const TarotGuidesPage = () => {
  const { language, dir, isRTL } = useLanguage();
  const guides = getTarotGuides(language);
  const BackArrow = isRTL ? ArrowLeft : ArrowRight;

  const labels = {
    he: { heading: "מדריכי טארוט", sub: "לימוד עמוק ומעשי של אמנות הטארוט — מהצעד הראשון ועד לשליטה", back: "חזרה לדף הבית" },
    en: { heading: "Tarot Guides", sub: "Deep and practical learning of the art of Tarot — from first steps to mastery", back: "Back to Home" },
    ru: { heading: "Руководства по Таро", sub: "Глубокое и практическое изучение искусства Таро — от первых шагов до мастерства", back: "На главную" },
    ar: { heading: "أدلة التاروت", sub: "تعلّم عميق وعملي لفن التاروت — من الخطوة الأولى إلى الإتقان", back: "العودة للرئيسية" },
  }[language];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <StarField />

      <section className="relative pt-20 pb-14 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        <motion.div className="relative z-10 max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <BookOpen className="w-10 h-10 text-gold mx-auto mb-5" />
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl gold-gradient-text mb-4 tracking-wide">{labels.heading}</h1>
          <p className="text-foreground/55 font-body text-base md:text-lg max-w-lg mx-auto leading-relaxed">{labels.sub}</p>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-4 pb-20 space-y-6">
        {guides.map((guide, i) => (
          <GuideCard key={guide.slug} guide={guide} index={i} BackArrow={BackArrow} />
        ))}
        <div className="text-center pt-6">
          <Link to="/" className="text-gold/50 hover:text-gold font-body text-xs transition-colors inline-flex items-center gap-1">{labels.back}</Link>
        </div>
      </section>
    </div>
  );
};

function GuideCard({ guide, index, BackArrow }: { guide: GuideEntry; index: number; BackArrow: typeof ArrowLeft }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
      <Link
        to={`/guides/${guide.slug}`}
        className="block group rounded-2xl p-7 md:p-9 transition-all duration-300 hover:scale-[1.01]"
        style={{
          background: "linear-gradient(145deg, rgba(255, 215, 0, 0.06) 0%, rgba(10, 10, 20, 0.85) 55%, rgba(255, 215, 0, 0.03) 100%)",
          border: "1px solid hsl(var(--gold) / 0.2)",
          boxShadow: "0 0 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 215, 0, 0.06)",
        }}
      >
        <div className="flex items-start gap-5">
          <span className="text-4xl shrink-0">{guide.heroEmoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-xl md:text-2xl font-bold text-gold mb-2 group-hover:text-gold-light transition-colors tracking-wide">{guide.title}</h3>
            <p className="font-body text-sm md:text-base text-foreground/50 leading-[1.8]">{guide.subtitle}</p>
          </div>
          <BackArrow className="w-5 h-5 text-gold/30 group-hover:text-gold/60 transition-colors shrink-0 mt-1" />
        </div>
      </Link>
    </motion.div>
  );
}

export default TarotGuidesPage;

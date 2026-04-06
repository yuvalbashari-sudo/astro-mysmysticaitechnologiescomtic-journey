import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, BookOpen, Sun } from "lucide-react";
import StarField from "@/components/StarField";
import { getGuideBySlug } from "@/data/guideContent";
import { useLanguage } from "@/i18n";

const GuideDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language, dir, isRTL } = useLanguage();
  const guide = getGuideBySlug(slug || "", language);

  const notFoundLabel = { he: "המדריך לא נמצא", en: "Guide not found", ru: "Руководство не найдено", ar: "الدليل غير موجود" }[language];
  const backLabel = { he: "חזרה לדף הבית", en: "Back to Home", ru: "На главную", ar: "العودة للرئيسية" }[language];
  const goBackLabel = { he: "חזרה", en: "Back", ru: "Назад", ar: "رجوع" }[language];

  const ForwardArrow = isRTL ? ArrowLeft : ArrowRight;
  const BackwardArrow = isRTL ? ArrowRight : ArrowLeft;

  if (!guide) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <p className="text-foreground/60 font-body mb-4">{notFoundLabel}</p>
          <button onClick={() => navigate("/")} className="btn-gold font-body text-sm">{backLabel}</button>
        </div>
      </div>
    );
  }

  const IconComponent = guide.icon === "tarot" ? BookOpen : Sun;

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <StarField />

      <section className="relative pt-16 pb-12 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        <motion.div className="relative z-10 max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-4xl block mb-4">{guide.heroEmoji}</span>
          <h1 className="font-heading text-4xl md:text-5xl gold-gradient-text mb-4 leading-tight">{guide.title}</h1>
          <p className="text-foreground/70 text-xl md:text-2xl leading-relaxed max-w-lg mx-auto">{guide.subtitle}</p>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-4 pb-20 space-y-8">
        {guide.sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-6 md:p-8"
            style={{
              background: "rgba(10, 10, 20, 0.7)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 215, 0, 0.12)",
              boxShadow: "0 0 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 215, 0, 0.05)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <IconComponent className="w-6 h-6 text-gold/60" />
              <h2 className="font-heading text-2xl md:text-3xl text-gold">{section.title}</h2>
            </div>

            {section.blocks?.map((block, j) => (
              <p key={j} className="font-body text-lg md:text-xl text-foreground/75 leading-[2] mb-4 last:mb-0">{block}</p>
            ))}

            {section.bullets && (
              <ul className="space-y-2 mt-2">
                {section.bullets.map((bullet, j) => (
                  <li key={j} className="flex items-start gap-2 font-body text-lg md:text-xl text-foreground/75 leading-relaxed">
                    <Sparkles className="w-3 h-3 text-gold/40 mt-1.5 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center pt-8">
          <p className="text-foreground/60 text-sm mb-5">{guide.ctaText}</p>
          <button onClick={() => navigate(guide.ctaLink)} className="btn-gold inline-flex items-center gap-2 font-heading text-base">
            <span>{guide.ctaButton}</span>
            <ForwardArrow className="w-4 h-4" />
          </button>
        </motion.div>

        <div className="text-center pt-4">
          <button onClick={() => navigate(-1)} className="text-gold/50 hover:text-gold font-body text-xs transition-colors inline-flex items-center gap-1">
            <BackwardArrow className="w-3 h-3" />
            {goBackLabel}
          </button>
        </div>
      </section>
    </div>
  );
};

export default GuideDetailPage;

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles, BookOpen, Heart, AlertTriangle, Layers } from "lucide-react";
import StarField from "@/components/StarField";
import { useLanguage } from "@/i18n";

const TarotGuidePage = () => {
  const navigate = useNavigate();
  const { t, dir, isRTL } = useLanguage();

  const sections = [
    {
      icon: BookOpen,
      title: t.guide_tarot_s1_title,
      blocks: [t.guide_tarot_s1_b1, t.guide_tarot_s1_b2, t.guide_tarot_s1_b3],
    },
    {
      icon: Heart,
      title: t.guide_tarot_s2_title,
      blocks: [t.guide_tarot_s2_b1, t.guide_tarot_s2_b2, t.guide_tarot_s2_b3],
    },
    {
      icon: Layers,
      title: t.guide_tarot_s3_title,
      blocks: [t.guide_tarot_s3_b1, t.guide_tarot_s3_b2, t.guide_tarot_s3_b3, t.guide_tarot_s3_b4],
    },
    {
      icon: AlertTriangle,
      title: t.guide_tarot_s4_title,
      bullets: [
        t.guide_tarot_s4_bullet1,
        t.guide_tarot_s4_bullet2,
        t.guide_tarot_s4_bullet3,
        t.guide_tarot_s4_bullet4,
        t.guide_tarot_s4_bullet5,
      ],
    },
  ];

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
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
            {t.guide_tarot_hero_title}
          </h1>
          <p className="text-foreground/70 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
            {t.guide_tarot_hero_subtitle}
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
          {t.guide_tarot_intro}
        </motion.p>
      </section>

      {/* Content Sections */}
      <div className="px-4 pb-12 max-w-2xl mx-auto relative z-10 space-y-5">
        {sections.map((section, i) => (
          <motion.div
            key={i}
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
              <ul className={`space-y-2 ${isRTL ? "pr-1" : "pl-1"}`}>
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
            {t.guide_tarot_cta_text}
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn-gold inline-flex items-center gap-2 font-heading text-base"
          >
            <span>{t.guide_tarot_cta_button}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default TarotGuidePage;

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sun, Heart, Layers, Hand } from "lucide-react";
import TarotWorldModal from "@/components/TarotWorldModal";
import MonthlyForecastModal from "@/components/MonthlyForecastModal";
import CompatibilityModal from "@/components/CompatibilityModal";
import PalmReadingModal from "@/components/PalmReadingModal";
import { useT } from "@/i18n";

const MysticalNav = () => {
  const t = useT();
  const [tarotWorldOpen, setTarotWorldOpen] = useState(false);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [compatibilityOpen, setCompatibilityOpen] = useState(false);
  const [palmOpen, setPalmOpen] = useState(false);

  const categories = useMemo(() => [
    { icon: Sun, title: t.nav_astrology_title, description: t.nav_astrology_desc, cta: t.nav_astrology_cta, action: "forecast" },
    { icon: Heart, title: t.nav_compatibility_title, description: t.nav_compatibility_desc, cta: t.nav_compatibility_cta, action: "compatibility" },
    { icon: Layers, title: t.nav_tarot_title, description: t.nav_tarot_desc, cta: t.nav_tarot_cta, action: "tarot-world" },
    { icon: Hand, title: t.nav_palm_title, description: t.nav_palm_desc, cta: t.nav_palm_cta, action: "palm" },
  ], [t]);

  const handleClick = (action: string) => {
    if (action === "tarot-world") setTarotWorldOpen(true);
    else if (action === "forecast") setForecastOpen(true);
    else if (action === "compatibility") setCompatibilityOpen(true);
    else if (action === "palm") setPalmOpen(true);
  };

  return (
    <>
      <section className="py-24 px-4 relative cosmic-section-bg">
        <div className="section-divider max-w-xl mx-auto mb-20" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-4">
            {t.nav_title}
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-lg mx-auto">
            {t.nav_subtitle}
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.action}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="mystical-card p-6 text-center cursor-pointer group transition-all duration-300 hover:mystical-glow-intense"
              onClick={() => handleClick(cat.action)}
            >
              <div className="icon-glow w-16 h-16 mx-auto mb-5">
                <cat.icon className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-heading text-lg text-gold mb-3">{cat.title}</h3>
              <p className="text-sm text-muted-foreground font-body mb-5 leading-relaxed">
                {cat.description}
              </p>
              <span className="text-sm text-gold/80 font-body font-semibold group-hover:text-gold transition-colors">
                {cat.cta} ✦
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      <TarotWorldModal isOpen={tarotWorldOpen} onClose={() => setTarotWorldOpen(false)} />
      <MonthlyForecastModal isOpen={forecastOpen} onClose={() => setForecastOpen(false)} />
      <CompatibilityModal isOpen={compatibilityOpen} onClose={() => setCompatibilityOpen(false)} />
      <PalmReadingModal isOpen={palmOpen} onClose={() => setPalmOpen(false)} />
    </>
  );
};

export default MysticalNav;

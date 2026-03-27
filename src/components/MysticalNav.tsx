import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sun, Heart, Layers, Hand, Globe } from "lucide-react";
import TarotWorldModal from "@/components/TarotWorldModal";
import MonthlyForecastModal from "@/components/MonthlyForecastModal";
import CompatibilityModal from "@/components/CompatibilityModal";
import PalmComingSoonModal from "@/components/PalmComingSoonModal";
import BirthChartModal from "@/components/BirthChartModal";
import { useT } from "@/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { cardBack } from "@/data/tarotCardImages";

const MysticalNav = () => {
  const t = useT();
  const isMobile = useIsMobile();
  const [tarotWorldOpen, setTarotWorldOpen] = useState(false);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [compatibilityOpen, setCompatibilityOpen] = useState(false);
  const [palmOpen, setPalmOpen] = useState(false);
  const [birthChartOpen, setBirthChartOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const categories = useMemo(() => [
    { icon: Sun, title: t.nav_astrology_title, description: t.nav_astrology_desc, cta: t.nav_astrology_cta, action: "forecast", numeral: "I" },
    { icon: Globe, title: t.nav_birthchart_title, description: t.nav_birthchart_desc, cta: t.nav_birthchart_cta, action: "birthchart", numeral: "II" },
    { icon: Heart, title: t.nav_compatibility_title, description: t.nav_compatibility_desc, cta: t.nav_compatibility_cta, action: "compatibility", numeral: "III" },
    { icon: Layers, title: t.nav_tarot_title, description: t.nav_tarot_desc, cta: t.nav_tarot_cta, action: "tarot-world", numeral: "IV" },
    { icon: Hand, title: t.nav_palm_title, description: t.nav_palm_desc, cta: t.nav_palm_cta, action: "palm", numeral: "V" },
  ], [t]);

  const handleClick = (action: string) => {
    if (action === "tarot-world") setTarotWorldOpen(true);
    else if (action === "forecast") setForecastOpen(true);
    else if (action === "compatibility") setCompatibilityOpen(true);
    else if (action === "palm") setPalmOpen(true);
    else if (action === "birthchart") setBirthChartOpen(true);
  };

  const totalCards = categories.length;
  const fanAngle = isMobile ? 40 : 60; // total spread angle
  const angleStep = fanAngle / (totalCards - 1);
  const startAngle = -fanAngle / 2;

  return (
    <>
      <section className="py-24 px-4 relative cosmic-section-bg overflow-hidden">
        <div className="section-divider max-w-xl mx-auto mb-20" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-16 relative z-10"
        >
          <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-4">
            {t.nav_title}
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-lg mx-auto">
            {t.nav_subtitle}
          </p>
        </motion.div>

        {/* Fan spread container */}
        <div
          className="relative mx-auto flex items-end justify-center"
          style={{
            height: isMobile ? 380 : 480,
            maxWidth: isMobile ? "100%" : 900,
          }}
        >
          {categories.map((cat, i) => {
            const angle = startAngle + i * angleStep;
            const isHovered = hoveredIndex === i;
            const cardWidth = isMobile ? 130 : 180;
            const cardHeight = isMobile ? 210 : 290;
            // Vertical offset: cards at edges sit slightly higher
            const yOffset = Math.abs(angle) * (isMobile ? 0.8 : 1.2);
            // Horizontal spread
            const xOffset = (i - (totalCards - 1) / 2) * (isMobile ? 55 : 110);

            return (
              <motion.div
                key={cat.action}
                className="absolute cursor-pointer"
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  bottom: 20,
                  left: "50%",
                  marginLeft: -cardWidth / 2,
                  transformOrigin: "bottom center",
                  zIndex: isHovered ? 20 : 10 - Math.abs(i - 2),
                }}
                initial={{ opacity: 0, y: 80, rotate: angle * 1.5 }}
                whileInView={{ opacity: 1, y: 0, rotate: angle }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.15 + i * 0.12,
                  duration: 0.7,
                  type: "spring",
                  stiffness: 80,
                  damping: 14,
                }}
                animate={{
                  x: xOffset,
                  y: -yOffset,
                  rotate: isHovered ? 0 : angle,
                  scale: isHovered ? 1.12 : 1,
                  zIndex: isHovered ? 20 : 10 - Math.abs(i - 2),
                }}
                whileTap={{ scale: 0.97 }}
                onHoverStart={() => setHoveredIndex(i)}
                onHoverEnd={() => setHoveredIndex(null)}
                onClick={() => handleClick(cat.action)}
              >
                {/* Card body */}
                <div
                  className="w-full h-full rounded-xl relative overflow-hidden transition-shadow duration-500"
                  style={{
                    background: "linear-gradient(170deg, hsl(var(--deep-blue-light)) 0%, hsl(var(--deep-blue)) 60%, hsl(222 47% 4%) 100%)",
                    border: `1.5px solid hsl(var(--gold) / ${isHovered ? 0.6 : 0.2})`,
                    boxShadow: isHovered
                      ? "0 0 40px hsl(var(--gold) / 0.25), 0 20px 60px hsl(var(--deep-blue) / 0.8), inset 0 1px 0 hsl(var(--gold) / 0.15)"
                      : "0 8px 30px hsl(var(--deep-blue) / 0.6), 0 0 1px hsl(var(--gold) / 0.1)",
                  }}
                >
                  {/* Gold shimmer overlay on hover */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, transparent 30%, hsl(var(--gold) / 0.08) 50%, transparent 70%)",
                    }}
                    animate={{
                      opacity: isHovered ? 1 : 0,
                      backgroundPosition: isHovered ? "200% 200%" : "0% 0%",
                    }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Top numeral */}
                  <div className="absolute top-3 left-0 right-0 text-center">
                    <span
                      className="font-heading text-xs tracking-[0.3em] uppercase"
                      style={{ color: "hsl(var(--gold) / 0.5)" }}
                    >
                      {cat.numeral}
                    </span>
                  </div>

                  {/* Decorative border frame */}
                  <div
                    className="absolute rounded-lg pointer-events-none"
                    style={{
                      inset: isMobile ? 6 : 10,
                      border: `1px solid hsl(var(--gold) / ${isHovered ? 0.3 : 0.1})`,
                      transition: "border-color 0.5s",
                    }}
                  />

                  {/* Icon center */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 md:gap-3 px-3">
                    <motion.div
                      className="rounded-full flex items-center justify-center"
                      style={{
                        width: isMobile ? 44 : 56,
                        height: isMobile ? 44 : 56,
                        background: `radial-gradient(circle, hsl(var(--gold) / ${isHovered ? 0.15 : 0.08}), transparent)`,
                        border: `1px solid hsl(var(--gold) / ${isHovered ? 0.35 : 0.15})`,
                        boxShadow: isHovered ? "0 0 25px hsl(var(--gold) / 0.15)" : "none",
                        transition: "all 0.5s",
                      }}
                    >
                      <cat.icon
                        className="transition-colors duration-500"
                        style={{
                          width: isMobile ? 20 : 26,
                          height: isMobile ? 20 : 26,
                          color: isHovered ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.7)",
                        }}
                      />
                    </motion.div>

                    <h3
                      className="font-heading text-center transition-colors duration-500"
                      style={{
                        fontSize: isMobile ? 12.5 : 14,
                        lineHeight: isMobile ? 1.35 : undefined,
                        fontWeight: isMobile ? 500 : undefined,
                        letterSpacing: isMobile ? "0.02em" : undefined,
                        color: isHovered ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.85)",
                      }}
                    >
                      {cat.title}
                    </h3>

                    {!isMobile && (
                      <p
                        className="text-center font-body leading-snug transition-opacity duration-500"
                        style={{
                          fontSize: 10,
                          color: "hsl(var(--muted-foreground))",
                          opacity: isHovered ? 0.9 : 0.6,
                          maxWidth: 140,
                        }}
                      >
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom ornament */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <motion.span
                      className="font-heading tracking-widest"
                      style={{
                        fontSize: isMobile ? 10 : 11,
                        letterSpacing: isMobile ? "0.08em" : undefined,
                        color: `hsl(var(--gold) / ${isHovered ? 0.8 : 0.4})`,
                        transition: "color 0.5s",
                      }}
                    >
                      ✦ {cat.cta} ✦
                    </motion.span>
                  </div>

                  {/* Corner ornaments */}
                  {[
                    { top: isMobile ? 8 : 12, left: isMobile ? 8 : 12 },
                    { top: isMobile ? 8 : 12, right: isMobile ? 8 : 12 },
                    { bottom: isMobile ? 8 : 12, left: isMobile ? 8 : 12 },
                    { bottom: isMobile ? 8 : 12, right: isMobile ? 8 : 12 },
                  ].map((pos, ci) => (
                    <div
                      key={ci}
                      className="absolute pointer-events-none"
                      style={{
                        ...pos,
                        width: 6,
                        height: 6,
                        borderTop: ci < 2 ? `1px solid hsl(var(--gold) / ${isHovered ? 0.5 : 0.2})` : undefined,
                        borderBottom: ci >= 2 ? `1px solid hsl(var(--gold) / ${isHovered ? 0.5 : 0.2})` : undefined,
                        borderLeft: ci % 2 === 0 ? `1px solid hsl(var(--gold) / ${isHovered ? 0.5 : 0.2})` : undefined,
                        borderRight: ci % 2 === 1 ? `1px solid hsl(var(--gold) / ${isHovered ? 0.5 : 0.2})` : undefined,
                        transition: "border-color 0.5s",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Ambient glow under the spread */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: isMobile ? 300 : 600,
            height: 200,
            background: "radial-gradient(ellipse, hsl(var(--gold) / 0.06) 0%, transparent 70%)",
          }}
        />
      </section>

      <TarotWorldModal isOpen={tarotWorldOpen} onClose={() => setTarotWorldOpen(false)} />
      <MonthlyForecastModal isOpen={forecastOpen} onClose={() => setForecastOpen(false)} />
      <CompatibilityModal isOpen={compatibilityOpen} onClose={() => setCompatibilityOpen(false)} />
      <PalmComingSoonModal isOpen={palmOpen} onClose={() => setPalmOpen(false)} />
      <BirthChartModal isOpen={birthChartOpen} onClose={() => setBirthChartOpen(false)} />
    </>
  );
};

export default MysticalNav;

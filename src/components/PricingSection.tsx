import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Star, Heart, Sparkles, Crown, Moon, Sun, Hand, Layers, Gift } from "lucide-react";
import { isInLaunchPeriod } from "@/lib/launchConfig";

const isLaunch = isInLaunchPeriod();

const packages = [
  {
    title: "מפת הכוכבים האישית",
    icon: Sun,
    desc: "חשיפת המפה הקוסמית שלכם — ניתוח אסטרולוגי מעמיק שמאיר את הדרך שלפניכם.",
    features: [
      "ניתוח אישיות מלא לפי המזל",
      "תובנות אנרגטיות חודשיות",
      "נטיות אהבה ומשיכה",
      "הכוונה רוחנית אישית",
    ],
    cta: isLaunch ? "גלו עכשיו — בחינם" : "גלו את המפה שלכם",
    highlighted: false,
  },
  {
    title: "קריאה זוגית עמוקה",
    icon: Heart,
    desc: "גלו את הכימיה הנסתרת בין שתי נשמות — ניתוח זוגי שחושף את מה שמעבר למילים.",
    features: [
      "ניתוח התאמה זוגית מלא",
      "דינמיקה רומנטית ורגשית",
      "דפוסי תקשורת בין בני הזוג",
      "פוטנציאל הקשר לטווח ארוך",
      "כימיה חושנית ואנרגטית",
    ],
    cta: isLaunch ? "חשפו עכשיו — בחינם" : "חשפו את הקשר שלכם",
    highlighted: true,
  },
  {
    title: "הקריאה המיסטית המלאה",
    icon: Crown,
    desc: "החוויה השלמה — כל השערים המיסטיים נפתחים בקריאה אחת מקיפה ועוצמתית.",
    features: [
      "אסטרולוגיה ומפת לידה",
      "ניתוח מזל עולה",
      "פריסת טארוט מלאה",
      "קריאת כף יד מפורטת",
      "מסר רוחני אישי",
    ],
    cta: isLaunch ? "חקרו עכשיו — בחינם" : "פתחו את הקריאה",
    highlighted: false,
  },
];

const featureIcons: Record<string, typeof Star> = {
  "ניתוח אישיות": Star,
  "תובנות אנרגטיות": Moon,
  "נטיות אהבה": Heart,
  "הכוונה רוחנית": Sparkles,
  "ניתוח התאמה": Heart,
  "דינמיקה רומנטית": Heart,
  "דפוסי תקשורת": Layers,
  "פוטנציאל הקשר": Star,
  "כימיה חושנית": Sparkles,
  "אסטרולוגיה ומפת": Sun,
  "ניתוח מזל": Moon,
  "פריסת טארוט": Layers,
  "קריאת כף": Hand,
  "מסר רוחני": Sparkles,
};

function getFeatureIcon(feature: string) {
  for (const [key, Icon] of Object.entries(featureIcons)) {
    if (feature.includes(key)) return Icon;
  }
  return Star;
}

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 30 }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      const isGold = Math.random() > 0.3;
      return (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            background: isGold
              ? `hsl(var(--gold) / ${Math.random() * 0.4 + 0.1})`
              : `hsl(var(--crimson) / ${Math.random() * 0.2 + 0.05})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -(20 + Math.random() * 50), 0],
            x: [0, (Math.random() - 0.5) * 30, 0],
            opacity: [0.1, 0.7, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      );
    })}
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={`star-${i}`}
        className="absolute text-gold/20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 6 + 6}px`,
        }}
        animate={{
          opacity: [0, 0.6, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 3 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 6,
          ease: "easeInOut",
        }}
      >
        ✦
      </motion.div>
    ))}
  </div>
);

interface PricingSectionProps {
  onOrderClick?: (interest: string) => void;
}

const PricingSection = ({ onOrderClick }: PricingSectionProps) => {
  return (
    <section className="py-28 px-4 relative overflow-hidden">
      <FloatingParticles />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gold/[0.04] blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-56 h-56 rounded-full bg-crimson/5 blur-[90px]" />
      </div>

      <div className="section-divider max-w-xl mx-auto mb-20" />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-16 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          {isLaunch ? <Gift className="w-5 h-5 text-gold/60" /> : <Crown className="w-5 h-5 text-gold/60" />}
          <span className="text-gold/40 font-body text-xs tracking-[0.15em]">
            {isLaunch ? "✦ גישה חופשית לרגל ההשקה ✦" : "✦ קריאות פרימיום ✦"}
          </span>
          {isLaunch ? <Gift className="w-5 h-5 text-gold/60" /> : <Crown className="w-5 h-5 text-gold/60" />}
        </div>
        <h2 className="font-heading text-3xl md:text-5xl gold-gradient-text mb-5">
          {isLaunch ? "חקרו הכל — ללא עלות" : "פתחו את הקריאה המלאה שלכם"}
        </h2>
        <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto leading-relaxed">
          {isLaunch
            ? "לרגל ההשקה, כל הקריאות המיסטיות שלנו פתוחות לכם כמתנת פתיחה — חקרו את החוויה המלאה"
            : "חקרו את השכבות העמוקות ביותר של המפה הקוסמית שלכם עם קריאות פרימיום מותאמות אישית"}
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
        {packages.map((pkg, i) => {
          const cardRef = useRef<HTMLDivElement>(null);
          const { scrollYProgress } = useScroll({
            target: cardRef,
            offset: ["start end", "end start"],
          });
          const y = useTransform(scrollYProgress, [0, 1], [40 - i * 15, -20 + i * 10]);
          const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.98]);

          return (
            <motion.div
              ref={cardRef}
              key={pkg.title}
              style={{ y, scale }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`group relative mystical-card p-8 md:p-9 flex flex-col text-center transition-all duration-500 hover:mystical-glow ${
                pkg.highlighted
                  ? "ring-1 ring-gold/30 shadow-[0_0_40px_hsl(var(--gold)/0.12)]"
                  : ""
              }`}
            >
              {/* Badge */}
              {pkg.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="btn-gold !py-1.5 !px-5 !text-[11px] !tracking-[0.15em] !rounded-full !shadow-[0_0_25px_hsl(var(--gold)/0.3)]">
                    {isLaunch ? "✦ מתנת השקה ✦" : "✦ מומלץ ✦"}
                  </span>
                </div>
              )}

              {/* Launch free badge on all cards */}
              {isLaunch && !pkg.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className="inline-flex items-center gap-1.5 py-1 px-4 rounded-full text-[11px] font-bold font-body text-gold tracking-wide"
                    style={{
                      background: "hsl(var(--deep-blue-light))",
                      border: "1px solid hsl(var(--gold) / 0.3)",
                    }}
                  >
                    <Gift className="w-3 h-3" />
                    חינם בהשקה
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-16 h-16 mx-auto mb-6 mt-2 rounded-full flex items-center justify-center border transition-all duration-500 ${
                  pkg.highlighted
                    ? "bg-gold/15 border-gold/35"
                    : "bg-gold/10 border-gold/20 group-hover:bg-gold/15 group-hover:border-gold/30"
                }`}
              >
                <pkg.icon
                  className={`w-7 h-7 transition-colors duration-500 ${
                    pkg.highlighted ? "text-gold-light" : "text-gold group-hover:text-gold-light"
                  }`}
                />
              </div>

              <h3 className="font-heading text-xl md:text-2xl text-foreground mb-3">
                {pkg.title}
              </h3>
              <p className="font-body text-sm text-foreground/60 leading-relaxed mb-7">
                {pkg.desc}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1 text-right">
                {pkg.features.map((f) => {
                  const FeatureIcon = getFeatureIcon(f);
                  return (
                    <li key={f} className="flex items-center gap-3 font-body text-sm text-foreground/75">
                      <FeatureIcon className="w-3.5 h-3.5 text-gold/50 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  );
                })}
              </ul>

              {/* CTA */}
              <button
                onClick={() => onOrderClick?.(pkg.highlighted ? "compatibility" : i === 0 ? "astrology" : "full")}
                className={`w-full py-3.5 rounded-lg font-body font-bold text-sm tracking-wider transition-all duration-300 ${
                  pkg.highlighted ? "btn-gold" : "btn-outline-gold"
                }`}
              >
                {pkg.cta}
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingSection;

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Sparkles, Star, Moon, Eye, Hand } from "lucide-react";
import heroBg from "@/assets/hero-mystical-bg.jpg";
import crystalBall from "@/assets/crystal-ball.png";
import oracle from "@/assets/oracle.png";
import { useEffect, useState } from "react";

const menuItems = [
  { icon: Star, label: "תחזית חודשית לפי תאריך לידה", angle: -72 },
  { icon: Moon, label: "המזל העולה לפי שעת לידה", angle: -36 },
  { icon: Sparkles, label: "התאמה זוגית לפי המזלות", angle: 0 },
  { icon: Eye, label: "פתיחת טארוט", angle: 36 },
  { icon: Hand, label: "קריאת כף יד", angle: 72 },
];

const FloatingParticle = ({ delay, x, y }: { delay: number; x: string; y: string }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-gold/50"
    style={{ left: x, top: y }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
      y: [0, -30, -60],
    }}
    transition={{
      duration: 4 + Math.random() * 2,
      repeat: Infinity,
      delay,
      ease: "easeOut",
    }}
  />
);

const HeroSection = () => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const orbRadius = isMobile ? 140 : 240;

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
      {/* Background layers */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
      </div>

      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
        <FloatingParticle
          key={i}
          delay={Math.random() * 5}
          x={`${Math.random() * 100}%`}
          y={`${30 + Math.random() * 60}%`}
        />
      ))}

      {/* Smoke / mist overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 60%, hsl(var(--gold) / 0.05) 0%, transparent 60%)",
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-12 md:pt-16">
        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-4 md:mb-6"
        >
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl gold-gradient-text tracking-wider">
            ASTROLOGAI
          </h1>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mb-2 md:mb-4"
        >
          <h2 className="font-body text-xl md:text-2xl lg:text-3xl text-foreground/90 font-light leading-relaxed">
            הכוכבים יודעים את מה שעדיין לא גיליתם
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center text-muted-foreground font-body text-sm md:text-base mb-8 md:mb-6 max-w-xl mx-auto"
        >
          גורל, אהבה, תובנות רוחניות — הכל מחכה לכם בתוך כדור הקריסטל
        </motion.p>

        {/* Central mystical scene */}
        <div className="relative flex items-center justify-center" style={{ minHeight: isMobile ? "420px" : "520px" }}>
          {/* Oracle character - left side on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="absolute z-10 hidden md:block"
            style={{ left: "2%", bottom: "0" }}
          >
            <motion.img
              src={oracle}
              alt="Oracle"
              className="h-[440px] lg:h-[500px] object-contain drop-shadow-2xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                filter: "drop-shadow(0 0 30px hsl(var(--gold) / 0.2))",
              }}
            />
          </motion.div>

          {/* Crystal ball - center */}
          <div className="relative flex items-center justify-center">
            {/* Glow aura behind crystal ball */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: isMobile ? "220px" : "320px",
                height: isMobile ? "220px" : "320px",
                background: "radial-gradient(circle, hsl(var(--gold) / 0.15) 0%, hsl(var(--celestial) / 0.08) 40%, transparent 70%)",
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Sacred geometry ring */}
            <motion.div
              className="absolute rounded-full mystical-border"
              style={{
                width: isMobile ? "260px" : "380px",
                height: isMobile ? "260px" : "380px",
                borderColor: "hsl(var(--gold) / 0.1)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              className="absolute rounded-full mystical-border"
              style={{
                width: isMobile ? "300px" : "420px",
                height: isMobile ? "300px" : "420px",
                borderColor: "hsl(var(--gold) / 0.06)",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            />

            {/* Crystal ball image */}
            <motion.img
              src={crystalBall}
              alt="Crystal Ball"
              className="relative z-20"
              style={{
                width: isMobile ? "180px" : "280px",
                height: isMobile ? "180px" : "280px",
                objectFit: "contain",
                filter: "drop-shadow(0 0 40px hsl(var(--gold) / 0.3))",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            />

            {/* Floating menu items orbiting */}
            {menuItems.map((item, i) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const x = Math.sin(angleRad) * orbRadius;
              const y = -Math.cos(angleRad) * orbRadius * 0.55;

              return (
                <motion.div
                  key={i}
                  className="absolute z-30 cursor-pointer"
                  style={{
                    left: `calc(50% + ${x}px - ${isMobile ? 60 : 80}px)`,
                    top: `calc(50% + ${y}px - 20px)`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 + i * 0.15 }}
                  onMouseEnter={() => setHoveredItem(i)}
                  onMouseLeave={() => setHoveredItem(null)}
                  whileHover={{ scale: 1.1, zIndex: 50 }}
                >
                  <motion.div
                    className={`
                      relative flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full
                      backdrop-blur-md transition-all duration-300 whitespace-nowrap
                      ${hoveredItem === i
                        ? "bg-gold/20 border-gold/60 shadow-[0_0_25px_hsl(var(--gold)/0.3)]"
                        : "bg-muted/20 border-gold/15 shadow-[0_0_10px_hsl(var(--gold)/0.1)]"
                      }
                    `}
                    style={{ borderWidth: "1px", borderStyle: "solid" }}
                    animate={{
                      y: [0, -4 - i * 0.5, 0],
                    }}
                    transition={{
                      duration: 3 + i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.4,
                    }}
                  >
                    <item.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 transition-colors duration-300 ${hoveredItem === i ? "text-gold" : "text-gold/60"}`} />
                    <span className={`font-body text-[10px] md:text-xs transition-colors duration-300 ${hoveredItem === i ? "text-gold" : "text-foreground/70"}`}>
                      {item.label}
                    </span>

                    {/* Glow pulse on hover */}
                    {hoveredItem === i && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "radial-gradient(circle, hsl(var(--gold) / 0.1), transparent)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Oracle on mobile - smaller, right side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="absolute z-10 md:hidden"
            style={{ right: "-10%", bottom: "5%" }}
          >
            <img
              src={oracle}
              alt="Oracle"
              className="h-[200px] object-contain opacity-60"
              style={{
                filter: "drop-shadow(0 0 20px hsl(var(--gold) / 0.15))",
              }}
            />
          </motion.div>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6 md:mt-10 pb-8"
        >
          <a href="#free" className="btn-gold font-body flex items-center gap-2 text-sm md:text-base">
            <Sparkles className="w-4 h-4" />
            גלו את ההתחלה המיסטית שלכם
          </a>
          <a
            href="https://wa.me/972500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold font-body flex items-center gap-2 text-sm md:text-base"
          >
            💬 דברו איתנו בוואטסאפ
          </a>
        </motion.div>

        {/* Premium badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center pb-6"
        >
          <span className="text-xs text-gold/50 font-body tracking-wider">
            ✦ חוויה מיסטית בלעדית ומותאמת אישית ✦
          </span>
        </motion.div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;

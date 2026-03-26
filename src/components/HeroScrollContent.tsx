import { motion } from "framer-motion";
import { Eye, Hand, Sparkles, Star } from "lucide-react";
import { useT } from "@/i18n";

interface HeroScrollContentProps {
  onOpenForecast: () => void;
  onOpenCompatibility: () => void;
  onOpenTarot: () => void;
  onOpenPalm: () => void;
}

const MOBILE_ACTIONS = [
  { key: "tarot", icon: Eye, color: "hsl(var(--crimson))" },
  { key: "compatibility", icon: Sparkles, color: "hsl(var(--gold))" },
  { key: "palm", icon: Hand, color: "hsl(var(--gold-dark))" },
  { key: "forecast", icon: Star, color: "hsl(var(--gold))" },
] as const;

const HeroScrollContent = ({
  onOpenForecast,
  onOpenCompatibility,
  onOpenTarot,
  onOpenPalm,
}: HeroScrollContentProps) => {
  const t = useT();

  const mobileActions = [
    { ...MOBILE_ACTIONS[0], label: t.hero_menu_tarot, action: onOpenTarot },
    { ...MOBILE_ACTIONS[1], label: t.hero_menu_compatibility, action: onOpenCompatibility },
    { ...MOBILE_ACTIONS[2], label: t.hero_menu_palm, action: onOpenPalm },
  ];

  return (
    <section className="relative z-10 min-h-screen overflow-x-hidden bg-transparent">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 pt-8 md:pt-16 pointer-events-auto">
        <div className="flex w-full flex-col items-center gap-3 md:hidden">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="px-4 text-center font-body font-light leading-snug text-foreground/90"
            style={{ fontSize: "22px" }}
          >
            {t.hero_headline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="px-6 text-center font-body text-muted-foreground"
            style={{ fontSize: "14px" }}
          >
            {t.hero_subheadline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="px-4 text-center font-body text-xs tracking-wider text-gold/60"
          >
            {t.hero_services_line}
          </motion.p>

          <div className="pointer-events-none h-[32vh] max-h-[280px]" />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            className="text-center font-body text-[11px] text-muted-foreground/50"
          >
            ✦ {t.hero_social_proof} ✦
          </motion.p>

          <div className="mt-1 grid w-full max-w-xs grid-cols-2 gap-3">
            {mobileActions.map((item, i) => (
              <motion.button
                key={item.key}
                initial={{ opacity: 0, y: 20, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 2 + i * 0.15, ease: "easeOut" }}
                onClick={item.action}
                whileTap={{ scale: 0.95 }}
                className="min-h-[52px] rounded-2xl border border-gold/15 bg-muted/15 px-2 py-3 backdrop-blur-md"
              >
                <div className="flex flex-col items-center gap-1.5">
                  <item.icon className="h-5 w-5" style={{ color: item.color }} />
                  <span className="text-center font-body text-[11px] leading-tight text-foreground/75">{item.label}</span>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            onClick={onOpenForecast}
            whileTap={{ scale: 0.97 }}
            className="flex min-h-[48px] w-full max-w-xs items-center justify-center gap-2 rounded-full border border-gold/10 bg-muted/12 py-2.5 backdrop-blur-md"
          >
            <Star className="h-4 w-4 text-gold" />
            <span className="font-body text-xs text-foreground/70">{t.hero_menu_forecast}</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
            className="mt-2 mb-2 w-full max-w-xs"
          >
            <p className="mb-3 text-center font-heading text-xs tracking-wider text-gold/50">{t.hero_how_title}</p>
            <div className="flex items-start justify-between gap-2">
              {[
                { emoji: "🔮", text: t.hero_how_step1 },
                { emoji: "✨", text: t.hero_how_step2 },
                { emoji: "🌙", text: t.hero_how_step3 },
              ].map((step, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1 text-center">
                  <span className="text-lg">{step.emoji}</span>
                  <span className="font-body text-[10px] leading-tight text-muted-foreground/70">{step.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8 }}
            className="pb-4 text-center"
          >
            <span className="font-body text-xs tracking-wider text-gold/50">{t.hero_badge}</span>
          </motion.div>
        </div>

        <div className="hidden w-full md:block">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="mb-2 text-center"
          >
            <h2 className="font-body text-2xl font-light leading-relaxed text-foreground/90 lg:text-3xl">
              {t.hero_headline}
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="mx-auto mb-2 max-w-xl text-center font-body text-base text-muted-foreground"
          >
            {t.hero_subheadline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mx-auto mb-6 max-w-lg text-center font-body text-sm tracking-wider text-gold/50"
          >
            {t.hero_services_line}
          </motion.p>

          <div className="pointer-events-none mt-5 min-h-[520px]" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="mt-2 text-center"
          >
            <p className="mt-3 font-body text-xs text-muted-foreground/40">✦ {t.hero_social_proof} ✦</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="mt-6 mb-4"
          >
            <p className="mb-4 text-center font-heading text-xs uppercase tracking-widest text-gold/40">{t.hero_how_title}</p>
            <div className="flex items-start justify-center gap-12">
              {[
                { emoji: "🔮", text: t.hero_how_step1 },
                { emoji: "✨", text: t.hero_how_step2 },
                { emoji: "🌙", text: t.hero_how_step3 },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="text-xl">{step.emoji}</span>
                  <span className="font-body text-xs text-muted-foreground/60">{step.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8 }}
            className="pb-6 text-center"
          >
            <span className="font-body text-xs tracking-wider text-gold/50">{t.hero_badge}</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroScrollContent;

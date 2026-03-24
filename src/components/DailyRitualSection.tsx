import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, ChevronDown } from "lucide-react";
import { getDailyRitual, revealDailyRitual, msUntilReset, type DailyRitualData } from "@/lib/dailyRitual";
import { tarotCardImages, cardBack } from "@/data/tarotCardImages";
import { useT } from "@/i18n";
import { useCardName } from "@/hooks/useCardName";

const DailyRitualSection = () => {
  const t = useT();
  const [ritual, setRitual] = useState<DailyRitualData & { isNew: boolean }>(getDailyRitual);
  const [revealed, setRevealed] = useState(ritual.revealed);
  const [cardFlipped, setCardFlipped] = useState(ritual.revealed);
  const [countdown, setCountdown] = useState("");

  // Countdown timer
  useEffect(() => {
    if (!revealed) return;
    const tick = () => {
      const ms = msUntilReset();
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setCountdown(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [revealed]);

  const handleReveal = useCallback(() => {
    if (revealed) return;
    revealDailyRitual();
    setRevealed(true);
    setTimeout(() => setCardFlipped(true), 400);
  }, [revealed]);

  const cardKey = ritual.card.name.toLowerCase().replace(/^the\s+/, "").replace(/\s+/g, "-");
  const cardImage = tarotCardImages[cardKey] || cardBack;

  return (
    <section
      className="py-16 md:py-24 px-6 md:px-8 relative"
      aria-label={t.a11y_daily_section}
      style={{
        background: "linear-gradient(180deg, hsl(var(--deep-blue) / 0.15) 0%, hsl(var(--deep-blue) / 0.25) 50%, hsl(var(--deep-blue) / 0.15) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="section-divider max-w-xl mx-auto mb-16" />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14 mx-auto px-6"
        style={{ maxWidth: 580 }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-gold" />
          <span className="text-base font-body text-gold/70 tracking-widest uppercase">{t.daily_ritual_label}</span>
          <Sparkles className="w-6 h-6 text-gold" />
        </div>
        <h2 className="font-heading gold-gradient-text mb-5" style={{ fontSize: 30, lineHeight: 1.4 }}>
          {t.daily_ritual_title}
        </h2>
        <p className="text-muted-foreground font-body" style={{ fontSize: 22, lineHeight: 1.8 }}>
          {t.daily_ritual_desc}
        </p>
      </motion.div>

      {/* Not yet revealed — CTA */}
      {!revealed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto text-center"
        >
          <motion.button
            onClick={handleReveal}
            className="btn-gold text-base px-10 py-4 rounded-xl font-heading tracking-wider"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="flex items-center gap-2 justify-center">
              <Sparkles className="w-5 h-5" />
              {t.daily_ritual_cta}
            </span>
          </motion.button>
          <motion.div
            className="mt-4 flex items-center justify-center gap-1 text-muted-foreground"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-4 h-4" />
            <span className="text-xs font-body">{t.daily_ritual_click_hint}</span>
          </motion.div>
        </motion.div>
      )}

      {/* Revealed content */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Daily Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mystical-card-elevated p-8 text-center"
              >
                <div className="text-base text-gold/60 font-body mb-4 tracking-wider">{t.daily_ritual_card_label}</div>

                {/* Card flip */}
                <div className="relative w-36 h-54 mx-auto mb-5" style={{ perspective: 800, width: 144, height: 216 }}>
                  <motion.div
                    className="absolute inset-0 rounded-lg overflow-hidden"
                    initial={false}
                    animate={{ rotateY: cardFlipped ? 180 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        backfaceVisibility: "hidden",
                        background: `url(${cardBack}) center/cover`,
                        border: "1px solid hsl(var(--gold) / 0.3)",
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        background: `url(${cardImage}) center/cover`,
                        border: "1px solid hsl(var(--gold) / 0.3)",
                      }}
                    />
                  </motion.div>
                  {cardFlipped && (
                    <motion.div
                      className="absolute -inset-2 rounded-xl pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.6, 0.2] }}
                      transition={{ duration: 1.5 }}
                      style={{
                        background: "radial-gradient(circle, hsl(var(--gold) / 0.2), transparent 70%)",
                      }}
                    />
                  )}
                </div>

                <h3 className="font-heading text-xl text-gold mb-2">{ritual.card.hebrewName}</h3>
                <p className="text-base text-muted-foreground font-body line-clamp-4" style={{ lineHeight: 1.7 }}>
                  {ritual.card.meaning.slice(0, 120)}...
                </p>
                <p className="text-sm text-gold/50 mt-3 font-body" style={{ lineHeight: 1.6 }}>{ritual.card.advice.slice(0, 80)}...</p>
              </motion.div>

              {/* Daily Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mystical-card-elevated p-8 text-center flex flex-col justify-between"
              >
                <div>
                  <div className="text-base text-gold/60 font-body mb-4 tracking-wider">{t.daily_ritual_message_label}</div>
                  <div className="icon-glow w-14 h-14 mx-auto mb-5">
                    <span className="text-2xl">🌌</span>
                  </div>
                  <p className="text-foreground font-body text-lg" style={{ lineHeight: 1.7 }}>
                    {ritual.message}
                  </p>
                </div>
                <p className="text-sm text-gold/40 mt-4 font-body italic" style={{ lineHeight: 1.6 }}>
                  "{t.daily_ritual_message_quote}"
                </p>
              </motion.div>

              {/* Daily Energy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mystical-card-elevated p-8 text-center flex flex-col justify-between"
              >
                <div>
                  <div className="text-base text-gold/60 font-body mb-4 tracking-wider">{t.daily_ritual_energy_label}</div>
                  <div className="icon-glow w-14 h-14 mx-auto mb-4">
                    <span className="text-2xl">{ritual.energy.icon}</span>
                  </div>
                  <h3 className="font-heading text-xl text-gold mb-2">{ritual.energy.theme}</h3>
                  <p className="text-base text-muted-foreground font-body" style={{ lineHeight: 1.7 }}>
                    {ritual.energy.insight}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Locked / Return prompt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 text-center"
            >
              <div className="mystical-card inline-flex items-center gap-3 px-6 py-3 mx-auto">
                <Clock className="w-4 h-4 text-gold/60" aria-hidden="true" />
                <span className="text-sm text-muted-foreground font-body">
                  {t.daily_ritual_done_text}
                </span>
                <span className="text-sm font-heading text-gold font-semibold tabular-nums" aria-label={t.a11y_countdown_label}>{countdown}</span>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-3 font-body">
                ✦ {t.daily_ritual_next_text} ✦
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default DailyRitualSection;
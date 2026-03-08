import { motion } from "framer-motion";
import { Crown, Sparkles, Gift } from "lucide-react";
import { getLaunchDaysRemaining } from "@/lib/launchConfig";
import { useT } from "@/i18n";

const LaunchBanner = () => {
  const t = useT();
  const daysLeft = getLaunchDaysRemaining();

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-gold/[0.04] blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-crimson/[0.03] blur-[80px]" />
      </div>

      <div className="section-divider max-w-xl mx-auto mb-16" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto relative z-10"
      >
        <div className="mystical-card-elevated relative p-10 md:p-14 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.4), transparent)" }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.4), transparent)" }} />
            <motion.div
              className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(var(--gold) / 0.04) 0%, transparent 60%)" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <motion.div
            className="flex items-center justify-center gap-2 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Sparkles className="w-4 h-4 text-gold/50" />
            <Gift className="w-6 h-6 text-gold" />
            <Sparkles className="w-4 h-4 text-gold/50" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full"
            style={{
              background: "linear-gradient(135deg, hsl(var(--gold) / 0.12), hsl(var(--gold) / 0.06))",
              border: "1px solid hsl(var(--gold) / 0.25)",
            }}
          >
            <Crown className="w-4 h-4 text-gold" />
            <span className="font-body text-gold text-sm font-semibold tracking-wide">
              {t.launch_gift}
            </span>
            <Crown className="w-4 h-4 text-gold" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-heading text-3xl md:text-4xl lg:text-5xl gold-gradient-text mb-5 leading-tight"
          >
            {t.launch_title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="font-body text-foreground/80 text-lg md:text-xl mb-4 leading-relaxed max-w-xl mx-auto"
          >
            {t.launch_subtitle}
            <br />
            <span className="text-gold font-semibold">{t.launch_free_highlight}</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="font-body text-muted-foreground text-sm mb-8 leading-relaxed max-w-lg mx-auto"
          >
            {t.launch_includes}
            <br />
            {t.launch_all_included}
          </motion.p>

          {daysLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl mb-8"
              style={{
                background: "hsl(var(--deep-blue-light) / 0.6)",
                border: "1px solid hsl(var(--gold) / 0.15)",
              }}
            >
              <span className="font-body text-muted-foreground text-sm">
                {t.launch_days_remaining_prefix}
              </span>
              <span className="font-heading text-2xl text-gold">
                {daysLeft}
              </span>
              <span className="font-body text-muted-foreground text-sm">
                {t.launch_days_remaining_suffix}
              </span>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            <a href="#free" className="btn-gold inline-flex items-center gap-2 text-base">
              <span>{t.launch_cta}</span>
              <Sparkles className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div
            className="mt-8 text-gold/25 text-sm tracking-[0.3em]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
          >
            ✦ ✦ ✦
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default LaunchBanner;

import { motion } from "framer-motion";
import { Star, Sparkles, Crown, Gift } from "lucide-react";
import { isInLaunchPeriod } from "@/lib/launchConfig";
import { useT } from "@/i18n";

const isLaunch = isInLaunchPeriod();

const FreePremiumSection = () => {
  const t = useT();

  const freeItems = [
    { title: t.free_daily_title, description: t.free_daily_desc },
    { title: t.free_taste_title, description: t.free_taste_desc },
    { title: t.free_tarot_title, description: t.free_tarot_desc },
  ];

  const premiumPackages = [
    {
      title: t.premium_personal_title,
      price: "₪149",
      features: [t.about_astrology_title, t.about_rising_title, t.about_tarot_title, "PDF"],
      popular: false,
    },
    {
      title: t.premium_soul_title,
      price: "₪299",
      features: [t.about_astrology_title, t.about_compatibility_title, t.about_tarot_title, t.about_palm_title, "PDF"],
      popular: true,
    },
    {
      title: t.premium_couple_title,
      price: "₪199",
      features: [t.about_compatibility_title, t.about_astrology_title, t.about_rising_title],
      popular: false,
    },
  ];

  return (
    <section id="free" className="py-24 px-4 relative cosmic-section-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-gold/4 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-56 h-56 rounded-full bg-crimson/4 blur-[100px]" />
      </div>
      <div className="section-divider max-w-xl mx-auto mb-20" />

      {/* Free section */}
      <div className="max-w-5xl mx-auto mb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-4">
            {t.free_title}
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            {t.free_subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {freeItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="mystical-card p-6 text-center"
            >
              <Star className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="font-heading text-base text-gold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-body mb-4">{item.description}</p>
              <button className="btn-outline-gold text-xs font-body">{t.free_cta}</button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium section */}
      <div id="premium" className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-gold" />
            <span className="text-gold font-heading text-sm tracking-widest">
              {isLaunch ? t.premium_launch_label : t.premium_label}
            </span>
            <Crown className="w-5 h-5 text-gold" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-4">
            {t.premium_title}
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-lg mx-auto">
            {isLaunch ? t.premium_launch_subtitle : t.premium_subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {premiumPackages.map((pkg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: "easeOut" }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className={`mystical-card p-8 text-center relative ${
                pkg.popular ? "ring-2 ring-gold/40 animate-pulse-glow" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold text-primary-foreground text-xs font-bold font-body">
                  {isLaunch ? t.premium_recommended : t.premium_popular}
                </div>
              )}
              <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="font-heading text-lg text-gold mb-2">{pkg.title}</h3>

              <div className="mb-6">
                {isLaunch ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-muted-foreground/50 font-body text-lg line-through">{pkg.price}</span>
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-gold" />
                      <span className="font-heading text-2xl text-gold">{t.premium_free_label}</span>
                      <Gift className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-xs text-muted-foreground font-body">{t.premium_launch_period}</span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-foreground font-body">{pkg.price}</div>
                )}
              </div>

              <ul className="space-y-2 mb-8 text-right">
                {pkg.features.map((f) => (
                  <li key={f} className="text-sm text-foreground/70 font-body flex items-center gap-2 justify-end">
                    {f}
                    <span className="text-gold text-xs">✦</span>
                  </li>
                ))}
              </ul>
              <button className={pkg.popular ? "btn-gold font-body w-full" : "btn-outline-gold font-body w-full"}>
                {isLaunch ? t.premium_launch_cta : t.premium_cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FreePremiumSection;

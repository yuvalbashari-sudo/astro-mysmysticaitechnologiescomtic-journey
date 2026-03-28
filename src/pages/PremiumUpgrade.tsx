import { motion } from "framer-motion";
import { Crown, Star, Shield, Zap, Lock, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useT, useLanguage } from "@/i18n";
import type { Language } from "@/i18n";
import { subscriptionManager } from "@/lib/subscriptionManager";
import { toast } from "@/components/ui/sonner";

type LangText = Record<Language, string>;
type LangFeatures = Record<Language, { text: string; included: boolean }[]>;

const plans: {
  id: string;
  icon: typeof Star;
  popular: boolean;
  priceLabel: LangText;
  priceSubtext: LangText;
  yearlyNote?: LangText;
  features: LangFeatures;
}[] = [
  {
    id: "free",
    icon: Star,
    popular: false,
    priceLabel: { he: "חינם", en: "Free", ar: "مجاني", ru: "Бесплатно" },
    priceSubtext: { he: "לתמיד", en: "Forever", ar: "للأبد", ru: "Навсегда" },
    features: {
      he: [
        { text: "קלף יומי — תמיד בחינם", included: true },
        { text: "הורוסקופ חודשי ואישי — בחינם", included: true },
        { text: "קריאת טארוט אחת ביום בחינם", included: true },
        { text: "התאמה זוגית אחת בחודש (סיכום קצר)", included: true },
        { text: "קריאת כף יד — 29 ₪", included: false },
        { text: "קריאות טארוט נוספות — 9 ₪ כל אחת", included: false },
        { text: "התאמה זוגית מלאה — 9 ₪", included: false },
      ],
      en: [
        { text: "Daily Card — always free", included: true },
        { text: "Monthly & personal horoscope — free", included: true },
        { text: "1 free tarot reading per day", included: true },
        { text: "1 short compatibility reading per month", included: true },
        { text: "Palm reading — ₪29 each", included: false },
        { text: "Additional tarot readings — ₪9 each", included: false },
        { text: "Full compatibility reading — ₪9", included: false },
      ],
      ar: [
        { text: "بطاقة يومية — مجانية دائماً", included: true },
        { text: "توقعات شهرية وشخصية — مجاناً", included: true },
        { text: "قراءة تاروت واحدة يومياً مجاناً", included: true },
        { text: "قراءة توافق واحدة شهرياً (ملخص قصير)", included: true },
        { text: "قراءة الكف — 29 ₪", included: false },
        { text: "قراءات تاروت إضافية — 9 ₪ لكل واحدة", included: false },
        { text: "قراءة توافق كاملة — 9 ₪", included: false },
      ],
      ru: [
        { text: "Ежедневная карта — всегда бесплатно", included: true },
        { text: "Месячный и личный гороскоп — бесплатно", included: true },
        { text: "1 бесплатное чтение Таро в день", included: true },
        { text: "1 краткое чтение совместимости в месяц", included: true },
        { text: "Чтение по ладони — ₪29", included: false },
        { text: "Дополнительные чтения Таро — ₪9 каждое", included: false },
        { text: "Полное чтение совместимости — ₪9", included: false },
      ],
    },
  },
  {
    id: "subscriber",
    icon: Crown,
    popular: true,
    priceLabel: { he: "₪39", en: "₪39", ar: "₪39", ru: "₪39" },
    priceSubtext: { he: "/חודש", en: "/month", ar: "/شهر", ru: "/месяц" },
    yearlyNote: { he: "או ₪29/חודש בתשלום שנתי", en: "or ₪29/mo billed annually", ar: "أو ₪29/شهر بالدفع السنوي", ru: "или ₪29/мес при годовой оплате" },
    features: {
      he: [
        { text: "קלף יומי — תמיד בחינם", included: true },
        { text: "הורוסקופ חודשי ואישי — בחינם", included: true },
        { text: "3 קריאות טארוט ביום כלולות", included: true },
        { text: "5 קריאות התאמה מלאות בחודש", included: true },
        { text: "קריאת כף יד — רק 9 ₪ (עד 3 בחודש)", included: true },
        { text: "חוויה מעמיקה ומפורטת יותר", included: true },
        { text: "קריאות טארוט נוספות — 5 ₪ בלבד", included: true },
        { text: "התאמות נוספות — 7 ₪ כל אחת", included: true },
      ],
      en: [
        { text: "Daily Card — always free", included: true },
        { text: "Monthly & personal horoscope — free", included: true },
        { text: "3 tarot readings per day included", included: true },
        { text: "5 full compatibility readings per month", included: true },
        { text: "Palm reading — only ₪9 (up to 3/month)", included: true },
        { text: "Deeper, more detailed experience", included: true },
        { text: "Additional tarot readings — only ₪5", included: true },
        { text: "Additional compatibility — ₪7 each", included: true },
      ],
      ar: [
        { text: "بطاقة يومية — مجانية دائماً", included: true },
        { text: "توقعات شهرية وشخصية — مجاناً", included: true },
        { text: "3 قراءات تاروت يومياً", included: true },
        { text: "5 قراءات توافق كاملة شهرياً", included: true },
        { text: "قراءة الكف — فقط 9 ₪ (حتى 3 شهرياً)", included: true },
        { text: "تجربة أعمق وأكثر تفصيلاً", included: true },
        { text: "قراءات تاروت إضافية — فقط 5 ₪", included: true },
        { text: "توافقات إضافية — 7 ₪ لكل واحدة", included: true },
      ],
      ru: [
        { text: "Ежедневная карта — всегда бесплатно", included: true },
        { text: "Месячный и личный гороскоп — бесплатно", included: true },
        { text: "3 чтения Таро в день включены", included: true },
        { text: "5 полных чтений совместимости в месяц", included: true },
        { text: "Чтение по ладони — только ₪9 (до 3/мес)", included: true },
        { text: "Более глубокий и детальный опыт", included: true },
        { text: "Дополнительные чтения Таро — только ₪5", included: true },
        { text: "Дополнительная совместимость — ₪7 каждая", included: true },
      ],
    },
  },
];

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      return (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            background: `hsl(var(--gold) / ${Math.random() * 0.3 + 0.1})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -(20 + Math.random() * 40), 0],
            opacity: [0.1, 0.6, 0.1],
          }}
          transition={{
            duration: 4 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      );
    })}
  </div>
);

const PremiumUpgrade = () => {
  const navigate = useNavigate();
  const t = useT();
  const { language, dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background overflow-y-auto" dir={dir}>
      <FloatingParticles />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-gold/[0.03] blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-crimson/[0.04] blur-[120px]" />
      </div>

      {/* Back button */}
      <div className="relative z-10 p-4 md:p-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-foreground/50 hover:text-gold transition-colors font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.premium_back}
        </button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-4 pt-4 pb-12 md:pt-8 md:pb-16"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Crown className="w-6 h-6 md:w-8 md:h-8 text-gold" />
          </motion.div>
        </div>
        <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl gold-gradient-text mb-5 leading-tight">
          {t.premium_unlock_title}
        </h1>
        <p className="font-body text-foreground/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          {t.premium_unlock_desc}
        </p>
      </motion.div>

      {/* Plan cards */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-12 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.7, ease: "easeOut" }}
              className={`group relative mystical-card p-7 md:p-8 flex flex-col transition-all duration-500 ${
                plan.popular
                  ? "ring-1 ring-gold/40 shadow-[0_0_50px_hsl(var(--gold)/0.15)] md:scale-[1.03]"
                  : "hover:ring-1 hover:ring-gold/20"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="btn-gold !py-1.5 !px-5 !text-[11px] !tracking-[0.15em] !rounded-full !shadow-[0_0_25px_hsl(var(--gold)/0.3)]">
                    {t.premium_most_popular}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-14 h-14 mx-auto mb-5 mt-2 rounded-full flex items-center justify-center border transition-all duration-500 ${
                  plan.popular
                    ? "bg-gold/15 border-gold/35"
                    : "bg-gold/8 border-gold/15 group-hover:bg-gold/12 group-hover:border-gold/25"
                }`}
              >
                <plan.icon
                  className={`w-6 h-6 transition-colors ${
                    plan.popular ? "text-gold-light" : "text-gold/70 group-hover:text-gold"
                  }`}
                />
              </div>

              {/* Plan name */}
              <h3 className="font-heading text-xl md:text-2xl text-foreground text-center mb-1">
                {plan.id === "free" ? t.premium_plan_free_name : t.premium_plan_sub_name}
              </h3>
              <p className="font-body text-sm text-foreground/50 text-center mb-6">
                {plan.id === "free" ? t.premium_plan_free_desc : t.premium_plan_sub_desc}
              </p>

              {/* Price */}
              <div className="text-center mb-2">
                <span className="font-heading text-4xl md:text-5xl gold-gradient-text">
                  {plan.priceLabel[language]}
                </span>
                <span className="font-body text-sm text-foreground/40 ms-1">
                  {plan.priceSubtext[language]}
                </span>
              </div>
              {plan.yearlyNote && (
                <p className="text-center font-body text-xs text-gold/60 mb-5">
                  {plan.yearlyNote[language]}
                </p>
              )}

              {/* Divider */}
              <div className="h-px w-full bg-gold/10 mb-6" />

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features[language].map((f, fi) => (
                  <li key={fi} className="flex items-center gap-3 font-body text-sm">
                    {f.included ? (
                      <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-foreground/20 flex-shrink-0" />
                    )}
                    <span className={f.included ? "text-foreground/80" : "text-foreground/30"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`w-full py-3.5 rounded-lg font-body font-bold text-sm tracking-wider transition-all duration-300 ${
                  plan.popular
                    ? "btn-gold"
                    : "border border-foreground/15 text-foreground/60 hover:border-gold/30 hover:text-gold"
                }`}
              >
                {plan.id === "free" ? t.premium_plan_free_cta : t.premium_plan_sub_cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust / Reassurance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 max-w-3xl mx-auto px-4 pb-16 md:pb-24"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          {[
            { icon: Shield, label: t.premium_trust_secure },
            { icon: Zap, label: t.premium_trust_instant },
            { icon: Lock, label: t.premium_trust_cancel },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-foreground/40">
              <item.icon className="w-4 h-4 text-gold/50" />
              <span className="font-body text-xs tracking-wide">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumUpgrade;

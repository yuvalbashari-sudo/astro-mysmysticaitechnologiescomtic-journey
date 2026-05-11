import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass, Sparkles, MessageCircle, Heart, Sparkle, Globe2, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n";
import stepArt1 from "@/assets/local-step-1.png";
import stepArt2 from "@/assets/local-step-2.png";
import stepArt3 from "@/assets/local-step-3.png";

const STEP_ART = [stepArt1, stepArt2, stepArt3];

/**
 * Mobile-first "How it works" trust section.
 * Sits directly below the mobile hero. Does NOT duplicate the CTA popup cards —
 * this is an explanation + trust block to encourage continued scrolling.
 */
const HowItWorksSection = () => {
  const { language, dir } = useLanguage();
  const isRTL = dir === "rtl";

  const l = <T,>(map: Record<string, T>): T => (map as any)[language] ?? (map as any).en;

  const copy = l({
    he: {
      eyebrow: "החוויה שלכם",
      title: "איך זה עובד?",
      intro: "קבלו הכוונה אישית דרך אסטרולוגיה, טארוט ותובנות רוחניות — בדרך חכמה, מדויקת ונגישה.",
      steps: [
        { icon: Compass, title: "בוחרים את סוג ההכוונה", desc: "הורוסקופ יומי, תחזית חודשית, טארוט, התאמה זוגית ועוד.", href: "/astrology-guides" },
        { icon: Sparkles, title: "מקבלים תובנה אישית", desc: "המערכת מתאימה עבורכם מסר מדויק, ברור ומעורר מחשבה.", href: "/tarot-guides" },
        { icon: MessageCircle, title: "מעמיקים עם נוריאל", desc: "אם תרצו, נוריאל תעזור לכם לבחור את הדרך שהכי מתאימה לכם.", href: "/astrology-guides" },
      ],
      trust: [
        { icon: Heart, label: "חוויה אישית ומותאמת" },
        { icon: Sparkle, label: "ממשק פשוט ונעים לשימוש" },
        { icon: Globe2, label: "זמין ב-4 שפות" },
      ],
      scrollCue: "רוצה להבין איך זה עובד? ✨",
    },
    en: {
      eyebrow: "Your experience",
      title: "How it works",
      intro: "Get personal guidance from astrology, tarot, and real insight — in a way that's smart, easy, and made for you.",
      steps: [
        { icon: Compass, title: "Pick your reading", desc: "Daily horoscope, monthly forecast, tarot, compatibility, and more.", href: "/astrology-guides" },
        { icon: Sparkles, title: "Get a personal insight", desc: "We put together a clear, personal message — just for you.", href: "/tarot-guides" },
        { icon: MessageCircle, title: "Go deeper with Norielle", desc: "If you want, Norielle will help you find the path that fits you best.", href: "/astrology-guides" },
      ],
      trust: [
        { icon: Heart, label: "Personal & made for you" },
        { icon: Sparkle, label: "Simple, easy to use" },
        { icon: Globe2, label: "Available in 4 languages" },
      ],
      scrollCue: "See how it works ✨",
    },
    ru: {
      eyebrow: "Ваш опыт",
      title: "Как это работает?",
      intro: "Получите персональное руководство через астрологию, таро и духовные откровения — умно, точно и доступно.",
      steps: [
        { icon: Compass, title: "Выберите тип руководства", desc: "Ежедневный гороскоп, месячный прогноз, таро, совместимость и больше.", href: "/astrology-guides" },
        { icon: Sparkles, title: "Получите личное послание", desc: "Система подбирает для вас точное, ясное и вдохновляющее сообщение.", href: "/tarot-guides" },
        { icon: MessageCircle, title: "Углубитесь с Нориэль", desc: "Если хотите, Нориэль поможет выбрать путь, который подходит именно вам.", href: "/astrology-guides" },
      ],
      trust: [
        { icon: Heart, label: "Лично и индивидуально" },
        { icon: Sparkle, label: "Простой и приятный интерфейс" },
        { icon: Globe2, label: "Доступно на 4 языках" },
      ],
      scrollCue: "Узнайте больше о нашем опыте ✨",
    },
    ar: {
      eyebrow: "تجربتك",
      title: "كيف يعمل هذا؟",
      intro: "احصل على إرشاد شخصي من خلال علم التنجيم والتاروت والرؤى الروحية — بطريقة ذكية ودقيقة وسهلة الوصول.",
      steps: [
        { icon: Compass, title: "اختر نوع الإرشاد", desc: "الأبراج اليومية، التوقعات الشهرية، التاروت، التوافق والمزيد.", href: "/astrology-guides" },
        { icon: Sparkles, title: "احصل على رؤية شخصية", desc: "يصمم النظام لك رسالة دقيقة وواضحة ومُلهمة.", href: "/tarot-guides" },
        { icon: MessageCircle, title: "تعمّق مع نورييل", desc: "إذا أردت، ستساعدك نورييل في اختيار المسار الأنسب لك.", href: "/astrology-guides" },
      ],
      trust: [
        { icon: Heart, label: "تجربة شخصية ومخصصة" },
        { icon: Sparkle, label: "واجهة بسيطة وأنيقة" },
        { icon: Globe2, label: "متاح بـ 4 لغات" },
      ],
      scrollCue: "اكتشف المزيد عن تجربتنا ✨",
    },
  });

  return (
    <section
      dir={dir}
      aria-label={copy.title}
      className="md:hidden relative pointer-events-auto"
      style={{
        background: "radial-gradient(120% 80% at 50% 0%, hsl(225 60% 7%) 0%, hsl(225 60% 3%) 70%)",
        borderTop: "1px solid hsl(var(--gold) / 0.18)",
        paddingTop: 36,
        paddingBottom: 28,
        paddingLeft: 18,
        paddingRight: 18,
      }}
    >
      {/* subtle starlight backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, hsl(var(--gold) / 0.08), transparent 40%)," +
            "radial-gradient(circle at 80% 60%, hsl(280 60% 50% / 0.08), transparent 45%)",
          opacity: 0.9,
        }}
      />

      <div className="relative z-10 max-w-[460px] mx-auto">
        {/* eyebrow — promoted to a strong section title */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2 mb-4"
          style={{ textAlign: "center" }}
        >
          <span
            className="font-heading uppercase tracking-[0.28em] text-gold"
            style={{
              fontSize: 20,
              lineHeight: 1.2,
              textShadow: "0 2px 14px hsl(var(--gold) / 0.35)",
            }}
          >
            {copy.eyebrow}
          </span>
        </motion.div>

        {/* headline */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-foreground text-center"
          style={{
            fontSize: 30,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            marginBottom: 12,
            textShadow: "0 2px 18px hsl(var(--gold) / 0.15)",
          }}
        >
          {copy.title}
        </motion.h2>

        {/* intro */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-body text-foreground/75 text-center"
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            marginBottom: 28,
          }}
        >
          {copy.intro}
        </motion.p>

        {/* steps */}
        <ol className="flex flex-col gap-3" style={{ marginBottom: 28 }}>
          {copy.steps.map((step, idx) => {
            return (
              <motion.li
                key={idx}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: 0.05 + idx * 0.08 }}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.015 }}
              >
                <Link
                  to={step.href}
                  aria-label={step.title}
                  className="relative flex items-start gap-3 group focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 rounded-[18px] transition-shadow duration-300"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(225 50% 8% / 0.85), hsl(225 50% 5% / 0.85))",
                    border: "1px solid hsl(var(--gold) / 0.22)",
                    borderRadius: 18,
                    padding: "16px 16px",
                    boxShadow:
                      "0 8px 24px hsl(225 60% 2% / 0.5), inset 0 1px 0 hsl(var(--gold) / 0.08)",
                    flexDirection: isRTL ? "row-reverse" : "row",
                    textAlign: isRTL ? "right" : "left",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 12px 32px hsl(225 60% 2% / 0.6), 0 0 22px hsl(var(--gold) / 0.22), inset 0 1px 0 hsl(var(--gold) / 0.14)";
                    (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--gold) / 0.45)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 8px 24px hsl(225 60% 2% / 0.5), inset 0 1px 0 hsl(var(--gold) / 0.08)";
                    (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--gold) / 0.22)";
                  }}
                >
                  {/* icon orb — premium mystical treatment, parity with gateway cards */}
                  <div
                    className="shrink-0 flex items-center justify-center relative overflow-hidden"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 30% 28%, hsl(var(--gold) / 0.42) 0%, hsl(225 50% 6% / 0.55) 70%)",
                      border: "1px solid hsl(var(--gold) / 0.55)",
                      boxShadow:
                        "0 0 26px hsl(var(--gold) / 0.32), inset 0 1px 8px hsl(var(--gold) / 0.22), inset 0 0 0 1px hsl(var(--gold) / 0.1)",
                    }}
                  >
                    {/* inner light spread */}
                    <span
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 50%, hsl(var(--gold) / 0.22) 0%, transparent 70%)",
                      }}
                    />
                    <img
                      src={STEP_ART[idx]}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      style={{
                        width: 56,
                        height: 56,
                        objectFit: "contain",
                        position: "relative",
                        zIndex: 1,
                        filter:
                          "drop-shadow(0 0 6px hsl(var(--gold) / 0.55)) drop-shadow(0 2px 4px hsl(225 60% 2% / 0.6))",
                      }}
                    />
                    {/* step number */}
                    <span
                      className="absolute font-heading text-gold/90"
                      style={{
                        top: -4,
                        [isRTL ? "left" : "right"]: -4,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "hsl(225 60% 4%)",
                        border: "1px solid hsl(var(--gold) / 0.55)",
                        fontSize: 11,
                        lineHeight: "18px",
                        textAlign: "center",
                        zIndex: 2,
                      }}
                    >
                      {idx + 1}
                    </span>
                  </div>


                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-heading text-foreground"
                      style={{ fontSize: 17, lineHeight: 1.3, marginBottom: 4 }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="font-body text-foreground/65"
                      style={{ fontSize: 14, lineHeight: 1.6 }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ol>

        {/* gold divider */}
        <div
          aria-hidden
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.4), transparent)",
            marginBottom: 20,
          }}
        />

        {/* trust mini-row */}
        <motion.ul
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-3 gap-2"
          style={{ marginBottom: 24 }}
        >
          {copy.trust.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li
                key={idx}
                className="flex flex-col items-center justify-start text-center gap-2"
                style={{
                  background: "hsl(225 50% 6% / 0.7)",
                  border: "1px solid hsl(var(--gold) / 0.16)",
                  borderRadius: 14,
                  padding: "12px 6px",
                }}
              >
                <span
                  className="flex items-center justify-center rounded-full relative overflow-hidden"
                  style={{
                    width: 36,
                    height: 36,
                    background:
                      "radial-gradient(circle at 30% 28%, hsl(var(--gold) / 0.38) 0%, hsl(225 50% 6% / 0.55) 70%)",
                    border: "1px solid hsl(var(--gold) / 0.45)",
                    boxShadow:
                      "0 0 14px hsl(var(--gold) / 0.22), inset 0 1px 6px hsl(var(--gold) / 0.18)",
                  }}
                >
                  <Icon
                    className="text-gold"
                    strokeWidth={1.6}
                    style={{
                      width: 18,
                      height: 18,
                      objectFit: "contain",
                      filter: "drop-shadow(0 0 4px hsl(var(--gold) / 0.5))",
                    }}
                  />
                </span>
                <span
                  className="font-body text-foreground/75"
                  style={{ fontSize: 11.5, lineHeight: 1.35 }}
                >
                  {item.label}
                </span>
              </li>
            );
          })}
        </motion.ul>

        {/* scroll cue */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col items-center justify-center gap-1.5"
          style={{ paddingTop: 4 }}
        >
          <span
            className="font-body text-gold/80"
            style={{ fontSize: 13, letterSpacing: "0.02em" }}
          >
            {copy.scrollCue}
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4 text-gold/60" strokeWidth={1.6} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

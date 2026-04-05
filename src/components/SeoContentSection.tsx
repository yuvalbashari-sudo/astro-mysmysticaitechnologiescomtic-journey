import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, Hand, Heart, Star, Sparkles, Sun } from "lucide-react";
import { useLanguage } from "@/i18n";

const SeoContentSection = () => {
  const { language } = useLanguage();
  const isHe = language === "he" || language === "ar";

  // SEO-rich content in Hebrew (primary) with English fallback
  const content = language === "he" ? {
    mainTitle: "גלו את סודות היקום עם ASTROLOGAI",
    mainDesc: "ASTROLOGAI הוא פלטפורמת האסטרולוגיה והמיסטיקה המתקדמת בישראל, המשלבת בינה מלאכותית עם מסורות רוחניות עתיקות. קבלו קריאת טארוט מותאמת אישית, קריאת כף יד מבוססת AI, בדיקת התאמה זוגית לפי מזלות, מפת לידה מפורטת והורוסקופ חודשי — הכל בחוויה אחת אלגנטית ומרהיבה.",
    services: [
      {
        icon: Eye,
        title: "קריאת טארוט אונליין",
        desc: "שאלו שאלה וקבלו פריסת טארוט אישית עם פירוש מעמיק של כל קלף. קריאת הטארוט שלנו מבוססת על 78 קלפי טארוט — 22 קלפי ארקנה מאז'ורית ו-56 קלפי ארקנה מינורית — כולל פירושים לאהבה, קריירה, רוחניות ומסר יומי.",
        link: "/tarot-gallery",
        linkText: "צפו בכל קלפי הטארוט →",
      },
      {
        icon: Hand,
        title: "קריאת כף יד בינה מלאכותית",
        desc: "העלו תמונות של כפות הידיים ומערכת ה-AI שלנו תנתח את קווי החיים, הלב, הגורל, השמש והאינטואיציה. קריאת כף היד כוללת ניתוח צורת היד, האצבעות ותילי כף היד לקבלת תובנות אישיות מעמיקות.",
        link: null,
        linkText: null,
      },
      {
        icon: Heart,
        title: "בדיקת התאמה זוגית לפי מזלות",
        desc: "גלו את הכימיה הקוסמית בינכם לבין בן או בת הזוג. ניתוח ההתאמה הזוגית שלנו בוחן תאימות רגשית, רומנטית, תקשורתית ורוחנית בין 12 המזלות — טלה, שור, תאומים, סרטן, אריה, בתולה, מאזניים, עקרב, קשת, גדי, דלי ודגים.",
        link: "/zodiac/aries",
        linkText: "גלו את המזל שלכם →",
      },
      {
        icon: Sun,
        title: "מפת לידה והורוסקופ חודשי",
        desc: "הזינו את תאריך ושעת הלידה לקבלת מפת לידה אישית הכוללת מיקום כוכבי הלכת, בתים אסטרולוגיים, מזל עולה ותחזית חודשית מותאמת אישית — בחינם.",
        link: null,
        linkText: null,
      },
    ],
    trustTitle: "למה לבחור ב-ASTROLOGAI?",
    trustItems: [
      "חוויה מיסטית פרימיום מותאמת אישית",
      "טכנולוגיית AI מתקדמת לקריאות מדויקות",
      "זמין בעברית, אנגלית, ערבית ורוסית",
      "קלף יומי והורוסקופ חודשי בחינם",
      "קריאות מותאמות לשם ולתאריך לידה",
    ],
  } : {
    mainTitle: "Discover the Secrets of the Universe with ASTROLOGAI",
    mainDesc: "ASTROLOGAI is the leading AI-powered astrology and mystical guidance platform. Get a personalized tarot reading, AI palm reading analysis, zodiac compatibility test, detailed birth chart, and monthly horoscope — all in one elegant, premium experience.",
    services: [
      {
        icon: Eye,
        title: "Online Tarot Reading",
        desc: "Ask a question and receive a personalized tarot spread with deep interpretation of each card. Our tarot reading uses all 78 tarot cards — 22 Major Arcana and 56 Minor Arcana — with interpretations for love, career, spirituality, and daily guidance.",
        link: "/tarot-gallery",
        linkText: "Browse all Tarot Cards →",
      },
      {
        icon: Hand,
        title: "AI Palm Reading Online",
        desc: "Upload photos of your palms and our AI system will analyze your life line, heart line, fate line, sun line, and intuition line. The palm reading includes analysis of hand shape, fingers, and mounts for deep personal insights.",
        link: null,
        linkText: null,
      },
      {
        icon: Heart,
        title: "Zodiac Compatibility Test",
        desc: "Discover the cosmic chemistry between you and your partner. Our compatibility analysis examines emotional, romantic, communicative, and spiritual compatibility across all 12 zodiac signs — Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces.",
        link: "/zodiac/aries",
        linkText: "Explore your Zodiac Sign →",
      },
      {
        icon: Sun,
        title: "Birth Chart & Monthly Horoscope",
        desc: "Enter your birth date and time to receive a personalized birth chart with planet placements, astrological houses, rising sign, and a tailored monthly forecast — completely free.",
        link: null,
        linkText: null,
      },
    ],
    trustTitle: "Why Choose ASTROLOGAI?",
    trustItems: [
      "Premium personalized mystical experience",
      "Advanced AI technology for accurate readings",
      "Available in Hebrew, English, Arabic, and Russian",
      "Free daily card and monthly horoscope",
      "Readings personalized to your name and birth date",
    ],
  };

  return (
    <section className="py-12 md:py-20 px-3 md:px-4 relative cosmic-section-bg overflow-hidden" aria-label="SEO Content">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-gold/3 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-crimson/3 blur-[100px]" />
      </div>

      <div className="section-divider max-w-xl mx-auto mb-10 md:mb-16" />

      {/* ── Main glass card container ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-5xl mx-auto relative z-10 w-[92%] md:w-full"
        style={{
          background: "rgba(10, 10, 20, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 20,
          border: "1px solid rgba(255, 215, 0, 0.2)",
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 215, 0, 0.06), 0 0 80px rgba(10, 10, 30, 0.5)",
          padding: "28px 20px",
        }}
      >
        {/* Soft gradient fade behind card for depth */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[20px]"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(255, 215, 0, 0.03) 0%, transparent 60%)",
          }}
        />

        {/* Main SEO heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-12 relative z-10"
        >
          <h2 className="font-heading text-2xl md:text-4xl gold-gradient-text mb-5 md:mb-6 leading-tight">
            {content.mainTitle}
          </h2>
          <p className="text-foreground/80 font-body text-sm md:text-base leading-[2] md:leading-[1.9] max-w-3xl mx-auto">
            {content.mainDesc}
          </p>
        </motion.div>

        {/* Service descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12 md:mb-16 relative z-10">
          {content.services.map((service, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5 md:p-8"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 215, 0, 0.1)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-glow w-10 h-10">
                  <service.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-heading text-base text-gold">{service.title}</h3>
              </div>
              <p className="text-foreground/70 font-body text-sm leading-[2] mb-4">
                {service.desc}
              </p>
              {service.link && (
                <Link
                  to={service.link}
                  className="text-gold/70 hover:text-gold font-body text-xs transition-colors inline-flex items-center gap-1"
                >
                  {service.linkText}
                </Link>
              )}
            </motion.article>
          ))}
        </div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center relative z-10"
        >
          <h3 className="font-heading text-lg text-gold mb-6">{content.trustTitle}</h3>

          {/* Premium featured card - between title and trust items */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
            className="mb-6 flex justify-center"
          >
            <div
              className="relative flex items-center gap-3 px-8 py-4 rounded-2xl font-heading text-base text-gold cursor-default select-none overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(10, 10, 20, 0.8) 50%, rgba(255, 215, 0, 0.08) 100%)",
                border: "1.5px solid hsl(var(--gold) / 0.4)",
                boxShadow: "0 0 32px rgba(255, 215, 0, 0.15), 0 0 60px rgba(255, 215, 0, 0.06), inset 0 1px 0 rgba(255, 215, 0, 0.15)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 30% 50%, rgba(255, 215, 0, 0.08) 0%, transparent 70%)",
                }}
              />
              <Star className="w-5 h-5 text-gold relative z-10" fill="currentColor" />
              <span className="relative z-10 tracking-wide">
                {isHe ? "מפה אסטרולוגית מלאה" : "Full Astrological Chart"}
              </span>
              <Sparkles className="w-4 h-4 text-gold/60 relative z-10" />
            </div>
          </motion.div>

          <ul className="flex flex-wrap justify-center gap-3">
            {content.trustItems.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs text-foreground/70"
                style={{
                  background: "hsl(var(--gold) / 0.06)",
                  border: "1px solid hsl(var(--gold) / 0.12)",
                }}
              >
                <Sparkles className="w-3 h-3 text-gold/50" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Internal links grid */}
        <div className="mt-10 md:mt-12 text-center relative z-10">
          <p className="font-body text-xs text-foreground/30 mb-4">
            {isHe ? "גלו עוד:" : "Explore more:"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { to: "/tarot/the-fool", label: isHe ? "הקלף השוטה" : "The Fool" },
              { to: "/tarot/the-lovers", label: isHe ? "האוהבים" : "The Lovers" },
              { to: "/tarot/the-star", label: isHe ? "הכוכב" : "The Star" },
              { to: "/zodiac/aries", label: isHe ? "מזל טלה" : "Aries" },
              { to: "/zodiac/leo", label: isHe ? "מזל אריה" : "Leo" },
              { to: "/zodiac/scorpio", label: isHe ? "מזל עקרב" : "Scorpio" },
              { to: "/zodiac/pisces", label: isHe ? "מזל דגים" : "Pisces" },
              { to: "/tarot-gallery", label: isHe ? "כל קלפי הטארוט" : "All Tarot Cards" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gold/40 hover:text-gold/70 font-body text-[11px] px-3 py-1.5 rounded-full transition-colors"
                style={{ border: "1px solid hsl(var(--gold) / 0.08)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Premium featured card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
            className="mt-8 flex justify-center"
          >
            <div
              className="relative flex items-center gap-3 px-8 py-4 rounded-2xl font-heading text-base text-gold cursor-default select-none overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(10, 10, 20, 0.8) 50%, rgba(255, 215, 0, 0.08) 100%)",
                border: "1.5px solid hsl(var(--gold) / 0.4)",
                boxShadow: "0 0 32px rgba(255, 215, 0, 0.15), 0 0 60px rgba(255, 215, 0, 0.06), inset 0 1px 0 rgba(255, 215, 0, 0.15)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 30% 50%, rgba(255, 215, 0, 0.08) 0%, transparent 70%)",
                }}
              />
              <Star className="w-5 h-5 text-gold relative z-10" fill="currentColor" />
              <span className="relative z-10 tracking-wide">
                {isHe ? "מפה אסטרולוגית מלאה" : "Full Astrological Chart"}
              </span>
              <Sparkles className="w-4 h-4 text-gold/60 relative z-10" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default SeoContentSection;

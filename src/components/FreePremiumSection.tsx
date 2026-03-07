import { motion } from "framer-motion";
import { Star, Sparkles, Crown } from "lucide-react";

const freeItems = [
  { title: "תובנה יומית לפי המזל", description: "קבלו מסר אסטרולוגי קצר בהתאם למזל שלכם" },
  { title: "טעימה מהתאמה זוגית", description: "בדיקת התאמה ראשונית בין שני מזלות" },
  { title: "קלף טארוט יומי", description: "שאלו שאלה וקבלו קלף אחד עם מסר מהיקום" },
];

const premiumPackages = [
  {
    title: "קריאה אישית מעמיקה",
    price: "₪149",
    features: ["מפת לידה מלאה", "ניתוח כוכבי לכת", "מסר אישי מהכוכבים", "PDF מעוצב"],
    popular: false,
  },
  {
    title: "חבילת נשמה מלאה",
    price: "₪299",
    features: ["מפת לידה + התאמה זוגית", "קריאת טארוט 3 קלפים", "קריאת כף יד", "שיחת ייעוץ אישית", "PDF פרימיום"],
    popular: true,
  },
  {
    title: "קריאת זוגיות",
    price: "₪199",
    features: ["השוואת מפות לידה", "ניתוח כימיה רוחנית", "נקודות חיבור וחיכוך", "המלצות לזוגיות"],
    popular: false,
  },
];

const FreePremiumSection = () => {
  return (
    <section id="free" className="py-24 px-4 relative">
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
            התחילו בחינם
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            טעימה מיסטית — ללא עלות, ללא התחייבות
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {freeItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="mystical-card p-6 text-center"
            >
              <Star className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="font-heading text-base text-gold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-body mb-4">{item.description}</p>
              <button className="btn-outline-gold text-xs font-body">קבלו בחינם</button>
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
            <span className="text-gold font-heading text-sm tracking-widest">פרימיום</span>
            <Crown className="w-5 h-5 text-gold" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-4">
            קריאות אישיות מעמיקות
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-lg mx-auto">
            חוויה רוחנית בלעדית — מותאמת אישית רק בשבילכם
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {premiumPackages.map((pkg, i) => (
            <motion.div
              key={pkg.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`mystical-card p-8 text-center relative ${
                pkg.popular ? "ring-2 ring-gold/40 animate-pulse-glow" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold text-primary-foreground text-xs font-bold font-body">
                  הכי פופולרי
                </div>
              )}
              <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="font-heading text-lg text-gold mb-2">{pkg.title}</h3>
              <div className="text-3xl font-bold text-foreground font-body mb-6">{pkg.price}</div>
              <ul className="space-y-2 mb-8 text-right">
                {pkg.features.map((f) => (
                  <li key={f} className="text-sm text-foreground/70 font-body flex items-center gap-2 justify-end">
                    {f}
                    <span className="text-gold text-xs">✦</span>
                  </li>
                ))}
              </ul>
              <button className={pkg.popular ? "btn-gold font-body w-full" : "btn-outline-gold font-body w-full"}>
                הזמינו עכשיו
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FreePremiumSection;

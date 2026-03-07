import { motion } from "framer-motion";
import { Star, Sun, Moon, Heart, Hand, Sparkles } from "lucide-react";

const disciplines = [
  {
    icon: Sun,
    title: "אסטרולוגיה אישית",
    desc: "ניתוח מעמיק של מפת הלידה שלכם — כוכבי הלכת, הבתים האסטרולוגיים והמסרים שהיקום שתל בכם ביום שנולדתם.",
  },
  {
    icon: Moon,
    title: "מזל עולה",
    desc: "חשיפת המסכה הקוסמית שלכם דרך שעת הלידה — האופן שבו העולם תופס אתכם והאנרגיה שאתם מקרינים.",
  },
  {
    icon: Heart,
    title: "התאמה זוגית",
    desc: "בדיקת הכימיה הקוסמית בין שני מזלות — גילוי נקודות חיבור, מתח ופוטנציאל רומנטי מהכוכבים.",
  },
  {
    icon: Star,
    title: "קריאת טארוט",
    desc: "שליפת קלפים מהחפיסה המיסטית — כל קלף חושף שכבה נוספת של משמעות, כיוון והשראה לחייכם.",
  },
  {
    icon: Hand,
    title: "קריאת כף יד",
    desc: "ניתוח סימבולי של קווי כף היד — קו החיים, הלב, הגורל והשכל חושפים את הפוטנציאל הנסתר שלכם.",
  },
];

const AboutSection = () => {
  return (
    <section className="py-28 px-4 relative overflow-hidden">
      {/* Cosmic background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-gold/5 blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full bg-celestial/10 blur-[80px]" />
      </div>

      <div className="section-divider max-w-xl mx-auto mb-20" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-gold/60" />
            <span className="text-gold/50 font-body text-sm tracking-widest uppercase">
              Discover Your Path
            </span>
            <Sparkles className="w-5 h-5 text-gold/60" />
          </div>
          <h2 className="font-heading text-3xl md:text-5xl gold-gradient-text mb-6">
            החוויה המיסטית של ASTROLOGAI
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-center text-foreground/75 font-body text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-6"
        >
          ASTROLOGAI משלב מספר מסורות מיסטיות לחוויה דיגיטלית אחת — אלגנטית, אינטואיטיבית ומדויקת.
          חקרו את האישיות, הזוגיות, נטיות הגורל והמסרים הרוחניים שלכם
          דרך מערכות סמליות עתיקות שפוענחו במיוחד עבורכם.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="text-center text-gold/50 font-body text-sm italic mb-16"
        >
          ✦ חמישה שערים מיסטיים, חוויה אחת שלמה ✦
        </motion.p>

        {/* Discipline cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {disciplines.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group mystical-card p-7 md:p-8 text-center hover:mystical-glow transition-all duration-500 cursor-default"
            >
              <div className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center bg-gold/10 border border-gold/20 group-hover:bg-gold/15 group-hover:border-gold/35 transition-all duration-500">
                <d.icon className="w-6 h-6 text-gold group-hover:text-gold-light transition-colors duration-500" />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-3">{d.title}</h3>
              <p className="font-body text-sm text-foreground/65 leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

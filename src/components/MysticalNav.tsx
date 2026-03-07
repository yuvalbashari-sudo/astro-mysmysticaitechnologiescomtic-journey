import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Heart, Layers, Hand } from "lucide-react";
import TarotWorldModal from "@/components/TarotWorldModal";

const categories = [
  {
    icon: Sun,
    title: "אסטרולוגיה ומפת לידה",
    description: "גלו את המפה הקוסמית שלכם — כוכבי הלכת, הבתים האסטרולוגיים והמסר האישי שנכתב בכוכבים",
    cta: "גלו את המפה שלכם",
    action: null as string | null,
  },
  {
    icon: Heart,
    title: "התאמה זוגית",
    description: "בדקו את הכימיה הרוחנית בינכם לבין בן/בת הזוג — ברמה הקוסמית העמוקה ביותר",
    cta: "בדקו התאמה",
    action: null,
  },
  {
    icon: Layers,
    title: "קריאה בטארוט",
    description: "קבלו תשובות מהיקום — קלפי הטארוט חושפים את מה שהנשמה שלכם צריכה לדעת",
    cta: "שאלו את הקלפים",
    action: "tarot-world",
  },
  {
    icon: Hand,
    title: "קריאת כף היד",
    description: "כף היד שלכם מספרת סיפור — קווי החיים, הלב והגורל מחכים להיחשף",
    cta: "חשפו את הסיפור",
    action: null,
  },
];

const MysticalNav = () => {
  const [tarotWorldOpen, setTarotWorldOpen] = useState(false);

  const handleClick = (action: string | null) => {
    if (action === "tarot-world") {
      setTarotWorldOpen(true);
    }
  };

  return (
    <>
      <section className="py-24 px-4 relative">
        <div className="section-divider max-w-xl mx-auto mb-20" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-4">
            שערים מיסטיים
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-lg mx-auto">
            בחרו את השער שלכם לעולם הרוחני
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="mystical-card p-6 text-center cursor-pointer group transition-all duration-300 hover:mystical-glow"
              onClick={() => handleClick(cat.action)}
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center bg-gold/10 group-hover:bg-gold/20 transition-colors">
                <cat.icon className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-heading text-lg text-gold mb-3">{cat.title}</h3>
              <p className="text-sm text-muted-foreground font-body mb-5 leading-relaxed">
                {cat.description}
              </p>
              <span className="text-sm text-gold/80 font-body font-semibold group-hover:text-gold transition-colors">
                {cat.cta} ✦
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      <TarotWorldModal isOpen={tarotWorldOpen} onClose={() => setTarotWorldOpen(false)} />
    </>
  );
};

export default MysticalNav;

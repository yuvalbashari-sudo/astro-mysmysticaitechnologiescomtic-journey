import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "מיכל כ.",
    text: "קיבלתי קריאה אישית שפשוט הדהימה אותי. ההתאמה הזוגית חשפה דברים שלא ידעתי על עצמי ועל הזוגיות שלי. חוויה מרגשת ומדויקת.",
  },
  {
    name: "אורי ש.",
    text: "הטארוט נתן לי את התשובה שחיפשתי. הכל היה כתוב בצורה כל כך אלגנטית ורגישה — הרגשתי שמישהו באמת מבין את מה שאני עובר.",
  },
  {
    name: "נועה ד.",
    text: "מפת הלידה שלי הייתה מדהימה. כל כוכב, כל בית אסטרולוגי — הכל התחבר. ההרגשה הייתה כמו שיחה עמוקה עם עצמי.",
  },
  {
    name: "דניאל מ.",
    text: "ההתאמה הזוגית הייתה מפתיעה ומרגשת. הזמנו גם קריאת כף יד וזו הייתה חוויה שלא נשכחת. ממליץ בחום!",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="section-divider max-w-xl mx-auto mb-20" />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-4">
          מה אומרים עלינו
        </h2>
        <p className="text-muted-foreground font-body text-lg">
          חוויות אמיתיות של אנשים שגילו את המפה שלהם
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="mystical-card p-6 md:p-8"
          >
            <Quote className="w-6 h-6 text-gold/40 mb-4" />
            <p className="text-foreground/80 font-body text-sm leading-relaxed mb-4">
              "{t.text}"
            </p>
            <p className="text-gold font-body text-sm font-semibold">— {t.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;

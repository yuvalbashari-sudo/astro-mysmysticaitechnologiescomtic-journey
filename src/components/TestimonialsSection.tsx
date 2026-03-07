import { motion } from "framer-motion";
import { Quote, Star, Sparkles } from "lucide-react";

const testimonials = [
  {
    name: "מיכל כ.",
    text: "קיבלתי קריאה אישית שפשוט הדהימה אותי. ההתאמה הזוגית חשפה דברים שלא ידעתי על עצמי ועל הזוגיות שלי — הרגשתי שמישהו באמת מבין אותי.",
    tag: "התאמה זוגית",
  },
  {
    name: "אורי ש.",
    text: "הטארוט נתן לי את התשובה שחיפשתי. הכל היה כתוב בצורה כל כך אלגנטית ורגישה — כל קלף הרגיש כמו מסר אישי מהיקום.",
    tag: "קריאת טארוט",
  },
  {
    name: "נועה ד.",
    text: "מפת הלידה שלי הייתה מדהימה. כל כוכב, כל בית אסטרולוגי — הכל התחבר לתמונה אחת ברורה. גיליתי צדדים בעצמי שלא הכרתי.",
    tag: "אסטרולוגיה",
  },
  {
    name: "דניאל מ.",
    text: "קריאת כף היד הפתיעה אותי. העליתי תמונות של שתי הידיים וקיבלתי ניתוח מפורט שהרגיש אמיתי, רגיש ומדויק להפליא.",
    tag: "קריאת כף יד",
  },
  {
    name: "שירה ל.",
    text: "ניתוח המזל העולה שלי פתח לי חלון לדרך שבה אחרים רואים אותי. זו הייתה חוויה רגשית ומרגשת — ממליצה לכל מי שמחפש הבנה עצמית.",
    tag: "מזל עולה",
  },
  {
    name: "יונתן א.",
    text: "לא האמנתי כמה הקריאה היומית דייקה. כל בוקר אני נכנס לקבל את ההשראה שלי — זה הפך לריטואל שלי.",
    tag: "תובנה יומית",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-28 px-4 relative overflow-hidden">
      {/* Cosmic glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-crimson/5 blur-[120px]" />
      </div>

      <div className="section-divider max-w-xl mx-auto mb-20" />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-16 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Star className="w-4 h-4 text-gold/50" />
          <Star className="w-3 h-3 text-gold/30" />
          <Star className="w-4 h-4 text-gold/50" />
        </div>
        <h2 className="font-heading text-3xl md:text-5xl gold-gradient-text mb-4">
          מה אנשים חוו עם ASTROLOGAI
        </h2>
        <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
          חוויות אמיתיות של אנשים שפתחו שער לעולם הפנימי שלהם
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="group mystical-card p-7 md:p-8 flex flex-col hover:mystical-glow transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-5">
              <Quote className="w-7 h-7 text-gold/30 group-hover:text-gold/50 transition-colors duration-500" />
              <span className="text-[11px] font-body text-gold/40 border border-gold/15 rounded-full px-3 py-1 tracking-wide">
                {t.tag}
              </span>
            </div>
            <p className="text-foreground/80 font-body text-sm leading-[1.9] mb-6 flex-1">
              "{t.text}"
            </p>
            <div className="flex items-center gap-2 pt-4 border-t border-gold/10">
              <Sparkles className="w-3.5 h-3.5 text-gold/40" />
              <p className="text-gold font-body text-sm font-semibold">{t.name}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;

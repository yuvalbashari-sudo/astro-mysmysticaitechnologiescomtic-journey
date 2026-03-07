import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="section-divider max-w-xl mx-auto mb-20" />

      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-8">
            אודות ASTROLOGAI
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mystical-card p-8 md:p-12"
        >
          <p className="text-foreground/85 font-body text-lg leading-loose mb-6">
            ASTROLOGAI הוא עולם רוחני דיגיטלי שנולד מתוך אהבה עמוקה למיסטיקה, לסמלים ולחיבור הנשמתי. 
            אנחנו מאמינים שכל אדם נושא בתוכו מפה קוסמית ייחודית — וכשהיא נחשפת, היא פותחת שער להבנה עמוקה יותר של עצמך, של הזוגיות שלך ושל הדרך שלפניך.
          </p>
          <p className="text-foreground/70 font-body text-base leading-loose mb-6">
            אנחנו משלבים אסטרולוגיה, טארוט, התאמה זוגית וקריאת כף יד לחוויה אחת — אלגנטית, 
            אינטימית ומדויקת. כל קריאה נבנית במיוחד בשבילכם, עם רגישות, אינטואיציה ותשומת לב לפרטים.
          </p>
          <p className="text-gold/70 font-body text-sm italic">
            ✦ הכוכבים מדברים — אנחנו מתרגמים ✦
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;

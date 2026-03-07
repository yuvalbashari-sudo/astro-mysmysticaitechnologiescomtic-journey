import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    q: "מה כוללת קריאה אישית?",
    a: "קריאה אישית כוללת ניתוח מעמיק של מפת הלידה שלכם, פירוש כוכבי הלכת, הבתים האסטרולוגיים, ומסר אישי מותאם. בחבילות המורחבות תקבלו גם קריאת טארוט, התאמה זוגית וקריאת כף יד.",
  },
  {
    q: "האם החוויה מותאמת אישית?",
    a: "בהחלט. כל קריאה נבנית על סמך הפרטים האישיים שלכם — תאריך לידה, שעת לידה ומקום. אין שתי קריאות זהות.",
  },
  {
    q: "איך אסטרולוגיה, טארוט וקריאת כף יד עובדים יחד?",
    a: "כל תחום מיסטי מאיר זווית שונה של החיים. האסטרולוגיה חושפת את המבנה הקוסמי שלכם, הטארוט נותן תשובות לשאלות ספציפיות, וקריאת כף היד מגלה את הפוטנציאל הפנימי. יחד, הם יוצרים תמונה שלמה.",
  },
  {
    q: "איך אני מקבל/ת את הקריאה?",
    a: "הקריאה נשלחת אליכם כקובץ PDF מעוצב ואלגנטי ישירות לאימייל. בחבילת הנשמה המלאה תקבלו גם שיחת ייעוץ אישית.",
  },
  {
    q: "יש אפשרות חינמית?",
    a: "כן! אנחנו מציעים תובנה יומית לפי המזל, טעימה מהתאמה זוגית וקלף טארוט יומי — הכל בחינם וללא התחייבות.",
  },
];

const FAQSection = () => {
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
          שאלות נפוצות
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        <Accordion type="single" collapsible className="space-y-3">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="mystical-card px-6 border-none"
            >
              <AccordionTrigger className="font-body text-foreground/90 text-right hover:no-underline hover:text-gold transition-colors py-5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="font-body text-muted-foreground text-sm leading-relaxed pb-5 text-right">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
};

export default FAQSection;

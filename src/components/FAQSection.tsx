import { motion } from "framer-motion";
import { Sparkles, User, CreditCard, Hand, Clock, Layers } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    icon: User,
    q: "האם הניתוח באמת אישי?",
    a: "בהחלט. כל קריאה נבנית על סמך הפרטים האישיים שלכם — תאריך לידה, שעת לידה ומקום. המערכת מנתחת את המידע דרך מערכות סמליות שונות (אסטרולוגיה, טארוט, נומרולוגיה) ויוצרת פירוש ייחודי שמותאם אך ורק לכם. אין שתי קריאות זהות.",
  },
  {
    icon: CreditCard,
    q: "מה בחינם ומה בתשלום?",
    a: "חלק מהחוויות זמינות בחינם — כמו קלף טארוט יומי, תובנה לפי המזל ובדיקת התאמה בסיסית. קריאות מעמיקות יותר, דו״חות מפורטים וניתוחים מתקדמים (כמו מפת לידה מלאה או קריאת כף יד) עשויים להיות חלק מהחבילות הפרימיום.",
  },
  {
    icon: Hand,
    q: "איך קריאת כף יד עובדת?",
    a: "המשתמש מעלה תמונות של שתי כפות הידיים. המערכת מנתחת את הקווים הסמליים — קו החיים, קו הלב, קו הגורל וקו השכל — ומפיקה פירוש מפורט שמאיר את הפוטנציאל הפנימי, נטיות רגשיות ומאפייני אישיות.",
  },
  {
    icon: Clock,
    q: "האם חייבים לדעת את שעת הלידה?",
    a: "שעת הלידה נדרשת בעיקר לניתוח המזל העולה, שחושף את האופן שבו אחרים תופסים אתכם. שאר החוויות — אסטרולוגיה, טארוט, התאמה זוגית וקריאת כף יד — אינן דורשות שעת לידה ופועלות על סמך תאריך הלידה או אינטראקציה ישירה.",
  },
  {
    icon: Layers,
    q: "איך בחירת קלפי הטארוט מתבצעת?",
    a: "החפיסה נערבבת באופן אקראי בכל פעם מחדש, והקלפים הנבחרים נחשפים באופן דינמי במהלך החוויה. כל קלף מקבל פירוש ייחודי המותאם לשאלה, למיקום בפריסה ולהקשר האישי שלכם — מה שהופך כל קריאה לרגע ייחודי ובלתי חוזר.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-28 px-4 relative overflow-hidden cosmic-section-bg">
      {/* Cosmic accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-celestial/5 blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-crimson/4 blur-[90px]" />
      </div>

      <div className="section-divider max-w-xl mx-auto mb-20" />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-16 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-4 h-4 text-gold/50" />
          <span className="text-gold/40 font-body text-xs tracking-[0.15em]">
            ✦ שאלות ותשובות ✦
          </span>
          <Sparkles className="w-4 h-4 text-gold/50" />
        </div>
        <h2 className="font-heading text-3xl md:text-5xl gold-gradient-text mb-4">
          שאלות נפוצות
        </h2>
        <p className="text-muted-foreground font-body text-lg max-w-lg mx-auto">
          כל מה שרציתם לדעת על החוויה המיסטית
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto relative z-10"
      >
        <Accordion type="single" collapsible className="space-y-4">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="mystical-card px-6 md:px-8 border-none hover:mystical-glow transition-all duration-500"
            >
              <AccordionTrigger className="font-body text-foreground/90 text-right hover:no-underline hover:text-gold transition-colors py-6 gap-4">
                <div className="flex items-center gap-4 flex-1 text-right">
                <div className="icon-glow w-9 h-9 flex-shrink-0">
                    <item.icon className="w-4 h-4 text-gold/70" />
                  </div>
                  <span className="text-[15px]">{item.q}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="font-body text-muted-foreground text-sm leading-[1.9] pb-6 pr-[52px] text-right">
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

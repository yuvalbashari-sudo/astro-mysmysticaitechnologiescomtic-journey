import { motion } from "framer-motion";
import { Sparkles, User, CreditCard, Hand, Clock, Layers } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useT } from "@/i18n";

const FAQSection = () => {
  const t = useT();

  const faqItems = [
    { icon: User, q: t.faq_q1, a: t.faq_a1 },
    { icon: CreditCard, q: t.faq_q2, a: t.faq_a2 },
    { icon: Hand, q: t.faq_q3, a: t.faq_a3 },
    { icon: Clock, q: t.faq_q4, a: t.faq_a4 },
    { icon: Layers, q: t.faq_q5, a: t.faq_a5 },
  ];

  return (
    <section className="py-28 px-4 relative overflow-hidden cosmic-section-bg">
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
            {t.faq_label}
          </span>
          <Sparkles className="w-4 h-4 text-gold/50" />
        </div>
        <h2 className="font-heading text-3xl md:text-5xl gold-gradient-text mb-4">
          {t.faq_title}
        </h2>
        <p className="text-muted-foreground font-body text-lg max-w-lg mx-auto">
          {t.faq_subtitle}
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
              <AccordionTrigger className="font-body text-foreground/90 text-start hover:no-underline hover:text-gold transition-colors py-6 gap-4">
                <div className="flex items-center gap-4 flex-1 text-start">
                  <div className="icon-glow w-9 h-9 flex-shrink-0">
                    <item.icon className="w-4 h-4 text-gold/70" />
                  </div>
                  <span className="text-[15px]">{item.q}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="font-body text-muted-foreground text-sm leading-[1.9] pb-6 pe-[52px] text-start">
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

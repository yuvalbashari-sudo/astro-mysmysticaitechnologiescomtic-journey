import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

interface ChoiceCardsSectionProps {
  onOpenCompatibility: () => void;
  onOpenTarot: () => void;
}

const ChoiceCardsSection = ({ onOpenCompatibility, onOpenTarot }: ChoiceCardsSectionProps) => {
  return (
    <section
      className="relative py-20 md:py-28 px-4"
      style={{
        background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--deep-blue-light) / 0.3) 50%, hsl(var(--background)) 100%)",
      }}
    >
      {/* Section title */}
      <motion.div
        className="text-center mb-12 md:mb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2
          className="font-heading text-xl md:text-3xl lg:text-4xl font-bold"
          style={{
            color: "hsl(var(--foreground))",
            lineHeight: "1.2",
          }}
        >
          בחרו את הדרך שלכם לקבל תשובה
        </h2>
        <div
          className="mx-auto mt-4 h-[1px] w-24"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.4), transparent)",
          }}
        />
      </motion.div>

      {/* Cards */}
      <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Card 1 — Compatibility */}
        <motion.div
          className="group relative rounded-2xl overflow-hidden cursor-pointer"
          initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          onClick={onOpenCompatibility}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Glassmorphism background */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "linear-gradient(160deg, hsl(var(--deep-blue-light) / 0.6), hsl(var(--deep-blue) / 0.8))",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid hsl(var(--gold) / 0.12)",
              boxShadow: "0 8px 32px hsl(var(--deep-blue) / 0.5), inset 0 1px 0 hsl(var(--gold) / 0.08)",
            }}
          />
          {/* Hover glow */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              boxShadow: "0 0 40px hsl(340 70% 60% / 0.12), 0 12px 48px hsl(var(--deep-blue) / 0.6), inset 0 1px 0 hsl(var(--gold) / 0.15)",
              border: "1px solid hsl(var(--gold) / 0.22)",
            }}
          />
          {/* Top accent */}
          <div
            className="absolute top-0 left-[10%] right-[10%] h-[1px]"
            style={{ background: "linear-gradient(90deg, transparent, hsl(340 70% 60% / 0.4), transparent)" }}
          />

          <div className="relative px-6 py-8 md:px-8 md:py-10 flex flex-col items-center text-center gap-5">
            {/* Icon */}
            <motion.div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 56, height: 56,
                background: "radial-gradient(circle, hsl(340 70% 60% / 0.12), transparent 70%)",
                border: "1px solid hsl(340 70% 60% / 0.2)",
              }}
              animate={{
                boxShadow: [
                  "0 0 12px hsl(340 70% 60% / 0.08)",
                  "0 0 24px hsl(340 70% 60% / 0.18)",
                  "0 0 12px hsl(340 70% 60% / 0.08)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-6 h-6" style={{ color: "hsl(340, 70%, 60%)" }} />
            </motion.div>

            <h3
              className="font-heading text-lg md:text-xl font-bold"
              style={{ color: "hsl(var(--foreground))" }}
            >
              בדקו כמה אתם באמת מתאימים
            </h3>
            <p
              className="font-body text-sm md:text-base leading-relaxed max-w-xs"
              style={{ color: "hsl(var(--foreground) / 0.6)", textWrap: "pretty" }}
            >
              גלו משיכה, התאמה רגשית, פערים נסתרים ומה הסיכוי שזה יחזיק לאורך זמן.
            </p>

            {/* CTA */}
            <motion.span
              className="inline-flex items-center gap-2 rounded-xl font-heading text-sm tracking-wider px-7 py-3 font-bold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)), hsl(var(--gold-light)))",
                color: "hsl(var(--deep-blue))",
                boxShadow: "0 3px 16px hsl(var(--gold) / 0.25)",
              }}
              whileHover={{
                boxShadow: "0 5px 28px hsl(43 80% 55% / 0.4)",
              }}
            >
              בדוק התאמה
            </motion.span>
          </div>
        </motion.div>

        {/* Card 2 — Tarot */}
        <motion.div
          className="group relative rounded-2xl overflow-hidden cursor-pointer"
          initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={onOpenTarot}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Glassmorphism background */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "linear-gradient(160deg, hsl(var(--deep-blue-light) / 0.6), hsl(var(--deep-blue) / 0.8))",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid hsl(var(--gold) / 0.12)",
              boxShadow: "0 8px 32px hsl(var(--deep-blue) / 0.5), inset 0 1px 0 hsl(var(--gold) / 0.08)",
            }}
          />
          {/* Hover glow */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              boxShadow: "0 0 40px hsl(var(--gold) / 0.12), 0 12px 48px hsl(var(--deep-blue) / 0.6), inset 0 1px 0 hsl(var(--gold) / 0.15)",
              border: "1px solid hsl(var(--gold) / 0.22)",
            }}
          />
          {/* Top accent */}
          <div
            className="absolute top-0 left-[10%] right-[10%] h-[1px]"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.4), transparent)" }}
          />

          <div className="relative px-6 py-8 md:px-8 md:py-10 flex flex-col items-center text-center gap-5">
            {/* Icon */}
            <motion.div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 56, height: 56,
                background: "radial-gradient(circle, hsl(var(--gold) / 0.12), transparent 70%)",
                border: "1px solid hsl(var(--gold) / 0.2)",
              }}
              animate={{
                boxShadow: [
                  "0 0 12px hsl(var(--gold) / 0.08)",
                  "0 0 24px hsl(var(--gold) / 0.18)",
                  "0 0 12px hsl(var(--gold) / 0.08)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-6 h-6" style={{ color: "hsl(var(--gold))" }} />
            </motion.div>

            <h3
              className="font-heading text-lg md:text-xl font-bold"
              style={{ color: "hsl(var(--foreground))" }}
            >
              פתחו קלפים וקבלו מסר ברור
            </h3>
            <p
              className="font-body text-sm md:text-base leading-relaxed max-w-xs"
              style={{ color: "hsl(var(--foreground) / 0.6)", textWrap: "pretty" }}
            >
              שאלו שאלה על אהבה, קריירה או החלטה חשובה וקבלו קריאה אישית עם פירוש מדויק.
            </p>

            {/* CTA */}
            <motion.span
              className="inline-flex items-center gap-2 rounded-xl font-heading text-sm tracking-wider px-7 py-3 font-bold transition-all duration-300 backdrop-blur-md"
              style={{
                background: "hsl(var(--deep-blue) / 0.5)",
                border: "1.5px solid hsl(var(--gold) / 0.3)",
                color: "hsl(var(--gold))",
              }}
              whileHover={{
                borderColor: "hsl(var(--gold) / 0.6)",
                boxShadow: "0 0 24px hsl(43 80% 55% / 0.15)",
              }}
            >
              פתח טארוט
            </motion.span>
          </div>
        </motion.div>
      </div>

      {/* Decorative bottom divider */}
      <div
        className="mx-auto mt-16 md:mt-20 h-[1px] max-w-xl"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.2), transparent)",
        }}
      />
    </section>
  );
};

export default ChoiceCardsSection;

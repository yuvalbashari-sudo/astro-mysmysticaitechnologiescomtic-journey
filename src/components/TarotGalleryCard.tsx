import { motion } from "framer-motion";
import type { UnifiedTarotCard } from "@/data/allTarotCards";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  card: UnifiedTarotCard;
  index: number;
  onSelect: (card: UnifiedTarotCard) => void;
}


export default function TarotGalleryCard({ card, index, onSelect }: Props) {
  const { language } = useLanguage();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      className="group relative flex flex-col items-center"
    >
      <button
        onClick={() => onSelect(card)}
        className="w-full flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
        aria-label={card.name[language]}
      >
        {/* Card image container */}
        <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 ring-1 ring-border/30 transition-all duration-500 group-hover:ring-primary/50 group-hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.35)]">
          {/* Glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/10 via-transparent to-transparent z-10 pointer-events-none" />

          <img
            src={card.image}
            alt={card.name[language]}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />

          {/* Bottom veil */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent z-10 pointer-events-none" />
        </div>

        {/* Title */}
        <h3 className="text-sm md:text-base font-heading font-semibold text-foreground text-center leading-snug mb-1 transition-colors group-hover:text-primary">
          {card.name[language]}
        </h3>

        {/* Short meaning */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed mb-2 line-clamp-2 px-1">
          {card.shortMeaning[language]}
        </p>

        {/* CTA */}
        <span className="inline-flex items-center justify-center text-xs font-medium px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
          {card.ctaLabel[language]}
        </span>
      </button>
    </motion.div>
  );
}

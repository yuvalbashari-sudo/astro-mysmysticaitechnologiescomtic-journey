import { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { allTarotCards, filterBySuit, suitFilterLabels, getAvailableFilters, type TarotSuitFilter, type UnifiedTarotCard } from "@/data/allTarotCards";
import TarotGalleryCard from "@/components/TarotGalleryCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sectionTitle: Record<string, string> = {
  he: "קלפי טארוט",
  en: "Tarot Cards",
  ru: "Карты Таро",
  ar: "بطاقات التاروت",
};

const introText: Record<string, (count: number) => string> = {
  he: (count) => `גלו את ${count} קלפי הטארוט הזמינים בגלריה.`,
  en: (count) => `Explore the ${count} tarot cards available in the gallery.`,
  ru: (count) => `Изучите ${count} карт Таро, доступных в галерее.`,
  ar: (count) => `اكتشف ${count} من بطاقات التاروت المتاحة في المعرض.`,
};

export default function TarotGalleryPage() {
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const availableFilters = useMemo(() => getAvailableFilters(), []);
  const [activeFilter, setActiveFilter] = useState<TarotSuitFilter>("all");
  const [selectedCard, setSelectedCard] = useState<UnifiedTarotCard | null>(null);

  const cards = useMemo(() => filterBySuit(activeFilter), [activeFilter]);

  const handleSelect = useCallback((card: UnifiedTarotCard) => {
    setSelectedCard(card);
  }, []);

  return (
    <div dir={dir} className="min-h-screen bg-background relative overflow-y-auto">
      {/* Cosmic background accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === "he" ? "חזרה" : language === "ar" ? "رجوع" : language === "ru" ? "Назад" : "Back"}
        </button>

        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-3">
            {sectionTitle[language]}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            {introText[language](allTarotCards.length)}
          </p>
        </header>

        {/* Sticky filter bar */}
        <nav
          className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 -mx-4 px-4 py-3 mb-8 md:mb-10"
          role="tablist"
          aria-label="Filter cards"
        >
          <div className="flex gap-2 overflow-x-auto no-scrollbar justify-center">
            {availableFilters.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={activeFilter === f}
                onClick={() => setActiveFilter(f)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_16px_-4px_hsl(var(--primary)/0.5)]"
                    : "bg-muted/40 text-muted-foreground border-border/30 hover:bg-muted hover:text-foreground"
                }`}
              >
                {suitFilterLabels[f][language]}
              </button>
            ))}
          </div>
        </nav>

        {/* Card count */}
        <p className="text-center text-xs text-muted-foreground mb-6">
          {cards.length} {language === "he" ? "קלפים" : language === "ar" ? "بطاقة" : language === "ru" ? "карт" : "cards"}
        </p>

        {/* Cards grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {cards.map((card, i) => (
              <TarotGalleryCard
                key={card.id}
                card={card}
                index={i}
                onSelect={handleSelect}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Placeholder modal for card detail */}
      <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DialogContent className="bg-card border-border/50 max-w-md">
          {selectedCard && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl text-center text-foreground">
                  {selectedCard.name[language]}
                </DialogTitle>
                <DialogDescription className="text-center text-muted-foreground text-sm">
                  {selectedCard.shortMeaning[language]}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-4">
                <img
                  src={selectedCard.image}
                  alt={selectedCard.name[language]}
                  className="w-48 rounded-lg shadow-lg ring-1 ring-border/30"
                />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                {language === "he"
                  ? "דף הקלף המלא יתווסף בקרוב ✦"
                  : language === "ar"
                  ? "صفحة البطاقة الكاملة ستضاف قريباً ✦"
                  : language === "ru"
                  ? "Полная страница карты скоро появится ✦"
                  : "Full card page coming soon ✦"}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

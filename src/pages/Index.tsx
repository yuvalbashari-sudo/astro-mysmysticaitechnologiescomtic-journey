import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import MysticalDashboard from "@/components/MysticalDashboard";
import DailyRitualSection from "@/components/DailyRitualSection";
import MysticalTopBar from "@/components/MysticalTopBar";
import ReadingsHistoryModal from "@/components/ReadingsHistoryModal";
import FloatingOracleButton from "@/components/FloatingOracleButton";
import { useLanguage, useT } from "@/i18n";
import { readingsStorage } from "@/lib/readingsStorage";

const Index = () => {
  const { dir } = useLanguage();
  const t = useT();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    setHasHistory(readingsStorage.getAll().length > 0);
  }, [historyOpen]);

  return (
    <div className="min-h-screen relative" dir={dir}>
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-1/2 focus:-translate-x-1/2 focus:z-[100] focus:px-6 focus:py-3 focus:rounded-lg focus:bg-gold focus:text-primary-foreground focus:font-body focus:text-sm focus:font-bold focus:shadow-lg"
      >
        {t.a11y_skip_to_content}
      </a>
      <MysticalTopBar
        onOpenHistory={() => setHistoryOpen(true)}
        hasHistory={hasHistory}
      />
      {/* Hero fixed background — outside main to prevent scroll containment */}
      <HeroSection />
      <main id="main-content">
        <DailyRitualSection />
      </main>
      <MysticalDashboard />
      <ReadingsHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
      <FloatingOracleButton />
    </div>
  );
};

export default Index;

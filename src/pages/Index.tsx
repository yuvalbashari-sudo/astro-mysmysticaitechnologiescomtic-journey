import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import MysticalDashboard from "@/components/MysticalDashboard";
import DailyRitualSection from "@/components/DailyRitualSection";
import MysticalTopBar from "@/components/MysticalTopBar";
import ReadingsHistoryModal from "@/components/ReadingsHistoryModal";

import { useLanguage, useT } from "@/i18n";
import { readingsStorage } from "@/lib/readingsStorage";

const Index = () => {
  const { dir } = useLanguage();
  const t = useT();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    setHasHistory(readingsStorage.getAll().length > 0);
  }, [historyOpen]);

  return (
    <>
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-1/2 focus:-translate-x-1/2 focus:z-[100] focus:px-6 focus:py-3 focus:rounded-lg focus:bg-gold focus:text-primary-foreground focus:font-body focus:text-sm focus:font-bold focus:shadow-lg"
      >
        {t.a11y_skip_to_content}
      </a>

      <div className="relative min-h-screen" dir={dir}>
        <MysticalTopBar
          onOpenHistory={() => setHistoryOpen(true)}
          onOpenDashboard={() => setDashboardOpen(true)}
          hasHistory={hasHistory}
        />

        <HeroSection />

        <main id="main-content" className="relative" style={{ background: "hsl(var(--background))" }}>
          <DailyRitualSection />
        </main>

        <MysticalDashboard isOpen={dashboardOpen} onClose={() => setDashboardOpen(false)} />
      </div>

      <ReadingsHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  );
};

export default Index;

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
      {/* ── Layer 1: Fixed hero scene (portalled to document.body) ── */}
      <HeroSection />

      {/* ── Layer 2: Scrolling page content ── */}
      <div className="relative z-10 min-h-screen" dir={dir} style={{ background: "transparent" }}>
        {/* Skip to content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-1/2 focus:-translate-x-1/2 focus:z-[100] focus:px-6 focus:py-3 focus:rounded-lg focus:bg-gold focus:text-primary-foreground focus:font-body focus:text-sm focus:font-bold focus:shadow-lg"
        >
          {t.a11y_skip_to_content}
        </a>
        <MysticalTopBar
          onOpenHistory={() => setHistoryOpen(true)}
          onOpenDashboard={() => setDashboardOpen(true)}
          hasHistory={hasHistory}
        />
        {/* Spacer to push content below the hero viewport */}
        <div className="h-screen pointer-events-none" aria-hidden="true" />
        <main id="main-content" className="relative z-10">
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

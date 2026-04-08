import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import MysticalDashboard from "@/components/MysticalDashboard";
import MysticalTopBar from "@/components/MysticalTopBar";
import ReadingsHistoryModal from "@/components/ReadingsHistoryModal";
import SeoStructuredData from "@/components/SeoStructuredData";
import SeoContentSection from "@/components/SeoContentSection";

import { useLanguage, useT } from "@/i18n";
import { readingsStorage } from "@/lib/readingsStorage";

const Index = () => {
  const { dir } = useLanguage();
  const t = useT();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [cosmicGuideOpen, setCosmicGuideOpen] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    setHasHistory(readingsStorage.getAll().length > 0);
  }, [historyOpen]);

  return (
    <>
      <SeoStructuredData />
      <HeroSection cosmicGuideOpen={cosmicGuideOpen} onCosmicGuideChange={setCosmicGuideOpen} />

      <div className="relative z-10 md:h-screen md:overflow-hidden pointer-events-none" dir={dir} style={{ background: "transparent" }}>
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
        <div className="md:hidden pointer-events-none">
          <div style={{ height: "100dvh" }} aria-hidden="true" />
          <div className="pointer-events-auto">
            <SeoContentSection />
          </div>
        </div>
      </div>
      <MysticalDashboard isOpen={dashboardOpen} onClose={() => setDashboardOpen(false)} />

      <ReadingsHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  );
};

export default Index;

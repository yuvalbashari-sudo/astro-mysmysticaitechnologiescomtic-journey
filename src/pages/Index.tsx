import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import StarField from "@/components/StarField";
import MysticalDashboard from "@/components/MysticalDashboard";
import DailyRitualSection from "@/components/DailyRitualSection";
import MysticalTopBar from "@/components/MysticalTopBar";
import ReadingsHistoryModal from "@/components/ReadingsHistoryModal";
import FloatingOracleButton from "@/components/FloatingOracleButton";
import { useLanguage } from "@/i18n";
import { readingsStorage } from "@/lib/readingsStorage";

const Index = () => {
  const { dir } = useLanguage();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    setHasHistory(readingsStorage.getAll().length > 0);
  }, [historyOpen]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative" dir={dir}>
      <MysticalTopBar
        onOpenHistory={() => setHistoryOpen(true)}
        hasHistory={hasHistory}
      />
      <StarField />
      <HeroSection />
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

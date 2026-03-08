import { useState } from "react";
import HeroSection from "@/components/HeroSection";

import AboutSection from "@/components/AboutSection";
import LaunchBanner from "@/components/LaunchBanner";
import FreePremiumSection from "@/components/FreePremiumSection";
import LeadSection from "@/components/LeadSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import PricingSection from "@/components/PricingSection";
import FooterCTA from "@/components/FooterCTA";
import ReadingsHistory from "@/components/ReadingsHistory";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import LeadFormModal from "@/components/LeadFormModal";
import StarField from "@/components/StarField";
import MysticalDashboard from "@/components/MysticalDashboard";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/i18n";

const Index = () => {
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState("");
  const { dir } = useLanguage();

  const handleOrderClick = (interest: string) => {
    setSelectedInterest(interest);
    setLeadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative" dir={dir}>
      <LanguageSelector />
      <StarField />
      <HeroSection />
      <MysticalNav />
      <ReadingsHistory />
      <LaunchBanner />
      <AboutSection />
      <FreePremiumSection />
      <LeadSection />
      <TestimonialsSection />
      <PricingSection onOrderClick={handleOrderClick} />
      <FAQSection />
      <FooterCTA />
      <WhatsAppFloatingButton />
      <MysticalDashboard />
      <LeadFormModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        preselectedInterest={selectedInterest}
      />
    </div>
  );
};

export default Index;

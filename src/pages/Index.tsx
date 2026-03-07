import HeroSection from "@/components/HeroSection";
import MysticalNav from "@/components/MysticalNav";
import AboutSection from "@/components/AboutSection";
import FreePremiumSection from "@/components/FreePremiumSection";
import LeadSection from "@/components/LeadSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import FooterCTA from "@/components/FooterCTA";
import ReadingsHistory from "@/components/ReadingsHistory";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <HeroSection />
      <MysticalNav />
      <ReadingsHistory />
      <AboutSection />
      <FreePremiumSection />
      <LeadSection />
      <TestimonialsSection />
      <FAQSection />
      <FooterCTA />
    </div>
  );
};

export default Index;

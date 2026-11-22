import { useSyncExternalStore } from "react";
import { accountScope, profileRevision, subscribeAccount } from "./lib/accountName";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import ImmersiveTarotExperience from "./components/ImmersiveTarotExperience";
import { useHreflangTags } from "@/hooks/useHreflangTags";
import { LanguageProvider } from "@/i18n";
import { ReadingProvider } from "@/contexts/ReadingContext";
import { FontScaleProvider } from "@/contexts/FontScaleContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TarotCardPage from "./pages/TarotCardPage";
import ZodiacSignPage from "./pages/ZodiacSignPage";
import AccessibilityStatement from "./pages/AccessibilityStatement";
import TarotGalleryPage from "./pages/TarotGalleryPage";
import PremiumUpgrade from "./pages/PremiumUpgrade";
import MemberAccount from "./pages/MemberAccount";
import AdminCostAnalytics from "./pages/AdminCostAnalytics";
import Unsubscribe from "./pages/Unsubscribe";
import NatalTest from "./pages/NatalTest";

import TarotGuidePage from "./pages/TarotGuidePage";
import TarotGuidesPage from "./pages/TarotGuidesPage";
import AstrologyGuidesPage from "./pages/AstrologyGuidesPage";
import GuideDetailPage from "./pages/GuideDetailPage";
import FloatingOracleButton from "./components/FloatingOracleButton";
import WhatsAppFloatingButton from "./components/WhatsAppFloatingButton";
import AdminDebugBadge from "./components/AdminDebugBadge";
import MobileAccessibilityFab from "./components/MobileAccessibilityFab";
import GenderPromptModal from "./components/GenderPromptModal";

const queryClient = new QueryClient();

function TarotCampaign() {
  const navigate = useNavigate();
  return <ImmersiveTarotExperience campaign isOpen onClose={() => navigate("/")} />;
}

const RouteSeoTags = () => {
  useHreflangTags();
  return null;
};

const App = () => {
  const scope = useSyncExternalStore(subscribeAccount, accountScope);
  const revision = useSyncExternalStore(subscribeAccount, profileRevision);
  return (
    <QueryClientProvider key={scope + ":" + revision} client={queryClient}>
    <LanguageProvider>
      <ReadingProvider>
        <FontScaleProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <RouteSeoTags />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tarot-start" element={<TarotCampaign />} />
                <Route path="/rising-sign" element={<Index />} />
                <Route path="/daily-horoscope" element={<Index />} />
                <Route path="/tarot-reading" element={<Index />} />
                <Route path="/zodiac-compatibility" element={<Index />} />
                <Route path="/birth-chart" element={<Index />} />
                <Route path="/tarot-gallery" element={<TarotGalleryPage />} />
                <Route path="/tarot/:slug" element={<TarotCardPage />} />
                <Route path="/zodiac/:slug" element={<ZodiacSignPage />} />
                <Route path="/accessibility" element={<AccessibilityStatement />} />
                <Route path="/upgrade" element={<PremiumUpgrade />} />
                <Route path="/account" element={<MemberAccount />} />
                <Route path="/admin/costs" element={<AdminCostAnalytics />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/natal-test" element={<NatalTest />} />
                
                <Route path="/tarot-guide" element={<TarotGuidePage />} />
                <Route path="/tarot-guides" element={<TarotGuidesPage />} />
                <Route path="/astrology-guides" element={<AstrologyGuidesPage />} />
                <Route path="/guides/:slug" element={<GuideDetailPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <FloatingOracleButton />
              <WhatsAppFloatingButton />
              <MobileAccessibilityFab />
              <AdminDebugBadge />
              <GenderPromptModal />
            </BrowserRouter>
          </TooltipProvider>
        </FontScaleProvider>
      </ReadingProvider>
    </LanguageProvider>
  </QueryClientProvider>
  );
};

export default App;

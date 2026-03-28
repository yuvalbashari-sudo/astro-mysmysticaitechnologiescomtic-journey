import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AdminCostAnalytics from "./pages/AdminCostAnalytics";
import Unsubscribe from "./pages/Unsubscribe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ReadingProvider>
        <FontScaleProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tarot-gallery" element={<TarotGalleryPage />} />
                <Route path="/tarot/:slug" element={<TarotCardPage />} />
                <Route path="/zodiac/:slug" element={<ZodiacSignPage />} />
                <Route path="/accessibility" element={<AccessibilityStatement />} />
                <Route path="/upgrade" element={<PremiumUpgrade />} />
                <Route path="/admin/costs" element={<AdminCostAnalytics />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </FontScaleProvider>
      </ReadingProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

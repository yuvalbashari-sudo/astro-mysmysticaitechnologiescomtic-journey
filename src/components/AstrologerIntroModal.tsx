import { useState } from "react";
import CinematicModalShell from "@/components/CinematicModalShell";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import AdvisorChatPanel from "./AdvisorChatPanel";
import { useReadingContext } from "@/contexts/ReadingContext";

interface AstrologerIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AstrologerIntroModal = ({ isOpen, onClose }: AstrologerIntroModalProps) => {
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const { setActiveReading } = useReadingContext();

  const handleStart = () => {
    setActiveReading({
      type: "astrologer",
      label: "שיחה עם האסטרולוגית",
      summary: "קבלו הכוונה אישית מבוססת אסטרולוגיה ובינה מלאכותית",
    });
    onClose();
    setAdvisorOpen(true);
  };

  return (
    <>
      <CinematicModalShell isOpen={isOpen} onClose={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 md:p-12 text-center"
          dir="rtl"
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)",
              border: "1px solid hsl(var(--gold) / 0.2)",
            }}
            animate={{ boxShadow: ["0 0 20px hsl(43 80% 55% / 0.1)", "0 0 40px hsl(43 80% 55% / 0.2)", "0 0 20px hsl(43 80% 55% / 0.1)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-7 h-7 text-gold" />
          </motion.div>

          <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">
            שיחה עם האסטרולוגית
          </h2>
          <p className="text-foreground/70 font-body text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
            קבלו הכוונה אישית מבוססת אסטרולוגיה ובינה מלאכותית
          </p>

          <motion.button
            onClick={handleStart}
            className="btn-gold font-body flex items-center justify-center gap-2 mx-auto"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-4 h-4" />
            התחילו עכשיו
          </motion.button>
        </motion.div>
      </CinematicModalShell>

      <AdvisorChatPanel isOpen={advisorOpen} onClose={() => setAdvisorOpen(false)} />
    </>
  );
};

export default AstrologerIntroModal;

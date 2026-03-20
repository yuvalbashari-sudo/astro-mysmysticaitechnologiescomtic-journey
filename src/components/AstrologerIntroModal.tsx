import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent dir="rtl" className="max-w-md border-gold/20 bg-background p-6 sm:p-7">
          <DialogHeader className="space-y-3 text-right sm:text-right">
            <DialogTitle className="font-heading text-2xl text-foreground">
              שיחה עם האסטרולוגית
            </DialogTitle>
            <DialogDescription className="font-body text-base leading-relaxed text-muted-foreground">
              קבלו הכוונה אישית מבוססת אסטרולוגיה ובינה מלאכותית
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 gap-3 sm:flex-row-reverse sm:justify-start sm:space-x-0">
            <Button type="button" onClick={handleStart} className="w-full sm:w-auto">
              התחילו עכשיו
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              סגירה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdvisorChatPanel isOpen={advisorOpen} onClose={() => setAdvisorOpen(false)} />
    </>
  );
};

export default AstrologerIntroModal;

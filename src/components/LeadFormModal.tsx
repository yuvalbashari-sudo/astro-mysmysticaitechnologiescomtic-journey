import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preselectedInterest?: string;
}

const LeadFormModal = ({ isOpen, onClose, preselectedInterest }: Props) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    interest: preselectedInterest || "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast("אנא מלאו שם ואימייל");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        full_name: formData.name.trim().slice(0, 100),
        email: formData.email.trim().slice(0, 255),
        phone: formData.phone.trim().slice(0, 20) || null,
        interest: formData.interest || null,
        message: formData.message.trim().slice(0, 1000) || null,
      });
      if (error) throw error;
      setIsSubmitted(true);
      toast("הפרטים נשלחו בהצלחה! ✦");
    } catch {
      toast("שגיאה בשליחה, נסו שוב מאוחר יותר");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", phone: "", email: "", interest: preselectedInterest || "", message: "" });
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleClose} />
          <motion.div
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              background: "linear-gradient(145deg, hsl(222 40% 8% / 0.97), hsl(222 47% 6% / 0.98))",
              border: "1px solid hsl(var(--gold) / 0.2)",
              boxShadow: "0 0 60px hsl(var(--gold) / 0.1)",
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors"
              style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}
            >
              <X className="w-4 h-4 text-gold/70" />
            </button>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 text-center"
              >
                <CheckCircle className="w-16 h-16 text-gold mx-auto mb-6" />
                <h3 className="font-heading text-2xl text-gold mb-3">תודה רבה! ✦</h3>
                <p className="text-foreground/70 font-body leading-relaxed">
                  קיבלנו את הפרטים שלכם ונחזור אליכם בהקדם עם תובנות מיסטיות מותאמות אישית.
                </p>
                <button
                  onClick={handleClose}
                  className="btn-outline-gold font-body text-sm mt-8"
                >
                  סגירה
                </button>
              </motion.div>
            ) : (
              <div className="p-8 md:p-10">
                <div className="text-center mb-8">
                  <motion.div
                    className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center"
                    style={{
                      background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)",
                      border: "1px solid hsl(var(--gold) / 0.2)",
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-gold" />
                  </motion.div>
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">
                    התחילו את המסע שלכם
                  </h2>
                  <p className="text-foreground/60 font-body text-sm max-w-sm mx-auto leading-relaxed">
                    השאירו פרטים ונחזור אליכם עם קריאה מותאמת אישית
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gold/80 font-body mb-2 text-right">שם מלא *</label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      className="mystical-input font-body"
                      placeholder="הכניסו את שמכם"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gold/80 font-body mb-2 text-right">טלפון</label>
                    <input
                      type="tel"
                      maxLength={20}
                      className="mystical-input font-body"
                      placeholder="050-0000000"
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gold/80 font-body mb-2 text-right">אימייל *</label>
                    <input
                      type="email"
                      required
                      maxLength={255}
                      className="mystical-input font-body"
                      placeholder="your@email.com"
                      dir="ltr"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gold/80 font-body mb-2 text-right">מה מעניין אתכם?</label>
                    <select
                      className="mystical-input font-body"
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    >
                      <option value="">בחרו נושא...</option>
                      <option value="astrology">מפת הכוכבים האישית</option>
                      <option value="compatibility">קריאה זוגית עמוקה</option>
                      <option value="full">הקריאה המיסטית המלאה</option>
                      <option value="tarot">קריאת טארוט</option>
                      <option value="palm">קריאת כף יד</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gold/80 font-body mb-2 text-right">הודעה (אופציונלי)</label>
                    <textarea
                      maxLength={1000}
                      rows={3}
                      className="mystical-input font-body resize-none"
                      placeholder="ספרו לנו מה תרצו לדעת..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold font-body w-full flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "שולח..." : "שלחו פרטים"}
                  </button>

                  <p className="text-center text-[11px] text-muted-foreground font-body mt-3">
                    ✦ הפרטים שלכם שמורים ומאובטחים ✦
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeadFormModal;

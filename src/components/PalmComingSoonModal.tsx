import { useState } from "react";
import CinematicModalShell from "@/components/CinematicModalShell";
import { motion } from "framer-motion";
import { Hand, Sparkles, Bell, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useT } from "@/i18n/LanguageContext";
import { antiAbuse } from "@/lib/antiAbuse";

interface Props { isOpen: boolean; onClose: () => void; }

const PalmComingSoonModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const check = antiAbuse.fullCheck("lead_form");
    if (!check.allowed) { toast(t.lead_error_wait || "Please wait before trying again."); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        full_name: "Palm Waitlist",
        email: email.trim().slice(0, 255),
        interest: "palm",
        message: "Palm reading coming soon waitlist",
      });
      if (error) throw error;
      antiAbuse.recordSuccessfulAction("lead_form");
      setSubmitted(true);
    } catch {
      toast(t.lead_error_submit || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSubmitted(false); setEmail(""); }, 300);
  };

  return (
    <CinematicModalShell isOpen={isOpen} onClose={handleClose}>
      <div className="p-8 md:p-12 text-center max-w-md mx-auto">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-20 h-20 mx-auto mb-8"
        >
          <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{
            background: "radial-gradient(circle, hsl(var(--gold) / 0.2), transparent 70%)",
          }} />
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{ border: "1px solid hsl(var(--gold) / 0.3)", background: "hsl(var(--deep-blue-light) / 0.5)" }}>
            <Hand className="w-9 h-9 text-gold" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-gold animate-twinkle" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-heading text-2xl md:text-3xl gold-gradient-text mb-4"
        >
          {t.palm_coming_soon_title}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-foreground/70 font-body text-sm md:text-base leading-relaxed mb-8"
        >
          {t.palm_coming_soon_desc}
        </motion.p>

        {/* Waitlist / Got it */}
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
            <CheckCircle className="w-10 h-10 text-gold mx-auto" />
            <p className="text-gold font-body text-sm">{t.palm_coming_soon_subscribed}</p>
            <button onClick={handleClose} className="btn-outline-gold font-body text-sm mt-4">
              {t.lead_modal_close || "Close"}
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-4">
            <form onSubmit={handleNotify} className="flex gap-2">
              <input
                type="email"
                required
                maxLength={255}
                className="mystical-input font-body flex-1 text-center"
                placeholder={t.lead_email_placeholder || "your@email.com"}
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" disabled={submitting} className="btn-gold font-body text-sm whitespace-nowrap flex items-center gap-2 disabled:opacity-50">
                <Bell className="w-4 h-4" />
                {t.palm_coming_soon_notify}
              </button>
            </form>
            <button onClick={handleClose} className="btn-outline-gold font-body text-sm w-full">
              {t.palm_coming_soon_close || "Got it"}
            </button>
          </motion.div>
        )}
      </div>
    </CinematicModalShell>
  );
};

export default PalmComingSoonModal;

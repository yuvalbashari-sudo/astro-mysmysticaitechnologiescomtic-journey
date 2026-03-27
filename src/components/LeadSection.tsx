import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useT } from "@/i18n";
import { antiAbuse } from "@/lib/antiAbuse";

const LeadSection = () => {
  const t = useT();
  const [formData, setFormData] = useState({ name: "", birthDate: "", email: "", phone: "", interest: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const timingRef = useRef(antiAbuse.createTimingCheck(2000));

  useEffect(() => { timingRef.current.markStart(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-abuse checks
    const check = antiAbuse.fullCheck("lead_form", honeypot);
    if (!check.allowed) {
      if (check.reason === "honeypot") {
        // Silently pretend success for bots
        setIsSubmitted(true);
        return;
      }
      if (check.reason === "cooldown") {
        toast.error(t.lead_error_wait || "Please wait a moment before trying again");
        return;
      }
      if (check.reason === "rate_limit") {
        toast.error(t.lead_error_rate_limit || "Too many submissions. Please try again later.");
        return;
      }
      return;
    }

    // Timing check — bots submit too fast
    if (timingRef.current.isTooFast()) {
      setIsSubmitted(true); // fake success for bots
      return;
    }

    // Duplicate check
    const content = `${formData.name}|${formData.email}|${formData.message}`;
    if (antiAbuse.isDuplicateSubmission(content)) {
      toast.error(t.lead_error_duplicate || "This submission was already sent");
      return;
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error(t.lead_error_required);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        full_name: formData.name.trim().slice(0, 100),
        email: formData.email.trim().slice(0, 255),
        birth_date: formData.birthDate || null,
        phone: formData.phone.trim().slice(0, 20) || null,
        interest: formData.interest || null,
        message: formData.message.trim().slice(0, 1000) || null,
      });

      if (error) throw error;

      antiAbuse.recordSuccessfulAction("lead_form");
      setIsSubmitted(true);
      toast.success("✦");
    } catch {
      toast.error(t.lead_error_submit);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 px-4 relative cosmic-section-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-gold/4 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-56 h-56 rounded-full bg-celestial/5 blur-[100px]" />
      </div>
      <div className="section-divider max-w-xl mx-auto mb-20" />

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-4">
            {t.lead_title}
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            {t.lead_subtitle}
          </p>
        </motion.div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mystical-card p-12 text-center"
          >
            <CheckCircle className="w-16 h-16 text-gold mx-auto mb-6" />
            <h3 className="font-heading text-2xl text-gold mb-3">{t.lead_success_title}</h3>
            <p className="text-foreground/70 font-body">
              {t.lead_success_text}
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="mystical-card-elevated p-8 md:p-10 space-y-5"
          >
            <div>
              <label className="block text-sm text-gold/80 font-body mb-2">{t.lead_name}</label>
              <input
                type="text"
                required
                maxLength={100}
                className="mystical-input font-body"
                placeholder={t.lead_name_placeholder}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gold/80 font-body mb-2">{t.lead_birthdate}</label>
              <input
                type="date"
                className="mystical-input font-body"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                style={{
                  direction: "ltr",
                  colorScheme: "dark",
                  WebkitAppearance: "none",
                  minHeight: "48px",
                  opacity: 1,
                }}
              />
            </div>
            <div>
              <label className="block text-sm text-gold/80 font-body mb-2">{t.lead_phone}</label>
              <input
                type="tel"
                maxLength={20}
                className="mystical-input font-body"
                placeholder={t.lead_phone_placeholder}
                dir="ltr"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gold/80 font-body mb-2">{t.lead_email}</label>
              <input
                type="email"
                required
                maxLength={255}
                className="mystical-input font-body"
                placeholder={t.lead_email_placeholder}
                dir="ltr"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gold/80 font-body mb-2">{t.lead_interest}</label>
              <select
                className="mystical-input font-body"
                value={formData.interest}
                onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
              >
                <option value="">{t.lead_interest_placeholder}</option>
                <option value="astrology">{t.lead_interest_astrology}</option>
                <option value="compatibility">{t.lead_interest_compatibility}</option>
                <option value="tarot">{t.lead_interest_tarot}</option>
                <option value="palm">{t.lead_interest_palm}</option>
                <option value="full">{t.lead_interest_full}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gold/80 font-body mb-2">{t.lead_message}</label>
              <textarea
                maxLength={1000}
                rows={3}
                className="mystical-input font-body resize-none"
                placeholder={t.lead_message_placeholder}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            {/* Honeypot field — hidden from real users */}
            <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
              <label>Leave empty</label>
              <input
                type="text"
                name="website_url"
                autoComplete="off"
                tabIndex={-1}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold font-body w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? t.lead_submitting : t.lead_submit}
            </button>

            <p className="text-center text-xs text-muted-foreground font-body mt-4">
              {t.lead_secure}
            </p>
          </motion.form>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-muted-foreground font-body mb-3 text-sm">
            {t.lead_prefer_direct}
          </p>
          <a
            href="https://wa.me/972500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-outline-gold font-body"
          >
            {t.lead_whatsapp}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default LeadSection;

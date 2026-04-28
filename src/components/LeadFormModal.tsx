import { useState, useEffect, useRef } from "react";
import CinematicModalShell from "@/components/CinematicModalShell";
import TextSizeControl from "@/components/TextSizeControl";
import { useFontScale } from "@/contexts/FontScaleContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Send, CheckCircle, Sparkles, X } from "lucide-react";
import astrologerAvatar from "@/assets/astrologer-avatar-cta.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { antiAbuse } from "@/lib/antiAbuse";

interface Props { isOpen: boolean; onClose: () => void; preselectedInterest?: string; mode?: "lead" | "support"; }

// Localized copy for the support/contact variant. Inlined to avoid touching
// the global i18n type surface — only this modal renders these strings.
const SUPPORT_COPY: Record<string, { title: string; subtitle: string; messagePlaceholder: string; interestTag: string; messageLabel: string; successTitle: string; successMessage: string; closeLabel: string }> = {
  en: { title: "Contact Support", subtitle: "Send us your question and we'll get back to you by email.", messagePlaceholder: "How can we help?", interestTag: "Support request", messageLabel: "Message", successTitle: "Thank you!", successMessage: "We received your message and will get back to you by email as soon as possible.", closeLabel: "Close" },
  he: { title: "פנייה לתמיכה", subtitle: "שלחו לנו את שאלתכם ונחזור אליכם במייל.", messagePlaceholder: "איך נוכל לעזור?", interestTag: "פנייה לתמיכה", messageLabel: "הודעה", successTitle: "תודה רבה!", successMessage: "קיבלנו את הפנייה שלך ונחזור אליך בהקדם במייל.", closeLabel: "סגירה" },
  ru: { title: "Связаться с поддержкой", subtitle: "Отправьте нам свой вопрос, и мы ответим по электронной почте.", messagePlaceholder: "Чем мы можем помочь?", interestTag: "Запрос в поддержку", messageLabel: "Сообщение", successTitle: "Спасибо!", successMessage: "Мы получили ваше сообщение и ответим вам по электронной почте как можно скорее.", closeLabel: "Закрыть" },
  ar: { title: "التواصل مع الدعم", subtitle: "أرسل لنا سؤالك وسنعود إليك عبر البريد الإلكتروني.", messagePlaceholder: "كيف يمكننا المساعدة؟", interestTag: "طلب دعم", messageLabel: "رسالتك", successTitle: "شكرًا لك!", successMessage: "لقد استلمنا رسالتك وسنرد عليك عبر البريد الإلكتروني في أقرب وقت ممكن.", closeLabel: "إغلاق" },
};

const LeadFormModal = ({ isOpen, onClose, preselectedInterest, mode = "lead" }: Props) => {
  const t = useT();
  const { language } = useLanguage();
  const { scale, setScale } = useFontScale();
  const isMobile = useIsMobile();
  const isSupport = mode === "support";
  const supportCopy = SUPPORT_COPY[language] || SUPPORT_COPY.en;
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", interest: preselectedInterest || "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const timingRef = useRef(antiAbuse.createTimingCheck(2000));

  useEffect(() => { timingRef.current.markStart(); }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const check = antiAbuse.fullCheck("lead_form", honeypot);
    if (!check.allowed) {
      if (check.reason === "honeypot") { setIsSubmitted(true); return; }
      if (check.reason === "cooldown") { toast(t.lead_error_wait); return; }
      if (check.reason === "rate_limit") { toast(t.lead_error_rate_limit); return; }
      return;
    }
    if (timingRef.current.isTooFast()) { setIsSubmitted(true); return; }

    const content = `${formData.name}|${formData.email}|${formData.message}`;
    if (antiAbuse.isDuplicateSubmission(content)) { toast(t.lead_error_duplicate); return; }

    if (!formData.name.trim() || !formData.email.trim()) { toast(t.lead_error_required); return; }
    setIsSubmitting(true);
    try {
      const interestValue = isSupport ? "support" : (formData.interest || null);
      const { error } = await supabase.from("leads").insert({ full_name: formData.name.trim().slice(0, 100), email: formData.email.trim().slice(0, 255), phone: isSupport ? null : (formData.phone.trim().slice(0, 20) || null), interest: interestValue, message: formData.message.trim().slice(0, 1000) || null });
      if (error) throw error;
      antiAbuse.recordSuccessfulAction("lead_form");
      setIsSubmitted(true); toast(`${t.lead_success_title}`);

      const submissionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const submittedAt = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

      // Send confirmation email to the user
      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'contact-confirmation',
          recipientEmail: formData.email.trim(),
          idempotencyKey: `contact-confirm-${submissionId}`,
          templateData: { name: formData.name.trim() },
        },
      }).catch(() => { /* non-critical */ });

      // Notify support of the new lead
      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'support-new-lead',
          recipientEmail: 'support@myastrologai.com',
          idempotencyKey: `support-new-lead-${submissionId}`,
          templateData: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: isSupport ? '' : (formData.phone.trim() || ''),
            interest: isSupport ? supportCopy.interestTag : (formData.interest || ''),
            message: formData.message.trim() || '',
            submittedAt,
          },
        },
      }).catch(() => { /* non-critical */ });
    } catch { toast(t.lead_error_submit); } finally { setIsSubmitting(false); }
  };

  const handleClose = () => { onClose(); setTimeout(() => { setIsSubmitted(false); setFormData({ name: "", phone: "", email: "", interest: preselectedInterest || "", message: "" }); }, 300); };

  // For the support modal we lower the advisor avatar on mobile so it visually
  // clears the "Free" badge / title strip area, and we expose A/A+/A++ text
  // size controls just under the close button (matching the wider site UX).
  // Push the avatar 24px lower on mobile so it sits well below the top-right
  // "Free" badge area and never overlaps the badge, logo, title, or text controls.
  // Default mobile position is { bottom: 16 }; we shift down by 24px → bottom: -8.
  const supportAvatarStyle: React.CSSProperties | undefined = isSupport && isMobile
    ? { top: 68, right: 12, bottom: "auto", left: "auto", width: 64, height: 64 }
    : undefined;

  const isDesktopSupport = isSupport && !isMobile;
  const [advisorOpen, setAdvisorOpen] = useState(false);

  return (
    <CinematicModalShell
      isOpen={isOpen}
      onClose={handleClose}
      avatarStyle={supportAvatarStyle}
      hideAdvisor={isDesktopSupport}
      hideClose={isDesktopSupport}
      hideFreeBadge={isDesktopSupport}
    >
      {isSupport && !isDesktopSupport && (
        <div
          className="fixed z-[106] flex flex-col items-center gap-1 pointer-events-auto"
          style={{ top: 68, left: 12 }}
          aria-label="Text size controls"
        >
          <TextSizeControl value={scale} onChange={setScale} />
        </div>
      )}
      {isDesktopSupport ? (
        <div className="relative mx-auto w-full max-w-[520px]">
          {/* Framed glass panel */}
          <div
            className="relative rounded-2xl backdrop-blur-xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(var(--deep-blue) / 0.78), hsl(var(--deep-blue) / 0.92))",
              border: "1px solid hsl(var(--gold) / 0.22)",
              boxShadow: "0 30px 80px -20px hsl(0 0% 0% / 0.6), 0 0 0 1px hsl(var(--gold) / 0.05), 0 0 60px hsl(var(--gold) / 0.08)",
            }}
          >
            {/* Integrated header — anchored to the panel */}
            <div className="relative h-[88px] px-5 pt-4 border-b" style={{ borderColor: "hsl(var(--gold) / 0.12)" }}>
              {/* Left cluster: close + text size */}
              <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                <button
                  onClick={handleClose}
                  aria-label="Close"
                  className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                  style={{
                    background: "hsl(var(--deep-blue) / 0.65)",
                    border: "1px solid hsl(var(--gold) / 0.25)",
                  }}
                >
                  <X className="w-5 h-5 text-gold/80" />
                </button>
              </div>
              {/* Right cluster: free badge + avatar */}
              <div className="absolute top-4 right-4 flex items-center gap-3">
                <span
                  className="px-4 py-1.5 rounded-full text-sm font-bold font-body tracking-wider"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--gold) / 0.18), hsl(var(--gold) / 0.08))",
                    border: "1px solid hsl(var(--gold) / 0.25)",
                    color: "hsl(var(--gold))",
                  }}
                >
                  {t.free_badge_label}
                </span>
                <button
                  onClick={() => setAdvisorOpen(true)}
                  aria-label={t.astrologer_aria_label}
                  className="w-12 h-12 rounded-full overflow-hidden cursor-pointer"
                  style={{
                    boxShadow: "0 4px 18px hsl(270 60% 45% / 0.3), 0 0 22px hsl(200 70% 50% / 0.12), 0 0 6px hsl(var(--gold) / 0.2)",
                    border: "2px solid hsl(var(--gold) / 0.35)",
                  }}
                >
                  <img
                    src={astrologerAvatar}
                    alt={t.astrologer_chat_title}
                    className="w-full h-full object-cover scale-105"
                    style={{ objectPosition: "center 42%" }}
                    draggable={false}
                  />
                </button>
              </div>
              {/* Text size controls under close button */}
              <div className="absolute top-[60px] left-4">
                <TextSizeControl value={scale} onChange={setScale} />
              </div>
            </div>

            {/* Body */}
            {isSubmitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-10 py-12 text-center">
                <CheckCircle className="w-14 h-14 text-gold mx-auto mb-5" />
                <h3 className="font-heading text-2xl text-gold mb-3">{supportCopy.successTitle}</h3>
                <p className="text-foreground/70 font-body leading-relaxed">{supportCopy.successMessage}</p>
                <button onClick={handleClose} className="btn-outline-gold font-body text-sm mt-7">{supportCopy.closeLabel}</button>
              </motion.div>
            ) : (
              <div className="px-8 pt-6 pb-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
                    <Sparkles className="w-5 h-5 text-gold" />
                  </div>
                  <h2 className="font-heading text-2xl gold-gradient-text mb-2">{supportCopy.title}</h2>
                  <p className="text-foreground/65 font-body text-sm max-w-sm mx-auto leading-relaxed">{supportCopy.subtitle}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gold/80 font-body mb-2">{t.lead_name} *</label>
                    <input type="text" required maxLength={100} className="mystical-input font-body" placeholder={t.lead_name_placeholder} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gold/80 font-body mb-2">{t.lead_email} *</label>
                    <input type="email" required maxLength={255} className="mystical-input font-body" placeholder={t.lead_email_placeholder} dir="ltr" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gold/80 font-body mb-2">{supportCopy.messageLabel} *</label>
                    <textarea required maxLength={1000} rows={5} className="mystical-input font-body resize-none" placeholder={supportCopy.messagePlaceholder} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  </div>
                  <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                    <input type="text" name="website_url" autoComplete="off" tabIndex={-1} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-gold font-body w-full flex items-center justify-center gap-2 disabled:opacity-50 mt-5">
                    <Send className="w-4 h-4" />{isSubmitting ? t.lead_submitting : t.lead_submit}
                  </button>
                  <p className="text-center text-[11px] text-muted-foreground font-body mt-2">{t.lead_secure}</p>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-gold mx-auto mb-6" />
                <h3 className="font-heading text-2xl text-gold mb-3">{isSupport ? supportCopy.successTitle : t.lead_success_title}</h3>
                <p className="text-foreground/70 font-body leading-relaxed">{isSupport ? supportCopy.successMessage : t.lead_success_text}</p>
                <button onClick={handleClose} className="btn-outline-gold font-body text-sm mt-8">{isSupport ? supportCopy.closeLabel : t.lead_modal_close}</button>
              </motion.div>
            ) : (
              <div className="p-8 md:p-10">
                <div className="text-center mb-8">
                  <motion.div className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}><Sparkles className="w-6 h-6 text-gold" /></motion.div>
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">{isSupport ? supportCopy.title : t.lead_modal_title}</h2>
                  <p className="text-foreground/60 font-body text-sm max-w-sm mx-auto leading-relaxed">{isSupport ? supportCopy.subtitle : t.lead_modal_subtitle}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gold/80 font-body mb-2">{t.lead_name} *</label>
                    <input type="text" required maxLength={100} className="mystical-input font-body" placeholder={t.lead_name_placeholder} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  {!isSupport && (
                    <div>
                      <label className="block text-sm text-gold/80 font-body mb-2">{t.lead_phone}</label>
                      <input type="tel" maxLength={20} className="mystical-input font-body" placeholder={t.lead_phone_placeholder} dir="ltr" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm text-gold/80 font-body mb-2">{t.lead_email} *</label>
                    <input type="email" required maxLength={255} className="mystical-input font-body" placeholder={t.lead_email_placeholder} dir="ltr" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  {!isSupport && (
                    <div>
                      <label className="block text-sm text-gold/80 font-body mb-2">{t.lead_interest}</label>
                      <select className="mystical-input font-body" value={formData.interest} onChange={(e) => setFormData({ ...formData, interest: e.target.value })}>
                        <option value="">{t.lead_interest_placeholder}</option>
                        <option value="astrology">{t.lead_modal_interest_personal}</option>
                        <option value="compatibility">{t.lead_modal_interest_couple}</option>
                        <option value="full">{t.lead_modal_interest_full}</option>
                        <option value="tarot">{t.lead_modal_interest_tarot}</option>
                        <option value="palm">{t.lead_modal_interest_palm}</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm text-gold/80 font-body mb-2">{isSupport ? `${supportCopy.messageLabel} *` : t.lead_message}</label>
                    <textarea required={isSupport} maxLength={1000} rows={isSupport ? 5 : 3} className="mystical-input font-body resize-none" placeholder={isSupport ? supportCopy.messagePlaceholder : t.lead_message_placeholder} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  </div>
                  {/* Honeypot */}
                  <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                    <input type="text" name="website_url" autoComplete="off" tabIndex={-1} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-gold font-body w-full flex items-center justify-center gap-2 disabled:opacity-50 mt-6"><Send className="w-4 h-4" />{isSubmitting ? t.lead_submitting : t.lead_submit}</button>
                  <p className="text-center text-[11px] text-muted-foreground font-body mt-3">{t.lead_secure}</p>
                </form>
              </div>
            )}
    </CinematicModalShell>
  );
};

export default LeadFormModal;
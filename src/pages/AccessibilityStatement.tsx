import { useT, useLanguage } from "@/i18n";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const AccessibilityStatement = () => {
  const t = useT();
  const { dir, isRTL } = useLanguage();
  const navigate = useNavigate();

  const goHome = () => navigate("/");

  const features = [
    t.a11y_statement_feature_keyboard,
    t.a11y_statement_feature_focus,
    t.a11y_statement_feature_contrast,
    t.a11y_statement_feature_screen_reader,
    t.a11y_statement_feature_rtl,
    t.a11y_statement_feature_motion,
    t.a11y_statement_feature_multilingual,
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
      dir={dir}
    >
      {/* Sticky top bar with close + back */}
      <div className="sticky top-0 z-50 backdrop-blur-md border-b border-border/40"
        style={{ background: "hsl(var(--background) / 0.85)" }}
      >
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={goHome}
            className="flex items-center gap-2 text-sm font-body transition-colors cursor-pointer"
            style={{ color: "hsl(var(--gold) / 0.7)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "hsl(var(--gold))")}
            onMouseLeave={e => (e.currentTarget.style.color = "hsl(var(--gold) / 0.7)")}
          >
            <ArrowRight className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
            חזרה למסך הראשי
          </button>
          <button
            onClick={goHome}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer"
            style={{
              background: "hsl(var(--muted) / 0.6)",
              border: "1px solid hsl(var(--gold) / 0.15)",
              color: "hsl(var(--gold) / 0.7)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "hsl(var(--muted) / 0.9)";
              e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.3)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "hsl(var(--muted) / 0.6)";
              e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.15)";
            }}
            aria-label={t.a11y_close_modal}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <main id="main-content" className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-heading text-7xl md:text-8xl gold-gradient-text mb-10 leading-tight">
          {t.a11y_statement_title}
        </h1>

        <div className="space-y-10 font-body text-foreground/80" style={{ fontSize: "1.875rem", lineHeight: "2.8rem" }}>
          {t.a11y_statement_intro.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}

          {t.a11y_statement_standards && (
            <p className="text-gold/70" style={{ fontSize: "1.5rem", lineHeight: "2.2rem" }}>{t.a11y_statement_standards}</p>
          )}

          <section>
            <h2 className="font-heading text-gold mb-6" style={{ fontSize: "2.5rem", lineHeight: "3rem" }}>
              {t.a11y_statement_features_title}
            </h2>
            <ul className="space-y-4" role="list">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-gold/60 mt-1" aria-hidden="true">✦</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-gold mb-6" style={{ fontSize: "2.5rem", lineHeight: "3rem" }}>
              {t.a11y_statement_contact_title}
            </h2>
            <p>{t.a11y_statement_contact_text}</p>
            <a
              href="https://wa.me/972500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-gold hover:text-gold-light transition-colors"
              style={{ fontSize: "1.5rem" }}
              aria-label={t.a11y_whatsapp_contact}
            >
              💬 WhatsApp
            </a>
          </section>

          {t.a11y_statement_last_updated && (
            <p className="text-muted-foreground pt-8 border-t border-border" style={{ fontSize: "1.25rem", lineHeight: "1.8rem" }}>
              {t.a11y_statement_last_updated}
            </p>
          )}
        </div>
      </main>
    </motion.div>
  );
};

export default AccessibilityStatement;

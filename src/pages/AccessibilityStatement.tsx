import { useT, useLanguage } from "@/i18n";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const AccessibilityStatement = () => {
  const t = useT();
  const { dir, isRTL } = useLanguage();

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
    <div className="min-h-screen bg-background" dir={dir}>
      <main id="main-content" className="max-w-2xl mx-auto px-6 py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gold/70 hover:text-gold transition-colors font-body mb-10"
        >
          <ArrowRight className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
          ASTROLOGAI
        </Link>

        <h1 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-8">
          {t.a11y_statement_title}
        </h1>

        <div className="space-y-8 font-body text-foreground/80 leading-relaxed">
          {t.a11y_statement_intro.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}

          {t.a11y_statement_standards && (
            <p className="text-gold/70 text-sm">{t.a11y_statement_standards}</p>
          )}

          <section>
            <h2 className="font-heading text-xl text-gold mb-4">
              {t.a11y_statement_features_title}
            </h2>
            <ul className="space-y-3" role="list">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-gold/60 mt-1" aria-hidden="true">✦</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl text-gold mb-4">
              {t.a11y_statement_contact_title}
            </h2>
            <p>{t.a11y_statement_contact_text}</p>
            <a
              href="https://wa.me/972500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-gold hover:text-gold-light transition-colors"
              aria-label={t.a11y_whatsapp_contact}
            >
              💬 WhatsApp
            </a>
          </section>

          {t.a11y_statement_last_updated && (
            <p className="text-xs text-muted-foreground pt-6 border-t border-border">
              {t.a11y_statement_last_updated}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AccessibilityStatement;

import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { useT } from "@/i18n";
import { Link } from "react-router-dom";

const FooterCTA = () => {
  const t = useT();

  return (
    <footer className="py-24 px-4 relative cosmic-section-bg overflow-hidden" aria-label={t.a11y_footer_section}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/4 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-crimson/5 blur-[100px]" />
      </div>
      <div className="section-divider max-w-xl mx-auto mb-20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="font-heading text-3xl md:text-5xl gold-gradient-text mb-6">
          {t.footer_title}
        </h2>
        <p className="text-foreground/70 font-body text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          {t.footer_subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <a href="#free" className="btn-gold font-body flex items-center gap-2">
            <Star className="w-4 h-4" aria-hidden="true" />
            {t.footer_cta_free}
          </a>
          <a href="#premium" className="btn-crimson font-body flex items-center gap-2">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            {t.footer_cta_premium}
          </a>
        </div>

        <a
          href="https://wa.me/972500000000"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gold/70 hover:text-gold transition-colors font-body"
          aria-label={t.a11y_whatsapp_contact}
        >
          {t.footer_whatsapp}
        </a>
      </motion.div>

      <div className="mt-24 pt-8 text-center">
        <div className="section-divider max-w-xs mx-auto mb-8" />
        <p className="font-heading text-xl gold-gradient-text mb-2">ASTROLOGAI</p>
        <p className="text-xs text-muted-foreground font-body mb-4">
          {t.footer_copyright}
        </p>
        <Link
          to="/accessibility"
          className="text-xs text-gold/50 hover:text-gold/80 transition-colors font-body"
        >
          {t.a11y_link_label}
        </Link>
      </div>
    </footer>
  );
};

export default FooterCTA;

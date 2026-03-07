import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";

const FooterCTA = () => {
  return (
    <section className="py-24 px-4 relative cosmic-section-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
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
          הכוכבים מחכים לכם
        </h2>
        <p className="text-foreground/70 font-body text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          כל רגע הוא הזדמנות לגלות משהו חדש על עצמכם. התחילו את המסע הרוחני שלכם עוד היום.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <a href="#free" className="btn-gold font-body flex items-center gap-2">
            <Star className="w-4 h-4" />
            התחילו בחינם
          </a>
          <a href="#premium" className="btn-crimson font-body flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            הזמינו קריאה פרימיום
          </a>
        </div>

        <a
          href="https://wa.me/972500000000"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gold/70 hover:text-gold transition-colors font-body"
        >
          💬 דברו איתנו בוואטסאפ
        </a>
      </motion.div>

      {/* Footer */}
      <div className="mt-24 pt-8 text-center">
        <div className="section-divider max-w-xs mx-auto mb-8" />
        <p className="font-heading text-xl gold-gradient-text mb-2">ASTROLOGAI</p>
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()} ASTROLOGAI — כל הזכויות שמורות
        </p>
      </div>
    </section>
  );
};

export default FooterCTA;

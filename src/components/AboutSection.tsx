import { motion } from "framer-motion";
import { Star, Sun, Moon, Heart, Hand, Sparkles } from "lucide-react";
import { useT } from "@/i18n";

const AboutSection = () => {
  const t = useT();

  const disciplines = [
    { icon: Sun, title: t.about_astrology_title, desc: t.about_astrology_desc },
    { icon: Moon, title: t.about_rising_title, desc: t.about_rising_desc },
    { icon: Heart, title: t.about_compatibility_title, desc: t.about_compatibility_desc },
    { icon: Star, title: t.about_tarot_title, desc: t.about_tarot_desc },
    { icon: Hand, title: t.about_palm_title, desc: t.about_palm_desc },
  ];

  return (
    <section className="py-28 px-4 relative overflow-hidden cosmic-section-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-gold/5 blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full bg-celestial/10 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-crimson/3 blur-[120px]" />
      </div>

      <div className="section-divider max-w-xl mx-auto mb-20" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-gold/60" />
            <span className="text-gold/50 font-body text-sm tracking-widest">
              {t.about_discover}
            </span>
            <Sparkles className="w-5 h-5 text-gold/60" />
          </div>
          <h2 className="font-heading text-3xl md:text-5xl gold-gradient-text mb-6">
            {t.about_title}
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-center text-foreground/75 font-body text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-6"
        >
          {t.about_desc}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="text-center text-gold/50 font-body text-sm italic mb-16"
        >
          {t.about_five_gates}
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {disciplines.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group mystical-card p-7 md:p-8 text-center hover:mystical-glow-intense transition-all duration-500 cursor-default"
            >
              <div className="icon-glow w-14 h-14 mx-auto mb-5">
                <d.icon className="w-6 h-6 text-gold group-hover:text-gold-light transition-colors duration-500" />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-3 group-hover:text-gold transition-colors duration-500">{d.title}</h3>
              <p className="font-body text-sm text-foreground/65 leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

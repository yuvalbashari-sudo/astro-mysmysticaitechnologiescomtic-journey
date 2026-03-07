import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";

const LeadSection = () => {
  const [formData, setFormData] = useState({ name: "", birthDate: "", email: "", interest: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // placeholder
    alert("תודה! נחזור אליכם בהקדם ✦");
  };

  return (
    <section className="py-24 px-4 relative">
      <div className="section-divider max-w-xl mx-auto mb-20" />

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text mb-4">
            התחילו את המסע שלכם
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            השאירו פרטים ונתחיל לפענח את המפה הקוסמית שלכם
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="mystical-card p-8 md:p-10 space-y-5"
        >
          <div>
            <label className="block text-sm text-gold/80 font-body mb-2">שם מלא</label>
            <input
              type="text"
              className="mystical-input font-body"
              placeholder="הכניסו את שמכם"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gold/80 font-body mb-2">תאריך לידה</label>
            <input
              type="date"
              className="mystical-input font-body"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gold/80 font-body mb-2">אימייל</label>
            <input
              type="email"
              className="mystical-input font-body"
              placeholder="your@email.com"
              dir="ltr"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gold/80 font-body mb-2">מה מעניין אתכם?</label>
            <select
              className="mystical-input font-body"
              value={formData.interest}
              onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
            >
              <option value="">בחרו נושא...</option>
              <option value="astrology">מפת לידה אסטרולוגית</option>
              <option value="compatibility">התאמה זוגית</option>
              <option value="tarot">קריאה בטארוט</option>
              <option value="palm">קריאת כף יד</option>
              <option value="full">חבילה מלאה</option>
            </select>
          </div>

          <button type="submit" className="btn-gold font-body w-full flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            שלחו פרטים
          </button>

          <p className="text-center text-xs text-muted-foreground font-body mt-4">
            ✦ הפרטים שלכם שמורים ומאובטחים ✦
          </p>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-muted-foreground font-body mb-3 text-sm">
            מעדיפים לדבר ישירות?
          </p>
          <a
            href="https://wa.me/972500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-outline-gold font-body"
          >
            💬 דברו איתנו בוואטסאפ
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default LeadSection;

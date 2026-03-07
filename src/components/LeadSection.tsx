import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LeadSection = () => {
  const [formData, setFormData] = useState({ name: "", birthDate: "", email: "", phone: "", interest: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("אנא מלאו שם ואימייל");
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

      setIsSubmitted(true);
      toast.success("הפרטים נשלחו בהצלחה! ✦");
    } catch {
      toast.error("שגיאה בשליחה, נסו שוב מאוחר יותר");
    } finally {
      setIsSubmitting(false);
    }
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

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mystical-card p-12 text-center"
          >
            <CheckCircle className="w-16 h-16 text-gold mx-auto mb-6" />
            <h3 className="font-heading text-2xl text-gold mb-3">תודה רבה! ✦</h3>
            <p className="text-foreground/70 font-body">
              קיבלנו את הפרטים שלכם ונחזור אליכם בהקדם עם תובנות מיסטיות מותאמות אישית.
            </p>
          </motion.div>
        ) : (
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
                required
                maxLength={100}
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
              <label className="block text-sm text-gold/80 font-body mb-2">טלפון</label>
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
              <label className="block text-sm text-gold/80 font-body mb-2">אימייל</label>
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
            <div>
              <label className="block text-sm text-gold/80 font-body mb-2">הודעה (אופציונלי)</label>
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
              className="btn-gold font-body w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "שולח..." : "שלחו פרטים"}
            </button>

            <p className="text-center text-xs text-muted-foreground font-body mt-4">
              ✦ הפרטים שלכם שמורים ומאובטחים ✦
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

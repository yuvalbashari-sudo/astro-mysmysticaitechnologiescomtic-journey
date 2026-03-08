import { motion } from "framer-motion";
import { Quote, Star, Sparkles } from "lucide-react";
import { useT, useLanguage } from "@/i18n";

const TestimonialsSection = () => {
  const t = useT();
  const { language } = useLanguage();

  // Testimonials are locale-specific content; we keep them per-language
  const testimonials = language === "he" ? [
    { name: "מיכל כ.", text: "קיבלתי קריאה אישית שפשוט הדהימה אותי. ההתאמה הזוגית חשפה דברים שלא ידעתי על עצמי ועל הזוגיות שלי — הרגשתי שמيشהו באמת מבין אותי.", tag: "התאמה זוגית" },
    { name: "אורי ש.", text: "הטארוט נתן לי את התשובה שחיפשתי. הכל היה כתוב בצורה כל כך אלגנטית ורגישה — כל קלף הרגיש כמו מסר אישי מהיקום.", tag: "קריאת טארוט" },
    { name: "נועה ד.", text: "מפת הלידה שלי הייתה מדהימה. כל כוכב, כל בית אסטרולוגי — הכל התחבר לתמונה אחת ברורה. גיליתי צדדים בעצמי שלא הכרתי.", tag: "אסטרולוגיה" },
    { name: "דניאל מ.", text: "קריאת כף היד הפתיעה אותי. העליתי תמונות של שתי הידיים וקיבלתי ניתוח מפורט שהרגיש אמיתי, רגיש ומדויק להפליא.", tag: "קריאת כף יד" },
    { name: "שירה ל.", text: "ניתוח המזל העולה שלי פתח לי חלון לדרך שבה אחרים רואים אותי. זו הייתה חוויה רגשית ומרגשת — ממליצה לכל מי שמחפש הבנה עצמית.", tag: "מזל עולה" },
    { name: "יונתן א.", text: "לא האמנתי כמה הקריאה היומית דייקה. כל בוקר אני נכנס לקבל את ההשראה שלי — זה הפך לריטואל שלי.", tag: "תובנה יומית" },
  ] : language === "ar" ? [
    { name: "سارة ك.", text: "حصلت على قراءة شخصية أذهلتني حقاً. تحليل التوافق كشف أشياء لم أكن أعرفها عن نفسي وعن علاقتي — شعرت بأن أحداً يفهمني حقاً.", tag: "توافق الأبراج" },
    { name: "أحمد م.", text: "أعطاني التاروت الإجابة التي كنت أبحث عنها. كل بطاقة شعرت وكأنها رسالة شخصية من الكون.", tag: "قراءة التاروت" },
    { name: "نور د.", text: "خريطة ميلادي كانت مذهلة. كل كوكب، كل بيت فلكي — كل شيء ترابط في صورة واحدة واضحة.", tag: "علم الفلك" },
    { name: "خالد ع.", text: "قراءة الكف فاجأتني. رفعت صور يدي وحصلت على تحليل مفصل شعرت أنه حقيقي ودقيق بشكل مذهل.", tag: "قراءة الكف" },
    { name: "ليلى س.", text: "تحليل البرج الطالع فتح لي نافذة على الطريقة التي يراني بها الآخرون. تجربة عاطفية ومؤثرة.", tag: "البرج الطالع" },
    { name: "ياسر ر.", text: "لم أصدق مدى دقة القراءة اليومية. كل صباح أدخل لأحصل على إلهامي — أصبح طقساً يومياً.", tag: "رؤية يومية" },
  ] : language === "ru" ? [
    { name: "Мария К.", text: "Получила персональное чтение, которое просто поразило меня. Анализ совместимости раскрыл вещи, о которых я не знала — почувствовала, что кто-то действительно понимает меня.", tag: "Совместимость" },
    { name: "Дмитрий С.", text: "Таро дало мне ответ, который я искал. Каждая карта ощущалась как личное послание от Вселенной.", tag: "Чтение Таро" },
    { name: "Анна Д.", text: "Моя карта рождения была потрясающей. Каждая планета, каждый дом — всё сложилось в одну ясную картину.", tag: "Астрология" },
    { name: "Максим М.", text: "Чтение по ладони удивило меня. Загрузил фото обеих рук и получил детальный анализ — невероятно точный.", tag: "Хиромантия" },
    { name: "Елена Л.", text: "Анализ восходящего знака открыл мне окно в то, как другие видят меня. Эмоциональный и волнующий опыт.", tag: "Асцендент" },
    { name: "Алексей А.", text: "Не верил, насколько точным будет ежедневное чтение. Каждое утро захожу за вдохновением — это стало моим ритуалом.", tag: "Ежедневный прогноз" },
  ] : [
    { name: "Michelle K.", text: "I received a personal reading that truly amazed me. The compatibility analysis revealed things I didn't know about myself — I felt truly understood.", tag: "Compatibility" },
    { name: "Oliver S.", text: "The Tarot gave me the answer I was searching for. Every card felt like a personal message from the universe.", tag: "Tarot Reading" },
    { name: "Noa D.", text: "My birth chart was stunning. Every planet, every astrological house — everything connected into one clear picture.", tag: "Astrology" },
    { name: "Daniel M.", text: "The palm reading surprised me. I uploaded photos of both hands and received an incredibly accurate and detailed analysis.", tag: "Palm Reading" },
    { name: "Sarah L.", text: "The rising sign analysis opened a window into how others perceive me. An emotional and moving experience.", tag: "Rising Sign" },
    { name: "Jonathan A.", text: "I couldn't believe how accurate the daily reading was. Every morning I check in for my inspiration — it's become my ritual.", tag: "Daily Insight" },
  ];

  return (
    <section className="py-28 px-4 relative overflow-hidden cosmic-section-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-crimson/5 blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-gold/3 blur-[100px]" />
      </div>

      <div className="section-divider max-w-xl mx-auto mb-20" />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-16 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Star className="w-4 h-4 text-gold/50" />
          <Star className="w-3 h-3 text-gold/30" />
          <Star className="w-4 h-4 text-gold/50" />
        </div>
        <h2 className="font-heading text-3xl md:text-5xl gold-gradient-text mb-4">
          {t.testimonials_title}
        </h2>
        <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
          {t.testimonials_subtitle}
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {testimonials.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="group mystical-card p-7 md:p-8 flex flex-col hover:mystical-glow-intense transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-5">
              <Quote className="w-7 h-7 text-gold/30 group-hover:text-gold/50 transition-colors duration-500" />
              <span className="text-[11px] font-body text-gold/40 border border-gold/15 rounded-full px-3 py-1 tracking-wide">
                {item.tag}
              </span>
            </div>
            <p className="text-foreground/80 font-body text-sm leading-[1.9] mb-6 flex-1">
              "{item.text}"
            </p>
            <div className="flex items-center gap-2 pt-4 border-t border-gold/10">
              <Sparkles className="w-3.5 h-3.5 text-gold/40" />
              <p className="text-gold font-body text-sm font-semibold">{item.name}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;

import { motion } from "framer-motion";
import type { AuraResult, AuraFamily } from "@/lib/auraResultBank";
import { AURA_BANK } from "@/lib/auraResultBank";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Localized labels ── */
const LABELS: Record<string, { dominant: string; secondary: string }> = {
  he: { dominant: "ההילה הדומיננטית שלך", secondary: "גוונים משניים" },
  en: { dominant: "Your Dominant Aura", secondary: "Secondary tones" },
  ru: { dominant: "Ваша доминирующая аура", secondary: "Вторичные тона" },
  ar: { dominant: "هالتك المهيمنة", secondary: "نغمات ثانوية" },
};

/* ── Localized aura names, subtitles & meanings ── */
type AuraI18n = { title: string; subtitle: string; shortMeaning: string };
const AURA_I18N: Record<string, Record<AuraFamily, AuraI18n>> = {
  he: {
    gold:      { title: "זוהר שמשי",       subtitle: "מהותך בוערת באור ריבוני",                    shortMeaning: "את/ה נושא/ת נוכחות בלתי מוטעית של מנהיג/ה טבעי/ת — חמים/ה, נדיב/ה, ובעל/ת כריזמה מגנטית. השמש הפנימית שלך מאירה כל חדר שאת/ה נכנס/ת אליו." },
    blue:      { title: "עומקים ירחיים",    subtitle: "נשמתך מדברת בגאויות ובלחישות",               shortMeaning: "אינטואיטיבי/ת עמוק/ה ורגיש/ה רגשית, את/ה חש/ה מה שאחרים לא מסוגלים. העולם הפנימי שלך הוא נוף עשיר של רגש, זיכרון והבנה שאינה נאמרת." },
    green:     { title: "זרם אזמרגד",       subtitle: "המוח שלך אורג דפוסים שאחרים מפספסים",        shortMeaning: "חד/ה וסקרן/ית ללא גבול, את/ה מחבר/ת רעיונות במהירות הבזק. תקשורת היא המתנה שלך — את/ה מתרגם/ת מורכבות לבהירות בחן טבעי." },
    purple:    { title: "צעיף מיסטי",        subtitle: "את/ה שוכן/ת היכן שחלומות פוגשים חזון",        shortMeaning: "התודעה שלך נוגעת בממלכות מעבר לרגיל. אמנותי/ת, רוחני/ת ובעל/ת דמיון עמוק — את/ה ממוסס/ת גבולות בין הנראה לבלתי נראה." },
    red:       { title: "להבה חיונית",       subtitle: "הרצון שלך מחושל באש",                       shortMeaning: "מונע/ת מכוח פנימי בלתי ניתן לעצירה, את/ה פועל/ת באומץ ועוצמה. התשוקה שלך מצתה פעולה — את/ה הזרז שמניע אנרגיה קפואה." },
    pink:      { title: "חן נוגהי",          subtitle: "יופי והרמוניה זורמים דרך ישותך",              shortMeaning: "את/ה מגלם/ת אהבה בצורתה המעודנת ביותר — מעריך/ה יופי, מטפח/ת קשרים ויוצר/ת הרמוניה בכל מקום. מערכות יחסים הן האמנות שלך." },
    turquoise: { title: "זרם אסטרלי",       subtitle: "את/ה רוכב/ת על קצה המחר",                    shortMeaning: "מקורי/ת, חשמלי/ת ולא חושש/ת משינוי — את/ה רואה עתידות שאחרים לא מדמיינים. הרעיונות שלך מגיעים כמו ברק, משבשים דפוסים ישנים בחדשנות מבריקה." },
    indigo:    { title: "עוגן עמוק",         subtitle: "העוצמה שלך חצובה מסלע קדום",                  shortMeaning: "סבלני/ת, ממושמע/ת ואחראי/ת עמוקות — את/ה בונה מבנים שמחזיקים מעמד. החוכמה שלך נובעת מניסיון, והנוכחות שלך היא עוגן לסובבים אותך." },
    orange:    { title: "אור מתרחב",         subtitle: "רוחך מחפשת את האופק",                        shortMeaning: "אופטימי/ת, פילוסופי/ת ונדיב/ה — את/ה רואה את הדפוס הגדול מאחורי פרטי החיים. השפע הטבעי שלך מעורר אחרים לחלום גדול יותר ולהגיע רחוק יותר." },
    white:     { title: "טרנסמוטציה טהורה",  subtitle: "את/ה משנה כל מה שנוגע בך",                   shortMeaning: "אינטנסיבי/ת וחודרני/ת, את/ה רואה דרך פני השטח אל האמת שמתחת. הכוח שלך טמון בשינוי — את/ה פושט/ת עורות ישנים ונולד/ת מחדש, שוב ושוב." },
  },
  ru: {
    gold:      { title: "Солнечное сияние",     subtitle: "Ваша сущность горит суверенным светом",              shortMeaning: "Вы несёте безошибочное присутствие прирождённого лидера — тёплого, щедрого и магнетически уверенного. Ваше внутреннее солнце освещает каждую комнату." },
    blue:      { title: "Лунные глубины",       subtitle: "Ваша душа говорит приливами и шёпотом",              shortMeaning: "Глубоко интуитивны и эмоционально восприимчивы — вы чувствуете то, чего не могут другие. Ваш внутренний мир — богатый ландшафт чувств и невысказанного понимания." },
    green:     { title: "Изумрудный поток",     subtitle: "Ваш разум плетёт узоры, которые другие не замечают", shortMeaning: "Остроумны и бесконечно любопытны — вы связываете идеи с молниеносной скоростью. Общение — ваш дар, вы переводите сложность в ясность с лёгкой грацией." },
    purple:    { title: "Мистическая завеса",   subtitle: "Вы живёте там, где сны встречают видение",           shortMeaning: "Ваше сознание касается миров за пределами обычного. Артистичны, духовны и глубоко образны — вы растворяете границы между видимым и невидимым." },
    red:       { title: "Жизненное пламя",      subtitle: "Ваша воля закалена в огне",                         shortMeaning: "Движимые неостановимой внутренней силой, вы действуете с мужеством и интенсивностью. Ваша страсть разжигает действие — вы катализатор, двигающий застоявшуюся энергию." },
    pink:      { title: "Венерианская грация",  subtitle: "Красота и гармония текут через ваше существо",       shortMeaning: "Вы воплощаете любовь в её самой утончённой форме — цените красоту, взращиваете связи и создаёте гармонию повсюду. Отношения — ваше искусство." },
    turquoise: { title: "Астральный поток",     subtitle: "Вы на краю завтрашнего дня",                        shortMeaning: "Оригинальны, электричны и не боитесь перемен — вы видите будущее, которое другие не могут представить. Ваши идеи приходят как молния, разрушая старые паттерны блестящими инновациями." },
    indigo:    { title: "Глубокий якорь",       subtitle: "Ваша сила высечена из древнего камня",               shortMeaning: "Терпеливы, дисциплинированны и глубоко ответственны — вы строите структуры, которые выдерживают. Ваша мудрость рождена опытом, а ваше присутствие — якорь для окружающих." },
    orange:    { title: "Расширяющийся свет",   subtitle: "Ваш дух ищет горизонт",                             shortMeaning: "Оптимистичны, философичны и щедры — вы видите великий замысел за деталями жизни. Ваше природное изобилие вдохновляет других мечтать масштабнее." },
    white:     { title: "Чистая трансмутация",  subtitle: "Вы преображаете всё, к чему прикасаетесь",           shortMeaning: "Интенсивны и проницательны — вы видите сквозь поверхность к истине внутри. Ваша сила — в трансформации: вы сбрасываете старую кожу и рождаетесь заново, снова и снова." },
  },
  ar: {
    gold:      { title: "إشراق شمسي",        subtitle: "جوهرك يتوهج بنور سيادي",                       shortMeaning: "تحمل حضوراً لا يُخطئه أحد لقائد بالفطرة — دافئ وكريم وواثق بجاذبية مغناطيسية. شمسك الداخلية تُنير كل غرفة تدخلها." },
    blue:      { title: "أعماق قمرية",        subtitle: "روحك تتحدث بالمد والهمس",                       shortMeaning: "عميق الحدس ومدرك عاطفياً، تستشعر ما لا يستطيعه الآخرون. عالمك الداخلي منظر غني بالمشاعر والذكريات والفهم غير المنطوق." },
    green:     { title: "تيار زمردي",         subtitle: "عقلك ينسج أنماطاً يغفلها الآخرون",              shortMeaning: "سريع البديهة وفضولي بلا حدود، تربط الأفكار بسرعة البرق. التواصل هبتك — تترجم التعقيد إلى وضوح بأناقة طبيعية." },
    purple:    { title: "حجاب صوفي",          subtitle: "تسكن حيث تلتقي الأحلام بالرؤية",               shortMeaning: "وعيك يلامس عوالم ما وراء المألوف. فني وروحاني وعميق الخيال — تُذيب الحدود بين المرئي وغير المرئي." },
    red:       { title: "لهب حيوي",           subtitle: "إرادتك مصقولة بالنار",                          shortMeaning: "مدفوع بقوة داخلية لا تُوقف، تتصرف بشجاعة وحدة. شغفك يُشعل الفعل — أنت المحفّز الذي يحرّك الطاقة الراكدة." },
    pink:      { title: "رشاقة فينوسية",      subtitle: "الجمال والانسجام يتدفقان عبر كيانك",            shortMeaning: "تجسّد الحب في أرقى أشكاله — تقدّر الجمال وتغذّي الروابط وتخلق الانسجام أينما ذهبت. العلاقات هي فنّك." },
    turquoise: { title: "تيار نجمي",          subtitle: "تركب حافة الغد",                                shortMeaning: "أصيل وكهربائي ولا تخشى التغيير — ترى مستقبلاً لا يتخيله الآخرون. أفكارك تأتي كالبرق، تكسر الأنماط القديمة بابتكار لامع." },
    indigo:    { title: "مرساة عميقة",        subtitle: "قوتك منحوتة من صخر قديم",                       shortMeaning: "صبور ومنضبط ومسؤول بعمق — تبني هياكل تصمد. حكمتك تأتي من الخبرة، وحضورك مرساة لمن حولك." },
    orange:    { title: "نور متسع",           subtitle: "روحك تبحث عن الأفق",                            shortMeaning: "متفائل وفلسفي وكريم — ترى النمط الكبير خلف تفاصيل الحياة. وفرتك الطبيعية تُلهم الآخرين أن يحلموا أكبر ويصلوا أبعد." },
    white:     { title: "تحوّل نقي",          subtitle: "تُحوّل كل ما تلمسه",                            shortMeaning: "مكثّف ونافذ، ترى ما وراء السطح إلى الحقيقة الكامنة. قوتك في التحوّل — تخلع جلوداً قديمة وتولد من جديد، مرة بعد مرة." },
  },
};

/* ── Visual mapping per aura family ── */
const AURA_VISUALS: Record<AuraFamily, { accent: string; glow: string; gradient: string }> = {
  gold:      { accent: "#F5C842", glow: "43 80% 55%",   gradient: "linear-gradient(135deg, #F5C84218, #F5C84208)" },
  blue:      { accent: "#D0D6E0", glow: "220 20% 85%",  gradient: "linear-gradient(135deg, #D0D6E018, #D0D6E008)" },
  green:     { accent: "#7FD4A8", glow: "150 45% 66%",  gradient: "linear-gradient(135deg, #7FD4A818, #7FD4A808)" },
  purple:    { accent: "#9060B8", glow: "275 40% 55%",  gradient: "linear-gradient(135deg, #9060B818, #9060B808)" },
  red:       { accent: "#E05252", glow: "0 70% 60%",    gradient: "linear-gradient(135deg, #E0525218, #E0525208)" },
  pink:      { accent: "#F28DC7", glow: "330 80% 75%",  gradient: "linear-gradient(135deg, #F28DC718, #F28DC708)" },
  turquoise: { accent: "#5FC8E8", glow: "195 75% 64%",  gradient: "linear-gradient(135deg, #5FC8E818, #5FC8E808)" },
  indigo:    { accent: "#6070E8", glow: "233 75% 64%",  gradient: "linear-gradient(135deg, #6070E818, #6070E808)" },
  orange:    { accent: "#E8A040", glow: "33 78% 58%",   gradient: "linear-gradient(135deg, #E8A04018, #E8A04008)" },
  white:     { accent: "#E0DCD4", glow: "36 12% 86%",   gradient: "linear-gradient(135deg, #E0DCD418, #E0DCD408)" },
};

interface Props {
  result: AuraResult;
}

const AuraResultCard = ({ result }: Props) => {
  const { language } = useLanguage();
  const vis = AURA_VISUALS[result.primaryAura];
  const labels = LABELS[language] || LABELS.en;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl w-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: vis.gradient,
        border: `1px solid ${vis.accent}22`,
        boxShadow: `0 0 40px hsl(${vis.glow} / 0.08), inset 0 1px 0 ${vis.accent}10`,
      }}
    >
      {/* Subtle aura shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${vis.accent}0A, transparent 70%)`,
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative px-5 py-6 md:px-8 md:py-8 space-y-4">
        {/* Title */}
        <div className="text-center space-y-1.5">
          <motion.p
            className="font-body text-xs md:text-sm uppercase tracking-widest"
            style={{ color: `${vis.accent}88` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {labels.dominant}
          </motion.p>
          <motion.h3
            className="font-heading text-xl md:text-2xl tracking-wide"
            style={{ color: vis.accent }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {result.title}
          </motion.h3>
          <motion.p
            className="font-body text-sm md:text-base italic"
            style={{ color: `${vis.accent}AA` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {result.subtitle}
          </motion.p>
        </div>

        {/* Divider */}
        <div
          className="mx-auto"
          style={{
            width: "40%",
            height: 1,
            background: `linear-gradient(90deg, transparent, ${vis.accent}30, transparent)`,
          }}
        />

        {/* Short meaning */}
        <motion.p
          className="font-body text-sm md:text-base text-center leading-relaxed"
          style={{
            color: "hsl(var(--foreground) / 0.82)",
            lineHeight: 1.9,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
        >
          {result.shortMeaning}
        </motion.p>

        {/* Visual tone tag */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <span
            className="px-4 py-1.5 rounded-full font-body text-[11px] tracking-wider uppercase"
            style={{
              color: `${vis.accent}CC`,
              background: `${vis.accent}0D`,
              border: `1px solid ${vis.accent}18`,
            }}
          >
            {result.visualTone.split(",")[0].trim()}
          </span>
        </motion.div>

        {/* Secondary auras */}
        {result.secondaryAuras.length > 0 && (
          <motion.p
            className="text-center font-body text-[11px] md:text-xs"
            style={{ color: "hsl(var(--foreground) / 0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            {labels.secondary}: {result.secondaryAuras.slice(0, 3).map(a => AURA_BANK[a].title).join(" • ")}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default AuraResultCard;

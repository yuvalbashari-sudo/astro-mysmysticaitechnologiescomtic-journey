import { motion } from "framer-motion";
import { Download, Sparkles } from "lucide-react";
import type { AuraResult, AuraFamily, EnergyModifier } from "@/lib/auraResultBank";
import { AURA_BANK } from "@/lib/auraResultBank";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Localized labels ── */
const LABELS: Record<string, Record<string, string>> = {
  he: {
    dominant: "ההילה הדומיננטית שלך",
    secondary: "גוונים משניים",
    energySignature: "חתימת האנרגיה שלך",
    primaryLabel: "הילה ראשית",
    secondaryLabel: "גוונים תומכים",
    modifierLabel: "טון אנרגטי",
    shareTitle: "שתפ/י את ההילה שלך",
    downloadCta: "הורד/י את ההילה שלך",
  },
  en: {
    dominant: "Your Dominant Aura",
    secondary: "Secondary tones",
    energySignature: "Your Energy Signature",
    primaryLabel: "Primary Aura",
    secondaryLabel: "Supporting Tones",
    modifierLabel: "Energy Tone",
    shareTitle: "Share Your Aura",
    downloadCta: "Download Your Aura",
  },
  ru: {
    dominant: "Ваша доминирующая аура",
    secondary: "Вторичные тона",
    energySignature: "Ваша энергетическая подпись",
    primaryLabel: "Основная аура",
    secondaryLabel: "Поддерживающие тона",
    modifierLabel: "Энергетический тон",
    shareTitle: "Поделитесь своей аурой",
    downloadCta: "Скачать вашу ауру",
  },
  ar: {
    dominant: "هالتك المهيمنة",
    secondary: "نغمات ثانوية",
    energySignature: "بصمتك الطاقية",
    primaryLabel: "الهالة الأساسية",
    secondaryLabel: "نغمات داعمة",
    modifierLabel: "النغمة الطاقية",
    shareTitle: "شارك هالتك",
    downloadCta: "حمّل هالتك",
  },
};

/* ── Localized aura names, subtitles & meanings ── */
type AuraI18n = { title: string; subtitle: string; shortMeaning: string };
const AURA_I18N: Record<string, Record<AuraFamily, AuraI18n>> = {
  he: {
    solar_gold:        { title: "זוהר שמשי",       subtitle: "מהותך בוערת באור ריבוני",                    shortMeaning: "את/ה נושא/ת נוכחות בלתי מוטעית של מנהיג/ה טבעי/ת — חמים/ה, נדיב/ה, ובעל/ת כריזמה מגנטית. השמש הפנימית שלך מאירה כל חדר שאת/ה נכנס/ת אליו." },
    moon_silver_blue:        { title: "עומקים ירחיים",    subtitle: "נשמתך מדברת בגאויות ובלחישות",               shortMeaning: "אינטואיטיבי/ת עמוק/ה ורגיש/ה רגשית, את/ה חש/ה מה שאחרים לא מסוגלים. העולם הפנימי שלך הוא נוף עשיר של רגש, זיכרון והבנה שאינה נאמרת." },
    healing_green:     { title: "זרם אזמרגד",       subtitle: "המוח שלך אורג דפוסים שאחרים מפספסים",        shortMeaning: "חד/ה וסקרן/ית ללא גבול, את/ה מחבר/ת רעיונות במהירות הבזק. תקשורת היא המתנה שלך — את/ה מתרגם/ת מורכבות לבהירות בחן טבעי." },
    mystical_purple:   { title: "צעיף מיסטי",        subtitle: "את/ה שוכן/ת היכן שחלומות פוגשים חזון",        shortMeaning: "התודעה שלך נוגעת בממלכות מעבר לרגיל. אמנותי/ת, רוחני/ת ובעל/ת דמיון עמוק — את/ה ממוסס/ת גבולות בין הנראה לבלתי נראה." },
    vital_red:         { title: "להבה חיונית",       subtitle: "הרצון שלך מחושל באש",                       shortMeaning: "מונע/ת מכוח פנימי בלתי ניתן לעצירה, את/ה פועל/ת באומץ ועוצמה. התשוקה שלך מצתה פעולה — את/ה הזרז שמניע אנרגיה קפואה." },
    venus_pink:        { title: "חן נוגהי",          subtitle: "יופי והרמוניה זורמים דרך ישותך",              shortMeaning: "את/ה מגלם/ת אהבה בצורתה המעודנת ביותר — מעריך/ה יופי, מטפח/ת קשרים ויוצר/ת הרמוניה בכל מקום. מערכות יחסים הן האמנות שלך." },
    astral_turquoise:  { title: "זרם אסטרלי",       subtitle: "את/ה רוכב/ת על קצה המחר",                    shortMeaning: "מקורי/ת, חשמלי/ת ולא חושש/ת משינוי — את/ה רואה עתידות שאחרים לא מדמיינים. הרעיונות שלך מגיעים כמו ברק, משבשים דפוסים ישנים בחדשנות מבריקה." },
    deep_indigo:       { title: "עוגן עמוק",         subtitle: "העוצמה שלך חצובה מסלע קדום",                  shortMeaning: "סבלני/ת, ממושמע/ת ואחראי/ת עמוקות — את/ה בונה מבנים שמחזיקים מעמד. החוכמה שלך נובעת מניסיון, והנוכחות שלך היא עוגן לסובבים אותך." },
    expansive_orange:  { title: "אור מתרחב",         subtitle: "רוחך מחפשת את האופק",                        shortMeaning: "אופטימי/ת, פילוסופי/ת ונדיב/ה — את/ה רואה את הדפוס הגדול מאחורי פרטי החיים. השפע הטבעי שלך מעורר אחרים לחלום גדול יותר ולהגיע רחוק יותר." },
    pure_white:        { title: "טרנסמוטציה טהורה",  subtitle: "את/ה משנה כל מה שנוגע בך",                   shortMeaning: "אינטנסיבי/ת וחודרני/ת, את/ה רואה דרך פני השטח אל האמת שמתחת. הכוח שלך טמון בשינוי — את/ה פושט/ת עורות ישנים ונולד/ת מחדש, שוב ושוב." },
  },
  ru: {
    solar_gold:        { title: "Солнечное сияние",     subtitle: "Ваша сущность горит суверенным светом",              shortMeaning: "Вы несёте безошибочное присутствие прирождённого лидера — тёплого, щедрого и магнетически уверенного. Ваше внутреннее солнце освещает каждую комнату." },
    moon_silver_blue:        { title: "Лунные глубины",       subtitle: "Ваша душа говорит приливами и шёпотом",              shortMeaning: "Глубоко интуитивны и эмоционально восприимчивы — вы чувствуете то, чего не могут другие. Ваш внутренний мир — богатый ландшафт чувств и невысказанного понимания." },
    healing_green:     { title: "Изумрудный поток",     subtitle: "Ваш разум плетёт узоры, которые другие не замечают", shortMeaning: "Остроумны и бесконечно любопытны — вы связываете идеи с молниеносной скоростью. Общение — ваш дар, вы переводите сложность в ясность с лёгкой грацией." },
    mystical_purple:   { title: "Мистическая завеса",   subtitle: "Вы живёте там, где сны встречают видение",           shortMeaning: "Ваше сознание касается миров за пределами обычного. Артистичны, духовны и глубоко образны — вы растворяете границы между видимым и невидимым." },
    vital_red:         { title: "Жизненное пламя",      subtitle: "Ваша воля закалена в огне",                         shortMeaning: "Движимые неостановимой внутренней силой, вы действуете с мужеством и интенсивностью. Ваша страсть разжигает действие — вы катализатор, двигающий застоявшуюся энергию." },
    venus_pink:        { title: "Венерианская грация",  subtitle: "Красота и гармония текут через ваше существо",       shortMeaning: "Вы воплощаете любовь в её самой утончённой форме — цените красоту, взращиваете связи и создаёте гармонию повсюду. Отношения — ваше искусство." },
    astral_turquoise:  { title: "Астральный поток",     subtitle: "Вы на краю завтрашнего дня",                        shortMeaning: "Оригинальны, электричны и не боитесь перемен — вы видите будущее, которое другие не могут представить. Ваши идеи приходят как молния, разрушая старые паттерны блестящими инновациями." },
    deep_indigo:       { title: "Глубокий якорь",       subtitle: "Ваша сила высечена из древнего камня",               shortMeaning: "Терпеливы, дисциплинированны и глубоко ответственны — вы строите структуры, которые выдерживают. Ваша мудрость рождена опытом, а ваше присутствие — якорь для окружающих." },
    expansive_orange:  { title: "Расширяющийся свет",   subtitle: "Ваш дух ищет горизонт",                             shortMeaning: "Оптимистичны, философичны и щедры — вы видите великий замысел за деталями жизни. Ваше природное изобилие вдохновляет других мечтать масштабнее." },
    pure_white:        { title: "Чистая трансмутация",  subtitle: "Вы преображаете всё, к чему прикасаетесь",           shortMeaning: "Интенсивны и проницательны — вы видите сквозь поверхность к истине внутри. Ваша сила — в трансформации: вы сбрасываете старую кожу и рождаетесь заново, снова и снова." },
  },
  ar: {
    solar_gold:        { title: "إشراق شمسي",        subtitle: "جوهرك يتوهج بنور سيادي",                       shortMeaning: "تحمل حضوراً لا يُخطئه أحد لقائد بالفطرة — دافئ وكريم وواثق بجاذبية مغناطيسية. شمسك الداخلية تُنير كل غرفة تدخلها." },
    moon_silver_blue:        { title: "أعماق قمرية",        subtitle: "روحك تتحدث بالمد والهمس",                       shortMeaning: "عميق الحدس ومدرك عاطفياً، تستشعر ما لا يستطيعه الآخرون. عالمك الداخلي منظر غني بالمشاعر والذكريات والفهم غير المنطوق." },
    healing_green:     { title: "تيار زمردي",         subtitle: "عقلك ينسج أنماطاً يغفلها الآخرون",              shortMeaning: "سريع البديهة وفضولي بلا حدود، تربط الأفكار بسرعة البرق. التواصل هبتك — تترجم التعقيد إلى وضوح بأناقة طبيعية." },
    mystical_purple:   { title: "حجاب صوفي",          subtitle: "تسكن حيث تلتقي الأحلام بالرؤية",               shortMeaning: "وعيك يلامس عوالم ما وراء المألوف. فني وروحاني وعميق الخيال — تُذيب الحدود بين المرئي وغير المرئي." },
    vital_red:         { title: "لهب حيوي",           subtitle: "إرادتك مصقولة بالنار",                          shortMeaning: "مدفوع بقوة داخلية لا تُوقف، تتصرف بشجاعة وحدة. شغفك يُشعل الفعل — أنت المحفّز الذي يحرّك الطاقة الراكدة." },
    venus_pink:        { title: "رشاقة فينوسية",      subtitle: "الجمال والانسجام يتدفقان عبر كيانك",            shortMeaning: "تجسّد الحب في أرقى أشكاله — تقدّر الجمال وتغذّي الروابط وتخلق الانسجام أينما ذهبت. العلاقات هي فنّك." },
    astral_turquoise:  { title: "تيار نجمي",          subtitle: "تركب حافة الغد",                                shortMeaning: "أصيل وكهربائي ولا تخشى التغيير — ترى مستقبلاً لا يتخيله الآخرون. أفكارك تأتي كالبرق، تكسر الأنماط القديمة بابتكار لامع." },
    deep_indigo:       { title: "مرساة عميقة",        subtitle: "قوتك منحوتة من صخر قديم",                       shortMeaning: "صبور ومنضبط ومسؤول بعمق — تبني هياكل تصمد. حكمتك تأتي من الخبرة، وحضورك مرساة لمن حولك." },
    expansive_orange:  { title: "نور متسع",           subtitle: "روحك تبحث عن الأفق",                            shortMeaning: "متفائل وفلسفي وكريم — ترى النمط الكبير خلف تفاصيل الحياة. وفرتك الطبيعية تُلهم الآخرين أن يحلموا أكبر ويصلوا أبعد." },
    pure_white:        { title: "تحوّل نقي",          subtitle: "تُحوّل كل ما تلمسه",                            shortMeaning: "مكثّف ونافذ، ترى ما وراء السطح إلى الحقيقة الكامنة. قوتك في التحوّل — تخلع جلوداً قديمة وتولد من جديد، مرة بعد مرة." },
  },
};

/* ── Localized modifier names ── */
const MODIFIER_I18N: Record<string, Record<EnergyModifier, string>> = {
  he: { radiant: "זורח", soft: "רך", magnetic: "מגנטי", deep: "עמוק", balanced: "מאוזן", transformative: "טרנספורמטיבי", grounded: "מעוגן", fluid: "זורם", intense: "אינטנסיבי", ethereal: "אתרי" },
  en: { radiant: "Radiant", soft: "Soft", magnetic: "Magnetic", deep: "Deep", balanced: "Balanced", transformative: "Transformative", grounded: "Grounded", fluid: "Fluid", intense: "Intense", ethereal: "Ethereal" },
  ru: { radiant: "Сияющий", soft: "Мягкий", magnetic: "Магнетический", deep: "Глубокий", balanced: "Сбалансированный", transformative: "Трансформативный", grounded: "Заземлённый", fluid: "Текучий", intense: "Интенсивный", ethereal: "Эфирный" },
  ar: { radiant: "مشع", soft: "ناعم", magnetic: "مغناطيسي", deep: "عميق", balanced: "متوازن", transformative: "تحويلي", grounded: "راسخ", fluid: "سائل", intense: "مكثّف", ethereal: "أثيري" },
};

/* ── Visual mapping per aura family ── */
const AURA_VISUALS: Record<AuraFamily, { accent: string; glow: string; gradient: string }> = {
  solar_gold:        { accent: "#F5C842", glow: "43 80% 55%",   gradient: "linear-gradient(135deg, #F5C84218, #F5C84208)" },
  moon_silver_blue:        { accent: "#D0D6E0", glow: "220 20% 85%",  gradient: "linear-gradient(135deg, #D0D6E018, #D0D6E008)" },
  healing_green:     { accent: "#7FD4A8", glow: "150 45% 66%",  gradient: "linear-gradient(135deg, #7FD4A818, #7FD4A808)" },
  mystical_purple:   { accent: "#9060B8", glow: "275 40% 55%",  gradient: "linear-gradient(135deg, #9060B818, #9060B808)" },
  vital_red:         { accent: "#E05252", glow: "0 70% 60%",    gradient: "linear-gradient(135deg, #E0525218, #E0525208)" },
  venus_pink:        { accent: "#F28DC7", glow: "330 80% 75%",  gradient: "linear-gradient(135deg, #F28DC718, #F28DC708)" },
  astral_turquoise:  { accent: "#5FC8E8", glow: "195 75% 64%",  gradient: "linear-gradient(135deg, #5FC8E818, #5FC8E808)" },
  deep_indigo:       { accent: "#6070E8", glow: "233 75% 64%",  gradient: "linear-gradient(135deg, #6070E818, #6070E808)" },
  expansive_orange:  { accent: "#E8A040", glow: "33 78% 58%",   gradient: "linear-gradient(135deg, #E8A04018, #E8A04008)" },
  pure_white:        { accent: "#E0DCD4", glow: "36 12% 86%",   gradient: "linear-gradient(135deg, #E0DCD418, #E0DCD408)" },
};

interface Props {
  result: AuraResult;
}

const AuraResultCard = ({ result }: Props) => {
  const { language } = useLanguage();
  const vis = AURA_VISUALS[result.primaryAura];
  const labels = LABELS[language] || LABELS.en;
  const i18n = AURA_I18N[language]?.[result.primaryAura];
  const title = i18n?.title ?? result.title;
  const subtitle = i18n?.subtitle ?? result.subtitle;
  const meaning = i18n?.shortMeaning ?? result.shortMeaning;
  const modifierName = MODIFIER_I18N[language]?.[result.modifier] ?? MODIFIER_I18N.en[result.modifier];
  const getAuraTitle = (a: AuraFamily) => AURA_I18N[language]?.[a]?.title ?? AURA_BANK[a].title;

  // English identity title: "Balanced Deep Indigo"
  const enModLabel = MODIFIER_I18N.en[result.modifier] || "Radiant";
  const enAuraLabel = AURA_BANK[result.primaryAura].displayName || "Solar Gold";
  const shareableIdentity = `${enModLabel} ${enAuraLabel}`;
  // Localized translation for non-English users
  const localizedIdentity = language !== "en" ? `${modifierName} ${title}` : "";

  // Secondary visuals
  const secondaryVis = result.secondaryAuras.slice(0, 2).map(a => AURA_VISUALS[a]);

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl w-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: `linear-gradient(180deg, ${vis.accent}12 0%, ${vis.accent}06 40%, transparent 100%)`,
        border: `1px solid ${vis.accent}22`,
        boxShadow: `0 0 60px hsl(${vis.glow} / 0.12), 0 0 120px hsl(${vis.glow} / 0.06), inset 0 1px 0 ${vis.accent}10`,
      }}
    >
      {/* Animated aura shimmer — pulsing glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 20%, ${vis.accent}14, transparent 70%)`,
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary color blending gradients */}
      {secondaryVis.map((sv, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 40% 40% at ${i === 0 ? '20% 70%' : '80% 80%'}, ${sv.accent}0A, transparent 60%)`,
          }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
        />
      ))}

      <div className="relative px-5 py-7 md:px-8 md:py-10 space-y-6">

        {/* ═══ HERO IDENTITY — English-first premium label ═══ */}
        <div className="text-center space-y-2">
          {/* English identity — dominant focal point */}
          <motion.h2
            className="font-heading text-2xl md:text-3xl tracking-wide font-bold"
            style={{
              color: vis.accent,
              textShadow: `0 0 30px ${vis.accent}60, 0 0 60px ${vis.accent}30`,
            }}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {shareableIdentity}
          </motion.h2>

          {/* Localized translation — smaller, below English identity */}
          {localizedIdentity && (
            <motion.p
              className="font-heading text-base md:text-lg"
              style={{ color: `${vis.accent}80` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {localizedIdentity}
            </motion.p>
          )}

          {/* Emotional subtitle */}
          <motion.p
            className="font-body text-sm md:text-base italic max-w-[320px] mx-auto"
            style={{ color: `${vis.accent}BB` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Glowing divider */}
        <motion.div
          className="mx-auto"
          style={{
            width: "50%",
            height: 1,
            background: `linear-gradient(90deg, transparent, ${vis.accent}50, transparent)`,
            boxShadow: `0 0 8px ${vis.accent}30`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        />

        {/* ═══ MEANING — Personal reading ═══ */}
        <motion.p
          className="font-body text-sm md:text-base text-center leading-relaxed max-w-[360px] mx-auto"
          style={{
            color: "hsl(var(--foreground) / 0.82)",
            lineHeight: 1.9,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
        >
          {meaning}
        </motion.p>

        {/* ═══ ENERGY SIGNATURE SECTION ═══ */}
        <motion.div
          className="rounded-xl p-4 space-y-3"
          style={{
            background: `${vis.accent}08`,
            border: `1px solid ${vis.accent}12`,
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles size={14} style={{ color: vis.accent }} />
            <span
              className="font-body text-[11px] uppercase tracking-[0.15em]"
              style={{ color: `${vis.accent}99` }}
            >
              {labels.energySignature}
            </span>
            <Sparkles size={14} style={{ color: vis.accent }} />
          </div>

          {/* Primary */}
          <div className="flex items-center gap-3">
            <motion.div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                background: vis.accent,
                boxShadow: `0 0 10px ${vis.accent}80, 0 0 20px ${vis.accent}40`,
              }}
              animate={{ boxShadow: [`0 0 10px ${vis.accent}80, 0 0 20px ${vis.accent}40`, `0 0 16px ${vis.accent}A0, 0 0 30px ${vis.accent}60`, `0 0 10px ${vis.accent}80, 0 0 20px ${vis.accent}40`] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="flex-1 min-w-0">
              <span className="font-body text-[10px] uppercase tracking-wider block" style={{ color: "hsl(var(--foreground) / 0.4)" }}>
                {labels.primaryLabel}
              </span>
              <span className="font-heading text-sm" style={{ color: vis.accent }}>
                {title}
              </span>
            </div>
          </div>

          {/* Secondary auras */}
          {result.secondaryAuras.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 pt-1.5 flex-shrink-0">
                {result.secondaryAuras.slice(0, 2).map((a, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: AURA_VISUALS[a].accent,
                      opacity: 0.7,
                      boxShadow: `0 0 6px ${AURA_VISUALS[a].accent}50`,
                    }}
                  />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-body text-[10px] uppercase tracking-wider block" style={{ color: "hsl(var(--foreground) / 0.4)" }}>
                  {labels.secondaryLabel}
                </span>
                <span className="font-body text-xs" style={{ color: "hsl(var(--foreground) / 0.65)" }}>
                  {result.secondaryAuras.slice(0, 2).map(a => getAuraTitle(a)).join(" · ")}
                </span>
              </div>
            </div>
          )}

          {/* Modifier */}
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${vis.accent}40, ${vis.accent}20)`,
                border: `1px solid ${vis.accent}30`,
              }}
            />
            <div className="flex-1 min-w-0">
              <span className="font-body text-[10px] uppercase tracking-wider block" style={{ color: "hsl(var(--foreground) / 0.4)" }}>
                {labels.modifierLabel}
              </span>
              <span className="font-body text-xs" style={{ color: `${vis.accent}CC` }}>
                {modifierName}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ═══ VISUAL TONE TAG ═══ */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
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

        {/* ═══ SHARE SECTION ═══ */}
        <motion.div
          className="text-center space-y-3 pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.7 }}
        >
          <p
            className="font-body text-[11px] uppercase tracking-[0.15em]"
            style={{ color: "hsl(var(--foreground) / 0.35)" }}
          >
            {labels.shareTitle}
          </p>
          <motion.button
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-body text-sm tracking-wide cursor-pointer transition-all duration-300"
            style={{
              color: vis.accent,
              background: `${vis.accent}14`,
              border: `1px solid ${vis.accent}28`,
              boxShadow: `0 0 20px ${vis.accent}10`,
            }}
            whileHover={{
              boxShadow: `0 0 30px ${vis.accent}25, 0 0 60px ${vis.accent}10`,
              scale: 1.03,
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Download size={14} />
            {labels.downloadCta}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuraResultCard;

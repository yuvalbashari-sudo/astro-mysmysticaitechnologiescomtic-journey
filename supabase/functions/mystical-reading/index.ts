import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const READING_PROMPTS: Record<string, (data: any) => { system: string; user: string | any[] }> = {
  forecast: (data) => {
    const isMale = data.gender === "male";
    const isFemale = data.gender === "female";
    const genderInstruction = isMale
      ? `\n\nהנחיית מגדר קריטית — חלה על כל מילה בתשובה:\nהקורא הוא גבר. כתוב את כל התחזית בלשון זכר עקבית מתחילה ועד הסוף — כולל כותרות, פסקאות, עצות, המלצות ומשפט הסיכום.\nדוגמאות: "אתה תחווה", "הכוחות שלך", "אתה מוזמן", "עליך לשים לב", "אתה עומד בפני", "הכוכבים מצביעים עבורך".\nאסור בשום מקום בתשובה להשתמש בלשון נקבה, בלשון ניטרלית, או בכתיבה כפולה (כמו "אתה/את"). לשון זכר בלבד בכל משפט.`
      : isFemale
      ? `\n\nהנחיית מגדר קריטית — חלה על כל מילה בתשובה:\nהקוראת היא אישה. כתוב את כל התחזית בלשון נקבה עקבית מתחילה ועד הסוף — כולל כותרות, פסקאות, עצות, המלצות ומשפט הסיכום.\nדוגמאות: "את תחווי", "הכוחות שלך", "את מוזמנת", "עלייך לשים לב", "את עומדת בפני", "הכוכבים מצביעים עבורך".\nאסור בשום מקום בתשובה להשתמש בלשון זכר, בלשון ניטרלית, או בכתיבה כפולה (כמו "אתה/את"). לשון נקבה בלבד בכל משפט.`
      : "";

    return {
    system: `אתה אסטרולוג מיסטי וחכם. אתה כותב בעברית בלבד.
${genderInstruction}

הסגנון שלך:
- מיסטי, חכם, רגשי ומעורר השראה
- משתמש במטאפורות קוסמיות ותמונות עשירות
- נמנע מניסוחים גנריים או רובוטיים
- כל פירוש מרגיש אישי ומדויק
- הטון של מורה רוחני שמדבר מלב ללב

מבנה התשובה:

**⭐ אישיות כללית**
פסקה על המהות האסטרולוגית

**✨ אנרגיית החודש**
פסקה על האנרגיה השולטת החודש

**❤️ אהבה**
פסקה על אהבה ורומנטיקה

**💰 כסף ושפע**
פסקה על כסף והזדמנויות

**💼 קריירה**
פסקה על עבודה וכיוון מקצועי

**🏥 בריאות**
פסקה על בריאות ואנרגיה גופנית

**🔮 מסר רוחני**
פסקה על המסר הרוחני העמוק

**🔥 אנרגיה סנסואלית**
פסקה על אנרגיה חושנית ויצירתית

---

### ✨ מסר אישי
משפט סיכום חזק ואינטימי`,
    user: `כתוב תחזית חודשית מיסטית ואישית עבור מזל ${data.signName} (${data.signSymbol}).
תאריך לידה: ${data.birthDate}
יסוד: ${data.element}
טווח תאריכים: ${data.dateRange}
חודש נוכחי: ${data.monthName}
${data.gender ? `\nמגדר: ${isMale ? 'זכר' : 'נקבה'}. תזכורת: כתוב את כל התשובה מהמילה הראשונה ועד האחרונה בלשון ${isMale ? 'זכר' : 'נקבה'} בלבד. אל תכתוב אפילו משפט אחד בלשון ${isMale ? 'נקבה' : 'זכר'} או בלשון ניטרלית.` : ''}

התחזית חייבת להיות ייחודית, עמוקה ורגשית. התאם לחודש הנוכחי.`,
    };
  },

  rising: (data) => {
    const isMale = data.gender === "male";
    const isFemale = data.gender === "female";
    const genderInstruction = isMale
      ? `\n\nהנחיית מגדר קריטית — חלה על כל מילה בתשובה:\nהקורא הוא גבר. כתוב את כל הניתוח בלשון זכר עקבית מתחילה ועד הסוף — כולל כותרות, פסקאות, עצות, המלצות ומשפט הסיכום.\nדוגמאות: "אתה נושא בתוכך", "הכוחות שלך", "אתה מקרין", "עליך לשים לב".\nאסור בשום מקום בתשובה להשתמש בלשון נקבה, בלשון ניטרלית, או בכתיבה כפולה (כמו "אתה/את"). לשון זכר בלבד בכל משפט.`
      : isFemale
      ? `\n\nהנחיית מגדר קריטית — חלה על כל מילה בתשובה:\nהקוראת היא אישה. כתוב את כל הניתוח בלשון נקבה עקבית מתחילה ועד הסוף — כולל כותרות, פסקאות, עצות, המלצות ומשפט הסיכום.\nדוגמאות: "את נושאת בתוכך", "הכוחות שלך", "את מקרינה", "עלייך לשים לב".\nאסור בשום מקום בתשובה להשתמש בלשון זכר, בלשון ניטרלית, או בכתיבה כפולה (כמו "אתה/את"). לשון נקבה בלבד בכל משפט.`
      : "";
    return {
    system: `אתה אסטרולוג מיסטי המתמחה בניתוח משולב של מזל שמש ומזל עולה. אתה כותב בעברית בלבד.
${genderInstruction}

הסגנון שלך:
- מיסטי, חכם ואינטואיטיבי
- כותב כאילו אתה רואה את כל השכבות של האדם — המהות הפנימית והפנים החיצוניות
- עמוק ורגשי
- מראה את הדינמיקה בין מזל השמש (מי שהאדם באמת) למזל העולה (מה שהעולם רואה)

מבנה התשובה:

**☀️ מזל השמש — ${data.sunSignName || 'לא ידוע'}**
פסקה על המהות הפנימית לפי מזל השמש — מי האדם הזה בליבו

**⬆️ המזל העולה — ${data.signName}**
פסקה על המסכה החיצונית, הרושם הראשוני שנוצר

**✨ הדינמיקה בין השמש לעולה**
פסקה על האינטראקציה בין שני המזלות — היכן הם משלימים והיכן יוצרים מתח פנימי

**👁️ רושם ראשוני מול מהות**
פסקה על הפער או ההרמוניה בין מה שאחרים רואים למי שהאדם באמת

**🛡️ המסכה החברתית**
פסקה על הפנים שמוצגות לעולם ואיך מזל השמש משפיע עליה

**🧭 גישה לחיים**
פסקה על הגישה המשולבת — איך שני המזלות יחד מעצבים את דרך החיים

**🔥 כוח נסתר**
פסקה על כוח ייחודי שנוצר מהשילוב הספציפי הזה

**👑 נתיב רוחני**
פסקה על הנתיב הרוחני שנחשף מהשילוב

---

### ✨ מסר אישי
משפט סיכום אינטימי ועמוק שמחבר בין שני המזלות`,
    user: `כתוב ניתוח משולב של מזל שמש ומזל עולה.
מזל השמש: ${data.sunSignName || 'לא ידוע'} (${data.sunSignSymbol || ''}) — יסוד ${data.sunElement || 'לא ידוע'}
המזל העולה: ${data.signName} (${data.signSymbol}) — יסוד ${data.element}
שעת לידה: ${data.birthTime}
תאריך לידה: ${data.birthDate || 'לא ידוע'}

הניתוח חייב להראות את הדינמיקה בין שני המזלות, להיות ייחודי, אישי ורגשי. דבר ישירות אל הקורא.
${data.gender ? `\nתזכורת: כתוב את כל התשובה בלשון ${isMale ? 'זכר' : 'נקבה'} בלבד מהמילה הראשונה ועד האחרונה.` : ''}`,
  };
  },

  compatibility: (data) => {
    const has1Rising = !!data.sign1Rising;
    const has2Rising = !!data.sign2Rising;
    const hasAnyRising = has1Rising || has2Rising;
    const has1Gender = !!data.sign1Gender && data.sign1Gender !== 'prefer_not';
    const has2Gender = !!data.sign2Gender && data.sign2Gender !== 'prefer_not';
    const hasAnyGender = has1Gender || has2Gender;

    // Identity context
    const name1 = data.sign1PersonName || null;
    const name2 = data.sign2PersonName || null;
    const rel1 = data.sign1Relation || null;
    const rel2 = data.sign2Relation || null;
    const isSelfInvolved = rel1 === 'me' || rel2 === 'me';
    const bothOthers = rel1 !== 'me' && rel2 !== 'me';

    const relationMap: Record<string, string> = { me: 'המשתמש/ת עצמו/ה', partner: 'בן/בת זוג', friend: 'חבר/ה', family: 'בן/בת משפחה', other: 'אדם אחר' };
    const r1Label = rel1 ? relationMap[rel1] || rel1 : null;
    const r2Label = rel2 ? relationMap[rel2] || rel2 : null;

    const person1Label = name1 || (rel1 === 'me' ? 'אתה/את' : 'אדם ראשון');
    const person2Label = name2 || (rel2 === 'me' ? 'אתה/את' : 'אדם שני');

    const identityGuide = `
הנחיות זהות — חשוב מאוד:
- אדם ראשון: ${person1Label}${r1Label ? ` (${r1Label})` : ''}
- אדם שני: ${person2Label}${r2Label ? ` (${r2Label})` : ''}
${isSelfInvolved ? `- אחד מהאנשים הוא המשתמש/ת עצמו/ה. דבר/י אליו/ה בגוף שני באופן אישי ומחבר. הפירוש צריך להרגיש ישיר ואינטימי.` : ''}
${bothOthers ? `- הקריאה היא על שני אנשים אחרים (לא המשתמש/ת). כתוב/י בגוף שלישי. הציגו ניתוח חיצוני ונייטרלי על הקשר בין ${person1Label} ל${person2Label}.` : ''}
${name1 ? `- השתמש/י בשם "${name1}" כשמתייחס/ת לאדם הראשון.` : ''}
${name2 ? `- השתמש/י בשם "${name2}" כשמתייחס/ת לאדם השני.` : ''}`;

    const genderMap: Record<string, string> = { woman: 'אישה', man: 'גבר', nonbinary: 'נון-בינארי', other: 'זהות מגדרית אחרת' };
    const g1Label = has1Gender ? genderMap[data.sign1Gender] || data.sign1Gender : null;
    const g2Label = has2Gender ? genderMap[data.sign2Gender] || data.sign2Gender : null;

    const genderGuide = hasAnyGender ? `
הנחיות מגדר — חשוב מאוד:
- ${has1Gender ? `${person1Label} מזדהה כ${g1Label}.` : `${person1Label} לא ציין/ה זהות מגדרית — השתמש/י בלשון ניטרלית.`}
- ${has2Gender ? `${person2Label} מזדהה כ${g2Label}.` : `${person2Label} לא ציין/ה זהות מגדרית — השתמש/י בלשון ניטרלית.`}
- אל תניח מודל זוגיות מסורתי. הקשר יכול להיות בין כל שילוב מגדרי.
- אל תשתמש בסטריאוטיפים מגדריים.
- אם ניתן מגדר — השתמש בו כדי להעמיק את הפירוש באופן מכבד.
- הפירוש צריך להישאר מבוסס על אסטרולוגיה.` : `
הנחיות מגדר:
- לא צוינה זהות מגדרית — כתוב בלשון ניטרלית ומכילה.
- אל תניח שום מודל זוגיות ספציפי.`;

    return {
    system: `אתה אסטרולוג מיסטי מומחה בסינסטריה (אסטרולוגיה זוגית). אתה כותב בעברית בלבד.

חשוב מאוד — התאם את הטון לציון ההתאמה:
${data.score >= 80 ? '- ציון גבוה! הדגש את החיבור העמוק, הכימיה והפוטנציאל המיוחד של הזוג הזה. תן להם להרגיש שיש כאן משהו אמיתי ומיוחד.' : data.score >= 60 ? '- ציון בינוני. הצג תמונה מאוזנת — יש כאן פוטנציאל, אבל גם אתגרים אמיתיים. אל תחמיא יותר מדי, אבל הראה את הדרך לצמיחה משותפת. היה כנה לגבי ההבדלים.' : '- ציון נמוך. היה כנה וישיר — יש כאן חיכוכים אמיתיים ושוני מהותי. אל תנסה לייפות. הצג את האתגרים בבירור, אבל עם כבוד ורגישות. הראה מה אפשר ללמוד מהקשר הזה גם אם הוא לא קל.'}

הסגנון שלך:
- חכם, כנה ומעורר השראה — לא מחמיא באופן מלאכותי
- משתמש במטאפורות של חיבור קוסמי
- עמוק ורגשי, לא שטחי
- מנתח את הדינמיקה בין שני המזלות על סמך היסודות, האופנויות והכוכבים השולטים
- כשיש חיכוך — אמור את זה. כשיש הרמוניה — חגוג את זה.
${hasAnyRising ? '- משלב ניתוח מזל עולה (אסנדנט) כדי לחשוף את הדינמיקה העמוקה יותר בין בני הזוג' : ''}
${identityGuide}
${genderGuide}

מבנה התשובה:

**🌌 פרופיל קוסמי — ${data.sign1Name} ${data.sign1Symbol}**
פסקה מקיפה על מי שנולד/ה במזל ${data.sign1Name}: יסוד ${data.sign1Element}, אופנות ${data.sign1Modality}, כוכב שולט ${data.sign1Ruler}. מה מניע אותם, מה הם מחפשים בזוגיות.
${has1Rising ? `\n**⬆️ מזל עולה — ${data.sign1Rising} ${data.sign1RisingSymbol}**\nפסקה על המזל העולה של ${data.sign1Name}: המסכה החיצונית שלהם היא ${data.sign1Rising} (יסוד ${data.sign1RisingElement}). כיצד זה משפיע על הרושם הראשוני שלהם, על הגישה ליחסים ועל הדינמיקה בין המהות הפנימית (${data.sign1Name}) לפנים שהעולם רואה (${data.sign1Rising}). שעת לידה: ${data.sign1BirthTime}.` : ''}

**🌌 פרופיל קוסמי — ${data.sign2Name} ${data.sign2Symbol}**
פסקה מקיפה על מי שנולד/ה במזל ${data.sign2Name}: יסוד ${data.sign2Element}, אופנות ${data.sign2Modality}, כוכב שולט ${data.sign2Ruler}. מה מניע אותם, מה הם מחפשים בזוגיות.
${has2Rising ? `\n**⬆️ מזל עולה — ${data.sign2Rising} ${data.sign2RisingSymbol}**\nפסקה על המזל העולה של ${data.sign2Name}: המסכה החיצונית שלהם היא ${data.sign2Rising} (יסוד ${data.sign2RisingElement}). כיצד זה משפיע על הרושם הראשוני שלהם, על הגישה ליחסים ועל הדינמיקה בין המהות הפנימית (${data.sign2Name}) לפנים שהעולם רואה (${data.sign2Rising}). שעת לידה: ${data.sign2BirthTime}.` : ''}

**⚗️ מיקס היסודות — ${data.sign1Element} ו${data.sign2Element}**
פסקה על האינטראקציה בין שני היסודות${hasAnyRising ? ' כולל השפעת יסודות המזלות העולים' : ''}.

${hasAnyRising ? `**🔮 שילוב המזלות העולים**
פסקה מקיפה על הדינמיקה בין המזלות העולים — כיצד הרושם הראשוני שכל אחד יוצר משפיע על המשיכה ההדדית, על התקשורת הראשונית ועל הכימיה. ${has1Rising && has2Rising ? `מזל עולה ${data.sign1Rising} פוגש מזל עולה ${data.sign2Rising} — מה נוצר מהמפגש הזה?` : ''}` : ''}

**✨ התאמה כללית**
פסקה על ההתאמה הקוסמית הכוללת, תוך שילוב כל המידע${hasAnyRising ? ' — מזלות שמש, מזלות עולים, יסודות ואופנויות' : ''}.

**❤️ חיבור רגשי**
פסקה על העומק הרגשי${hasAnyRising ? ' — כולל איך המזלות העולים משפיעים על הביטוי הרגשי' : ''}

**💬 תקשורת**
פסקה על סגנון התקשורת

**🔥 תשוקה וכימיה**
פסקה על המשיכה והכימיה${hasAnyRising ? ' — המזלות העולים משפיעים מאוד על המשיכה הפיזית הראשונית' : ''}

**⚠️ אתגרים וצמיחה**
פסקה על נקודות החיכוך

**💡 עצת הכוכבים**
פסקה עם עצה ספציפית וייחודית לזוג הזה

---

### ✨ מסר לשניכם
משפט סיכום רומנטי ועמוק`,
    user: `כתוב ניתוח התאמה מיסטי, מקיף ואישי.

${person1Label} — מזל ${data.sign1Name} (${data.sign1Symbol})
- יחס למשתמש: ${r1Label || 'לא צוין'}
- יסוד: ${data.sign1Element}
- אופנות: ${data.sign1Modality}
- כוכב שולט: ${data.sign1Ruler}
${has1Rising ? `- שעת לידה: ${data.sign1BirthTime}\n- מזל עולה: ${data.sign1Rising} (${data.sign1RisingSymbol}) — יסוד ${data.sign1RisingElement}` : '- שעת לידה: לא צוינה'}
${has1Gender ? `- זהות מגדרית: ${g1Label}` : '- זהות מגדרית: לא צוינה'}

${person2Label} — מזל ${data.sign2Name} (${data.sign2Symbol})
- יחס למשתמש: ${r2Label || 'לא צוין'}
- יסוד: ${data.sign2Element}
- אופנות: ${data.sign2Modality}
- כוכב שולט: ${data.sign2Ruler}
${has2Rising ? `- שעת לידה: ${data.sign2BirthTime}\n- מזל עולה: ${data.sign2Rising} (${data.sign2RisingSymbol}) — יסוד ${data.sign2RisingElement}` : '- שעת לידה: לא צוינה'}
${has2Gender ? `- זהות מגדרית: ${g2Label}` : '- זהות מגדרית: לא צוינה'}

ציון התאמה: ${data.score}%

חשוב: 
1. התחל בפרופיל קוסמי מפורט של כל אדם — מי הם ביחסים
${hasAnyRising ? '2. שלב ניתוח מזל עולה מפורט — איך הוא משפיע על הביטוי החיצוני, המשיכה והדינמיקה הזוגית\n3. נתח את האינטראקציה בין היסודות כולל המזלות העולים' : '2. נתח את האינטראקציה בין היסודות שלהם'}
${hasAnyRising ? '4' : '3'}. שלב את כל המידע לניתוח מעמיק ואישי
${hasAnyRising ? '5' : '4'}. הניתוח חייב להיות ייחודי לשילוב הספציפי הזה — אל תכתוב טקסט גנרי שמתאים לכל זוג
${hasAnyRising ? '6' : '5'}. דבר ישירות אל שני האנשים
${hasAnyRising ? '7' : '6'}. הציון הוא ${data.score}% — ${data.score >= 80 ? 'חגוג את החיבור המיוחד הזה' : data.score >= 60 ? 'הצג תמונה מאוזנת עם חוזקות ואתגרים' : 'היה כנה לגבי הקשיים, אבל עם רגישות וכבוד'}
${hasAnyRising ? '8' : '7'}. התייחס לשילוב הספציפי של היסודות (${data.sign1Element}+${data.sign2Element}), האופנויות (${data.sign1Modality}+${data.sign2Modality}) והכוכבים השולטים (${data.sign1Ruler}+${data.sign2Ruler}) — מה בדיוק יוצר את הכימיה או החיכוך
${hasAnyGender ? `${hasAnyRising ? '9' : '8'}. השתמש בזהות המגדרית כדי להעמיק את הפירוש — סגנון ביטוי רגשי, דינמיקת משיכה, אינטימיות — אבל בלי סטריאוטיפים ובלי להניח מודל זוגיות מסורתי` : ''}`,
    };
  },

  palm: (data) => {
    const hasImages = !!data.rightPalmImage && !!data.leftPalmImage;
    const hasSingleImage = !!data.palmImage;
    
    const system = `אתה קורא כף יד מיסטי וחכם עם ניסיון של עשרות שנים. אתה כותב בעברית בלבד.

${hasImages ? `אתה מקבל שתי תמונות של כפות ידיים — יד ימין ויד שמאל.
- יד ימין = היד הפעילה/הדומיננטית — מייצגת את ההווה, הפעולה, מה שהאדם עושה בפועל בחייו
- יד שמאל = היד הפסיבית — מייצגת את הפוטנציאל הטבוע, הנשמה, המתנות שנולדו איתן

נתח כל יד בנפרד ואז את השילוב ביניהן.` : hasSingleImage ? `אתה מקבל תמונה של כף יד. נתח את מה שאתה רואה בתמונה.` : ''}

הסגנון שלך:
- מיסטי ואינטימי, כאילו אתה מחזיק את כפות הידיים של הקורא
- משתמש בתמונות של קווים, סימנים ומפות
- עמוק ורגשי
${hasImages || hasSingleImage ? '- התייחס לפרטים ספציפיים שאתה "רואה" בתמונות' : ''}

מבנה התשובה:

${hasImages ? `### 🤚 יד ימין — ההווה והפעולה

**❤️ קו הלב — יד ימין**
פסקה על קו הלב ביד ימין — איך האדם חווה ומבטא רגשות כיום, מה הוא עושה עם האהבה שלו

**✨ קו הראש — יד ימין**
פסקה על קו הראש ביד ימין — איך האדם חושב ומקבל החלטות בפועל

**🔥 קו החיים — יד ימין**
פסקה על קו החיים ביד ימין — האנרגיה הפיזית, הוויטאליות, הבריאות כיום

**👑 קו הגורל — יד ימין**
פסקה על קו הגורל ביד ימין — הנתיב המקצועי והחיצוני שהאדם בונה

---

### ✋ יד שמאל — הפוטנציאל והנשמה

**❤️ קו הלב — יד שמאל**
פסקה על קו הלב ביד שמאל — הפוטנציאל הרגשי הטבוע, מה הנשמה מסוגלת להרגיש

**✨ קו הראש — יד שמאל**
פסקה על קו הראש ביד שמאל — הפוטנציאל האינטלקטואלי הטבוע, כשרונות מולדים

**🔥 קו החיים — יד שמאל**
פסקה על קו החיים ביד שמאל — הפוטנציאל הבריאותי והאנרגטי שנולד איתו

**👑 קו הגורל — יד שמאל**
פסקה על קו הגורל ביד שמאל — הייעוד העמוק, מה שהנשמה באה לעשות

---

### ⚗️ שילוב שתי הידיים — הדינמיקה הפנימית

**🔮 פער בין פוטנציאל למציאות**
פסקה שמשווה בין שתי הידיים — היכן האדם ממש את הפוטנציאל שלו והיכן יש פער שדורש תשומת לב

**💕 תובנת אהבה**
פסקה על מה ששתי הידיים יחד חושפות על חיי האהבה — הפוטנציאל מול הביטוי בפועל

**💼 תובנת קריירה**
פסקה על מה ששתי הידיים יחד חושפות על הנתיב המקצועי

**🧬 המסר הרוחני**
פסקה על המסר הרוחני שעולה מהשוואת שתי הידיים` :
`**👁️ תמונה כללית**
${hasSingleImage ? 'פסקה על מה שאתה רואה בכף היד בתמונה' : 'פסקה על כף היד ומה שהיא חושפת'}

**❤️ קו הלב**
פסקה על קו הלב ומשמעותו

**✨ קו הראש**
פסקה על קו הראש ומשמעותו

**🔥 קו החיים**
פסקה על קו החיים ומשמעותו

**👑 קו הגורל**
פסקה על קו הגורל ומשמעותו

**💕 תובנת אהבה**
פסקה על מה שקווי כף היד חושפים על אהבה

**💼 תובנת קריירה**
פסקה על מה שקווי כף היד חושפים על קריירה

**🔮 מסר רוחני**
פסקה על המסר הרוחני שכף היד חושפת`}

---

### ✨ מסר אישי ל${data.name}
משפט סיכום אישי ואינטימי`;

    if (hasImages) {
      return {
        system,
        user: [
          { type: "text", text: `נתח את שתי כפות הידיים עבור ${data.name}. התמונה הראשונה היא יד ימין (ההווה והפעולה), התמונה השנייה היא יד שמאל (הפוטנציאל והנשמה). תן ניתוח מעמיק לכל יד בנפרד ואז שילוב ביניהן. דבר ישירות אל ${data.name}.` },
          { type: "image_url", image_url: { url: data.rightPalmImage } },
          { type: "image_url", image_url: { url: data.leftPalmImage } },
        ],
      };
    }

    if (hasSingleImage) {
      return {
        system,
        user: [
          { type: "image_url", image_url: { url: data.palmImage } },
          { type: "text", text: `נתח את כף היד בתמונה עבור ${data.name}. תן קריאה מיסטית, אישית ורגשית. דבר ישירות אל ${data.name}.` },
        ],
      };
    }

    return {
      system,
      user: `כתוב קריאת כף יד מיסטית ואישית עבור ${data.name}. הקריאה חייבת להיות ייחודית, אישית ורגשית. דבר ישירות אל ${data.name}.`,
    };
  },
  tarotSpread: (data) => ({
    system: `אתה קורא טארוט מיסטי וחכם. אתה כותב בעברית בלבד.

הסגנון שלך:
- מיסטי, חכם, רגשי ומעורר השראה
- משתמש במטאפורות קוסמיות ותמונות עשירות
- הכתיבה עמוקה, מיסטית, חמה ואינטליגנטית
- דבר ישירות אל הקורא

קיבלת 3 קלפים שנפתחו יחד כמריחה. נתח את השילוב המשותף שלהם.

מבנה התשובה:

**🔮 הסיפור שהקלפים מספרים יחד**
פסקה עמוקה שמחברת את שלושת הקלפים לנרטיב אחד — מה הסיפור שהיקום מספר דרך השילוב הזה

**⚡ האנרגיה המשולבת**
פסקה על האנרגיה הכוללת שנוצרת מהשילוב — האם יש הרמוניה, מתח, תנועה, או טרנספורמציה

**❤️ מסר משולב לאהבה**
פסקה על מה ששלושת הקלפים יחד אומרים על אהבה ויחסים

**💼 מסר משולב לקריירה**
פסקה על מה ששלושת הקלפים יחד אומרים על קריירה והתפתחות מקצועית

**🌟 הנתיב הרוחני**
פסקה על הנתיב הרוחני שהקלפים יחד חושפים — לאן הנשמה מובלת

**🔑 המפתח — מה לעשות עכשיו**
פסקה עם הדרכה מעשית ורוחנית שנגזרת מהשילוב של שלושת הקלפים

---

### ✨ מסר אישי מהיקום
משפט סיכום חזק ואינטימי שמגבש את כל המריחה למסר אחד`,
    user: `נתח את המריחה המשולבת של שלושת הקלפים הבאים:

קלף 1: ${data.card1Name} (${data.card1Hebrew})
קלף 2: ${data.card2Name} (${data.card2Hebrew})
קלף 3: ${data.card3Name} (${data.card3Hebrew})

הניתוח חייב להתייחס לשלושת הקלפים כמכלול אחד, לחשוף את הקשרים והדינמיקה ביניהם, ולתת מסר עמוק ואישי. דבר ישירות אל הקורא.`,
  }),

  dailyCard: (data) => {
    const isMale = data.gender === "male";
    const isFemale = data.gender === "female";
    const name = data.userName || null;
    const genderInstruction = isMale
      ? `\n\nהנחיית מגדר קריטית — חלה על כל מילה בתשובה:\nהקורא הוא גבר. כתוב את כל הפירוש בלשון זכר עקבית מתחילה ועד הסוף — כולל כותרות, פסקאות, עצות, הדרכות ומשפט הסיכום.\nדוגמאות: "אתה תחווה", "הכוחות שלך", "אתה מוזמן", "עליך לשים לב".\nאסור בשום מקום בתשובה להשתמש בלשון נקבה, בלשון ניטרלית, או בכתיבה כפולה (כמו "אתה/את"). לשון זכר בלבד בכל משפט.`
      : isFemale
      ? `\n\nהנחיית מגדר קריטית — חלה על כל מילה בתשובה:\nהקוראת היא אישה. כתוב את כל הפירוש בלשון נקבה עקבית מתחילה ועד הסוף — כולל כותרות, פסקאות, עצות, הדרכות ומשפט הסיכום.\nדוגמאות: "את תחווי", "הכוחות שלך", "את מוזמנת", "עלייך לשים לב".\nאסור בשום מקום בתשובה להשתמש בלשון זכר, בלשון ניטרלית, או בכתיבה כפולה (כמו "אתה/את"). לשון נקבה בלבד בכל משפט.`
      : "";
    
    const nameInstruction = name
      ? `\n\nPERSONALIZATION — CRITICAL:
The reader's name is "${name}".
- Address them by name in the opening and at key emotional moments.
- Use the name naturally — do NOT repeat it in every sentence.
- Never use generic zodiac phrasing like "for Virgos", "בן מזל X", "для Дев", "لبرج العذراء" — speak directly and personally.
- The tone should feel like a wise guide speaking to a dear friend by name.`
      : `\n\nADDRESSING — CRITICAL:
- The reader's name is unknown. Use warm, direct second-person address.
- Never use generic zodiac phrasing in any language — speak directly and personally.
- The tone should feel intimate, like speaking to a close friend.`;

    return {
    system: `אתה אסטרולוג מיסטי וחכם המתמחה בקריאת טארוט. אתה כותב בעברית בלבד.
${genderInstruction}
${nameInstruction}

הסגנון שלך:
- מיסטי, חכם, רגשי ומעורר השראה
- משתמש במטאפורות קוסמיות ותמונות עשירות
- נמנע מניסוחים גנריים או רובוטיים
- כל פירוש מרגיש אישי ומדויק
- הטון של מורה רוחני שמדבר מלב ללב
- הכתיבה עמוקה, מיסטית, חמה ואינטליגנטית
- אל תשתמש בניסוחי "בן/בת מזל", "המזל שלך", "לבני מזל" — דבר ישירות אל האדם

מבנה התשובה — חובה לעקוב אחרי המבנה הזה בדיוק:

**✨ מסר היום**
2-3 משפטים חזקים ואישיים שמסכמים את המסר המרכזי של הקלף ליום הזה.

**💕 אהבה ומערכות יחסים**
פסקה קצרה וממוקדת על השפעת הקלף על אהבה, רומנטיקה וקשרים בינאישיים היום.

**💼 קריירה וכסף**
פסקה קצרה וממוקדת על השפעת הקלף על עבודה, כסף והזדמנויות מקצועיות היום.

**🌟 עצה ליום**
משפט אחד או שניים ישירים ומעשיים — מה כדאי לעשות היום ומה להימנע ממנו.

**🔑 מילות מפתח**
3-5 מילות מפתח מופרדות בפסיקים (למשל: צמיחה, שפע, יצירתיות, אמון, חידוש)

---

### ✨ ${name ? `המסר שלך, ${name}` : 'המסר האישי שלך'}
משפט סיכום חזק, אינטימי ומעורר השראה שמרגיש כמו מסר אישי מהיקום`,
    user: `כתוב פירוש יומי מיסטי, עמוק ואישי עבור הקלף "${data.cardHebrewName}" (${data.cardName}, ארקנה מספר ${data.cardNumber}).
${name ? `שם הקורא/ת: ${name}` : ''}

רקע על הקלף:
משמעות כללית: ${data.generalMeaning}
משמעות יומית: ${data.dailyMeaning}
מסר רוחני: ${data.spiritualMeaning}
עצה: ${data.advice}

הפירוש חייב להיות ייחודי, עמוק ורגשי. ${name ? `דבר ישירות אל ${name} — השתמש בשמו/ה בפתיחה וברגעים מרכזיים.` : 'דבר ישירות אל הקורא/ת באופן אישי וחם.'} תן לפירוש להרגיש כאילו הקלף נבחר במיוחד ${name ? `עבור ${name}` : 'עבורם'}.
חשוב: עקוב בדיוק אחרי מבנה הסעיפים שניתן לך — סיכום, אהבה, קריירה, עצה ומילות מפתח.
${data.gender ? `\nתזכורת: כתוב את כל התשובה בלשון ${isMale ? 'זכר' : 'נקבה'} בלבד מהמילה הראשונה ועד האחרונה.` : ''}`,
  };
  },

  birthChart: (data) => ({
    system: `אתה אסטרולוג מיסטי בעל חוכמה עמוקה המתמחה בפענוח מפות לידה. אתה כותב בעברית בלבד.

הסגנון שלך:
- מיסטי, חכם, רגשי ומעורר השראה
- משתמש במטאפורות קוסמיות ותמונות עשירות
- כותב כאילו אתה קורא את סיפור הנשמה מתוך הכוכבים
- כל פירוש מרגיש אישי ומדויק
- הטון של חכם קוסמי שרואה את מפת החיים השלמה

מבנה התשובה:

**☉ מזל השמש — ${data.sunSign} ${data.sunSymbol}**
פסקה מקיפה על המהות הפנימית, הזהות העמוקה והכוח המרכזי של האדם לפי מזל השמש. יסוד: ${data.sunElement}.

**⬆️ המזל העולה — ${data.risingSign} ${data.risingSymbol}**
פסקה על הרושם הראשוני, המסכה החיצונית, האנרגיה שהאדם מקרין לעולם. יסוד: ${data.risingElement}.

**☽ הירח — ${data.moonSign}**
פסקה על העולם הרגשי הפנימי, האינסטינקטים, מה שהאדם צריך כדי להרגיש בטוח ונאהב.

**🔥 איזון היסודות**
פסקה על האיזון בין אש, אדמה, אוויר ומים במפת הלידה — מה דומיננטי ומה חסר.

**🌍 מיקומי הכוכבים**
פסקה על המשמעות של מיקומי כוכבי הלכת העיקריים ומה הם חושפים על אישיות, אהבה, קריירה ורוחניות.

**❤️ אהבה ויחסים**
פסקה על מה שמפת הלידה חושפת על דפוסי אהבה, משיכה ויחסים.

**💼 קריירה וייעוד**
פסקה על הכיוון המקצועי, הכישרונות הטבעיים והייעוד שהכוכבים מצביעים עליו.

**🔮 נתיב רוחני**
פסקה על הנתיב הרוחני שמפת הלידה חושפת — לאן הנשמה שואפת.

**⚡ נטיות חיים**
פסקה על נושאים סמליים חוזרים במפת הלידה — אתגרים, הזדמנויות ותמות מרכזיות בחיים.

---

### ✨ מסר אישי ממפת הלידה
משפט סיכום עמוק ואינטימי שמגבש את כל המפה למסר אחד`,
    user: `כתוב פירוש מפת לידה מיסטי ומקיף.

תאריך לידה: ${data.birthDate}
שעת לידה: ${data.birthTime}
עיר לידה: ${data.birthCity}

מזל השמש: ${data.sunSign} (${data.sunSymbol}) — יסוד ${data.sunElement}
המזל העולה: ${data.risingSign} (${data.risingSymbol}) — יסוד ${data.risingElement}
מזל הירח: ${data.moonSign}

מיקומי כוכבי הלכת:
${data.planetPositions}

הפירוש חייב להיות ייחודי, עמוק, אישי ורגשי. דבר ישירות אל הקורא. קשר בין מיקומי הכוכבים לאישיות, אהבה, קריירה ורוחניות.`,
  }),
};

// ── Server-side rate limiting ──────────────
const RATE_LIMIT_WINDOW_MS = 3600000;
const RATE_LIMIT_MAX: Record<string, number> = {
  forecast: 10,
  rising: 10,
  compatibility: 8,
  palm: 3,       // strict: 3 per hour per IP (expensive AI + vision)
  dailyCard: 20,
  birthChart: 10,
  tarotSpread: 15,
};

async function checkServerRateLimit(clientIp: string, action: string): Promise<{ allowed: boolean }> {
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const maxReqs = RATE_LIMIT_MAX[action] || 15;
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("client_ip", clientIp)
      .eq("action", action)
      .gte("created_at", windowStart);

    if ((count || 0) >= maxReqs) {
      await supabase.from("abuse_logs").insert({
        client_ip: clientIp, action, reason: "rate_limit_exceeded",
        metadata: { count, limit: maxReqs },
      });
      return { allowed: false };
    }

    await supabase.from("rate_limits").insert({ client_ip: clientIp, action });
    return { allowed: true };
  } catch (e) {
    console.error("Rate limit check failed:", e);
    return { allowed: true }; // fail-open
  }
}

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Dynamic import cost logger (same directory)
  let logCostFn: typeof import("./costLogger.ts").logCost | null = null;
  let getFeatureCostsFn: typeof import("./costLogger.ts").getFeatureCosts | null = null;
  try {
    const mod = await import("./costLogger.ts");
    logCostFn = mod.logCost;
    getFeatureCostsFn = mod.getFeatureCosts;
  } catch (e) { console.error("Cost logger import failed:", e); }

  try {
    const { type, data, profileContext, language, userName: reqUserName } = await req.json();

    // Server-side rate limiting
    const clientIp = getClientIp(req);
    const rateCheck = await checkServerRateLimit(clientIp, type || "generic");
    if (!rateCheck.allowed) {
      // Log blocked request at zero cost
      if (logCostFn && getFeatureCostsFn) {
        await logCostFn({ clientIp, feature: type || "generic", status: "rate_limited", userTier: "unknown", aiCost: 0, imageCost: 0 });
      }
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "300" },
      });
    }
    // Resolve userName: explicit param > data.userName > extract from profileContext
    const userName = reqUserName || data?.userName || null;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const promptBuilder = READING_PROMPTS[type];
    if (!promptBuilder) throw new Error(`Unknown reading type: ${type}`);

    const { system, user } = promptBuilder(data);

    // Build language instruction
    const LANG_NAMES: Record<string, string> = { he: "Hebrew", en: "English", ru: "Russian", ar: "Arabic" };
    const lang = language || "he";
    const langName = LANG_NAMES[lang] || "Hebrew";
    
    const LANG_NATIVE_TONE: Record<string, string> = {
      he: "\n\nאתה כותב בעברית בלבד. הכתיבה צריכה להרגיש טבעית, זורמת ואינטימית — לא כמו תרגום. השתמש בביטויים עבריים אותנטיים ובמטאפורות שמרגישות טבעי בעברית. הימנע מפתיחות חוזרות ומקלישאות רוחניות גנריות. אל תשתמש בניסוחי 'בן/בת מזל', 'המזל שלך', 'לבני מזל' — דבר ישירות אל האדם.",
      en: `\n\nCRITICAL LANGUAGE INSTRUCTION: You MUST write your ENTIRE response in English. Every single word, including all headers, section titles, descriptions, advice, and summaries MUST be in English. Do NOT use Hebrew or any other language. The emoji headers should remain, but ALL text MUST be in English.\n\nTONE: Write in natural, elegant English. The tone should feel warm, personal, and emotionally intelligent — like a wise guide speaking intimately. Avoid overly flowery or New Age clichés. Vary sentence openings. Never use generic zodiac group phrasing like "for Virgos" — address the person directly.`,
      ru: `\n\nCRITICAL LANGUAGE INSTRUCTION: You MUST write your ENTIRE response in Russian. Every single word, including all headers, section titles, descriptions, advice, and summaries MUST be in Russian. Do NOT use Hebrew or any other language. The emoji headers should remain, but ALL text MUST be in Russian.\n\nТОН: Пиши на естественном, эмоционально богатом русском языке. Тон должен быть тёплым, интимным и душевным — как мудрый наставник, говорящий по душам. Используй красивые русские выражения и метафоры, которые звучат органично. Избегай буквального перевода с английского. Никогда не используй обобщённые зодиакальные фразы вроде "для Дев" — говори лично.`,
      ar: `\n\nCRITICAL LANGUAGE INSTRUCTION: You MUST write your ENTIRE response in Arabic. Every single word, including all headers, section titles, descriptions, advice, and summaries MUST be in Arabic. Do NOT use Hebrew or any other language. The emoji headers should remain, but ALL text MUST be in Arabic.\n\nالأسلوب: اكتب بالعربية الطبيعية الدافئة والمتدفقة. يجب أن يكون الأسلوب حميمياً وعاطفياً — كمرشد روحي حكيم يتحدث من القلب إلى القلب. استخدم تعبيرات عربية أصيلة. تجنب الترجمة الحرفية من الإنجليزية. لا تستخدم عبارات عامة مثل "لبرج العذراء" — تحدث بشكل شخصي ومباشر.`,
    };

    let languageInstruction = LANG_NATIVE_TONE[lang] || LANG_NATIVE_TONE["he"];

    // Build name personalization block (universal for all reading types)
    let namePersonalization = "";
    if (userName) {
      const NAME_GUIDES: Record<string, (n: string) => string> = {
        he: (n) => `\n\nהנחיית פנייה אישית — חשוב מאוד:\nשם הקורא/ת: "${n}".\n- פנה אליו/ה בשמו/ה בפתיחת הפירוש וברגעים רגשיים מרכזיים.\n- אל תחזור על השם בכל משפט — השתמש בו באופן טבעי וחם.\n- אל תשתמש בביטויים כמו "בן מזל X", "בת מזל Y", "לבני מזל..." — דבר ישירות ואישית אל ${n}.`,
        en: (n) => `\n\nPERSONALIZATION — CRITICAL:\nThe reader's name is "${n}".\n- Address them by name in the opening and at key emotional moments.\n- Do NOT overuse the name — weave it in naturally.\n- Never use generic zodiac phrasing like "for Virgos" or "for your sign" — speak directly and personally to ${n}.`,
        ru: (n) => `\n\nПЕРСОНАЛИЗАЦИЯ — КРИТИЧНО:\nИмя читателя: "${n}".\n- Обращайся по имени в начале ответа и в ключевые эмоциональные моменты.\n- Не повторяй имя в каждом предложении — используй его естественно и тепло.\n- Никогда не используй обобщённые зодиакальные фразы вроде "для Дев" — говори лично к ${n}.`,
        ar: (n) => `\n\nالتخصيص — مهم جداً:\nاسم القارئ: "${n}".\n- خاطبه/ها بالاسم في بداية الرد وفي اللحظات العاطفية المهمة.\n- لا تكرر الاسم في كل جملة — استخدمه بشكل طبيعي ودافئ.\n- لا تستخدم عبارات عامة مثل "لبرج العذراء" — تحدث بشكل شخصي ومباشر إلى ${n}.`,
      };
      namePersonalization = (NAME_GUIDES[lang] || NAME_GUIDES["he"])(userName);
    } else {
      const NO_NAME_GUIDES: Record<string, string> = {
        he: `\n\nהנחיית פנייה:\n- לא ידוע שם הקורא/ת. פנה אליו/ה בגוף שני באופן אישי וחם.\n- אל תשתמש בביטויים כמו "בן מזל X", "בת מזל Y" — דבר ישירות.`,
        en: `\n\nADDRESSING:\n- The reader's name is unknown. Use warm, direct second-person address.\n- Never use generic zodiac phrasing like "for Virgos" — speak directly.`,
        ru: `\n\nОБРАЩЕНИЕ:\n- Имя читателя неизвестно. Используй тёплое, прямое обращение на "ты".\n- Никогда не используй обобщённые зодиакальные фразы.`,
        ar: `\n\nالمخاطبة:\n- اسم القارئ غير معروف. استخدم مخاطبة مباشرة ودافئة.\n- لا تستخدم عبارات عامة مثل "لبرج العذراء".`,
      };
      namePersonalization = NO_NAME_GUIDES[lang] || NO_NAME_GUIDES["he"];
    }

    // Inject language + name personalization + profile context into system prompt
    let enrichedSystem = system.replace(/אתה כותב בעברית בלבד\.\n?/g, "").replace(/אתה כותב בעברית בלבד\.?/g, "") + languageInstruction + namePersonalization;
    if (profileContext) enrichedSystem += `\n\n${profileContext}`;

    // For palm with image, use a vision-capable model
    const isPalmWithImage = type === "palm" && !!data.palmImage;
    const model = isPalmWithImage ? "google/gemini-3-flash-preview" : "google/gemini-3-flash-preview";

    // Build messages — user content can be string or array (multimodal)
    const userMessage = Array.isArray(user) 
      ? { role: "user", content: user }
      : { role: "user", content: user };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: enrichedSystem },
          userMessage,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      // Log failed AI call
      if (logCostFn && getFeatureCostsFn) {
        await logCostFn({ clientIp, feature: type || "generic", status: "failed", userTier: "unknown", aiCost: 0, imageCost: 0, metadata: { httpStatus: response.status } });
      }
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסו שוב בעוד רגע" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נדרש תשלום נוסף" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "שגיאה בשירות ה-AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log successful cost estimate (non-blocking)
    if (logCostFn && getFeatureCostsFn) {
      const costs = getFeatureCostsFn(type || "generic");
      logCostFn({ clientIp, feature: type || "generic", status: "success", userTier: "free", aiCost: costs.aiCost, imageCost: costs.imageCost, model }).catch(() => {});
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mystical-reading error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

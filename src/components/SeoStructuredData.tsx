import { useEffect } from "react";
import { useLanguage } from "@/i18n";

const SITE_URL = "https://mysticaitechnologies.com";

const SeoStructuredData = () => {
  const { language } = useLanguage();

  useEffect(() => {
    // Set meta title/description
    const isHe = language === "he";
    const title = isHe
      ? "ASTROLOGAI — קריאת טארוט, קריאת כף יד, התאמה זוגית והדרכה רוחנית"
      : "ASTROLOGAI — Tarot Reading, Palm Reading, Zodiac Compatibility & Spiritual Guidance";
    const description = isHe
      ? "קבלו קריאת טארוט אישית, קריאת כף יד מבוססת AI, בדיקת התאמה זוגית לפי מזלות, מפת לידה והורוסקופ חודשי — בחינם. חוויה מיסטית פרימיום מבית ASTROLOGAI."
      : "Get a personalized AI tarot reading, palm reading analysis, zodiac compatibility test, birth chart and monthly horoscope — free. Premium mystical experience by ASTROLOGAI.";

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description);

    // Organization schema
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ASTROLOGAI",
      url: SITE_URL,
      logo: `${SITE_URL}/placeholder.svg`,
      description: "AI-powered astrology, tarot reading, palm reading, and zodiac compatibility platform.",
      sameAs: [],
    };

    // WebSite schema with search
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ASTROLOGAI",
      url: SITE_URL,
      description: "AI-powered tarot reading, palm reading, zodiac compatibility test, and spiritual guidance.",
      inLanguage: ["he", "en", "ar", "ru"],
    };

    // Service schema
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "Spiritual Guidance & Mystical Readings",
      provider: { "@type": "Organization", name: "ASTROLOGAI" },
      areaServed: { "@type": "Country", name: "Israel" },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Mystical Services",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tarot Reading Online", description: "AI-powered personalized tarot card reading with deep interpretation" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Palm Reading Online", description: "Upload hand photos for AI palm reading analysis" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Zodiac Compatibility Test", description: "Check romantic compatibility by zodiac signs" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Birth Chart Analysis", description: "Personal astrology birth chart with planet placements" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Monthly Horoscope", description: "Free personalized monthly horoscope forecast" } },
        ],
      },
    };

    // FAQ schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: isHe ? "האם השירות חינמי?" : "Is the service free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isHe
              ? "כן! קריאת טארוט יומית, הורוסקופ חודשי וקלף יומי הם בחינם. ניתן לשדרג לחוויה מורחבת עם מנוי פרימיום."
              : "Yes! Daily tarot reading, monthly horoscope and daily card are free. You can upgrade for extended experiences with a premium subscription.",
          },
        },
        {
          "@type": "Question",
          name: isHe ? "איך עובדת קריאת כף היד?" : "How does palm reading work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isHe
              ? "העלו תמונות של כפות הידיים שלכם, ומערכת ה-AI שלנו תנתח את קווי החיים, הלב, הגורל והאינטואיציה."
              : "Upload photos of your palms, and our AI system analyzes your life line, heart line, fate line, and intuition line.",
          },
        },
        {
          "@type": "Question",
          name: isHe ? "האם הקריאות מותאמות אישית?" : "Are the readings personalized?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isHe
              ? "בהחלט. כל קריאה מבוססת על הנתונים שאתם מזינים — שם, תאריך לידה, שאלה ספציפית — ומותאמת אליכם באופן אישי."
              : "Absolutely. Every reading is based on the data you provide — name, birth date, specific question — and is personalized to you.",
          },
        },
        {
          "@type": "Question",
          name: isHe ? "איך בודקים התאמה זוגית?" : "How does zodiac compatibility work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isHe
              ? "הזינו את תאריכי הלידה של שני בני הזוג, וקבלו ניתוח מעמיק של ההתאמה הרוחנית, הרגשית והרומנטית ביניכם."
              : "Enter both partners' birth dates and receive a deep analysis of your spiritual, emotional, and romantic compatibility.",
          },
        },
        {
          "@type": "Question",
          name: isHe ? "באילו שפות האתר זמין?" : "Which languages are available?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isHe
              ? "ASTROLOGAI זמין בעברית, אנגלית, ערבית ורוסית."
              : "ASTROLOGAI is available in Hebrew, English, Arabic, and Russian.",
          },
        },
      ],
    };

    const schemas = [orgSchema, websiteSchema, serviceSchema, faqSchema];
    const scriptId = "seo-structured-data";

    // Remove old
    document.getElementById(scriptId)?.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = scriptId;
    script.textContent = JSON.stringify(schemas);
    document.head.appendChild(script);

    return () => { document.getElementById(scriptId)?.remove(); };
  }, [language]);

  return null;
};

export default SeoStructuredData;

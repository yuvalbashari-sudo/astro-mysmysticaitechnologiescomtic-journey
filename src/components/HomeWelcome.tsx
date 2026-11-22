import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpLeft, ArrowUpRight, Heart, History, Layers, Sparkles, Sun } from "lucide-react";
import { useLanguage, useT } from "@/i18n";
import EntryLayout from "./EntryLayout";
import AdvisorChatPanel from "./AdvisorChatPanel";
import MobileOptionsSheet from "./MobileOptionsSheet";
import ReadingsHistoryModal from "./ReadingsHistoryModal";
import HomeScreenInstall from "./HomeScreenInstall";
import SeoStructuredData from "./SeoStructuredData";
import norielle from "@/assets/hero-mystic-figure.jpg";
import "./homeWelcome.css";

const copy = {
  he: {
    title: "טארוט, הורוסקופ ותובנות אישיות",
    intro: "מה מעסיק אותך היום? אפשר לשאול את הקלפים, להכיר את מפת הלידה או לבדוק מה מחכה בהורוסקופ האישי.",
    tarot: "שאלת טארוט אישית", tarotDetail: "כותבים שאלה, בוחרים שלושה קלפים ומקבלים פירוש.",
    horoscope: "ההורוסקופ שלי", horoscopeDetail: "התחזית האישית שלך להיום.",
    more: "כל אפשרויות הקריאה", history: "הקריאות שלי", norielle: "שיחה עם נוריאל",
    portrait: "נוריאל מחזיקה כדור אור, על רקע גלגל המזלות", choose: "במה נעמיק היום?", guides: "מדריכים",
  },
  en: {
    title: "Tarot, astrology and personal insight",
    intro: "What’s on your mind today? Ask the cards, explore your birth chart or read your personal horoscope.",
    tarot: "Ask the tarot cards", tarotDetail: "Write a question, choose three cards and receive your reading.",
    horoscope: "My daily horoscope", horoscopeDetail: "Your personal forecast for today.",
    more: "Explore all readings", history: "My readings", norielle: "Talk with Norielle",
    portrait: "Norielle holding a glowing orb in front of the zodiac wheel", choose: "What would you like to explore?", guides: "Guides",
  },
  ru: {
    title: "Таро, астрология и личные подсказки",
    intro: "Что вас волнует сегодня? Задайте вопрос картам, изучите натальную карту или прочитайте личный гороскоп.",
    tarot: "Задать вопрос картам Таро", tarotDetail: "Напишите вопрос, выберите три карты и получите толкование.",
    horoscope: "Мой гороскоп на сегодня", horoscopeDetail: "Ваш личный прогноз на день.",
    more: "Все виды чтений", history: "Мои чтения", norielle: "Поговорить с Нориэль",
    portrait: "Нориэль держит светящийся шар на фоне зодиакального круга", choose: "Что вы хотите узнать?", guides: "Руководства",
  },
  ar: {
    title: "التاروت والأبراج ورؤى شخصية",
    intro: "ما الذي يشغلك اليوم؟ اسأل البطاقات، استكشف خريطة ميلادك أو اقرأ توقعاتك الشخصية.",
    tarot: "اسأل بطاقات التاروت", tarotDetail: "اكتب سؤالك، اختر ثلاث بطاقات واحصل على قراءتك.",
    horoscope: "توقعاتي اليومية", horoscopeDetail: "توقعاتك الشخصية لهذا اليوم.",
    more: "جميع أنواع القراءات", history: "قراءاتي", norielle: "تحدث مع نورييل",
    portrait: "نورييل تحمل كرة مضيئة أمام دائرة الأبراج", choose: "ما الذي تودّ استكشافه؟", guides: "أدلة",
  },
};

export default function HomeWelcome() {
  const { language, isRTL } = useLanguage();
  const t = useT();
  const c = copy[language];
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;

  return <EntryLayout home>
    <SeoStructuredData />
    <section className="welcome-hero" aria-labelledby="welcome-title">
      <div className="welcome-copy">
        <h1 id="welcome-title">{c.title}</h1>
        <p className="welcome-intro">{c.intro}</p>
        <div className="welcome-start">
          <Link to="/tarot-start" className="welcome-primary">
            <Sparkles size={23} aria-hidden="true" />
            <span><strong>{c.tarot}</strong><small>{c.tarotDetail}</small></span>
            <Arrow size={22} aria-hidden="true" />
          </Link>
          <Link to="/daily-horoscope" className="welcome-secondary">
            <Sun size={23} aria-hidden="true" />
            <span><strong>{c.horoscope}</strong><small>{c.horoscopeDetail}</small></span>
            <Arrow size={22} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <figure className="welcome-portrait">
        <img src={norielle} alt={c.portrait} fetchPriority="high" />
        <figcaption><button type="button" onClick={() => setChatOpen(true)}><Sparkles size={17} aria-hidden="true" />{c.norielle}</button></figcaption>
      </figure>
    </section>
    <section className="welcome-explore" aria-labelledby="welcome-explore-title">
      <h2 id="welcome-explore-title">{c.choose}</h2>
      <div className="welcome-services">
        <Link to="/zodiac-compatibility"><Heart aria-hidden="true" /><span>{t.hero_menu_compatibility}</span><Arrow aria-hidden="true" size={18} /></Link>
        <Link to="/birth-chart"><Layers aria-hidden="true" /><span>{t.hero_menu_birthchart}</span><Arrow aria-hidden="true" size={18} /></Link>
        <button type="button" onClick={() => setOptionsOpen(true)}><Sparkles aria-hidden="true" /><span>{c.more}</span><Arrow aria-hidden="true" size={18} /></button>
      </div>
    </section>
    <div className="welcome-links">
      <button type="button" onClick={() => setHistoryOpen(true)}><History size={17} aria-hidden="true" />{c.history}</button>
      <Link to="/tarot-guides">{c.guides}</Link>
      <Link to="/upgrade">{t.compat_premium_cta}</Link>
      <div className="md:hidden"><HomeScreenInstall /></div>
    </div>
    <MobileOptionsSheet isOpen={optionsOpen} onClose={() => setOptionsOpen(false)} />
    <ReadingsHistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    <AdvisorChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
  </EntryLayout>;
}

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sun } from "lucide-react";
import MysticalLanguageDropdown from "./MysticalLanguageDropdown";
import ProfileReset from "./ProfileReset";
import AccountLink from "./AccountLink";
import { useLanguage, useT } from "@/i18n";
import "./entryLayout.css";

const homeUrl = "/?view=services";

export const entryCopy = {
  he: { home: "חזרה למסך הבית", title: "מה השאלה שלך לקלפים?", intro: "שלושה קלפים ופירוש אישי לשאלה שמעסיקה אותך.", label: "השאלה שלי", hint: "למשל, מה יעזור לי להתחיל פרויקט חדש?", pick: "לבחירת שלושה קלפים", choose: "בחירת שלושה קלפים", spread: "הקלפים שבחרת", another: "לפתיחה חדשה" },
  en: { home: "Back to home", title: "What would you like to ask the cards?", intro: "Draw three cards for a personal reading about what’s on your mind.", label: "My question", hint: "For example, how can I get a new project started?", pick: "Choose three cards", choose: "Choose three cards", spread: "Your selected cards", another: "Start a new reading" },
  ru: { home: "На главную", title: "Что вы хотите спросить у карт?", intro: "Выберите три карты и получите личный ответ на свой вопрос.", label: "Мой вопрос", hint: "Например, с чего начать новый проект?", pick: "Перейти к выбору трёх карт", choose: "Выберите три карты", spread: "Ваши карты", another: "Новый расклад" },
  ar: { home: "العودة إلى الرئيسية", title: "ما سؤالك للبطاقات؟", intro: "اختر ثلاث بطاقات لتحصل على قراءة شخصية حول ما يشغل بالك.", label: "سؤالي", hint: "مثلاً، ما الذي يساعدني على بدء مشروع جديد؟", pick: "اختيار ثلاث بطاقات", choose: "اختر ثلاث بطاقات", spread: "البطاقات التي اخترتها", another: "بدء قراءة جديدة" },
};

export const resetCopy = {
  he: { clear: "ניקוי השאלה", cards: "איפוס בחירת הקלפים", edit: "עריכת השאלה", details: "איפוס פרטי ההורוסקופ", cancel: "ביטול וחזרה לתחזית" },
  en: { clear: "Clear question", cards: "Reset card selection", edit: "Edit question", details: "Reset horoscope details", cancel: "Cancel and return to forecast" },
  ru: { clear: "Очистить вопрос", cards: "Сбросить выбор карт", edit: "Изменить вопрос", details: "Сбросить данные гороскопа", cancel: "Отмена и возврат к прогнозу" },
  ar: { clear: "مسح السؤال", cards: "إعادة اختيار البطاقات", edit: "تعديل السؤال", details: "إعادة ضبط بيانات الأبراج", cancel: "إلغاء والعودة إلى التوقعات" },
};

export default function EntryLayout({children, home = false}: {children: ReactNode; home?: boolean}) {
  const {language, dir} = useLanguage();
  const t = useT();
  return <div className="entry-page" dir={dir}>
    <a href="#entry-main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-slate-950 focus:p-3 focus:text-gold">{t.a11y_skip_to_content}</a>
    <header className="entry-nav">
      <Link className="entry-brand" to={homeUrl} aria-label="ASTROLOGAI" dir="ltr"><Sun aria-hidden="true" size={24}/>ASTROLOGAI</Link>
      <nav>{home ? <AccountLink /> : <Link to={homeUrl}>{entryCopy[language].home}</Link>}<MysticalLanguageDropdown /></nav>
    </header>
    <main id="entry-main" className="entry-main">{children}</main>
    <footer className="entry-main pt-6"><ProfileReset /></footer>
  </div>;
}

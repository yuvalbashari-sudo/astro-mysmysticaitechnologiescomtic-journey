import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useLanguage } from "@/i18n";

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Chrome may offer installation before the animated mobile homepage mounts.
let pendingPrompt: InstallPrompt | undefined;
let installedThisVisit = false;
window.addEventListener("beforeinstallprompt", (event) => {
  if (!window.matchMedia("(max-width: 767px)").matches) return;
  event.preventDefault();
  pendingPrompt = event as InstallPrompt;
});
window.addEventListener("appinstalled", () => {
  installedThisVisit = true;
  pendingPrompt = undefined;
});

const labels = {
  he: {
    button: "הוספה למסך הבית",
    ios: "פתחו את האתר ב־Safari, לחצו על שיתוף ובחרו ״הוספה למסך הבית״. אם מופיעה האפשרות ״פתיחה כיישום אינטרנט״, הפעילו אותה ולחצו על ״הוספה״.",
    other: "פתחו את האתר ב־Chrome. בתפריט ⋮ בחרו ״הוספה למסך הבית״ או ״התקנת האפליקציה״ ואשרו.",
  },
  en: {
    button: "Add to Home Screen",
    ios: "Open this site in Safari, tap Share, then Add to Home Screen. Enable Open as Web App if shown, then tap Add.",
    other: "Open this site in Chrome. Tap the ⋮ menu, choose Add to Home screen or Install app, then confirm.",
  },
  ar: {
    button: "إضافة إلى الشاشة الرئيسية",
    ios: "افتح الموقع في Safari، ثم اضغط على مشاركة واختر إضافة إلى الشاشة الرئيسية. فعّل الفتح كتطبيق ويب إذا ظهر الخيار، ثم اضغط على إضافة.",
    other: "افتح الموقع في Chrome. من قائمة ⋮ اختر إضافة إلى الشاشة الرئيسية أو تثبيت التطبيق، ثم أكّد.",
  },
  ru: {
    button: "Добавить на главный экран",
    ios: "Откройте сайт в Safari. Нажмите «Поделиться», затем «На экран Домой». Если появится вариант «Открывать как веб-приложение», включите его и нажмите «Добавить».",
    other: "Откройте сайт в Chrome. В меню ⋮ выберите «Добавить на главный экран» или «Установить приложение» и подтвердите.",
  },
};

function isStandalone() {
  return installedThisVisit || window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function HomeScreenInstall() {
  const { language } = useLanguage();
  const copy = labels[language];
  const [installed, setInstalled] = useState(isStandalone);
  const [showSteps, setShowSteps] = useState(false);
  const [prompting, setPrompting] = useState(false);
  const isAppleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  useEffect(() => {
    const display = window.matchMedia("(display-mode: standalone)");
    const update = () => setInstalled(isStandalone());
    window.addEventListener("appinstalled", update);
    display.addEventListener("change", update);
    return () => {
      window.removeEventListener("appinstalled", update);
      display.removeEventListener("change", update);
    };
  }, []);

  async function install() {
    const prompt = pendingPrompt;
    if (!prompt) {
      setShowSteps((visible) => !visible);
      return;
    }
    pendingPrompt = undefined;
    setShowSteps(false);
    setPrompting(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
    } catch {
      setShowSteps(true);
    } finally {
      setPrompting(false);
    }
  }

  if (installed) return null;
  return (
    <div className="mt-2 text-center font-body">
      <button type="button" onClick={install} disabled={prompting} aria-expanded={showSteps}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/30 bg-slate-950/90 px-4 text-sm font-medium text-gold">
        <Download size={16} aria-hidden="true" />{copy.button}
      </button>
      {showSteps && <p role="status" className="mx-auto mt-2 max-w-xs rounded-xl bg-slate-950 px-4 py-3 text-start text-sm leading-relaxed text-white">
        {isAppleMobile ? copy.ios : copy.other}
      </p>}
    </div>
  );
}

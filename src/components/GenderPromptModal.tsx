import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { mysticalProfile } from "@/lib/mysticalProfile";
import { GENDER_GATE_EVENT } from "@/lib/genderGate";
import { useLanguage } from "@/i18n";

type Lang = "he" | "en" | "ru" | "ar";
type Resolver = (g: "male" | "female" | undefined) => void;

const LABELS: Record<Lang, { title: string; desc: string; male: string; female: string; skip: string }> = {
  he: {
    title: "לפני שנמשיך — ספר/י לי",
    desc: "כדי שהקריאה תדבר אליך באופן הכי טבעי, בחר/י את הפנייה הנכונה.",
    male: "פנה אליי בלשון זכר",
    female: "פני אליי בלשון נקבה",
    skip: "דלג/י",
  },
  en: {
    title: "Before we continue — tell me",
    desc: "So the reading speaks to you naturally, choose how I should address you.",
    male: "Address me in masculine",
    female: "Address me in feminine",
    skip: "Skip",
  },
  ru: {
    title: "Прежде чем продолжить — скажите",
    desc: "Чтобы чтение звучало естественно, выберите форму обращения.",
    male: "Обращайтесь в мужском роде",
    female: "Обращайтесь в женском роде",
    skip: "Пропустить",
  },
  ar: {
    title: "قبل أن نتابع — أخبرني",
    desc: "حتى تكون القراءة طبيعية، اختر طريقة المخاطبة المناسبة.",
    male: "خاطبني بصيغة المذكر",
    female: "خاطبني بصيغة المؤنث",
    skip: "تخطي",
  },
};

export default function GenderPromptModal() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [resolver, setResolver] = useState<Resolver | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { resolve: Resolver };
      setResolver(() => detail.resolve);
      setOpen(true);
    };
    window.addEventListener(GENDER_GATE_EVENT, handler);
    return () => window.removeEventListener(GENDER_GATE_EVENT, handler);
  }, []);

  const lang: Lang = (["he", "en", "ru", "ar"].includes(language) ? language : "he") as Lang;
  const L = LABELS[lang];
  const isRtl = lang === "he" || lang === "ar";

  const finish = (g: "male" | "female" | undefined) => {
    if (g) {
      mysticalProfile.recordGender(g);
    } else {
      // User skipped — fall back to name inference and lock it.
      const inferred = mysticalProfile.inferGenderFromName(mysticalProfile.getUserName());
      if (inferred) mysticalProfile.recordGender(inferred);
    }
    const r = resolver;
    setResolver(null);
    setOpen(false);
    // Resolve with whatever is now in the profile (may still be undefined).
    const finalGender = mysticalProfile.getUserGender();
    r?.(finalGender === "male" || finalGender === "female" ? finalGender : undefined);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && resolver) finish(undefined);
      }}
    >
      <DialogContent dir={isRtl ? "rtl" : "ltr"} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{L.title}</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">{L.desc}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 mt-2">
          <Button size="lg" onClick={() => finish("female")}>{L.female}</Button>
          <Button size="lg" variant="secondary" onClick={() => finish("male")}>{L.male}</Button>
          <Button size="sm" variant="ghost" onClick={() => finish(undefined)}>{L.skip}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

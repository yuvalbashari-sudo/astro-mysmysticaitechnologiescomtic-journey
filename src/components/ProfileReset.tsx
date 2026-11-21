import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n";
import { resetReadingProfile } from "@/lib/accountName";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "./ui/alert-dialog";

export const profileResetText = {
  he: { title: "איפוס הפרופיל שלי", info: "השם, פרטי הלידה והזיכרון האישי של נוריאל יימחקו. בחשבון מחובר האיפוס יחול גם במכשירים אחרים כשיתחברו. קריאות שנשמרו בארכיון והמנוי יישמרו. אי אפשר לבטל את האיפוס.", yes: "כן, לאפס את הפרופיל", no: "ביטול", fail: "האיפוס לא הושלם. בדקו את החיבור ונסו שוב.", done: "הפרופיל אופס." },
  en: { title: "Reset my profile", info: "This clears your reading name, birth details and Nuriel’s personal memory. When signed in, the reset also applies on your other devices when they reconnect. Archived readings and your subscription are kept. This cannot be undone.", yes: "Yes, reset my profile", no: "Cancel", fail: "Reset could not be completed. Check your connection and try again.", done: "Your profile was reset." },
  ru: { title: "Сбросить мой профиль", info: "Имя для раскладов, данные рождения и личная память Нуриэль будут удалены. Для аккаунта сброс также применится на других устройствах при подключении. Архив раскладов и подписка сохранятся. Отменить сброс невозможно.", yes: "Да, сбросить профиль", no: "Отмена", fail: "Не удалось сбросить профиль. Проверьте соединение и повторите попытку.", done: "Профиль сброшен." },
  ar: { title: "إعادة ضبط ملفي الشخصي", info: "سيُمسح اسمك في القراءات وبيانات الميلاد وما تتذكره نوريئيل عنك. عند تسجيل الدخول يسري ذلك على أجهزتك الأخرى عند اتصالها. ستبقى القراءات المؤرشفة والاشتراك. لا يمكن التراجع عن هذه الخطوة.", yes: "نعم، إعادة ضبط ملفي", no: "إلغاء", fail: "تعذرت إعادة الضبط. تحقق من الاتصال وحاول مجدداً.", done: "تمت إعادة ضبط ملفك." },
};

export default function ProfileReset({ onComplete }: { onComplete?: () => void }) {
  const { language, dir } = useLanguage();
  const t = profileResetText[language];
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await resetReadingProfile();
      toast.success(t.done);
      setOpen(false);
      setDone(true);
      onComplete?.();
    } catch { setFailed(true); }
    finally { setBusy(false); }
  }

  return <>
    <AlertDialog open={open} onOpenChange={value => {
      if (busy) return;
      setFailed(false);
      setDone(false);
      setOpen(value);
    }}>
      <AlertDialogTrigger asChild><button type="button" className="min-h-11 text-gold underline underline-offset-4">{t.title}</button></AlertDialogTrigger>
      <AlertDialogContent dir={dir} className="z-[250] max-w-[min(92vw,30rem)] rounded-xl border-gold/40 bg-slate-950 text-foreground">
        <AlertDialogHeader><AlertDialogTitle className="text-start text-gold">{t.title}</AlertDialogTitle>
          <AlertDialogDescription className="text-start text-base leading-relaxed text-foreground">{t.info}</AlertDialogDescription>
        </AlertDialogHeader>
        {failed && <p role="alert">{t.fail}</p>}
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={busy}>{t.no}</AlertDialogCancel>
          <button type="button" disabled={busy} aria-busy={busy} onClick={confirm} className="min-h-11 rounded-md border border-gold/50 px-4 text-gold">{t.yes}</button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    {done && <p role="status">{t.done}</p>}
  </>;
}

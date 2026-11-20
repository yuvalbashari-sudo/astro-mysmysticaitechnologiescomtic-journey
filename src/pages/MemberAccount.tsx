import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { accountReadingName, accountScope, rememberAccountName, subscribeAccount } from "@/lib/accountName";

const copy = {
  he: {
    login: "כניסה עם קוד במייל", intro: "היכנסו עם אותו מייל בנייד ובמחשב כדי שהשם שלכם יופיע בקריאות בשניהם.",
    email: "כתובת מייל", send: "שלחו לי קוד", sent: "הזינו את הקוד שנשלח אל", code: "קוד חד־פעמי", verify: "כניסה",
    change: "שינוי כתובת", resend: "שליחת קוד חדש", wait: "אפשר לשלוח קוד נוסף בעוד", seconds: "שניות",
    invalid: "הקוד שגוי או שפג תוקפו. בדקו את הקוד האחרון שקיבלתם או בקשו קוד חדש.",
    failure: "הפעולה לא הושלמה. בדקו את החיבור ונסו שוב.", limited: "נשלחו כמה בקשות. נסו שוב בעוד דקה.",
    account: "החשבון שלי", name: "השם שיופיע בקריאות", save: "שמירת השם בחשבון", saved: "השם נשמר ומוכן לשימוש גם במכשיר הבא.",
    back: "חזרה לאתר", logout: "התנתקות במכשיר הזה", busy: "רגע…",
  },
  en: {
    login: "Sign in with an email code", intro: "Use the same email on your phone and computer to keep your name in your readings.",
    email: "Email address", send: "Send me a code", sent: "Enter the code sent to", code: "One-time code", verify: "Sign in",
    change: "Change email", resend: "Send a new code", wait: "You can request another code in", seconds: "seconds",
    invalid: "This code is incorrect or has expired. Check the latest email or request a new code.",
    failure: "That didn’t go through. Check your connection and try again.", limited: "Too many requests. Try again in a minute.",
    account: "My account", name: "Name for your readings", save: "Save name to account", saved: "Your name is saved for your next device.",
    back: "Back to site", logout: "Sign out on this device", busy: "One moment…",
  },
  ar: {
    login: "الدخول برمز عبر البريد", intro: "استخدم نفس البريد على الهاتف والكمبيوتر ليظهر اسمك في قراءاتك على الجهازين.",
    email: "البريد الإلكتروني", send: "أرسلوا لي رمزاً", sent: "أدخل الرمز المرسل إلى", code: "رمز لمرة واحدة", verify: "تسجيل الدخول",
    change: "تغيير البريد", resend: "إرسال رمز جديد", wait: "يمكن طلب رمز آخر بعد", seconds: "ثانية",
    invalid: "الرمز غير صحيح أو انتهت صلاحيته. تحقّق من آخر رسالة أو اطلب رمزاً جديداً.",
    failure: "تعذّر إكمال العملية. تحقق من الاتصال وحاول مجدداً.", limited: "طلبات كثيرة. حاول مجدداً بعد دقيقة.",
    account: "حسابي", name: "الاسم في قراءاتك", save: "حفظ الاسم في الحساب", saved: "تم حفظ اسمك لاستخدامه على جهاز آخر.",
    back: "العودة إلى الموقع", logout: "الخروج من هذا الجهاز", busy: "لحظة…",
  },
  ru: {
    login: "Вход по коду из письма", intro: "Используйте одну почту на телефоне и компьютере, чтобы ваше имя сохранялось в раскладах.",
    email: "Электронная почта", send: "Получить код", sent: "Введите код из письма на", code: "Одноразовый код", verify: "Войти",
    change: "Изменить почту", resend: "Получить новый код", wait: "Новый код можно запросить через", seconds: "сек.",
    invalid: "Код неверен или устарел. Проверьте последнее письмо или запросите новый код.",
    failure: "Не удалось завершить действие. Проверьте соединение и попробуйте снова.", limited: "Слишком много запросов. Попробуйте через минуту.",
    account: "Мой аккаунт", name: "Имя для раскладов", save: "Сохранить имя в аккаунте", saved: "Имя сохранено и доступно на другом устройстве.",
    back: "Вернуться на сайт", logout: "Выйти на этом устройстве", busy: "Подождите…",
  },
};

const field = "mt-2 block min-h-12 w-full rounded-lg border border-gold/40 bg-background px-3 text-base text-foreground";

export default function MemberAccount() {
  const { language, dir } = useLanguage();
  const t = copy[language];
  const scope = useSyncExternalStore(subscribeAccount, accountScope);
  const knownName = useSyncExternalStore(subscribeAccount, accountReadingName);
  const signedIn = scope !== "guest" && scope !== "loading";
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!remaining) return;
    const timer = window.setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);

  async function send() {
    const address = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: { shouldCreateUser: true, emailRedirectTo: new URL("/account", window.location.origin).href },
    });
    if (error) {
      if (error.status === 429) setRemaining(60);
      setError(error.status === 429 ? t.limited : t.failure);
      return;
    }
    setSentTo(address);
    setCode("");
    setRemaining(60);
  }

  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try { await action(); } catch { setError(t.failure); } finally { setBusy(false); }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      if (signedIn) {
        const success = await rememberAccountName((draft ?? knownName ?? "").trim());
        if (success) setSaved(true); else setError(t.failure);
      } else if (sentTo) {
        const { error } = await supabase.auth.verifyOtp({ email: sentTo, token: code.trim(), type: "email" });
        if (error) setError(error.status === 429 ? t.limited : t.invalid);
      } else {
        await send();
      }
    });
  }

  return (
    <main dir={dir} className="min-h-dvh bg-background px-4 py-12 text-foreground">
      <section className="mx-auto max-w-md space-y-5 rounded-2xl border border-gold/30 bg-slate-950 p-6 shadow-xl">
        <h1 className="font-heading text-2xl text-gold">{signedIn ? t.account : t.login}</h1>
        {scope === "loading" ? <p role="status">{t.busy}</p> : <>
          {!signedIn && <p>{sentTo ? <>{t.sent} <bdi>{sentTo}</bdi></> : t.intro}</p>}
          <form className="space-y-4" onSubmit={submit}>
            {signedIn ? <label className="block">{t.name}
              <input required maxLength={50} autoComplete="given-name" dir="auto" className={field}
                value={draft ?? knownName ?? ""} onChange={e => { setDraft(e.target.value); setSaved(false); }} />
            </label> : sentTo ? <label className="block">{t.code}
              <input required autoFocus dir="ltr" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}"
                maxLength={10} className={field} value={code} onChange={e => setCode(e.target.value.replace(/\s/g, ""))} />
            </label> : <label className="block">{t.email}
              <input required type="email" autoComplete="email" dir="ltr" className={field}
                value={email} onChange={e => setEmail(e.target.value)} />
            </label>}
            <button type="submit" disabled={busy || (signedIn ? !(draft ?? knownName)?.trim() : !sentTo && remaining > 0)}
              className="btn-gold min-h-12 w-full disabled:opacity-50">{busy ? t.busy : signedIn ? t.save : sentTo ? t.verify : t.send}</button>
          </form>
          {saved && <p role="status">{t.saved}</p>}
          {error && <p role="alert">{error}</p>}
          {!signedIn && remaining > 0 && <p className="text-sm">{t.wait} {remaining} {t.seconds}</p>}
          {sentTo && !signedIn && <div className="flex justify-between gap-2">
            <button disabled={busy || remaining > 0} className="min-h-11 text-gold disabled:opacity-50" onClick={() => void run(send)}>{t.resend}</button>
            <button disabled={busy} className="min-h-11" onClick={() => { setSentTo(""); setCode(""); setRemaining(0); setError(""); }}>{t.change}</button>
          </div>}
          {signedIn && <button disabled={busy} className="min-h-11" onClick={() => void run(async () => {
            const { error } = await supabase.auth.signOut({ scope: "local" });
            if (error) setError(t.failure);
          })}>{t.logout}</button>}
        </>}
        <Link className="block min-h-11 py-2 text-gold underline" to="/">{t.back}</Link>
      </section>
    </main>
  );
}

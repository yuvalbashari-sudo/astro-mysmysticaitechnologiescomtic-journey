import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSiteAdmin } from "@/hooks/use-site-admin";
import { subscriptionManager } from "@/lib/subscriptionManager";

export default function AdminDebugBadge() {
  const [params, setParams] = useSearchParams();
  const admin = useSiteAdmin();
  const ready = useSyncExternalStore(subscriptionManager.onAuthChange, subscriptionManager.isAuthReady, () => false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (params.get("admin") !== "1") return null;

  const leave = () => {
    const next = new URLSearchParams(params);
    next.delete("admin");
    setParams(next, { replace: true });
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const address = email.trim().toLowerCase();
    if (!subscriptionManager.isConfiguredAdminEmail(address)) {
      setError("יש להזין את המייל שמוגדר לחשבון המנהל.");
      return;
    }

    setPending(true);
    setError("");
    try {
      if (sent) {
        const { error } = await supabase.auth.verifyOtp({ email: address, token: code.trim(), type: "email" });
        if (error) setError("לא הצלחנו לאמת את הקוד. אפשר לבדוק את הקוד או לבקש הודעה חדשה.");
      } else {
        const redirect = new URL("/", window.location.origin);
        redirect.searchParams.set("admin", "1");
        const { error } = await supabase.auth.signInWithOtp({
          email: address,
          options: { emailRedirectTo: redirect.href },
        });
        if (error) setError("לא הצלחנו לשלוח הודעת התחברות. אפשר לנסות שוב בעוד רגע.");
        else setSent(true);
      }
    } catch {
      setError("לא הצלחנו להתחבר כרגע. אפשר לנסות שוב בעוד רגע.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[11000] grid place-items-center overflow-y-auto bg-background/95 p-4" dir="rtl" lang="he">
      <section aria-labelledby="admin-sign-in-title" className="w-full max-w-sm space-y-4 rounded-2xl border border-gold/30 bg-background p-5 text-foreground shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 id="admin-sign-in-title" className="font-heading text-xl text-gold">התחברות למנהל האתר</h2>
          <button type="button" onClick={leave} className="min-h-11 px-2 text-sm">סגירה</button>
        </div>
        {!ready ? (
          <p role="status">בודק את ההתחברות…</p>
        ) : admin ? (
          <>
            <p role="status">התחברת כמנהל האתר.</p>
            <button type="button" onClick={leave} className="btn-gold min-h-11 w-full">המשך לאתר</button>
            <button type="button" className="min-h-11 w-full" onClick={async () => {
              const { error } = await supabase.auth.signOut({ scope: "local" });
              if (error) setError("ההתנתקות לא הושלמה. אפשר לנסות שוב.");
            }}>התנתקות</button>
          </>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <label className="block">
              מייל מנהל
              <input required type="email" autoComplete="email" dir="ltr" value={email} disabled={sent}
                onChange={event => setEmail(event.target.value)}
                className="mt-1 block min-h-11 w-full rounded-md border border-gold/30 bg-background px-3 text-base" />
            </label>
            {sent && (
              <>
                <p role="status">בדוק את תיבת המייל. אפשר לפתוח את קישור ההתחברות או להזין את הקוד אם קיבלת קוד.</p>
                <label className="block">
                  קוד אימות
                  <input required inputMode="numeric" autoComplete="one-time-code" dir="ltr" value={code}
                    onChange={event => setCode(event.target.value)}
                    className="mt-1 block min-h-11 w-full rounded-md border border-gold/30 bg-background px-3 text-base" />
                </label>
              </>
            )}
            <button type="submit" disabled={pending} className="btn-gold min-h-11 w-full disabled:opacity-50">
              {pending ? "רגע…" : sent ? "אימות קוד" : "שליחת התחברות במייל"}
            </button>
            {sent && <button type="button" className="min-h-11 w-full" onClick={() => { setSent(false); setCode(""); setError(""); }}>בקשת הודעה חדשה</button>}
          </form>
        )}
        {error && <p role="alert" className="text-sm text-foreground">{error}</p>}
      </section>
    </div>
  );
}

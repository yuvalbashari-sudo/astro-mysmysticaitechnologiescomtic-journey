import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { useLanguage } from "@/i18n";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { norielleCloudTrial, openingForConversation } from "@/lib/norielleCloudTrial";

const copy = {
  he: ["לשוחח עם נוריאל על הקלפים", "שיחה עם נוריאל", "אפשר לשאול בשפה שלכם. נוריאל תענה באנגלית על אותם שלושה קלפים.", "ניסוי שיחה בענן", "השיחה הסתיימה לזמן הניסוי."],
  en: ["Talk to Norielle about these cards", "Talk to Norielle", "Ask in your language. Norielle answers in English about these same three cards.", "Cloud conversation trial", "This conversation trial has ended."],
  ru: ["Обсудить карты с Нориэль", "Разговор с Нориэль", "Задайте вопрос на своём языке. Нориэль ответит по-английски об этих же трёх картах.", "Пробный голосовой разговор", "Пробный период разговора завершён."],
  ar: ["تحدّث مع نورييل عن البطاقات", "محادثة مع نورييل", "اسأل بلغتك. تجيب نورييل بالإنجليزية عن البطاقات الثلاث نفسها.", "تجربة المحادثة الصوتية", "انتهت فترة تجربة المحادثة."],
};

export default function NorielleCloudConversation({ cards, reading, question }: {
  cards: readonly { id: string; name?: Partial<Record<"he" | "en" | "ru" | "ar", string>> }[]; reading: string; question: string;
}) {
  const { language } = useLanguage();
  const c = copy[language];
  const [open, setOpen] = useState(false);
  const [expired, setExpired] = useState(() => Date.now() >= norielleCloudTrial.endsAt);
  const frame = useRef<HTMLIFrameElement>(null);
  const opening = openingForConversation(cards, reading, question);

  useEffect(() => {
    const remaining = norielleCloudTrial.endsAt - Date.now();
    if (remaining <= 0) { setExpired(true); return; }
    const timeout = window.setTimeout(() => { setExpired(true); setOpen(false); }, remaining);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!open || !opening) return;
    const ready = (event: MessageEvent) => {
      if (event.origin !== norielleCloudTrial.origin || event.source !== frame.current?.contentWindow || event.data?.type !== "norielle-ready") return;
      frame.current?.contentWindow?.postMessage({ type: "norielle-reading-context", context: opening, language,
        cardLabels: cards.map(card => card.name?.[language] || card.id) }, norielleCloudTrial.origin);
    };
    window.addEventListener("message", ready);
    return () => window.removeEventListener("message", ready);
  }, [open, opening, language, cards]);

  if (!norielleCloudTrial.enabled || expired || !opening) return null;
  return <section className="mt-6 rounded-2xl border border-gold/35 bg-[#101522] p-4 text-start sm:p-5">
    <p className="mb-2 text-xs text-gold/80">{c[3]}</p>
    <p className="mb-4 text-sm leading-relaxed text-foreground/90">{c[2]}</p>
    <button type="button" onClick={() => setOpen(true)} className="btn-gold inline-flex min-h-12 items-center justify-center gap-2 px-5">
      <Mic size={18} />{c[0]}
    </button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-[94dvh] max-h-[94dvh] w-[96vw] max-w-5xl grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden border-gold/35 bg-[#080d18] p-3 sm:p-5">
        <DialogTitle className="pe-8 font-heading text-xl text-gold">{c[1]}</DialogTitle>
        <DialogDescription className="text-sm text-foreground/80">{c[2]}</DialogDescription>
        {open && <iframe ref={frame} src={norielleCloudTrial.origin + "/conversation" + (import.meta.env.DEV ? "?qa=1" : "")} title={c[1]} allow="microphone; autoplay" referrerPolicy="no-referrer"
          className="h-full min-h-0 w-full rounded-xl border-0" />}
      </DialogContent>
    </Dialog>
  </section>;
}

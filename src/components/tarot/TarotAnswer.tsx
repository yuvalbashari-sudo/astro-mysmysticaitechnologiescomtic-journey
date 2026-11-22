import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n";
import { renderMysticalText } from "@/lib/aiStreaming";
import { readingAuthorization } from "@/lib/readingAuthorization";
import { isLocalizedReading } from "@/lib/readingLanguage";
import { accountStorageKey } from "@/lib/accountName";
import type { TextSize } from "@/components/TextSizeControl";
import ReadingNarrative from "../ReadingNarrative";

const labels = {
  he: ["תשובה קצרה", "הפירוש המלא", "שאלת המשך על אותם קלפים", "מה עוד רצית להבין מהפתיחה?", "שליחת השאלה", "הפירוש נכתב…", "שליחת השאלה לא הושלמה. אפשר לנסות שוב."],
  en: ["Short answer", "Full reading", "One follow-up about these cards", "What would you like to explore?", "Send question", "Writing your answer…", "Your question could not be completed. Please try again."],
  ru: ["Короткий ответ", "Полный расклад", "Один вопрос по этим картам", "Что хочется уточнить?", "Отправить вопрос", "Готовим ответ…", "Не удалось завершить ответ. Попробуйте ещё раз."],
  ar: ["الجواب المختصر", "القراءة الكاملة", "سؤال متابعة عن البطاقات نفسها", "ما الذي تودّ استكشافه؟", "إرسال السؤال", "جارٍ إعداد الإجابة…", "تعذّر إكمال الإجابة. يمكن المحاولة مجددًا."]
};

type Reply = { question: string; answer: string };

function Followup({ readingId, reading, size }: { readingId: string; reading: string; size: TextSize }) {
  const { language } = useLanguage();
  const c = labels[language];
  const storage = accountStorageKey("tarot_followup_" + readingId);
  const [reply, setReply] = useState<Reply | null>(() => {
    try { return JSON.parse(sessionStorage.getItem(storage) || "null"); } catch { return null; }
  });
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const running = useRef<AbortController | null>(null);
  useEffect(() => () => running.current?.abort(), []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (running.current || reply || !question.trim()) return;
    const controller = new AbortController();
    running.current = controller;
    setBusy(true);
    setError(false);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tarot-reading`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: readingAuthorization() },
        signal: controller.signal, body: JSON.stringify({ action: "followup", readingId, question: question.trim(), reading }),
      });
      if (!response.ok) throw new Error();
      const result: Reply = await response.json();
      if (!isLocalizedReading(result.answer, language) || typeof result.question !== "string") throw new Error();
      setReply(result);
      try { sessionStorage.setItem(storage, JSON.stringify(result)); } catch { /* The answer is still visible. */ }
    } catch { if (!controller.signal.aborted) setError(true); }
    finally { running.current = null; if (!controller.signal.aborted) setBusy(false); }
  }
  return <section className="mt-6 rounded-xl border border-gold/35 bg-background p-4 text-start">
    <h4 className="mb-2 font-heading text-lg text-gold">{c[2]}</h4>
    {reply ? <><p dir="auto" className="mb-3 font-medium">{reply.question}</p>{renderMysticalText(reply.answer, size)}</> :
      <form onSubmit={submit} className="space-y-3">
        <label className="block">{c[3]}<textarea maxLength={500} rows={2} value={question} onChange={e=>setQuestion(e.target.value)}
          disabled={busy} className="mystical-input mt-2 w-full text-foreground" /></label>
        <button disabled={busy || !question.trim()} className="btn-gold min-h-11 disabled:opacity-50">{busy ? c[5] : c[4]}</button>
        {error && <p role="alert">{c[6]}</p>}
      </form>}
  </section>;
}

export default function TarotAnswer({ text, size, readingId, complete }: { text: string; size: TextSize; readingId?: string; complete: boolean }) {
  const { language } = useLanguage();
  const c = labels[language];
  return <div className="min-w-0 space-y-4 text-start [overflow-wrap:anywhere]">
    <ReadingNarrative text={text} size={size} summaryLabel={c[0]} fullLabel={c[1]} />
    {complete && readingId && <Followup key={readingId} readingId={readingId} reading={text} size={size}/>}
  </div>;
}


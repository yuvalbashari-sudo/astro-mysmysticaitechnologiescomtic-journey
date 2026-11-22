import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { compressImage } from "@/lib/imageCompression";
import { readingAuthorization } from "@/lib/readingAuthorization";
import { focusKeys, palmCopy, type PalmFocus } from "../../supabase/functions/_shared/palmDetail";
import CinematicModalShell from "./CinematicModalShell";

const resultLabels = {
  he: ["מה נראה בצילום", "פירוש סמלי"], en: ["Visible in the photo", "Symbolic interpretation"],
  ar: ["ما يظهر في الصورة", "تفسير رمزي"], ru: ["Что видно на снимке", "Символическое толкование"],
};

function PalmForm() {
  const { language, dir, t } = useLanguage();
  const copy = palmCopy[language];
  const [main, setMain] = useState("");
  const [handRole, setHandRole] = useState("");
  const [focus, setFocus] = useState<PalmFocus | null>(null);
  const [details, setDetails] = useState<Partial<Record<PalmFocus, {observation:string; meaning:string}>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  async function read(file: File) {
    if (active.current) return;
    setError("");
    if (focus) setDetails(previous => ({...previous, [focus]:undefined}));
    if (!file.type.startsWith("image/")) { setError(t.palm_upload_error); return; }
    if (file.size > 10 * 1024 * 1024) { setError(t.palm_size_error); return; }
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    const localUrl = URL.createObjectURL(file);
    try {
      let palmImage: string;
      try { palmImage = await compressImage(localUrl); }
      catch { setError(t.palm_upload_error); return; }
      const response = await fetch(import.meta.env.VITE_SUPABASE_URL + "/functions/v1/mystical-reading", {
        method:"POST", signal:controller.signal,
        headers:{"Content-Type":"application/json", Authorization:readingAuthorization(), apikey:import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY},
        body:JSON.stringify({type:focus ? "palmDetail" : "palm", language, data:{palmImage, ...(focus && {focus}), ...(handRole && {handRole})}}),
      });
      if (!response.ok) {
        setError(response.status === 422 ? copy.retake : response.status === 429 ? copy.limited : copy.unavailable);
        return;
      }
      if (focus) {
        const result = await response.json();
        if (!result.observation || !result.meaning) throw new Error();
        setDetails(previous => ({...previous, [focus]:result}));
      } else {
        const chunks = (await response.text()).split(/\r?\n/).filter(line => line.startsWith("data: ") && line !== "data: [DONE]");
        const reading = chunks.map(line => JSON.parse(line.slice(6)).choices?.[0]?.delta?.content ?? "").join("");
        if (!reading.trim()) throw new Error();
        setMain(reading);
      }
    } catch {
      if (!controller.signal.aborted) setError(copy.unavailable);
    } finally {
      URL.revokeObjectURL(localUrl);
      active.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  const upload = (camera: boolean) => (
    <label className={(camera ? "sm:hidden " : "") + "btn-outline-gold relative inline-flex min-h-12 items-center justify-center gap-2 px-5 focus-within:ring-2 focus-within:ring-gold"}>
      {camera ? <Camera size={18} aria-hidden /> : <ImagePlus size={18} aria-hidden />}
      {camera ? t.palm_capture : t.palm_gallery}
      <input type="file" accept="image/*" capture={camera ? "environment" : undefined} disabled={busy}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={event => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void read(file);
        }} />
    </label>
  );
  return <section dir={dir} className="mx-auto w-full max-w-2xl rounded-2xl border border-gold/30 bg-slate-950 p-5 text-start text-slate-100 sm:p-9">
    <h1 className="font-heading text-3xl text-gold">{t.palm_title}</h1>
    {!main && <label className="mt-5 flex flex-wrap items-center gap-3">{copy.hand[0]}
      <select value={handRole} disabled={busy} onChange={event => setHandRole(event.target.value)}
        className="rounded-lg border border-gold/40 bg-slate-900 px-3 py-2">
        <option value="">{copy.hand[1]}</option><option value="dominant">{copy.hand[2]}</option><option value="other">{copy.hand[3]}</option>
      </select>
    </label>}
    {main && <div className="mt-5 space-y-3 leading-8">{main.split(/\n\s*\n/).map((line, i) =>
      line.startsWith("### ") ? <h2 className="pt-3 font-heading text-2xl text-gold" key={i}>{line.slice(4)}</h2> : <p key={i}>{line}</p>)}</div>}
    {main && <div className="mt-7 border-t border-gold/30 pt-5">
      <h2 className="font-heading text-2xl text-gold">{copy.more}</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">{focusKeys.map(key => <button type="button" disabled={busy} aria-pressed={focus === key} key={key}
        className="btn-outline-gold min-h-12 px-3 py-2 aria-pressed:bg-gold/20" onClick={() => {setFocus(key); setError("");}}>{copy[key][0]}</button>)}</div>
    </div>}
    {(!main || focus) && <div className="mt-5 space-y-4">
      <p className="leading-7">{focus ? copy[focus][1] : copy.main}</p>
      <div className="flex flex-wrap gap-3">{upload(false)}{upload(true)}</div>
    </div>}
    {busy && <p role="status" className="mt-4">{copy.busy}</p>}
    {error && <p role="alert" className="mt-4 text-amber-200">{error}</p>}
    {focus && details[focus] && <article aria-live="polite" className="mt-5 space-y-3 border-s-2 border-gold/60 ps-4">
      <h3 className="font-heading text-xl text-gold">{resultLabels[language][0]}</h3><p>{details[focus].observation}</p>
      <h3 className="font-heading text-xl text-gold">{resultLabels[language][1]}</h3><p>{details[focus].meaning}</p>
    </article>}
  </section>;
}
export default function PalmReader({isOpen, onClose}: {isOpen:boolean; onClose:()=>void}) {
  const {language} = useLanguage();
  return <CinematicModalShell isOpen={isOpen} onClose={onClose} hideAdvisor wide>{isOpen && <PalmForm key={language}/>}</CinematicModalShell>;
}

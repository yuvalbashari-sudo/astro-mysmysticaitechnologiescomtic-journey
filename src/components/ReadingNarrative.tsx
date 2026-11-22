import { useLanguage } from "@/i18n";
import { renderMysticalText } from "@/lib/aiStreaming";
import type { TextSize } from "./TextSizeControl";

const labels = {
  he: ["התובנה המרכזית", "הפירוש המלא"],
  en: ["Your key insight", "Full reading"],
  ru: ["Главная мысль", "Полное толкование"],
  ar: ["الرؤية الرئيسية", "التفسير الكامل"],
};

export default function ReadingNarrative({ text, size = "default", summaryLabel, fullLabel }: {
  text: string;
  size?: TextSize;
  summaryLabel?: string;
  fullLabel?: string;
}) {
  const { language } = useLanguage();
  const c = labels[language];
  const firstHeading = text.search(/^#{1,4}\s/m);
  const introduction = firstHeading === -1 ? text : text.slice(0, firstHeading);
  // Keep older, unstructured readings complete without labelling a long essay a summary.
  const hasSummary = introduction.trim() && (firstHeading !== -1 || introduction.length <= 500);
  const full = hasSummary ? (firstHeading === -1 ? "" : text.slice(firstHeading)) : text;

  return <div className="reading-narrative min-w-0 space-y-6 text-start [overflow-wrap:anywhere]">
    {hasSummary && <section className="reading-summary">
      <h4>{summaryLabel || c[0]}</h4>
      {renderMysticalText(introduction, size)}
    </section>}
    {full.trim() && <section>
      <h4 className="reading-full-label">{fullLabel || c[1]}</h4>
      {renderMysticalText(full, size)}
    </section>}
  </div>;
}

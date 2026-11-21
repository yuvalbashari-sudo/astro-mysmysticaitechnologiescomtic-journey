import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import EntryLayout, { entryCopy, resetCopy } from "../EntryLayout";
import { useLanguage, useT } from "@/i18n";
import type { ReadingCard } from "@/data/allTarotCards";
import { cardBack } from "@/data/tarotCardImages";
import star from "@/assets/tarot/major-arcana/star/star.png";
import moon from "@/assets/tarot/major-arcana/moon/moon.png";
import sun from "@/assets/tarot/major-arcana/sun/sun.png";

interface Props {
  phase: "question" | "personal" | "drawing" | "interpretation";
  question: string;
  cards: ReadingCard[];
  selected: Set<number>;
  onSubmit: (question:string)=>void;
  onPick: (index:number)=>void;
  onReset: ()=>void;
  result: ReactNode;
  onClearCards: ()=>void;
}

export default function CampaignReading({phase,question,cards,selected,onSubmit,onPick,onReset,onClearCards,result}:Props) {
  const {language, isRTL} = useLanguage();
  const t = useT();
  const c = entryCopy[language];
  const [draft,setDraft] = useState("");
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const form = phase === "question" || phase === "personal";
  return <EntryLayout>
    {form ? <div className="entry-grid">
      <div className="entry-content">
        <h1>{c.title}</h1><p className="entry-intro">{c.intro}</p>
        <form onSubmit={e=>{e.preventDefault();if(draft.trim())onSubmit(draft.trim());}}>
          <label htmlFor="entry-question">{c.label}</label>
          <textarea id="entry-question" rows={3} maxLength={500} value={draft} onChange={e=>setDraft(e.target.value)} placeholder={c.hint} dir="auto" />
          <button className="entry-action" disabled={!draft.trim()}>{c.pick}<Arrow size={18}/></button>
          {draft && <button type="button" className="entry-reset" onClick={()=>setDraft("")}>{resetCopy[language].clear}</button>}
        </form>
      </div>
      <div className="entry-art" aria-hidden="true"><div className="entry-orbit"/><div className="entry-fan">
        <img src={moon} alt=""/><img src={star} alt=""/><img src={sun} alt=""/>
      </div></div>
    </div> : <section className="entry-spread">
      <h1>{phase === "drawing" ? c.choose : c.spread}</h1>
      <p className="entry-quote" dir="auto">{question}</p>
      {phase === "drawing" ? <>
        <p className="entry-progress" aria-live="polite"><bdi>{selected.size} / 3</bdi></p>
        <div className="entry-deck">{cards.map((card,index)=>{
          const picked=selected.has(index);
          return <button key={card.id} onClick={()=>onPick(index)} aria-pressed={picked}
            aria-label={picked ? card.name[language] : t.tarot_card_label+" "+(index+1)}>
            <img alt="" src={picked ? card.image || cardBack : cardBack} />
          </button>;
        })}</div>
        <button className="entry-reset" onClick={onReset}>{resetCopy[language].edit}</button>
        <button className="entry-reset" onClick={onClearCards} disabled={!selected.size}>{resetCopy[language].cards}</button>
      </> : <>
        <div className="entry-selected">{Array.from(selected,i=>cards[i]).map(card=><figure key={card.id}>
          <img src={card.image || cardBack} alt=""/><figcaption>{card.name[language]}</figcaption>
        </figure>)}</div>
        <div className="entry-answer">{result}</div>
        <button className="entry-action" onClick={()=>{setDraft("");onReset();}}>{c.another}</button>
      </>}
    </section>}
  </EntryLayout>;
}

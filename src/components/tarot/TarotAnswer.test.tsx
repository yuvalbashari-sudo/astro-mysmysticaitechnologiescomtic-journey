import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/i18n/LanguageContext";
import ImmersiveTarotExperience from "../ImmersiveTarotExperience";
import TarotModal from "../TarotModal";
import { he } from "@/i18n/translations/he";
import { en } from "@/i18n/translations/en";
import { ru } from "@/i18n/translations/ru";
import { ar } from "@/i18n/translations/ar";
import { isLocalizedReading } from "@/lib/readingLanguage";

vi.mock("../PaymentGatingModal", () => ({ default: () => null }));
vi.mock("../AdvisorChatPanel", () => ({ default: () => null }));
vi.mock("../AstrologerAvatarButton", () => ({ default: () => null }));
vi.mock("../ResultShareBar", () => ({ default: () => null }));
vi.mock("@/components/CinematicModalShell", () => ({ default: ({ children }: {children: React.ReactNode}) => children }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/lib/subscriptionManager", () => ({ subscriptionManager: {
  getCurrentTier: () => "pro", isAdmin: () => false, getAccessToken: () => "test-member",
  isAuthReady: () => true, onAuthReady: (cb: () => void) => cb(), onAuthChange: () => () => {},
} }));
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); sessionStorage.clear(); });

const cases = [
  { locale: "he", t: he, original: "איך נתכנן את התערוכה?", prompt: "מה השאלה שלכם?", next: "המשיכו לפתיחת הקלפים", question: "מה כדאי להכין קודם?", short: "כדאי להתחיל בסקיצה.", full: "הפירוש המלא", heading: "הקלפים שלך", detail: "לכל קלף יש מקום בפתיחה.", field: "מה עוד רצית להבין מהפתיחה?", send: "שליחת השאלה" },
  { locale: "en", t: en, original: "How should we plan the exhibition?", prompt: "What is your question?", next: "Continue to reveal the cards", question: "What should we prepare first?", short: "Start with a sketch.", full: "Full reading", heading: "Your cards", detail: "Each card has a place in the spread.", field: "What would you like to explore?", send: "Send question" },
  { locale: "ru", t: ru, original: "Как спланировать выставку?", prompt: "Какой у вас вопрос?", next: "Продолжить к открытию карт", question: "Что подготовить сначала?", short: "Начните с эскиза.", full: "Полный расклад", heading: "Ваши карты", detail: "У каждой карты своё место в раскладе.", field: "Что хочется уточнить?", send: "Отправить вопрос" },
  { locale: "ar", t: ar, original: "كيف نخطط للمعرض؟", prompt: "ما سؤالك؟", next: "تابع لكشف البطاقات", question: "ماذا نحضّر أولًا؟", short: "ابدؤوا برسم أولي.", full: "القراءة الكاملة", heading: "بطاقاتك", detail: "لكل بطاقة موضع في القراءة.", field: "ما الذي تودّ استكشافه؟", send: "إرسال السؤال" },
] as const;

for (const c of cases) {
it.each([390, 1280])("streams a reading and follows up once in " + c.locale + " at %i px", async width => {
  vi.stubGlobal("innerWidth", width);
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
  localStorage.setItem("astrologai_lang", c.locale);
  let output!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({ start(c) { output = c; } });
  const first = new Response(body, { headers: { "X-Tarot-Reading": "verified-spread" } });
  const question = c.question;
  const request = vi.fn().mockResolvedValueOnce(first)
    .mockResolvedValueOnce(new Response("", {status:503}));
  vi.stubGlobal("fetch", request);
  const Reading = width < 768 ? TarotModal : ImmersiveTarotExperience;
  render(<LanguageProvider><Reading isOpen onClose={() => {}}/></LanguageProvider>);
  fireEvent.click(screen.getByText(c.t.tarot_world_spread_question_name, { exact: true }));
  fireEvent.change(await screen.findByRole("textbox", {name:c.prompt}), {target:{value:c.original}});
  fireEvent.click(screen.getByRole("button", {name:c.next}));
  const cards = width < 768 ? [1,2,3].map(n => screen.getByRole("button", {name:c.t.tarot_card_label + " " + n})) :
    Array.from(document.querySelectorAll(".absolute.cursor-pointer"));
  for (const card of cards.slice(0,3)) fireEvent.click(card);
  const send = (text:string) => output.enqueue(new TextEncoder().encode("data: "+JSON.stringify({choices:[{delta:{content:text}}]})+"\n\n"));
  await act(async () => send(c.short));
  expect(await screen.findByText(c.short)).toBeVisible();
  expect(document.documentElement.dir).toBe(c.locale === "he" || c.locale === "ar" ? "rtl" : "ltr");
  expect(screen.queryByRole("heading", {name:c.full})).toBeNull();
  expect(screen.queryByRole("button", {name:c.send})).toBeNull();
  await act(async () => {
    send("\n\n### " + c.heading + "\n" + c.detail);
    output.enqueue(new TextEncoder().encode("data: [DONE]\n\n")); output.close();
  });
  expect(await screen.findByRole("heading",{name:c.full})).toBeVisible();
  const payload = JSON.parse(request.mock.calls[0][1].body);
  expect(payload).toMatchObject({language:c.locale, context:{userQuestion:c.original}});
  const names = payload.cards.map((card: { hebrewName: string }) => card.hebrewName);
  expect(new Set(names).size).toBe(3);
  for (const name of names) expect(isLocalizedReading(name,c.locale)).toBe(true);
  const answer = names.join(" · ");
  request.mockResolvedValueOnce(Response.json({question, answer}));
  const form = await screen.findByRole("textbox",{name:c.field});
  fireEvent.change(form,{target:{value:question}});
  fireEvent.click(screen.getByRole("button",{name:c.send}));
  const alert = await screen.findByRole("alert");
  expect(isLocalizedReading(alert.textContent, c.locale)).toBe(true);
  fireEvent.click(screen.getByRole("button",{name:c.send}));
  expect(await screen.findByText(answer)).toBeVisible();
  expect(screen.queryByRole("button",{name:c.send})).toBeNull();
  const firstPayload=JSON.parse(request.mock.calls[0][1].body);
  expect(firstPayload.cards).toHaveLength(3);
  expect(firstPayload.includeFollowup).toBe(true);
  expect(JSON.parse(request.mock.calls[2][1].body)).toMatchObject({action:"followup",readingId:"verified-spread",question});
  await waitFor(()=>expect(request).toHaveBeenCalledTimes(3));
});
}

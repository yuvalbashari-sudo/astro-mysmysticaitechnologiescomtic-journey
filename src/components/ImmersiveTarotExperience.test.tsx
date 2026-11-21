import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ImmersiveTarotExperience from "./ImmersiveTarotExperience";
import TarotModal from "./TarotModal";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { he } from "@/i18n/translations/he";
import { en } from "@/i18n/translations/en";
import { ru } from "@/i18n/translations/ru";
import { ar } from "@/i18n/translations/ar";
import { entitlements } from "@/lib/entitlements";

vi.mock("./AdvisorChatPanel", () => ({ default: () => null }));
vi.mock("./AstrologerAvatarButton", () => ({ default: () => null }));
vi.mock("./ResultShareBar", () => ({ default: () => null }));
vi.mock("@/components/CinematicModalShell", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => isOpen ? children : null,
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/components/PaymentGatingModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div>Quota exhausted</div> : null,
}));
vi.mock("@/lib/subscriptionManager", () => ({
  subscriptionManager: {
    getCurrentTier: () => "free",
    isAdmin: () => false,
    getAccessToken: () => null,
    isAuthReady: () => true,
    onAuthReady: (callback: () => void) => callback(),
    onAuthChange: () => () => {},
  },
}));

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  sessionStorage.clear();
});

it.each([375, 1100])("sends the edited personal question exactly once after card three at %i px", async width => {
  vi.stubGlobal("innerWidth", width);
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
  localStorage.setItem("astrologai_lang", "en");
  const request = vi.fn().mockResolvedValue(new Response(
    'data: {"choices":[{"delta":{"content":"Consider the new teaching role."}}]}\n\ndata: [DONE]\n\n',
  ));
  vi.stubGlobal("fetch", request);
  const Reading = width < 768 ? TarotModal : ImmersiveTarotExperience;
  render(<LanguageProvider><Reading isOpen onClose={() => {}} /></LanguageProvider>);
  fireEvent.click(screen.getByRole("button", { name: /ask a question/i }));
  const field = await screen.findByRole("textbox", { name: "What is your question?" });
  fireEvent.click(screen.getByRole("button", { name: /what story is unfolding around me/i }));
  expect(field).toHaveValue("What story is unfolding around me?");
  const question = "How can I prepare for my new teaching role?";
  fireEvent.change(field, { target: { value: question } });
  fireEvent.click(screen.getByRole("button", { name: /continue to reveal/i }));
  const picks = width < 768 ? screen.getAllByRole("button", { name: /^Card \d+$/ })
    : Array.from(document.querySelectorAll(".absolute.cursor-pointer"));
  fireEvent.click(picks[0]);
  fireEvent.click(picks[1]);
  expect(request).not.toHaveBeenCalled();
  fireEvent.click(picks[2]);
  expect(request).toHaveBeenCalledTimes(1);
  expect(JSON.parse(request.mock.calls[0][1].body)).toMatchObject({ spreadType: "question", context: { userQuestion: question } });
  expect(await screen.findByText("Consider the new teaching role.")).toBeInTheDocument();
});

it("uses the same immediate result for the tarot modal opened from the mobile menu", async () => {
  vi.stubGlobal("innerWidth", 375);
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  localStorage.setItem("astrologai_lang", "en");
  const available = entitlements.getRemainingFreeUses("tarot_reading");
  for (let used = 1; used < available; used++) {
    entitlements.recordFeatureUse("tarot_reading");
  }
  const request = vi.fn().mockResolvedValue(new Response(
    'data: {"choices":[{"delta":{"content":"Your mobile interpretation."}}]}\n\ndata: [DONE]\n\n',
  ));
  vi.stubGlobal("fetch", request);
  render(<LanguageProvider><TarotModal isOpen onClose={() => {}} /></LanguageProvider>);

  fireEvent.click(screen.getByRole("button", { name: /past.*present.*future/i }));
  const picks = screen.getAllByRole("button", { name: /^Card \d+$/ });
  fireEvent.click(picks[0]);
  fireEvent.click(picks[1]);
  expect(request).not.toHaveBeenCalled();
  fireEvent.click(picks[2]);
  expect(request).toHaveBeenCalledTimes(1);
  expect(JSON.parse(request.mock.calls[0][1].body).spreadType).toBe("timeline");
  expect(screen.getByRole("status")).toBeInTheDocument();
  expect(screen.queryByText("Quota exhausted")).not.toBeInTheDocument();
  expect(await screen.findByText("Your mobile interpretation.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /unlock|continue/i })).not.toBeInTheDocument();
  await waitFor(() => expect(sessionStorage.getItem("astrologai_tarot_session")).toContain("Your mobile interpretation."));
});

it.each([1024, 320])("starts at the third card at %i px and streams without reopening the quota gate", async (width) => {
  vi.stubGlobal("innerWidth", width);
  localStorage.setItem("astrologai_lang", "en");
  const available = entitlements.getRemainingFreeUses("tarot_reading");
  for (let used = 1; used < available; used++) {
    entitlements.recordFeatureUse("tarot_reading");
  }
  let streamController!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({ start: (controller) => { streamController = controller; } });
  const request = vi.fn().mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockResolvedValueOnce(new Response(body));
  vi.stubGlobal("fetch", request);

  render(<LanguageProvider><ImmersiveTarotExperience isOpen onClose={() => {}} /></LanguageProvider>);
  fireEvent.click(screen.getByRole("button", { name: "General" }));
  const cards = width < 768
    ? screen.getAllByRole("button", { name: /^Card [1-7]$/ })
    : Array.from(document.querySelectorAll(".absolute.cursor-pointer"));
  expect(cards).toHaveLength(7);
  expect(entitlements.getRemainingFreeUses("tarot_reading")).toBe(0);
  fireEvent.click(cards[4]);
  fireEvent.click(cards[1]);
  expect(request).not.toHaveBeenCalled();
  fireEvent.click(cards[5]);
  fireEvent.click(cards[6]);
  expect(request).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("Quota exhausted")).not.toBeInTheDocument();

  fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
  expect(request).toHaveBeenCalledTimes(2);
  const initialPayload = JSON.parse(request.mock.calls[0][1].body);
  expect(initialPayload.context.userQuestion).toBe("general");
  expect(initialPayload.cards).toHaveLength(3);
  expect(JSON.parse(request.mock.calls[1][1].body)).toEqual(initialPayload);
  expect(entitlements.getRemainingFreeUses("tarot_reading")).toBe(0);
  expect(screen.getByRole("status")).toBeInTheDocument();

  const encoder = new TextEncoder();
  await act(async () => {
    streamController.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"First interpretation."}}]}\n\n'));
  });
  expect(await screen.findByText("First interpretation.")).toBeInTheDocument();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /unlock|continue/i })).not.toBeInTheDocument();

  await act(async () => {
    streamController.enqueue(encoder.encode("data: [DONE]\n\n"));
    streamController.close();
  });
  const largest = screen.getByRole("button", { name: "A++" });
  if (width < 768) {
    fireEvent.click(largest);
    expect(largest).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("First interpretation.")).toHaveClass("text-[1.75rem]");
  }
  await waitFor(() => expect(localStorage.getItem("astrologai_readings")).toContain('"type":"tarot"'));
});

for (const [locale, t, sample] of [["he", he, "הפירוש האישי שלך."], ["en", en, "Your personal reading."],
  ["ru", ru, "Ваш личный расклад."], ["ar", ar, "قراءتك الشخصية."]] as const) {
  it.each([375, 1100])("opens a clean " + locale + " spread at %i px after a mixed response", async width => {
    vi.stubGlobal("innerWidth", width);
    vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
    localStorage.setItem("astrologai_lang", locale);
    const body = (content: string) => new Response("data: " + JSON.stringify({ choices: [{ delta: { content } }] }) + "\n\ndata: [DONE]\n");
    const mixed = sample + (locale === "en" ? " שלום" : " The Hanged Man");
    const request = vi.fn().mockResolvedValueOnce(body(mixed)).mockResolvedValueOnce(body(sample));
    vi.stubGlobal("fetch", request);
    const Reading = width < 768 ? TarotModal : ImmersiveTarotExperience;
    render(<LanguageProvider><Reading isOpen onClose={() => {}} /></LanguageProvider>);
    const category = width < 768 ? t.tarot_spread_timeline : t.imm_tarot_category_general;
    fireEvent.click(screen.getByText(category, { exact: true }));
    const cards = width < 768 ? [1, 2, 3].map(n => screen.getByRole("button", { name: t.tarot_card_label + " " + n }))
      : Array.from(document.querySelectorAll(".absolute.cursor-pointer"));
    for (const card of cards.slice(0, 3)) fireEvent.click(card);
    expect(await screen.findByText(sample)).toBeInTheDocument();
    expect(screen.queryByText(mixed)).toBeNull();
    expect(request).toHaveBeenCalledTimes(2);
    const payload = JSON.parse(request.mock.calls[0][1].body);
    expect(payload.language).toBe(locale);
    expect(payload.cards).toHaveLength(3);
  });
}

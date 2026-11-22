import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import NorielleCloudConversation from "./NorielleCloudConversation";
import { openingForConversation, norielleCloudTrial } from "@/lib/norielleCloudTrial";

vi.mock("@/i18n", () => ({ useLanguage: () => ({ language: "he" }), useT: () => ({ common_close: "סגירה" }) }));
vi.mock("@/lib/norielleCloudTrial", async importOriginal => {
  const original = await importOriginal<typeof import("@/lib/norielleCloudTrial")>();
  return { ...original, norielleCloudTrial: { ...original.norielleCloudTrial, enabled: true, endsAt: Date.now() + 3600000 } };
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const cards = [{ id: "death" }, { id: "queen-of-wands" }, { id: "four-of-cups" }];

describe("the Israeli voice opening", () => {
  it("keeps the actual cards and the complete reading without replacing them with demo cards", () => {
    const reading = "פירוש אישי מלא על השינוי, הביטחון וההתבוננות.";
    expect(openingForConversation(cards, reading, "מה כדאי לי לעשות?")).toEqual({ cards: ["death", "queen-of-wands", "four-of-cups"], reading, question: "מה כדאי לי לעשות?" });
    expect(openingForConversation([cards[0], cards[0], cards[2]], reading, "")).toBeNull();
    expect(openingForConversation(cards, "", "")).toBeNull();
  });

  it("sends the opening only to the expected voice frame and releases it when the dialog closes", () => {
    render(<NorielleCloudConversation cards={cards} reading="הקריאה המלאה שנבחרה" question="שאלת הבדיקה" />);
    expect(screen.queryByTitle("שיחה עם נוריאל")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "לשוחח עם נוריאל על הקלפים" }));
    const frame = screen.getByTitle("שיחה עם נוריאל") as HTMLIFrameElement;
    const send = vi.spyOn(frame.contentWindow!, "postMessage").mockImplementation(() => {});
    fireEvent(window, new MessageEvent("message", { origin: "https://unrelated.example", source: frame.contentWindow, data: { type: "norielle-ready" } }));
    expect(send).not.toHaveBeenCalled();
    fireEvent(window, new MessageEvent("message", { origin: norielleCloudTrial.origin, source: frame.contentWindow, data: { type: "norielle-ready" } }));
    expect(send).toHaveBeenCalledWith({ type: "norielle-reading-context", context: { cards: cards.map(card => card.id), reading: "הקריאה המלאה שנבחרה", question: "שאלת הבדיקה" }, language: "he", cardLabels: cards.map(card => card.id) }, norielleCloudTrial.origin);
    fireEvent.click(screen.getByRole("button", { name: "סגירה" }));
    expect(screen.queryByTitle("שיחה עם נוריאל")).toBeNull();
  });
});

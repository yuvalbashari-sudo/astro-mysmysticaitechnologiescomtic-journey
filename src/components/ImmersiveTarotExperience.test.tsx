import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ImmersiveTarotExperience from "./ImmersiveTarotExperience";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { entitlements } from "@/lib/entitlements";

vi.mock("./AdvisorChatPanel", () => ({ default: () => null }));
vi.mock("./AstrologerAvatarButton", () => ({ default: () => null }));
vi.mock("./ResultShareBar", () => ({ default: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/components/PaymentGatingModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div>Quota exhausted</div> : null,
}));
vi.mock("@/lib/subscriptionManager", () => ({
  subscriptionManager: {
    getCurrentTier: () => "free",
    isAuthReady: () => true,
    onAuthReady: (callback: () => void) => callback(),
    onAuthChange: () => () => {},
  },
}));

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

it("starts at the third card and displays partial text without reopening the quota gate", async () => {
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
  const cards = document.querySelectorAll(".absolute.cursor-pointer");
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
  expect(screen.getByRole("button", { name: "A++" })).toBeInTheDocument();
  await waitFor(() => expect(localStorage.getItem("astrologai_readings")).toContain('"type":"tarot"'));
});

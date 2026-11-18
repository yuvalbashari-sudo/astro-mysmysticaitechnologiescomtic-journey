import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CompatibilityModal from "./CompatibilityModal";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { entitlements } from "@/lib/entitlements";

const ai = vi.hoisted(() => ({ call: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/localAiPipeline", () => ({ callLocalAi: ai.call, getLocalFallback: () => "fallback" }));
vi.mock("@/lib/subscriptionManager", () => ({
  subscriptionManager: {
    getCurrentTier: () => "free",
    isAdmin: () => false,
    isAuthReady: () => true,
    onAuthReady: (callback: () => void) => callback(),
    onAuthChange: () => () => {},
  },
}));
vi.mock("@/components/CinematicModalShell", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => isOpen ? children : null,
}));
vi.mock("@/components/PaymentGatingModal", () => ({ default: () => null }));
vi.mock("@/components/ShareResultSection", () => ({ default: () => null }));

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
  sessionStorage.clear();
});

it("starts on submit, shows the score, and retries a stalled interpretation without using another reading", () => {
  vi.useFakeTimers();
  localStorage.setItem("astrologai_lang", "en");
  const remaining = entitlements.getRemainingFreeUses("compatibility_reading");
  render(<LanguageProvider><CompatibilityModal isOpen onClose={() => {}} /></LanguageProvider>);

  const [firstDate, secondDate] = screen.getAllByPlaceholderText(/MM\s*\/\s*DD\s*\/\s*YYYY/i);
  fireEvent.change(firstDate, { target: { value: "06151995" } });
  fireEvent.change(secondDate, { target: { value: "10121996" } });
  fireEvent.click(screen.getByRole("button", { name: "Check compatibility" }));

  expect(ai.call).toHaveBeenCalledTimes(1);
  const first = ai.call.mock.calls[0][0];
  expect(first).toMatchObject({ promptForGender: false, payload: { type: "compatibility", language: "en" } });
  expect(screen.getByText(/^\d+%$/)).toBeInTheDocument();
  expect(screen.getByRole("status")).toBeInTheDocument();

  act(() => { vi.advanceTimersByTime(15_000); });
  expect(first.signal.aborted).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(ai.call).toHaveBeenCalledTimes(2);
  const retry = ai.call.mock.calls[1][0];
  expect(retry.payload).toEqual(first.payload);
  expect(entitlements.getRemainingFreeUses("compatibility_reading")).toBe(remaining - 1);

  act(() => { retry.onDelta("Make time to listen to each other."); });
  expect(screen.getByText("Make time to listen to each other.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /unlock full reading/i })).not.toBeInTheDocument();
  act(() => { retry.onDone(); });
});

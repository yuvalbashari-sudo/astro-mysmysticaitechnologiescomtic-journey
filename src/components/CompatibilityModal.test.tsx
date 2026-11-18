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
  ai.call.mockClear();
  vi.useRealTimers();
  localStorage.clear();
  sessionStorage.clear();
});

it("keeps a complete reading when the AI stalls, including on a second check", () => {
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
  const advice = () => screen.getByRole("heading", { name: "Something to try" });
  expect(advice()).toBeInTheDocument();

  act(() => { vi.advanceTimersByTime(15_000); });
  expect(first.signal.aborted).toBe(true);
  expect(advice()).toBeInTheDocument();
  expect(screen.queryByText("Try again")).not.toBeInTheDocument();
  expect(ai.call).toHaveBeenCalledTimes(1);
  expect(entitlements.getRemainingFreeUses("compatibility_reading")).toBe(remaining - 1);
  fireEvent.click(screen.getByRole("button", { name: "Check another match" }));
  const partner = screen.getAllByPlaceholderText(/MM\s*\/\s*DD\s*\/\s*YYYY/i)[1];
  fireEvent.change(partner, { target: { value: "07151992" } });
  fireEvent.click(screen.getByRole("button", { name: "Check compatibility" }));
  const second = ai.call.mock.calls[1][0];
  act(() => { second.onDelta("Partial text"); second.onError("network-error"); second.onDone(); });
  expect(screen.queryByText("Partial text")).not.toBeInTheDocument();
  expect(advice()).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem("astrologai_readings")!)).toHaveLength(2);
});

it("opens a new editable check each time, remembering only the visitor, even with an old saved result", () => {
  localStorage.setItem("astrologai_lang", "en");
  sessionStorage.setItem("astrologai_compat_session", JSON.stringify({
    date: new Date().toISOString().slice(0, 10), language: "en",
    matchInfo: { sign1Name: "Old sign", score: 80 }, aiText: "Old result",
  }));
  const view = (isOpen: boolean) => <LanguageProvider><CompatibilityModal isOpen={isOpen} onClose={() => {}} /></LanguageProvider>;
  const ui = render(view(true));
  const dates = () => screen.getAllByPlaceholderText(/MM\s*\/\s*DD\s*\/\s*YYYY/i);
  const submit = () => fireEvent.click(screen.getByRole("button", { name: "Check compatibility" }));
  fireEvent.change(dates()[0], { target: { value: "06151995" } });
  fireEvent.change(dates()[1], { target: { value: "10121996" } });
  submit();
  const first = ai.call.mock.lastCall![0];
  fireEvent.click(screen.getByRole("button", { name: "Check another match" }));
  expect(first.signal.aborted).toBe(true);
  expect(dates()[0]).toHaveValue("06/15/1995");
  expect(dates()[1]).toHaveValue("");
  fireEvent.change(dates()[1], { target: { value: "01071994" } });
  submit();
  expect(ai.call.mock.lastCall![0].payload.sign2Name).not.toBe(first.payload.sign2Name);
  const second = ai.call.mock.lastCall![0];
  act(() => { second.onDelta("A personal observation."); second.onDone(); });
  expect(screen.getByText("A personal observation.")).toBeInTheDocument();
  ui.rerender(view(false));
  ui.rerender(view(true));
  expect(dates()[0]).toHaveValue("06/15/1995");
  expect(dates()[1]).toHaveValue("");
  const calls = ai.call.mock.calls.length;
  fireEvent.change(dates()[1], { target: { value: "03221990" } });
  submit();
  expect(screen.getByText(/^\d+%$/)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Something to try" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Check another match" }));
  expect(dates()[1]).toHaveValue("");
  expect(ai.call).toHaveBeenCalledTimes(calls);
});

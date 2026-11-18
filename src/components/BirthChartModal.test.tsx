import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import BirthChartModal from "./BirthChartModal";
import { LanguageProvider } from "@/i18n/LanguageContext";

const ai = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock("@/lib/localAiPipeline", () => ({ callLocalAi: ai, getLocalFallback: () => "fallback" }));
vi.mock("@/lib/subscriptionManager", () => ({
  subscriptionManager: {
    isAdmin: () => false, isAuthReady: () => true,
    onAuthReady: (cb: () => void) => cb(), onAuthChange: () => () => {},
  },
}));
vi.mock("@/components/CinematicModalShell", () => ({ default: ({ children }: { children: React.ReactNode }) => children }));
vi.mock("@/components/ResultShareBar", () => ({ default: () => null }));
vi.mock("@/components/BirthDetailsForm", () => ({
  default: ({ onChange }: { onChange: (v: object) => void }) => <button onClick={() => onChange({
    userName: "", birthDate: "1994-05-12", birthTime: "09:15", birthCity: "London", gender: "other",
  })}>Fill details</button>,
}));
vi.mock("@/lib/natalChart", () => ({
  calculateNatalChart: async () => ({
    sunSign: { key: "taurus", symbol: "♉", elementKey: "earth" },
    moonSignKey: "libra", risingSign: { key: "leo", symbol: "♌", elementKey: "fire" },
    location: { name: "London", latitude: 51.5, longitude: 0, timezone: "Europe/London" },
    planetPlacements: [], aspects: [], houseCusps: [], dominantElements: [], dominantHouses: [],
  }),
}));

afterEach(() => { localStorage.clear(); sessionStorage.clear(); ai.mockClear(); });
const view = (open: boolean) => <LanguageProvider><BirthChartModal isOpen={open} onClose={() => {}} /></LanguageProvider>;
async function submit() {
  localStorage.setItem("astrologai_lang", "en");
  const ui = render(view(true));
  fireEvent.click(screen.getByText("Fill details"));
  fireEvent.click(screen.getByRole("button", { name: "Generate my chart" }));
  await waitFor(() => expect(ai).toHaveBeenCalledTimes(1));
  return ui;
}

it("streams the interpretation on submit and restores the completed replacement on reopen", async () => {
  sessionStorage.setItem("astrologai_unlocked_readings_v1", JSON.stringify(["natal::1994-05-12:09:15:London"]));
  const ui = await submit();
  const req = ai.mock.calls[0][0];
  expect(req).toMatchObject({ promptForGender: false, payload: { type: "birthChart", birthTime: "09:15", birthCity: "London" } });
  act(() => req.onDelta("First sentence."));
  expect(screen.getByText("First sentence.")).toBeInTheDocument();
  act(() => { req.onReplace("The complete personal reading."); req.onDone(); });
  ui.rerender(view(false));
  ui.rerender(view(true));
  expect(screen.getByText("The complete personal reading.")).toBeInTheDocument();
  expect(ai).toHaveBeenCalledTimes(1);
});

it("offers a retry for an empty result and ignores callbacks after close", async () => {
  const ui = await submit();
  act(() => ai.mock.calls[0][0].onDone());
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(localStorage.getItem("astrologai_birthchart_daily")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  const retry = ai.mock.calls[1][0];
  ui.rerender(view(false));
  expect(retry.signal.aborted).toBe(true);
  act(() => { retry.onDelta("Stale reading."); retry.onDone(); });
  expect(localStorage.getItem("astrologai_birthchart_cache")).toBeNull();
});

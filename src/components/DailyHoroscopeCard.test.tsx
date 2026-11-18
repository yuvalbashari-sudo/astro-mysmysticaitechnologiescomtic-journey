import { StrictMode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/i18n/LanguageContext";
import DailyHoroscopeCard from "./DailyHoroscopeCard";

const storage = vi.hoisted(() => ({ select: vi.fn(), insert: vi.fn().mockResolvedValue({ error: null }) }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => storage },
}));
vi.mock("@/hooks/use-site-admin", () => ({ useSiteAdmin: () => false }));
vi.mock("@/lib/subscriptionManager", () => ({
  subscriptionManager: { isAdmin: () => false, getAccessToken: () => null },
}));
vi.mock("./AdvisorChatPanel", () => ({ default: () => null }));
vi.mock("./ResultShareBar", () => ({ default: () => null }));

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  sessionStorage.clear();
});

it("starts after the first form submission and reuses the result on reopen", async () => {
  localStorage.setItem("astrologai_lang", "en");
  const fetchReading = vi.fn().mockResolvedValue(Response.json({
    content: "Make time for a useful conversation today.",
    love_score: 4,
    career_score: 3,
    energy_score: 5,
  }));
  vi.stubGlobal("fetch", fetchReading);
  const page = <StrictMode><LanguageProvider><DailyHoroscopeCard /></LanguageProvider></StrictMode>;
  const view = render(page);
  fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "Demo Reader" } });
  fireEvent.change(screen.getByPlaceholderText(/MM\s*\/\s*DD\s*\/\s*YYYY/i), { target: { value: "06151995" } });
  const submit = screen.getByRole("button", { name: /Show my horoscope/ });
  expect(submit).toBeEnabled();
  expect(fetchReading).not.toHaveBeenCalled();
  fireEvent.click(submit);

  expect(fetchReading).toHaveBeenCalledTimes(1);
  expect(storage.select).not.toHaveBeenCalled();
  expect(JSON.parse(fetchReading.mock.calls[0][1].body)).toMatchObject({
    birthDate: "1995-06-15",
    zodiacSign: "Gemini",
    language: "en",
  });
  expect(screen.queryByRole("button", { name: /unlock full reading/i })).not.toBeInTheDocument();
  expect(await screen.findByText("Make time for a useful conversation today.")).toBeInTheDocument();

  view.unmount();
  render(page);
  expect(await screen.findByText("Make time for a useful conversation today.")).toBeInTheDocument();
  expect(fetchReading).toHaveBeenCalledTimes(1);
});

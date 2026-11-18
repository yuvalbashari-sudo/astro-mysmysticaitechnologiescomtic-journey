import { afterEach, expect, it, vi } from "vitest";
import { calculateNatalChart } from "./natalChart";

afterEach(() => vi.unstubAllGlobals());

it.each([
  ["London", "2000-01-01", "12:00", 51.51, -0.13, "Europe/London", "Aries"],
  ["Sydney", "2000-01-01", "12:00", -33.87, 151.21, "Australia/Sydney", "Pisces"],
  ["London", "2000-07-01", "12:00", 51.51, -0.13, "Europe/London", "Virgo"],
  ["London", "2000-01-01", "18:00", 51.51, -0.13, "Europe/London", "Leo"],
] as const)("uses the local birth time in %s on %s at %s", async (name, birthDate, birthTime, latitude, longitude, timezone, sign) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true, json: async () => ({ results: [{ name, latitude, longitude, timezone }] }),
  }));
  const chart = await calculateNatalChart({ birthPlace: name, birthDate, birthTime });
  expect(chart.risingSign.key).toBe(sign);
});

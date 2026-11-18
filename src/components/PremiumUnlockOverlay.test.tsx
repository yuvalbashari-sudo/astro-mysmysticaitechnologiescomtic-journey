import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import PremiumUnlockOverlay from "./PremiumUnlockOverlay";

const role = vi.hoisted(() => ({ admin: false }));
vi.mock("@/hooks/use-site-admin", () => ({ useSiteAdmin: () => role.admin }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/lib/analytics", () => ({ analytics: { track: vi.fn() } }));

beforeEach(() => {
  role.admin = false;
  sessionStorage.clear();
});

it("starts the administrator's reading once and skips the unlock screen", () => {
  role.admin = true;
  const start = vi.fn();
  const { rerender } = render(
    <PremiumUnlockOverlay readingId="reading" featureKey="tarot_reading" isReady={false} onUnlockStart={start}>
      <p>Reading content</p>
    </PremiumUnlockOverlay>,
  );
  expect(screen.getByText("Reading content")).toBeVisible();
  expect(screen.queryByRole("button", { name: "פתח את הקריאה המלאה" })).not.toBeInTheDocument();
  rerender(
    <PremiumUnlockOverlay readingId="reading" featureKey="tarot_reading" isReady={false} onUnlockStart={() => start()}>
      <p>Reading content</p>
    </PremiumUnlockOverlay>,
  );
  expect(start).toHaveBeenCalledTimes(1);
});

it("opens a regular reading directly after the unlock button, with no video", () => {
  const start = vi.fn();
  render(
    <PremiumUnlockOverlay readingId="other" featureKey="tarot_reading" isReady={false} onUnlockStart={start}>
      <p>Reading content</p>
    </PremiumUnlockOverlay>,
  );
  fireEvent.click(screen.getByRole("button", { name: "פתח את הקריאה המלאה" }));
  expect(start).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("button", { name: "פתח את הקריאה המלאה" })).not.toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  listener: null as null | ((event: string, session: unknown) => void),
  getUser: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: auth.getUser,
      onAuthStateChange: (callback: NonNullable<typeof auth.listener>) => { auth.listener = callback; },
    },
  },
}));

const email = "yuvalbashari@gmail.com";
const session = { access_token: "admin-session-token", user: { email } };

beforeEach(() => {
  localStorage.clear();
  auth.getUser.mockReset();
  vi.resetModules();
});

it("ignores stored admin flags and requires Supabase to verify the configured email", async () => {
  localStorage.setItem("astrologai_admin_email", email);
  localStorage.setItem("astrologai_admin_override", "true");
  localStorage.setItem("astrologai_user_plan", JSON.stringify({ tier: "admin" }));
  const { subscriptionManager } = await import("./subscriptionManager");
  auth.listener?.("INITIAL_SESSION", null);
  expect(subscriptionManager.getCurrentTier()).toBe("free");

  auth.getUser.mockResolvedValue({ data: { user: { email, email_confirmed_at: "2026-01-01" } }, error: null });
  auth.listener?.("SIGNED_IN", session);
  expect(subscriptionManager.isAdmin()).toBe(false);
  await vi.waitFor(() => expect(subscriptionManager.isAdmin()).toBe(true));
  expect(auth.getUser).toHaveBeenCalledWith(session.access_token);
  expect(subscriptionManager.getCurrentTier()).toBe("admin");

  auth.listener?.("SIGNED_OUT", null);
  expect(subscriptionManager.isAdmin()).toBe(false);
  expect(subscriptionManager.getAccessToken()).toBeNull();
});

it("rejects a session that Supabase does not verify", async () => {
  auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error("Invalid token") });
  const { subscriptionManager } = await import("./subscriptionManager");
  auth.listener?.("INITIAL_SESSION", session);
  await vi.waitFor(() => expect(subscriptionManager.isAuthReady()).toBe(true));
  expect(subscriptionManager.getCurrentTier()).toBe("free");
});

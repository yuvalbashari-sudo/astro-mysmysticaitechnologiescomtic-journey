import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { setReadingSession } from "@/lib/accountName";
import { subscriptionManager } from "@/lib/subscriptionManager";
import MemberAccount from "./MemberAccount";

const auth = vi.hoisted(() => ({
  onAuthStateChange: vi.fn(), signInWithOtp: vi.fn(), verifyOtp: vi.fn(), signOut: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth } }));
vi.mock("@/i18n", () => ({ useLanguage: () => ({ language: "he", dir: "rtl" }) }));
const page = () => render(<MemoryRouter><MemberAccount /></MemoryRouter>);
const session = (id: string, data = {}) => ({ user: { id, user_metadata: data }, access_token: id + "-token" }) as Session;
afterEach(() => { cleanup(); setReadingSession(null); localStorage.clear(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

it("sends and verifies an email code and lets a reader correct an invalid code", async () => {
  setReadingSession(null);
  auth.signInWithOtp.mockResolvedValue({ error: null });
  auth.verifyOtp.mockResolvedValueOnce({ error: { status: 403 } }).mockResolvedValue({ error: null });
  page();
  fireEvent.change(screen.getByLabelText("כתובת מייל"), { target: { value: "Demo@Example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "שלחו לי קוד" }));
  const input = await screen.findByLabelText("קוד חד־פעמי");
  expect(auth.signInWithOtp).toHaveBeenCalledWith({ email: "demo@example.com", options: {
    shouldCreateUser: true, emailRedirectTo: window.location.origin + "/account",
  } });
  fireEvent.change(input, { target: { value: "111111" } });
  fireEvent.click(screen.getByRole("button", { name: "כניסה" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("הקוד שגוי");
  fireEvent.change(input, { target: { value: "222222" } });
  fireEvent.click(screen.getByRole("button", { name: "כניסה" }));
  expect(auth.verifyOtp).toHaveBeenLastCalledWith({ email: "demo@example.com", type: "email", token: "222222" });
});

it("keeps the saved name on a second device without inheriting a guest or another account's plan", async () => {
  vi.stubGlobal("fetch", vi.fn().mockImplementation(async (_url, opts) =>
    Response.json(opts.method === "PUT" ? {} : { id: "first", user_metadata: {} })));
  setReadingSession(null);
  subscriptionManager.setPlan("vip");
  setReadingSession(session("first"));
  expect(subscriptionManager.getCurrentTier()).toBe("free");
  page();
  fireEvent.change(screen.getByLabelText("השם שיופיע בקריאות"), { target: { value: "נועם" } });
  fireEvent.click(screen.getByRole("button", { name: "שמירת השם בחשבון" }));
  await screen.findByText("השם נשמר ומוכן לשימוש גם במכשיר הבא.");
  const update = vi.mocked(fetch).mock.calls.find(([, opts]) => opts?.method === "PUT");
  const metadata = JSON.parse(String(update?.[1]?.body)).data;
  cleanup();
  localStorage.clear();
  setReadingSession(session("first", metadata));
  page();
  expect(screen.getByLabelText("השם שיופיע בקריאות")).toHaveValue("נועם");
  cleanup();
  setReadingSession(session("second"));
  page();
  expect(screen.getByLabelText("השם שיופיע בקריאות")).toHaveValue("");
  expect(subscriptionManager.getCurrentTier()).toBe("free");
});

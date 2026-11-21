import { afterEach, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { accountReadingName, resetReadingProfile, setReadingSession } from "./accountName";
import { mysticalProfile } from "./mysticalProfile";

const session = (id: string, metadata = {}) => ({
  user: { id, user_metadata: metadata }, access_token: id + "-token",
}) as Session;

afterEach(() => { setReadingSession(null); localStorage.clear(); vi.unstubAllGlobals(); });

it("waits for the server reset marker before replaying a pending name from an offline device", async () => {
  localStorage.setItem("astrologai_name:phone", JSON.stringify({ name: "Old name", pending: true }));
  const fetchUser = vi.fn().mockResolvedValueOnce({ ok: false })
    .mockResolvedValue({ ok: true, json: async () => ({ id: "phone", user_metadata: { reading_name: "", reading_profile_reset: 100 } }) });
  vi.stubGlobal("fetch", fetchUser);
  setReadingSession(session("phone"));
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(fetchUser).toHaveBeenCalledTimes(1);
  window.dispatchEvent(new Event("online"));
  await vi.waitFor(() => expect(accountReadingName()).toBe(""));
  expect(fetchUser.mock.calls.some(([, options]) => options.method === "PUT")).toBe(false);
});

it("resets a guest's profile and palm memory without affecting entitlement or other accounts", async () => {
  setReadingSession(null);
  mysticalProfile.recordPalmReading();
  mysticalProfile.recordUserName("Test guest");
  localStorage.setItem("astrologai_mystical_profile:someone-else", "untouched");
  localStorage.setItem("astrologai_user_plan", "keep");
  await resetReadingProfile();
  expect(mysticalProfile.getProfile().palmReadingDone).toBe(false);
  expect(mysticalProfile.getUserName()).toBeUndefined();
  expect(localStorage.getItem("astrologai_mystical_profile:someone-else")).toBe("untouched");
  expect(localStorage.getItem("astrologai_user_plan")).toBe("keep");
});

it("requires server acknowledgement before clearing a member profile, then applies the reset on a returning device", async () => {
  let accept = false;
  let metadata: Record<string, unknown> = { reading_name: "Test" };
  vi.stubGlobal("fetch", vi.fn(async (_url, request) => {
    if (request.method === "PUT") {
      if (!accept) return { ok: false };
      metadata = JSON.parse(request.body).data;
    }
    return { ok: true, json: async () => ({ id: "first", user_metadata: metadata }) };
  }));
  setReadingSession(session("first", metadata));
  mysticalProfile.recordZodiac("Leo", "♌", "Fire", "1992-08-01");
  const old = localStorage.getItem("astrologai_mystical_profile:first")!;
  await expect(resetReadingProfile()).rejects.toThrow();
  expect(mysticalProfile.getProfile().birthDate).toBe("1992-08-01");
  accept = true;
  await resetReadingProfile();
  expect(metadata).toMatchObject({ reading_name: "", reading_profile_reset: expect.any(Number) });
  setReadingSession(null);
  localStorage.clear();
  localStorage.setItem("astrologai_mystical_profile:first", old);
  setReadingSession(session("first", { reading_name: "Old name" }));
  await vi.waitFor(() => expect(mysticalProfile.getProfile().birthDate).toBeUndefined());
  expect(accountReadingName()).toBe("");
});

it("remembers names for the signed-in account across devices and keeps other accounts separate", async () => {
  const request = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  vi.stubGlobal("fetch", request);
  setReadingSession(session("first"));
  mysticalProfile.recordUserName("נועה");
  const write = request.mock.calls.find(([, options]) => options.method === "PUT")?.[1];
  expect(write).toBeDefined();
  await Promise.resolve();
  expect(write.headers.Authorization).toBe("Bearer first-token");
  expect(JSON.parse(write.body)).toEqual({ data: { reading_name: "נועה" } });
  setReadingSession(session("second"));
  expect(mysticalProfile.getUserName()).toBeUndefined();
  setReadingSession(null);
  localStorage.clear();
  setReadingSession(session("first", JSON.parse(write.body).data));
  expect(mysticalProfile.getUserName()).toBe("נועה");
  expect(mysticalProfile.getCompatibilitySelf().name).toBe("נועה");
});

import { afterEach, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { setReadingSession } from "./accountName";
import { mysticalProfile } from "./mysticalProfile";

const session = (id: string, metadata = {}) => ({
  user: { id, user_metadata: metadata }, access_token: id + "-token",
}) as Session;

afterEach(() => { setReadingSession(null); localStorage.clear(); vi.unstubAllGlobals(); });

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

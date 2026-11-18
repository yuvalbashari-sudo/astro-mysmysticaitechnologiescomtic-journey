import { describe, it, expect, vi, afterEach } from "vitest";
import { callLocalAi } from "@/lib/localAiPipeline";

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fn);
  return fn;
}

async function runStream() {
  const onError = vi.fn();
  const onDone = vi.fn();
  await callLocalAi({
    endpoint: "mystical-reading",
    mode: "stream",
    promptForGender: false,
    payload: { type: "birthChart", language: "he" },
    onDelta: () => {},
    onDone,
    onError,
  } as any);
  return { onError, onDone };
}

afterEach(() => vi.unstubAllGlobals());

describe("localAiPipeline error handling", () => {
  it("passes DAILY_LIMIT_REACHED through as a code and does not retry", async () => {
    const fetchFn = mockFetch(429, { error: "DAILY_LIMIT_REACHED" });
    const { onError, onDone } = await runStream();
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith("DAILY_LIMIT_REACHED");
    expect(onDone).not.toHaveBeenCalled();
  });

  it("never forwards raw JSON error bodies to the UI", async () => {
    mockFetch(500, { error: "Internal boom" });
    const { onError } = await runStream();
    const msg = onError.mock.calls[0][0] as string;
    expect(msg).not.toContain("{");
    expect(msg).not.toContain("Internal boom");
  });
});

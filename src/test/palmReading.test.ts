import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { palmReading } from "../../supabase/functions/mystical-reading/palm";

const photo = "data:image/jpeg;base64,/9j/2Q==";
const valid = { view: "palm", clear: true, upper: "straight", middle: "unresolved", thumb: "curved" };
function model(obs: unknown) {
  return Response.json({choices: [{finish_reason: "stop", message: {content: JSON.stringify(obs)}}]});
}
// The Edge runtime has AbortSignal.timeout; the project's jsdom environment does not.
beforeEach(() => vi.stubGlobal("AbortSignal", { timeout: () => new AbortController().signal }));
afterEach(() => vi.unstubAllGlobals());

it.each([{}, {rightPalmImage: photo}, {palmImage: 54}, {palmImage: "https://example.com/a.jpg"},
  {palmImage: photo, rightPalmImage: photo, leftPalmImage: photo}])("rejects missing or ambiguous input before calling vision", async data => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  expect((await palmReading(data, "he", "test", {})).status).toBe(422);
  expect(fetcher).not.toHaveBeenCalled();
});

it.each([{...valid, view:"back"}, {...valid, view:"no_hand"}, {...valid, clear:false},
  {...valid, thumb:"unresolved"}, {...valid, upper:"guessed"}])("returns only a retake for inadequate evidence", async obs => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(model(obs)));
  const res = await palmReading({palmImage: photo}, "he", "test", {});
  expect(res.status).toBe(422);
  expect(await res.json()).toMatchObject({code:"PALM_RETAKE",photoIndex:0});
});

it.each([["he","מה נראה בצילום"], ["ar","ما يظهر في الصورة"], ["en","Visible in the photo"], ["ru","Что видно на фотографии"]])("formats only the observed lines in %s", async (lang,title) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(model(valid)));
  const res = await palmReading({palmImage:photo}, lang, "test", {});
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toContain(title);
  expect(text).toContain("data: [DONE]");
  expect(text).not.toMatch(/head line|קו הראש|линия головы|خط الرأس/);
});

it("discards the first reading if the second photo fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(model(valid)).mockResolvedValueOnce(model({...valid, view:"back"})));
  const res = await palmReading({rightPalmImage:photo,leftPalmImage:photo}, "en", "test", {});
  expect(res.status).toBe(422);
  expect(await res.json()).toMatchObject({code:"PALM_RETAKE",photoIndex:1});
});

it("keeps a provider outage distinct from a bad photo", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null,{status:503})));
  const res = await palmReading({palmImage:photo}, "en", "test", {});
  expect(res.status).toBe(503);
  expect(await res.json()).toMatchObject({code:"PALM_UNAVAILABLE"});
});

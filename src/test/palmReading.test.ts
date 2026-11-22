import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { palmReading } from "../../supabase/functions/mystical-reading/palm";

const photo = "data:image/jpeg;base64,/9j/2Q==";
const absent = {shape: "unresolved", path: ""};
const valid = {view: "palm", clear: true, upper: {shape:"straight",path:"עובר לרוחב הכף"}, middle: absent, fate: absent, thumb:{shape:"curved",path:"מתעקל סביב האגודל"}};
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
  {...valid, thumb:absent}])("returns only a retake for inadequate evidence", async obs => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(model(obs)));
  const res = await palmReading({palmImage: photo}, "he", "test", {});
  expect(res.status).toBe(422);
  expect(await res.json()).toMatchObject({code:"PALM_RETAKE",photoIndex:0});
});

it.each([["he","מה נראה בצילום","נמשך לצד הכף","העיקול מזמין מחשבה"], ["ar","ما يظهر في الصورة","يمتد عبر الكف","يمكن التأمل في هذا القوس"], ["en","Visible in the photo","runs across the palm","The arc suggests a pause"], ["ru","Что видно на фотографии","поперёк ладони","Дуга напоминает о паузе"]])("interprets only the observed traces in %s", async (lang,title,path,reflection) => {
  const observation = {...valid, upper:{shape:"straight",path},thumb:{shape:"curved",path}};
  const fetcher = vi.fn().mockResolvedValueOnce(model(observation)).mockResolvedValueOnce(model({upper:reflection,thumb:reflection}));
  vi.stubGlobal("fetch", fetcher);
  const res = await palmReading({palmImage:photo}, lang, "test", {});
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toContain(title);
  expect(text).toContain(reflection);
  const request = JSON.parse(fetcher.mock.calls[1][1].body);
  const traces = JSON.parse(request.messages[1].content);
  expect(traces.map((trace: {id: string}) => trace.id)).toEqual(["upper","thumb"]);
  expect(traces[0]).toMatchObject({shape:"straight",path});
  expect(request.messages[1].content).not.toContain("data:image");
  expect(text).toContain("data: [DONE]");
  expect(text).not.toMatch(/Fate line|קו הגורל|Линия судьбы|خط القدر/);
  expect(text).toContain("### " + traces[0].label);
  expect(text).toContain("### " + traces[1].label);
});

it.each([
  ["toward_wrist", "gradual", "a thought turning inward"],
  ["across", "even", "step by step"],
  ["toward_fingers", "distinct_turn", "actionable aim"],
  ["uncertain", "gradual", "do not ascribe meaning to a slope"],
])("grounds the head interpretation in its observed %s direction and %s bend", async (direction, bend, theme) => {
  const middle = {shape:"curved", path:"נמשך מהאגודל אל מרכז הכף", direction, bend};
  const response = {upper:"פירוש הלב", middle:"פירוש מותאם לצורת קו הראש", thumb:"פירוש החיים"};
  const fetcher = vi.fn().mockResolvedValueOnce(model({...valid, middle})).mockResolvedValueOnce(model(response));
  vi.stubGlobal("fetch", fetcher);
  const result = await palmReading({palmImage:photo}, "he", "test", {});
  expect(await result.text()).toContain(response.middle);
  const request = JSON.parse(fetcher.mock.calls[1][1].body);
  const head = JSON.parse(request.messages[1].content).find((trace: {id: string}) => trace.id === "middle");
  expect(head).toMatchObject({...middle, symbolicTheme: expect.stringContaining(theme)});
});

it("does not substitute a canned reading when the generated prose mixes languages", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(model(valid)).mockResolvedValueOnce(model({upper:"הקו ישר and long",thumb:"עיקול בכף"}));
  vi.stubGlobal("fetch", fetcher);
  expect((await palmReading({palmImage:photo}, "he", "test", {})).status).toBe(503);
});

it("discards the first reading if the second photo fails", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(model(valid)).mockResolvedValueOnce(model({...valid, view:"back"}));
  vi.stubGlobal("fetch", fetcher);
  const res = await palmReading({rightPalmImage:photo,leftPalmImage:photo}, "he", "test", {});
  expect(res.status).toBe(422);
  expect(await res.json()).toMatchObject({code:"PALM_RETAKE",photoIndex:1});
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it("keeps a provider outage distinct from a bad photo", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null,{status:503})));
  const res = await palmReading({palmImage:photo}, "en", "test", {});
  expect(res.status).toBe(503);
  expect(await res.json()).toMatchObject({code:"PALM_UNAVAILABLE"});
});

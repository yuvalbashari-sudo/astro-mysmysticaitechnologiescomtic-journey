import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { palmDetailReading, palmReading } from "../../supabase/functions/mystical-reading/palm";
import { hasTopMargin } from "../../supabase/functions/_shared/palmDetail";

const photo = "data:image/jpeg;base64,/9j/2Q==";
const absent = {shape: "unresolved", path: ""};
const valid = {view: "palm", clear: true, upper: {shape:"straight",path:"עובר לרוחב הכף"}, middle: absent, fate: absent, thumb:{shape:"curved",path:"מתעקל סביב האגודל"}};
function model(obs: unknown) {
  return Response.json({choices: [{finish_reason: "stop", message: {content: JSON.stringify(obs)}}]});
}
// The Edge runtime has AbortSignal.timeout; the project's jsdom environment does not.
beforeEach(() => vi.stubGlobal("AbortSignal", { timeout: () => new AbortController().signal }));
afterEach(() => vi.unstubAllGlobals());

it.each(["joints", "edge"])("requires visible evidence before interpreting %s", async focus => {
  const observation = "נראים שני קפלים סמוכים";
  const meaning = "אפשר לחשוב על שתי אפשרויות";
  const fetcher = vi.fn().mockResolvedValueOnce(model({clear:false,observation:""}))
    .mockResolvedValueOnce(model({clear:true,observation})).mockResolvedValueOnce(model({meaning}));
  vi.stubGlobal("fetch", fetcher);
  const run = () => palmDetailReading({palmImage:photo,focus}, "he", "test", {});
  expect((await run()).status).toBe(422);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(await (await run()).json()).toEqual({observation,meaning});
  const reflection = JSON.parse(fetcher.mock.calls[2][1].body);
  expect(JSON.parse(reflection.messages[1].content).observation).toBe(observation);
  expect(reflection.messages[1].content).not.toContain("data:image");
});

function frameSample(cutOff = false) {
  const pixels = new Uint8Array(48 * 32 * 3).fill(200);
  for (let y = cutOff ? 0 : 5; y < 32; y++) {
    for (let x = 12; x < 35; x++) pixels.fill(75, (y * 48 + x) * 3, (y * 48 + x + 1) * 3);
  }
  return btoa(String.fromCharCode(...pixels));
}

it("stops cut-off, blank and missing framing evidence before asking vision", async () => {
  expect(hasTopMargin(btoa("a".repeat(48 * 32 * 3)))).toBe(false);
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  for (const sample of [undefined,frameSample(true)]) {
    expect((await palmDetailReading({palmImage:photo,focus:"heights",frameSample:sample},"he","test",{})).status).toBe(422);
  }
  expect(fetcher).not.toHaveBeenCalled();
});

it("accepts only a comparison of the two fingertips for the height reading", async () => {
  const frame = {view:"single_open_palm",index:"complete",middle:"complete",ring:"complete",little:"complete"};
  const fetcher = vi.fn().mockResolvedValueOnce(model({...frame, index:"cut_off"}))
    .mockResolvedValueOnce(model(frame)).mockResolvedValueOnce(model({clear:true,observation:"יש טבעת על האצבע"}))
    .mockResolvedValueOnce(model(frame)).mockResolvedValueOnce(model({comparison:"similar"})).mockResolvedValueOnce(model({meaning:"הדמיון מזמין לחשוב על איזון"}));
  vi.stubGlobal("fetch", fetcher);
  const run = () => palmDetailReading({palmImage:photo,focus:"heights",frameSample:frameSample()}, "he", "test", {});
  expect((await run()).status).toBe(422);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect((await run()).status).toBe(422);
  const result = await (await run()).json();
  expect(result.observation).toContain("לגובה דומה");
  expect(fetcher.mock.calls[5][1].body).not.toContain("טבעת");
});

it("rejects an invalid focus or a pair of detail photos before calling vision", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  for (const data of [{palmImage:photo,focus:"unknown"},{rightPalmImage:photo,leftPalmImage:photo,focus:"edge"}]) {
    expect((await palmDetailReading(data,"he","test",{})).status).toBe(422);
  }
  expect(fetcher).not.toHaveBeenCalled();
});

it.each([["dominant","practiced habits"],["other","possibility they might explore"]])("applies the selected hand role only to reflection (%s)", async (handRole, theme) => {
  const evidence = {clear:true,observation:"הקפל מתעקל בהדרגה"};
  const fetcher = vi.fn().mockResolvedValueOnce(model(evidence)).mockResolvedValueOnce(model({meaning:"העיקול מזמין שאלה"}));
  vi.stubGlobal("fetch", fetcher);
  const res = await palmDetailReading({palmImage:photo,focus:"joints",handRole}, "he", "test", {});
  expect(res.status).toBe(200);
  expect(fetcher.mock.calls[0][1].body).not.toContain(theme);
  expect(fetcher.mock.calls[1][1].body).toContain(theme);
});

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
  ["toward_wrist", "gradual", "mentally rehearse"],
  ["across", "even", "practical steps"],
  ["toward_fingers", "distinct_turn", "observable first action"],
  ["uncertain", "gradual", "do not ascribe meaning to a slope"],
])("grounds the head interpretation in its observed %s direction and %s bend", async (direction, bend, theme) => {
  const middle = {shape:bend === "even" ? "straight" : "curved", path:"נמשך מהאגודל אל מרכז הכף", direction, bend, directionEvidence:"unambiguous"};
  const response = {upper:"פירוש הלב", middle:"פירוש מותאם לצורת קו הראש", thumb:"פירוש החיים"};
  const fetcher = vi.fn().mockResolvedValueOnce(model({...valid, middle}));
  if (direction !== "uncertain") fetcher.mockResolvedValueOnce(model({direction}));
  fetcher.mockResolvedValueOnce(model(response));
  vi.stubGlobal("fetch", fetcher);
  const result = await palmReading({palmImage:photo}, "he", "test", {});
  expect(await result.text()).toContain(response.middle);
  const request = JSON.parse(fetcher.mock.calls.at(-1)![1].body);
  const head = JSON.parse(request.messages[1].content).find((trace: {id: string}) => trace.id === "middle");
  expect(head).toMatchObject({direction, bend, symbolicTheme: expect.stringContaining(theme)});
  expect(head.path).not.toEqual(middle.path);
});

it.each(["subtle_or_partial", "unambiguous"])("discloses a rejected slope and retains the observed bend (%s)", async directionEvidence => {
  const middle = {shape:"curved", bend:"gradual", direction:"toward_wrist", directionEvidence, path:"יורד באלכסון לעבר שורש כף היד"};
  const fetcher = vi.fn().mockResolvedValueOnce(model({...valid, middle}));
  if (directionEvidence === "unambiguous") fetcher.mockResolvedValueOnce(model({direction:"across"}));
  fetcher.mockResolvedValueOnce(model({upper:"פירוש הלב",middle:"השיפוע לשורש היד מזמין מחשבה",thumb:"פירוש החיים"}));
  vi.stubGlobal("fetch", fetcher);
  const result = await palmReading({palmImage:photo}, "he", "test", {});
  const text = await result.text();
  expect(text).toContain("כיוון קו הראש אינו ברור בצילום הזה. אפשר להבחין בעיקול הדרגתי.");
  expect(text).not.toMatch(/שורש|אלכסון/);
  const traces = JSON.parse(JSON.parse(fetcher.mock.calls.at(-1)![1].body).messages[1].content);
  expect(traces.find((t: {id:string}) => t.id === "middle")).toMatchObject({direction:"uncertain", bend:"gradual"});
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

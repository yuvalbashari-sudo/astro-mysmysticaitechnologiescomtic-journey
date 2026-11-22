import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import { join } from "node:path";
import { palmReading } from "../../supabase/functions/mystical-reading/palm.ts";

const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error("Run in the Israeli test environment with its existing OpenAI secret");
const asset = (file: string) => readFile(new URL("../fixtures/palm/" + file, import.meta.url));
const dorsal = await fetch("https://storage.googleapis.com/mediapipe-assets/right_hands.jpg");
if (!dorsal.ok) throw new Error("Could not load the dorsal reference photo");
const fixtures = [
  { label: "open", mime: "image/jpeg", bytes: await asset("open.jpg") },
  { label: "second-open", mime: "image/jpeg", bytes: await asset("second-open.jpg") },
  { label: "dorsal", mime: "image/jpeg", bytes: Buffer.from(await dorsal.arrayBuffer()) },
  { label: "blur", mime: "image/jpeg", bytes: await asset("blur.jpg") },
  { label: "shapes", mime: "image/png", bytes: await asset("shapes.png") },
];
let passed = true;
const readings = new Set<string>();
const headMeanings = new Set<string>();
const mirrorDirectory = process.env.PALM_MIRROR_FIXTURES;
if (mirrorDirectory) {
  for (const label of ["open", "second-open"]) {
    fixtures.push({label: label + "-mirror", mime:"image/jpeg", bytes:await readFile(join(mirrorDirectory, label + ".jpg"))});
  }
}
// Compare anatomical tags, independent of the wording generated for the reader.
const originalTraces = new Map<string,string>();
let observedTrace = "";
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const response = await realFetch(input, init);
  if (typeof init?.body === "string" && response.ok) {
    const request = JSON.parse(init.body);
    if (request.response_format?.json_schema?.name === "palm_reflection") {
      const head = JSON.parse(request.messages[1].content).find((trace: {id:string}) => trace.id === "middle");
      if (head) observedTrace = [head.direction, head.bend].join("/");
    }
  }
  return response;
};
for (const {label,mime,bytes} of fixtures) {
  observedTrace = "";
  const start = Date.now();
  const image = "data:" + mime + ";base64," + bytes.toString("base64");
  const r = await palmReading({palmImage:image}, "he", key, {});
  const body = await r.text();
  const mirror = label.endsWith("-mirror");
  const positive = mirror || label === "open" || label === "second-open";
  const description: string | null = positive && r.ok
    ? JSON.parse(body.split("\n")[0].slice(6)).choices[0].delta.content : null;
  const reflection = description?.split("\n\n").filter(p => p.startsWith("פירוש סמלי — ")).join("\n");
  const head = description?.match(/### קו הראש\n\nמה נראה בצילום — [^\n]+\n\nפירוש סמלי — ([^\n]+)/)?.[1];
  const headSection = description?.split("### קו הראש\n\n")[1]?.split("\n\n###")[0];
  const disclosed = !observedTrace.startsWith("uncertain/") || (!!headSection?.includes("כיוון קו הראש אינו ברור בצילום הזה.") && !!head && !/שורש|אגודל|אלכסו|שיפוע|כלפי מעלה|כלפי מטה/.test(head));
  if (positive && !mirror) originalTraces.set(label, observedTrace);
  const sameTrace = mirror ? !!observedTrace && observedTrace === originalTraces.get(label.slice(0,-7)) : undefined;
  const ok = positive
    ? r.ok && !!description && ["קו הלב", "קו הראש", "קו החיים"].every(label => description.includes("### " + label))
      && (reflection?.split("\n").length ?? 0) >= 2
      && !!head && disclosed && (mirror || observedTrace.startsWith("uncertain/") || !headMeanings.has(head)) && !/דמיון מפותח/.test(head)
      && !!reflection && (mirror || !readings.has(reflection)) && sameTrace !== false
      && !/[a-z\u0400-\u04ff\u0600-\u06ff]/i.test(description)
    : r.status === 422 && JSON.parse(body).code === "PALM_RETAKE";
  console.log(JSON.stringify({label,status:r.status,seconds:(Date.now()-start)/1000,ok,observedTrace,sameTrace,output:mirror ? headSection : description ?? body}));
  passed &&= ok;
  if (reflection) readings.add(reflection);
  if (head) headMeanings.add(head);
}
if (!passed) process.exitCode = 1;

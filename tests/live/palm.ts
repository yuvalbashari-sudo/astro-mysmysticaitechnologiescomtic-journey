import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
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
for (const {label,mime,bytes} of fixtures) {
  const start = Date.now();
  const image = "data:" + mime + ";base64," + bytes.toString("base64");
  const r = await palmReading({palmImage:image}, "he", key, {});
  const body = await r.text();
  const positive = label === "open" || label === "second-open";
  const description: string | null = positive && r.ok
    ? JSON.parse(body.split("\n")[0].slice(6)).choices[0].delta.content : null;
  const reflection = description?.split("\n\n").filter(p => p.startsWith("פירוש סמלי — ")).join("\n");
  const ok = positive
    ? r.ok && !!description && ["קו הלב", "קו הראש", "קו החיים"].every(label => description.includes("### " + label))
      && (reflection?.split("\n").length ?? 0) >= 2
      && !!reflection && !readings.has(reflection) && !/[a-z\u0400-\u04ff\u0600-\u06ff]/i.test(description)
    : r.status === 422 && JSON.parse(body).code === "PALM_RETAKE";
  console.log(JSON.stringify({label,status:r.status,seconds:(Date.now()-start)/1000,ok,output:description ?? body}));
  passed &&= ok;
  if (reflection) readings.add(reflection);
}
if (!passed) process.exitCode = 1;

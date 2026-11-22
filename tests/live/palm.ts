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
  { label: "dorsal", mime: "image/jpeg", bytes: Buffer.from(await dorsal.arrayBuffer()) },
  { label: "blur", mime: "image/jpeg", bytes: await asset("blur.jpg") },
  { label: "shapes", mime: "image/png", bytes: await asset("shapes.png") },
];
let passed = true;
for (const {label,mime,bytes} of fixtures) {
  const start = Date.now();
  const image = "data:" + mime + ";base64," + bytes.toString("base64");
  const r = await palmReading({palmImage:image}, "he", key, {});
  const body = await r.text();
  const description = label === "open" && r.ok
    ? JSON.parse(body.split("\n")[0].slice(6)).choices[0].delta.content : null;
  const ok = label === "open"
    ? r.ok && Boolean(description?.includes("הקפל שסביב בסיס האגודל — מעוקל")
      && /הקפל העליון|הקפל שחוצה/.test(description) && description.includes("פירוש סמלי"))
    : r.status === 422 && JSON.parse(body).code === "PALM_RETAKE";
  console.log(JSON.stringify({label,status:r.status,seconds:(Date.now()-start)/1000,ok,output:description ?? body}));
  passed &&= ok;
}
if (!passed) process.exitCode = 1;

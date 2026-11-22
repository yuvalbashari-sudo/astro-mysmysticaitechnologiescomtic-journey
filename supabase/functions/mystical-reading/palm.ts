type Locale = "he" | "en" | "ru" | "ar";
export const palmModel = "gpt-4.1";
const lines = ["upper", "middle", "thumb"] as const;
type Line = typeof lines[number];
type Shape = "curved" | "straight" | "unresolved";
type Trace = { shape: Shape; path: string };
type Observation = Record<Line, Trace>;
const views = ["palm", "back", "no_hand", "multiple", "uncertain"] as const;

const copy = {
  he: {
    retake: "צלמו כף יד אחת פתוחה, כשהצד הפנימי פונה למצלמה. כללו את בסיס האצבעות ואת שורש כף היד, באור אחיד ובמיקוד שמראה את הקווים.",
    retry: "בדיקת התמונה לא הושלמה. אפשר לנסות שוב.", seen: "מה נראה בצילום", meaning: "פירוש סמלי",
    pair: ["הצילום הראשון", "הצילום השני"],
    upper: "הקפל העליון שמתחת לאצבעות",
    middle: "הקפל שחוצה את מרכז הכף",
    thumb: "הקפל שסביב בסיס האגודל",
  },
  en: {
    retake: "Photograph one open hand with the palm facing the camera. Include the base of the fingers and the wrist, in even light, with the creases in focus.",
    retry: "The image check could not be completed. Please try again.", seen: "Visible in the photo", meaning: "Symbolic interpretation",
    pair: ["First photo", "Second photo"],
    upper: "The upper crease below the fingers",
    middle: "The crease crossing the middle of the palm",
    thumb: "The crease around the base of the thumb",
  },
  ru: {
    retake: "Сфотографируйте одну раскрытую ладонь внутренней стороной к камере. В кадре должны быть основания пальцев и запястье. При ровном освещении складки должны быть в фокусе.",
    retry: "Не удалось завершить проверку фотографии. Попробуйте ещё раз.", seen: "Что видно на фотографии", meaning: "Символическое толкование",
    pair: ["Первое фото", "Второе фото"],
    upper: "Верхняя складка под пальцами",
    middle: "Складка поперёк середины ладони",
    thumb: "Складка у основания большого пальца",
  },
  ar: {
    retake: "التقط صورة ليد واحدة مفتوحة وباطن الكف مواجه للكاميرا. أظهر قاعدة الأصابع والرسغ في إضاءة متوازنة مع التركيز على ثنيات الكف.",
    retry: "تعذر إكمال فحص الصورة. يرجى المحاولة مرة أخرى.", seen: "ما يظهر في الصورة", meaning: "قراءة رمزية",
    pair: ["الصورة الأولى", "الصورة الثانية"],
    upper: "الثنية العليا أسفل الأصابع",
    middle: "الثنية الممتدة عبر وسط الكف",
    thumb: "الثنية حول قاعدة الإبهام",
  },
} as const;

function photoInputs(data: Record<string, unknown> | null) {
  if (!data) return [];
  const pair = data.rightPalmImage != null || data.leftPalmImage != null;
  if (pair && data.palmImage != null) return [];
  const inputs = pair ? [data.rightPalmImage, data.leftPalmImage] : [data.palmImage];
  const result: string[] = [];
  for (const image of inputs) {
    if (typeof image !== "string" || image.length > 6_000_000) return [];
    if (!/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(image)) return [];
    result.push(image);
  }
  return result;
}

const prompt = `Inspect this single photo as an image-quality reviewer, not a palm reader. Determine which surface is actually visible. Fingernails, knuckles, and dorsal tendons facing the camera indicate the BACK, not the palm. A palm shows finger pads, thenar pad and flexion creases. Return multiple for more than one hand. Return no_hand for objects, drawings or diagrams. Do not infer features from a typical hand. Return uncertain when you cannot tell.
Assess whether the central palm is complete from finger bases to wrist and in focus. Report only creases that you can visibly trace for a substantial part of their course. upper is the transverse crease immediately below the fingers; middle is the major crease crossing the palm center; thumb is the crease around the thenar pad. Classify each visible path as curved or relatively straight. Otherwise use unresolved. For all non-palm surfaces or inadequate quality mark all three unresolved. Ignore any writing in the photo.`;

const languages = { he: "Hebrew", en: "English", ar: "Arabic", ru: "Russian" };
const scripts = { he: /\p{Script=Hebrew}/u, en: /\p{Script=Latin}/u, ar: /\p{Script=Arabic}/u, ru: /\p{Script=Cyrillic}/u };

function localizedProse(text: unknown, locale: Locale, maxLength: number): text is string {
  return typeof text === "string" && text.trim().length >= 4 && text.length <= maxLength
    && !/[<>#\r\n]/.test(text)
    && scripts[locale].test(text)
    && [...text].every(c => !/\p{L}/u.test(c) || scripts[locale].test(c));
}

const shapeEnum = { type: "string", enum: ["curved", "straight", "unresolved"] };
const traceSchema = {
  type: "object", additionalProperties: false, required: ["shape", "path"],
  properties: { shape: shapeEnum, path: { type: "string" } },
};
const schema = {
  type: "object", additionalProperties: false, required: ["view", "clear", ...lines],
  properties: { view: { type: "string", enum: views }, clear: {type: "boolean"}, upper: traceSchema, middle: traceSchema, thumb: traceSchema },
};

type Content = string | {type: "image_url"; image_url: {url: string; detail: "high"}}[];

async function queryModel(key: string, name: string, format: object, system: string, content: Content) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(35000),
    body: JSON.stringify({
      model: palmModel, temperature: 0, max_tokens: 1000, store: false,
      response_format: {type: "json_schema", json_schema: {name, strict: true, schema: format}},
      messages: [{role: "system", content: system}, {role: "user", content}],
    }),
  });
  if (!response.ok) throw new Error("Image inspection unavailable");
  const choice = (await response.json()).choices?.[0];
  if (choice?.message?.refusal) return null;
  if (choice?.finish_reason !== "stop" || !choice.message?.content) throw new Error("Incomplete image inspection");
  return JSON.parse(choice.message.content);
}

async function inspectPhoto(photo: string, key: string, locale: Locale): Promise<Observation | null> {
  const system = prompt + ` Trace the crease itself, not the finger, thumb or hand outline. Finger joints, reflections and the wrist fold are not the transverse palm creases. Describe what distinguishes this particular visible segment: its angle across the palm or the width of its bow, and where its direction changes or the trace fades. "From the palm towards the palm/wrist" conveys no geometry. If you cannot follow an individual crease, mark it unresolved and leave its path empty. Trace each independently, even if a different line is clear. Write one short natural sentence per trace in ${languages[locale]}, with anatomical landmarks rather than screen coordinates. Do not infer line endings beyond what is visible, or mention accessories, identity or symbolism.`;
  const obs = await queryModel(key, "palm_observation", schema, system, [{type: "image_url", image_url: {url: photo, detail: "high"}}]);
  if (!obs || obs.view !== "palm" || obs.clear !== true) return null;
  if (!lines.every(line => shapeEnum.enum.includes(obs[line]?.shape))) throw new Error("Invalid trace");
  const visible = lines.filter(line => obs[line].shape !== "unresolved");
  if (visible.length < 2) return null;
  if (!visible.every(line => localizedProse(obs[line].path, locale, 320))) throw new Error("Invalid trace description");
  return obs;
}

async function interpret(obs: Observation, key: string, locale: Locale) {
  const visible = lines.filter(line => obs[line].shape !== "unresolved");
  const format = {
    type: "object", additionalProperties: false, required: ["reading", "invitation"],
    properties: {reading: {type: "string"}, invitation: {type: "string"}},
  };
  const system = `Write a personal, symbolic reading in natural ${languages[locale]}. The input is a list of independently observed traces on this specific palm. Choose its most distinctive spatial detail and relate it to a second observed detail only when the descriptions support the relationship. In "reading" write two or three connected sentences developing ONE symbolic theme from that combination. In "invitation" give one concrete small choice or open question the reader could try. Let the actual change of direction, relative angle, contrast, or visible span determine the theme. Do not claim that two lines touch, branch or share a starting point unless the input says so. Do not list one stock analogy per line. Avoid rivers, bridges, trees and roots, definitions of palmistry, and interchangeable life advice. Do not treat photo quality as personality or make claims about a person's character, future, health or lifespan. Write inclusively; in Hebrew favor gender-neutral everyday wording such as infinitives. No headings, foreign words or markdown.`;
  const input = visible.map(line => ({ id: line, label: copy[locale][line], ...obs[line] }));
  const result = await queryModel(key, "palm_reflection", format, system, JSON.stringify(input));
  if (!result || !localizedProse(result.reading, locale, 800) || !localizedProse(result.invitation, locale, 500)) throw new Error("Invalid reflection");
  return [result.reading, result.invitation];
}

export async function palmReading(
  data: Record<string, unknown> | null, language: string, key: string,
  cors: Record<string,string>,
): Promise<Response> {
  const locale: Locale = language === "en" || language === "ar" || language === "ru" ? language : "he";
  const t = copy[locale];
  const headers = { ...cors, "Cache-Control": "no-store" };
  const retake = (index?: number) => Response.json({
    code: "PALM_RETAKE", error: t.retake, ...(index !== undefined && { photoIndex: index }),
  }, { status: 422, headers });
  const photos = photoInputs(data);
  if (!photos.length) return retake();
  const sections: string[] = [];
  try {
    const observations: Observation[] = [];
    for (const [index, photo] of photos.entries()) {
      const obs = await inspectPhoto(photo, key, locale);
      if (!obs) return retake(index);
      observations.push(obs);
    }
    for (const [index, obs] of observations.entries()) {
      const visible = lines.filter(line => obs[line].shape !== "unresolved");
      if (photos.length === 2) sections.push("## " + t.pair[index]);
      sections.push("### " + t.seen, ...visible.map(line => t[line] + " — " + obs[line].path));
      sections.push("### " + t.meaning, ...await interpret(obs, key, locale));
    }
  } catch {
    return Response.json({code: "PALM_UNAVAILABLE", error: t.retry}, { status: 503, headers });
  }
  const message = JSON.stringify({ choices: [{delta: {content: sections.join("\n\n")}}] });
  return new Response("data: " + message + "\n\ndata: [DONE]\n\n", {headers: {...headers, "Content-Type":"text/event-stream"}});
}

type Locale = "he" | "en" | "ru" | "ar";
const observationModel = "gpt-4.1";
const interpretationModel = "gpt-5.4";
export const palmModel = observationModel + " / " + interpretationModel;
const mainLines = ["upper", "middle", "thumb"] as const;
const lines = [...mainLines, "fate"] as const;
type Line = typeof lines[number];
type Shape = "curved" | "straight" | "unresolved";
type Trace = { shape: Shape; path: string };
const directionThemes = {
  toward_wrist: "mentally rehearse one concrete outcome and notice a detail within it",
  toward_fingers: "turn an intention into an observable first action",
  across: "order the practical steps of a task from beginning to end",
  uncertain: "use only the clearly described segment; do not ascribe meaning to a slope",
} as const;
const bends = ["even", "gradual", "distinct_turn", "uncertain"] as const;
type HeadTrace = Trace & { direction: keyof typeof directionThemes; bend: typeof bends[number] };
type Observation = Record<Line, Trace> & { middle: HeadTrace };
const views = ["palm", "back", "no_hand", "multiple", "uncertain"] as const;

const copy = {
  he: {
    retake: "צלמו כף יד אחת פתוחה, כשהצד הפנימי פונה למצלמה. כללו את בסיס האצבעות ואת שורש כף היד, באור אחיד ובמיקוד שמראה את הקווים.",
    retry: "בדיקת התמונה לא הושלמה. אפשר לנסות שוב.", seen: "מה נראה בצילום", meaning: "פירוש סמלי",
    pair: ["הצילום הראשון", "הצילום השני"],
    upper: "קו הלב",
    middle: "קו הראש",
    thumb: "קו החיים",
    fate: "קו הגורל", unclear: "בצילום הזה קשה לעקוב אחרי הקו בביטחון.",
  },
  en: {
    retake: "Photograph one open hand with the palm facing the camera. Include the base of the fingers and the wrist, in even light, with the creases in focus.",
    retry: "The image check could not be completed. Please try again.", seen: "Visible in the photo", meaning: "Symbolic interpretation",
    pair: ["First photo", "Second photo"],
    upper: "Heart line",
    middle: "Head line",
    thumb: "Life line",
    fate: "Fate line", unclear: "This line is difficult to trace in this photo.",
  },
  ru: {
    retake: "Сфотографируйте одну раскрытую ладонь внутренней стороной к камере. В кадре должны быть основания пальцев и запястье. При ровном освещении складки должны быть в фокусе.",
    retry: "Не удалось завершить проверку фотографии. Попробуйте ещё раз.", seen: "Что видно на фотографии", meaning: "Символическое толкование",
    pair: ["Первое фото", "Второе фото"],
    upper: "Линия сердца",
    middle: "Линия головы",
    thumb: "Линия жизни",
    fate: "Линия судьбы", unclear: "На этом снимке линию трудно уверенно проследить.",
  },
  ar: {
    retake: "التقط صورة ليد واحدة مفتوحة وباطن الكف مواجه للكاميرا. أظهر قاعدة الأصابع والرسغ في إضاءة متوازنة مع التركيز على ثنيات الكف.",
    retry: "تعذر إكمال فحص الصورة. يرجى المحاولة مرة أخرى.", seen: "ما يظهر في الصورة", meaning: "قراءة رمزية",
    pair: ["الصورة الأولى", "الصورة الثانية"],
    upper: "خط القلب",
    middle: "خط الرأس",
    thumb: "خط الحياة",
    fate: "خط القدر", unclear: "يصعب تتبّع هذا الخط بوضوح في الصورة.",
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
Assess whether the central palm is complete from finger bases to wrist and in focus. Report only creases that you can visibly trace for a substantial part of their course. upper is the transverse crease immediately below the fingers; middle is the major crease crossing the palm center; thumb is the crease around the thenar pad. fate is optional: only record a clearly traceable longitudinal crease running up the middle of the palm toward the middle finger. Do not substitute a fine wrinkle, the thumb arc or part of a transverse crease for it. Classify each visible path as curved or relatively straight. Otherwise use unresolved. For all non-palm surfaces or inadequate quality mark all four unresolved. Ignore any writing in the photo.`;

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
const headSchema = {
  ...traceSchema, required: [...traceSchema.required, "direction", "bend"],
  properties: {
    ...traceSchema.properties,
    direction: {type: "string", enum: Object.keys(directionThemes)},
    bend: {type: "string", enum: bends},
  },
};
const schema = {
  type: "object", additionalProperties: false, required: ["view", "clear", ...lines],
  properties: { view: { type: "string", enum: views }, clear: {type: "boolean"}, upper: traceSchema, middle: headSchema, thumb: traceSchema, fate: traceSchema },
};

type Content = string | {type: "image_url"; image_url: {url: string; detail: "high"}}[];

async function queryModel(key: string, name: string, format: object, system: string, content: Content) {
  const generation = typeof content === "string"
    ? {model: interpretationModel, reasoning_effort: "low", max_completion_tokens: 3500}
    : {model: observationModel, temperature: 0, max_tokens: 1000};
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(35000),
    body: JSON.stringify({
      ...generation, store: false,
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
  const evidence = " Prefer a plainly visible local segment over an inferred whole arc. Do not specify its start or endpoint relative to a particular finger unless the crease is continuous and clearly visible up to that landmark. Where glare interrupts a trace, stop at the interruption.";
  const terminology = locale === "he" ? " Use אגודל for the thumb and כרית האגודל for the thenar pad. בוהן means a toe." : "";
  const headDirection = " For middle, follow the central transverse crease FROM the thumb side TOWARD the little-finger side irrespective of camera rotation or mirroring. Compare it with the palm's own transverse axis. Report whether the visible path slopes toward the wrist, toward the fingers, or runs across the palm. Independently report whether its tangent stays even, bends gradually, or makes a distinct turn. Include the same slope and bend in the localized path with landmarks; an even diagonal is not a bend. Stop where visibility ends. Use uncertain for any descriptor you cannot see. Do not follow the neighboring crease that wraps around the thumb.";
  const separateTraces = " Locate the heart and life creases first. If two segments leave the thumb side close together, inspect the more TRANSVERSE segment as the head line; the steeper segment hugging the thumb mound is the life line. Only report a curve if the crease itself changes angle along the portion you see. A slope caused by the hand being tilted in the picture is not a turn. Describe the first and last visible segments of this particular central crease.";
  const obs = await queryModel(key, "palm_observation", schema, system + evidence + headDirection + separateTraces + terminology, [{type: "image_url", image_url: {url: photo, detail: "high"}}]);
  if (!obs || obs.view !== "palm" || obs.clear !== true) return null;
  if (!lines.every(line => shapeEnum.enum.includes(obs[line]?.shape))) throw new Error("Invalid trace");
  if (obs.middle.shape !== "unresolved" && (!Object.hasOwn(directionThemes, obs.middle.direction) || !bends.includes(obs.middle.bend))) throw new Error("Invalid head line geometry");
  const visible = lines.filter(line => obs[line].shape !== "unresolved");
  if (mainLines.filter(line => obs[line].shape !== "unresolved").length < 2) return null;
  if (!visible.every(line => localizedProse(obs[line].path, locale, 320))) throw new Error("Invalid trace description");
  return obs;
}

async function interpret(obs: Observation, key: string, locale: Locale) {
  const visible = lines.filter(line => obs[line].shape !== "unresolved");
  const format = {
    type: "object", additionalProperties: false, required: visible,
    properties: Object.fromEntries(visible.map(line => [line, {type: "string"}])),
  };
  const system = `Write a traditional palmistry reading in natural ${languages[locale]} for each supplied line. The heart line (upper) symbolizes affection and how feelings are expressed. The head line (middle) symbolizes thought, imagination and decisions. The life line (thumb) symbolizes grounding, everyday energy and pace. The fate line, if visible, symbolizes direction and chosen commitments. For each line, write two or three connected sentences that explain how one specific observed shape or change of direction informs its traditional symbolic meaning, and what that might look like in an everyday situation. Use the traditional associations as a lens for reflection, never as evidence of a real person's traits, health, lifespan or future. No predictions, diagnoses, invented branches or lengths, life coaching questions, or filler. Do not repeat the heading or rewrite the anatomical description. No markdown. In Hebrew use everyday gender-neutral language.`;
  const input = visible.map(line => ({
    id: line, label: copy[locale][line], ...obs[line],
    ...(line === "middle" && { symbolicTheme: directionThemes[obs.middle.direction] }),
  }));
  const headMeaning = " For the head line use its supplied directional theme as a symbolic starting point. Explain the part played by its actual bend: a steady course, a gradual change of approach, or a discernible pivot. Anchor both details in ONE specific example of thinking through a decision. If the direction or bend is uncertain, interpret only what is visible. Avoid generic trait labels such as 'vivid imagination', 'creative thinking' or their translations. Write fresh prose, never translate the theme verbatim.";
  const headExample = " Make the example enact the directional theme: show what the reader pictures, orders, or acts on, depending on the observed direction. Let the degree of curvature determine how that scene unfolds. State the visible course using anatomical landmarks in the meaning. Never default to exploring options, changing one's mind, flexibility or a list of traits. An essentially straight but inclined line retains its slope; do not invent a turn. Two lines with similar geometry may share a theme.";
  const depth = " Keep a clear boundary between the visual description and the symbolic reading. Use a traditional association to explain WHY the observed direction and change of course evoke a particular approach to a decision. Illustrate the distinction through one everyday example. Write with economy and warmth, not certainty about the reader. Treat a short visible segment as partial evidence; never extrapolate the far end or turn image quality into meaning. Silently discard any sentence that could equally well describe an opposite slope.";
  const result = await queryModel(key, "palm_reflection", format, system + headMeaning + headExample + depth, JSON.stringify(input));
  if (!result || !visible.every(line => localizedProse(result[line], locale, 900))) throw new Error("Invalid line interpretation");
  return result as Partial<Record<Line, string>>;
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
      const meanings = await interpret(obs, key, locale);
      if (photos.length === 2) sections.push("## " + t.pair[index]);
      for (const line of lines) {
        const meaning = meanings[line];
        if (meaning) {
          sections.push("### " + t[line], t.seen + " — " + obs[line].path, t.meaning + " — " + meaning);
        } else if (line !== "fate") {
          sections.push("### " + t[line], t.unclear);
        }
      }
    }
  } catch {
    return Response.json({code: "PALM_UNAVAILABLE", error: t.retry}, { status: 503, headers });
  }
  const message = JSON.stringify({ choices: [{delta: {content: sections.join("\n\n")}}] });
  return new Response("data: " + message + "\n\ndata: [DONE]\n\n", {headers: {...headers, "Content-Type":"text/event-stream"}});
}

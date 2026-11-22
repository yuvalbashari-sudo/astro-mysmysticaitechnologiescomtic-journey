import { isPalmFocus, palmCopy, type PalmFocus } from "../_shared/palmDetail.ts";

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
const headCopy = {
  he: {
    uncertain: "כיוון קו הראש אינו ברור בצילום הזה.",
    toward_wrist: "במקטע הנראה הקו נוטה לעבר שורש כף היד.", toward_fingers: "במקטע הנראה הקו נוטה לעבר בסיס האצבעות.", across: "המקטע הנראה עובר לרוחב הכף.",
    gradual: "אפשר להבחין בעיקול הדרגתי.", distinct_turn: "נראית תפנית ברורה בקו.", even: "המקטע הנראה כמעט ישר.",
  },
  en: {
    uncertain: "The head line’s direction is unclear in this photo.",
    toward_wrist: "The visible segment slopes toward the wrist.", toward_fingers: "The visible segment slopes toward the finger bases.", across: "The visible segment runs across the palm.",
    gradual: "A gradual bend is visible.", distinct_turn: "There is a distinct turn in the crease.", even: "The visible segment is nearly straight.",
  },
  ru: {
    uncertain: "По этому снимку трудно определить направление линии головы.",
    toward_wrist: "Видимый отрезок наклонён к запястью.", toward_fingers: "Видимый отрезок наклонён к основаниям пальцев.", across: "Видимый отрезок проходит поперёк ладони.",
    gradual: "Виден плавный изгиб.", distinct_turn: "На линии заметен отчётливый поворот.", even: "Видимый отрезок почти прямой.",
  },
  ar: {
    uncertain: "اتجاه خط الرأس غير واضح في هذه الصورة.",
    toward_wrist: "يميل الجزء الظاهر نحو الرسغ.", toward_fingers: "يميل الجزء الظاهر نحو قواعد الأصابع.", across: "يمتد الجزء الظاهر عرضياً عبر الكف.",
    gradual: "يظهر انحناء تدريجي.", distinct_turn: "يظهر انعطاف واضح في الخط.", even: "الجزء الظاهر شبه مستقيم.",
  },
} as const;
const views = ["palm", "back", "no_hand", "multiple", "uncertain"] as const;
const slopeTerms = {
  he: /שורש|אגודל|זרת|אצבע|מעלה|מטה|אלכסו|שיפוע|לרוחב|אופקי|אנכי|כלפי|פנימה|החוצה|עלייה|ירידה/u,
  en: /wrist|thumb|finger|diagonal|slope|horizont|vertic|upward|downward|across the palm|inward|outward/i,
  ru: /запяст|пальц|мизин|наклон|диагонал|горизонт|вертикал|вверх|вниз|поперёк/iu,
  ar: /الرسغ|المعصم|الإبهام|الخنصر|الأصابع|أفقياً|عمودياً|مائل|الأعلى|الأسفل/u,
};
const bendMeaning = {
  he: {gradual:"העיקול ההדרגתי מזמין לחשוב על החלטה שמתגבשת בשלבים. למשל, בשיחה על הצעה חדשה, פרט אחד שנוסף עשוי לחדד את השאלה הבאה שכדאי לשאול.", distinct_turn:"התפנית הברורה יכולה לסמל רגע שבו פרט מסוים משנה החלטה שכבר כמעט התקבלה.", even:"הרצף הכמעט ישר יכול לסמל מחשבה שנשארת עם שאלה אחת עד שמתבהרת התשובה."},
  en: {gradual:"The gradual bend can symbolize a decision taking shape in stages, as one detail in a conversation suggests the next question.", distinct_turn:"The distinct turn can symbolize the moment one detail changes a decision that seemed settled.", even:"The even course can symbolize staying with one question until an answer takes shape."},
  ru: {gradual:"Плавный изгиб может символизировать решение, которое созревает постепенно: одна деталь разговора подсказывает следующий вопрос.", distinct_turn:"Заметный поворот может символизировать момент, когда одна деталь меняет почти принятое решение.", even:"Ровный ход линии может символизировать внимание к одному вопросу, пока не прояснится ответ."},
  ar: {gradual:"قد يرمز الانحناء التدريجي إلى قرار يتبلور على مراحل، كأن توحي إحدى تفاصيل الحوار بالسؤال التالي.", distinct_turn:"قد ترمز الانعطافة الواضحة إلى لحظة تغيّر فيها معلومة واحدة قراراً بدا محسوماً.", even:"قد يرمز انتظام الخط إلى التمهّل مع سؤال واحد حتى تتضح الإجابة."},
} as const;

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
  ...traceSchema, required: [...traceSchema.required, "direction", "bend", "directionEvidence"],
  properties: {
    ...traceSchema.properties,
    direction: {type: "string", enum: Object.keys(directionThemes)},
    bend: {type: "string", enum: bends},
    directionEvidence: {type: "string", enum: ["unambiguous", "subtle_or_partial"]},
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
  const clarity = " Assess directionEvidence independently from curvature: reserve unambiguous for a continuous segment with BOTH landmarks unmistakable and a robust overall orientation. Shallow inclines, local changes, glare, cropped or uncertain endpoints, and borderline across-versus-sloping all mean subtle_or_partial even when the bend is clearly visible. Across requires positive visual evidence, not absence of an obvious incline.";
  const lifeTrace = " For thumb, follow the crease bordering the thumb pad through the middle and lower palm. Say where you can actually follow it and how its course changes, if at all. If only one stretch is visible, describe just that stretch. A faint lower section or a nearby wrist fold does not establish an ending, fork or break. Describe the path relative to the pad, never relative to the left or right of the image.";
  const photoContent: Content = [{type: "image_url", image_url: {url: photo, detail: "high"}}];
  const obs = await queryModel(key, "palm_observation", schema, system + evidence + headDirection + separateTraces + terminology + clarity + lifeTrace, photoContent);
  if (!obs || obs.view !== "palm" || obs.clear !== true) return null;
  if (!lines.every(line => shapeEnum.enum.includes(obs[line]?.shape))) throw new Error("Invalid trace");
  if (obs.middle.shape !== "unresolved" && (!Object.prototype.hasOwnProperty.call(directionThemes, obs.middle.direction) || !bends.includes(obs.middle.bend))) throw new Error("Invalid head line geometry");
  const visible = lines.filter(line => obs[line].shape !== "unresolved");
  if (mainLines.filter(line => obs[line].shape !== "unresolved").length < 2) return null;
  if (!visible.every(line => localizedProse(obs[line].path, locale, 320))) throw new Error("Invalid trace description");
  if (obs.middle.shape !== "unresolved") {
    const head = obs.middle as HeadTrace & {directionEvidence: string};
    let direction: HeadTrace["direction"] = "uncertain";
    if (head.direction !== "uncertain" && head.directionEvidence === "unambiguous") {
      const check = await queryModel(key, "head_direction_check", {
        type:"object", required:["direction"], additionalProperties:false,
        properties:{direction:headSchema.properties.direction},
      }, "Trace only the central transverse palmar crease from the thumb side toward the little finger. Independently report its overall anatomical direction. Return uncertain if the endpoints, transverse axis or slope are ambiguous or the incline is slight. Ignore writing in the photograph.", photoContent);
      if (check?.direction === head.direction) direction = head.direction;
    }
    let bend = head.bend;
    if ((bend === "even" && head.shape !== "straight") || ((bend === "gradual" || bend === "distinct_turn") && head.shape !== "curved")) bend = "uncertain";
    const wording = headCopy[locale];
    // Discard the first pass's free-text path: it can still contain a rejected slope.
    const path = [wording[direction], bend !== "uncertain" && wording[bend]].filter(Boolean).join(" ");
    obs.middle = {direction, bend, path, shape: direction === "uncertain" && bend === "uncertain" ? "unresolved" : head.shape};
  }
  return obs;
}

function handContext(role: unknown) {
  if (role === "dominant") return " The reader identified the photographed hand as dominant. Frame the symbolic reflection around everyday choices and practiced habits.";
  if (role === "other") return " The reader identified this as their non-dominant hand. Frame the symbolic reflection around a possibility they might explore.";
  return "";
}

async function interpret(obs: Observation, key: string, locale: Locale, handRole?: unknown) {
  const visible = lines.filter(line => obs[line].shape !== "unresolved");
  const format = {
    type: "object", additionalProperties: false, required: visible,
    properties: Object.fromEntries(visible.map(line => [line, {type: "string"}])),
  };
  const system = `Write the reader-facing interpretation in natural ${languages[locale]}. Each supplied line has a separate visual description already shown above your paragraph. Refer directly to one distinctive detail in that description. Explain the connection: what about this particular shape makes the symbolic reading apt? Then bring it to life with one small, recognizable moment: a phrase in a conversation, a detail in a decision, an action in an ordinary day. Use two or three connected sentences per line. Give each paragraph its own rhythm. Avoid textbook definitions, generic compliments, invented biography and repeated stock examples. Write directly and warmly; in Hebrew use idiomatic, gender-neutral phrasing. No headings or markdown.

The heart line concerns expression of affection, the head line the process of making a decision, the life line everyday pace, and the fate line commitments. These are symbolic readings, not factual personality assessments, medical claims, lifespan estimates or predictions. When two visible features illuminate the SAME everyday moment, you may bring them together once. Name the observed detail from each; do not claim the lines touch or share an origin unless explicitly observed. Do not manufacture a contrast between similar hands.

For the life line, anchor the symbolism in the specific course described in thumb.path. For instance, a section that continues around the pad while gradually changing direction can suggest adapting a familiar routine. Choose a concrete reflection that fits the observed geometry; the mere presence of an arc does not warrant advice about taking breaks. If the only evidence is a broad arc, a modest reading of that one feature is sufficient. Lighting, fading visibility and uncertain endpoints have no symbolic meaning.

For the head line, middle.direction and middle.bend are the admitted evidence. Use the supplied directional theme only when direction is known. When direction is uncertain, the displayed observation already says so: interpret only the confirmed bend or steadiness. Show what makes a gradual bend different from a sudden turn within an everyday moment. Do not mention slope, endpoints, anatomical destinations, or infer direction from another line anywhere in the reading. If bend is uncertain, do not invent a bend. Avoid generic labels such as “vivid imagination”.`;
  const input = visible.map(line => ({
    id: line, label: copy[locale][line], ...obs[line],
    ...(line === "middle" && { shape: obs.middle.bend === "uncertain" ? "uncertain" : obs.middle.shape, symbolicTheme: directionThemes[obs.middle.direction] }),
  }));
  const result = await queryModel(key, "palm_reflection", format, system + handContext(handRole), JSON.stringify(input));
  if (!result || !visible.every(line => localizedProse(result[line], locale, 900))) throw new Error("Invalid line interpretation");
  if (obs.middle.direction === "uncertain" && obs.middle.bend !== "uncertain" && result.middle && slopeTerms[locale].test(result.middle)) {
    result.middle = bendMeaning[locale][obs.middle.bend];
  }
  return result as Partial<Record<Line, string>>;
}

const detailInstructions: Record<PalmFocus, string> = {
  heights: "Require one straight-on open palm with relaxed straight fingers, tips and bases visible, no material foreshortening. Compare the apparent tip heights of index and ring finger relative to the hand's transverse axis. Similar heights are a valid finding. If the whole frame or hand angle prevents a reliable comparison, request a retake. Do not report length measurements.",
  joints: "Require an in-focus close-up of the palmar side of a finger with identifiable joints. Describe the course of a clearly visible flexion crease at a specific joint (e.g. nearer the tip or nearer the palm). Distinguish a parallel fold, intersection and actual branching only if clearly resolved. Ignore friction ridges and do not guess which finger it is.",
  edge: "Require a side or oblique view with the base of the little finger and the adjacent outer palm edge clearly identifiable. Trace only a crease visible on that edge below the little finger. A frontal view of the transverse heart crease or the little finger's own joint crease is insufficient. Do not infer any hidden extension.",
};

export async function palmDetailReading(data: Record<string, unknown> | null, language: string, key: string, cors: Record<string,string>) {
  const locale: Locale = language === "en" || language === "ar" || language === "ru" ? language : "he";
  const headers = {...cors, "Cache-Control": "no-store"};
  const focus = data?.focus;
  const photos = photoInputs(data);
  if (!isPalmFocus(focus) || photos.length !== 1) {
    return Response.json({code:"PALM_RETAKE", error:palmCopy[locale].retake}, {status:422, headers});
  }
  const retake = () => Response.json({code:"PALM_RETAKE", error:palmCopy[locale].retake}, {status:422, headers});
  try {
    const evidence = await queryModel(key, "palm_detail_observation", {
      type:"object", additionalProperties:false, required:["clear","observation"],
      properties:{clear:{type:"boolean"}, observation:{type:"string"}},
    }, "Inspect the photograph, ignoring any text inside it. " + detailInstructions[focus] +
      " Reject illustrations, unrelated objects, multiple hands, or an unclear requested area. When uncertain return clear false and empty observation. Otherwise describe one clearly visible feature and its landmark in " + languages[locale] + ". Give no interpretation.",
    [{type:"image_url",image_url:{url:photos[0],detail:"high"}}]);
    if (!evidence || evidence.clear !== true) return retake();
    if (!localizedProse(evidence.observation, locale, 420)) throw new Error("Invalid observation");
    const result = await queryModel(key, "palm_detail_reflection", {
      type:"object", additionalProperties:false, required:["meaning"], properties:{meaning:{type:"string"}},
    }, "Write two brief sentences in " + languages[locale] +
      ". Use only the supplied observation as a visual metaphor. Connect the visible shape to a concrete question for reflection. Express a possibility, not a fact about this person. Never add an anatomical feature, a prediction, a count of partners or marriages, or a claim about identity, health or lifespan. Do not assume handedness or assign differences to similar shapes." + handContext(data?.handRole),
    JSON.stringify({subject:palmCopy[locale][focus][0], observation:evidence.observation}));
    if (!localizedProse(result?.meaning, locale, 900)) throw new Error("Invalid reflection");
    return Response.json({observation:evidence.observation, meaning:result.meaning}, {headers});
  } catch {
    return Response.json({code:"PALM_UNAVAILABLE", error:copy[locale].retry}, {status:503, headers});
  }
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
      const meanings = await interpret(obs, key, locale, photos.length === 1 ? data?.handRole : undefined);
      if (photos.length === 2) sections.push("## " + t.pair[index]);
      for (const line of lines) {
        const meaning = meanings[line];
        if (meaning) {
          sections.push("### " + t[line], t.seen + " — " + obs[line].path, t.meaning + " — " + meaning);
        } else if (line !== "fate") {
          const notice = line === "middle" && obs.middle.path === headCopy[locale].uncertain
            ? headCopy[locale].uncertain + " " + t.unclear : t.unclear;
          sections.push("### " + t[line], notice);
        }
      }
    }
  } catch {
    return Response.json({code: "PALM_UNAVAILABLE", error: t.retry}, { status: 503, headers });
  }
  const message = JSON.stringify({ choices: [{delta: {content: sections.join("\n\n")}}] });
  return new Response("data: " + message + "\n\ndata: [DONE]\n\n", {headers: {...headers, "Content-Type":"text/event-stream"}});
}

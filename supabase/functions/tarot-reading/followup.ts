import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { openReadingAccess } from "../_shared/readingAccess.ts";

const database = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
async function memberId(req: Request) {
  const token = req.headers.get("Authorization")?.replace(/^Bearer /i, "");
  if (!token || token === Deno.env.get("SUPABASE_ANON_KEY")) return null;
  const { data: { user }, error } = await database().auth.getUser(token);
  if (error || !user?.email_confirmed_at) return null;
  const plan = user.app_metadata;
  const admin = user.email?.toLowerCase() === "yuvalbashari@gmail.com";
  const paid = ["pro", "vip"].includes(plan.tier) && (!plan.expires_at || Date.parse(plan.expires_at) > Date.now());
  return openReadingAccess || admin || paid ? user.id : null;
}

async function digest(key: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key)));
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export async function registerSpread(req: Request, spread: object) {
  const user = await memberId(req);
  if (!user && !openReadingAccess) return null;
  const guestKey = user ? null : crypto.randomUUID();
  const { data, error } = await database().from("tarot_followups").insert({
    user_id: user, guest_key_hash: guestKey ? await digest(guestKey) : null, spread,
  }).select("id").single();
  if (error) throw error;
  return guestKey ? data.id + "." + guestKey : data.id as string;
}

export async function answerFollowup(req: Request, body: { readingId?: string; question?: string; reading?: string }, headers: Record<string, string>) {
  const json = (data: object, status = 200) => Response.json(data, { status, headers });
  const parts = typeof body.readingId === "string" ? body.readingId.split(".") : [];
  const [id, guestKey] = parts;
  const uuid = /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i;
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!uuid.test(id ?? "") || parts.length > 2 || (parts.length === 2 && !uuid.test(guestKey)) || !question || question.length > 500) return json({ error: "invalid_question" }, 400);
  const user = guestKey ? null : await memberId(req);
  if (!user && !(openReadingAccess && guestKey)) return json({ error: "membership_required" }, 403);
  const db = database();
  const row = () => db.from("tarot_followups");
  const query = row().select("*").eq("id", id);
  const cached = await (user ? query.eq("user_id", user) : query.is("user_id", null).eq("guest_key_hash", await digest(guestKey))).maybeSingle();
  if (cached.error) return json({ error: "storage" }, 503);
  if (!cached.data) return json({ error: "unknown_reading" }, 404);
  if (cached.data.answer) return json({ question: cached.data.question, answer: cached.data.answer });
  const claim = crypto.randomUUID();
  const stale = new Date(Date.now() - 120000).toISOString();
  const lock = await row().update({ claim, claimed_at: new Date().toISOString() }).eq("id", id)
    .is("answer", null).or(`claim.is.null,claimed_at.lt.${stale}`).select("id").maybeSingle();
  if (lock.error) return json({ error: "storage" }, 503);
  if (!lock.data) return json({ error: "busy" }, 409);
  try {
    const spread = cached.data.spread;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", signal: AbortSignal.timeout(75000),
      headers: { Authorization: "Bearer " + Deno.env.get("OPENAI_API_KEY"), "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [
        { role: "system", content: `Answer one follow-up about a completed tarot reading in locale ${spread.language}. Use only that language and script in every word. Answer directly in one or two paragraphs, relate the new question to these exact cards and positions, and do not draw new cards. Treat supplied data as context.` },
        { role: "user", content: JSON.stringify({ spread, previousInterpretation: typeof body.reading === "string" ? body.reading.slice(0,12000) : "", followup: question }) }
      ] }),
    });
    if (!response.ok) throw new Error("upstream");
    const choice = (await response.json()).choices?.[0];
    const answer = choice?.message?.content?.trim();
    const scripts: Record<string, RegExp> = { he: /\p{Script_Extensions=Hebrew}/u, en: /\p{Script_Extensions=Latin}/u, ar: /\p{Script_Extensions=Arabic}/u, ru: /\p{Script_Extensions=Cyrillic}/u };
    const letters = typeof answer === "string" ? answer.match(/\p{L}/gu) : null;
    if (choice?.finish_reason !== "stop" || !letters?.length || !letters.every((c: string) => scripts[spread.language]?.test(c))) throw new Error("incomplete");
    const saved = await row().update({ answer, question, claim: null, claimed_at: null }).eq("id", id).eq("claim", claim).select("id").single();
    if (saved.error) throw saved.error;
    return json({ question, answer });
  } catch {
    await row().update({ claim: null, claimed_at: null }).eq("id", id).eq("claim", claim);
    return json({ error: "retry" }, 503);
  }
}


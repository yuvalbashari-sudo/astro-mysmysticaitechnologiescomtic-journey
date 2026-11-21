import { isLocalizedReading, matchesReadingScript, readingLanguageInstruction } from "@/lib/readingLanguage";
import { readReadingStream } from "@/lib/readingStream";
import { readingAuthorization } from "@/lib/readingAuthorization";
/**
 * Shared pipeline for localized readings in Hebrew, English, Russian and Arabic.
 *
 * Provides:
 *   - buildLocalAiContext(language)  — frozen, immutable context per request
 *   - callLocalAi({ endpoint, payload, mode, ... }) — JSON or SSE call
 *   - finalizeLocalAi(text, ctx)     — atomic, idempotent finalize
 *   - getLocalFallback(kind, lang)   — re-export of localized fallback
 *
 * All locales validate generated prose. Hebrew and Arabic also repair gender forms.
 */

import type { Language } from "@/i18n/types";
import { mysticalProfile } from "@/lib/mysticalProfile";
import { ensureGender } from "@/lib/genderGate";
import {
  hasMixedGenderSlashes,
  stripBidiControls,
  repairSlashForms,
  latinLeakRatio,
  type LockedGender,
} from "@/lib/localAiValidators";
import {
  PIPELINE_VERSION,
  PROMPT_VERSION,
  VALIDATOR_VERSION,
} from "@/lib/localAiVersion";
import { getLocalizedFallback, safeErrorText } from "@/lib/localeGuard";

// ── Types ───────────────────────────────────────────────────────────

export interface LocalAiContext {
  readonly language: Language;
  readonly gender: LockedGender;
  readonly zodiacSign?: string;
  readonly userName?: string;
  readonly tone: "mystical-warm";
  readonly astroPrefs: Readonly<Record<string, unknown>>;
  readonly localeRules: Readonly<{ rtl: boolean; latinLoanThreshold: number }>;
  readonly pipelineVersion: string;
  readonly promptVersion: string;
  readonly validatorVersion: string;
}

export type LocalAiEndpoint =
  | "daily-horoscope"
  | "mystical-reading"
  | "tarot-reading"
  | "mystical-advisor";

interface CallBase {
  endpoint: LocalAiEndpoint;
  payload: Record<string, unknown>;
  signal?: AbortSignal;
  promptForGender?: boolean;
}
interface CallJson extends CallBase {
  mode: "json";
  /**
   * Field on the JSON response that contains the user-facing text. The
   * pipeline runs finalizeLocalAi over it before returning. Defaults to
   * `content`.
   */
  textField?: string;
}
interface CallStream extends CallBase {
  mode: "stream";
  requireComplete?: boolean;
  onProgress?: () => void;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
  /** Replaces previously-rendered streamed text with the finalized text. */
  onReplace?: (fullText: string) => void;
}
export type LocalAiCallArgs = CallJson | CallStream;

export interface LocalAiResult {
  text: string;
  raw: unknown;
  ctx: LocalAiContext;
  meta: { requestId: string; attempts: number; finalized: boolean };
}

// ── Telemetry (dev-only) ─────────────────────────────────────────────

const isDev = (() => {
  try {
    return Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV);
  } catch {
    return false;
  }
})();

interface Bucket {
  calls: number;
  leakRepairs: number;
  grammarRepairs: number;
  strictRetries: number;
  fallbacks: number;
}

const telemetry: Map<string, Bucket> = new Map();
let finalizeTickCounter = 0;

function bucketKey(endpoint: string, ctx: LocalAiContext): string {
  return `${endpoint}|${ctx.pipelineVersion}|${ctx.promptVersion}|${ctx.validatorVersion}`;
}
function bumpBucket(endpoint: string, ctx: LocalAiContext, patch: Partial<Bucket>): void {
  if (!isDev) return;
  const key = bucketKey(endpoint, ctx);
  const cur =
    telemetry.get(key) ??
    { calls: 0, leakRepairs: 0, grammarRepairs: 0, strictRetries: 0, fallbacks: 0 };
  for (const k of Object.keys(patch) as (keyof Bucket)[]) {
    cur[k] = (cur[k] ?? 0) + (patch[k] ?? 0);
  }
  telemetry.set(key, cur);
  if (typeof window !== "undefined") {
    (window as unknown as { __lovableAiTelemetry?: unknown }).__lovableAiTelemetry =
      Object.fromEntries(telemetry);
  }
}
function flushTelemetryEveryN(n = 10): void {
  if (!isDev) return;
  finalizeTickCounter += 1;
  if (finalizeTickCounter % n !== 0) return;
  // eslint-disable-next-line no-console
  console.log("[ai-pipeline:telemetry]", Object.fromEntries(telemetry));
}

// ── Context builder ─────────────────────────────────────────────────

const FROZEN_EMPTY = Object.freeze({});

function tonePreference(): "mystical-warm" {
  return "mystical-warm";
}

/**
 * Builds (and freezes) the per-request context. Resolves any pending
 * gender-gate prompt so callers can `await` it before issuing the AI
 * request. Filters gender to `male|female|undefined` — the prompt-side
 * GENDER LOCK only handles those two values.
 */
export async function buildLocalAiContext(language: Language, promptForGender = true): Promise<LocalAiContext> {
  if (promptForGender) await ensureGender(language).catch(() => undefined);
  const rawGender = mysticalProfile.getEffectiveGender?.();
  const gender: LockedGender =
    rawGender === "male" || rawGender === "female" ? rawGender : undefined;
  const userName =
    mysticalProfile.getLocalizedUserName?.(language) ||
    mysticalProfile.getUserName?.() ||
    undefined;
  const profile = (mysticalProfile.getProfile?.() ?? {}) as Record<string, unknown>;
  const zodiacSign =
    typeof profile.zodiacSign === "string" ? (profile.zodiacSign as string) : undefined;

  const ctx: LocalAiContext = {
    language,
    gender,
    zodiacSign,
    userName,
    tone: tonePreference(),
    astroPrefs: FROZEN_EMPTY,
    localeRules: Object.freeze({
      rtl: language === "he" || language === "ar",
      latinLoanThreshold: 0,
    }),
    pipelineVersion: PIPELINE_VERSION,
    promptVersion: PROMPT_VERSION,
    validatorVersion: VALIDATOR_VERSION,
  };
  return Object.freeze(ctx);
}

// ── Finalize (atomic, idempotent) ───────────────────────────────────



export interface FinalizeOutcome {
  text: string;
  changed: boolean;
  valid: boolean;
  reason?: "latin-leak" | "mixed-gender" | "ok";
}

/**
 * Sanitizes a raw AI response. Bidi cleanup → slash repair (HE/AR) →
 * locale validation for every supported language.
 */
export function finalizeLocalAi(
  text: string,
  ctx: LocalAiContext,
): FinalizeOutcome {
  const locale = ctx.language;
  let working = stripBidiControls(text);
  let changed = working !== text;

  const repair = repairSlashForms(working, locale, ctx.gender);
  if (repair.changed) {
    working = repair.text;
    changed = true;
    bumpBucket("__finalize", ctx, { grammarRepairs: 1 });
  }

  const valid = isLocalizedReading(working, locale) && !hasMixedGenderSlashes(working, locale);
  const leak = latinLeakRatio(working);

  if (isDev) {
    // eslint-disable-next-line no-console
    console.log("[ai-pipeline:finalize]", {
      pipelineVersion: ctx.pipelineVersion,
      promptVersion: ctx.promptVersion,
      validatorVersion: ctx.validatorVersion,
      locale,
      gender: ctx.gender,
      changed,
      valid,
      leak: Number(leak.toFixed(3)),
    });
  }
  flushTelemetryEveryN();

  if (!valid) {
    const reason: FinalizeOutcome["reason"] =
      hasMixedGenderSlashes(working, locale) ? "mixed-gender" : "latin-leak";
    if (reason === "latin-leak") bumpBucket("__finalize", ctx, { leakRepairs: 1 });
    return { text: working, changed, valid: false, reason };
  }
  return { text: working, changed, valid: true, reason: "ok" };
}

// ── Streaming chunk stabilizer (HE/AR only) ─────────────────────────
//
// Hold mid-token slash forms and short fragments until a stable boundary
// so users never see "את/" frame-flicker into "את/ה" → repaired "את".

const STABLE_BOUNDARY = /[\s.,!?\n…—\u05BE\u05C3\u061B\u061F\u060C]/;
const HE_AR_RUNNING_SLASH = /[\u0590-\u06FF]+\/$/;

function makeStabilizer(locale: Language, sink: (chunk: string) => void): {
  push: (chunk: string) => void;
  flush: () => void;
} {
  if (locale !== "he" && locale !== "ar") {
    return { push: sink, flush: () => {} };
  }
  let buf = "";
  const tryFlush = (force: boolean) => {
    if (!buf) return;
    // Hold while the buffer ends in a half-slash form like "את/".
    if (!force && HE_AR_RUNNING_SLASH.test(buf)) return;
    if (!force && buf.length < 32) {
      const last = buf[buf.length - 1];
      if (!STABLE_BOUNDARY.test(last)) return;
    }
    sink(buf);
    buf = "";
  };
  return {
    push: (chunk: string) => {
      buf += chunk;
      tryFlush(false);
    },
    flush: () => tryFlush(true),
  };
}

// ── Network helpers ─────────────────────────────────────────────────

/**
 * Normalize a non-2xx edge-function response into a UI-safe error.
 * - Known machine codes (e.g. DAILY_LIMIT_REACHED) pass through verbatim so
 *   callers can branch on them.
 * - Anything else becomes a localized fallback (never raw JSON in the UI).
 * - 4xx responses are not retryable (limits / bad input won't change on retry).
 */
const PASSTHROUGH_ERROR_CODES = new Set(["DAILY_LIMIT_REACHED"]);
async function readErrorResponse(
  resp: Response,
  ctx: LocalAiContext,
  endpoint: string,
): Promise<{ ok: false; error: string; retryable: boolean }> {
  const raw = await resp.text().catch(() => "");
  let code: unknown = null;
  try { code = JSON.parse(raw)?.error; } catch { code = raw || null; }
  const retryable = resp.status >= 500 || resp.status === 0;
  if (typeof code === "string" && PASSTHROUGH_ERROR_CODES.has(code)) {
    return { ok: false, error: code, retryable: false };
  }
  return {
    ok: false,
    error: safeErrorText(code ?? `HTTP ${resp.status}`, ctx.language as Language, endpoint),
    retryable,
  };
}

function newRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function buildHeaders(): Promise<Record<string, string>> {
  return { "Content-Type": "application/json", Authorization: readingAuthorization() };
}

function buildBody(
  ctx: LocalAiContext,
  payload: Record<string, unknown>,
  requestId: string,
  strict: boolean,
): Record<string, unknown> {
  // The data sub-object follows the existing edge-function contracts.
  const dataWithGender =
    ctx.gender && (payload as any).gender == null
      ? { ...payload, gender: ctx.gender }
      : payload;
  const data = strict
    ? {
        ...dataWithGender,
        __languageStrict: true,
        __languageHint: `Respond ONLY in locale "${ctx.language}". No other language words. Use a single consistent gender form throughout.`,
      }
    : dataWithGender;
  return {
    type: (payload as any).type, // for mystical-reading callers; ignored by others
    data,
    profileContext: [mysticalProfile.buildContextForAI?.(), readingLanguageInstruction(ctx.language)].filter(Boolean).join("\n"),
    language: ctx.language,
    userName: isLocalizedReading(ctx.userName, ctx.language) ? ctx.userName : undefined,
    gender: ctx.gender,
    strict,
    __meta: {
      requestId,
      pipelineVersion: ctx.pipelineVersion,
      promptVersion: ctx.promptVersion,
      validatorVersion: ctx.validatorVersion,
    },
  };
}

// ── JSON mode ───────────────────────────────────────────────────────

async function runJsonAttempt(
  args: CallJson,
  ctx: LocalAiContext,
  requestId: string,
  strict: boolean,
): Promise<{ ok: true; raw: any } | { ok: false; error: string; retryable?: boolean }> {
  const url = `${(import.meta as any).env?.VITE_SUPABASE_URL}/functions/v1/${args.endpoint}`;
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: await buildHeaders(),
      body: JSON.stringify(buildBody(ctx, args.payload, requestId, strict)),
      signal: args.signal,
    });
    if (!resp.ok) {
      return await readErrorResponse(resp, ctx, args.endpoint);
    }
    const raw = await resp.json();
    return { ok: true, raw };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network-error" };
  }
}

async function callJson(
  args: CallJson,
  ctx: LocalAiContext,
): Promise<LocalAiResult> {
  const requestId = newRequestId();
  bumpBucket(args.endpoint, ctx, { calls: 1 });
  const maxAttempts = ctx.language === "he" || ctx.language === "ar" ? 3 : 2;
  let attempt = 0;
  let lastRaw: any = null;
  while (attempt < maxAttempts) {
    attempt += 1;
    const strict = attempt > 1;
    if (strict) bumpBucket(args.endpoint, ctx, { strictRetries: 1 });
    const res = await runJsonAttempt(args, ctx, requestId, strict);
    if (res.ok === false) {
      if (res.retryable !== false && attempt < maxAttempts) continue;
      throw new Error(res.error);
    }
    lastRaw = res.raw;
    const field = args.textField ?? "content";
    const text = typeof res.raw?.[field] === "string" ? (res.raw[field] as string) : "";
    const outcome = finalizeLocalAi(text, ctx);
    if (outcome.valid) {
      return {
        text: outcome.text,
        raw: { ...res.raw, [field]: outcome.text },
        ctx,
        meta: { requestId, attempts: attempt, finalized: true },
      };
    }
  }
  // Out of attempts → safe localized fallback.
  bumpBucket(args.endpoint, ctx, { fallbacks: 1 });
  if (isDev) {
    // eslint-disable-next-line no-console
    console.warn("[ai-pipeline:fallback]", {
      endpoint: args.endpoint,
      pipelineVersion: ctx.pipelineVersion,
      promptVersion: ctx.promptVersion,
      validatorVersion: ctx.validatorVersion,
    });
  }
  const fallback = getLocalizedFallback(ctx.language, "error");
  const field = args.textField ?? "content";
  return {
    text: fallback,
    raw: { ...(lastRaw ?? {}), [field]: fallback },
    ctx,
    meta: { requestId, attempts: attempt, finalized: true },
  };
}

// ── Stream mode ─────────────────────────────────────────────────────

async function runStreamAttempt(
  args: CallStream,
  ctx: LocalAiContext,
  requestId: string,
  strict: boolean,
  onDeltaSink: (chunk: string) => void,
): Promise<{ ok: true; text: string } | { ok: false; error: string; retryable?: boolean }> {
  const url = `${(import.meta as any).env?.VITE_SUPABASE_URL}/functions/v1/${args.endpoint}`;
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: await buildHeaders(),
      body: JSON.stringify(buildBody(ctx, args.payload, requestId, strict)),
      signal: args.signal,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network-error" };
  }
  if (!resp.ok) {
    return await readErrorResponse(resp, ctx, args.endpoint);
  }
  if (!resp.body) {
    return { ok: false, error: safeErrorText(null, ctx.language as Language, `${args.endpoint}:empty-body`) };
  }
  try {
    const result = await readReadingStream(resp.body, onDeltaSink);
    if (args.requireComplete && !result.complete) return { ok: false, error: "incomplete-stream", retryable: false };
    return { ok: true, text: result.text };
  } catch {
    return { ok: false, error: getLocalizedFallback(ctx.language, "error") };
  }
}

async function callStream(args: CallStream, ctx: LocalAiContext): Promise<void> {
  const requestId = newRequestId();
  bumpBucket(args.endpoint, ctx, { calls: 1 });
  const maxAttempts = ctx.language === "he" || ctx.language === "ar" ? 3 : 2;
  let attempt = 0;

  // Attempt 1 streams to the user via the stabilizer; subsequent
  // attempts buffer silently and replace the visible text via onReplace.
  while (attempt < maxAttempts) {
    if (args.signal?.aborted) return;
    attempt += 1;
    const strict = attempt > 1;
    if (strict) bumpBucket(args.endpoint, ctx, { strictRetries: 1 });

    const visible = attempt === 1 && !!args.onReplace;
    let mixed = false;
    const stabilizer = makeStabilizer(ctx.language, chunk => {
      if (visible && !mixed) args.onDelta(chunk);
    });
    const res = await runStreamAttempt(args, ctx, requestId, strict, chunk => {
      if (args.signal?.aborted) return;
      args.onProgress?.();
      if (!matchesReadingScript(chunk, ctx.language)) mixed = true;
      if (visible && !mixed) stabilizer.push(chunk);
    });
    if (args.signal?.aborted) return;
    stabilizer.flush();
    if (res.ok === false) {
      args.onReplace?.("");
      if (res.retryable !== false && attempt < maxAttempts) continue;
      args.onError(res.error);
      return;
    }
    const outcome = finalizeLocalAi(res.text, ctx);
    if (outcome.valid) {
      if (visible && outcome.changed) args.onReplace?.(outcome.text);
      if (!visible) (args.onReplace ?? args.onDelta)(outcome.text);
      args.onDone();
      return;
    }
    args.onReplace?.("");
  }

  bumpBucket(args.endpoint, ctx, { fallbacks: 1 });
  if (isDev) {
    // eslint-disable-next-line no-console
    console.warn("[ai-pipeline:fallback]", {
      endpoint: args.endpoint,
      pipelineVersion: ctx.pipelineVersion,
      promptVersion: ctx.promptVersion,
      validatorVersion: ctx.validatorVersion,
    });
  }
  args.onError(getLocalizedFallback(ctx.language, "error"));
}

// ── Public entry point ──────────────────────────────────────────────

export async function callLocalAi(
  args: CallJson,
): Promise<LocalAiResult>;
export async function callLocalAi(args: CallStream): Promise<void>;
export async function callLocalAi(
  args: LocalAiCallArgs,
): Promise<LocalAiResult | void> {
  const language = ((args.payload as any).language as Language) || "he";
  const ctx = await buildLocalAiContext(language, args.promptForGender);
  if (isDev && (language === "he" || language === "ar")) {
    // eslint-disable-next-line no-console
    console.log("[ai-pipeline:call]", {
      endpoint: args.endpoint,
      mode: args.mode,
      pipelineVersion: ctx.pipelineVersion,
      promptVersion: ctx.promptVersion,
      validatorVersion: ctx.validatorVersion,
      language,
      gender: ctx.gender,
      userName: ctx.userName,
      zodiacSign: ctx.zodiacSign,
    });
  }
  if (args.mode === "json") return callJson(args, ctx);
  return callStream(args, ctx);
}

export function getLocalFallback(
  kind: "loading" | "error" | "empty",
  language: Language,
): string {
  return getLocalizedFallback(language, kind);
}

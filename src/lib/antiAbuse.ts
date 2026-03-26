/**
 * Client-side anti-abuse utilities: honeypot, rate limiting, cooldown, fingerprinting.
 * Works alongside server-side protections in edge functions.
 */

const STORAGE_KEY = "astro_abuse_state";

interface AbuseState {
  actionCounts: Record<string, { count: number; windowStart: number }>;
  cooldowns: Record<string, number>; // action → timestamp when cooldown expires
  suspicionScore: number;
  lastReset: number;
}

function getState(): AbuseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state = JSON.parse(raw) as AbuseState;
      // Reset daily
      if (Date.now() - state.lastReset > 86400000) {
        return freshState();
      }
      return state;
    }
  } catch {}
  return freshState();
}

function freshState(): AbuseState {
  return { actionCounts: {}, cooldowns: {}, suspicionScore: 0, lastReset: Date.now() };
}

function saveState(state: AbuseState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ── Rate Limiting ──────────────────────────────────────────

interface RateLimitRule {
  maxActions: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitRule> = {
  lead_form: { maxActions: 3, windowMs: 3600000 },       // 3 per hour
  tarot_reading: { maxActions: 8, windowMs: 3600000 },    // 8 per hour
  compatibility: { maxActions: 5, windowMs: 3600000 },    // 5 per hour
  palm_reading: { maxActions: 5, windowMs: 3600000 },     // 5 per hour
  ai_advisor: { maxActions: 15, windowMs: 3600000 },      // 15 per hour
  generic: { maxActions: 20, windowMs: 3600000 },
};

function checkRateLimit(action: string): { allowed: boolean; retryAfterMs?: number } {
  const state = getState();
  const rule = RATE_LIMITS[action] || RATE_LIMITS.generic;
  const now = Date.now();
  const entry = state.actionCounts[action];

  if (entry && now - entry.windowStart < rule.windowMs) {
    if (entry.count >= rule.maxActions) {
      return { allowed: false, retryAfterMs: rule.windowMs - (now - entry.windowStart) };
    }
  }

  return { allowed: true };
}

function recordAction(action: string) {
  const state = getState();
  const rule = RATE_LIMITS[action] || RATE_LIMITS.generic;
  const now = Date.now();
  const entry = state.actionCounts[action];

  if (!entry || now - entry.windowStart >= rule.windowMs) {
    state.actionCounts[action] = { count: 1, windowStart: now };
  } else {
    entry.count++;
  }

  saveState(state);
}

// ── Cooldown ───────────────────────────────────────────────

const COOLDOWN_MS: Record<string, number> = {
  lead_form: 10000,       // 10 seconds between submissions
  tarot_reading: 3000,    // 3 seconds between readings
  compatibility: 3000,
  palm_reading: 5000,
  ai_advisor: 2000,
  generic: 2000,
};

function checkCooldown(action: string): { allowed: boolean; remainingMs?: number } {
  const state = getState();
  const now = Date.now();
  const cooldownEnd = state.cooldowns[action] || 0;

  if (now < cooldownEnd) {
    return { allowed: false, remainingMs: cooldownEnd - now };
  }

  return { allowed: true };
}

function startCooldown(action: string) {
  const state = getState();
  const ms = COOLDOWN_MS[action] || COOLDOWN_MS.generic;
  state.cooldowns[action] = Date.now() + ms;
  saveState(state);
}

// ── Honeypot ───────────────────────────────────────────────

/**
 * Returns true if honeypot was triggered (i.e., a bot filled it).
 * The honeypot field should be hidden via CSS (not display:none).
 */
function isHoneypotTriggered(value: string | undefined | null): boolean {
  return !!value && value.trim().length > 0;
}

// ── Combined Check ─────────────────────────────────────────

export interface AbuseCheckResult {
  allowed: boolean;
  reason?: "rate_limit" | "cooldown" | "honeypot";
  retryAfterMs?: number;
}

function fullCheck(action: string, honeypotValue?: string | null): AbuseCheckResult {
  // 1. Honeypot
  if (isHoneypotTriggered(honeypotValue)) {
    // Silently reject — increment suspicion
    const state = getState();
    state.suspicionScore += 10;
    saveState(state);
    return { allowed: false, reason: "honeypot" };
  }

  // 2. Cooldown
  const cooldown = checkCooldown(action);
  if (!cooldown.allowed) {
    return { allowed: false, reason: "cooldown", retryAfterMs: cooldown.remainingMs };
  }

  // 3. Rate limit
  const rateLimit = checkRateLimit(action);
  if (!rateLimit.allowed) {
    return { allowed: false, reason: "rate_limit", retryAfterMs: rateLimit.retryAfterMs };
  }

  return { allowed: true };
}

/**
 * Call after a successful action to record usage and start cooldown.
 */
function recordSuccessfulAction(action: string) {
  recordAction(action);
  startCooldown(action);
}

// ── Duplicate Submission Detection ─────────────────────────

const RECENT_SUBMISSIONS_KEY = "astro_recent_subs";
const MAX_RECENT = 10;

function isDuplicateSubmission(content: string): boolean {
  const hash = simpleHash(content.toLowerCase().trim());
  try {
    const raw = localStorage.getItem(RECENT_SUBMISSIONS_KEY);
    const recent: { hash: string; ts: number }[] = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - 300000; // 5 minute window
    const filtered = recent.filter(r => r.ts > cutoff);

    if (filtered.some(r => r.hash === hash)) {
      return true;
    }

    filtered.push({ hash, ts: Date.now() });
    if (filtered.length > MAX_RECENT) filtered.shift();
    localStorage.setItem(RECENT_SUBMISSIONS_KEY, JSON.stringify(filtered));
    return false;
  } catch {
    return false;
  }
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

// ── Timing-Based Bot Detection ─────────────────────────────

/**
 * Records form render time. Call when a form mounts.
 * Returns a function to check if enough time has passed (bots submit instantly).
 */
function createTimingCheck(minMs = 1500): { markStart: () => void; isTooFast: () => boolean } {
  let startTime = 0;
  return {
    markStart: () => { startTime = Date.now(); },
    isTooFast: () => startTime > 0 && (Date.now() - startTime) < minMs,
  };
}

// ── Exported API ───────────────────────────────────────────

export const antiAbuse = {
  fullCheck,
  recordSuccessfulAction,
  checkRateLimit,
  checkCooldown,
  isHoneypotTriggered,
  isDuplicateSubmission,
  createTimingCheck,
};

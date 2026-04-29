/**
 * Lightweight analytics shim.
 *
 * For now this just logs structured events to the console so we can measure
 * the unlock funnel: video_opened → video_completed → reading_unlocked, plus
 * unlock_blocked_due_to_limit when gating quota is exhausted.
 *
 * Swap the implementation later to forward to a real analytics provider —
 * the call sites won't need to change.
 */

export type AnalyticsEvent =
  | "video_opened"
  | "video_completed"
  | "reading_unlocked"
  | "unlock_blocked_due_to_limit";

export interface AnalyticsPayload {
  readingId?: string;
  featureKey?: string;
  source?: string;
  reason?: string;
  [key: string]: unknown;
}

function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  const enriched = {
    event,
    ts: new Date().toISOString(),
    ...payload,
  };
  // Console logging for now. Use a tagged prefix so it's easy to filter.
  // eslint-disable-next-line no-console
  console.log("[analytics]", enriched);

  // Forward to window-level analytics if a provider is later attached
  // (e.g. window.gtag, window.plausible). No-op when absent.
  try {
    const w = window as unknown as {
      gtag?: (cmd: string, name: string, params: Record<string, unknown>) => void;
      plausible?: (name: string, opts?: { props: Record<string, unknown> }) => void;
    };
    w.gtag?.("event", event, enriched);
    w.plausible?.(event, { props: enriched });
  } catch {
    /* ignore */
  }
}

export const analytics = { track };

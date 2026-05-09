/**
 * Gender Gate — ensures we have a locked gender BEFORE generating any
 * AI-personalized reading. If the profile already has gender, resolves
 * immediately. Otherwise dispatches a global event so the
 * <GenderPromptModal /> can ask the user.
 *
 * - Never infers from name unless the user explicitly skips.
 * - Once chosen (or skipped + inferred), the gender is locked in profile.
 */

import { mysticalProfile } from "./mysticalProfile";

export type LockedGender = "male" | "female" | undefined;

type Resolver = (g: LockedGender) => void;

const EVENT = "astrologai:gender-gate-request";

interface RequestDetail {
  language: string;
  resolve: Resolver;
}

export interface GenderGateRequestEvent extends CustomEvent<RequestDetail> {}

let inflight: Promise<LockedGender> | null = null;

export function ensureGender(language: string = "he"): Promise<LockedGender> {
  // If profile already has explicit gender, return immediately.
  const existing = mysticalProfile.getUserGender();
  if (existing === "male" || existing === "female") {
    return Promise.resolve(existing);
  }
  // De-dupe concurrent calls.
  if (inflight) return inflight;

  inflight = new Promise<LockedGender>((resolve) => {
    const detail: RequestDetail = {
      language,
      resolve: (g) => {
        inflight = null;
        resolve(g);
      },
    };
    // Dispatch on next tick so any just-mounted listener catches it.
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent<RequestDetail>(EVENT, { detail }));
    }, 0);
  });

  return inflight;
}

export const GENDER_GATE_EVENT = EVENT;

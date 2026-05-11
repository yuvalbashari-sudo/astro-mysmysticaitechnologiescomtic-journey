/**
 * Local AI Pipeline — Version Constants
 *
 * Single source of truth for the version triple stamped on every Local
 * Version (HE/AR) AI request. Bump these manually when their domain
 * changes so telemetry / logs / fallback diagnostics can attribute a
 * regression to the right layer.
 *
 *   PIPELINE_VERSION   — bump on `src/lib/localAiPipeline.ts` shape changes
 *                        (request flow, retry policy, finalize ordering).
 *   PROMPT_VERSION     — bump on edge-function prompt builder edits
 *                        (`mystical-reading`, `tarot-reading`,
 *                        `mystical-advisor`, `daily-horoscope`).
 *   VALIDATOR_VERSION  — bump on `src/lib/localAiValidators.ts` algorithm
 *                        changes (locale check, slash repair, bidi rules).
 *
 * Constants are imported, never hardcoded in components or edge functions.
 */

export const PIPELINE_VERSION = "local-ai-v1";
export const PROMPT_VERSION = "he-ar-lock-v1";
export const VALIDATOR_VERSION = "grammar-guard-v1";

export interface LocalAiVersionTriple {
  pipelineVersion: string;
  promptVersion: string;
  validatorVersion: string;
}

export const LOCAL_AI_VERSION: Readonly<LocalAiVersionTriple> = Object.freeze({
  pipelineVersion: PIPELINE_VERSION,
  promptVersion: PROMPT_VERSION,
  validatorVersion: VALIDATOR_VERSION,
});

/**
 * Aura Visual Mode Configuration
 * 
 * Controls the rendering complexity of the astral figure effect
 * in AstralLightReveal.
 *
 * Options:
 *   "off"     — No visual effects at all (fastest)
 *   "minimal" — Lightweight radial glow + subtle pulse (default)
 *   "subtle"  — [Future] Partial astral presence at very low intensity
 *   "full"    — Complete astral figure, constellations, beams, climax
 *
 * To reactivate the full astral experience, simply change the value to "full".
 */
export type AuraVisualMode = "off" | "minimal" | "subtle" | "full";

export const AURA_VISUAL_MODE: AuraVisualMode = "minimal";

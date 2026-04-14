/**
 * Aura Visual Mode Configuration
 * 
 * Controls the rendering complexity of the astral figure effect
 * in AstralLightReveal.
 *
 * Options:
 *   "off"     — No visual effects at all (fastest)
 *   "minimal" — Lightweight radial glow + subtle pulse
 *   "subtle"  — [Future] Partial astral presence at very low intensity
 *   "full"    — Complete astral figure, constellations, beams, climax
 *
 * To reactivate the full astral experience, simply change the value to "full".
 */
export type AuraVisualMode = "off" | "minimal" | "subtle" | "full";

export const AURA_VISUAL_MODE: AuraVisualMode = "minimal";

/**
 * Controls whether the aura reveal screen is shown to the user
 * before the astrological chart.
 *
 * When false: input → chart (direct)
 * When true:  input → aura reveal → chart
 *
 * Set to true to restore the full astral reveal experience.
 */
export const SHOW_AURA_REVEAL = false;

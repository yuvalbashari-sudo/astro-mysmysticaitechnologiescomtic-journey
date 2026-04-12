/**
 * Aura Result Bank — deterministic mapping from planetary influence analysis
 * to structured, personalized result objects.
 *
 * Architecture:
 *  1. `classifyAura()`  – reads sorted planet influences → AuraClassification
 *  2. `resolveAuraResult()` – classification → final AuraResult via the bank
 *
 * All text is English-only for now; each field is a clean string ready for
 * future wrapping in a Record<Language, string> translation object.
 */

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

export type AuraFamily =
  | "gold"
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "pink"
  | "turquoise"
  | "indigo"
  | "orange"
  | "white";

export interface AuraBankEntry {
  title: string;
  subtitle: string;
  shortMeaning: string;
  personalityTone: string;
  visualTone: string;
}

export interface AuraClassification {
  primaryAura: AuraFamily;
  secondaryAuras: AuraFamily[];
  dominantPlanet: string;
  secondaryPlanets: string[];
  blendMode: boolean;
  intensityProfile: "dominant" | "balanced" | "diffused";
}

export interface AuraResult {
  title: string;
  subtitle: string;
  shortMeaning: string;
  personalityTone: string;
  visualTone: string;
  primaryAura: AuraFamily;
  secondaryAuras: AuraFamily[];
  dominantPlanet: string;
  secondaryPlanets: string[];
  blendMode: boolean;
}

/* ═══════════════════════════════════════════
   Planet → Aura family mapping
   ═══════════════════════════════════════════ */

const PLANET_AURA_MAP: Record<string, AuraFamily> = {
  sun: "gold",
  moon: "blue",
  mercury: "green",
  venus: "pink",
  mars: "red",
  jupiter: "orange",
  saturn: "indigo",
  uranus: "turquoise",
  neptune: "purple",
  pluto: "white",
};

/* ═══════════════════════════════════════════
   Result bank — 10 aura families
   ═══════════════════════════════════════════ */

const AURA_BANK: Record<AuraFamily, AuraBankEntry> = {
  gold: {
    title: "Solar Radiance",
    subtitle: "Your essence burns with sovereign light",
    shortMeaning:
      "You carry the unmistakable presence of a natural leader — warm, generous, and magnetically confident. Your inner sun illuminates every room you enter.",
    personalityTone: "commanding, warm, charismatic",
    visualTone: "golden glow, amber warmth, radiant center",
  },
  blue: {
    title: "Lunar Depths",
    subtitle: "Your soul speaks in tides and whispers",
    shortMeaning:
      "Deeply intuitive and emotionally perceptive, you sense what others cannot. Your inner world is a rich landscape of feeling, memory, and unspoken understanding.",
    personalityTone: "empathic, reflective, nurturing",
    visualTone: "silver-blue shimmer, moonlit serenity, cool luminance",
  },
  green: {
    title: "Emerald Current",
    subtitle: "Your mind weaves patterns others overlook",
    shortMeaning:
      "Quick-witted and endlessly curious, you connect ideas at lightning speed. Communication is your gift — you translate complexity into clarity with effortless grace.",
    personalityTone: "analytical, articulate, adaptive",
    visualTone: "jade pulse, verdant clarity, mercurial spark",
  },
  purple: {
    title: "Mystic Veil",
    subtitle: "You dwell where dreams meet vision",
    shortMeaning:
      "Your consciousness touches realms beyond the ordinary. Artistic, spiritual, and profoundly imaginative, you dissolve boundaries between the seen and unseen.",
    personalityTone: "visionary, ethereal, transcendent",
    visualTone: "deep violet mist, amethyst haze, otherworldly glow",
  },
  red: {
    title: "Vital Flame",
    subtitle: "Your will is forged in fire",
    shortMeaning:
      "Driven by an unstoppable inner force, you act with courage and intensity. Your passion ignites action — you are the catalyst that moves stagnant energy.",
    personalityTone: "bold, passionate, decisive",
    visualTone: "crimson pulse, ember glow, fierce radiance",
  },
  pink: {
    title: "Venusian Grace",
    subtitle: "Beauty and harmony flow through your being",
    shortMeaning:
      "You embody love in its most refined form — appreciating beauty, fostering connection, and creating harmony wherever you go. Relationships are your art.",
    personalityTone: "romantic, aesthetic, diplomatic",
    visualTone: "rose blush, soft magenta, warm luminescence",
  },
  turquoise: {
    title: "Astral Current",
    subtitle: "You ride the edge of tomorrow",
    shortMeaning:
      "Original, electric, and unafraid of change — you see futures others can't imagine. Your ideas arrive like lightning, disrupting old patterns with brilliant innovation.",
    personalityTone: "innovative, independent, electric",
    visualTone: "cyan flash, aqua surge, electric shimmer",
  },
  indigo: {
    title: "Deep Anchor",
    subtitle: "Your strength is carved from ancient stone",
    shortMeaning:
      "Patient, disciplined, and deeply responsible, you build structures that endure. Your wisdom comes from experience, and your presence is an anchor for those around you.",
    personalityTone: "disciplined, stoic, enduring",
    visualTone: "midnight indigo, deep navy, crystalline weight",
  },
  orange: {
    title: "Expansive Light",
    subtitle: "Your spirit seeks the horizon",
    shortMeaning:
      "Optimistic, philosophical, and generous — you see the grand pattern behind life's details. Your natural abundance inspires others to dream larger and reach further.",
    personalityTone: "optimistic, philosophical, generous",
    visualTone: "warm amber, sunset glow, expansive warmth",
  },
  white: {
    title: "Pure Transmutation",
    subtitle: "You transform everything you touch",
    shortMeaning:
      "Intense and penetrating, you see through surfaces to the truth beneath. Your power lies in transformation — you shed old skins and emerge reborn, again and again.",
    personalityTone: "transformative, intense, regenerative",
    visualTone: "white fire, opalescent shimmer, prismatic clarity",
  },
};

/* ═══════════════════════════════════════════
   Blend modifiers — how secondary auras
   influence the subtitle and shortMeaning
   ═══════════════════════════════════════════ */

const BLEND_SUBTITLE_MODIFIERS: Record<AuraFamily, string> = {
  gold: "tempered by inner radiance",
  blue: "deepened by lunar intuition",
  green: "sharpened by mercurial wit",
  purple: "veiled in mystic vision",
  red: "ignited by primal fire",
  pink: "softened by Venusian grace",
  turquoise: "electrified by future sight",
  indigo: "anchored in timeless discipline",
  orange: "expanded by boundless optimism",
  white: "refined through transformation",
};

const BLEND_MEANING_SUFFIXES: Record<AuraFamily, string> = {
  gold: "This radiant warmth amplifies your natural authority.",
  blue: "Your emotional depth adds a layer of rare empathy.",
  green: "A sharp mind sharpens every instinct you carry.",
  purple: "Mystical sensitivity colors your perception with hidden insight.",
  red: "An undercurrent of raw courage fuels your every move.",
  pink: "A gift for harmony softens even your boldest expressions.",
  turquoise: "Flashes of innovation keep your path unpredictable and alive.",
  indigo: "Deep patience grounds your energy with enduring strength.",
  orange: "A generous spirit lifts your vision beyond the immediate.",
  white: "The power of reinvention ensures nothing holds you back.",
};

/* ═══════════════════════════════════════════
   Classifier — planetary influences → AuraClassification
   ═══════════════════════════════════════════ */

interface PlanetInfluence {
  key: string;
  value: number;
}

/**
 * Classify the user's aura from their sorted planetary influences.
 * @param sortedInfluences  array of { key, value } sorted descending by value
 */
export function classifyAura(
  sortedInfluences: PlanetInfluence[],
): AuraClassification {
  const top = sortedInfluences.slice(0, 5);
  if (top.length === 0) {
    return {
      primaryAura: "gold",
      secondaryAuras: [],
      dominantPlanet: "sun",
      secondaryPlanets: [],
      blendMode: false,
      intensityProfile: "dominant",
    };
  }

  const dominantPlanet = top[0].key;
  const primaryAura = PLANET_AURA_MAP[dominantPlanet] || "gold";

  const secondaryPlanets = top.slice(1).map((p) => p.key);
  const secondaryAuras = secondaryPlanets
    .map((k) => PLANET_AURA_MAP[k])
    .filter((a): a is AuraFamily => !!a && a !== primaryAura);

  // Determine intensity profile
  const topVal = top[0].value;
  const secondVal = top[1]?.value ?? 0;
  const ratio = secondVal > 0 ? topVal / secondVal : Infinity;

  let intensityProfile: AuraClassification["intensityProfile"];
  if (ratio >= 1.8) {
    intensityProfile = "dominant";
  } else if (ratio >= 1.2) {
    intensityProfile = "balanced";
  } else {
    intensityProfile = "diffused";
  }

  // Blend mode activates when the top two are close in strength
  const blendMode = ratio < 1.4 && secondaryAuras.length > 0;

  return {
    primaryAura,
    secondaryAuras,
    dominantPlanet,
    secondaryPlanets,
    blendMode,
    intensityProfile,
  };
}

/* ═══════════════════════════════════════════
   Resolver — classification → final AuraResult
   ═══════════════════════════════════════════ */

export function resolveAuraResult(
  classification: AuraClassification,
): AuraResult {
  const primary = AURA_BANK[classification.primaryAura];

  let title = primary.title;
  let subtitle = primary.subtitle;
  let shortMeaning = primary.shortMeaning;
  let personalityTone = primary.personalityTone;
  let visualTone = primary.visualTone;

  const topSecondary = classification.secondaryAuras[0];

  if (classification.blendMode && topSecondary) {
    // Blend mode: layer secondary influence into subtitle + meaning
    const secondaryEntry = AURA_BANK[topSecondary];
    subtitle = `${primary.subtitle} — ${BLEND_SUBTITLE_MODIFIERS[topSecondary]}`;
    shortMeaning = `${primary.shortMeaning} ${BLEND_MEANING_SUFFIXES[topSecondary]}`;
    personalityTone = `${primary.personalityTone}, ${secondaryEntry.personalityTone.split(",")[0].trim()}`;
    visualTone = `${primary.visualTone}, ${secondaryEntry.visualTone.split(",")[0].trim()}`;
  } else if (topSecondary) {
    // Non-blend: subtle secondary enrichment in meaning only
    shortMeaning = `${primary.shortMeaning} ${BLEND_MEANING_SUFFIXES[topSecondary]}`;
  }

  return {
    title,
    subtitle,
    shortMeaning,
    personalityTone,
    visualTone,
    primaryAura: classification.primaryAura,
    secondaryAuras: classification.secondaryAuras,
    dominantPlanet: classification.dominantPlanet,
    secondaryPlanets: classification.secondaryPlanets,
    blendMode: classification.blendMode,
  };
}

/* ═══════════════════════════════════════════
   Convenience — single-call from raw influences
   ═══════════════════════════════════════════ */

/**
 * End-to-end: planet influence record → structured AuraResult.
 * Deterministic — same input always yields the same output.
 */
export function getAuraResult(
  influences: Record<string, number>,
): AuraResult {
  const sorted = Object.entries(influences)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value);

  const classification = classifyAura(sorted);
  return resolveAuraResult(classification);
}

/** Expose the bank for reference / testing */
export { AURA_BANK, PLANET_AURA_MAP };

/**
 * Aura Result Bank — deterministic mapping from planetary influence analysis
 * to structured, personalized result objects.
 *
 * Architecture:
 *  1. `classifyAura()`      – reads sorted planet influences → AuraClassification
 *  2. `resolveAuraResult()` – classification → final AuraResult via the bank
 *
 * v2: Layered identity system with energy modifiers, visual profiles,
 *     and shareable identity strings for large-scale personalization.
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

export type EnergyModifier =
  | "radiant"
  | "soft"
  | "magnetic"
  | "deep"
  | "balanced"
  | "transformative"
  | "grounded"
  | "fluid"
  | "intense"
  | "ethereal";

export interface AuraBankEntry {
  title: string;
  subtitle: string;
  shortMeaning: string;
  personalityTone: string;
  visualTone: string;
}

export interface VisualProfile {
  coreColor: string;
  auraColor: string;
  accentColor: string;
  intensity: "soft" | "medium" | "strong" | "radiant";
}

export interface AuraClassification {
  primaryAura: AuraFamily;
  secondaryAuras: AuraFamily[];
  dominantPlanet: string;
  secondaryPlanets: string[];
  blendMode: boolean;
  intensityProfile: "dominant" | "balanced" | "diffused";
  modifier: EnergyModifier;
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
  /** Energy modifier describing the quality of the aura */
  modifier: EnergyModifier;
  /** Human-readable shareable identity line */
  shareableIdentity: string;
  /** Visual rendering hints for UI layers */
  visualProfile: VisualProfile;
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
   Energy modifier system
   ═══════════════════════════════════════════ */

/** Planet-pair affinities that determine the energy modifier */
const MODIFIER_RULES: Array<{
  condition: (dom: string, secs: string[], profile: string) => boolean;
  modifier: EnergyModifier;
}> = [
  { condition: (d, s) => d === "sun" && s.includes("jupiter"),              modifier: "radiant" },
  { condition: (d, s) => d === "sun" && s.includes("mars"),                 modifier: "intense" },
  { condition: (d, s) => d === "moon" && s.includes("neptune"),             modifier: "ethereal" },
  { condition: (d, s) => d === "moon" && s.includes("venus"),               modifier: "soft" },
  { condition: (d, s) => d === "venus" && s.includes("neptune"),            modifier: "fluid" },
  { condition: (d, s) => d === "venus" && s.includes("pluto"),              modifier: "magnetic" },
  { condition: (d, s) => d === "mars" && s.includes("pluto"),               modifier: "transformative" },
  { condition: (d, s) => d === "saturn" && s.includes("mars"),              modifier: "grounded" },
  { condition: (d, s) => d === "saturn" && s.includes("jupiter"),           modifier: "balanced" },
  { condition: (d, s) => d === "pluto" && s.includes("neptune"),            modifier: "deep" },
  { condition: (d, s) => d === "mercury" && s.includes("uranus"),           modifier: "magnetic" },
  { condition: (d, s) => d === "uranus" && s.includes("mercury"),           modifier: "fluid" },
  { condition: (d, s) => d === "jupiter" && s.includes("neptune"),          modifier: "ethereal" },
  { condition: (d, s) => d === "neptune" && s.includes("moon"),             modifier: "soft" },
  // Intensity-profile fallbacks
  { condition: (_d, _s, p) => p === "dominant",   modifier: "intense" },
  { condition: (_d, _s, p) => p === "diffused",   modifier: "balanced" },
];

/** Fallback modifier by planet when no rule matches */
const PLANET_DEFAULT_MODIFIER: Record<string, EnergyModifier> = {
  sun: "radiant",
  moon: "soft",
  mercury: "fluid",
  venus: "magnetic",
  mars: "intense",
  jupiter: "radiant",
  saturn: "grounded",
  uranus: "transformative",
  neptune: "ethereal",
  pluto: "deep",
};

function resolveModifier(
  dominantPlanet: string,
  secondaryPlanets: string[],
  intensityProfile: string,
): EnergyModifier {
  for (const rule of MODIFIER_RULES) {
    if (rule.condition(dominantPlanet, secondaryPlanets, intensityProfile)) {
      return rule.modifier;
    }
  }
  return PLANET_DEFAULT_MODIFIER[dominantPlanet] || "balanced";
}

/* ═══════════════════════════════════════════
   Modifier display names (for shareable identity)
   ═══════════════════════════════════════════ */

const MODIFIER_LABELS: Record<EnergyModifier, string> = {
  radiant: "Radiant",
  soft: "Soft",
  magnetic: "Magnetic",
  deep: "Deep",
  balanced: "Balanced",
  transformative: "Transformative",
  grounded: "Grounded",
  fluid: "Fluid",
  intense: "Intense",
  ethereal: "Ethereal",
};

/* ═══════════════════════════════════════════
   Visual profile system
   ═══════════════════════════════════════════ */

const AURA_VISUAL_PROFILES: Record<AuraFamily, { core: string; aura: string; accent: string }> = {
  gold:      { core: "#F5C842", aura: "#DAA520", accent: "#FFE4A0" },
  blue:      { core: "#8AAFC8", aura: "#5B8BA8", accent: "#D0E8F5" },
  green:     { core: "#5AAF7A", aura: "#3D8B5E", accent: "#A8E6C0" },
  purple:    { core: "#9060B8", aura: "#6B3FA0", accent: "#CBA8E8" },
  red:       { core: "#D04848", aura: "#A03030", accent: "#F0A0A0" },
  pink:      { core: "#E878B0", aura: "#C05888", accent: "#F8C8E0" },
  turquoise: { core: "#48B8D8", aura: "#2898B8", accent: "#A0E8F8" },
  indigo:    { core: "#5060C8", aura: "#3848A8", accent: "#A0A8E8" },
  orange:    { core: "#D89038", aura: "#B87020", accent: "#F0C888" },
  white:     { core: "#D8D0C4", aura: "#B8B0A0", accent: "#F0ECE4" },
};

function resolveVisualProfile(
  primary: AuraFamily,
  secondary: AuraFamily | undefined,
  intensityProfile: AuraClassification["intensityProfile"],
): VisualProfile {
  const base = AURA_VISUAL_PROFILES[primary];
  const accentSource = secondary ? AURA_VISUAL_PROFILES[secondary] : base;

  const intensity: VisualProfile["intensity"] =
    intensityProfile === "dominant" ? "radiant"
    : intensityProfile === "balanced" ? "medium"
    : "soft";

  return {
    coreColor: base.core,
    auraColor: base.aura,
    accentColor: accentSource.accent,
    intensity,
  };
}

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
   Shareable identity builder
   ═══════════════════════════════════════════ */

function buildShareableIdentity(
  primary: AuraBankEntry,
  modifier: EnergyModifier,
  secondary?: AuraFamily,
): string {
  const modLabel = MODIFIER_LABELS[modifier];
  const base = `${modLabel} ${primary.title}`;
  if (secondary) {
    const secTitle = AURA_BANK[secondary].title.split(" ")[0]; // first word
    return `${base} with ${secTitle} Undertones`;
  }
  return base;
}

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
      modifier: "radiant",
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

  // Resolve energy modifier
  const modifier = resolveModifier(dominantPlanet, secondaryPlanets, intensityProfile);

  return {
    primaryAura,
    secondaryAuras,
    dominantPlanet,
    secondaryPlanets,
    blendMode,
    intensityProfile,
    modifier,
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
    const secondaryEntry = AURA_BANK[topSecondary];
    subtitle = `${primary.subtitle} — ${BLEND_SUBTITLE_MODIFIERS[topSecondary]}`;
    shortMeaning = `${primary.shortMeaning} ${BLEND_MEANING_SUFFIXES[topSecondary]}`;
    personalityTone = `${primary.personalityTone}, ${secondaryEntry.personalityTone.split(",")[0].trim()}`;
    visualTone = `${primary.visualTone}, ${secondaryEntry.visualTone.split(",")[0].trim()}`;
  } else if (topSecondary) {
    shortMeaning = `${primary.shortMeaning} ${BLEND_MEANING_SUFFIXES[topSecondary]}`;
  }

  const visualProfile = resolveVisualProfile(
    classification.primaryAura,
    topSecondary,
    classification.intensityProfile,
  );

  const shareableIdentity = buildShareableIdentity(
    primary,
    classification.modifier,
    topSecondary,
  );

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
    modifier: classification.modifier,
    shareableIdentity,
    visualProfile,
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
export { AURA_BANK, PLANET_AURA_MAP, MODIFIER_LABELS, AURA_VISUAL_PROFILES };

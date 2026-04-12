/**
 * AuraDebugPanel — Admin-only diagnostic overlay for the aura engine.
 *
 * Shows pipeline state, raw/sorted planet scores, selection reasoning,
 * forced preset buttons, and reset controls.
 *
 * ONLY rendered when isAdminTestMode() is true.
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Trash2 } from "lucide-react";
import { isAdminTestMode } from "@/lib/adminTestMode";
import { getSelectionReasoning, type AuraResult } from "@/lib/auraResultBank";
import { buildLocalizedTitle, getAuraSubtitle } from "@/lib/auraLocale";
import { subscriptionManager } from "@/lib/subscriptionManager";
import type { Language } from "@/i18n/types";

/* ── Types ── */
interface AuraDebugPanelProps {
  realInfluences: Record<string, number>;
  activeInfluences: Record<string, number>;
  auraResult: AuraResult;
  language: Language;
  isForced: boolean;
  presetName: string | null;
  onPresetChange: (presetName: string, influences: Record<string, number>) => void;
  onPresetClear: () => void;
  onRestoreReal: () => void;
}

/* ── Forced preset influence maps ── */
const PLANET_KEYS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"] as const;

const PRESET_LABELS: Record<string, string> = {
  sun: "☉ Sun", moon: "☽ Moon", mercury: "☿ Mercury", venus: "♀ Venus",
  mars: "♂ Mars", jupiter: "♃ Jupiter", saturn: "♄ Saturn",
  uranus: "♅ Uranus", neptune: "♆ Neptune", pluto: "♇ Pluto",
};

function buildForcedMap(dominant: string): Record<string, number> {
  const others = PLANET_KEYS.filter((k) => k !== dominant);
  const otherScores = [12, 10, 9, 8, 7, 6, 4, 3, 1];
  const map: Record<string, number> = { [dominant]: 40 };
  others.forEach((k, i) => { map[k] = otherScores[i]; });
  return map;
}

/* ── Cache key for localStorage detection ── */
const CHART_CACHE_KEY = "astrologai_birthchart_cache";

/* ── Component ── */
const AuraDebugPanel = ({
  realInfluences,
  activeInfluences,
  auraResult,
  language,
  isForced,
  presetName,
  onPresetChange,
  onPresetClear,
  onRestoreReal,
}: AuraDebugPanelProps) => {
  const [collapsed, setCollapsed] = useState(true);

  if (!isAdminTestMode()) return null;

  // Sorted scores
  const sorted = Object.entries(activeInfluences).sort((a, b) => b[1] - a[1]);
  const winner = sorted[0];
  const second = sorted[1];
  const gap = winner ? winner[1] - (second?.[1] ?? 0) : 0;

  // Reasoning
  const reasoning = getSelectionReasoning(activeInfluences, auraResult);

  // Cache detection
  const cachedData = localStorage.getItem(CHART_CACHE_KEY);
  const cacheAge = cachedData ? (() => {
    try {
      const parsed = JSON.parse(cachedData);
      if (parsed?.timestamp) {
        const mins = Math.round((Date.now() - parsed.timestamp) / 60000);
        return `${mins}m ago`;
      }
    } catch { /* ignore */ }
    return "present (no timestamp)";
  })() : null;

  // Data source determination
  const activeDataSource = isForced
    ? "admin_test"
    : cachedData
      ? "cached"
      : "real_user";

  const usedAdminOverride = isForced;
  const direction = ["he", "ar"].includes(language) ? "rtl" : "ltr";

  // Binding source detection
  const localizedTitle = buildLocalizedTitle(language, auraResult.primaryAura, auraResult.modifier);
  const bindingSource = localizedTitle ? "localized_keys" : "fallback_label";

  const localizedSubtitle = getAuraSubtitle(language, auraResult.primaryAura);

  const fieldStyle = "flex justify-between gap-2 text-[10px] leading-relaxed";
  const labelStyle = "text-white/40 shrink-0";
  const valueStyle = "text-white/80 text-right break-all";

  return (
    <div
      className="fixed bottom-3 right-3 z-[99998] select-none"
      style={{
        width: collapsed ? "auto" : 340,
        maxHeight: "80vh",
        fontFamily: "ui-monospace, monospace",
        fontSize: 10,
      }}
    >
      {/* Toggle bar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg w-full cursor-pointer"
        style={{
          background: "rgba(10, 10, 20, 0.92)",
          border: "1px solid rgba(201, 168, 76, 0.25)",
          borderBottom: collapsed ? undefined : "none",
          color: "rgba(201, 168, 76, 0.8)",
        }}
      >
        {collapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        <span className="text-[10px] uppercase tracking-wider font-bold">
          Aura Debug {isForced && `[${presetName}]`}
        </span>
      </button>

      {!collapsed && (
        <div
          className="overflow-y-auto rounded-b-lg"
          style={{
            background: "rgba(10, 10, 20, 0.95)",
            border: "1px solid rgba(201, 168, 76, 0.25)",
            borderTop: "none",
            maxHeight: "70vh",
            padding: 10,
          }}
        >
          {/* ── Section 1: Pipeline Inspector ── */}
          <div className="mb-3">
            <div className="text-[9px] uppercase tracking-widest text-amber-400/60 mb-1 font-bold">Pipeline</div>
            <div className="space-y-0.5">
              <div className={fieldStyle}><span className={labelStyle}>activeDataSource</span><span className={valueStyle}>{activeDataSource}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>usedAdminOverride</span><span className={valueStyle}>{String(usedAdminOverride)}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>presetName</span><span className={valueStyle}>{presetName || "none"}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>currentLocale</span><span className={valueStyle}>{language}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>direction</span><span className={valueStyle}>{direction}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>dominantPlanet</span><span className={valueStyle} style={{ color: "#F5C842" }}>{auraResult.dominantPlanet}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>secondaryPlanets</span><span className={valueStyle}>{auraResult.secondaryPlanets.join(", ") || "none"}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>primaryAuraKey</span><span className={valueStyle}>{auraResult.primaryAura}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>secondaryAuraKeys</span><span className={valueStyle}>{auraResult.secondaryAuras.join(", ") || "none"}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>modifierKey</span><span className={valueStyle}>{auraResult.modifier}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>titleKey</span><span className={valueStyle}>{auraResult.titleKey}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>localizedTitle</span><span className={valueStyle}>{localizedTitle}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>localizedSubtitle</span><span className={valueStyle}>{localizedSubtitle}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>bindingSource</span><span className={valueStyle}>{bindingSource}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>blendMode</span><span className={valueStyle}>{String(auraResult.blendMode)}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>glowIntensity</span><span className={valueStyle}>{auraResult.visualProfile.intensity}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>fallbackUsed</span><span className={valueStyle}>{sorted.length === 0 || (winner && winner[1] === 0) ? "true" : "false"}</span></div>
              <div className={fieldStyle}><span className={labelStyle}>cacheStatus</span><span className={valueStyle}>{cacheAge ? `cached (${cacheAge})` : "no cache"}</span></div>
            </div>
          </div>

          {/* ── Section 2: Raw Influence Map + Sorted Scores ── */}
          <div className="mb-3">
            <div className="text-[9px] uppercase tracking-widest text-amber-400/60 mb-1 font-bold">Raw Influences (before sort)</div>
            <div className="text-[9px] text-white/50 break-all mb-2">
              {JSON.stringify(realInfluences)}
            </div>

            <div className="text-[9px] uppercase tracking-widest text-amber-400/60 mb-1 font-bold">Sorted Scores</div>
            <div className="space-y-0.5">
              {sorted.map(([planet, score], idx) => (
                <div
                  key={planet}
                  className="flex justify-between text-[10px]"
                  style={{
                    color: idx === 0 ? "#F5C842" : "rgba(255,255,255,0.6)",
                    fontWeight: idx === 0 ? 700 : 400,
                  }}
                >
                  <span>{idx === 0 ? "★ " : "  "}{planet}</span>
                  <span>{score}{idx === 0 && second ? ` (gap: +${gap})` : ""}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 3: Selection Reasoning ── */}
          <div className="mb-3">
            <div className="text-[9px] uppercase tracking-widest text-amber-400/60 mb-1 font-bold">Reasoning</div>
            <div className="space-y-0.5">
              {reasoning.map((line, i) => (
                <div key={i} className="text-[9px] text-white/60">{line}</div>
              ))}
              <div className="text-[9px] text-white/60">
                dataSource: {activeDataSource}{isForced ? ` | preset: ${presetName}` : ""}
              </div>
              <div className="text-[9px] text-white/60">
                cache: {cacheAge ? `${CHART_CACHE_KEY} exists, age: ${cacheAge}` : "no cache found"}
              </div>
            </div>
          </div>

          {/* ── Section 4: Forced Presets ── */}
          <div className="mb-3">
            <div className="text-[9px] uppercase tracking-widest text-amber-400/60 mb-1 font-bold">Force Dominant Planet</div>
            <div className="grid grid-cols-2 gap-1">
              {PLANET_KEYS.map((planet) => (
                <button
                  key={planet}
                  onClick={() => onPresetChange(`${planet}_dominant`, buildForcedMap(planet))}
                  className="px-2 py-1 rounded text-[9px] cursor-pointer transition-colors"
                  style={{
                    background: presetName === `${planet}_dominant`
                      ? "rgba(201, 168, 76, 0.25)"
                      : "rgba(255, 255, 255, 0.06)",
                    border: presetName === `${planet}_dominant`
                      ? "1px solid rgba(201, 168, 76, 0.5)"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                    color: presetName === `${planet}_dominant`
                      ? "rgba(201, 168, 76, 1)"
                      : "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {PRESET_LABELS[planet]}
                </button>
              ))}
            </div>
          </div>

          {/* ── Section 5: Reset Controls ── */}
          <div className="flex gap-2">
            <button
              onClick={onPresetClear}
              className="flex items-center gap-1 px-2 py-1.5 rounded text-[9px] cursor-pointer flex-1"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "rgba(255, 255, 255, 0.6)",
              }}
            >
              <Trash2 className="w-2.5 h-2.5" />
              Clear Preset
            </button>
            <button
              onClick={onRestoreReal}
              className="flex items-center gap-1 px-2 py-1.5 rounded text-[9px] cursor-pointer flex-1"
              style={{
                background: "rgba(220, 50, 50, 0.12)",
                border: "1px solid rgba(220, 50, 50, 0.3)",
                color: "rgba(220, 120, 120, 0.9)",
              }}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Restore Real
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuraDebugPanel;

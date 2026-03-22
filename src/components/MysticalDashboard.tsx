import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Flame, Droplets, Wind, Mountain, Sparkles, Eye, Heart, Zap, Sun, Moon, TrendingUp } from "lucide-react";
import { mysticalProfile, type MysticalProfileData } from "@/lib/mysticalProfile";
import { useT } from "@/i18n";

const THEME_ICONS: Record<string, typeof Flame> = {
  "טרנספורמציה": Zap,
  "צמיחה_רגשית": Droplets,
  "אמת_נסתרת": Eye,
  "מתח_זוגי": Heart,
  "אנרגיה_יצירתית": Sparkles,
  "כוח_פנימי": Flame,
  "התחלות_חדשות": Star,
  "בהירות_רוחנית": Sun,
  "אומץ_והחלטות": Mountain,
};

const THEME_LABELS: Record<string, string> = {
  "טרנספורמציה": "טרנספורמציה ושינוי",
  "צמיחה_רגשית": "צמיחה רגשית",
  "אמת_נסתרת": "חיפוש אמת נסתרת",
  "מתח_זוגי": "מתח וחיבור זוגי",
  "אנרגיה_יצירתית": "אנרגיה יצירתית",
  "כוח_פנימי": "כוח פנימי ועוצמה",
  "התחלות_חדשות": "התחלות חדשות",
  "בהירות_רוחנית": "בהירות רוחנית",
  "אומץ_והחלטות": "אומץ וקבלת החלטות",
};

const ELEMENT_ICONS: Record<string, typeof Flame> = {
  "אש": Flame,
  "מים": Droplets,
  "אוויר": Wind,
  "אדמה": Mountain,
  "Fire": Flame,
  "Water": Droplets,
  "Air": Wind,
  "Earth": Mountain,
};

interface MysticalDashboardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MysticalDashboard = ({ isOpen: externalOpen, onClose }: MysticalDashboardProps = {}) => {
  const t = useT();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen ?? internalOpen;
  const closePanel = () => { setInternalOpen(false); onClose?.(); };
  const [profile, setProfile] = useState<MysticalProfileData | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProfile(mysticalProfile.getProfile());
    }
  }, [isOpen]);

  const hasData = profile && profile.totalReadings > 0;

  const sortedThemes = profile
    ? Object.entries(profile.energyThemes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  const maxThemeCount = sortedThemes.length > 0 ? sortedThemes[0][1] : 1;

  const daysSinceFirst = profile?.firstReadingAt
    ? Math.floor((Date.now() - new Date(profile.firstReadingAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Frequent cards
  const cardFrequency: Record<string, { count: number; symbol: string }> = {};
  if (profile) {
    for (const card of profile.recentTarotCards) {
      const key = card.hebrewName;
      if (!cardFrequency[key]) cardFrequency[key] = { count: 0, symbol: card.symbol };
      cardFrequency[key].count++;
    }
    for (const card of profile.dailyCards) {
      const key = card.hebrewName;
      if (!cardFrequency[key]) cardFrequency[key] = { count: 0, symbol: card.symbol };
      cardFrequency[key].count++;
    }
  }
  const topCards = Object.entries(cardFrequency)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  return (
    <>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click-away layer (transparent, no dimming) */}
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => closePanel()}
            />

            {/* Compact floating panel */}
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed z-[70] overflow-y-auto rounded-xl border border-border shadow-2xl"
              style={{
                top: "102px",
                left: "16px",
                width: "min(400px, calc(100vw - 32px))",
                maxHeight: "calc(100vh - 96px)",
                background: "linear-gradient(145deg, hsl(222 40% 10% / 0.97), hsl(222 47% 8% / 0.97))",
                backdropFilter: "blur(16px)",
              }}
              role="dialog"
              aria-label={t.dashboard_title}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg text-primary">{t.dashboard_title}</h2>
                    <p className="text-xs text-muted-foreground">{t.dashboard_subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => closePanel()}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  aria-label={t.a11y_close_modal}
                >
                  <X className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                </button>
              </div>

              {!hasData ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/5 flex items-center justify-center">
                    <Star className="w-10 h-10 text-primary/40" />
                  </div>
                  <h3 className="font-heading text-primary text-lg mb-2">{t.dashboard_empty_title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.dashboard_empty_desc}</p>
                </div>
              ) : (
                <div className="p-5 space-y-6">
                  {/* Identity Card */}
                  {(profile.zodiacSign || profile.risingSign) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-muted/50 border border-border p-5"
                    >
                      <h3 className="font-heading text-sm text-primary mb-4 flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        {t.dashboard_identity}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {profile.zodiacSign && (
                          <div className="text-center p-3 rounded-lg bg-background/50">
                            <span className="text-2xl block mb-1">{profile.zodiacSymbol}</span>
                            <span className="text-sm font-heading text-foreground block">{profile.zodiacSign}</span>
                            <span className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                              {profile.zodiacElement && ELEMENT_ICONS[profile.zodiacElement] && (() => {
                                const Icon = ELEMENT_ICONS[profile.zodiacElement!];
                                return <Icon className="w-3 h-3" />;
                              })()}
                              {profile.zodiacElement}
                            </span>
                          </div>
                        )}
                        {profile.risingSign && (
                          <div className="text-center p-3 rounded-lg bg-background/50">
                            <span className="text-2xl block mb-1">{profile.risingSymbol}</span>
                            <span className="text-sm font-heading text-foreground block">{profile.risingSign}</span>
                            <span className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                              <TrendingUp className="w-3 h-3" />
                              {t.dashboard_rising}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    <div className="text-center p-4 rounded-xl bg-muted/50 border border-border">
                      <span className="text-2xl font-heading text-primary block">{profile.totalReadings}</span>
                      <span className="text-xs text-muted-foreground">{t.dashboard_readings}</span>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/50 border border-border">
                      <span className="text-2xl font-heading text-primary block">{topCards.length}</span>
                      <span className="text-xs text-muted-foreground">{t.dashboard_unique_cards}</span>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/50 border border-border">
                      <span className="text-2xl font-heading text-primary block">{daysSinceFirst || 1}</span>
                      <span className="text-xs text-muted-foreground">{t.dashboard_days}</span>
                    </div>
                  </motion.div>

                  {/* Recurring Cards */}
                  {topCards.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-xl bg-muted/50 border border-border p-5"
                    >
                      <h3 className="font-heading text-sm text-primary mb-4 flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        {t.dashboard_recurring_cards}
                      </h3>
                      <div className="space-y-2">
                        {topCards.map(([name, data]) => (
                          <div key={name} className="flex items-center gap-3 p-2 rounded-lg bg-background/30">
                            <span className="text-xl w-8 text-center">{data.symbol}</span>
                            <span className="text-sm text-foreground flex-1 font-body">{name}</span>
                            <span className="text-xs text-primary font-heading">×{data.count}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Energy Themes */}
                  {sortedThemes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-xl bg-muted/50 border border-border p-5"
                    >
                      <h3 className="font-heading text-sm text-primary mb-4 flex items-center gap-2">
                        <Flame className="w-4 h-4" />
                        {t.dashboard_energy_themes}
                      </h3>
                      <div className="space-y-3">
                        {sortedThemes.map(([theme, count]) => {
                          const Icon = THEME_ICONS[theme] || Star;
                          const pct = Math.round((count / maxThemeCount) * 100);
                          return (
                            <div key={theme} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-foreground flex items-center gap-2 font-body">
                                  <Icon className="w-3.5 h-3.5 text-primary/70" />
                                  {THEME_LABELS[theme] || theme}
                                </span>
                                <span className="text-xs text-muted-foreground">×{count}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-background/50 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: 0.4 }}
                                  className="h-full rounded-full bg-primary/60"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Compatibility History */}
                  {profile.compatibilityHistory.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-xl bg-muted/50 border border-border p-5"
                    >
                      <h3 className="font-heading text-sm text-primary mb-4 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        {t.dashboard_compatibility}
                      </h3>
                      <div className="space-y-2">
                        {profile.compatibilityHistory.slice(0, 3).map((entry, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background/30">
                            <span className="text-sm text-foreground font-body">
                              {entry.partnerSymbol} {entry.partnerSign}
                            </span>
                            <span className={`text-sm font-heading ${entry.score >= 70 ? "text-green-400" : entry.score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                              {entry.score}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MysticalDashboard;

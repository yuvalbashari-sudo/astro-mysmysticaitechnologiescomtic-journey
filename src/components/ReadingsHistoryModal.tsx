import { useState, useEffect, useRef } from "react";
import CinematicModalShell from "@/components/CinematicModalShell";
import { motion, AnimatePresence } from "framer-motion";
import { readingsStorage, SavedReading } from "@/lib/readingsStorage";
import { Trash2, Clock, Star, Moon, Sparkles, Eye, Hand } from "lucide-react";
import { useT, useLanguage } from "@/i18n";

const typeIcons: Record<string, typeof Star> = {
  forecast: Star,
  rising: Moon,
  compatibility: Sparkles,
  tarot: Eye,
  palm: Hand,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ReadingsHistoryModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language, dir } = useLanguage();
  const [readings, setReadings] = useState<SavedReading[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const typeLabels: Record<string, string> = {
    forecast: t.readings_type_forecast,
    rising: t.readings_type_rising,
    compatibility: t.readings_type_compatibility,
    tarot: t.readings_type_tarot,
    palm: t.readings_type_palm,
  };

  const dateLocale = language === "he" ? "he-IL" : language === "ar" ? "ar-SA" : language === "ru" ? "ru-RU" : "en-US";

  useEffect(() => {
    if (isOpen) setReadings(readingsStorage.getAll());
  }, [isOpen]);

  const handleDelete = (id: string) => {
    readingsStorage.remove(id);
    setReadings(readingsStorage.getAll());
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <CinematicModalShell isOpen={isOpen} onClose={onClose} scrollRef={scrollRef as React.RefObject<HTMLDivElement>}>
        <div className="p-6 md:p-8" dir={dir}>
            <div className="text-center mb-8">
              <Clock className="w-8 h-8 text-gold mx-auto mb-4" />
              <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-2">
                {t.readings_title}
              </h2>
              <p className="text-foreground/60 font-body text-sm max-w-md mx-auto">
                {t.readings_subtitle}
              </p>
              <div className="section-divider max-w-[120px] mx-auto mt-4" />
            </div>

            {readings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-body text-sm">{t.a11y_no_readings}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {readings.map((reading, i) => {
                    const IconComp = typeIcons[reading.type] || Star;
                    const isExpanded = expanded === reading.id;
                    const dateStr = new Date(reading.date).toLocaleDateString(dateLocale, {
                      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                    });

                    return (
                      <motion.div
                        key={reading.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.5), hsl(var(--deep-blue) / 0.3))",
                          border: "1px solid hsl(var(--gold) / 0.08)",
                        }}
                      >
                        <button
                          onClick={() => setExpanded(isExpanded ? null : reading.id)}
                          className="w-full flex items-center gap-4 p-4 text-right hover:bg-gold/5 transition-colors"
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? t.a11y_collapse_reading : t.a11y_expand_reading}: ${reading.title}`}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "hsl(var(--gold) / 0.1)", border: "1px solid hsl(var(--gold) / 0.15)" }}
                          >
                            <IconComp className="w-4 h-4 text-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-lg">{reading.symbol}</span>
                              <h3 className="font-heading text-sm text-gold truncate">{reading.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-body" style={{ background: "hsl(var(--gold) / 0.08)", color: "hsl(var(--gold) / 0.7)" }}>
                                {typeLabels[reading.type]}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-body">{dateStr}</span>
                            </div>
                          </div>
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-gold/40 text-sm">▼</motion.div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-gold/5">
                                <p className="text-foreground/60 font-body text-xs mt-3 mb-3">{reading.subtitle}</p>
                                <div className="space-y-2">
                                  {Object.entries(reading.data)
                                    .filter(([key, val]) => typeof val === "string" && val.length > 20 && !["name", "birthDate", "birthTime", "date1", "date2", "dominantHand"].includes(key))
                                    .slice(0, 3)
                                    .map(([key, val]) => (
                                      <p key={key} className="text-foreground/50 font-body text-xs leading-relaxed line-clamp-2">{String(val)}</p>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-3">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(reading.id); }}
                                    className="flex items-center gap-1.5 text-[11px] text-crimson-light/60 hover:text-crimson-light transition-colors font-body px-2 py-1 rounded"
                                    aria-label={`${t.a11y_delete_reading}: ${reading.title}`}
                                  >
                                    <Trash2 className="w-3 h-3" aria-hidden="true" />
                                    {t.readings_delete}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReadingsHistoryModal;

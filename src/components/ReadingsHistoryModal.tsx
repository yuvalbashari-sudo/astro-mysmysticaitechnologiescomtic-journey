import { useState, useEffect, useRef } from "react";
import CinematicModalShell from "@/components/CinematicModalShell";
import { motion, AnimatePresence } from "framer-motion";
import { readingsStorage, SavedReading } from "@/lib/readingsStorage";
import { Trash2, Clock, Star, Moon, Sparkles, Eye, Hand, AlertTriangle } from "lucide-react";
import { useT, useLanguage } from "@/i18n";
import AvatarHoverTeaser from "./AvatarHoverTeaser";
import AdvisorChatPanel from "./AdvisorChatPanel";
import astrologerAvatar from "@/assets/astrologer-avatar-cta.png";

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
  const [confirmClear, setConfirmClear] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  const handleClearAll = () => {
    readingsStorage.clearAll();
    setReadings([]);
    setConfirmClear(false);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <CinematicModalShell isOpen={isOpen} onClose={onClose} scrollRef={scrollRef as React.RefObject<HTMLDivElement>} wide hideAdvisor>
        {/* Avatar pinned to bottom-right of this screen */}
        <AvatarHoverTeaser
          disabled={isMobile}
          className="fixed z-[106]"
          style={{
            bottom: 10,
            right: 10,
            left: "auto",
            width: isMobile ? 120 : 168,
            height: isMobile ? 120 : 168,
          }}
        >
          <motion.button
            className="w-full h-full rounded-full overflow-hidden cursor-pointer group"
            style={{
              boxShadow: "0 4px 24px hsl(270 60% 45% / 0.3), 0 0 30px hsl(200 70% 50% / 0.12), 0 0 8px hsl(var(--gold) / 0.2)",
              border: "2px solid hsl(var(--gold) / 0.35)",
            }}
            onClick={() => setAdvisorOpen(true)}
            whileHover={{ filter: "brightness(1.15)" }}
            whileTap={{ filter: "brightness(0.9)" }}
            aria-label="התייעצות עם האסטרולוגית"
          >
            <img
              src={astrologerAvatar}
              alt="האסטרולוגית"
              className="w-full h-full object-cover scale-105"
              style={{ objectPosition: "center 42%" }}
              draggable={false}
            />
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: "2px solid hsl(var(--gold) / 0.4)" }}
              animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.button>
        </AvatarHoverTeaser>

        <AdvisorChatPanel isOpen={advisorOpen} onClose={() => setAdvisorOpen(false)} forceRightAnchor />

        <div className="p-8 md:p-12 pt-16 md:pt-20 max-w-2xl" dir={dir} style={{ marginRight: "auto", marginLeft: "-65px" }}>
            <div className="text-center mb-12">
              <Clock className="w-14 h-14 text-gold mx-auto mb-6" />
              <h2 className="font-heading text-4xl md:text-5xl gold-gradient-text mb-4">
                {t.readings_title}
              </h2>
              <p className="text-foreground/60 font-body text-lg md:text-xl max-w-lg mx-auto">
                {t.readings_subtitle}
              </p>
              <div className="section-divider max-w-[160px] mx-auto mt-6" />
            </div>

            {readings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground font-body text-lg">{t.a11y_no_readings}</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Clear All button + confirmation */}
                <div className="flex justify-end mb-2">
                  <AnimatePresence mode="wait">
                    {confirmClear ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-3 rounded-xl px-6 py-4"
                        style={{
                          background: "hsl(var(--deep-blue-light) / 0.6)",
                          border: "1px solid hsl(var(--crimson) / 0.2)",
                        }}
                      >
                        <AlertTriangle className="w-6 h-6 text-crimson-light/70 flex-shrink-0" />
                        <span className="text-foreground/60 font-body text-base">האם למחוק את כל ההיסטוריה?</span>
                        <button
                          onClick={handleClearAll}
                          className="text-base font-body px-5 py-2 rounded-lg transition-colors"
                          style={{
                            background: "hsl(var(--crimson) / 0.15)",
                            color: "hsl(var(--crimson-light))",
                            border: "1px solid hsl(var(--crimson) / 0.25)",
                          }}
                        >
                          אישור
                        </button>
                        <button
                          onClick={() => setConfirmClear(false)}
                          className="text-base font-body px-5 py-2 rounded-lg text-foreground/40 hover:text-foreground/60 transition-colors"
                          style={{
                            background: "hsl(var(--deep-blue-light) / 0.4)",
                            border: "1px solid hsl(var(--gold) / 0.08)",
                          }}
                        >
                          ביטול
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="clear-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setConfirmClear(true)}
                        className="flex items-center gap-2 text-base font-body px-5 py-2.5 rounded-lg transition-colors"
                        style={{
                          color: "hsl(var(--crimson-light) / 0.5)",
                          border: "1px solid hsl(var(--crimson) / 0.1)",
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Trash2 className="w-5 h-5" />
                        מחק את כל ההיסטוריה
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

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
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.5), hsl(var(--deep-blue) / 0.3))",
                          border: "1px solid hsl(var(--gold) / 0.08)",
                        }}
                      >
                        <button
                          onClick={() => setExpanded(isExpanded ? null : reading.id)}
                          className="w-full flex items-center gap-5 p-6 text-start hover:bg-gold/5 transition-colors"
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? t.a11y_collapse_reading : t.a11y_expand_reading}: ${reading.title}`}
                        >
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "hsl(var(--gold) / 0.1)", border: "1px solid hsl(var(--gold) / 0.15)" }}
                          >
                            <IconComp className="w-7 h-7 text-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-2xl">{reading.symbol}</span>
                              <h3 className="font-heading text-xl md:text-2xl text-gold truncate">{reading.title}</h3>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm px-3 py-1 rounded-full font-body" style={{ background: "hsl(var(--gold) / 0.08)", color: "hsl(var(--gold) / 0.7)" }}>
                                {typeLabels[reading.type]}
                              </span>
                              <span className="text-sm text-muted-foreground font-body">{dateStr}</span>
                            </div>
                          </div>
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-gold/40 text-xl">▼</motion.div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 border-t border-gold/5">
                                <p className="text-foreground/60 font-body text-base mt-4 mb-4">{reading.subtitle}</p>
                                <div className="space-y-3">
                                  {Object.entries(reading.data)
                                    .filter(([key, val]) => typeof val === "string" && val.length > 20 && !["name", "birthDate", "birthTime", "date1", "date2", "dominantHand"].includes(key))
                                    .slice(0, 3)
                                    .map(([key, val]) => (
                                      <p key={key} className="text-foreground/50 font-body text-base leading-relaxed line-clamp-3">{String(val)}</p>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-4">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(reading.id); }}
                                    className="flex items-center gap-2 text-base text-crimson-light/60 hover:text-crimson-light transition-colors font-body px-3 py-2 rounded"
                                    aria-label={`${t.a11y_delete_reading}: ${reading.title}`}
                                  >
                                    <Trash2 className="w-5 h-5" aria-hidden="true" />
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
        </div>
    </CinematicModalShell>
  );
};

export default ReadingsHistoryModal;

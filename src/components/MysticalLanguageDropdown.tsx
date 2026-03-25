import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";
import { createPortal } from "react-dom";
import { languageConfig, useLanguage, useT, type Language } from "@/i18n";

const languages: Language[] = ["he", "ar", "ru", "en"];

const MysticalLanguageDropdown = () => {
  const { language, setLanguage, dir } = useLanguage();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [hoveredLanguage, setHoveredLanguage] = useState<Language | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    minWidth: 176,
    maxHeight: 320,
    transformOrigin: "top right",
  });

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 8;
    const gap = 6;
    const menuWidth = Math.max(176, Math.ceil(rect.width));
    const idealLeft = dir === "rtl" ? rect.left : rect.right - menuWidth;
    const left = Math.min(
      Math.max(idealLeft, viewportPadding),
      window.innerWidth - menuWidth - viewportPadding,
    );
    const top = rect.bottom + gap;

    setMenuPosition({
      top,
      left,
      minWidth: menuWidth,
      maxHeight: Math.max(160, window.innerHeight - top - viewportPadding),
      transformOrigin: dir === "rtl" ? "top left" : "top right",
    });
  }, [dir]);

  useLayoutEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const syncPosition = () => {
      window.requestAnimationFrame(updateMenuPosition);
    };

    window.addEventListener("resize", syncPosition);
    window.addEventListener("scroll", syncPosition, true);

    return () => {
      window.removeEventListener("resize", syncPosition);
      window.removeEventListener("scroll", syncPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const optionBaseStyle = useMemo(
    () => ({
      opacity: 1,
      backgroundImage: "none",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
      filter: "none",
      mixBlendMode: "normal" as const,
      boxShadow: "none",
    }),
    [],
  );

  return (
    <div className="relative isolate pointer-events-auto">
      <motion.button
        ref={triggerRef}
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          if (!open) updateMenuPosition();
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 px-5 py-3 rounded-full font-body text-sm transition-all"
        style={{
          background: "hsl(var(--deep-blue-light) / 0.6)",
          border: "1px solid hsl(var(--gold) / 0.15)",
          color: "hsl(var(--gold) / 0.7)",
        }}
        whileHover={{ scale: 1.03, borderColor: "hsl(var(--gold) / 0.3)" }}
        whileTap={{ scale: 0.97 }}
        aria-label={t.a11y_language_selector}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-6 h-6" aria-hidden="true" />
        <span>{languageConfig[language].label}</span>
      </motion.button>

      <AnimatePresence>
        {open && typeof document !== "undefined" && createPortal(
          <motion.div
            ref={menuRef}
            initial={{ y: -6, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed isolate overflow-hidden rounded-2xl p-1.5 text-foreground shadow-2xl pointer-events-auto"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              zIndex: 2147483646,
              minWidth: menuPosition.minWidth,
              maxWidth: "min(18rem, calc(100vw - 1rem))",
              maxHeight: menuPosition.maxHeight,
              overflowY: "auto",
              overscrollBehavior: "contain",
              opacity: 1,
              background: "hsl(var(--deep-blue))",
              backgroundImage: "none",
              border: "1px solid hsl(var(--gold) / 0.28)",
              boxShadow: "0 28px 80px hsl(224 40% 2% / 0.96), 0 0 0 1px hsl(var(--gold) / 0.12)",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
              filter: "none",
              mixBlendMode: "normal",
              transformOrigin: menuPosition.transformOrigin,
              pointerEvents: "auto",
            }}
            role="listbox"
            aria-label={t.a11y_language_selector}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {languages.map((lang) => {
              const isSelected = lang === language;
              const isHovered = hoveredLanguage === lang;

              return (
                <button
                  key={lang}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHoveredLanguage(lang)}
                  onMouseLeave={() => setHoveredLanguage((current) => (current === lang ? null : current))}
                  onFocus={() => setHoveredLanguage(lang)}
                  onBlur={() => setHoveredLanguage((current) => (current === lang ? null : current))}
                  onClick={() => {
                    setLanguage(lang);
                    setOpen(false);
                    setHoveredLanguage(null);
                  }}
                  className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-body text-foreground transition-colors cursor-pointer"
                  style={{
                    ...optionBaseStyle,
                    color: isSelected ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.92)",
                    background: isSelected
                      ? "hsl(var(--deep-blue-light))"
                      : isHovered
                        ? "hsl(var(--muted))"
                        : "hsl(var(--card))",
                    border: isSelected
                      ? "1px solid hsl(var(--gold) / 0.28)"
                      : "1px solid hsl(var(--border))",
                  }}
                  aria-label={`${t.a11y_change_language} ${languageConfig[lang].label}`}
                >
                  <span className="text-base" aria-hidden="true">{languageConfig[lang].flag}</span>
                  <span>{languageConfig[lang].label}</span>
                  {isSelected && (
                    <span className="text-gold/70 text-[10px] ms-auto" aria-hidden="true">
                      ✦
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>,
          document.body,
        )}
      </AnimatePresence>
    </div>
  );
};

export default MysticalLanguageDropdown;
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";
import { createPortal } from "react-dom";
import { languageConfig, useLanguage, useT, type Language } from "@/i18n";

const languages: Language[] = ["he", "ar", "ru", "en"];

type MenuPosition = {
  top: number;
  left: number;
  minWidth: number;
  maxHeight: number;
  transformOrigin: string;
};

const MysticalLanguageDropdown = () => {
  const { language, setLanguage, dir } = useLanguage();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    left: 0,
    minWidth: 176,
    maxHeight: 320,
    transformOrigin: dir === "rtl" ? "top left" : "top right",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const gap = 8;
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

  return (
    <div className="relative pointer-events-auto">
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) updateMenuPosition();
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 px-5 py-3 rounded-full font-body text-sm transition-all"
        style={{
          background: "hsl(var(--deep-blue-light))",
          border: "1px solid hsl(var(--gold) / 0.18)",
          color: "hsl(var(--gold) / 0.78)",
          opacity: 1,
          backgroundImage: "none",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
          filter: "none",
          mixBlendMode: "normal",
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
        {open && mounted && createPortal(
          <motion.div
            ref={menuRef}
            initial={{ y: -8, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="fixed overflow-hidden rounded-2xl p-1.5 text-foreground pointer-events-auto"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              zIndex: 2147483647,
              minWidth: menuPosition.minWidth,
              maxWidth: "min(18rem, calc(100vw - 1rem))",
              maxHeight: menuPosition.maxHeight,
              overflowY: "auto",
              overscrollBehavior: "contain",
              opacity: 1,
              background: "hsl(var(--card))",
              backgroundImage: "none",
              border: "1px solid hsl(var(--gold) / 0.3)",
              boxShadow: "0 32px 80px hsl(var(--deep-blue) / 0.96), 0 0 0 1px hsl(var(--border))",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
              filter: "none",
              mixBlendMode: "normal",
              transformOrigin: menuPosition.transformOrigin,
              pointerEvents: "auto",
            }}
            role="listbox"
            aria-label={t.a11y_language_selector}
          >
            {languages.map((lang) => {
              const isSelected = lang === language;

              return (
                <button
                  key={lang}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setLanguage(lang);
                    setOpen(false);
                  }}
                  onMouseEnter={(event) => {
                    if (!isSelected) {
                      event.currentTarget.style.background = "hsl(var(--muted))";
                      event.currentTarget.style.borderColor = "hsl(var(--gold) / 0.18)";
                    }
                  }}
                  onMouseLeave={(event) => {
                    if (!isSelected) {
                      event.currentTarget.style.background = "hsl(var(--deep-blue))";
                      event.currentTarget.style.borderColor = "hsl(var(--border))";
                    }
                  }}
                  className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-body text-foreground transition-colors cursor-pointer"
                  style={{
                    opacity: 1,
                    backgroundImage: "none",
                    backdropFilter: "none",
                    WebkitBackdropFilter: "none",
                    filter: "none",
                    mixBlendMode: "normal",
                    boxShadow: isSelected ? "0 0 0 1px hsl(var(--gold) / 0.08) inset" : "none",
                    color: isSelected ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.96)",
                    background: isSelected ? "hsl(var(--deep-blue-light))" : "hsl(var(--deep-blue))",
                    border: isSelected
                      ? "1px solid hsl(var(--gold) / 0.34)"
                      : "1px solid hsl(var(--border))",
                  }}
                  aria-label={`${t.a11y_change_language} ${languageConfig[lang].label}`}
                >
                  <span className="text-base" aria-hidden="true">{languageConfig[lang].flag}</span>
                  <span>{languageConfig[lang].label}</span>
                  {isSelected && (
                    <span className="text-[10px] ms-auto" style={{ color: "hsl(var(--gold) / 0.78)" }} aria-hidden="true">
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
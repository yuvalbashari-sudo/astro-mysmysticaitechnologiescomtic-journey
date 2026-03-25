import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";
import { createPortal } from "react-dom";
import { languageConfig, useLanguage, useT, type Language } from "@/i18n";

const languages: Language[] = ["he", "ar", "ru", "en"];
const PORTAL_MENU_Z_INDEX = 2147483647;
const VIEWPORT_PADDING = 12;
const MENU_GAP = 8;

const MysticalLanguageDropdown = () => {
  const { language, setLanguage, dir } = useLanguage();
  const t = useT();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Compute menu position from trigger rect
  const getMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return { top: 0, left: 0 };
    const rect = el.getBoundingClientRect();
    const menuWidth = 180;
    const top = rect.bottom + MENU_GAP;
    const idealLeft = dir === "rtl"
      ? rect.left
      : rect.right - menuWidth;
    const left = Math.min(
      Math.max(idealLeft, VIEWPORT_PADDING),
      window.innerWidth - menuWidth - VIEWPORT_PADDING,
    );
    return { top, left };
  }, [dir]);

  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (open) setMenuPos(getMenuPosition());
  }, [open, getMenuPosition, language]);

  return (
    <>
      {/* Compact trigger – same size as other icon buttons */}
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center shrink-0 rounded-full backdrop-blur-md transition-all w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12"
        style={{
          background: "hsl(var(--deep-blue-light) / 0.6)",
          border: "1px solid hsl(var(--gold) / 0.18)",
          color: "hsl(var(--gold) / 0.78)",
        }}
        whileHover={{ scale: 1.08, borderColor: "hsl(var(--gold) / 0.32)" }}
        whileTap={{ scale: 0.95 }}
        aria-label={t.a11y_language_selector}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-5 h-5 md:w-6 md:h-6 shrink-0" aria-hidden="true" />
      </motion.button>

      {/* Dropdown menu – portalled */}
      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="fixed overflow-hidden rounded-2xl p-1.5 text-foreground"
              style={{
                top: menuPos.top,
                left: menuPos.left,
                zIndex: PORTAL_MENU_Z_INDEX,
                width: 180,
                maxHeight: mounted ? Math.max(160, window.innerHeight - menuPos.top - VIEWPORT_PADDING) : 320,
                overflowY: "auto",
                overscrollBehavior: "contain",
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--gold) / 0.3)",
                boxShadow: "0 32px 80px hsl(var(--deep-blue) / 0.96), 0 0 0 1px hsl(var(--border))",
                transformOrigin: dir === "rtl" ? "top left" : "top right",
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
                    onClick={() => { setLanguage(lang); setOpen(false); }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "hsl(var(--muted))";
                        e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.18)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "hsl(var(--deep-blue))";
                        e.currentTarget.style.borderColor = "hsl(var(--border))";
                      }
                    }}
                    className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-body transition-colors"
                    style={{
                      color: isSelected ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.96)",
                      background: isSelected ? "hsl(var(--deep-blue-light))" : "hsl(var(--deep-blue))",
                      border: isSelected ? "1px solid hsl(var(--gold) / 0.34)" : "1px solid hsl(var(--border))",
                      boxShadow: isSelected ? "0 0 0 1px hsl(var(--gold) / 0.08) inset" : "none",
                    }}
                    aria-label={`${t.a11y_change_language} ${languageConfig[lang].label}`}
                  >
                    <span className="text-base" aria-hidden="true">{languageConfig[lang].flag}</span>
                    <span>{languageConfig[lang].label}</span>
                    {isSelected && (
                      <span className="ms-auto text-[10px]" style={{ color: "hsl(var(--gold) / 0.78)" }} aria-hidden="true">✦</span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

export default MysticalLanguageDropdown;

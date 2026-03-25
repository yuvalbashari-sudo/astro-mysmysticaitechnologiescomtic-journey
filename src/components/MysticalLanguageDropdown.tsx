import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";
import { createPortal } from "react-dom";
import { languageConfig, useLanguage, useT, type Language } from "@/i18n";

const languages: Language[] = ["he", "ar", "ru", "en"];
const PORTAL_TRIGGER_Z_INDEX = 2147483646;
const PORTAL_MENU_Z_INDEX = 2147483647;
const VIEWPORT_PADDING = 12;
const MENU_GAP = 8;

type TriggerRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
};

const MysticalLanguageDropdown = () => {
  const { language, setLanguage, dir } = useLanguage();
  const t = useT();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [triggerRect, setTriggerRect] = useState<TriggerRect>({
    top: 0,
    left: 0,
    width: 176,
    height: 52,
    bottom: 52,
  });

  const syncTriggerPosition = useCallback(() => {
    const anchor = anchorRef.current;

    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();

    setTriggerRect({
      top: rect.top,
      left: rect.left,
      width: Math.max(176, Math.ceil(rect.width)),
      height: Math.ceil(rect.height),
      bottom: rect.bottom,
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;

    syncTriggerPosition();

    const syncOnFrame = () => window.requestAnimationFrame(syncTriggerPosition);
+   const resizeObserver = typeof ResizeObserver !== "undefined"
+      ? new ResizeObserver(syncOnFrame)
+      : null;
+
+    if (anchorRef.current && resizeObserver) {
+      resizeObserver.observe(anchorRef.current);
+    }
 
    window.addEventListener("resize", syncOnFrame);
    window.addEventListener("scroll", syncOnFrame, true);

    return () => {
      window.removeEventListener("resize", syncOnFrame);
      window.removeEventListener("scroll", syncOnFrame, true);
+      resizeObserver?.disconnect();
    };
-  }, [mounted, syncTriggerPosition]);
+  }, [mounted, syncTriggerPosition, language]);

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

  const menuWidth = Math.max(176, triggerRect.width);
  const idealMenuLeft = dir === "rtl"
    ? triggerRect.left
    : triggerRect.left + triggerRect.width - menuWidth;
  const menuLeft = mounted
    ? Math.min(
        Math.max(idealMenuLeft, VIEWPORT_PADDING),
        window.innerWidth - menuWidth - VIEWPORT_PADDING,
      )
    : triggerRect.left;
  const menuTop = triggerRect.bottom + MENU_GAP;
  const menuMaxHeight = mounted
    ? Math.max(160, window.innerHeight - menuTop - VIEWPORT_PADDING)
    : 320;

  const triggerButton = (
    <motion.button
      ref={triggerRef}
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      className="flex items-center gap-2 rounded-full px-5 py-3 font-body text-sm transition-all"
      style={{
        position: "fixed",
        top: triggerRect.top,
        left: triggerRect.left,
        width: triggerRect.width,
        height: triggerRect.height,
        zIndex: PORTAL_TRIGGER_Z_INDEX,
        justifyContent: "center",
        background: "hsl(var(--deep-blue-light))",
        border: "1px solid hsl(var(--gold) / 0.18)",
        color: "hsl(var(--gold) / 0.78)",
        opacity: 1,
        backgroundImage: "none",
        boxShadow: "0 16px 40px hsl(var(--deep-blue) / 0.72)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        filter: "none",
        mixBlendMode: "normal",
        pointerEvents: "auto",
      }}
      whileHover={{ scale: 1.03, borderColor: "hsl(var(--gold) / 0.32)" }}
      whileTap={{ scale: 0.97 }}
      aria-label={t.a11y_language_selector}
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      <Globe className="h-6 w-6 shrink-0" aria-hidden="true" />
      <span>{languageConfig[language].label}</span>
    </motion.button>
  );

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className="flex items-center gap-2 rounded-full px-5 py-3 font-body text-sm"
        style={{
          visibility: "hidden",
          pointerEvents: "none",
          background: "hsl(var(--deep-blue-light))",
          border: "1px solid hsl(var(--gold) / 0.18)",
          color: "hsl(var(--gold) / 0.78)",
          opacity: 0,
        }}
      >
        <Globe className="h-6 w-6 shrink-0" aria-hidden="true" />
        <span>{languageConfig[language].label}</span>
      </button>

      {mounted && createPortal(triggerButton, document.body)}

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              initial={{ y: -8, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -8, scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="fixed overflow-hidden rounded-2xl p-1.5 text-foreground"
              style={{
                top: menuTop,
                left: menuLeft,
                zIndex: PORTAL_MENU_Z_INDEX,
                minWidth: menuWidth,
                maxWidth: "min(18rem, calc(100vw - 1.5rem))",
                maxHeight: menuMaxHeight,
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
                    className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-body transition-colors"
                    style={{
                      opacity: 1,
                      color: isSelected ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.96)",
                      background: isSelected ? "hsl(var(--deep-blue-light))" : "hsl(var(--deep-blue))",
                      border: isSelected
                        ? "1px solid hsl(var(--gold) / 0.34)"
                        : "1px solid hsl(var(--border))",
                      boxShadow: isSelected ? "0 0 0 1px hsl(var(--gold) / 0.08) inset" : "none",
                      backgroundImage: "none",
                      backdropFilter: "none",
                      WebkitBackdropFilter: "none",
                      filter: "none",
                      mixBlendMode: "normal",
                    }}
                    aria-label={`${t.a11y_change_language} ${languageConfig[lang].label}`}
                  >
                    <span className="text-base" aria-hidden="true">{languageConfig[lang].flag}</span>
                    <span>{languageConfig[lang].label}</span>
                    {isSelected && (
                      <span
                        className="ms-auto text-[10px]"
                        style={{ color: "hsl(var(--gold) / 0.78)" }}
                        aria-hidden="true"
                      >
                        ✦
                      </span>
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

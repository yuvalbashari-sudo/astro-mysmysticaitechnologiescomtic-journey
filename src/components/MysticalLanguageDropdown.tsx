import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { languageConfig, useLanguage, useT, type Language } from "@/i18n";

const languages: Language[] = ["he", "ar", "ru", "en"];
const MENU_Z_INDEX = 2147483647;

const MysticalLanguageDropdown = ({ showLabel = false }: { showLabel?: boolean }) => {
  const { language, setLanguage } = useLanguage();
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const labelText = language === "he" ? "שפות" : language === "ar" ? "اللغات" : language === "ru" ? "Языки" : "Languages";

  return (
    <div ref={rootRef} className="relative shrink-0" style={{ zIndex: open ? MENU_Z_INDEX : undefined }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center justify-center shrink-0 backdrop-blur-md transition-transform active:scale-95 hover:scale-105 ${
          showLabel
            ? "gap-2 rounded-full px-4 py-2.5"
            : "rounded-full w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12"
        }`}
        style={{
          background: "hsl(var(--deep-blue-light) / 0.6)",
          border: "1px solid hsl(var(--gold) / 0.18)",
          color: "hsl(var(--gold) / 0.78)",
        }}
        aria-label={t.a11y_language_selector}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className={showLabel ? "w-5 h-5 shrink-0" : "w-5 h-5 md:w-6 md:h-6 shrink-0"} aria-hidden="true" />
        {showLabel && (
          <span className="font-body text-[14px] font-semibold tracking-wide whitespace-nowrap" style={{ color: "hsl(var(--gold) / 0.85)" }}>
            {labelText}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 overflow-hidden rounded-2xl p-1.5 text-foreground animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150 ${showLabel ? "end-0" : "start-0"}`}
          style={{
            zIndex: MENU_Z_INDEX,
            width: 180,
            maxHeight: "min(320px, calc(100vh - 84px))",
            overflowY: "auto",
            overscrollBehavior: "contain",
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--gold) / 0.3)",
            boxShadow: "0 32px 80px hsl(var(--deep-blue) / 0.96), 0 0 0 1px hsl(var(--border))",
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
                className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-body transition-colors hover:bg-muted"
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
        </div>
      )}
    </div>
  );
};

export default MysticalLanguageDropdown;

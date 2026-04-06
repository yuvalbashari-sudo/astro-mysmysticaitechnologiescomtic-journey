import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useT, useLanguage } from "@/i18n";

const NotFound = () => {
  const location = useLocation();
  const t = useT();
  const { dir } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background" dir={dir}>
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-heading gold-gradient-text">{t.not_found_title}</h1>
        <p className="mb-6 text-xl text-foreground/70 font-body">{t.not_found_text}</p>
        <a href="/" className="btn-outline-gold font-body inline-block">
          {t.not_found_cta}
        </a>
      </div>
    </div>
  );
};

export default NotFound;

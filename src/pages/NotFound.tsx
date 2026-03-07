import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-heading gold-gradient-text">404</h1>
        <p className="mb-6 text-xl text-foreground/70 font-body">העמוד שחיפשתם לא נמצא</p>
        <a href="/" className="btn-outline-gold font-body inline-block">
          חזרה לדף הראשי ✦
        </a>
      </div>
    </div>
  );
};

export default NotFound;

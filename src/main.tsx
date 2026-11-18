import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initUserInteractionTracking } from "./lib/userInteraction";

initUserInteractionTracking();

if (import.meta.env.PROD && "serviceWorker" in navigator && window.top === window) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Home screen offline support is unavailable", error);
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);

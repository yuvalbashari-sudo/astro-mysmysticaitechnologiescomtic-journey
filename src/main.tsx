import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initUserInteractionTracking } from "./lib/userInteraction";

initUserInteractionTracking();

createRoot(document.getElementById("root")!).render(<App />);

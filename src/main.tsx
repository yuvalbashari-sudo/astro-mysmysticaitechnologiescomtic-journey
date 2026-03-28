import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { subscriptionManager } from "./lib/subscriptionManager";

// Expose admin helper on window for console access:
// Usage: window.setAdminEmail("yuvalbashari@gmail.com")
(window as any).setAdminEmail = (email: string) => {
  subscriptionManager.setUserEmail(email);
  console.log(`✅ Admin email set to: ${email}. Refresh to apply.`);
};

createRoot(document.getElementById("root")!).render(<App />);

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { subscriptionManager } from "@/lib/subscriptionManager";

/**
 * Subtle floating ADMIN MODE indicator — top-left corner.
 * Only renders when the user is a confirmed admin.
 */
const AdminDebugBadge = () => {
  const [isAdmin, setIsAdmin] = useState(subscriptionManager.isAdmin());

  useEffect(() => {
    const unsubscribe = subscriptionManager.onAuthChange(() => {
      setIsAdmin(subscriptionManager.isAdmin());
    });
    return unsubscribe;
  }, []);

  if (!isAdmin) return null;

  return (
    <div
      className="fixed top-3 left-3 z-[99999] flex items-center gap-1.5 px-3 py-1.5 rounded-full pointer-events-none select-none"
      style={{
        background: "linear-gradient(135deg, hsl(var(--gold) / 0.12), hsl(var(--gold) / 0.04))",
        border: "1px solid hsl(var(--gold) / 0.2)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 2px 10px hsl(var(--gold) / 0.08)",
      }}
    >
      <Shield className="w-3 h-3 text-gold/60" />
      <span className="text-gold/70 text-[10px] font-heading tracking-[0.15em] uppercase leading-none">
        Admin Mode
      </span>
    </div>
  );
};

export default AdminDebugBadge;

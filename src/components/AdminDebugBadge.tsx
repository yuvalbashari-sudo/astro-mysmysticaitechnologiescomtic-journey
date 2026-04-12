import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { subscriptionManager } from "@/lib/subscriptionManager";

/**
 * Subtle floating ADMIN MODE indicator.
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
      className="fixed bottom-3 left-3 z-[99999] flex items-center gap-1.5 px-3 py-1.5 rounded-full pointer-events-none select-none"
      style={{
        background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.05))",
        border: "1px solid hsl(var(--gold) / 0.25)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 12px hsl(var(--gold) / 0.1)",
      }}
    >
      <Shield className="w-3.5 h-3.5 text-gold/70" />
      <span className="text-gold/80 text-[10px] font-heading tracking-widest uppercase">
        Admin Mode
      </span>
    </div>
  );
};

export default AdminDebugBadge;

import { useState, useEffect } from "react";
import { subscriptionManager } from "@/lib/subscriptionManager";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "yuvalbashari@gmail.com";

const AdminDebugBadge = () => {
  const [info, setInfo] = useState({ userEmail: "(loading...)", isAdmin: false, source: "" });

  useEffect(() => {
    const detect = async () => {
      // 1. Try Supabase auth session
      const { data } = await supabase.auth.getSession();
      const authEmail = data?.session?.user?.email;

      if (authEmail) {
        subscriptionManager.setUserEmail(authEmail);
        setInfo({
          userEmail: authEmail,
          isAdmin: subscriptionManager.isAdmin(),
          source: "auth",
        });
        return;
      }

      // 2. Check localStorage (set via console helper)
      const stored = subscriptionManager.getUserEmail();
      if (stored) {
        setInfo({
          userEmail: stored,
          isAdmin: subscriptionManager.isAdmin(),
          source: "localStorage",
        });
        return;
      }

      // 3. Dev fallback — auto-set admin email for testing
      subscriptionManager.setUserEmail(ADMIN_EMAIL);
      setInfo({
        userEmail: ADMIN_EMAIL,
        isAdmin: subscriptionManager.isAdmin(),
        source: "dev-fallback",
      });
    };

    detect();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email;
      if (email) {
        subscriptionManager.setUserEmail(email);
        setInfo({
          userEmail: email,
          isAdmin: subscriptionManager.isAdmin(),
          source: "auth",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        left: 8,
        zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        fontSize: 10,
        fontFamily: "monospace",
        padding: "6px 10px",
        borderRadius: 6,
        lineHeight: 1.5,
        pointerEvents: "none",
        maxWidth: 260,
        wordBreak: "break-all",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: 11 }}>
        {info.isAdmin ? "ADMIN MODE ✅" : "NOT ADMIN ❌"}
      </div>
      <div>user: {info.userEmail}</div>
      <div>admin: {ADMIN_EMAIL}</div>
      <div>src: {info.source}</div>
    </div>
  );
};

export default AdminDebugBadge;

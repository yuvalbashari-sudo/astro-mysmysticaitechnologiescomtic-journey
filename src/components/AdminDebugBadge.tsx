import { useState, useEffect } from "react";
import { subscriptionManager } from "@/lib/subscriptionManager";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "yuvalbashari@gmail.com";

const AdminDebugBadge = () => {
  const [info, setInfo] = useState({ userEmail: "(loading...)", isAdmin: false });

  useEffect(() => {
    const update = (email: string | null) => {
      setInfo({
        userEmail: email ?? "(not logged in)",
        isAdmin: subscriptionManager.isAdmin(),
      });
    };

    supabase.auth.getSession().then(({ data }) => {
      update(data?.session?.user?.email ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      update(session?.user?.email ?? null);
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
    </div>
  );
};

export default AdminDebugBadge;

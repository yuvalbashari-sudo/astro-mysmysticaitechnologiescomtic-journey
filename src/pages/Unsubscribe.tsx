import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }

    const validate = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        const data = await res.json();
        if (!res.ok) { setStatus("invalid"); return; }
        if (data.valid === false && data.reason === "already_unsubscribed") { setStatus("already"); return; }
        setStatus("valid");
      } catch {
        setStatus("invalid");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) { setStatus("success"); }
      else if (data?.reason === "already_unsubscribed") { setStatus("already"); }
      else { setStatus("error"); }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mystical-card p-10 max-w-md w-full text-center"
      >
        <div className="text-3xl text-gold mb-4">✦</div>

        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-gold mx-auto animate-spin" />
            <p className="text-foreground/70 font-body">Processing...</p>
          </div>
        )}

        {status === "valid" && (
          <div className="space-y-6">
            <h1 className="font-heading text-2xl gold-gradient-text">Unsubscribe</h1>
            <p className="text-foreground/70 font-body text-sm leading-relaxed">
              Are you sure you want to unsubscribe from our emails? You will no longer receive notifications from us.
            </p>
            <button onClick={handleUnsubscribe} className="btn-gold font-body w-full">
              Confirm Unsubscribe
            </button>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 text-gold mx-auto" />
            <h1 className="font-heading text-2xl gold-gradient-text">Unsubscribed</h1>
            <p className="text-foreground/70 font-body text-sm">
              You have been successfully unsubscribed. You will no longer receive emails from us.
            </p>
          </div>
        )}

        {status === "already" && (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 text-gold mx-auto" />
            <h1 className="font-heading text-2xl gold-gradient-text">Already Unsubscribed</h1>
            <p className="text-foreground/70 font-body text-sm">
              You have already been unsubscribed from our emails.
            </p>
          </div>
        )}

        {status === "invalid" && (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="font-heading text-2xl text-foreground">Invalid Link</h1>
            <p className="text-foreground/70 font-body text-sm">
              This unsubscribe link is invalid or has expired.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="font-heading text-2xl text-foreground">Something Went Wrong</h1>
            <p className="text-foreground/70 font-body text-sm">
              We couldn't process your request. Please try again later.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Unsubscribe;

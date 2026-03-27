import { motion, AnimatePresence } from "framer-motion";
import { Crown, Lock, X, Sparkles } from "lucide-react";
import { useLanguage, useT } from "@/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import type { GatingMessage } from "@/lib/entitlements";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gatingMessage: GatingMessage | null;
  /** Called when user confirms pay-per-use (placeholder until Stripe) */
  onPayPerUse?: () => void;
}

const PaymentGatingModal = ({ isOpen, onClose, gatingMessage, onPayPerUse }: Props) => {
  const { language, dir } = useLanguage();
  const t = useT();
  const navigate = useNavigate();

  if (!gatingMessage) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, hsl(222 32% 12%), hsl(222 42% 7%))",
              border: "1px solid hsl(var(--gold) / 0.2)",
              boxShadow: "0 0 60px hsl(var(--gold) / 0.08), 0 25px 50px hsl(0 0% 0% / 0.5)",
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            dir={dir}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 end-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-foreground/40 hover:text-gold transition-colors"
              style={{ background: "hsl(var(--gold) / 0.06)", border: "1px solid hsl(var(--gold) / 0.1)" }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top glow */}
            <div
              className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% -20%, hsl(var(--gold) / 0.08), transparent 70%)" }}
            />

            <div className="p-7 pt-10 flex flex-col items-center text-center">
              {/* Icon */}
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{
                  background: "radial-gradient(circle, hsl(var(--gold) / 0.12), hsl(var(--gold) / 0.04) 70%)",
                  border: "1px solid hsl(var(--gold) / 0.2)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 20px hsl(43 80% 55% / 0.1)",
                    "0 0 40px hsl(43 80% 55% / 0.2)",
                    "0 0 20px hsl(43 80% 55% / 0.1)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Lock className="w-6 h-6 text-gold/80" />
              </motion.div>

              {/* Message */}
              <p className="font-body text-foreground/80 text-sm leading-relaxed mb-7 max-w-xs">
                {lang === "he" ? gatingMessage.he : gatingMessage.en}
              </p>

              {/* Pay-per-use CTA */}
              <button
                onClick={() => {
                  onPayPerUse?.();
                  onClose();
                }}
                className="w-full btn-gold py-3.5 rounded-xl font-body font-bold text-sm tracking-wider mb-3 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {copy.payLabel} ₪{gatingMessage.priceILS}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 w-full my-2">
                <div className="flex-1 h-px bg-gold/10" />
                <span className="text-xs text-foreground/30 font-body">{copy.orLabel}</span>
                <div className="flex-1 h-px bg-gold/10" />
              </div>

              {/* Upgrade CTA */}
              <button
                onClick={() => {
                  onClose();
                  navigate("/upgrade");
                }}
                className="w-full py-3 rounded-xl font-body text-sm text-gold/80 hover:text-gold transition-colors flex items-center justify-center gap-2 mt-2"
                style={{
                  background: "hsl(var(--gold) / 0.05)",
                  border: "1px solid hsl(var(--gold) / 0.12)",
                }}
              >
                <Crown className="w-4 h-4" />
                {copy.subscribeLabel}
              </button>

              {/* Cancel */}
              <button
                onClick={onClose}
                className="mt-4 text-xs text-foreground/30 hover:text-foreground/50 transition-colors font-body"
              >
                {copy.cancelLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentGatingModal;

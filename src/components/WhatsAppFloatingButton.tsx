import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useT } from "@/i18n";

const WhatsAppFloatingButton = () => {
  const t = useT();

  return (
    <motion.button
      onClick={() => window.open("https://wa.me/972500000000?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%95%D7%93%20%D7%A2%D7%9C%20ASTROLOGAI", "_blank", "noopener,noreferrer")}
      className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all"
      style={{
        background: "linear-gradient(135deg, hsl(142 70% 40%), hsl(142 70% 32%))",
        boxShadow: "0 4px 20px hsl(142 70% 35% / 0.4)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: "spring" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={t.a11y_whatsapp_contact}
    >
      <MessageCircle className="w-6 h-6 text-white" aria-hidden="true" />
      <motion.div
        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gold"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        aria-hidden="true"
      />
    </motion.button>
  );
};

export default WhatsAppFloatingButton;

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Check, Facebook, Instagram, MessageCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useT } from "@/i18n/LanguageContext";

interface ShareResultSectionProps {
  symbol: string;
  title: string;
  subtitle?: string;
  quote?: string;
  /** If provided, the "Copy" button copies this text (the actual reading) instead of the share message */
  readingText?: string;
}

const ShareResultSection = ({ symbol, title, subtitle, quote, readingText }: ShareResultSectionProps) => {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const siteUrl = window.location.origin;

  const shareQuotes = [
    "✨ ASTROLOGAI ✨",
  ];
  const selectedQuote = quote || shareQuotes[0];
  const shareText = `${selectedQuote}\n\n${symbol} ${title}${subtitle ? ` — ${subtitle}` : ""}\n\n🔮 ${siteUrl}`;

  const handleWhatsApp = () => { window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank"); };
  const handleFacebook = () => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(shareText)}`, "_blank"); };
  const handleInstagram = () => { navigator.clipboard.writeText(shareText); toast(t.share_instagram_toast); };
  const handleCopyLink = async () => {
    const textToCopy = readingText || shareText;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000);
  };

  const shareButtons = [
    { label: t.share_whatsapp, icon: MessageCircle, onClick: handleWhatsApp, color: "142 70% 45%" },
    { label: t.share_instagram, icon: Instagram, onClick: handleInstagram, color: "330 70% 55%" },
    { label: t.share_facebook, icon: Facebook, onClick: handleFacebook, color: "220 70% 55%" },
    { label: copied ? t.share_copied : t.share_copy, icon: copied ? Check : Copy, onClick: handleCopyLink, color: "var(--gold)" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
      <div className="section-divider max-w-[200px] mx-auto mb-8" />
      <motion.div className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-6 text-center" style={{ background: "linear-gradient(145deg, hsl(222 50% 12%), hsl(240 40% 8%))", border: "1px solid hsl(var(--gold) / 0.2)", boxShadow: "0 0 40px hsl(var(--gold) / 0.08), inset 0 0 60px hsl(222 40% 15% / 0.3)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-2 left-4 text-[10px] opacity-20">✦</div>
          <div className="absolute top-6 right-8 text-[8px] opacity-15">⋆</div>
          <div className="absolute bottom-4 left-10 text-[8px] opacity-15">✧</div>
          <div className="absolute bottom-8 right-4 text-[10px] opacity-20">⋆</div>
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.06), transparent)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} />
        </div>
        <div className="relative z-10">
          <motion.div className="text-5xl mb-4" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }}>{symbol}</motion.div>
          <p className="font-heading text-sm md:text-base text-gold/90 mb-2 max-w-xs mx-auto leading-relaxed">"{selectedQuote}"</p>
          <p className="font-body text-[11px] text-foreground/40 mt-3">{symbol} {title}{subtitle ? ` — ${subtitle}` : ""}</p>
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <span className="text-[10px] text-gold/30 font-body tracking-widest uppercase">ASTROLOGAI</span>
            <span className="text-gold/20">✦</span>
          </div>
        </div>
      </motion.div>
      <h4 className="font-heading text-base md:text-lg text-gold text-center mb-2">{t.share_title}</h4>
      <p className="text-foreground/50 font-body text-xs text-center mb-5 max-w-sm mx-auto leading-relaxed">{t.share_subtitle}</p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {shareButtons.map((btn, i) => {
          const IconComp = btn.icon;
          return (
            <motion.button key={btn.label} onClick={btn.onClick} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.08 }} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-body transition-all" style={{ background: `linear-gradient(135deg, hsl(${btn.color} / 0.15), hsl(${btn.color} / 0.06))`, border: `1px solid hsl(${btn.color} / 0.25)`, color: `hsl(${btn.color})` }} whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.97 }}>
              <IconComp className="w-3.5 h-3.5" />{btn.label}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ShareResultSection;
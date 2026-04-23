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
      <motion.div
        className="relative overflow-hidden rounded-3xl p-7 md:p-9 mb-6 text-center"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, hsl(43 55% 18% / 0.35) 0%, transparent 55%), linear-gradient(155deg, hsl(222 50% 16%) 0%, hsl(240 45% 10%) 60%, hsl(260 40% 9%) 100%)",
          border: "1px solid hsl(var(--gold) / 0.42)",
          boxShadow:
            "0 20px 60px hsl(222 60% 2% / 0.6), 0 0 50px hsl(var(--gold) / 0.14), inset 0 1px 0 hsl(var(--gold) / 0.18), inset 0 0 80px hsl(222 40% 18% / 0.35)",
        }}
      >
        {/* Top hairline accent */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.65), transparent)",
          }}
        />
        {/* Ornamental corners */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-3 left-5 text-xs text-gold/40">✦</div>
          <div className="absolute top-7 right-9 text-[10px] text-gold/30">⋆</div>
          <div className="absolute bottom-5 left-10 text-[10px] text-gold/30">✧</div>
          <div className="absolute bottom-8 right-5 text-xs text-gold/40">⋆</div>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.10), transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10">
          {/* Brand wordmark — top, intentional */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="text-gold/50 text-sm">✦</span>
            <span
              className="font-heading uppercase"
              style={{
                fontSize: 12,
                letterSpacing: "0.32em",
                fontWeight: 600,
                background:
                  "linear-gradient(135deg, hsl(var(--gold-light)), hsl(var(--gold)), hsl(var(--gold-dark)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ASTROLOGAI
            </span>
            <span className="text-gold/50 text-sm">✦</span>
          </div>

          {/* Symbol — visual anchor */}
          <motion.div
            className="mb-4"
            style={{
              fontSize: 56,
              lineHeight: 1,
              filter: "drop-shadow(0 4px 18px hsl(var(--gold) / 0.35))",
            }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {symbol}
          </motion.div>

          {/* Quote — primary */}
          <p
            className="font-heading mx-auto"
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              maxWidth: 320,
              fontWeight: 500,
              background:
                "linear-gradient(180deg, hsl(43 90% 90%) 0%, hsl(43 80% 70%) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            "{selectedQuote}"
          </p>

          {/* Title — supporting */}
          <p
            className="font-body mt-5 mx-auto"
            style={{
              fontSize: 14,
              lineHeight: 1.5,
              color: "hsl(var(--foreground) / 0.78)",
              maxWidth: 300,
            }}
          >
            <span className="opacity-80 me-1">{symbol}</span>
            <span style={{ fontWeight: 600 }}>{title}</span>
            {subtitle ? <span className="text-foreground/55"> — {subtitle}</span> : null}
          </p>

          {/* Bottom hairline */}
          <div
            aria-hidden
            className="mx-auto mt-6 h-px"
            style={{
              maxWidth: 120,
              background:
                "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.5), transparent)",
            }}
          />
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
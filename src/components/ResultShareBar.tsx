import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useLanguage, useT } from "@/i18n/LanguageContext";

interface ResultShareBarProps {
  /** The full reading/result text to copy */
  resultText: string;
  /** Localized title line for the share message (e.g. "Daily Horoscope — Aries ♈") */
  shareTitle: string;
  /** Optional extra line for share context */
  shareSubtitle?: string;
  /** Compact layout for tight spaces */
  compact?: boolean;
}

const SHARE_CTA: Record<string, string> = {
  he: "בדקו גם:",
  en: "Check yours:",
  ru: "Узнайте своё:",
  ar: "اكتشف نتيجتك:",
};

const SHARE_HEADER: Record<string, string> = {
  he: "התוצאה שלי ✨",
  en: "My result ✨",
  ru: "Мой результат ✨",
  ar: "نتيجتي ✨",
};

const DOMAIN = "myastrologai.com";

/**
 * Unified copy + share bar for all result screens.
 * Uses navigator.share when available, falls back to clipboard copy.
 */
const ResultShareBar = ({ resultText, shareTitle, shareSubtitle, compact }: ResultShareBarProps) => {
  const { language } = useLanguage();
  const t = useT();
  const [copied, setCopied] = useState(false);

  const buildShareText = useCallback(() => {
    const header = SHARE_HEADER[language] || SHARE_HEADER.en;
    const cta = SHARE_CTA[language] || SHARE_CTA.en;
    const titleLine = shareSubtitle ? `${shareTitle} — ${shareSubtitle}` : shareTitle;
    return `${header}\n\n${titleLine}\n\n${cta}\n${DOMAIN}`;
  }, [language, shareTitle, shareSubtitle]);

  const handleCopy = useCallback(async () => {
    if (!resultText) return;
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      toast(t.share_copy_toast);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  }, [resultText, t.share_copy_toast]);

  const handleShare = useCallback(async () => {
    const shareText = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        // User cancelled or error — fall through to copy
      }
    }
    // Fallback: copy share text
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast(t.share_copy_toast);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [buildShareText, t.share_copy_toast]);

  const btnSize = compact ? "px-4 py-2 text-xs gap-1.5" : "px-5 py-2.5 text-sm gap-2";
  const iconSize = compact ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {/* Share */}
      <motion.button
        onClick={handleShare}
        className={`flex items-center rounded-full font-body transition-all ${btnSize}`}
        style={{
          background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))",
          border: "1px solid hsl(142 70% 45% / 0.3)",
          color: "hsl(142 70% 60%)",
          backdropFilter: "blur(8px)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        <Share2 className={iconSize} />
        {t.result_share}
      </motion.button>

      {/* Copy */}
      <motion.button
        onClick={handleCopy}
        className={`flex items-center rounded-full font-body transition-all ${btnSize}`}
        style={{
          background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))",
          border: "1px solid hsl(var(--gold) / 0.2)",
          color: "hsl(var(--gold))",
          backdropFilter: "blur(8px)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        {copied ? <Check className={iconSize} /> : <Copy className={iconSize} />}
        {copied ? t.share_copied : t.share_copy}
      </motion.button>
    </div>
  );
};

export default ResultShareBar;

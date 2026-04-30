import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2, Lock, Share2, Copy, Check } from "lucide-react";
import { useReadingContext } from "@/contexts/ReadingContext";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { readingsStorage } from "@/lib/readingsStorage";
import { mysticalProfile } from "@/lib/mysticalProfile";
import norielleAvatar from "@/assets/astrologer-avatar-cta.png";
import TextSizeControl from "@/components/TextSizeControl";
import { useFontScale } from "@/contexts/FontScaleContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  source?: "button" | "text";
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  forceRightAnchor?: boolean;
}

const FREE_MESSAGE_LIMIT = 5;

const AdvisorChatPanel = ({ isOpen, onClose, forceRightAnchor = false }: Props) => {
  const t = useT();
  const { language, dir } = useLanguage();
  const { activeReading } = useReadingContext();
  const { scale, setScale } = useFontScale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const assistantTextRef = useRef("");

  // Reset chat when reading changes
  useEffect(() => {
    setMessages([]);
    setInput("");
    setUserMessageCount(0);
  }, [activeReading?.type, activeReading?.summary]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Determine reading category for dynamic suggestions
  const readingCategory = useMemo(() => {
    if (!activeReading) return null;
    const type = activeReading.type;
    if (type === "tarot" || type === "dailyCard" || type === "tarotWorld") return "tarot";
    if (type === "forecast" || type === "rising" || type === "birthChart" || type === "astrologer" || type === "astrocartography") return "astrology";
    if (type === "compatibility") return "compatibility";
    if (type === "palm") return "palm";
    return null;
  }, [activeReading]);

  // Dynamic suggestion chips based on reading type
  const suggestions = useMemo(() => {
    if (!activeReading) return [];
    switch (readingCategory) {
      case "tarot":
        return [t.advisor_tarot_s1, t.advisor_tarot_s2, t.advisor_tarot_s3, t.advisor_tarot_s4];
      case "astrology":
        return [t.advisor_astro_s1, t.advisor_astro_s2, t.advisor_astro_s3, t.advisor_astro_s4];
      case "compatibility":
        return [t.advisor_compat_s1, t.advisor_compat_s2, t.advisor_compat_s3, t.advisor_compat_s4];
      case "palm":
        return [t.advisor_palm_s1, t.advisor_palm_s2, t.advisor_palm_s3, t.advisor_palm_s4];
      default:
        return [t.advisor_suggestion_1, t.advisor_suggestion_2, t.advisor_suggestion_3];
    }
  }, [readingCategory, t]);

  // Dynamic welcome message based on reading type
  const welcomeMessage = useMemo(() => {
    if (!activeReading) return t.advisor_welcome_guide || t.advisor_welcome_general;
    switch (readingCategory) {
      case "tarot": return t.advisor_welcome_tarot;
      case "astrology": return t.advisor_welcome_astrology;
      case "compatibility": return t.advisor_welcome_compatibility;
      case "palm": return t.advisor_welcome_palm;
      default: return t.advisor_welcome_context;
    }
  }, [readingCategory, activeReading, t]);

  const isLimitReached = userMessageCount >= FREE_MESSAGE_LIMIT;

  // Subtle writing-guidance example shown on focus
  const writingHint = useMemo(() => {
    // In guide mode, use the recommendation-oriented hint
    if (!activeReading && t.advisor_guide_hint) return t.advisor_guide_hint;
    const map: Record<string, string> = {
      he: "למשל: האם אני בדרך הנכונה בזוגיות שלי?",
      en: "For example: Am I on the right path in my relationship?",
      ru: "Например: я на правильном пути в моих отношениях?",
      ar: "مثلاً: هل أنا على الطريق الصحيح في علاقتي؟",
    };
    return map[language] || map.en;
  }, [language, activeReading, t]);

  // Guide-mode chip handler: dispatches a global event so the homepage hero
  // can react (deep-link to the right entry), and falls back to scroll+close.
  const handleGuideChip = useCallback(
    (feature: "astrology" | "tarot") => {
      try {
        window.dispatchEvent(
          new CustomEvent("astrologai:open-feature", { detail: { feature } })
        );
      } catch { /* ignore */ }
      // Smooth-scroll to top so the hero entry points are visible, then close.
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch { /* ignore */ }
      onClose();
    },
    [onClose]
  );

  const sendMessage = async (prefilledText?: string) => {
    const text = (prefilledText ?? input).trim();
    if (!text || isStreaming || isLimitReached) return;

    const isButtonClick = !!prefilledText;
    const userMsg: Message = { role: "user", content: text, source: isButtonClick ? "button" : "text" };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setUserMessageCount(prev => prev + 1);
    setIsStreaming(true);
    assistantTextRef.current = "";

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mystical-advisor`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content, source: m.source })),
          readingContext: activeReading,
          readingsHistory: readingsStorage.getAll().slice(0, 10).map(r => ({
            type: r.type,
            title: r.title,
            subtitle: r.subtitle,
            date: r.date,
          })),
          language,
          userName: mysticalProfile.getUserName() || undefined,
          userGender: mysticalProfile.autoDetectAndRecordGender(text) || undefined,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "Error" }));
        // Never show raw server error strings (variable names, stack traces, etc.) to the user.
        // Surface a localized fallback message; log the raw error for developers only.
        if (errData?.error) console.warn("[advisor] server error:", errData.error);
        setMessages(prev => [...prev, { role: "assistant", content: t.advisor_error }]);
        setIsStreaming(false);
        return;
      }

      if (!resp.body) {
        setIsStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      // Add empty assistant message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantTextRef.current += content;
              const updatedText = assistantTextRef.current;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: updatedText };
                return copy;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush remaining
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantTextRef.current += content;
              const updatedText = assistantTextRef.current;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: updatedText };
                return copy;
              });
            }
          } catch { /* ignore */ }
        }
      }

      setIsStreaming(false);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: t.advisor_error }]);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Simple markdown renderer for assistant messages
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<div key={i} className="h-2" />);
        return;
      }
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4 key={i} className="font-heading text-base text-gold mt-3 mb-1">
            {renderInline(trimmed.slice(4))}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith("## ")) {
        elements.push(
          <h3 key={i} className="font-heading text-lg text-gold mt-3 mb-1">
            {renderInline(trimmed.slice(3))}
          </h3>
        );
        return;
      }
      if (/^[-•*]\s/.test(trimmed)) {
        elements.push(
          <div key={i} className="flex gap-2 items-start">
            <span className="text-gold/50 mt-0.5 flex-shrink-0">•</span>
            <span>{renderInline(trimmed.replace(/^[-•*]\s/, ""))}</span>
          </div>
        );
        return;
      }
      if (/^\d+[.)]\s/.test(trimmed)) {
        const num = trimmed.match(/^(\d+)[.)]\s/)?.[1];
        elements.push(
          <div key={i} className="flex gap-2 items-start">
            <span className="text-gold/50 mt-0.5 flex-shrink-0 text-sm min-w-[1.25rem] text-center">{num}.</span>
            <span>{renderInline(trimmed.replace(/^\d+[.)]\s/, ""))}</span>
          </div>
        );
        return;
      }
      elements.push(<p key={i}>{renderInline(trimmed)}</p>);
    });

    return <div className="space-y-1">{elements}</div>;
  };

  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*|__(.+?)__|_(.+?)_|\*(.+?)\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      if (match[1] || match[2]) {
        parts.push(<strong key={match.index} className="text-gold/90 font-semibold">{match[1] || match[2]}</strong>);
      } else if (match[3] || match[4]) {
        parts.push(<em key={match.index}>{match[3] || match[4]}</em>);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  const placeholderText = activeReading
    ? t.advisor_placeholder_context
    : (t.advisor_guide_placeholder || t.advisor_placeholder_general);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={`fixed inset-0 ${forceRightAnchor ? "z-[205]" : "z-[105]"} bg-background/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none md:pointer-events-none`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Chat Panel */}
          <motion.div
            className={`fixed ${forceRightAnchor ? "z-[206]" : "z-[106]"} flex flex-col overflow-hidden ${forceRightAnchor ? "advisor-text-2x" : ""}`}
            style={{
              bottom: forceRightAnchor ? (window.innerWidth < 768 ? "0px" : "60px") : "5.5rem",
              right: forceRightAnchor ? (window.innerWidth < 768 ? "0px" : "5px") : dir === "rtl" ? "auto" : "1.25rem",
              left: forceRightAnchor ? (window.innerWidth < 768 ? "0px" : "auto") : dir === "rtl" ? "1.25rem" : "auto",
              width: forceRightAnchor ? (window.innerWidth < 768 ? "100vw" : "min(685px, calc(100vw - 2rem - 80px))") : "min(765px, calc(100vw - 2rem))",
              maxHeight: forceRightAnchor ? (window.innerWidth < 768 ? "calc(100vh - 60px)" : "min(600px, calc(100vh - 200px))") : "min(1080px, calc(100vh - 7rem))",
              borderRadius: forceRightAnchor && window.innerWidth < 768 ? "1.75rem 1.75rem 0 0" : "1.5rem",
              background:
                "linear-gradient(165deg, hsl(225 50% 9% / 0.92) 0%, hsl(228 55% 5% / 0.96) 55%, hsl(230 60% 4% / 0.97) 100%)",
              backdropFilter: "blur(32px) saturate(1.4)",
              WebkitBackdropFilter: "blur(32px) saturate(1.4)",
              border: "1px solid hsl(var(--gold) / 0.22)",
              boxShadow:
                "0 24px 70px hsl(0 0% 0% / 0.55), 0 0 0 1px hsl(var(--gold) / 0.04), 0 0 60px hsl(var(--gold) / 0.08), inset 0 1px 0 hsl(var(--gold) / 0.12)",
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            dir={dir}
            role="dialog"
            aria-label={t.advisor_title}
            aria-modal="true"
          >
            {/* Decorative top edge glow — premium mystical accent */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 pointer-events-none"
              style={{
                height: 1,
                background:
                  "linear-gradient(90deg, transparent 0%, hsl(var(--gold) / 0.6) 50%, transparent 100%)",
              }}
            />

            {/* Header */}
            <div
              className="flex flex-col items-center px-6 pt-4 pb-5 flex-shrink-0 relative"
              style={{
                borderBottom: "1px solid hsl(var(--gold) / 0.1)",
                background:
                  "linear-gradient(180deg, hsl(var(--gold) / 0.04) 0%, transparent 100%)",
              }}
            >
              <h3
                className="font-heading text-base md:text-lg leading-tight text-center px-12"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(43 95% 88%) 0%, hsl(43 80% 60%) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "0.02em",
                }}
              >
                {t.advisor_title}
              </h3>
              {activeReading && (
                <p className="text-[11px] text-foreground/45 font-body truncate max-w-full px-12 mt-1">{activeReading.label}</p>
              )}
              <div className="mt-4 scale-90 origin-top">
                <TextSizeControl value={scale} onChange={setScale} />
              </div>
              <button
                onClick={onClose}
                className={`absolute top-3 ${dir === "rtl" ? "left-3" : "right-3"} w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-gold/40 flex-shrink-0`}
                style={{ border: "1px solid hsl(var(--gold) / 0.1)" }}
                aria-label={t.a11y_close_modal}
              >
                <X className="w-4.5 h-4.5 text-foreground/60" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-5 min-h-0"
              style={{ scrollBehavior: "smooth" }}
              role="log"
              aria-live="polite"
            >
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-7">
                  <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                    {/* Ambient cosmic aura — soft blue/purple atmospheric glow */}
                    <motion.div
                      aria-hidden
                      className="absolute -inset-6 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, hsl(255 70% 55% / 0.14) 0%, hsl(225 80% 45% / 0.1) 40%, transparent 72%)",
                        filter: "blur(8px)",
                      }}
                      animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.06, 1] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* Soft golden halo — refined, not flashy */}
                    <motion.div
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, hsl(var(--gold) / 0.18) 0%, hsl(var(--gold) / 0.05) 50%, transparent 78%)",
                      }}
                      animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.04, 1] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* Slowly rotating mystical ring — thinner */}
                    <motion.div
                      aria-hidden
                      className="absolute rounded-full"
                      style={{
                        inset: "4%",
                        border: "1px solid hsl(var(--gold) / 0.18)",
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Norielle portrait — refined thin frame */}
                    <motion.div
                      className="relative rounded-full overflow-hidden"
                      style={{
                        width: 152,
                        height: 152,
                        border: "1px solid hsl(var(--gold) / 0.42)",
                        background: "hsl(225 50% 8%)",
                      }}
                      animate={{
                        boxShadow: [
                          "0 0 18px hsl(var(--gold) / 0.22), 0 0 38px hsl(255 70% 50% / 0.12), inset 0 1px 0 hsl(43 100% 90% / 0.22), inset 0 0 24px hsl(43 90% 60% / 0.08)",
                          "0 0 26px hsl(var(--gold) / 0.32), 0 0 52px hsl(255 70% 50% / 0.18), inset 0 1px 0 hsl(43 100% 90% / 0.22), inset 0 0 30px hsl(43 90% 60% / 0.12)",
                          "0 0 18px hsl(var(--gold) / 0.22), 0 0 38px hsl(255 70% 50% / 0.12), inset 0 1px 0 hsl(43 100% 90% / 0.22), inset 0 0 24px hsl(43 90% 60% / 0.08)",
                        ],
                      }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <img
                        src={norielleAvatar}
                        alt="Norielle"
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      {/* Subtle inner light from below (warm) */}
                      <div
                        aria-hidden
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(circle at 50% 105%, hsl(43 90% 65% / 0.22) 0%, transparent 55%)",
                        }}
                      />
                      {/* Slow shimmer sweep across the portrait */}
                      <motion.div
                        aria-hidden
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(115deg, transparent 35%, hsl(43 100% 92% / 0.14) 50%, transparent 65%)",
                          mixBlendMode: "screen",
                        }}
                        animate={{ x: ["-60%", "60%"] }}
                        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                      />
                    </motion.div>
                  </div>
                  <p
                    className="font-body mx-auto whitespace-pre-line"
                    style={{
                      color: "hsl(var(--foreground) / 0.82)",
                      fontSize: "16px",
                      lineHeight: 1.9,
                      maxWidth: 520,
                      letterSpacing: "0.005em",
                    }}
                  >
                    {welcomeMessage}
                  </p>
                  {/* Guide mode (no active reading): elegant 2-option chips */}
                  {!activeReading && (
                    <div className="flex flex-wrap gap-3 justify-center mt-6 px-2" dir={dir}>
                      {([
                        { feature: "astrology" as const, label: t.advisor_guide_chip_astrology, glyph: "✦" },
                        { feature: "tarot" as const, label: t.advisor_guide_chip_tarot, glyph: "🜂" },
                      ]).map((opt) => (
                        <motion.button
                          key={opt.feature}
                          onClick={() => handleGuideChip(opt.feature)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.97 }}
                          className="font-heading focus:outline-none focus:ring-2 focus:ring-gold/40"
                          style={{
                            minWidth: 138,
                            padding: "12px 22px",
                            borderRadius: 999,
                            background:
                              "linear-gradient(135deg, hsl(var(--gold) / 0.16) 0%, hsl(var(--gold) / 0.06) 100%)",
                            border: "1px solid hsl(var(--gold) / 0.42)",
                            color: "hsl(43 95% 82%)",
                            fontSize: 15,
                            letterSpacing: "0.02em",
                            boxShadow:
                              "0 6px 20px hsl(0 0% 0% / 0.3), 0 0 18px hsl(var(--gold) / 0.12), inset 0 1px 0 hsl(var(--gold) / 0.18)",
                          }}
                        >
                          <span className="opacity-70 me-2" aria-hidden>{opt.glyph}</span>
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {activeReading && suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 justify-center mt-5 px-2">
                      {suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => void sendMessage(suggestion)}
                          disabled={isStreaming || isLimitReached}
                          className="text-sm px-4 py-2.5 rounded-full font-body transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-40 disabled:hover:scale-100 text-start leading-snug"
                          style={{
                            background: "hsl(var(--gold) / 0.08)",
                            border: "1px solid hsl(var(--gold) / 0.18)",
                            color: "hsl(var(--gold) / 0.85)",
                            maxWidth: "100%",
                            wordBreak: "break-word",
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-4 font-body text-base leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-md"
                        : "rounded-bl-md"
                    }`}
                    style={
                      msg.role === "user"
                        ? {
                            background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                            color: "hsl(var(--primary-foreground))",
                          }
                        : {
                            background: "hsl(var(--deep-blue-light) / 0.5)",
                            border: "1px solid hsl(var(--gold) / 0.08)",
                            color: "hsl(var(--foreground) / 0.85)",
                          }
                    }
                    dir={dir}
                  >
                    {msg.content
                      ? (msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content)
                      : <Loader2 className="w-5 h-5 animate-spin text-gold/50" />
                    }
                  </div>
                </div>
              ))}

              {/* Share/Copy actions — only when advisor answers exist */}
              {messages.some(m => m.role === "assistant" && m.content) && !isStreaming && (
                <AdvisorShareActions messages={messages} dir={dir} />
              )}

              {/* Limit reached banner */}
              {isLimitReached && !isStreaming && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-5 text-center space-y-4"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--gold) / 0.06), hsl(var(--crimson) / 0.04))",
                    border: "1px solid hsl(var(--gold) / 0.15)",
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5 text-gold/60" />
                    <p className="text-foreground/50 font-body text-sm leading-relaxed">
                      {t.advisor_limit_reached}
                    </p>
                  </div>
                  <button
                    className="text-sm px-5 py-2.5 rounded-full font-heading transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold/40"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                      color: "hsl(var(--primary-foreground))",
                      boxShadow: "0 4px 15px hsl(var(--gold) / 0.2)",
                    }}
                  >
                    {t.advisor_upgrade_cta}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div
              className="flex-shrink-0 px-5 pt-4 pb-5"
              style={{
                borderTop: "1px solid hsl(var(--gold) / 0.1)",
                background:
                  "linear-gradient(0deg, hsl(228 60% 4% / 0.6) 0%, transparent 100%)",
              }}
            >
              <motion.div
                className={`flex items-center gap-2 rounded-2xl pl-3 pr-2 py-2 transition-all ${isLimitReached ? "opacity-40 pointer-events-none" : ""}`}
                animate={{
                  borderColor: inputFocused
                    ? "hsl(var(--gold) / 0.65)"
                    : "hsl(var(--gold) / 0.28)",
                  boxShadow: inputFocused
                    ? "0 0 0 3px hsl(var(--gold) / 0.14), 0 0 32px hsl(var(--gold) / 0.32), 0 6px 22px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(var(--gold) / 0.14)"
                    : "0 4px 18px hsl(0 0% 0% / 0.35), 0 0 18px hsl(var(--gold) / 0.08), inset 0 1px 0 hsl(var(--gold) / 0.1)",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  background:
                    "linear-gradient(180deg, hsl(225 50% 10% / 0.96) 0%, hsl(228 55% 6% / 0.98) 100%)",
                  border: "1px solid",
                  minHeight: 60,
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={placeholderText}
                  disabled={isStreaming || isLimitReached}
                  className="flex-1 bg-transparent font-body outline-none focus:ring-0 px-2 placeholder:text-foreground/40"
                  style={{
                    fontSize: 16,
                    lineHeight: 1.5,
                    letterSpacing: "0.005em",
                    color: "hsl(var(--foreground) / 0.95)",
                  }}
                  dir={dir}
                  aria-label={placeholderText}
                />
                <motion.button
                  onClick={() => void sendMessage()}
                  disabled={!input.trim() || isStreaming || isLimitReached}
                  whileTap={{ scale: 0.94 }}
                  className="relative w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-gold/40 flex-shrink-0"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--gold-dark)) 100%)"
                      : "hsl(var(--gold) / 0.1)",
                    border: input.trim()
                      ? "1px solid hsl(var(--gold) / 0.5)"
                      : "1px solid hsl(var(--gold) / 0.18)",
                    boxShadow: input.trim()
                      ? "0 4px 16px hsl(var(--gold) / 0.35), inset 0 1px 0 hsl(43 100% 90% / 0.4)"
                      : "none",
                  }}
                  aria-label={t.advisor_send}
                >
                  {isStreaming ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gold/70" />
                  ) : (
                    <Send
                      className="w-4 h-4"
                      strokeWidth={2.4}
                      style={{
                        color: input.trim()
                          ? "hsl(var(--primary-foreground))"
                          : "hsl(var(--gold) / 0.5)",
                        transform: dir === "rtl" ? "scaleX(-1)" : undefined,
                      }}
                    />
                  )}
                </motion.button>
              </motion.div>

              {/* Subtle writing-guidance hint — only on focus when empty */}
              <AnimatePresence>
                {inputFocused && !input.trim() && !isLimitReached && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="font-body mt-2.5 px-2 text-center"
                    style={{
                      fontSize: 12.5,
                      color: "hsl(var(--gold) / 0.55)",
                      letterSpacing: "0.01em",
                    }}
                    dir={dir}
                  >
                    {writingHint}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ── Share/Copy Actions Sub-component ── */
const AdvisorShareActions = ({ messages, dir }: { messages: Message[]; dir: string }) => {
  const [copied, setCopied] = useState(false);
  const t = useT();

  const answersText = useMemo(() => {
    return messages
      .filter(m => m.role === "assistant" && m.content)
      .map(m => m.content)
      .join("\n\n");
  }, [messages]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(answersText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = answersText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [answersText]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: answersText });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  }, [answersText, handleCopy]);

  return (
    <motion.div
      className="flex items-center justify-center gap-3 pt-3 pb-1 flex-wrap"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      dir={dir}
    >
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold/30 whitespace-nowrap"
        style={{
          background: "hsl(var(--gold) / 0.08)",
          border: "1px solid hsl(var(--gold) / 0.15)",
          color: "hsl(var(--gold) / 0.7)",
        }}
      >
        <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{t.advisor_share}</span>
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold/30 whitespace-nowrap"
        style={{
          background: "hsl(var(--gold) / 0.08)",
          border: "1px solid hsl(var(--gold) / 0.15)",
          color: "hsl(var(--gold) / 0.7)",
        }}
      >
        {copied ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
        <span>{copied ? t.advisor_copied : t.advisor_copy}</span>
      </button>
    </motion.div>
  );
};

export default AdvisorChatPanel;

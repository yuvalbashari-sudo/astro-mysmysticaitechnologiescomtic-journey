import { useState, useRef, useEffect, useMemo } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2, Lock } from "lucide-react";
import { useReadingContext } from "@/contexts/ReadingContext";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { readingsStorage } from "@/lib/readingsStorage";

interface Message {
  role: "user" | "assistant";
  content: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
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
    if (type === "forecast" || type === "rising" || type === "birthChart" || type === "astrologer") return "astrology";
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
    if (!activeReading) return t.advisor_welcome_general;
    switch (readingCategory) {
      case "tarot": return t.advisor_welcome_tarot;
      case "astrology": return t.advisor_welcome_astrology;
      case "compatibility": return t.advisor_welcome_compatibility;
      case "palm": return t.advisor_welcome_palm;
      default: return t.advisor_welcome_context;
    }
  }, [readingCategory, activeReading, t]);

  const isLimitReached = userMessageCount >= FREE_MESSAGE_LIMIT;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming || isLimitReached) return;

    const userMsg: Message = { role: "user", content: text };
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
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          readingContext: activeReading,
          readingsHistory: readingsStorage.getAll().slice(0, 10).map(r => ({
            type: r.type,
            title: r.title,
            subtitle: r.subtitle,
            date: r.date,
          })),
          language,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "Error" }));
        setMessages(prev => [...prev, { role: "assistant", content: errData.error || t.advisor_error }]);
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

  const placeholderText = activeReading ? t.advisor_placeholder_context : t.advisor_placeholder_general;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[105] bg-background/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none md:pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Chat Panel */}
          <motion.div
            className="fixed z-[106] flex flex-col overflow-hidden"
            style={{
              bottom: forceRightAnchor ? "calc(5.5rem + 500px)" : "5.5rem",
              right: forceRightAnchor ? "1.25rem" : dir === "rtl" ? "auto" : "1.25rem",
              left: forceRightAnchor ? "auto" : dir === "rtl" ? "1.25rem" : "auto",
              width: "min(765px, calc(100vw - 2rem))",
              maxHeight: "min(1080px, calc(100vh - 7rem))",
              background: "linear-gradient(170deg, hsl(222 47% 9% / 0.90), hsl(222 47% 5% / 0.94))",
              backdropFilter: "blur(28px) saturate(1.3)",
              WebkitBackdropFilter: "blur(28px) saturate(1.3)",
              border: "1px solid hsl(var(--gold) / 0.14)",
              borderRadius: "1.25rem",
              boxShadow: "0 16px 50px hsl(0 0% 0% / 0.5), 0 0 24px hsl(var(--gold) / 0.05), inset 0 1px 0 hsl(var(--gold) / 0.07)",
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
            {/* Header */}
            <div
              className="flex items-center justify-between px-8 py-5 flex-shrink-0"
              style={{
                borderBottom: "1px solid hsl(var(--gold) / 0.08)",
                background: "linear-gradient(135deg, hsl(var(--gold) / 0.03), transparent)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                    boxShadow: "0 0 14px hsl(var(--gold) / 0.3)",
                  }}
                >
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-heading text-base text-gold">{t.advisor_title}</h3>
                  {activeReading && (
                    <p className="text-sm text-foreground/40 font-body mt-0.5">{activeReading.label}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-foreground/8 focus:outline-none focus:ring-2 focus:ring-gold/30"
                aria-label={t.a11y_close_modal}
              >
                <X className="w-5 h-5 text-foreground/50" />
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
                <div className="text-center py-10 space-y-4">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--gold) / 0.1), hsl(var(--gold) / 0.05))",
                      border: "1px solid hsl(var(--gold) / 0.12)",
                    }}
                  >
                    <Sparkles className="w-9 h-9 text-gold/50" />
                  </div>
                  <p className="text-foreground/40 font-body text-base leading-relaxed max-w-[500px] mx-auto">
                    {welcomeMessage}
                  </p>
                  {activeReading && suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 justify-center mt-4">
                      {suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                          className="text-sm px-4 py-2 rounded-full font-body transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold/30"
                          style={{
                            background: "hsl(var(--gold) / 0.06)",
                            border: "1px solid hsl(var(--gold) / 0.1)",
                            color: "hsl(var(--gold) / 0.6)",
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
              className="flex-shrink-0 px-6 py-5"
              style={{ borderTop: "1px solid hsl(var(--gold) / 0.06)" }}
            >
              <div
                className={`flex items-center gap-3 rounded-xl px-5 py-3 transition-opacity ${isLimitReached ? "opacity-40 pointer-events-none" : ""}`}
                style={{
                  background: "hsl(var(--deep-blue-light) / 0.3)",
                  border: "1px solid hsl(var(--gold) / 0.08)",
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholderText}
                  disabled={isStreaming || isLimitReached}
                  className="flex-1 bg-transparent text-base font-body text-foreground/80 placeholder:text-foreground/25 outline-none focus:ring-0"
                  dir={dir}
                  aria-label={placeholderText}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming || isLimitReached}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-gold/30"
                  style={{
                    background: input.trim() ? "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))" : "transparent",
                  }}
                  aria-label={t.advisor_send}
                >
                  {isStreaming ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gold/60" />
                  ) : (
                    <Send className="w-4.5 h-4.5 text-primary-foreground" style={{ transform: dir === "rtl" ? "scaleX(-1)" : undefined }} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdvisorChatPanel;

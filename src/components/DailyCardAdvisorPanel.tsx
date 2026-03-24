import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2, Lock, Share2, Copy, Check } from "lucide-react";
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
}

const FREE_MESSAGE_LIMIT = 5;

const QUICK_QUESTIONS = [
  "מה המסר המרכזי של הקלף?",
  "איך זה משפיע על הזוגיות שלי?",
  "מה עליי לעשות היום?",
  "מה עליי להיזהר ממנו?",
  "איזה הזדמנות מסתתרת כאן?",
  "מה הקלף אומר על העתיד הקרוב?",
];

const DailyCardAdvisorPanel = ({ isOpen, onClose }: Props) => {
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setMessages([]);
    setInput("");
    setUserMessageCount(0);
  }, [activeReading?.type, activeReading?.summary]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  const isLimitReached = userMessageCount >= FREE_MESSAGE_LIMIT;

  const sendMessage = useCallback(async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || isStreaming || isLimitReached) return;

    const userMsg: Message = { role: "user", content: msgText };
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
            type: r.type, title: r.title, subtitle: r.subtitle, date: r.date,
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

      if (!resp.body) { setIsStreaming(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

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
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: t.advisor_error }]);
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, isLimitReached, activeReading, language, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === "Escape") onClose();
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) { elements.push(<div key={i} className="h-4" />); return; }
      if (trimmed.startsWith("### ")) {
        elements.push(<h4 key={i} className="font-heading text-3xl text-gold mt-4 mb-2">{renderInline(trimmed.slice(4))}</h4>);
        return;
      }
      if (trimmed.startsWith("## ")) {
        elements.push(<h3 key={i} className="font-heading text-4xl text-gold mt-4 mb-2">{renderInline(trimmed.slice(3))}</h3>);
        return;
      }
      if (/^[-•*]\s/.test(trimmed)) {
        elements.push(
          <div key={i} className="flex gap-3 items-start text-2xl leading-relaxed">
            <span className="text-gold/50 mt-1 flex-shrink-0">•</span>
            <span>{renderInline(trimmed.replace(/^[-•*]\s/, ""))}</span>
          </div>
        );
        return;
      }
      if (/^\d+[.)]\s/.test(trimmed)) {
        const num = trimmed.match(/^(\d+)[.)]\s/)?.[1];
        elements.push(
          <div key={i} className="flex gap-3 items-start text-2xl leading-relaxed">
            <span className="text-gold/50 mt-1 flex-shrink-0 min-w-[2rem] text-center">{num}.</span>
            <span>{renderInline(trimmed.replace(/^\d+[.)]\s/, ""))}</span>
          </div>
        );
        return;
      }
      elements.push(<p key={i} className="text-2xl leading-relaxed">{renderInline(trimmed)}</p>);
    });
    return <div className="space-y-2">{elements}</div>;
  };

  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*|__(.+?)__|_(.+?)_|\*(.+?)\*/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
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

  // ── MOBILE: bottom drawer ──
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[200]"
              style={{ background: "hsl(0 0% 0% / 0.5)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed z-[201] flex flex-col overflow-hidden"
              style={{
                bottom: 0, left: 0, right: 0,
                height: "70vh",
                borderRadius: "1.25rem 1.25rem 0 0",
                background: "linear-gradient(170deg, hsl(222 47% 9% / 0.96), hsl(222 47% 5% / 0.98))",
                border: "1px solid hsl(var(--gold) / 0.14)",
                borderBottom: "none",
                boxShadow: "0 -8px 40px hsl(0 0% 0% / 0.5), 0 0 20px hsl(var(--gold) / 0.05)",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              dir={dir}
              role="dialog"
              aria-label={t.advisor_title}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: "hsl(var(--foreground) / 0.2)" }} />
              </div>
              {renderPanelContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ── DESKTOP: fixed left side panel ──
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed z-[200] flex flex-col overflow-hidden"
          style={{
            top: 0, left: 0, bottom: 0,
            width: "680px",
            background: "linear-gradient(170deg, hsl(222 47% 9% / 0.95), hsl(222 47% 5% / 0.98))",
            borderRight: dir === "rtl" ? "none" : "1px solid hsl(var(--gold) / 0.12)",
            borderLeft: dir === "rtl" ? "1px solid hsl(var(--gold) / 0.12)" : "none",
            boxShadow: dir === "rtl"
              ? "-4px 0 30px hsl(0 0% 0% / 0.4), 0 0 16px hsl(var(--gold) / 0.04)"
              : "4px 0 30px hsl(0 0% 0% / 0.4), 0 0 16px hsl(var(--gold) / 0.04)",
          }}
          initial={{ x: dir === "rtl" ? "100%" : "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: dir === "rtl" ? "100%" : "-100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 34 }}
          dir={dir}
          role="dialog"
          aria-label={t.advisor_title}
        >
          {renderPanelContent()}
        </motion.div>
      )}
    </AnimatePresence>
  );

  function renderPanelContent() {
    return (
      <>
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-6 flex-shrink-0"
          style={{
            borderBottom: "1px solid hsl(var(--gold) / 0.1)",
            background: "linear-gradient(135deg, hsl(var(--gold) / 0.04), transparent)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                boxShadow: "0 0 16px hsl(var(--gold) / 0.3)",
              }}
            >
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-heading text-2xl text-gold">{t.advisor_title}</h3>
              {activeReading && (
                <p className="text-lg text-foreground/40 font-body mt-1 truncate max-w-[400px]">{activeReading.label}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors hover:bg-foreground/8 focus:outline-none focus:ring-2 focus:ring-gold/30"
            aria-label={t.a11y_close_modal}
          >
            <X className="w-6 h-6 text-foreground/50" />
          </button>
        </div>

        {/* Quick Questions */}
        {messages.length === 0 && (
          <div className="flex-shrink-0 px-8 py-6">
            <p className="text-xl font-heading text-gold/60 tracking-wider mb-4 uppercase">שאלות מהירות</p>
            <div className="flex flex-wrap gap-3">
              {QUICK_QUESTIONS.map((q, i) => (
                <motion.button
                  key={i}
                  onClick={() => sendMessage(q)}
                  disabled={isStreaming || isLimitReached}
                  className="text-lg px-5 py-3 rounded-full font-body transition-all focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-40"
                  style={{
                    background: "hsl(var(--gold) / 0.07)",
                    border: "1px solid hsl(var(--gold) / 0.14)",
                    color: "hsl(var(--gold) / 0.7)",
                  }}
                  whileHover={{ scale: 1.04, background: "hsl(var(--gold) / 0.12)" }}
                  whileTap={{ scale: 0.96 }}
                >
                  {q}
                </motion.button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mt-6">
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.15), transparent)" }} />
              <span className="text-base text-gold/25 font-body">או הקלידו שאלה</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.15), transparent)" }} />
            </div>
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-8 py-6 space-y-6 min-h-0"
          style={{ scrollBehavior: "smooth" }}
          role="log"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--gold) / 0.1), hsl(var(--gold) / 0.04))",
                  border: "1px solid hsl(var(--gold) / 0.12)",
                }}
              >
                <Sparkles className="w-9 h-9 text-gold/50" />
              </div>
              <p className="text-foreground/40 font-body text-xl leading-relaxed max-w-[500px] mx-auto">
                {t.advisor_welcome_tarot || "שאלו אותי על הקלף שלכם ואפרש לכם את המסר הנסתר"}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-6 py-5 font-body text-2xl leading-relaxed ${
                  msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"
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
                  : <Loader2 className="w-6 h-6 animate-spin text-gold/50" />
                }
              </div>
            </div>
          ))}

          {/* Share/Copy */}
          {messages.some(m => m.role === "assistant" && m.content) && !isStreaming && (
            <ShareActions messages={messages} dir={dir} />
          )}

          {/* Limit reached */}
          {isLimitReached && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-6 text-center space-y-4"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold) / 0.06), hsl(var(--crimson) / 0.04))",
                border: "1px solid hsl(var(--gold) / 0.15)",
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <Lock className="w-6 h-6 text-gold/60" />
                <p className="text-foreground/50 font-body text-lg">{t.advisor_limit_reached}</p>
              </div>
              <button
                className="text-lg px-6 py-3 rounded-full font-heading transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                  color: "hsl(var(--primary-foreground))",
                  boxShadow: "0 4px 12px hsl(var(--gold) / 0.2)",
                }}
              >
                {t.advisor_upgrade_cta}
              </button>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div
          className="flex-shrink-0 px-8 py-5"
          style={{ borderTop: "1px solid hsl(var(--gold) / 0.08)" }}
        >
          <div
            className={`flex items-center gap-3 rounded-xl px-6 py-4 transition-opacity ${isLimitReached ? "opacity-40 pointer-events-none" : ""}`}
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
              className="flex-1 bg-transparent text-xl font-body text-foreground/80 placeholder:text-foreground/25 outline-none focus:ring-0"
              dir={dir}
              aria-label={placeholderText}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isStreaming || isLimitReached}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-gold/30"
              style={{
                background: input.trim() ? "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))" : "transparent",
              }}
              aria-label={t.advisor_send}
            >
              {isStreaming ? (
                <Loader2 className="w-6 h-6 animate-spin text-gold/60" />
              ) : (
                <Send className="w-6 h-6 text-primary-foreground" style={{ transform: dir === "rtl" ? "scaleX(-1)" : undefined }} />
              )}
            </button>
          </div>
        </div>
      </>
    );
  }
};

/* ── Share Actions ── */
const ShareActions = ({ messages, dir }: { messages: Message[]; dir: string }) => {
  const [copied, setCopied] = useState(false);
  const answersText = useMemo(() =>
    messages.filter(m => m.role === "assistant" && m.content).map(m => m.content).join("\n\n"),
    [messages]
  );

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
      try { await navigator.share({ text: answersText }); } catch {}
    } else {
      handleCopy();
    }
  }, [answersText, handleCopy]);

  return (
    <motion.div
      className="flex items-center justify-center gap-3 pt-3 pb-2"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      dir={dir}
    >
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-lg font-body transition-all hover:scale-105"
        style={{
          background: "hsl(var(--gold) / 0.08)",
          border: "1px solid hsl(var(--gold) / 0.15)",
          color: "hsl(var(--gold) / 0.7)",
        }}
      >
        <Share2 className="w-5 h-5" />
        <span>שתפו</span>
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-lg font-body transition-all hover:scale-105"
        style={{
          background: "hsl(var(--gold) / 0.08)",
          border: "1px solid hsl(var(--gold) / 0.15)",
          color: "hsl(var(--gold) / 0.7)",
        }}
      >
        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        <span>{copied ? "הועתק" : "העתקה"}</span>
      </button>
    </motion.div>
  );
};

export default DailyCardAdvisorPanel;

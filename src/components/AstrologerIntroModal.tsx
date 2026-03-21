import { useState, useRef, useEffect, useMemo } from "react";
import React from "react";
import CinematicModalShell from "@/components/CinematicModalShell";
import { motion } from "framer-motion";
import { Sparkles, Send, Loader2, Lock } from "lucide-react";
import { useReadingContext } from "@/contexts/ReadingContext";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { readingsStorage } from "@/lib/readingsStorage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FREE_MESSAGE_LIMIT = 5;

const AstrologerIntroModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language, dir } = useLanguage();
  const { activeReading, setActiveReading } = useReadingContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const assistantTextRef = useRef("");

  // Set reading context when opened
  useEffect(() => {
    if (isOpen) {
      setActiveReading({
        type: "astrologer",
        label: language === "he" ? "שיחה עם האסטרולוגית" : "Chat with the Astrologer",
        summary: language === "he"
          ? "קבלו הכוונה אישית מבוססת אסטרולוגיה ובינה מלאכותית"
          : "Get personalized guidance based on astrology and AI",
      });
    }
  }, [isOpen, language]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInput("");
      setUserMessageCount(0);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 600);
  }, [isOpen]);

  const suggestions = useMemo(() => [
    t.advisor_astro_s1, t.advisor_astro_s2, t.advisor_astro_s3, t.advisor_astro_s4,
  ], [t]);

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
              const updated = assistantTextRef.current;
              setMessages(prev => { const c = [...prev]; c[c.length - 1] = { role: "assistant", content: updated }; return c; });
            }
          } catch { textBuffer = line + "\n" + textBuffer; break; }
        }
      }
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
              const updated = assistantTextRef.current;
              setMessages(prev => { const c = [...prev]; c[c.length - 1] = { role: "assistant", content: updated }; return c; });
            }
          } catch { /* ignore */ }
        }
      }
      setIsStreaming(false);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: t.advisor_error }]);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*|__(.+?)__|_(.+?)_|\*(.+?)\*/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      if (match[1] || match[2]) parts.push(<strong key={match.index} className="text-gold/90 font-semibold">{match[1] || match[2]}</strong>);
      else if (match[3] || match[4]) parts.push(<em key={match.index}>{match[3] || match[4]}</em>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) { elements.push(<div key={i} className="h-2.5" />); return; }
      if (trimmed.startsWith("### ")) { elements.push(<h4 key={i} className="font-heading text-base text-gold mt-3 mb-1.5">{renderInline(trimmed.slice(4))}</h4>); return; }
      if (trimmed.startsWith("## ")) { elements.push(<h3 key={i} className="font-heading text-lg text-gold mt-4 mb-1.5">{renderInline(trimmed.slice(3))}</h3>); return; }
      if (/^[-•*]\s/.test(trimmed)) { elements.push(<div key={i} className="flex gap-2.5 items-start"><span className="text-gold/50 mt-0.5 flex-shrink-0">•</span><span>{renderInline(trimmed.replace(/^[-•*]\s/, ""))}</span></div>); return; }
      if (/^\d+[.)]\s/.test(trimmed)) { const num = trimmed.match(/^(\d+)[.)]\s/)?.[1]; elements.push(<div key={i} className="flex gap-2.5 items-start"><span className="text-gold/50 mt-0.5 flex-shrink-0 text-sm min-w-[1.25rem] text-center">{num}.</span><span>{renderInline(trimmed.replace(/^\d+[.)]\s/, ""))}</span></div>); return; }
      elements.push(<p key={i}>{renderInline(trimmed)}</p>);
    });
    return <div className="space-y-1.5">{elements}</div>;
  };

  const placeholderText = t.advisor_placeholder_context || t.advisor_placeholder_general;

  return (
    <CinematicModalShell isOpen={isOpen} onClose={onClose} fullscreen>
      {/* 3-zone layout: LEFT welcome | CENTER oracle (clear) | RIGHT chat */}
      <div className="absolute inset-0 z-[102] flex" dir={dir}>

        {/* ── LEFT ZONE: Welcome & guidance ── */}
        <motion.div
          className="hidden md:flex flex-col justify-start px-10 pt-[92px] pb-10"
          style={{ width: "28%", maxWidth: "340px" }}
          initial={{ opacity: 0, x: dir === "rtl" ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
            style={{
              background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)",
              border: "1px solid hsl(var(--gold) / 0.2)",
            }}
            animate={{ boxShadow: ["0 0 20px hsl(43 80% 55% / 0.1)", "0 0 35px hsl(43 80% 55% / 0.2)", "0 0 20px hsl(43 80% 55% / 0.1)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-6 h-6 text-gold" />
          </motion.div>

          <h2 className="font-heading text-xl gold-gradient-text mb-3 leading-tight">
            {language === "he" ? "שיחה עם האסטרולוגית" : "Chat with the Astrologer"}
          </h2>
          <p className="text-foreground/50 font-body text-sm leading-relaxed mb-6">
            {language === "he"
              ? "שאלו כל שאלה — על מזל, אהבה, קריירה, או החלטות חשובות. האסטרולוגית תעניק לכם הכוונה אישית."
              : "Ask any question — about fortune, love, career, or important decisions. The astrologer will give you personal guidance."}
          </p>

          {/* Suggestion chips */}
          <div className="flex flex-col gap-2">
            {suggestions.filter(Boolean).slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => { setInput(s); inputRef.current?.focus(); }}
                className="text-start text-xs px-3 py-2 rounded-lg font-body transition-all hover:scale-[1.02]"
                style={{
                  background: "hsl(var(--gold) / 0.06)",
                  border: "1px solid hsl(var(--gold) / 0.12)",
                  color: "hsl(var(--gold) / 0.6)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── CENTER ZONE: Oracle stays clear — no elements here ── */}
        <div className="flex-1" />

        {/* ── RIGHT ZONE: Chat panel ── */}
        <motion.div
          className="flex flex-col w-full md:w-[570px] md:max-w-[570px] md:min-w-[570px] h-full"
          style={{
            background: "linear-gradient(170deg, hsl(222 47% 9% / 0.85), hsl(222 47% 6% / 0.92))",
            borderLeft: dir === "ltr" ? "1px solid hsl(var(--gold) / 0.1)" : "none",
            borderRight: dir === "rtl" ? "1px solid hsl(var(--gold) / 0.1)" : "none",
          }}
          initial={{ opacity: 0, x: dir === "rtl" ? -40 : 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Chat header */}
          <div
            className="flex items-center gap-4 px-7 py-5 flex-shrink-0"
            style={{
              borderBottom: "1px solid hsl(var(--gold) / 0.1)",
              background: "linear-gradient(135deg, hsl(var(--gold) / 0.04), transparent)",
            }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                boxShadow: "0 0 15px hsl(var(--gold) / 0.3)",
              }}
            >
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-heading text-base text-gold">{t.advisor_title}</h3>
              <p className="text-sm text-foreground/40 font-body mt-0.5">
                {language === "he" ? "הכוונה אישית" : "Personal guidance"}
              </p>
            </div>
          </div>

          {/* Messages area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-5 min-h-0"
            style={{ scrollBehavior: "smooth" }}
            role="log"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--gold) / 0.1), hsl(var(--gold) / 0.05))",
                    border: "1px solid hsl(var(--gold) / 0.15)",
                  }}
                >
                  <Sparkles className="w-8 h-8 text-gold/60" />
                </div>
                <p className="text-foreground/40 font-body text-base leading-relaxed max-w-[360px] mx-auto">
                  {t.advisor_welcome_astrology || t.advisor_welcome_general}
                </p>
                {/* Mobile suggestions */}
                <div className="flex flex-wrap gap-2.5 justify-center mt-4 md:hidden">
                  {suggestions.filter(Boolean).slice(0, 3).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      className="text-sm px-4 py-2 rounded-full font-body transition-all hover:scale-105"
                      style={{
                        background: "hsl(var(--gold) / 0.06)",
                        border: "1px solid hsl(var(--gold) / 0.12)",
                        color: "hsl(var(--gold) / 0.6)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 font-body text-base leading-relaxed ${msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"}`}
                  style={msg.role === "user"
                    ? { background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))", color: "hsl(var(--primary-foreground))" }
                    : { background: "hsl(var(--deep-blue-light) / 0.5)", border: "1px solid hsl(var(--gold) / 0.08)", color: "hsl(var(--foreground) / 0.85)" }
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
                <div className="flex items-center justify-center gap-2.5">
                  <Lock className="w-5 h-5 text-gold/60" />
                  <p className="text-foreground/50 font-body text-sm leading-relaxed">{t.advisor_limit_reached}</p>
                </div>
                <button
                  className="text-sm px-5 py-2.5 rounded-full font-heading transition-all hover:scale-105"
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
          <div className="flex-shrink-0 px-6 py-5" style={{ borderTop: "1px solid hsl(var(--gold) / 0.08)" }}>
            <div
              className={`flex items-center gap-3 rounded-xl px-5 py-4 transition-opacity ${isLimitReached ? "opacity-40 pointer-events-none" : ""}`}
              style={{
                background: "hsl(var(--deep-blue-light) / 0.4)",
                border: "1px solid hsl(var(--gold) / 0.1)",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
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
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                style={{
                  background: input.trim() ? "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))" : "transparent",
                }}
                aria-label={t.advisor_send}
              >
                {isStreaming
                  ? <Loader2 className="w-5 h-5 animate-spin text-gold/60" />
                  : <Send className="w-4.5 h-4.5 text-primary-foreground" style={{ transform: dir === "rtl" ? "scaleX(-1)" : undefined }} />
                }
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </CinematicModalShell>
  );
};

export default AstrologerIntroModal;

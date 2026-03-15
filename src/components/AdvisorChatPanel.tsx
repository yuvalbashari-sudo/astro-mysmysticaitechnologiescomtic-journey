import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { useReadingContext } from "@/contexts/ReadingContext";
import { useT, useLanguage } from "@/i18n/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AdvisorChatPanel = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language, dir } = useLanguage();
  const { activeReading } = useReadingContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const assistantTextRef = useRef("");

  // Reset chat when reading changes
  useEffect(() => {
    setMessages([]);
    setInput("");
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

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
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
              bottom: "5.5rem",
              right: dir === "rtl" ? "auto" : "1.25rem",
              left: dir === "rtl" ? "1.25rem" : "auto",
              width: "min(380px, calc(100vw - 2.5rem))",
              maxHeight: "min(560px, calc(100vh - 8rem))",
              background: "linear-gradient(170deg, hsl(222 47% 9% / 0.98), hsl(222 47% 6% / 0.98))",
              border: "1px solid hsl(var(--gold) / 0.2)",
              borderRadius: "1.25rem",
              boxShadow: "0 20px 60px hsl(0 0% 0% / 0.5), 0 0 30px hsl(var(--gold) / 0.05)",
            }}
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            dir={dir}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{
                borderBottom: "1px solid hsl(var(--gold) / 0.1)",
                background: "linear-gradient(135deg, hsl(var(--gold) / 0.04), transparent)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                    boxShadow: "0 0 15px hsl(var(--gold) / 0.3)",
                  }}
                >
                  <Sparkles className="w-4.5 h-4.5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-heading text-sm text-gold">{t.advisor_title}</h3>
                  {activeReading && (
                    <p className="text-[11px] text-foreground/40 font-body mt-0.5">{activeReading.label}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-foreground/5"
                aria-label={t.a11y_close_modal}
              >
                <X className="w-4 h-4 text-foreground/50" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0"
              style={{ scrollBehavior: "smooth" }}
            >
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--gold) / 0.1), hsl(var(--gold) / 0.05))",
                      border: "1px solid hsl(var(--gold) / 0.15)",
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-gold/60" />
                  </div>
                  <p className="text-foreground/40 font-body text-sm leading-relaxed max-w-[260px] mx-auto">
                    {activeReading ? t.advisor_welcome_context : t.advisor_welcome_general}
                  </p>
                  {activeReading && (
                    <div className="flex flex-wrap gap-2 justify-center mt-3">
                      {[t.advisor_suggestion_1, t.advisor_suggestion_2, t.advisor_suggestion_3].map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                          className="text-xs px-3 py-1.5 rounded-full font-body transition-colors"
                          style={{
                            background: "hsl(var(--gold) / 0.06)",
                            border: "1px solid hsl(var(--gold) / 0.12)",
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
                    className={`max-w-[85%] rounded-2xl px-4 py-3 font-body text-sm leading-relaxed ${
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
                    {msg.content || (
                      <Loader2 className="w-4 h-4 animate-spin text-gold/50" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div
              className="flex-shrink-0 px-4 py-3"
              style={{ borderTop: "1px solid hsl(var(--gold) / 0.08)" }}
            >
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  background: "hsl(var(--deep-blue-light) / 0.4)",
                  border: "1px solid hsl(var(--gold) / 0.1)",
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholderText}
                  disabled={isStreaming}
                  className="flex-1 bg-transparent text-sm font-body text-foreground/80 placeholder:text-foreground/25 outline-none"
                  dir={dir}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                  style={{
                    background: input.trim() ? "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))" : "transparent",
                  }}
                  aria-label={t.advisor_send}
                >
                  {isStreaming ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold/60" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-primary-foreground" style={{ transform: dir === "rtl" ? "scaleX(-1)" : undefined }} />
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

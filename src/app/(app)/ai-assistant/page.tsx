"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Input";
import { useAIConfig } from "@/contexts/AIConfigProvider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertTriangle, Bot, Loader2, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const suggestions = [
  "Kvadrat tenglamani qanday yechaman?",
  "Nyutonning 2-qonunini tushuntiring",
  "Ideal gaz tenglamasi nima?",
  "Kimyoviy bog'lanish turlari",
];

type Message = { role: "user" | "assistant"; content: string };

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Salom! Men TriCore AI yordamchisiman. Matematika, Fizika va Kimyo bo'yicha savollarga javob beraman, tushunchalarni tushuntiraman, tenglamalar yechaman. Qanday yordam bera olaman?",
  },
];

export default function AIAssistantPage() {
  const { config, isConfigured } = useAIConfig();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll pastga
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      // API sozlanmagan bo'lsa
      if (!isConfigured) {
        setMessages((m) => [
          ...m,
          { role: "user", content: trimmed },
          {
            role: "assistant",
            content:
              "AI hozircha sozlanmagan. Admin paneldan AI Settings bo'limiga o'ting va OpenAI API kalitini kiriting.",
          },
        ]);
        setInput("");
        return;
      }

      const userMsg: Message = { role: "user", content: trimmed };
      const newMessages = [...messages, userMsg];
      setMessages([...newMessages, { role: "assistant", content: "" }]);
      setInput("");
      setLoading(true);

      // Oldingi so'rovni bekor qilish
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            apiKey: config.apiKey,
            model: config.model,
            systemPrompt: config.platformContext,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg =
            (errData as { error?: string }).error || `Xatolik: ${res.status}`;
          setMessages((m) => {
            const updated = [...m];
            updated[updated.length - 1] = {
              role: "assistant",
              content: `Xatolik: ${errMsg}`,
            };
            return updated;
          });
          setLoading(false);
          return;
        }

        // SSE stream o'qish
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("Stream mavjud emas");
        }

        let assistantContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.trim() !== "");

          for (const line of lines) {
            if (line === "data: [DONE]") continue;
            if (line.startsWith("data: ")) {
              try {
                const json = JSON.parse(line.slice(6));
                if (json.content) {
                  assistantContent += json.content;
                  setMessages((m) => {
                    const updated = [...m];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              } catch {
                // skip
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((m) => {
            const updated = [...m];
            updated[updated.length - 1] = {
              role: "assistant",
              content: "Tarmoq xatosi yuz berdi. Qayta urinib ko'ring.",
            };
            return updated;
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, isConfigured, config]
  );

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader
        title="AI Assistant"
        description="Ilmiy AI yordamchi — aniq, qisqa, professional javoblar"
      />

      {!isConfigured && (
        <Card className="mb-4 border-warning/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">AI sozlanmagan</p>
              <p className="text-xs text-text-muted">
                Admin paneldan API kalitni sozlang:{" "}
                <Link href="/admin/ai-settings" className="text-primary hover:underline">
                  AI Settings
                </Link>
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="flex-1 flex flex-col min-h-0 mb-4">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold">TriCore Scientific AI</p>
            <p
              className={cn(
                "text-xs flex items-center gap-1",
                isConfigured ? "text-success" : "text-warning"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isConfigured ? "bg-success" : "bg-warning"
                )}
              />
              {isConfigured ? `Online · ${config.model}` : "Sozlanmagan"}
            </p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[300px]"
        >
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-surface-elevated border border-border rounded-bl-md"
                )}
              >
                {msg.content || (
                  <span className="flex items-center gap-2 text-text-muted">
                    <Loader2 className="w-4 h-4 animate-spin" /> Javob yozilmoqda...
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 pb-4">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-text-muted hover:border-primary/40 hover:text-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-border">
          <Textarea
            placeholder="Matematika, Fizika, Kimyo bo'yicha savol yozing..."
            className="min-h-[48px] max-h-32 flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <Button
            variant="primary"
            onClick={() => send(input)}
            loading={loading}
            disabled={loading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <div className="grid sm:grid-cols-3 gap-3 text-center text-xs text-text-muted">
        {[
          "Tushunchalarni tushuntirish",
          "Tenglamalar yechish",
          "Xatolarni aniqlash",
        ].map((cap) => (
          <div key={cap} className="flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-accent" /> {cap}
          </div>
        ))}
      </div>
    </div>
  );
}

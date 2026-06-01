"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Input";
import { useAIConfig } from "@/contexts/AIConfigProvider";
import { useLanguage } from "@/contexts/LanguageProvider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertTriangle, Bot, Loader2, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function AIAssistantPage() {
  const { config, isConfigured } = useAIConfig();
  const { language } = useLanguage();
  const tx = {
    uz: {
      suggestions: ["Kvadrat tenglamani qanday yechaman?", "Nyutonning 2-qonunini tushuntiring", "Ideal gaz tenglamasi nima?", "Kimyoviy bog'lanish turlari"],
      initial: "Salom! Men TriCore AI yordamchisiman. Matematika, fizika va kimyo bo'yicha savollarga javob beraman, tushunchalarni tushuntiraman va masalalarni yechishda yordam beraman.",
      unconfiguredReply: "AI hozircha sozlanmagan. Admin paneldagi AI sozlamalari bo'limidan Google AI Studio Gemini API kalitini kiriting.",
      networkError: "Tarmoq xatosi yuz berdi. Qayta urinib ko'ring.",
      title: "AI yordamchi",
      description: "Ilmiy AI yordamchi - aniq, qisqa va professional javoblar",
      notConfigured: "AI sozlanmagan",
      configureHint: "Admin paneldan API kalitni sozlang:",
      assistantName: "TriCore ilmiy AI",
      online: "Faol",
      offline: "Sozlanmagan",
      typing: "Javob yozilmoqda...",
      placeholder: "Matematika, fizika yoki kimyo bo'yicha savolingizni yozing...",
      capability1: "Tushunchalarni tushuntirish",
      capability2: "Masalalarni yechish",
      capability3: "Xatolarni aniqlash",
      settingsLink: "AI sozlamalari",
    },
    kaa: {
      suggestions: ["Kvadrat teńlemeni qalay sheshemen?", "Nyutonniń 2-zańın túsindirip beriń", "Ideal gaz teńlemesi ne?", "Kimyalıq baylanıs túrleri"],
      initial: "Sálem! Men TriCore AI járdemshisimen. Matematika, fizika hám kimya boyınsha sawallardı juwaplayman, túsiniklerdi túsindiremen hám esaplarda járdem beremen.",
      unconfiguredReply: "AI ázirge sazlanbaǵan. Admin paneldegı AI sazlamaları bóliminen Google AI Studio Gemini API kalitin kirgiziń.",
      networkError: "Tarmaq qáteligi júz berdi. Qayta urınıp kóriń.",
      title: "AI járdemshi",
      description: "Ilimiy AI járdemshi - anıq, qısqa hám professional juwaplar",
      notConfigured: "AI sazlanbaǵan",
      configureHint: "Admin panelden API kalitti sazlań:",
      assistantName: "TriCore ilimiy AI",
      online: "Faol",
      offline: "Sazlanbaǵan",
      typing: "Juwap jazılıp atır...",
      placeholder: "Matematika, fizika yaki kimya boyınsha sawal jazıń...",
      capability1: "Túsiniklerdi túsindiriw",
      capability2: "Esap-sheshimler",
      capability3: "Qáteliklerdi tabıw",
      settingsLink: "AI sazlamaları",
    },
    ru: {
      suggestions: ["Как решить квадратное уравнение?", "Объясните второй закон Ньютона", "Что такое уравнение идеального газа?", "Виды химической связи"],
      initial: "Здравствуйте! Я AI-помощник TriCore. Я отвечаю на вопросы по математике, физике и химии, объясняю темы и помогаю решать задачи.",
      unconfiguredReply: "AI пока не настроен. Укажите ключ Google AI Studio Gemini API в разделе настроек AI в админ-панели.",
      networkError: "Произошла сетевая ошибка. Попробуйте ещё раз.",
      title: "AI помощник",
      description: "Научный AI-помощник - точные, краткие и профессиональные ответы",
      notConfigured: "AI не настроен",
      configureHint: "Настройте API-ключ в админ-панели:",
      assistantName: "Научный AI TriCore",
      online: "Активен",
      offline: "Не настроен",
      typing: "Пишу ответ...",
      placeholder: "Введите вопрос по математике, физике или химии...",
      capability1: "Объяснение понятий",
      capability2: "Решение задач",
      capability3: "Поиск ошибок",
      settingsLink: "Настройки AI",
    },
    en: {
      suggestions: ["How do I solve a quadratic equation?", "Explain Newton's second law", "What is the ideal gas equation?", "Types of chemical bonding"],
      initial: "Hello! I am the TriCore AI assistant. I answer questions on mathematics, physics, and chemistry, explain concepts, and help solve problems.",
      unconfiguredReply: "AI is not configured yet. Add your Google AI Studio Gemini API key in the admin AI settings.",
      networkError: "A network error occurred. Please try again.",
      title: "AI Assistant",
      description: "Scientific AI assistant - precise, concise, professional answers",
      notConfigured: "AI is not configured",
      configureHint: "Configure the API key from the admin panel:",
      assistantName: "TriCore Scientific AI",
      online: "Online",
      offline: "Not configured",
      typing: "Generating a response...",
      placeholder: "Ask a question about mathematics, physics, or chemistry...",
      capability1: "Explain concepts",
      capability2: "Solve problems",
      capability3: "Find mistakes",
      settingsLink: "AI Settings",
    },
  }[language];
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: tx.initial }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages((current) => (current.length <= 1 ? [{ role: "assistant", content: tx.initial }] : current));
  }, [tx.initial]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      if (!isConfigured) {
        setMessages((m) => [
          ...m,
          { role: "user", content: trimmed },
          { role: "assistant", content: tx.unconfiguredReply },
        ]);
        setInput("");
        return;
      }

      const userMsg: Message = { role: "user", content: trimmed };
      const newMessages = [...messages, userMsg];
      setMessages([...newMessages, { role: "assistant", content: "" }]);
      setInput("");
      setLoading(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            apiKey: config.apiKey,
            model: config.model,
            systemPrompt: config.platformContext,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = (errData as { error?: string }).error || `Xatolik: ${res.status}`;
          setMessages((m) => {
            const updated = [...m];
            updated[updated.length - 1] = { role: "assistant", content: `Xatolik: ${errMsg}` };
            return updated;
          });
          setLoading(false);
          return;
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("Stream mavjud emas");

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
                    updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                    return updated;
                  });
                }
              } catch {
                // noop
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((m) => {
            const updated = [...m];
            updated[updated.length - 1] = { role: "assistant", content: tx.networkError };
            return updated;
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, isConfigured, config, tx.unconfiguredReply, tx.networkError]
  );

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader title={tx.title} description={tx.description} />

      {!isConfigured && (
        <Card className="mb-4 border-warning/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">{tx.notConfigured}</p>
              <p className="text-xs text-text-muted">
                {tx.configureHint}{" "}
                <Link href="/admin/ai-settings" className="text-primary hover:underline">
                  {tx.settingsLink}
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
            <p className="font-semibold">{tx.assistantName}</p>
            <p className={cn("text-xs flex items-center gap-1", isConfigured ? "text-success" : "text-warning")}>
              <span className={cn("w-1.5 h-1.5 rounded-full", isConfigured ? "bg-success" : "bg-warning")} />
              {isConfigured ? `${tx.online} · ${config.model}` : tx.offline}
            </p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[300px]">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap", msg.role === "user" ? "bg-primary text-white rounded-br-md" : "bg-surface-elevated border border-border rounded-bl-md")}>
                {msg.content || (
                  <span className="flex items-center gap-2 text-text-muted">
                    <Loader2 className="w-4 h-4 animate-spin" /> {tx.typing}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 pb-4">
            {tx.suggestions.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-border text-text-muted hover:border-primary/40 hover:text-primary transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-border">
          <Textarea
            placeholder={tx.placeholder}
            className="min-h-[48px] max-h-32 flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
          />
          <Button variant="primary" onClick={() => void send(input)} loading={loading} disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <div className="grid sm:grid-cols-3 gap-3 text-center text-xs text-text-muted">
        {[tx.capability1, tx.capability2, tx.capability3].map((cap) => (
          <div key={cap} className="flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-accent" /> {cap}
          </div>
        ))}
      </div>
    </div>
  );
}

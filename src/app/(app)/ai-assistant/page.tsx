"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Bot, Send, Sparkles } from "lucide-react";
import { useState } from "react";

const suggestions = [
  "Explain the quadratic formula step by step",
  "Solve: 2x² + 5x - 3 = 0",
  "What is Newton's second law?",
  "Difference between ionic and covalent bonds",
];

type Message = { role: "user" | "assistant"; content: string };

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Hello! I'm TriCore AI — your scientific learning assistant. I can explain concepts, solve equations, clarify formulas, and help you improve. How can I assist your studies today?",
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", content: text },
      {
        role: "assistant",
        content:
          "For ax² + bx + c = 0, the solutions are x = (-b ± √(b²-4ac)) / 2a. Given your coefficients, Δ = 25 + 24 = 49, so x = (-5 ± 7)/4 → x = ½ or x = -3.",
      },
    ]);
    setInput("");
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader
        title="AI Assistant"
        description="Professional scientific tutor — concise, accurate, no fluff"
      />

      <Card className="flex-1 flex flex-col min-h-0 mb-4">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold">TriCore Scientific AI</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> Online
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[300px]">
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
                  "max-w-[85%] px-4 py-3 rounded-2xl text-sm",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-surface-elevated border border-border rounded-bl-md"
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </div>

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

        <div className="flex gap-2 pt-4 border-t border-border">
          <Textarea
            placeholder="Ask about math, physics, or chemistry..."
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
          <Button variant="primary" onClick={() => send(input)}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <div className="grid sm:grid-cols-3 gap-3 text-center text-xs text-text-muted">
        {["Explain concepts", "Solve equations", "Detect mistakes"].map((cap) => (
          <div key={cap} className="flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-accent" /> {cap}
          </div>
        ))}
      </div>
    </div>
  );
}

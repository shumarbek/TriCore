"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Input";
import { adminMessages, type AdminMessage } from "@/lib/data/admin-messages";
import { cn } from "@/lib/utils";
import { Mail, Send } from "lucide-react";
import { useState } from "react";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState(adminMessages);
  const [selectedId, setSelectedId] = useState(messages[0]?.id ?? "");
  const [reply, setReply] = useState("");

  const selected = messages.find((m) => m.id === selectedId);

  const sendReply = () => {
    if (!selected || !reply.trim()) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === selected.id
          ? {
              ...m,
              status: "replied" as const,
              adminReply: reply,
              repliedAt: new Date().toLocaleString("uz-UZ"),
            }
          : m
      )
    );
    setReply("");
  };

  const statusBadge = {
    open: "warning" as const,
    replied: "success" as const,
    closed: "muted" as const,
  };

  return (
    <div className="h-[calc(100vh-10rem)]">
      <PageHeader
        title="Messages"
        description="Foydalanuvchi xabarlari — ko'rib chiqish va javob yuborish"
      />

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        <Card className="lg:col-span-1 flex flex-col min-h-[400px] overflow-hidden">
          <p className="text-sm font-medium mb-3">
            Xabarlar ({messages.filter((m) => m.status === "open").length} ochiq)
          </p>
          <ul className="flex-1 overflow-y-auto space-y-1">
            {messages.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(m.id);
                    setReply(m.adminReply ?? "");
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-colors",
                    selectedId === m.id
                      ? "bg-primary/15 border border-primary/25"
                      : "hover:bg-surface-elevated"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{m.userName}</p>
                    <Badge variant={statusBadge[m.status]}>{m.status}</Badge>
                  </div>
                  <p className="text-xs text-text-muted truncate">{m.subject}</p>
                  <p className="text-[10px] text-text-muted">{m.createdAt}</p>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2 flex flex-col min-h-[400px]">
          {selected ? (
            <>
              <div className="border-b border-border pb-4 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Mail className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">{selected.subject}</h3>
                  <Badge variant={statusBadge[selected.status]}>{selected.status}</Badge>
                </div>
                <p className="text-sm text-text-muted mt-1">
                  {selected.userName} · {selected.userEmail}
                </p>
                <p className="text-xs text-text-muted">{selected.createdAt}</p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto">
                <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                  <p className="text-xs text-text-muted mb-1">Foydalanuvchi</p>
                  <p className="text-sm">{selected.body}</p>
                </div>

                {selected.adminReply && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 ml-4">
                    <p className="text-xs text-primary mb-1">Admin javobi · {selected.repliedAt}</p>
                    <p className="text-sm">{selected.adminReply}</p>
                    <p className="text-xs text-text-muted mt-2">
                      User Support bo&apos;limida javobni ko&apos;radi.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <Textarea
                  label="Javob yozish"
                  placeholder="Foydalanuvchiga javob..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button variant="primary" className="mt-3" onClick={sendReply}>
                  <Send className="w-4 h-4" /> Javob yuborish
                </Button>
              </div>
            </>
          ) : (
            <p className="text-text-muted text-center py-20">Xabar tanlang</p>
          )}
        </Card>
      </div>
    </div>
  );
}

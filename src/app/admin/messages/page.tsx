"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Mail, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Msg {
  id: string;
  user_id: string;
  subject: string;
  body: string;
  status: "open" | "replied" | "closed";
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  profiles?: { full_name: string; email: string } | null;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [reply, setReply] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false });
    if (data) {
      setMessages(data as unknown as Msg[]);
      if (!selectedId && data.length > 0) setSelectedId(data[0].id);
    }
  }, [supabase, selectedId]);

  useEffect(() => {
    load();
    // Realtime subscription
    const channel = supabase
      .channel("admin-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, load]);

  const selected = messages.find((m) => m.id === selectedId);

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    await supabase
      .from("messages")
      .update({
        status: "replied",
        admin_reply: reply,
        replied_at: new Date().toISOString(),
      })
      .eq("id", selected.id);
    setReply("");
    load();
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
                    setReply(m.admin_reply ?? "");
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-colors",
                    selectedId === m.id
                      ? "bg-primary/15 border border-primary/25"
                      : "hover:bg-surface-elevated"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{m.profiles?.full_name ?? "User"}</p>
                    <Badge variant={statusBadge[m.status]}>{m.status}</Badge>
                  </div>
                  <p className="text-xs text-text-muted truncate">{m.subject}</p>
                  <p className="text-[10px] text-text-muted">{new Date(m.created_at).toLocaleString()}</p>
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
                  {selected.profiles?.full_name ?? "User"} · {selected.profiles?.email ?? ""}
                </p>
                <p className="text-xs text-text-muted">{new Date(selected.created_at).toLocaleString()}</p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto">
                <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                  <p className="text-xs text-text-muted mb-1">Foydalanuvchi</p>
                  <p className="text-sm">{selected.body}</p>
                </div>

                                {selected.admin_reply && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 ml-4">
                    <p className="text-xs text-primary mb-1">Admin javobi · {selected.replied_at ? new Date(selected.replied_at).toLocaleString() : ""}</p>
                    <p className="text-sm">{selected.admin_reply}</p>
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

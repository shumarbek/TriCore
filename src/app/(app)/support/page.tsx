"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Textarea } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { faqItems } from "@/lib/data/mock";
import { CheckCircle, ChevronDown, Plus, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Msg {
  id: string;
  subject: string;
  body: string;
  status: "open" | "replied" | "closed";
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export default function SupportPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const loadMessages = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setMessages(data as Msg[]);
  }, [supabase, user]);

  useEffect(() => {
    loadMessages();
    // Realtime: admin javob bersa darhol ko'rinadi
    if (!user) return;
    const channel = supabase
      .channel("user-messages")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `user_id=eq.${user.id}` },
        () => loadMessages()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, user, loadMessages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !body.trim()) return;
    setSending(true);
    await supabase.from("messages").insert({
      user_id: user.id,
      subject: subject.trim(),
      body: body.trim(),
    });
    setSubject("");
    setBody("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setSending(false);
    loadMessages();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Support"
        description="Admin bilan bog'lanish \u2014 javoblarni shu yerda qabul qilasiz"
      />

      <Card className="mb-8">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yangi xabar yuborish
        </h3>
        {sent && (
          <div className="p-3 mb-4 rounded-xl bg-success/10 border border-success/25 text-sm text-success flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Xabar yuborildi! Admin tez orada javob beradi.
          </div>
        )}
        <form className="space-y-3" onSubmit={sendMessage}>
          <Input
            label="Mavzu"
            placeholder="Muammo yoki savol"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <Textarea
            label="Xabar"
            placeholder="Batafsil yozing..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          <Button variant="primary" className="w-full" type="submit" loading={sending}>
            <Send className="w-4 h-4" /> Yuborish
          </Button>
        </form>
      </Card>

      <Card className="mb-8">
        <h3 className="font-semibold mb-4">Mening xabarlarim va admin javoblari</h3>
        {messages.length === 0 ? (
          <p className="text-center text-text-muted py-8">
            Hali xabar yo&apos;q. Yuqorida yangi xabar yuboring.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="rounded-xl border border-border overflow-hidden">
                <div className="p-4 bg-surface-elevated/50">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-medium text-sm">{m.subject}</p>
                    <Badge
                      variant={
                        m.status === "open"
                          ? "warning"
                          : m.status === "replied"
                            ? "success"
                            : "muted"
                      }
                    >
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-muted">{m.body}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                {m.admin_reply && (
                  <div className="p-4 bg-primary/10 border-t border-primary/20">
                    <p className="text-xs text-primary font-medium mb-1">
                      Admin javobi \u00b7 {m.replied_at ? new Date(m.replied_at).toLocaleString() : ""}
                    </p>
                    <p className="text-sm">{m.admin_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">FAQ</h3>
        <div className="space-y-2">
          {faqItems.map((item, i) => (
            <div key={item.q} className="border border-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-elevated/50 transition-colors"
              >
                <span className="font-medium text-sm">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-text-muted transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <p className="px-4 pb-4 text-sm text-text-muted">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

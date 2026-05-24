"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Textarea } from "@/components/ui/Input";
import { adminMessages } from "@/lib/data/admin-messages";
import { faqItems } from "@/lib/data/mock";
import { ChevronDown, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";

const userMessages = adminMessages.filter((m) => m.userId === "u1");

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Support"
        description="Admin bilan bog'lanish — javoblarni shu yerda qabul qilasiz"
      />

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="text-center">
          <MessageCircle className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-semibold">Admin bilan chat</h3>
          <p className="text-sm text-text-muted mt-2 mb-4">O&apos;rtacha javob: 5 daqiqa</p>
          <Button variant="primary" className="w-full">Chatni boshlash</Button>
        </Card>
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yangi xabar
          </h3>
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <Input label="Mavzu" placeholder="Muammo yoki savol" />
            <Textarea label="Xabar" placeholder="Batafsil yozing..." />
            <Button variant="primary" className="w-full">Yuborish</Button>
          </form>
        </Card>
      </div>

      <Card className="mb-8">
        <h3 className="font-semibold mb-4">Mening xabarlarim va admin javoblari</h3>
        <div className="space-y-4">
          {userMessages.map((m) => (
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
                <p className="text-xs text-text-muted mt-2">{m.createdAt}</p>
              </div>
              {m.adminReply && (
                <div className="p-4 bg-primary/10 border-t border-primary/20">
                  <p className="text-xs text-primary font-medium mb-1">
                    Admin javobi · {m.repliedAt}
                  </p>
                  <p className="text-sm">{m.adminReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
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

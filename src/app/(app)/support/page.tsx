"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Textarea } from "@/components/ui/Input";
import { faqItems, supportTickets } from "@/lib/data/mock";
import { ChevronDown, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Support"
        description="Tickets, live chat, FAQ, and issue reporting"
      />

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="text-center">
          <MessageCircle className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-semibold">Live Admin Chat</h3>
          <p className="text-sm text-text-muted mt-2 mb-4">Average response: 5 min</p>
          <Button variant="primary" className="w-full">Start Chat</Button>
        </Card>
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Ticket
          </h3>
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <Input label="Subject" placeholder="Describe your issue" />
            <Textarea label="Message" placeholder="Details..." />
            <Button variant="primary" className="w-full">Submit Ticket</Button>
          </form>
        </Card>
      </div>

      <Card className="mb-8">
        <h3 className="font-semibold mb-4">Your Tickets</h3>
        <div className="space-y-2">
          {supportTickets.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/50"
            >
              <div>
                <p className="text-sm font-medium">{t.subject}</p>
                <p className="text-xs text-text-muted">{t.id} · {t.date}</p>
              </div>
              <Badge variant={t.status === "open" ? "warning" : "success"}>
                {t.status}
              </Badge>
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

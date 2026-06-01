"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Textarea } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import { useLanguage } from "@/contexts/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, ChevronDown, Plus, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const { language } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = useMemo(() => createClient(), []);
  const tx = {
    uz: {
      title: "Yordam",
      description: "Admin bilan bog'lanish - javoblarni shu yerda qabul qilasiz",
      newMessage: "Yangi xabar yuborish",
      sent: "Xabar yuborildi! Admin tez orada javob beradi.",
      subject: "Mavzu",
      subjectPlaceholder: "Muammo yoki savol",
      message: "Xabar",
      messagePlaceholder: "Batafsil yozing...",
      send: "Yuborish",
      myMessages: "Mening xabarlarim va admin javoblari",
      noMessages: "Hali xabar yo'q. Yuqorida yangi xabar yuboring.",
      adminReply: "Admin javobi",
      faq: "Ko'p so'raladigan savollar",
      open: "Ochiq",
      replied: "Javob berilgan",
      closed: "Yopilgan",
      faqItems: [
        { q: "Learning roadmap qanday ishlaydi?", a: "Har bir fan bo'lim, modul va darslarga bo'linadi. Dars va mini imtihonlarni tugatib keyingi kontentni ochasiz." },
        { q: "XP qanday hisoblanadi?", a: "XP darslar, imtihonlar, uy vazifalari, kunlik faollik va reyting yutuqlari orqali beriladi." },
        { q: "Imtihon paytida AI yordamchidan foydalansa bo'ladimi?", a: "Baholanadigan imtihon paytida AI o'chiriladi, ammo practice va darslarda foydalanish mumkin." },
      ],
    },
    kaa: {
      title: "Járdem",
      description: "Admin menen baylanısıń - juwaplardı osı jerde alasız",
      newMessage: "Jańa xabar jiberiw",
      sent: "Xabar jiberildi! Admin tez arada juwap beredi.",
      subject: "Tema",
      subjectPlaceholder: "Mashqala yaki soraw",
      message: "Xabar",
      messagePlaceholder: "Tolıǵıraq jazıń...",
      send: "Jiberiw",
      myMessages: "Meniń xabarlarım hám admin juwapları",
      noMessages: "Áli xabar joq. Joqarıda jańa xabar jiberiń.",
      adminReply: "Admin juwabı",
      faq: "Kóp soralatın sawallar",
      open: "Ashıq",
      replied: "Juwap berilgen",
      closed: "Jabılǵan",
      faqItems: [
        { q: "Learning roadmap qalay isleydi?", a: "Hár bir pán bólim, modul hám sabaqlarǵa bólinedi. Sabaq hám mini examdı juwmaqlap keyingi kontentti ashıń." },
        { q: "XP qalay esaplanadı?", a: "XP sabaqlar, examlar, úy tapsırmaları, kúndelik faollıq hám reyting jetiskenlikleri arqalı beriledi." },
        { q: "Exam waqtında AI járdemshiden paydalanıw múmkin be?", a: "Bahalanatuǵın exam waqtında AI óshiriledi, biraq practice hám sabaqlarda paydalanıw múmkin." },
      ],
    },
    ru: {
      title: "Поддержка",
      description: "Связь с админом - ответы будут появляться здесь",
      newMessage: "Отправить новое сообщение",
      sent: "Сообщение отправлено! Админ скоро ответит.",
      subject: "Тема",
      subjectPlaceholder: "Проблема или вопрос",
      message: "Сообщение",
      messagePlaceholder: "Опишите подробнее...",
      send: "Отправить",
      myMessages: "Мои сообщения и ответы админа",
      noMessages: "Пока нет сообщений. Отправьте новое выше.",
      adminReply: "Ответ админа",
      faq: "Часто задаваемые вопросы",
      open: "Открыто",
      replied: "Есть ответ",
      closed: "Закрыто",
      faqItems: [
        { q: "Как работает learning roadmap?", a: "Каждый предмет делится на разделы, модули и уроки. Завершайте уроки и мини-экзамены, чтобы открывать следующий контент." },
        { q: "Как начисляется XP?", a: "XP даётся за уроки, экзамены, домашние задания, ежедневную активность и достижения в рейтинге." },
        { q: "Можно ли использовать AI-помощник во время экзамена?", a: "Во время оцениваемого экзамена AI отключён, но доступен в practice и уроках." },
      ],
    },
    en: {
      title: "Support",
      description: "Contact the admin - replies will appear here",
      newMessage: "Send a new message",
      sent: "Message sent! The admin will reply soon.",
      subject: "Subject",
      subjectPlaceholder: "Issue or question",
      message: "Message",
      messagePlaceholder: "Describe it in detail...",
      send: "Send",
      myMessages: "My messages and admin replies",
      noMessages: "No messages yet. Send a new one above.",
      adminReply: "Admin reply",
      faq: "Frequently asked questions",
      open: "Open",
      replied: "Replied",
      closed: "Closed",
      faqItems: [
        { q: "How does the learning roadmap work?", a: "Each subject is divided into sections, modules, and lessons. Complete lessons and mini exams to unlock the next content." },
        { q: "How is XP calculated?", a: "You earn XP from lessons, exams, homework, daily activity, and ranking achievements." },
        { q: "Can I use the AI assistant during exams?", a: "AI assistance is disabled during graded exams, but it is available in practice and lessons." },
      ],
    },
  }[language];

  const loadMessages = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("messages").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setMessages(data as Msg[]);
  }, [supabase, user]);

  useEffect(() => {
    void loadMessages();
    if (!user) return;
    const channel = supabase
      .channel("user-messages")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `user_id=eq.${user.id}` }, () => loadMessages())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user, loadMessages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !body.trim()) return;
    setSending(true);
    setError("");
    const { error: sendError } = await supabase.from("messages").insert({ user_id: user.id, subject: subject.trim(), body: body.trim() } as never);
    if (sendError) {
      setError(sendError.message);
      setSending(false);
      return;
    }
    setSubject("");
    setBody("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setSending(false);
    void loadMessages();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title={tx.title} description={tx.description} />

      <Card className="mb-8">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {tx.newMessage}
        </h3>
        {sent && <div className="p-3 mb-4 rounded-xl bg-success/10 border border-success/25 text-sm text-success flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {tx.sent}</div>}
        {error && <div className="p-3 mb-4 rounded-xl bg-danger/10 border border-danger/25 text-sm text-danger">{error}</div>}
        <form className="space-y-3" onSubmit={sendMessage}>
          <Input label={tx.subject} placeholder={tx.subjectPlaceholder} value={subject} onChange={(e) => setSubject(e.target.value)} required />
          <Textarea label={tx.message} placeholder={tx.messagePlaceholder} value={body} onChange={(e) => setBody(e.target.value)} required />
          <Button variant="primary" className="w-full" type="submit" loading={sending}>
            <Send className="w-4 h-4" /> {tx.send}
          </Button>
        </form>
      </Card>

      <Card className="mb-8">
        <h3 className="font-semibold mb-4">{tx.myMessages}</h3>
        {messages.length === 0 ? (
          <p className="text-center text-text-muted py-8">{tx.noMessages}</p>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="rounded-xl border border-border overflow-hidden">
                <div className="p-4 bg-surface-elevated/50">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-medium text-sm">{m.subject}</p>
                    <Badge variant={m.status === "open" ? "warning" : m.status === "replied" ? "success" : "muted"}>
                      {m.status === "open" ? tx.open : m.status === "replied" ? tx.replied : tx.closed}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-muted">{m.body}</p>
                  <p className="text-xs text-text-muted mt-2">{new Date(m.created_at).toLocaleString()}</p>
                </div>
                {m.admin_reply && (
                  <div className="p-4 bg-primary/10 border-t border-primary/20">
                    <p className="text-xs text-primary font-medium mb-1">{tx.adminReply} · {m.replied_at ? new Date(m.replied_at).toLocaleString() : ""}</p>
                    <p className="text-sm">{m.admin_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">{tx.faq}</h3>
        <div className="space-y-2">
          {tx.faqItems.map((item, i) => (
            <div key={item.q} className="border border-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-elevated/50 transition-colors"
              >
                <span className="font-medium text-sm">{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && <p className="px-4 pb-4 text-sm text-text-muted">{item.a}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

"use client";

import { Card, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/client";
import { formatNumber } from "@/lib/utils";
import {
  Activity,
  BookOpen,
  Database,
  MessageSquare,
  Sliders,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/admin/content", label: "Content", desc: "Darslar tahriri", icon: BookOpen },
  { href: "/admin/exams", label: "Exam Bank", desc: "Sub-section savollar", icon: Database },
  { href: "/admin/users", label: "Users", desc: "Email/parol, ban", icon: Users },
  { href: "/admin/messages", label: "Messages", desc: "Javob yuborish", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", desc: "Platform ko'rsatkichlari", icon: TrendingUp },
  { href: "/admin/ai-settings", label: "AI Settings", desc: "API key & context", icon: Sliders },
];

export default function AdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [openMessages, setOpenMessages] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const [users, online, msgs, qs] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_online", true),
        supabase.from("messages").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("exam_questions").select("*", { count: "exact", head: true }),
      ]);
      setTotalUsers(users.count ?? 0);
      setOnlineUsers(online.count ?? 0);
      setOpenMessages(msgs.count ?? 0);
      setTotalQuestions(qs.count ?? 0);
    };
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="TriCore platformasi boshqaruv paneli"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={formatNumber(totalUsers)} icon={Users} color="primary" />
        <StatCard label="Online Now" value={onlineUsers} icon={Activity} color="success" />
        <StatCard label="Exam savollar" value={totalQuestions} icon={Database} color="accent" />
        <StatCard label="Ochiq xabarlar" value={openMessages} icon={MessageSquare} color="warning" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card hover className="h-full">
              <item.icon className="w-8 h-8 text-primary mb-3" />
              <p className="font-semibold">{item.label}</p>
              <p className="text-xs text-text-muted mt-1">{item.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

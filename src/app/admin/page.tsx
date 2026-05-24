"use client";

import { Card, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAdminLessonStats } from "@/lib/data/admin-lessons";
import { adminMessages } from "@/lib/data/admin-messages";
import { adminUsers } from "@/lib/data/admin-users";
import { adminStats } from "@/lib/data/mock";
import { formatNumber } from "@/lib/utils";
import {
  Activity,
  BookOpen,
  Bot,
  Database,
  MessageSquare,
  Sliders,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/admin/content", label: "Content", desc: "Darslar tahriri", icon: BookOpen },
  { href: "/admin/exams", label: "Exam Bank", desc: "Sub-section savollar", icon: Database },
  { href: "/admin/users", label: "Users", desc: "Email/parol, ban", icon: Users },
  { href: "/admin/messages", label: "Messages", desc: "Javob yuborish", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", desc: "Platform ko'rsatkichlari", icon: TrendingUp },
  { href: "/admin/ai-settings", label: "AI Settings", desc: "API key & context", icon: Sliders },
];

export default function AdminDashboardPage() {
  const lessonStats = getAdminLessonStats();
  const openMessages = adminMessages.filter((m) => m.status === "open").length;
  const onlineUsers = adminUsers.filter((u) => u.onlineStatus === "online").length;

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="TriCore platformasi boshqaruv paneli"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={formatNumber(adminStats.totalUsers)} icon={Users} color="primary" />
        <StatCard label="Online Now" value={onlineUsers} icon={Activity} color="success" />
        <StatCard label="Darslar" value={lessonStats.lessons} icon={BookOpen} color="accent" />
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

      <Card className="mt-8">
        <p className="text-sm text-text-muted flex items-center gap-2">
          <Bot className="w-4 h-4 text-accent" />
          AI so&apos;rovlar (bugun): {formatNumber(adminStats.aiUsage)} — batafsil{" "}
          <Link href="/admin/analytics" className="text-primary hover:underline">
            Analytics
          </Link>
        </p>
      </Card>
    </div>
  );
}

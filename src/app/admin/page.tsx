"use client";

import { Card, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { adminUsers } from "@/lib/data/admin-users";
import { curricula } from "@/lib/data/curriculum";
import { adminStats } from "@/lib/data/mock";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import {
  Activity,
  Bot,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const chartData = [
  { month: "Jan", users: 8200 },
  { month: "Feb", users: 9100 },
  { month: "Mar", users: 10200 },
  { month: "Apr", users: 11500 },
  { month: "May", users: 12847 },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Curriculum, ma'lumotnoma, exam bank va foydalanuvchilar boshqaruvi"
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/content" className="glass-card rounded-2xl p-4 hover:border-primary/40 border border-border transition-colors block">
          <p className="font-semibold text-sm">Content</p>
          <p className="text-xs text-text-muted mt-1">
            {curricula.length} fan · Section/Sub-section · Ma&apos;lumotnoma · Exam bank
          </p>
        </Link>
        <Link href="/admin/users" className="glass-card rounded-2xl p-4 hover:border-primary/40 border border-border transition-colors block">
          <p className="font-semibold text-sm">Users</p>
          <p className="text-xs text-text-muted mt-1">
            {adminUsers.length} user · Email/parol va OAuth ma&apos;lumotlari
          </p>
        </Link>
        <Link href="/admin/analytics" className="glass-card rounded-2xl p-4 hover:border-primary/40 border border-border transition-colors block">
          <p className="font-semibold text-sm">Analytics</p>
          <p className="text-xs text-text-muted mt-1">Qiyin mavzular, retention, AI usage</p>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={formatNumber(adminStats.totalUsers)}
          icon={Users}
          color="primary"
        />
        <StatCard
          label="Active Users"
          value={formatNumber(adminStats.activeUsers)}
          icon={Activity}
          color="accent"
        />
        <StatCard
          label="Revenue"
          value={`$${formatNumber(adminStats.revenue)}`}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          label="Completion Rate"
          value={`${adminStats.completionRate}%`}
          icon={TrendingUp}
          color="secondary"
        />
        <StatCard
          label="AI Usage"
          value={formatNumber(adminStats.aiUsage)}
          icon={Bot}
          color="warning"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4">User Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="users" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Live Platform</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/20">
              <span className="text-sm">Online Users</span>
              <span className="text-2xl font-bold text-success">247</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
              <span className="text-sm">Active Lessons</span>
              <span className="text-2xl font-bold text-primary">89</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-accent/20">
              <span className="text-sm">Support Chats</span>
              <span className="text-2xl font-bold text-accent">12</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

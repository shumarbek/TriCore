"use client";

import { Card, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { adminStats } from "@/lib/data/mock";
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
        description="Platform overview and key metrics"
      />

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

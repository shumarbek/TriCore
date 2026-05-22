"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  aiRecommendations,
  badges,
  recentActivity,
  userStats,
} from "@/lib/data/mock";
import { formatNumber } from "@/lib/utils";
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Flame,
  Medal,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const chartData = userStats.weeklyHours.map((h, i) => ({
  day: weekDays[i],
  hours: h,
}));

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your scientific learning command center"
        action={
          <Link href="/learning">
            <Button variant="primary">Continue Learning</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Overall Progress" value={`${userStats.overallProgress}%`} icon={TrendingUp} color="primary" delay={0} />
        <StatCard label="Daily Streak" value={`${userStats.dailyStreak} days`} icon={Flame} color="warning" trend="+2 this week" delay={0.05} />
        <StatCard label="Lessons Done" value={userStats.completedLessons} icon={BookOpen} color="accent" delay={0.1} />
        <StatCard label="Exams Passed" value={userStats.examsPassed} icon={CheckCircle} color="success" delay={0.15} />
        <StatCard label="XP Points" value={formatNumber(userStats.xp)} icon={Zap} color="secondary" delay={0.2} />
        <StatCard label="Global Rank" value={`#${formatNumber(userStats.rank)}`} icon={Medal} color="primary" delay={0.25} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2" delay={0.3}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Weekly Study Analytics
            </h3>
            <Badge variant="accent">23.5 hrs this week</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                />
                <Area type="monotone" dataKey="hours" stroke="var(--primary)" fill="url(#hoursGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={0.35}>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-warning" />
            Level {userStats.level}
          </h3>
          <ProgressBar value={68} className="mb-2" />
          <p className="text-xs text-text-muted mb-4">2,580 XP to Level 13</p>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.name}
                title={b.name}
                className={`text-lg p-2 rounded-xl border ${
                  b.earned
                    ? "bg-primary/10 border-primary/20"
                    : "opacity-40 grayscale border-border"
                }`}
              >
                {b.icon}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card delay={0.4}>
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <ul className="space-y-3">
            {recentActivity.map((a) => (
              <li key={a.title} className="flex items-start gap-3 p-3 rounded-xl bg-surface-elevated/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {a.type === "lesson" && <BookOpen className="w-4 h-4 text-primary" />}
                  {a.type === "exam" && <Target className="w-4 h-4 text-accent" />}
                  {a.type === "homework" && <CheckCircle className="w-4 h-4 text-success" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-text-muted">{a.subject} · {a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2" delay={0.45}>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-accent" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {aiRecommendations.map((r) => (
              <div
                key={r.title}
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        r.type === "next" ? "default" : r.type === "weak" ? "warning" : "accent"
                      }
                    >
                      {r.type === "next" ? "Next" : r.type === "weak" ? "Weak Topic" : "Revision"}
                    </Badge>
                    <span className="text-sm font-medium">{r.title}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">{r.subject} — {r.reason}</p>
                </div>
                <Link href="/lessons/math-geo-plan-6">
                  <Button variant="ghost" size="sm">Start</Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

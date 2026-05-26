"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/contexts/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { formatNumber } from "@/lib/utils";
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Flame,
  Medal,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Stats {
  lessonsCompleted: number;
  examsPassed: number;
  rank: number;
}

const defaultWeekly = [
  { day: "Dush", minutes: 0 },
  { day: "Sesh", minutes: 0 },
  { day: "Chor", minutes: 0 },
  { day: "Pay", minutes: 0 },
  { day: "Jum", minutes: 0 },
  { day: "Shan", minutes: 0 },
  { day: "Yak", minutes: 0 },
];

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState<Stats>({ lessonsCompleted: 0, examsPassed: 0, rank: 0 });
  const [weekly, setWeekly] = useState(defaultWeekly);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const load = async () => {
      // Lessons completed
      const { count: lc } = await supabase
        .from("lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed");

      // Exams passed
      const { count: ep } = await supabase
        .from("exam_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("score", 60);

      // Rank (XP bo'yicha)
      const { count: higherXp } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gt("xp", profile?.xp ?? 0);

      setStats({
        lessonsCompleted: lc ?? 0,
        examsPassed: ep ?? 0,
        rank: (higherXp ?? 0) + 1,
      });

      // Weekly activity
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: actData } = await supabase
        .from("daily_activity")
        .select("date, time_spent_minutes")
        .eq("user_id", user.id)
        .gte("date", weekAgo.toISOString().slice(0, 10))
        .order("date");

      if (actData && actData.length > 0) {
        const days = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
        setWeekly(
          actData.map((d) => ({
            day: days[new Date(d.date).getDay()] || d.date,
            minutes: d.time_spent_minutes,
          }))
        );
      }
    };
    load();
  }, [user, profile?.xp]);

  const xpForNextLevel = (profile?.level ?? 1) * 1000;
  const xpInLevel = (profile?.xp ?? 0) % 1000;
  const levelProgress = Math.round((xpInLevel / xpForNextLevel) * 100);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Xush kelibsiz, ${profile?.full_name || "User"}!`}
        action={
          <Link href="/learning">
            <Button variant="primary">Davom etish</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="XP" value={formatNumber(profile?.xp ?? 0)} icon={Zap} color="secondary" delay={0} />
        <StatCard label="Streak" value={`${profile?.streak ?? 0} kun`} icon={Flame} color="warning" delay={0.05} />
        <StatCard label="Darslar" value={stats.lessonsCompleted} icon={BookOpen} color="accent" delay={0.1} />
        <StatCard label="Imtihonlar" value={stats.examsPassed} icon={CheckCircle} color="success" delay={0.15} />
        <StatCard label="Level" value={profile?.level ?? 1} icon={TrendingUp} color="primary" delay={0.2} />
        <StatCard label="Reyting" value={`#${formatNumber(stats.rank)}`} icon={Medal} color="primary" delay={0.25} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2" delay={0.3}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Haftalik faollik
            </h3>
            <Badge variant="accent">
              {weekly.reduce((s, d) => s + d.minutes, 0)} daqiqa
            </Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly}>
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
                <Area type="monotone" dataKey="minutes" stroke="var(--primary)" fill="url(#hoursGrad)" strokeWidth={2} name="Daqiqa" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={0.35}>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-warning" />
            Level {profile?.level ?? 1}
          </h3>
          <ProgressBar value={levelProgress} className="mb-2" />
          <p className="text-xs text-text-muted mb-4">
            {1000 - xpInLevel} XP keyingi levelga
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 rounded-lg bg-surface-elevated/50">
              <span className="text-text-muted">Total XP</span>
              <span className="font-bold">{(profile?.xp ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-surface-elevated/50">
              <span className="text-text-muted">Streak</span>
              <span className="font-bold">{profile?.streak ?? 0} kun</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-surface-elevated/50">
              <span className="text-text-muted">Reyting</span>
              <span className="font-bold">#{stats.rank}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/learning">
          <Card hover>
            <BookOpen className="w-8 h-8 text-primary mb-2" />
            <p className="font-semibold">O&apos;rganishni davom ettirish</p>
            <p className="text-xs text-text-muted mt-1">Roadmap bo&apos;yicha keyingi dars</p>
          </Card>
        </Link>
        <Link href="/practice-exams">
          <Card hover>
            <CheckCircle className="w-8 h-8 text-accent mb-2" />
            <p className="font-semibold">Practice Exam</p>
            <p className="text-xs text-text-muted mt-1">Bilimingizni sinab ko&apos;ring</p>
          </Card>
        </Link>
        <Link href="/ai-assistant">
          <Card hover>
            <Zap className="w-8 h-8 text-secondary mb-2" />
            <p className="font-semibold">AI Assistant</p>
            <p className="text-xs text-text-muted mt-1">Savollar bering, tushuntirishlar oling</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}

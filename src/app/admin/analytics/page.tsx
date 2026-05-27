"use client";

import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const emptyWeek = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"];

const tooltipStyle = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
  },
};

export default function AdminAnalyticsPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [todayActive, setTodayActive] = useState(0);
  const [todayAi, setTodayAi] = useState(0);
  const [registrations, setRegistrations] = useState<Array<{ month: string; count: number }>>([]);
  const [dailyActive, setDailyActive] = useState(emptyWeek.map((day) => ({ day, users: 0 })));
  const [aiUsage, setAiUsage] = useState(emptyWeek.map((day) => ({ day, requests: 0 })));
  const [usersBySubject, setUsersBySubject] = useState([
    { name: "Matematika", value: 0, color: "var(--primary)" },
    { name: "Fizika", value: 0, color: "var(--secondary)" },
    { name: "Kimyo", value: 0, color: "var(--success)" },
  ]);

  useEffect(() => {
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    const load = async () => {
      const [{ count: users }, { count: active }, { data: activity }, { data: ai }, { data: profiles }, { data: progress }] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("daily_activity").select("*", { count: "exact", head: true }).eq("date", today),
          supabase.from("daily_activity").select("date, ai_requests").order("date", { ascending: false }).limit(7),
          supabase.from("ai_usage").select("created_at").order("created_at", { ascending: false }).limit(200),
          supabase.from("profiles").select("created_at").order("created_at", { ascending: false }).limit(500),
          supabase.from("lesson_progress").select("subject_id, user_id").eq("status", "completed"),
        ]);
      setTotalUsers(users ?? 0);
      setTodayActive(active ?? 0);

      const days = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
      const daily = emptyWeek.map((day) => ({ day, users: 0 }));
      for (const row of ((activity ?? []) as Array<{ date: string; ai_requests: number }>)) {
        const label = days[new Date(row.date).getDay()];
        const item = daily.find((d) => d.day === label);
        if (item) item.users += 1;
      }
      setDailyActive(daily);
      setTodayAi(((activity ?? []) as Array<{ date: string; ai_requests: number }>).find((x) => x.date === today)?.ai_requests ?? 0);

      const aiDaily = emptyWeek.map((day) => ({ day, requests: 0 }));
      for (const row of ((ai ?? []) as Array<{ created_at: string }>)) {
        const label = days[new Date(row.created_at).getDay()];
        const item = aiDaily.find((d) => d.day === label);
        if (item) item.requests += 1;
      }
      setAiUsage(aiDaily);

      const monthMap = new Map<string, number>();
      for (const row of ((profiles ?? []) as Array<{ created_at: string }>)) {
        const label = new Date(row.created_at).toLocaleString("uz-UZ", { month: "short" });
        monthMap.set(label, (monthMap.get(label) ?? 0) + 1);
      }
      setRegistrations([...monthMap.entries()].slice(0, 6).reverse().map(([month, count]) => ({ month, count })));

      const subjectUsers = new Map<string, Set<string>>();
      for (const row of ((progress ?? []) as Array<{ subject_id: string; user_id: string }>)) {
        if (!subjectUsers.has(row.subject_id)) subjectUsers.set(row.subject_id, new Set());
        subjectUsers.get(row.subject_id)!.add(row.user_id);
      }
      setUsersBySubject([
        { name: "Matematika", value: subjectUsers.get("mathematics")?.size ?? 0, color: "var(--primary)" },
        { name: "Fizika", value: subjectUsers.get("physics")?.size ?? 0, color: "var(--secondary)" },
        { name: "Kimyo", value: subjectUsers.get("chemistry")?.size ?? 0, color: "var(--success)" },
      ]);
    };
    load();
  }, []);

  const topSubject = usersBySubject.reduce((a, b) => (b.value > a.value ? b : a), usersBySubject[0]);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Platformaga qo'shilish, kunlik aktivlik, AI foydalanish, fan bo'yicha userlar"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-sm text-text-muted">Jami ro&apos;yxatdan o&apos;tgan</p>
          <p className="text-3xl font-bold mt-1">{totalUsers.toLocaleString()}</p>
          <p className="text-xs text-text-muted mt-1">profiles jadvali</p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">Bugun aktiv</p>
          <p className="text-3xl font-bold mt-1">{todayActive.toLocaleString()}</p>
          <p className="text-xs text-text-muted mt-1">DAU</p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">AI so&apos;rovlar (bugun)</p>
          <p className="text-3xl font-bold mt-1">{todayAi.toLocaleString()}</p>
          <p className="text-xs text-accent mt-1">daily_activity</p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">Eng ko&apos;p fan</p>
          <p className="text-3xl font-bold mt-1">{topSubject.name}</p>
          <p className="text-xs text-text-muted mt-1">{topSubject.value.toLocaleString()} user</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="font-semibold mb-4">Platformaga qo&apos;shilish (oylik)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Yangi user" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Kunlik aktivlik (DAU)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyActive}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: "var(--accent)" }}
                  name="Aktiv userlar"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4">AI Assistant foydalanishi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="requests" fill="var(--secondary)" radius={[6, 6, 0, 0]} name="So'rovlar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">O&apos;rganilayotgan fan bo&apos;yicha userlar</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usersBySubject}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {usersBySubject.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex justify-center gap-4 mt-2 text-sm text-text-muted">
            {usersBySubject.map((s) => (
              <li key={s.name}>
                {s.name}: {s.value.toLocaleString()}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

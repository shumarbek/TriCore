"use client";

import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
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

const registrations = [
  { month: "Yan", count: 420 },
  { month: "Fev", count: 680 },
  { month: "Mar", count: 920 },
  { month: "Apr", count: 1100 },
  { month: "May", count: 1450 },
];

const dailyActive = [
  { day: "Dush", users: 890 },
  { day: "Sesh", users: 1020 },
  { day: "Chor", users: 980 },
  { day: "Pay", users: 1150 },
  { day: "Jum", users: 1280 },
  { day: "Shan", users: 1420 },
  { day: "Yak", users: 1100 },
];

const aiUsage = [
  { day: "Dush", requests: 2100 },
  { day: "Sesh", requests: 2450 },
  { day: "Chor", requests: 1980 },
  { day: "Pay", requests: 2890 },
  { day: "Jum", requests: 3120 },
  { day: "Shan", requests: 3500 },
  { day: "Yak", requests: 2800 },
];

const usersBySubject = [
  { name: "Matematika", value: 4820, color: "var(--primary)" },
  { name: "Fizika", value: 3910, color: "var(--secondary)" },
  { name: "Kimyo", value: 2140, color: "var(--success)" },
];

const tooltipStyle = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
  },
};

export default function AdminAnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Platformaga qo'shilish, kunlik aktivlik, AI foydalanish, fan bo'yicha userlar"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-sm text-text-muted">Jami ro&apos;yxatdan o&apos;tgan</p>
          <p className="text-3xl font-bold mt-1">12,847</p>
          <p className="text-xs text-success mt-1">+12% oylik</p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">Bugun aktiv</p>
          <p className="text-3xl font-bold mt-1">3,421</p>
          <p className="text-xs text-text-muted mt-1">DAU</p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">AI so&apos;rovlar (bugun)</p>
          <p className="text-3xl font-bold mt-1">3,120</p>
          <p className="text-xs text-accent mt-1">+8% kechagidan</p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">Eng ko&apos;p fan</p>
          <p className="text-3xl font-bold mt-1">Math</p>
          <p className="text-xs text-text-muted mt-1">4,820 user</p>
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

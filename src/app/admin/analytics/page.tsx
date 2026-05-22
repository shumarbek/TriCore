"use client";

import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const retentionData = [
  { week: "W1", rate: 92 },
  { week: "W2", rate: 78 },
  { week: "W3", rate: 65 },
  { week: "W4", rate: 58 },
];

const difficultTopics = [
  { topic: "Trigonometry", subject: "Math", failRate: 42 },
  { topic: "Electromagnetism", subject: "Physics", failRate: 38 },
  { topic: "Organic Reactions", subject: "Chemistry", failRate: 35 },
  { topic: "Calculus Basics", subject: "Math", failRate: 31 },
];

const aiUsageData = [
  { day: "Mon", requests: 2100 },
  { day: "Tue", requests: 2450 },
  { day: "Wed", requests: 1980 },
  { day: "Thu", requests: 2890 },
  { day: "Fri", requests: 3120 },
];

export default function AdminAnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Difficult topics, retention, scores, watch time, AI usage"
      />

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="font-semibold mb-4">User Retention</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                />
                <Line type="monotone" dataKey="rate" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">AI Assistant Usage</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiUsageData}>
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
                <Bar dataKey="requests" fill="var(--secondary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Most Difficult Topics</h3>
        <div className="space-y-4">
          {difficultTopics.map((t) => (
            <div key={t.topic}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{t.topic}</span>
                <span className="text-text-muted">{t.subject} · {t.failRate}% fail rate</span>
              </div>
              <ProgressBar value={t.failRate} color="warning" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <Card>
          <p className="text-sm text-text-muted">Avg Exam Score</p>
          <p className="text-3xl font-bold mt-1">74%</p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">Avg Watch Time</p>
          <p className="text-3xl font-bold mt-1">18m</p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">Homework Submit Rate</p>
          <p className="text-3xl font-bold mt-1">82%</p>
        </Card>
      </div>
    </div>
  );
}

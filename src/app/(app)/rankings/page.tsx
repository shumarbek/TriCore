"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { globalRankings } from "@/lib/data/mock";
import { cn } from "@/lib/utils";
import { Crown, Flame, Medal, Zap } from "lucide-react";
import { useState } from "react";

const periods = ["Global", "Weekly", "Monthly"] as const;
const subjectFilters = ["All Subjects", "Mathematics", "Physics", "Chemistry"];

export default function RankingsPage() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("Global");
  const [subject, setSubject] = useState("All Subjects");

  return (
    <div>
      <PageHeader
        title="Rankings"
        description="Compete globally and track your position across STEM subjects"
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              period === p
                ? "bg-primary text-white"
                : "bg-surface-elevated text-text-muted hover:text-text"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {subjectFilters.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSubject(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
              subject === s
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-text-muted"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        {globalRankings.slice(0, 3).map((user, i) => (
          <Card
            key={user.rank}
            className={cn(
              "text-center",
              i === 0 && "ring-2 ring-warning/50"
            )}
            delay={i * 0.1}
          >
            <div className="flex justify-center mb-3">
              {i === 0 ? (
                <Crown className="w-8 h-8 text-warning" />
              ) : (
                <Medal className={cn("w-8 h-8", i === 1 ? "text-text-muted" : "text-amber-700")} />
              )}
            </div>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
              {user.avatar}
            </div>
            <p className="font-semibold mt-3">{user.name}</p>
            <p className="text-sm text-primary font-medium">{user.xp.toLocaleString()} XP</p>
            <p className="text-xs text-text-muted flex items-center justify-center gap-1 mt-1">
              <Flame className="w-3 h-3 text-warning" /> {user.streak} day streak
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="space-y-2">
          {globalRankings.map((user) => (
            <div
              key={user.rank}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl transition-colors",
                user.isYou
                  ? "bg-primary/10 border border-primary/25"
                  : "hover:bg-surface-elevated/50"
              )}
            >
              <span
                className={cn(
                  "w-8 text-center font-bold",
                  user.rank <= 3 ? "text-warning" : "text-text-muted"
                )}
              >
                #{user.rank}
              </span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-white text-sm font-bold">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {user.name}
                  {user.isYou && (
                    <Badge variant="default" className="ml-2">You</Badge>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium flex items-center gap-1 justify-end">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  {user.xp.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted">{user.streak}d streak</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6">
        <h4 className="font-semibold mb-3">Ranking Factors</h4>
        <div className="flex flex-wrap gap-2">
          {["XP Points", "Lesson Completion", "Exam Scores", "Streaks", "Homework Quality"].map(
            (f) => (
              <Badge key={f} variant="muted">{f}</Badge>
            )
          )}
        </div>
      </Card>
    </div>
  );
}

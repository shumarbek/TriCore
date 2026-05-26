"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/contexts/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Crown, Flame, Medal, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface RankUser {
  id: string;
  full_name: string;
  username: string;
  xp: number;
  streak: number;
  level: number;
}

export default function RankingsPage() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<RankUser[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, full_name, username, xp, streak, level")
      .eq("status", "active")
      .order("xp", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setRankings(data as RankUser[]);
      });
  }, []);

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div>
      <PageHeader
        title="Rankings"
        description="XP bo'yicha global reyting — barcha STEM fanlar"
      />

      {rankings.length >= 3 && (
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          {rankings.slice(0, 3).map((u, i) => (
            <Card
              key={u.id}
              className={cn("text-center", i === 0 && "ring-2 ring-warning/50")}
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
                {initials(u.full_name)}
              </div>
              <p className="font-semibold mt-3">{u.full_name}</p>
              <p className="text-sm text-primary font-medium">{u.xp.toLocaleString()} XP</p>
              <p className="text-xs text-text-muted flex items-center justify-center gap-1 mt-1">
                <Flame className="w-3 h-3 text-warning" /> {u.streak} kun streak
              </p>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <div className="space-y-2">
          {rankings.map((u, i) => {
            const isYou = u.id === user?.id;
            return (
              <div
                key={u.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl transition-colors",
                  isYou
                    ? "bg-primary/10 border border-primary/25"
                    : "hover:bg-surface-elevated/50"
                )}
              >
                <span
                  className={cn(
                    "w-8 text-center font-bold",
                    i < 3 ? "text-warning" : "text-text-muted"
                  )}
                >
                  #{i + 1}
                </span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-white text-sm font-bold">
                  {initials(u.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {u.full_name}
                    {isYou && <Badge variant="default" className="ml-2">Siz</Badge>}
                  </p>
                  <p className="text-xs text-text-muted">@{u.username} · Level {u.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium flex items-center gap-1 justify-end">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    {u.xp.toLocaleString()}
                  </p>
                  <p className="text-xs text-text-muted">{u.streak}k streak</p>
                </div>
              </div>
            );
          })}
          {rankings.length === 0 && (
            <p className="text-center text-text-muted py-8">
              Hali reyting ma&apos;lumotlari yo&apos;q.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

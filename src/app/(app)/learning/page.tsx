"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/contexts/AuthProvider";
import { getLessonsBySubject } from "@/lib/data/curriculum";
import { subjects } from "@/lib/data/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function LearningPage() {
  const { user } = useAuth();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const load = async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id);
      const rows = (data ?? []) as Array<{ lesson_id: string; status: string }>;
      const done = new Set(rows.filter((x) => x.status === "completed").map((x) => x.lesson_id));
      setCompletedIds(done);
    };
    load();
    const channel = supabase
      .channel(`learning-progress-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lesson_progress", filter: `user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const subjectProgress = useMemo(() => {
    return Object.fromEntries(
      subjects.map((s) => {
        const lessons = getLessonsBySubject(s.id);
        const completed = lessons.filter((l) => completedIds.has(l.id)).length;
        const progress = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
        return [s.id, progress];
      })
    ) as Record<string, number>;
  }, [completedIds]);

  return (
    <div>
      <PageHeader
        title="Learning"
        description="Choose a subject and follow your structured roadmap to mastery"
      />

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {subjects.map((subject, i) => (
          <Link key={subject.id} href={`/learning/${subject.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hover className="h-full relative overflow-hidden group">
                <div
                  className={cn(
                    "absolute inset-0 opacity-10 bg-gradient-to-br",
                    subject.color
                  )}
                />
                <div className="relative">
                  <span className="text-4xl">{subject.icon}</span>
                  <h3 className="text-xl font-bold mt-4">{subject.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {subject.sections.slice(0, 3).map((s) => (
                      <Badge key={s} variant="muted">
                        {s}
                      </Badge>
                    ))}
                    {subject.sections.length > 3 && (
                      <Badge variant="muted">+{subject.sections.length - 3}</Badge>
                    )}
                  </div>
                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-text-muted mb-1">
                      <span>Progress</span>
                      <span>{subjectProgress[subject.id] ?? 0}%</span>
                    </div>
                    <ProgressBar value={subjectProgress[subject.id] ?? 0} />
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                    Open Roadmap <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Learning Flow</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
          {["Subject", "Section", "Module", "Lesson", "Mini Exam", "Homework", "Final Exam"].map(
            (step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium">
                  {step}
                </span>
                {i < arr.length - 1 && <span className="text-border">→</span>}
              </span>
            )
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <Badge variant="muted"><Lock className="w-3 h-3 inline mr-1" />Locked</Badge>
          <Badge variant="default">Available</Badge>
          <Badge variant="accent">In Progress</Badge>
          <Badge variant="success">Completed</Badge>
        </div>
      </Card>
    </div>
  );
}

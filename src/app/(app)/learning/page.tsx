"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/contexts/AuthProvider";
import { useLanguage } from "@/contexts/LanguageProvider";
import { buildRuntimeCurricula, type CurriculumStructureNode } from "@/lib/data/curriculum/runtime";
import type { LessonContentOverride } from "@/lib/lesson-content";
import { useLiveRefresh } from "@/lib/live-refresh";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function LearningPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [contentRows, setContentRows] = useState<LessonContentOverride[]>([]);
  const [structureRows, setStructureRows] = useState<CurriculumStructureNode[]>([]);
  const supabase = useMemo(() => createClient(), []);
  const tx = {
    uz: { title: "Learning", description: "Fanni tanlang va roadmap bo'yicha harakat qiling", progress: "Progress", open: "Roadmapni ochish", flow: "Learning Flow", locked: "Qulflangan", available: "Ochiq", inProgress: "Jarayonda", completed: "Yakunlangan" },
    kaa: { title: "Oqiw", description: "Pándi tańlap roadmap boyınsha júriń", progress: "Progress", open: "Roadmaptı ashıw", flow: "Oqıw aǵımı", locked: "Qulıplangan", available: "Ashıq", inProgress: "Jarayonda", completed: "Juwmaqlanǵan" },
    ru: { title: "Обучение", description: "Выберите предмет и двигайтесь по roadmap", progress: "Прогресс", open: "Открыть roadmap", flow: "Схема обучения", locked: "Заблокировано", available: "Открыто", inProgress: "В процессе", completed: "Завершено" },
    en: { title: "Learning", description: "Choose a subject and follow your roadmap", progress: "Progress", open: "Open Roadmap", flow: "Learning Flow", locked: "Locked", available: "Available", inProgress: "In Progress", completed: "Completed" },
  }[language];

  const load = useCallback(async () => {
      const [progressResult, lessonResult, structureResult] = await Promise.all([
        user
          ? supabase.from("lesson_progress").select("lesson_id, status").eq("user_id", user.id)
          : Promise.resolve({ data: [] as Array<{ lesson_id: string; status: string }> }),
        supabase.from("lesson_content").select("*"),
        supabase.from("curriculum_structure").select("*").order("order_index", { ascending: true }),
      ]);

      const rows = (progressResult.data ?? []) as Array<{ lesson_id: string; status: string }>;
      const done = new Set(rows.filter((x) => x.status === "completed").map((x) => x.lesson_id));
      setCompletedIds(done);
      setContentRows((lessonResult.data ?? []) as LessonContentOverride[]);
      setStructureRows((structureResult.data ?? []) as CurriculumStructureNode[]);
  }, [supabase, user]);

  useLiveRefresh(() => {
    void load();
  });

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
    const channels = [
      supabase
        .channel(`learning-curriculum-structure`)
        .on("postgres_changes", { event: "*", schema: "public", table: "curriculum_structure" }, () => void load())
        .subscribe(),
      supabase
        .channel(`learning-lesson-content`)
        .on("postgres_changes", { event: "*", schema: "public", table: "lesson_content" }, () => void load())
        .subscribe(),
    ];

    if (user) {
      channels.push(
        supabase
          .channel(`learning-progress-${user.id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "lesson_progress", filter: `user_id=eq.${user.id}` },
            () => void load()
          )
          .subscribe()
      );
    }

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [load, supabase, user]);

  const runtimeSubjects = useMemo(() => {
    return buildRuntimeCurricula(structureRows, contentRows).map((subject) => ({
      id: subject.id,
      name: subject.name,
      icon: subject.id === "mathematics" ? "∑" : subject.id === "physics" ? "⚛" : "⚗",
      color:
        subject.id === "mathematics"
          ? "from-blue-500 to-cyan-400"
          : subject.id === "physics"
            ? "from-violet-500 to-purple-400"
            : "from-emerald-500 to-teal-400",
      sections: subject.sections.map((section) => section.name),
      lessonCount: subject.sections.reduce(
        (total, section) => total + section.subSections.reduce((sum, subSection) => sum + subSection.lessons.length, 0),
        0
      ),
    }));
  }, [contentRows, structureRows]);

  const subjectProgress = useMemo(() => {
    return Object.fromEntries(
      runtimeSubjects.map((subject) => {
        const completed = buildRuntimeCurricula(structureRows, contentRows)
          .find((item) => item.id === subject.id)
          ?.sections.flatMap((section) => section.subSections.flatMap((subSection) => subSection.lessons))
          .filter((lesson) => completedIds.has(lesson.id)).length ?? 0;
        const progress = subject.lessonCount ? Math.round((completed / subject.lessonCount) * 100) : 0;
        return [subject.id, progress];
      })
    ) as Record<string, number>;
  }, [completedIds, runtimeSubjects, structureRows, contentRows]);

  return (
    <div>
      <PageHeader
        title={tx.title}
        description={tx.description}
      />

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {runtimeSubjects.map((subject, i) => (
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
                      <span>{tx.progress}</span>
                      <span>{subjectProgress[subject.id] ?? 0}%</span>
                    </div>
                    <ProgressBar value={subjectProgress[subject.id] ?? 0} />
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                    {tx.open} <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">{tx.flow}</h3>
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
          <Badge variant="muted"><Lock className="w-3 h-3 inline mr-1" />{tx.locked}</Badge>
          <Badge variant="default">{tx.available}</Badge>
          <Badge variant="accent">{tx.inProgress}</Badge>
          <Badge variant="success">{tx.completed}</Badge>
        </div>
      </Card>
    </div>
  );
}

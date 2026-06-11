"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useLanguage } from "@/contexts/LanguageProvider";
import { buildRuntimeCurricula, type CurriculumStructureNode } from "@/lib/data/curriculum/runtime";
import type { LessonContentOverride } from "@/lib/lesson-content";
import { useLiveRefresh } from "@/lib/live-refresh";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { BookOpen, Lock, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const statusBadge = {
  completed: "success" as const,
  in_progress: "accent" as const,
  available: "default" as const,
  locked: "muted" as const,
};

export default function LessonsPage() {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<string>("all");
  const [contentRows, setContentRows] = useState<LessonContentOverride[]>([]);
  const [structureRows, setStructureRows] = useState<CurriculumStructureNode[]>([]);
  const supabase = useMemo(() => createClient(), []);
  const allLessons = useMemo(() => {
    return buildRuntimeCurricula(structureRows, contentRows).flatMap((subject) =>
      subject.sections.flatMap((section) =>
        section.subSections.flatMap((subSection) =>
          subSection.lessons.map((lesson) => ({
            ...lesson,
            subjectId: subject.id,
            subjectName: subject.name,
            sectionId: section.id,
            sectionName: section.name,
            subSectionId: subSection.id,
            subSectionName: subSection.name,
          }))
        )
      )
    );
  }, [contentRows, structureRows]);

  const loadOverrides = useCallback(async () => {
      const [{ data: lessonData }, { data: structureData }] = await Promise.all([
        supabase.from("lesson_content").select("*"),
        supabase.from("curriculum_structure").select("*").order("order_index", { ascending: true }),
      ]);
      setContentRows((lessonData ?? []) as LessonContentOverride[]);
      setStructureRows((structureData ?? []) as CurriculumStructureNode[]);
  }, [supabase]);

  useLiveRefresh(() => {
    void loadOverrides();
  });

  useEffect(() => {
    queueMicrotask(() => {
      void loadOverrides();
    });
    const lessonChannel = supabase
      .channel("lesson-content-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lesson_content" },
        () => {
          void loadOverrides();
        }
      )
      .subscribe();
    const structureChannel = supabase
      .channel("lesson-structure-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "curriculum_structure" },
        () => {
          void loadOverrides();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lessonChannel);
      supabase.removeChannel(structureChannel);
    };
  }, [loadOverrides, supabase]);

  const filtered = filter === "all" ? allLessons : allLessons.filter((l) => l.subjectId === filter);
  const active = filtered.slice(0, 60);
  const tx = {
    uz: {
      title: "Darslar",
      description: "Barcha darslar - ma'lumotnoma, qaydlar va uy vazifalari har bir dars ichida",
      all: "Barchasi",
      completed: "Yakunlangan",
      progress: "Jarayonda",
      available: "Ochiq",
      locked: "Qulflangan",
      open: "Ochish",
      mathematics: "Matematika",
      physics: "Fizika",
      chemistry: "Kimyo",
    },
    kaa: {
      title: "Sabaqlar",
      description: "Barlıq sabaqlar - maglumatnama, qaydlar hám úy tapsırmaları hár bir sabaq ishinde",
      all: "Barlığı",
      completed: "Juwmaqlanǵan",
      progress: "Jarayonda",
      available: "Ashıq",
      locked: "Qulıplanǵan",
      open: "Ashıw",
      mathematics: "Matematika",
      physics: "Fizika",
      chemistry: "Kimya",
    },
    ru: {
      title: "Уроки",
      description: "Все уроки - справка, заметки и домашние задания внутри каждого урока",
      all: "Все",
      completed: "Завершено",
      progress: "В процессе",
      available: "Открыто",
      locked: "Заблокировано",
      open: "Открыть",
      mathematics: "Математика",
      physics: "Физика",
      chemistry: "Химия",
    },
    en: {
      title: "Lessons",
      description: "All lessons - references, notes, and homework inside each lesson",
      all: "All",
      completed: "Completed",
      progress: "In Progress",
      available: "Available",
      locked: "Locked",
      open: "Open",
      mathematics: "Mathematics",
      physics: "Physics",
      chemistry: "Chemistry",
    },
  }[language];
  const statusLabel = { completed: tx.completed, in_progress: tx.progress, available: tx.available, locked: tx.locked };

  return (
    <div>
      <PageHeader title={tx.title} description={tx.description} />

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "all", label: tx.all },
          { id: "mathematics", label: tx.mathematics },
          { id: "physics", label: tx.physics },
          { id: "chemistry", label: tx.chemistry },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
              filter === f.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-text-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {active.map((lesson, i) => (
          <Card key={lesson.id} delay={Math.min(i * 0.02, 0.3)} hover>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                {lesson.status === "in_progress" ? (
                  <Play className="w-5 h-5 text-primary" />
                ) : lesson.status === "locked" ? (
                  <Lock className="w-5 h-5 text-text-muted" />
                ) : (
                  <BookOpen className="w-5 h-5 text-success" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{lesson.title}</h3>
                <p className="text-sm text-text-muted truncate">
                  {lesson.subjectName} · {lesson.sectionName} · {lesson.subSectionName}
                </p>
                {lesson.status === "in_progress" && <ProgressBar value={45} className="mt-2 max-w-xs" size="sm" />}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusBadge[lesson.status]}>{statusLabel[lesson.status]}</Badge>
                {lesson.status !== "locked" ? (
                  <Link href={`/lessons/${lesson.id}`}>
                    <Badge variant="accent">{tx.open}</Badge>
                  </Link>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

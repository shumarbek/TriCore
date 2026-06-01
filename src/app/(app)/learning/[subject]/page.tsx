"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/contexts/AuthProvider";
import { useLanguage } from "@/contexts/LanguageProvider";
import type { SubjectCurriculum } from "@/lib/data/curriculum";
import { buildRuntimeCurricula, type CurriculumStructureNode } from "@/lib/data/curriculum/runtime";
import type { LessonContentOverride } from "@/lib/lesson-content";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Lock, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusConfig = {
  completed: { icon: CheckCircle, badge: "success" as const },
  in_progress: { icon: Play, badge: "accent" as const },
  locked: { icon: Lock, badge: "muted" as const },
  available: { icon: Circle, badge: "default" as const },
};

export default function SubjectRoadmapPage() {
  const params = useParams();
  const subjectId = params.subject as string;
  const { user } = useAuth();
  const { language } = useLanguage();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const supabase = useMemo(() => createClient(), []);
  const [contentRows, setContentRows] = useState<LessonContentOverride[]>([]);
  const [structureRows, setStructureRows] = useState<CurriculumStructureNode[]>([]);
  const tx = {
    uz: {
      completed: "Yakunlangan",
      progress: "Jarayonda",
      locked: "Qulflangan",
      available: "Ochiq",
      notFound: "Fan topilmadi",
      continue: "Davom etish",
      subSections: "sub-bo'lim",
      lessons: "dars",
      description: "Bo'lim -> Sub-bo'lim -> Dars ko'rinishidagi ketma-ket roadmap",
    },
    kaa: {
      completed: "Juwmaqlanǵan",
      progress: "Jarayonda",
      locked: "Qulıplanǵan",
      available: "Ashıq",
      notFound: "Pán tabılmadı",
      continue: "Dawam etiw",
      subSections: "sub-bólim",
      lessons: "sabaq",
      description: "Bólim -> Sub-bólim -> Sabaq kórinisindegi izbe-iz roadmap",
    },
    ru: {
      completed: "Завершено",
      progress: "В процессе",
      locked: "Заблокировано",
      available: "Открыто",
      notFound: "Предмет не найден",
      continue: "Продолжить",
      subSections: "подразделов",
      lessons: "уроков",
      description: "Раздел -> Подраздел -> Урок в последовательной roadmap-структуре",
    },
    en: {
      completed: "Completed",
      progress: "In Progress",
      locked: "Locked",
      available: "Available",
      notFound: "Subject not found",
      continue: "Continue",
      subSections: "sub-sections",
      lessons: "lessons",
      description: "Section -> Sub-section -> Lesson sequence roadmap",
    },
  }[language];

  const displayCurriculum = useMemo<SubjectCurriculum | null>(() => {
    return buildRuntimeCurricula(structureRows, contentRows).find((item) => item.id === subjectId) ?? null;
  }, [contentRows, structureRows, subjectId]);

  const subjectMeta = useMemo(() => {
    if (!displayCurriculum) return null;
    return {
      id: displayCurriculum.id,
      name: displayCurriculum.name,
      icon: displayCurriculum.id === "mathematics" ? "∑" : displayCurriculum.id === "physics" ? "⚛" : "⚗",
    };
  }, [displayCurriculum]);

  useEffect(() => {
    const loadCurriculum = async () => {
      const [{ data: lessonData }, { data: structureData }] = await Promise.all([
        supabase.from("lesson_content").select("*"),
        supabase.from("curriculum_structure").select("*").order("order_index", { ascending: true }),
      ]);
      setContentRows((lessonData ?? []) as LessonContentOverride[]);
      setStructureRows((structureData ?? []) as CurriculumStructureNode[]);
    };

    const loadProgress = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id)
        .eq("subject_id", subjectId);
      const rows = (data ?? []) as Array<{ lesson_id: string; status: string }>;
      const done = new Set(rows.filter((x) => x.status === "completed").map((x) => x.lesson_id));
      setCompletedIds(done);
    };

    void loadCurriculum();
    void loadProgress();

    const channels = [
      supabase
        .channel(`lesson-content-subject-${subjectId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "lesson_content" },
          () => {
            void loadCurriculum();
          }
        )
        .subscribe(),
      supabase
        .channel(`curriculum-structure-subject-${subjectId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "curriculum_structure" },
          () => {
            void loadCurriculum();
          }
        )
        .subscribe(),
    ];

    if (user) {
      channels.push(
        supabase
          .channel(`subject-progress-${user.id}-${subjectId}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "lesson_progress", filter: `user_id=eq.${user.id}` },
            () => {
              void loadProgress();
            }
          )
          .subscribe()
      );
    }

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [subjectId, supabase, user]);

  const firstPendingId = useMemo(() => {
    if (!displayCurriculum) return null;
    for (const section of displayCurriculum.sections) {
      for (const sub of section.subSections) {
        const pending = sub.lessons.find((l) => !completedIds.has(l.id));
        if (pending) return pending.id;
      }
    }
    return null;
  }, [displayCurriculum, completedIds]);

  const continueLesson = displayCurriculum
    ? displayCurriculum.sections
        .flatMap((s) => s.subSections)
        .flatMap((sub) => sub.lessons)
        .find((l) => l.id === firstPendingId)
    : null;

  if (!subjectMeta || !displayCurriculum) {
    return <p className="text-text-muted">{tx.notFound}</p>;
  }

  return (
    <div>
      <PageHeader
        title={subjectMeta.name}
        description={tx.description}
        action={
          continueLesson ? (
            <Link href={`/lessons/${continueLesson.id}`}>
              <Button variant="primary">{tx.continue}</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="space-y-6">
        {displayCurriculum.sections.map((section, si) => (
          <Card key={section.id} delay={si * 0.05}>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <span className="text-2xl">{subjectMeta.icon}</span>
              {section.name}
            </h3>
            <p className="text-xs text-text-muted mb-4">
              {section.subSections.length} {tx.subSections} · {section.subSections.reduce((n, s) => n + s.lessons.length, 0)} {tx.lessons}
            </p>

            <div className="space-y-5">
              {section.subSections.map((sub) => (
                <div key={sub.id}>
                  <p className="text-sm font-semibold text-primary mb-2">{sub.name}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {sub.lessons.map((lesson) => {
                      const firstPendingInSub = sub.lessons.find((l) => !completedIds.has(l.id))?.id ?? null;
                      const status = completedIds.has(lesson.id)
                        ? "completed"
                        : lesson.id === firstPendingInSub
                          ? "in_progress"
                          : "locked";
                      const cfg = statusConfig[status];
                      const statusLabel = {
                        completed: tx.completed,
                        in_progress: tx.progress,
                        locked: tx.locked,
                        available: tx.available,
                      };
                      const Icon = cfg.icon;
                      const className = cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                        status === "locked"
                          ? "border-border opacity-60 cursor-not-allowed"
                          : "border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                      );
                      const inner = (
                        <>
                          <Icon
                            className={cn(
                              "w-4 h-4 flex-shrink-0",
                              status === "completed" && "text-success",
                              status === "in_progress" && "text-accent",
                              status === "locked" && "text-text-muted"
                            )}
                          />
                          <span className="text-sm font-medium flex-1 leading-snug">{lesson.title}</span>
                          <Badge variant={cfg.badge}>{statusLabel[status]}</Badge>
                        </>
                      );
                      return status === "locked" ? (
                        <div key={lesson.id} className={className}>
                          {inner}
                        </div>
                      ) : (
                        <Link key={lesson.id} href={`/lessons/${lesson.id}`} className={className}>
                          {inner}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

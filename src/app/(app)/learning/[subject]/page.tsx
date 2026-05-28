"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/contexts/AuthProvider";
import { getCurriculum } from "@/lib/data/curriculum";
import type { SubjectCurriculum } from "@/lib/data/curriculum";
import { subjects } from "@/lib/data/navigation";
import type { LessonContentOverride } from "@/lib/lesson-content";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Lock, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusConfig = {
  completed: { icon: CheckCircle, badge: "success" as const, label: "Yakunlangan" },
  in_progress: { icon: Play, badge: "accent" as const, label: "Jarayonda" },
  locked: { icon: Lock, badge: "muted" as const, label: "Qulflangan" },
  available: { icon: Circle, badge: "default" as const, label: "Ochiq" },
};

export default function SubjectRoadmapPage() {
  const params = useParams();
  const subjectId = params.subject as string;
  const { user } = useAuth();
  const subject = subjects.find((s) => s.id === subjectId);
  const curriculum = getCurriculum(subjectId);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const supabase = useMemo(() => createClient(), []);
  const [contentRows, setContentRows] = useState<LessonContentOverride[]>([]);

  const displayCurriculum = useMemo<SubjectCurriculum | null>(() => {
    if (!curriculum) return null;
    const baseIds = new Set(
      curriculum.sections.flatMap((section) =>
        section.subSections.flatMap((sub) => sub.lessons.map((lesson) => lesson.id))
      )
    );
    const overrides = new Map(contentRows.map((row) => [row.lesson_id, row]));

    const sections = curriculum.sections.map((section) => ({
      ...section,
      subSections: section.subSections.map((sub) => {
        const mergedBase = sub.lessons.map((lesson) => {
          const override = overrides.get(lesson.id);
          return override
            ? {
                ...lesson,
                title: override.title || lesson.title,
                order: override.order_index ?? lesson.order,
              }
            : lesson;
        });
        const customLessons = contentRows
          .filter(
            (row) =>
              !baseIds.has(row.lesson_id) &&
              row.subject_id === subjectId &&
              row.section_id === section.id &&
              row.sub_section_id === sub.id
          )
          .map((row) => ({
            id: row.lesson_id,
            title: row.title,
            order: row.order_index ?? 999,
            status: "available" as const,
          }));

        return {
          ...sub,
          lessons: [...mergedBase, ...customLessons].sort((a, b) => a.order - b.order),
        };
      }),
    }));

    return { ...curriculum, sections };
  }, [contentRows, curriculum, subjectId]);

  useEffect(() => {
    if (!curriculum) return;

    const loadTitles = async () => {
      const { data } = await supabase.from("lesson_content").select("*");
      setContentRows((data ?? []) as LessonContentOverride[]);
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

    void loadTitles();
    void loadProgress();

    const channels = [
      supabase
        .channel(`lesson-content-subject-${subjectId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "lesson_content" },
          () => {
            void loadTitles();
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
  }, [curriculum, subjectId, supabase, user]);

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

  if (!subject || !displayCurriculum) {
    return <p className="text-text-muted">Fan topilmadi</p>;
  }

  return (
    <div>
      <PageHeader
        title={subject.name}
        description="Section → Sub-section → Dars — ketma-ket roadmap"
        action={
          continueLesson ? (
            <Link href={`/lessons/${continueLesson.id}`}>
              <Button variant="primary">Davom etish</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="space-y-6">
        {displayCurriculum.sections.map((section, si) => (
          <Card key={section.id} delay={si * 0.05}>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <span className="text-2xl">{subject.icon}</span>
              {section.name}
            </h3>
            <p className="text-xs text-text-muted mb-4">
              {section.subSections.length} sub-section ·{" "}
              {section.subSections.reduce((n, s) => n + s.lessons.length, 0)} dars
            </p>

            <div className="space-y-5">
              {section.subSections.map((sub) => (
                <div key={sub.id}>
                  <p className="text-sm font-semibold text-primary mb-2">{sub.name}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {sub.lessons.map((lesson) => {
                      const firstPendingInSub =
                        sub.lessons.find((l) => !completedIds.has(l.id))?.id ?? null;
                      const status = completedIds.has(lesson.id)
                        ? "completed"
                        : lesson.id === firstPendingInSub
                          ? "in_progress"
                          : "locked";
                      const cfg = statusConfig[status];
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
                          <span className="text-sm font-medium flex-1 leading-snug">
                            {lesson.title}
                          </span>
                          <Badge variant={cfg.badge}>{cfg.label}</Badge>
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

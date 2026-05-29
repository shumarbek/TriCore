"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/contexts/AuthProvider";
import { buildRuntimeCurricula, findRuntimeLessonById, type CurriculumStructureNode } from "@/lib/data/curriculum/runtime";
import type { LessonContentOverride } from "@/lib/lesson-content";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Download, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function HomeworkPage() {
  const { user } = useAuth();
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [homeworkLinks, setHomeworkLinks] = useState<Record<string, string>>({});
  const [lessonRows, setLessonRows] = useState<LessonContentOverride[]>([]);
  const [structureRows, setStructureRows] = useState<CurriculumStructureNode[]>([]);
  const runtimeCurricula = useMemo(() => buildRuntimeCurricula(structureRows, lessonRows), [lessonRows, structureRows]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const load = async () => {
      const [
        { data: progressRows },
        { data: homeworkData },
        { data: lessonData },
        { data: structureData },
      ] = await Promise.all([
        supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("completed_at", { ascending: false }),
        supabase.from("lesson_content").select("lesson_id, homework_pdf"),
        supabase.from("lesson_content").select("*"),
        supabase.from("curriculum_structure").select("*").order("order_index", { ascending: true }),
      ]);
      setCompletedLessonIds(((progressRows ?? []) as Array<{ lesson_id: string }>).map((x) => x.lesson_id));
      setHomeworkLinks(
        Object.fromEntries(
          ((homeworkData ?? []) as Array<{ lesson_id: string; homework_pdf: string }>).map((row) => [
            row.lesson_id,
            row.homework_pdf,
          ])
        )
      );
      setLessonRows((lessonData ?? []) as LessonContentOverride[]);
      setStructureRows((structureData ?? []) as CurriculumStructureNode[]);
    };
    void load();
  }, [user]);

  const homeworkItems = useMemo(() => {
    const latestBySection = new Map<string, ReturnType<typeof findRuntimeLessonById>>();
    for (const lessonId of completedLessonIds) {
      const meta = findRuntimeLessonById(runtimeCurricula, lessonId);
      if (!meta) continue;
      const key = `${meta.subjectId}-${meta.sectionId}`;
      if (!latestBySection.has(key)) latestBySection.set(key, meta);
    }
    return [...latestBySection.values()].filter(Boolean).map((meta) => {
      const id = `hw-${meta!.lesson.id}`;
      return {
        id,
        subjectName: meta!.subjectName,
        sectionName: meta!.sectionName,
        lessonId: meta!.lesson.id,
        lessonTitle: meta!.lesson.title,
        title: `${meta!.sectionName} uy vazifasi`,
        link: homeworkLinks[meta!.lesson.id] || "",
      };
    }).filter((item) => item.link);
  }, [completedLessonIds, homeworkLinks, runtimeCurricula]);

  return (
    <div>
      <PageHeader
        title="Homework"
        description="Har bir fan bo'limidagi eng so'nggi o'tilgan dars uchun bo'lim uy vazifasi"
      />

      <Card className="mb-6 flex gap-3 items-start">
        <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <p className="text-sm text-text-muted">
          Bu yerda faqat har bir <strong className="text-text">section</strong> bo&apos;yicha oxirgi
          yakunlangan darsning uy vazifasi ko&apos;rsatiladi. Boshqa darslarning vazifalari o&apos;z
          dars sahifasidagi <strong className="text-text">Homework</strong> tab&apos;ida.
        </p>
      </Card>

      {homeworkItems.length === 0 ? (
        <Card>
          <p className="text-center text-text-muted py-8">
            Hozircha bo&apos;lim uy vazifasi yo&apos;q. Darslarni yakunlang.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {homeworkItems.map((hw, i) => {
            return (
              <Card key={hw.id} delay={i * 0.05}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{hw.title}</h3>
                      <Badge variant="accent">Link tayyor</Badge>
                    </div>
                    <p className="text-sm text-text-muted mt-1">
                      {hw.subjectName} · {hw.sectionName}
                    </p>
                    <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      Oxirgi o&apos;tilgan dars: {hw.lessonTitle}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <a href={hw.link} download target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" /> Yuklab olish
                      </Button>
                    </a>
                    <Link href={`/lessons/${hw.lessonId}`}>
                      <Button variant="ghost" size="sm">
                        Darsga o&apos;tish
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

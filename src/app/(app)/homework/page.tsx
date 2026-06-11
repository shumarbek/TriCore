"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/contexts/AuthProvider";
import { useLanguage } from "@/contexts/LanguageProvider";
import { buildRuntimeCurricula, findRuntimeLessonById, type CurriculumStructureNode } from "@/lib/data/curriculum/runtime";
import type { LessonContentOverride } from "@/lib/lesson-content";
import { useLiveRefresh } from "@/lib/live-refresh";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Download, Info } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function HomeworkPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [homeworkLinks, setHomeworkLinks] = useState<Record<string, string>>({});
  const [lessonRows, setLessonRows] = useState<LessonContentOverride[]>([]);
  const [structureRows, setStructureRows] = useState<CurriculumStructureNode[]>([]);
  const supabase = useMemo(() => createClient(), []);
  const runtimeCurricula = useMemo(() => buildRuntimeCurricula(structureRows, lessonRows), [lessonRows, structureRows]);
  const tx = {
    uz: { title: "Uy vazifalari", description: "Har bir fan bo'limidagi eng so'nggi yakunlangan dars uchun vazifalar", info: "Bu yerda faqat har bir bo'lim bo'yicha oxirgi yakunlangan darsning uy vazifasi ko'rsatiladi. Boshqa darslarning vazifalari o'z dars sahifasidagi Uy vazifasi bo'limida qoladi.", empty: "Hozircha bo'lim uy vazifasi yo'q. Darslarni yakunlang.", ready: "Link tayyor", lastLesson: "Oxirgi o'tilgan dars", download: "Yuklab olish", goLesson: "Darsga o'tish", titleSuffix: "uy vazifasi" },
    kaa: { title: "Úy tapsırmaları", description: "Hár bir pán bólimindegi eń sońǵı juwmaqlanǵan sabaq ushın tapsırmalar", info: "Bul jerde faqat hár bir bólim boyınsha sońǵı juwmaqlanǵan sabaqtıń úy tapsırması kórsetiledi. Basqa sabaqlardıń tapsırmaları óz sabaq sahifasındagı Úy tapsırması bóliminde qaladı.", empty: "Ázirge bólim úy tapsırması joq. Sabaqlardı juwmaqlań.", ready: "Link tayár", lastLesson: "Sońǵı ótken sabaq", download: "Júklep alıw", goLesson: "Sabaqqa ótiw", titleSuffix: "úy tapsırması" },
    ru: { title: "Домашние задания", description: "Задания для последнего завершённого урока в каждом разделе предмета", info: "Здесь показывается только домашнее задание для последнего завершённого урока в каждом разделе. Остальные задания остаются во вкладке домашнего задания внутри самого урока.", empty: "Пока нет разделовых домашних заданий. Завершите уроки.", ready: "Ссылка готова", lastLesson: "Последний завершённый урок", download: "Скачать", goLesson: "Перейти к уроку", titleSuffix: "домашнее задание" },
    en: { title: "Homework", description: "Assignments for the latest completed lesson in each subject section", info: "Only the homework for the latest completed lesson in each section is shown here. Other lesson-specific tasks remain inside that lesson's homework tab.", empty: "No section homework yet. Complete lessons first.", ready: "Link ready", lastLesson: "Latest completed lesson", download: "Download", goLesson: "Open lesson", titleSuffix: "homework" },
  }[language];

  const load = useCallback(async () => {
    if (!user) {
      setCompletedLessonIds([]);
      setHomeworkLinks({});
      return;
    }
      const [{ data: progressRows }, { data: homeworkData }, { data: lessonData }, { data: structureData }] = await Promise.all([
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("status", "completed").order("completed_at", { ascending: false }),
        supabase.from("lesson_content").select("lesson_id, homework_pdf"),
        supabase.from("lesson_content").select("*"),
        supabase.from("curriculum_structure").select("*").order("order_index", { ascending: true }),
      ]);
      setCompletedLessonIds(((progressRows ?? []) as Array<{ lesson_id: string }>).map((x) => x.lesson_id));
      setHomeworkLinks(Object.fromEntries(((homeworkData ?? []) as Array<{ lesson_id: string; homework_pdf: string }>).map((row) => [row.lesson_id, row.homework_pdf])));
      setLessonRows((lessonData ?? []) as LessonContentOverride[]);
      setStructureRows((structureData ?? []) as CurriculumStructureNode[]);
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
        .channel("homework-lesson-progress")
        .on("postgres_changes", { event: "*", schema: "public", table: "lesson_progress" }, () => void load())
        .subscribe(),
      supabase
        .channel("homework-lesson-content")
        .on("postgres_changes", { event: "*", schema: "public", table: "lesson_content" }, () => void load())
        .subscribe(),
      supabase
        .channel("homework-curriculum-structure")
        .on("postgres_changes", { event: "*", schema: "public", table: "curriculum_structure" }, () => void load())
        .subscribe(),
    ];

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [load, supabase]);

  const homeworkItems = useMemo(() => {
    const latestBySection = new Map<string, ReturnType<typeof findRuntimeLessonById>>();
    for (const lessonId of completedLessonIds) {
      const meta = findRuntimeLessonById(runtimeCurricula, lessonId);
      if (!meta) continue;
      const key = `${meta.subjectId}-${meta.sectionId}`;
      if (!latestBySection.has(key)) latestBySection.set(key, meta);
    }
    return [...latestBySection.values()]
      .filter(Boolean)
      .map((meta) => ({
        id: `hw-${meta!.lesson.id}`,
        subjectName: meta!.subjectName,
        sectionName: meta!.sectionName,
        lessonId: meta!.lesson.id,
        lessonTitle: meta!.lesson.title,
        title: `${meta!.sectionName} ${tx.titleSuffix}`,
        link: homeworkLinks[meta!.lesson.id] || "",
      }))
      .filter((item) => item.link);
  }, [completedLessonIds, homeworkLinks, runtimeCurricula, tx.titleSuffix]);

  return (
    <div>
      <PageHeader title={tx.title} description={tx.description} />

      <Card className="mb-6 flex gap-3 items-start">
        <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <p className="text-sm text-text-muted">{tx.info}</p>
      </Card>

      {homeworkItems.length === 0 ? (
        <Card>
          <p className="text-center text-text-muted py-8">{tx.empty}</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {homeworkItems.map((hw, i) => (
            <Card key={hw.id} delay={i * 0.05}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{hw.title}</h3>
                    <Badge variant="accent">{tx.ready}</Badge>
                  </div>
                  <p className="text-sm text-text-muted mt-1">{hw.subjectName} · {hw.sectionName}</p>
                  <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {tx.lastLesson}: {hw.lessonTitle}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <a href={hw.link} download target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" /> {tx.download}
                    </Button>
                  </a>
                  <Link href={`/lessons/${hw.lessonId}`}>
                    <Button variant="ghost" size="sm">{tx.goLesson}</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

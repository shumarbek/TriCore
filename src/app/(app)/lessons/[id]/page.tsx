"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import { getAdjacentLessons, getLessonById } from "@/lib/data/curriculum";
import { getLessonHandbook } from "@/lib/data/handbook";
import { XP_REWARDS, addXp, incrementDailyActivity } from "@/lib/learning/gamification";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  BookMarked,
  Bookmark,
  Copy,
  Pause,
  Play,
  ScrollText,
  SkipForward,
  StickyNote,
  Upload,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const formulas = [
  { name: "Asosiy formula", expr: "F = ma" },
  { name: "Yordamchi", expr: "v = s / t" },
];

const tabs = [
  "Ma'lumotnoma",
  "Notes",
  "Formulas",
  "Mini Exam",
  "Homework",
  "Discussion",
] as const;

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const supabase = createClient();
  const lessonId = params.id as string;
  const meta = getLessonById(lessonId);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Ma'lumotnoma");
  const [playing, setPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [busy, setBusy] = useState(false);
  const [miniExamBusy, setMiniExamBusy] = useState(false);
  const [noteContent, setNoteContent] = useState(
    "# Dars qaydlari\n\n- Muhim punktlar\n- Misollar\n- Savollar"
  );

  if (!meta) {
    return (
      <div>
        <Link href="/lessons" className="text-sm text-primary">
          ← Darslar
        </Link>
        <p className="mt-8 text-text-muted">Dars topilmadi</p>
      </div>
    );
  }

  const { lesson, subjectName, sectionName, subSectionName } = meta;
  const { previous, next } = getAdjacentLessons(lesson.id);
  const handbook = getLessonHandbook(lesson.id, lesson.title);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id);
      const rows = (data ?? []) as Array<{ lesson_id: string; status: string }>;
      const completed = new Set(rows.filter((x) => x.status === "completed").map((x) => x.lesson_id));
      setIsCompleted(completed.has(lesson.id));

      const all = [lesson.id];
      let cursor = previous;
      while (cursor) {
        all.unshift(cursor.id);
        cursor = getAdjacentLessons(cursor.id).previous;
      }
      const firstPending = all.find((id) => !completed.has(id)) ?? lesson.id;
      setIsUnlocked(completed.has(lesson.id) || firstPending === lesson.id);
    };
    load();
  }, [lesson.id, previous, supabase, user]);

  const markLessonCompleted = async () => {
    if (!user || isCompleted || !isUnlocked) return;
    setBusy(true);
    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("status")
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id)
      .maybeSingle();

    await supabase.from("lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lesson.id,
        subject_id: meta.subjectId,
        section_id: meta.sectionId,
        sub_section_id: meta.subSectionId,
        status: "completed",
        progress_percent: 100,
        completed_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id,lesson_id" }
    );

    if (existing?.status !== "completed") {
      await addXp(supabase, user.id, XP_REWARDS.lessonComplete);
      await incrementDailyActivity(supabase, user.id, { lessons_completed: 1 });
    }
    await refreshProfile();
    setIsCompleted(true);
    setBusy(false);
    if (next) router.push(`/lessons/${next.id}`);
  };

  const submitMiniExam = async () => {
    if (!user) return;
    setMiniExamBusy(true);
    await supabase.from("exam_results").insert({
      user_id: user.id,
      subject_id: meta.subjectId,
      section_id: meta.sectionId,
      sub_section_id: lesson.id,
      score: 100,
      total_questions: 10,
      correct_answers: 10,
      time_spent: 15,
    } as never);
    await addXp(supabase, user.id, XP_REWARDS.lessonExam);
    await incrementDailyActivity(supabase, user.id, { exams_taken: 1 });
    await refreshProfile();
    setMiniExamBusy(false);
  };

  const tabIcons: Partial<Record<(typeof tabs)[number], React.ComponentType<{ className?: string }>>> = {
    "Ma'lumotnoma": BookMarked,
    Notes: StickyNote,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/lessons" className="text-sm text-text-muted hover:text-primary mb-4 inline-block">
        ← Darslar
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card glass={false} className="overflow-hidden p-0">
            <div className="aspect-video bg-surface-elevated relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
              <button
                type="button"
                onClick={() => setPlaying(!playing)}
                className="relative z-10 w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-primary/40"
              >
                {playing ? (
                  <Pause className="w-7 h-7 text-white" />
                ) : (
                  <Play className="w-7 h-7 text-white ml-1" />
                )}
              </button>
              <span className="absolute bottom-4 left-4 text-sm text-text-muted">
                {lesson.title} — 24:32
              </span>
            </div>
            <div className="p-4 flex flex-wrap items-center gap-3 border-t border-border">
              <Button variant="ghost" size="sm">1x</Button>
              <Button variant="ghost" size="sm">1.25x</Button>
              <Button variant="ghost" size="sm">1.5x</Button>
              <Button variant="ghost" size="sm"><SkipForward className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm"><Volume2 className="w-4 h-4" /> CC</Button>
              <div className="flex-1" />
              <Badge variant="accent">0% ko&apos;rildi</Badge>
            </div>
          </Card>

          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-text-muted mt-1">
              {subjectName} · {sectionName} · {subSectionName}
            </p>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tabIcons[tab];
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
                    activeTab === tab
                      ? "bg-primary/15 text-primary border border-primary/25"
                      : "text-text-muted hover:bg-surface-elevated"
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {tab}
                </button>
              );
            })}
          </div>

          <Card>
            {activeTab === "Ma'lumotnoma" && (
              <div className="space-y-6">
                <p className="text-sm text-text-muted flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-primary" />
                  Shu dars uchun qoidalar va atamalar (admin tomonidan tayyorlangan)
                </p>
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-primary" />
                    Qoidalar
                  </h3>
                  <div className="space-y-3">
                    {handbook.rules.map((rule) => (
                      <div
                        key={rule.title}
                        className="p-4 rounded-xl bg-surface-elevated border border-border"
                      >
                        <p className="font-medium text-sm text-primary mb-1">{rule.title}</p>
                        <p className="text-sm text-text-muted leading-relaxed">{rule.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Atamalar</h3>
                  <div className="space-y-2">
                    {handbook.terms.map((t) => (
                      <div
                        key={t.term}
                        className="flex flex-col sm:flex-row sm:gap-4 p-3 rounded-xl border border-border/80"
                      >
                        <span className="font-semibold text-sm text-accent min-w-[140px]">
                          {t.term}
                        </span>
                        <span className="text-sm text-text-muted">{t.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "Notes" && (
              <div className="space-y-3">
                <p className="text-xs text-text-muted">
                  Shaxsiy qaydlar. Barcha notes{" "}
                  <Link href="/notes" className="text-primary hover:underline">
                    Notes
                  </Link>{" "}
                  bo&apos;limida ham boshqariladi.
                </p>
                <Textarea
                  className="min-h-[200px] font-mono text-sm"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
                <p className="text-xs text-success">Avtomatik saqlandi</p>
              </div>
            )}
            {activeTab === "Formulas" && (
              <div className="space-y-3">
                {formulas.map((f) => (
                  <div key={f.name} className="p-4 rounded-xl bg-surface-elevated border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{f.name}</span>
                      <Button variant="ghost" size="sm"><Copy className="w-4 h-4" /></Button>
                    </div>
                    <p className="font-mono text-accent">{f.expr}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "Mini Exam" && (
              <div className="text-center py-8">
                <p className="text-text-muted mb-4">10 ta MCQ · 15 daqiqa</p>
                <Button variant="primary" onClick={submitMiniExam} loading={miniExamBusy}>Mini imtihonni yakunlash</Button>
              </div>
            )}
            {activeTab === "Homework" && (
              <div className="space-y-4">
                <p className="text-sm text-text-muted">
                  Bu darsning uy vazifasi. Sectiondagi oxirgi o&apos;tilgan dars bo&apos;lsa{" "}
                  <Link href="/homework" className="text-primary hover:underline">
                    Homework
                  </Link>{" "}
                  bo&apos;limida ham chiqadi.
                </p>
                <Button variant="outline">PDF yuklab olish</Button>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto text-text-muted mb-2" />
                  <p className="text-sm text-text-muted">Javob faylini yuklang</p>
                </div>
              </div>
            )}
            {activeTab === "Discussion" && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-surface-elevated">
                  <p className="text-sm font-medium">Savol namunasi</p>
                  <p className="text-xs text-text-muted mt-1">Admin · Javob</p>
                </div>
                <Textarea placeholder="Savol yozing..." />
                <Button variant="primary" size="sm">Yuborish</Button>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-primary" />
              Ma&apos;lumotnoma
            </h3>
            <p className="text-xs text-text-muted mb-2">
              {handbook.terms.length} ta atama · {handbook.rules.length} ta qoida
            </p>
            <ul className="text-sm space-y-1 text-text-muted">
              {handbook.terms.slice(0, 3).map((t) => (
                <li key={t.term}>
                  <span className="text-accent">{t.term}</span> — {t.definition.slice(0, 40)}…
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3"
              onClick={() => setActiveTab("Ma'lumotnoma")}
            >
              To&apos;liq o&apos;qish
            </Button>
          </Card>
          <Card>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-primary" />
              Formulalar
            </h3>
            {formulas.map((f) => (
              <div key={f.name} className="mb-3 last:mb-0">
                <p className="text-xs text-text-muted">{f.name}</p>
                <p className="font-mono text-sm text-accent mt-0.5">{f.expr}</p>
              </div>
            ))}
          </Card>
          <Card>
            <Button variant="primary" className="w-full mb-2" onClick={markLessonCompleted} loading={busy} disabled={!isUnlocked || isCompleted}>{isCompleted ? "Yakunlangan" : "Yakunlash"}</Button>
            <div className="grid grid-cols-2 gap-2">
              {previous ? (
                <Link href={`/lessons/${previous.id}`} className="w-full">
                  <Button variant="outline" className="w-full">Oldingi</Button>
                </Link>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Oldingi
                </Button>
              )}
              {next ? (
                <Link href={`/lessons/${next.id}`} className="w-full">
                  <Button variant="outline" className="w-full">Keyingi</Button>
                </Link>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Keyingi
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}



"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import { type SubjectCurriculum } from "@/lib/data/curriculum";
import {
  buildRuntimeCurricula,
  findRuntimeLessonById,
  getRuntimeLessonGroup,
  type CurriculumStructureNode,
} from "@/lib/data/curriculum/runtime";
import { getLessonHandbook } from "@/lib/data/handbook";
import {
  buildFormulaList,
  buildHandbookFromOverride,
  formatDuration,
  getVideoInfo,
  type LessonContentOverride,
} from "@/lib/lesson-content";
import { parseMiniExamQuestions } from "@/lib/mini-exam";
import { XP_REWARDS, addXp, incrementDailyActivity } from "@/lib/learning/gamification";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { BookMarked, Bookmark, Copy, Download, ScrollText, StickyNote, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const supabase = useMemo(() => createClient(), []);
  const lessonId = params.id as string;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Ma'lumotnoma");
  const [contentOverride, setContentOverride] = useState<LessonContentOverride | null>(null);
  const [structureRows, setStructureRows] = useState<CurriculumStructureNode[]>([]);
  const [allLessonRows, setAllLessonRows] = useState<LessonContentOverride[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [busy, setBusy] = useState(false);
  const [miniExamBusy, setMiniExamBusy] = useState(false);
  const [lessonStartedAt] = useState(() => Date.now());
  const [miniExamStartedAt, setMiniExamStartedAt] = useState<number | null>(null);
  const [miniExamOpen, setMiniExamOpen] = useState(false);
  const [miniExamAnswers, setMiniExamAnswers] = useState<Record<string, number>>({});
  const [miniExamResult, setMiniExamResult] = useState<{
    correct: number;
    total: number;
    xpAwarded: number;
  } | null>(null);
  const [miniExamRewardClaimed, setMiniExamRewardClaimed] = useState(false);
  const [discussionMessages, setDiscussionMessages] = useState<
    Array<{ id: string; body: string; admin_reply: string | null; created_at: string; replied_at: string | null; status: string }>
  >([]);
  const [discussionBody, setDiscussionBody] = useState("");
  const [discussionBusy, setDiscussionBusy] = useState(false);
  const [discussionError, setDiscussionError] = useState("");
  const [noteContent, setNoteContent] = useState(
    "# Dars qaydlari\n\n- Muhim punktlar\n- Misollar\n- Savollar"
  );
  const handbookCardRef = useRef<HTMLDivElement | null>(null);

  const runtimeCurricula = useMemo<SubjectCurriculum[]>(
    () => buildRuntimeCurricula(structureRows, allLessonRows),
    [allLessonRows, structureRows]
  );
  const effectiveMeta = findRuntimeLessonById(runtimeCurricula, lessonId);
  const lesson = effectiveMeta?.lesson;
  const subjectName = effectiveMeta?.subjectName ?? "";
  const sectionName = effectiveMeta?.sectionName ?? "";
  const subSectionName = effectiveMeta?.subSectionName ?? "";
  const lessonGroup = lesson ? getRuntimeLessonGroup(runtimeCurricula, lesson.id) : [];
  const lessonIndex = lessonGroup.findIndex((item) => item.id === lesson?.id);
  const previous = lessonIndex > 0 ? lessonGroup[lessonIndex - 1] : null;
  const next = lessonIndex >= 0 && lessonIndex < lessonGroup.length - 1 ? lessonGroup[lessonIndex + 1] : null;
  const handbook = lesson
    ? buildHandbookFromOverride(
        lesson.id,
        getLessonHandbook(lesson.id, contentOverride?.title || lesson.title),
        contentOverride
      )
    : { rules: [], terms: [] };
  const formulas = buildFormulaList(contentOverride);
  const miniExamQuestions = useMemo(
    () => parseMiniExamQuestions(contentOverride?.mini_exam_questions),
    [contentOverride?.mini_exam_questions]
  );
  const effectiveTitle = contentOverride?.title || lesson?.title || "";
  const videoUrl = contentOverride?.video_url || "";
  const homeworkUrl = contentOverride?.homework_pdf || "";
  const videoInfo = getVideoInfo(videoUrl);
  const formattedDuration = formatDuration(videoDuration);

  useEffect(() => {
    if (!lessonId) return;
    const loadContent = async () => {
      const [{ data }, { data: lessonData }, { data: structureData }] = await Promise.all([
        supabase.from("lesson_content").select("*").eq("lesson_id", lessonId).maybeSingle(),
        supabase.from("lesson_content").select("*"),
        supabase.from("curriculum_structure").select("*").order("order_index", { ascending: true }),
      ]);
      setContentOverride((data as LessonContentOverride | null) ?? null);
      setAllLessonRows((lessonData ?? []) as LessonContentOverride[]);
      setStructureRows((structureData ?? []) as CurriculumStructureNode[]);
      setContentLoading(false);
    };

    void loadContent();
    const lessonChannel = supabase
      .channel(`lesson-content-${lessonId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lesson_content", filter: `lesson_id=eq.${lessonId}` },
        () => {
          void loadContent();
        }
      )
      .subscribe();
    const structureChannel = supabase
      .channel(`lesson-structure-${lessonId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "curriculum_structure" },
        () => {
          void loadContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lessonChannel);
      supabase.removeChannel(structureChannel);
    };
  }, [lessonId, supabase]);

  useEffect(() => {
    if (!videoUrl) {
      setVideoDuration(null);
      return;
    }

    const loadDuration = async () => {
      try {
        const response = await fetch(`/api/video-metadata?url=${encodeURIComponent(videoUrl)}`);
        const data = (await response.json()) as { durationSeconds?: number };
        setVideoDuration(data.durationSeconds ?? null);
      } catch {
        setVideoDuration(null);
      }
    };

    void loadDuration();
  }, [videoUrl]);

  useEffect(() => {
    setMiniExamStartedAt(null);
    setMiniExamOpen(false);
    setMiniExamAnswers({});
    setMiniExamResult(null);
    setMiniExamRewardClaimed(false);
  }, [lessonId, contentOverride?.mini_exam_questions]);

  useEffect(() => {
    if (!user || !lesson) return;
    const load = async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id);
      const rows = (data ?? []) as Array<{ lesson_id: string; status: string }>;
      const completed = new Set(rows.filter((row) => row.status === "completed").map((row) => row.lesson_id));
      setIsCompleted(completed.has(lesson.id));

      const group = lessonGroup.length ? lessonGroup.map((item) => item.id) : [lesson.id];
      const firstPending = group.find((id) => !completed.has(id)) ?? lesson.id;
      setIsUnlocked(completed.has(lesson.id) || firstPending === lesson.id);
    };

    void load();
  }, [lesson, lessonGroup, supabase, user]);

  useEffect(() => {
    if (!user || !lesson) return;
    const loadMiniExamState = async () => {
      const { data } = await supabase
        .from("exam_results")
        .select("correct_answers, total_questions")
        .eq("user_id", user.id)
        .eq("subject_id", effectiveMeta?.subjectId ?? "")
        .eq("section_id", effectiveMeta?.sectionId ?? "")
        .eq("sub_section_id", lesson.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const latest = (data ?? [])[0] as
        | { correct_answers?: number | null; total_questions?: number | null }
        | undefined;

      if (!latest) {
        setMiniExamRewardClaimed(false);
        return;
      }

      const correct = latest.correct_answers ?? 0;
      const total = latest.total_questions ?? miniExamQuestions.length;
      setMiniExamRewardClaimed(true);
      setMiniExamResult({
        correct,
        total,
        xpAwarded: correct * 5,
      });
    };

    void loadMiniExamState();
  }, [effectiveMeta?.sectionId, effectiveMeta?.subjectId, lesson, miniExamQuestions.length, supabase, user]);

  useEffect(() => {
    if (!user || !lesson) return;
    const loadDiscussion = async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, body, admin_reply, created_at, replied_at, status")
        .eq("user_id", user.id)
        .eq("lesson_id", lesson.id)
        .order("created_at", { ascending: false });
      setDiscussionMessages(
        ((data ?? []) as Array<{
          id: string;
          body: string;
          admin_reply: string | null;
          created_at: string;
          replied_at: string | null;
          status: string;
        }>)
      );
    };

    void loadDiscussion();
    const channel = supabase
      .channel(`lesson-discussion-${user.id}-${lesson.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `user_id=eq.${user.id}` },
        () => {
          void loadDiscussion();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [lesson, supabase, user]);

  const markLessonCompleted = async () => {
    if (!user || !effectiveMeta || !lesson || isCompleted || !isUnlocked) return;
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
        subject_id: effectiveMeta.subjectId,
        section_id: effectiveMeta.sectionId,
        sub_section_id: effectiveMeta.subSectionId,
        status: "completed",
        progress_percent: 100,
        completed_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id,lesson_id" }
    );

    if ((existing as { status?: string } | null)?.status !== "completed") {
      await addXp(supabase, user.id, XP_REWARDS.lessonComplete);
      await incrementDailyActivity(supabase, user.id, {
        lessons_completed: 1,
        time_spent_minutes: Math.max(1, Math.ceil((Date.now() - lessonStartedAt) / 60000)),
      });
    }

    await refreshProfile();
    setIsCompleted(true);
    setBusy(false);
    if (next) router.push(`/lessons/${next.id}`);
  };

  const submitMiniExam = async () => {
    if (!user || !effectiveMeta || !lesson || !miniExamQuestions.length || miniExamBusy) return;
    setMiniExamBusy(true);
    const timeSpentMinutes = Math.max(
      1,
      Math.ceil((Date.now() - (miniExamStartedAt ?? Date.now())) / 60000)
    );
    const correctAnswers = miniExamQuestions.reduce((total, question) => {
      return total + (miniExamAnswers[question.id] === question.correctIndex ? 1 : 0);
    }, 0);
    const totalQuestions = miniExamQuestions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const xpAwarded = correctAnswers * 5;

    await supabase.from("exam_results").insert({
      user_id: user.id,
      subject_id: effectiveMeta.subjectId,
      section_id: effectiveMeta.sectionId,
      sub_section_id: lesson.id,
      score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      time_spent: timeSpentMinutes,
    } as never);
    if (!miniExamRewardClaimed) {
      await addXp(supabase, user.id, xpAwarded);
      setMiniExamRewardClaimed(true);
    }
    await incrementDailyActivity(supabase, user.id, {
      exams_taken: 1,
      time_spent_minutes: timeSpentMinutes,
    });
    await refreshProfile();
    setMiniExamResult({
      correct: correctAnswers,
      total: totalQuestions,
      xpAwarded: miniExamRewardClaimed ? 0 : xpAwarded,
    });
    setMiniExamOpen(false);
    setMiniExamBusy(false);
  };

  const openHandbookDetails = () => {
    setActiveTab("Ma'lumotnoma");
    requestAnimationFrame(() => {
      handbookCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const sendDiscussionMessage = async () => {
    if (!user || !lesson || !discussionBody.trim()) return;
    setDiscussionBusy(true);
    setDiscussionError("");
    const { error } = await supabase.from("messages").insert({
      user_id: user.id,
      lesson_id: lesson.id,
      subject: `Lesson Discussion: ${effectiveTitle}`,
      body: discussionBody.trim(),
      status: "open",
    } as never);
    if (error) {
      setDiscussionError(error.message);
      setDiscussionBusy(false);
      return;
    }
    setDiscussionBody("");
    setDiscussionBusy(false);
  };

  const tabIcons: Partial<Record<(typeof tabs)[number], React.ComponentType<{ className?: string }>>> = {
    "Ma'lumotnoma": BookMarked,
    Notes: StickyNote,
  };

  if (!effectiveMeta || !lesson) {
    return (
      <div>
        <Link href="/lessons" className="text-sm text-primary">
          Darslar
        </Link>
        <p className="mt-8 text-text-muted">
          {contentLoading ? "Dars yuklanmoqda..." : "Dars topilmadi"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/lessons" className="text-sm text-text-muted hover:text-primary mb-4 inline-block">
        Darslar
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card glass={false} className="overflow-hidden p-0">
            <div className="aspect-video bg-surface-elevated relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
              {videoInfo.embedUrl ? (
                <iframe
                  src={videoInfo.embedUrl}
                  className="relative z-10 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  title={effectiveTitle}
                />
              ) : (
                <div className="relative z-10 w-full h-full flex items-center justify-center text-sm text-text-muted">
                  Video URL kiritilmagan
                </div>
              )}
              <span className="absolute bottom-4 left-4 text-sm text-text-muted">
                {effectiveTitle}
                {formattedDuration ? ` - ${formattedDuration}` : ""}
              </span>
            </div>
            <div className="p-4 flex flex-wrap items-center gap-3 border-t border-border">
              <Badge variant="accent">
                {videoInfo.provider === "youtube"
                  ? "YouTube"
                  : videoInfo.provider === "odysee"
                    ? "Odysee"
                    : "Video"}
              </Badge>
              {formattedDuration && <Badge variant="muted">{formattedDuration}</Badge>}
              {videoUrl && (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Original video
                </a>
              )}
              <div className="flex-1" />
              <Badge variant="accent">0% ko&apos;rildi</Badge>
            </div>
          </Card>

          <div>
            <h1 className="text-2xl font-bold">{effectiveTitle}</h1>
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

          <div ref={handbookCardRef}>
          <Card>
            {activeTab === "Ma'lumotnoma" && (
              <div className="space-y-6">
                <p className="text-sm text-text-muted flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-primary" />
                  Shu dars uchun qoidalar va atamalar
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
                    {handbook.terms.map((term) => (
                      <div
                        key={term.term}
                        className="flex flex-col sm:flex-row sm:gap-4 p-3 rounded-xl border border-border/80"
                      >
                        <span className="font-semibold text-sm text-accent min-w-[140px]">
                          {term.term}
                        </span>
                        <span className="text-sm text-text-muted">{term.definition}</span>
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
                  onChange={(event) => setNoteContent(event.target.value)}
                />
                <p className="text-xs text-success">Avtomatik saqlandi</p>
              </div>
            )}

            {activeTab === "Formulas" && (
              <div className="space-y-3">
                {formulas.map((formula) => (
                  <div key={formula.name} className="p-4 rounded-xl bg-surface-elevated border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{formula.name}</span>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="font-mono text-accent">{formula.expr}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Mini Exam" && (
              <div className="space-y-4">
                {!miniExamQuestions.length ? (
                  <div className="rounded-xl border border-dashed border-border p-4 text-sm text-text-muted">
                    Bu dars uchun mini exam hali admin tomonidan kiritilmagan.
                  </div>
                ) : !miniExamOpen ? (
                  <div className="text-center py-8">
                    <p className="text-text-muted mb-2">{miniExamQuestions.length} ta savol</p>
                    <p className="text-xs text-text-muted mb-4">
                      Har bir to&apos;g&apos;ri javob uchun 5 XP beriladi.
                    </p>
                    {miniExamRewardClaimed && miniExamResult && (
                      <p className="text-xs text-text-muted mb-4">
                        Bu mini exam uchun XP oldin berilgan. Qayta ishlasangiz natija saqlanadi, lekin XP qayta qo&apos;shilmaydi.
                      </p>
                    )}
                    <Button
                      variant="primary"
                      onClick={() => {
                        setMiniExamStartedAt(Date.now());
                        setMiniExamOpen(true);
                        setMiniExamAnswers({});
                        setMiniExamResult(null);
                      }}
                    >
                      Mini imtihonni boshlash
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-text-muted">
                      Mini exam alohida oynada ochildi. Oynani yopib qo&apos;ysangiz javoblar shu sahifada saqlanib turadi.
                    </div>
                    <Button variant="outline" onClick={() => setMiniExamOpen(true)}>
                      Oynani qayta ochish
                    </Button>
                  </>
                )}
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
                {homeworkUrl ? (
                  <a href={homeworkUrl} download target="_blank" rel="noreferrer">
                    <Button variant="outline">
                      <Download className="w-4 h-4" /> Homework faylini yuklab olish
                    </Button>
                  </a>
                ) : (
                  <p className="text-sm text-text-muted">Homework link kiritilmagan.</p>
                )}
              </div>
            )}

            {activeTab === "Discussion" && (
              <div className="space-y-4">
                <p className="text-sm text-text-muted">
                  Shu dars bo&apos;yicha savol yoki muhokama yuboring. Admin javobi shu yerning o&apos;zida chiqadi.
                </p>
                {discussionError && (
                  <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                    {discussionError}
                  </div>
                )}
                <Textarea
                  placeholder="Savol yozing..."
                  value={discussionBody}
                  onChange={(event) => setDiscussionBody(event.target.value)}
                />
                <Button variant="primary" size="sm" onClick={sendDiscussionMessage} loading={discussionBusy}>
                  Yuborish
                </Button>
                <div className="space-y-3">
                  {discussionMessages.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-4 text-sm text-text-muted">
                      Hali discussion yo&apos;q. Birinchi savolni yuboring.
                    </div>
                  ) : (
                    discussionMessages.map((message) => (
                      <div key={message.id} className="rounded-xl border border-border overflow-hidden">
                        <div className="p-4 bg-surface-elevated/50">
                          <p className="text-xs text-text-muted">
                            Siz · {new Date(message.created_at).toLocaleString()}
                          </p>
                          <p className="text-sm mt-2">{message.body}</p>
                        </div>
                        {message.admin_reply && (
                          <div className="p-4 bg-primary/10 border-t border-primary/20">
                            <p className="text-xs text-primary">
                              Admin · {message.replied_at ? new Date(message.replied_at).toLocaleString() : ""}
                            </p>
                            <p className="text-sm mt-2">{message.admin_reply}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </Card>
          </div>
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
              {handbook.terms.slice(0, 3).map((term) => (
                <li key={term.term}>
                  <span className="text-accent">{term.term}</span> - {term.definition.slice(0, 40)}...
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3"
              onClick={openHandbookDetails}
            >
              To&apos;liq o&apos;qish
            </Button>
          </Card>

          <Card>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-primary" />
              Formulalar
            </h3>
            {formulas.map((formula) => (
              <div key={formula.name} className="mb-3 last:mb-0">
                <p className="text-xs text-text-muted">{formula.name}</p>
                <p className="font-mono text-sm text-accent mt-0.5">{formula.expr}</p>
              </div>
            ))}
          </Card>

          <Card>
            <Button
              variant="primary"
              className="w-full mb-2"
              onClick={markLessonCompleted}
              loading={busy}
              disabled={!isUnlocked || isCompleted}
            >
              {isCompleted ? "Yakunlangan" : "Yakunlash"}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              {previous ? (
                <Link href={`/lessons/${previous.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Oldingi
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Oldingi
                </Button>
              )}
              {next ? (
                <Link href={`/lessons/${next.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Keyingi
                  </Button>
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

      {miniExamOpen && activeTab === "Mini Exam" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Mini Exam</h2>
                <p className="text-xs text-text-muted">
                  {miniExamQuestions.length} ta savol · har bir to&apos;g&apos;ri javob uchun 5 XP
                </p>
              </div>
              <button
                type="button"
                className="rounded-xl border border-border p-2 text-text-muted hover:bg-surface-elevated"
                onClick={() => setMiniExamOpen(false)}
                disabled={miniExamBusy}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-5 py-4 space-y-4">
              {miniExamRewardClaimed && (
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-text-muted">
                  Bu mini exam uchun XP oldin berilgan. Qayta ishlasangiz natija yangilanadi, lekin XP qayta qo&apos;shilmaydi.
                </div>
              )}

              {miniExamQuestions.map((question, questionIndex) => (
                <div key={question.id} className="rounded-2xl border border-border p-4 space-y-3">
                  <p className="font-medium">
                    {questionIndex + 1}. {question.question}
                  </p>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const checked = miniExamAnswers[question.id] === optionIndex;
                      return (
                        <button
                          key={`${question.id}-option-${optionIndex}`}
                          type="button"
                          onClick={() =>
                            setMiniExamAnswers((current) => ({
                              ...current,
                              [question.id]: optionIndex,
                            }))
                          }
                          className={cn(
                            "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                            checked
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:bg-surface-elevated"
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {miniExamResult && (
                <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm">
                  <p className="font-medium text-success">
                    Natija: {miniExamResult.correct}/{miniExamResult.total}
                  </p>
                  <p className="text-text-muted mt-1">Olingan XP: {miniExamResult.xpAwarded}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
              <Button variant="outline" onClick={() => setMiniExamOpen(false)} disabled={miniExamBusy}>
                Yopish
              </Button>
              <Button variant="primary" onClick={submitMiniExam} loading={miniExamBusy}>
                Examni tugatish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

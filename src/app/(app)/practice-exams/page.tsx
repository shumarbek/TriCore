"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import {
  buildRuntimeCurricula,
  getRuntimeExamScopeLabel,
  getRuntimeSections,
  getRuntimeSubSections,
  type CurriculumStructureNode,
} from "@/lib/data/curriculum/runtime";
import { addXp, incrementDailyActivity } from "@/lib/learning/gamification";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Clock, Database, Sparkles, Target, TriangleAlert, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const SUBJECT_OPTIONS = [
  { value: "mathematics", label: "Matematika" },
  { value: "physics", label: "Fizika" },
  { value: "chemistry", label: "Kimyo" },
];

interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

function shuffleQuestions<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getTodayKey() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function getEndOfTodayIso() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function PracticeExamsPage() {
  const { user, refreshProfile } = useAuth();
  const [subjectId, setSubjectId] = useState("physics");
  const [sectionId, setSectionId] = useState("");
  const [subSectionId, setSubSectionId] = useState("all");
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(45);
  const [generating, setGenerating] = useState(false);
  const [poolSize, setPoolSize] = useState(0);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [examStartedAt, setExamStartedAt] = useState<number | null>(null);
  const [examOpen, setExamOpen] = useState(false);
  const [examWarning, setExamWarning] = useState("");
  const [cheatAttempts, setCheatAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<string | null>(null);
  const [remainingBlockMs, setRemainingBlockMs] = useState(0);
  const [structureRows, setStructureRows] = useState<CurriculumStructureNode[]>([]);
  const activityCommittedRef = useRef(false);
  const supabase = useMemo(() => createClient(), []);
  const runtimeCurricula = useMemo(() => buildRuntimeCurricula(structureRows), [structureRows]);

  useEffect(() => {
    const loadStructure = async () => {
      const { data } = await supabase
        .from("curriculum_structure")
        .select("*")
        .order("order_index", { ascending: true });
      setStructureRows((data ?? []) as CurriculumStructureNode[]);
    };
    void loadStructure();
    const channel = supabase
      .channel("practice-curriculum-structure")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "curriculum_structure" },
        () => {
          void loadStructure();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    if (!blockedUntil) {
      setRemainingBlockMs(0);
      return;
    }
    const tick = () => {
      const next = new Date(blockedUntil).getTime() - Date.now();
      setRemainingBlockMs(Math.max(0, next));
      if (next <= 0) {
        setBlockedUntil(null);
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [blockedUntil]);

  const sections = useMemo(() => getRuntimeSections(runtimeCurricula, subjectId), [runtimeCurricula, subjectId]);

  useEffect(() => {
    if (sections.length && !sections.some((section) => section.id === sectionId)) {
      setSectionId(sections[0].id);
      setSubSectionId("all");
    }
  }, [sections, sectionId]);

  const effectiveSectionId = sectionId || sections[0]?.id || "";

  const subSections = useMemo(
    () => getRuntimeSubSections(runtimeCurricula, subjectId, effectiveSectionId),
    [runtimeCurricula, subjectId, effectiveSectionId]
  );

  const subSectionOptions = useMemo(
    () => [
      { value: "all", label: "All - butun section mavzulari" },
      ...subSections.map((section) => ({ value: section.id, label: section.name })),
    ],
    [subSections]
  );

  useEffect(() => {
    if (!effectiveSectionId) return;
    const loadCount = async () => {
      let query = supabase
        .from("exam_questions")
        .select("id", { count: "exact", head: true })
        .eq("subject_id", subjectId)
        .eq("section_id", effectiveSectionId);
      if (subSectionId !== "all") query = query.eq("sub_section_id", subSectionId);
      const { count } = await query;
      setPoolSize(count ?? 0);
    };
    void loadCount();
  }, [supabase, subjectId, effectiveSectionId, subSectionId]);

  useEffect(() => {
    if (!user) return;
    const loadGuard = async () => {
      const { data } = await supabase
        .from("practice_exam_guard")
        .select("cheat_attempts, blocked_until")
        .eq("user_id", user.id)
        .eq("guard_date", getTodayKey())
        .maybeSingle();
      const row = data as { cheat_attempts?: number; blocked_until?: string | null } | null;
      setCheatAttempts(row?.cheat_attempts ?? 0);
      const nextBlockedUntil = row?.blocked_until ?? null;
      setBlockedUntil(nextBlockedUntil && new Date(nextBlockedUntil).getTime() > Date.now() ? nextBlockedUntil : null);
    };
    void loadGuard();
  }, [supabase, user]);

  const scopeLabel = useMemo(
    () =>
      effectiveSectionId
        ? getRuntimeExamScopeLabel(runtimeCurricula, subjectId, effectiveSectionId, subSectionId)
        : "",
    [runtimeCurricula, subjectId, effectiveSectionId, subSectionId]
  );

  const handleSubjectChange = (id: string) => {
    setSubjectId(id);
    const nextSections = getRuntimeSections(runtimeCurricula, id);
    const first = nextSections[0]?.id ?? "";
    setSectionId(first);
    setSubSectionId("all");
  };

  const handleSectionChange = (id: string) => {
    setSectionId(id);
    setSubSectionId("all");
  };

  const commitRealExamTime = async () => {
    if (!user || !examStartedAt || activityCommittedRef.current) return;
    const timeSpentMinutes = Math.max(1, Math.ceil((Date.now() - examStartedAt) / 60000));
    await incrementDailyActivity(supabase, user.id, {
      time_spent_minutes: timeSpentMinutes,
    });
    activityCommittedRef.current = true;
  };

  const resetExamSession = () => {
    setExamOpen(false);
    setExamQuestions([]);
    setAnswers({});
    setResult(null);
    setExamStartedAt(null);
  };

  const cancelExamSession = async () => {
    await commitRealExamTime();
    resetExamSession();
    setExamWarning("Practice Exam bekor qilindi. Yangi urinishni qayta boshlashingiz mumkin.");
  };

  const registerCheatAttempt = async (reason: string) => {
    if (!user || !examOpen) return;
    const nextAttempts = cheatAttempts + 1;
    const nextBlockedUntil = nextAttempts >= 3 ? getEndOfTodayIso() : null;
    await commitRealExamTime();
    await supabase.from("practice_exam_guard").upsert(
      {
        user_id: user.id,
        guard_date: getTodayKey(),
        cheat_attempts: nextAttempts,
        blocked_until: nextBlockedUntil,
        last_reason: reason,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id,guard_date" }
    );
    setCheatAttempts(nextAttempts);
    setBlockedUntil(nextBlockedUntil);
    resetExamSession();
    setExamWarning(
      nextBlockedUntil
        ? "Cheat holati 3 marta qayd etildi. Practice Exam huquqi bugun uchun bloklandi."
        : `Cheat holati qayd etildi (${nextAttempts}/3). Exam to'xtatildi.`
    );
  };

  useEffect(() => {
    if (!examOpen) return;

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") {
        void registerCheatAttempt("visibility-change");
      }
    };

    const handleBlur = () => {
      void registerCheatAttempt("window-blur");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [examOpen, cheatAttempts]);

  const startExam = async () => {
    if (!user || !effectiveSectionId || (blockedUntil && new Date(blockedUntil).getTime() > Date.now())) return;
    setGenerating(true);
    let query = supabase
      .from("exam_questions")
      .select("id, question, options, correct_index, explanation")
      .eq("subject_id", subjectId)
      .eq("section_id", effectiveSectionId);
    if (subSectionId !== "all") query = query.eq("sub_section_id", subSectionId);
    const { data } = await query;
    const shuffled = shuffleQuestions((data ?? []) as unknown as ExamQuestion[]).slice(0, questionCount);
    setExamQuestions(shuffled);
    setAnswers({});
    setResult(null);
    setExamStartedAt(Date.now());
    activityCommittedRef.current = false;
    setExamWarning("");
    setExamOpen(true);
    setGenerating(false);
  };

  const submitExam = async () => {
    if (!user || examQuestions.length === 0 || !examOpen) return;
    const correct = examQuestions.filter((question) => answers[question.id] === question.correct_index).length;
    const total = examQuestions.length;
    const score = Math.round((correct / total) * 100);
    const timeSpentMinutes = Math.max(
      1,
      Math.ceil((Date.now() - (examStartedAt ?? Date.now())) / 60000)
    );
    const xpEarned = correct * 5;
    await supabase.from("exam_results").insert({
      user_id: user.id,
      subject_id: subjectId,
      section_id: effectiveSectionId,
      sub_section_id: subSectionId,
      score,
      total_questions: total,
      correct_answers: correct,
      time_spent: timeSpentMinutes,
    } as never);
    await addXp(supabase, user.id, xpEarned);
    await incrementDailyActivity(supabase, user.id, {
      exams_taken: 1,
      time_spent_minutes: timeSpentMinutes,
    });
    activityCommittedRef.current = true;
    await refreshProfile();
    setResult({ score, correct, total });
    setExamOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Practice Exams"
        description="Admin tayyorlagan savollardan sub-section bo'yicha tasodifiy imtihon"
      />

      <Card className="mb-8">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Imtihon sozlamalari
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label="Fan (Subject)"
            options={SUBJECT_OPTIONS}
            value={subjectId}
            onChange={(event) => handleSubjectChange(event.target.value)}
          />
          <Select
            label="Bo'lim (Section)"
            options={sections.map((section) => ({ value: section.id, label: section.name }))}
            value={effectiveSectionId}
            onChange={(event) => handleSectionChange(event.target.value)}
          />
          <Select
            label="Sub-section"
            options={subSectionOptions}
            value={subSectionId}
            onChange={(event) => setSubSectionId(event.target.value)}
          />
          <Input
            label="Savollar soni"
            type="number"
            min={5}
            max={Math.min(50, poolSize || 50)}
            value={questionCount}
            onChange={(event) => setQuestionCount(Number(event.target.value))}
          />
          <Input
            label="Vaqt (daqiqa)"
            type="number"
            value={timeLimit}
            onChange={(event) => setTimeLimit(Number(event.target.value))}
          />
        </div>

        {scopeLabel && (
          <div className="mt-4 p-4 rounded-xl bg-surface-elevated border border-border">
            <p className="text-xs text-text-muted mb-1">Imtihon qamrovi</p>
            <p className="text-sm font-medium">{scopeLabel}</p>
            <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              Savollar banki: ~{poolSize} ta (admin tomonidan sub-section uchun tayyorlangan)
            </p>
            {subSectionId === "all" && (
              <p className="text-xs text-accent mt-1">
                "All" tanlandi - tanlangan sectiondagi barcha sub-section mavzularidan tasodifiy tanlanadi.
              </p>
            )}
          </div>
        )}

        {examWarning && (
          <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-text-muted">
            <div className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 text-warning" />
              <span>{examWarning}</span>
            </div>
          </div>
        )}

        {blockedUntil && remainingBlockMs > 0 && (
          <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-4">
            <p className="text-sm font-medium text-danger">Practice Exam bugun uchun bloklangan</p>
            <p className="text-xs text-text-muted mt-1">
              Qolgan vaqt: {formatRemaining(remainingBlockMs)}
            </p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full mt-6"
          loading={generating}
          disabled={!effectiveSectionId || poolSize === 0 || Boolean(blockedUntil && remainingBlockMs > 0)}
          onClick={startExam}
        >
          <Sparkles className="w-4 h-4" />
          Imtihonni boshlash
        </Button>
      </Card>

      {result && (
        <Card className="mb-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              So'nggi natija
            </h3>
            <Badge variant="success">
              {result.correct}/{result.total} · {result.score}%
            </Badge>
          </div>
          <p className="text-sm text-text-muted mt-3">
            Bu urinish uchun XP natijadagi to&apos;g&apos;ri javoblar soniga qarab hisoblandi.
          </p>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <Badge variant="accent" className="mb-3">Admin bank</Badge>
          <h4 className="font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-accent" />
            Tayyor savollar
          </h4>
          <p className="text-sm text-text-muted mt-2">
            Har bir sub-section uchun admin oldindan savollar yaratadi. Imtihon ulardan random
            tanlanadi - AI emas, barqaror savollar banki.
          </p>
        </Card>
        <Card>
          <Badge variant="default" className="mb-3">Sub-section</Badge>
          <h4 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Aniq qamrov
          </h4>
          <p className="text-sm text-text-muted mt-2">
            Misol: Fizika {"->"} Molekulyar fizika va termodinamika {"->"} Molekulyar fizika asoslari.
            Difficulty yo&apos;q - faqat sub-section tanlanadi.
          </p>
        </Card>
      </div>

      <h3 className="font-semibold mt-10 mb-4">So'nggi practice imtihonlar</h3>
      <div className="space-y-3">
        {[
          {
            title: "Molekulyar fizika asoslari",
            section: "#3 Molekulyar fizika va termodinamika",
            score: 88,
            date: "May 20",
          },
          {
            title: "Planimetriya - All",
            section: "#2 Geometriya",
            score: 76,
            date: "May 18",
          },
        ].map((exam) => (
          <Card key={exam.title} hover>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{exam.title}</p>
                <p className="text-xs text-text-muted">{exam.section}</p>
                <p className="text-xs text-text-muted">{exam.date}</p>
              </div>
              <Badge variant="success">{exam.score}%</Badge>
            </div>
          </Card>
        ))}
      </div>

      {examOpen && examQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Practice Exam
                </h3>
                <p className="text-xs text-text-muted">
                  Fokusdan chiqsangiz exam darhol to&apos;xtatiladi. Cheat urinishlari: {cheatAttempts}/3
                </p>
              </div>
              <button
                type="button"
                onClick={() => void cancelExamSession()}
                className="rounded-xl border border-border p-2 text-text-muted hover:bg-surface-elevated"
                disabled={Boolean(result)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(92vh-140px)] overflow-y-auto px-5 py-4">
              <div className="mb-5 rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm text-text-muted">
                Exam davomida boshqa oyna, tab yoki tizim overlay ochilsa sessiya cheat deb to&apos;xtatiladi.
              </div>
              <div className="space-y-5">
                {examQuestions.map((question, questionIndex) => (
                  <div key={question.id} className="rounded-xl border border-border p-4">
                    <p className="font-medium text-sm mb-3">
                      {questionIndex + 1}. {question.question}
                    </p>
                    <div className="grid gap-2">
                      {question.options.map((option, optionIndex) => {
                        const selected = answers[question.id] === optionIndex;
                        return (
                          <button
                            key={`${question.id}-${optionIndex}`}
                            type="button"
                            onClick={() =>
                              setAnswers((current) => ({
                                ...current,
                                [question.id]: optionIndex,
                              }))
                            }
                            className={`text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                              selected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:bg-surface-elevated"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-5 py-4">
              <Button
                variant="primary"
                className="w-full"
                disabled={Object.keys(answers).length < examQuestions.length}
                onClick={submitExam}
              >
                <CheckCircle className="w-4 h-4" />
                Javoblarni yakunlash
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

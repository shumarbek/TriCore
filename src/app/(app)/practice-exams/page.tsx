"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import {
  countQuestionsInScope,
  getExamScopeLabel,
  getSections,
  getSubSections,
} from "@/lib/data/curriculum";
import { XP_REWARDS, addXp, incrementDailyActivity } from "@/lib/learning/gamification";
import { createClient } from "@/lib/supabase/client";
import { Clock, Database, Sparkles, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const SUBJECT_OPTIONS = [
  { value: "mathematics", label: "Matematika" },
  { value: "physics", label: "Fizika" },
  { value: "chemistry", label: "Kimyo" },
];

export default function PracticeExamsPage() {
  const { user, refreshProfile } = useAuth();
  const [subjectId, setSubjectId] = useState("physics");
  const [sectionId, setSectionId] = useState("");
  const [subSectionId, setSubSectionId] = useState("all");
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(45);
  const [generating, setGenerating] = useState(false);
  const supabase = createClient();

  const sections = useMemo(() => getSections(subjectId), [subjectId]);

  useEffect(() => {
    if (sections.length && !sections.some((s) => s.id === sectionId)) {
      setSectionId(sections[0].id);
      setSubSectionId("all");
    }
  }, [sections, sectionId]);

  const effectiveSectionId = sectionId || sections[0]?.id || "";

  const subSections = useMemo(
    () => getSubSections(subjectId, effectiveSectionId),
    [subjectId, effectiveSectionId]
  );

  const subSectionOptions = useMemo(
    () => [
      { value: "all", label: "All — butun section mavzulari" },
      ...subSections.map((s) => ({ value: s.id, label: s.name })),
    ],
    [subSections]
  );

  const poolSize = useMemo(
    () =>
      effectiveSectionId
        ? countQuestionsInScope(subjectId, effectiveSectionId, subSectionId)
        : 0,
    [subjectId, effectiveSectionId, subSectionId]
  );

  const scopeLabel = useMemo(
    () =>
      effectiveSectionId
        ? getExamScopeLabel(subjectId, effectiveSectionId, subSectionId)
        : "",
    [subjectId, effectiveSectionId, subSectionId]
  );

  const handleSubjectChange = (id: string) => {
    setSubjectId(id);
    const nextSections = getSections(id);
    const first = nextSections[0]?.id ?? "";
    setSectionId(first);
    setSubSectionId("all");
  };

  const handleSectionChange = (id: string) => {
    setSectionId(id);
    setSubSectionId("all");
  };

  const startExam = async () => {
    if (!user || !effectiveSectionId) return;
    setGenerating(true);
    const total = Math.max(1, questionCount);
    const correct = Math.max(0, Math.min(total, Math.round(total * 0.7)));
    const score = Math.round((correct / total) * 100);

    await supabase.from("exam_results").insert({
      user_id: user.id,
      subject_id: subjectId,
      section_id: effectiveSectionId,
      sub_section_id: subSectionId,
      score,
      total_questions: total,
      correct_answers: correct,
      time_spent: Math.max(1, timeLimit),
    } as never);
    await addXp(supabase, user.id, XP_REWARDS.practiceExam);
    await incrementDailyActivity(supabase, user.id, { exams_taken: 1, time_spent_minutes: timeLimit });
    await refreshProfile();
    setGenerating(false);
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
            onChange={(e) => handleSubjectChange(e.target.value)}
          />
          <Select
            label="Bo'lim (Section)"
            options={sections.map((s) => ({ value: s.id, label: s.name }))}
            value={effectiveSectionId}
            onChange={(e) => handleSectionChange(e.target.value)}
          />
          <Select
            label="Sub-section"
            options={subSectionOptions}
            value={subSectionId}
            onChange={(e) => setSubSectionId(e.target.value)}
          />
          <Input
            label="Savollar soni"
            type="number"
            min={5}
            max={Math.min(50, poolSize || 50)}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
          />
          <Input
            label="Vaqt (daqiqa)"
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
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
                &quot;All&quot; tanlandi — tanlangan sectiondagi barcha sub-section mavzularidan
                tasodifiy tanlanadi.
              </p>
            )}
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full mt-6"
          loading={generating}
          disabled={!effectiveSectionId || poolSize === 0}
          onClick={startExam}
        >
          <Sparkles className="w-4 h-4" />
          Imtihonni boshlash
        </Button>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <Badge variant="accent" className="mb-3">Admin bank</Badge>
          <h4 className="font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-accent" />
            Tayyor savollar
          </h4>
          <p className="text-sm text-text-muted mt-2">
            Har bir sub-section uchun admin oldindan savollar yaratadi. Imtihon ulardan random
            tanlanadi — AI emas, barqaror savollar banki.
          </p>
        </Card>
        <Card>
          <Badge variant="default" className="mb-3">Sub-section</Badge>
          <h4 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Aniq qamrov
          </h4>
          <p className="text-sm text-text-muted mt-2">
            Misol: Fizika → Molekulyar fizika va termodinamika → Molekulyar fizika asoslari.
            Difficulty yo&apos;q — faqat sub-section tanlanadi.
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
            title: "Planimetriya — All",
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
    </div>
  );
}

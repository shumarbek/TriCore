"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select } from "@/components/ui/Input";
import {
  countQuestionsInScope,
  getExamScopeLabel,
  getSections,
  getSubSections,
} from "@/lib/data/curriculum";
import { Clock, Database, Sparkles, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const SUBJECT_OPTIONS = [
  { value: "mathematics", label: "Matematika" },
  { value: "physics", label: "Fizika" },
  { value: "chemistry", label: "Kimyo" },
];

export default function PracticeExamsPage() {
  const [subjectId, setSubjectId] = useState("physics");
  const [sectionId, setSectionId] = useState("");
  const [subSectionId, setSubSectionId] = useState("all");
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(45);
  const [generating, setGenerating] = useState(false);

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

  const startExam = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
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

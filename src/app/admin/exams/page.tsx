"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { curricula, getSections, getSubSections } from "@/lib/data/curriculum";
import { cn } from "@/lib/utils";
import { Database, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface EQ {
  id: string;
  subject_id: string;
  section_id: string;
  sub_section_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export default function AdminExamsPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [subjectId, setSubjectId] = useState("physics");
  const [sectionId, setSectionId] = useState("");
  const [subSectionId, setSubSectionId] = useState("");
  const [questions, setQuestions] = useState<EQ[]>([]);
  const [editing, setEditing] = useState<EQ | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const sections = useMemo(() => getSections(subjectId), [subjectId]);
  const effectiveSection = sectionId || sections[0]?.id || "";
  const subSections = useMemo(
    () => getSubSections(subjectId, effectiveSection),
    [subjectId, effectiveSection]
  );
    const effectiveSub = subSectionId || subSections[0]?.id || "";

  const loadQuestions = useCallback(async () => {
    const { data } = await supabase
      .from("exam_questions")
      .select("*")
      .eq("subject_id", subjectId)
      .eq("section_id", effectiveSection)
      .eq("sub_section_id", effectiveSub);
    if (data) setQuestions(data as EQ[]);
  }, [supabase, subjectId, effectiveSection, effectiveSub]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  useEffect(() => {
    if (sections.length && !sections.some((s) => s.id === sectionId)) {
      setSectionId(sections[0].id);
      setSubSectionId("");
    }
  }, [sections, sectionId]);

  useEffect(() => {
    if (subSections.length && !subSections.some((s) => s.id === subSectionId)) {
      setSubSectionId(subSections[0].id);
    }
  }, [subSections, subSectionId]);

    const filtered = questions; // Already filtered from DB

  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
  });

    const saveQuestion = async () => {
    const payload = {
      subject_id: subjectId,
      section_id: effectiveSection,
      sub_section_id: effectiveSub,
      question: form.question,
      options: form.options.filter(Boolean),
      correct_index: form.correctIndex,
      explanation: form.explanation,
    };
    if (editing) {
      await supabase.from("exam_questions").update(payload as never).eq("id", editing.id);
    } else {
      await supabase.from("exam_questions").insert({ ...payload, created_by: user!.id } as never);
    }
    setEditing(null);
    setShowAdd(false);
    setForm({ question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" });
    loadQuestions();
  };

  const startEdit = (q: EQ) => {
    setEditing(q);
    setForm({
      question: q.question,
      options: [...q.options, "", "", ""].slice(0, 4),
      correctIndex: q.correct_index,
      explanation: q.explanation,
    });
    setShowAdd(true);
  };

  const deleteQuestion = async (id: string) => {
    await supabase.from("exam_questions").delete().eq("id", id);
    loadQuestions();
  };

  return (
    <div>
      <PageHeader
        title="Exam Bank"
        description="Har bir sub-section uchun Practice Exam savollarini qo'shish va tahrirlash"
        action={
          <Button variant="primary" onClick={() => { setShowAdd(true); setEditing(null); }}>
            <Plus className="w-4 h-4" /> Savol qo&apos;shish
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <Select
            label="Fan"
            options={curricula.map((c) => ({ value: c.id, label: c.name }))}
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              setSectionId("");
              setSubSectionId("");
            }}
          />
          <Select
            label="Section"
            options={sections.map((s) => ({ value: s.id, label: s.name }))}
            value={effectiveSection}
            onChange={(e) => {
              setSectionId(e.target.value);
              setSubSectionId("");
            }}
          />
          <Select
            label="Sub-section"
            options={subSections.map((s) => ({ value: s.id, label: s.name }))}
            value={effectiveSub}
            onChange={(e) => setSubSectionId(e.target.value)}
          />
        </div>
        <p className="text-sm text-text-muted mt-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-accent" />
          {filtered.length} ta savol shu sub-section uchun
        </p>
      </Card>

      {(showAdd || editing) && (
        <Card className="mb-6 border-primary/30">
          <h3 className="font-semibold mb-4">
            {editing ? "Savolni tahrirlash" : "Yangi savol"}
          </h3>
          <div className="space-y-4">
            <Textarea
              label="Savol matni"
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            />
            {form.options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="radio"
                  name="correct"
                  checked={form.correctIndex === i}
                  onChange={() => setForm((f) => ({ ...f, correctIndex: i }))}
                />
                <Input
                  placeholder={`Variant ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const options = [...form.options];
                    options[i] = e.target.value;
                    setForm((f) => ({ ...f, options }));
                  }}
                />
              </div>
            ))}
            <Textarea
              label="Tushuntirish"
              value={form.explanation}
              onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" onClick={saveQuestion}>Saqlash</Button>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>
              Bekor
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {filtered.map((q) => (
          <Card key={q.id}>
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">{q.question}</p>
                <ul className="mt-2 space-y-1 text-sm text-text-muted">
                                    {q.options.map((o, i) => (
                    <li
                      key={`${q.id}-${i}`}
                      className={cn(i === q.correct_index && "text-success font-medium")}
                    >
                      {i + 1}. {o} {i === q.correct_index && "✓"}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-text-muted mt-2">{q.explanation}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" size="sm" onClick={() => startEdit(q)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteQuestion(q.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-text-muted py-8">
            Bu sub-section uchun savollar yo&apos;q. Qo&apos;shing.
          </p>
        )}
      </div>
    </div>
  );
}

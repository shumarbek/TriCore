"use client";

import { LessonEditorModal } from "@/components/admin/LessonEditorModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import {
  getAdminLessonStats,
  getAdminLessons,
  type LessonAdminData,
} from "@/lib/data/admin-lessons";
import { curricula, getSections, getSubSections } from "@/lib/data/curriculum";
import { toLessonContentOverride } from "@/lib/lesson-content";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { BookOpen, Layers, Pencil, Plus, Search, Video } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

function mergeLessons(
  baseLessons: LessonAdminData[],
  overrides: Array<{
    lesson_id: string;
    title: string;
    subject_id?: string;
    subject_name?: string;
    section_id?: string;
    section_name?: string;
    sub_section_id?: string;
    sub_section_name?: string;
    order_index?: number;
    video_url: string;
    handbook_rules: string;
    handbook_terms: string;
    formulas: string;
    mini_exam_count: number;
    homework_pdf: string;
    homework_deadline: string;
  }>
) {
  const baseById = new Map(baseLessons.map((lesson) => [lesson.id, lesson]));
  const mergedBase = baseLessons.map((lesson) => {
    const override = overrides.find((row) => row.lesson_id === lesson.id);
    return override
      ? {
          ...lesson,
          title: override.title,
          subjectId: override.subject_id || lesson.subjectId,
          subjectName: override.subject_name || lesson.subjectName,
          sectionId: override.section_id || lesson.sectionId,
          sectionName: override.section_name || lesson.sectionName,
          subSectionId: override.sub_section_id || lesson.subSectionId,
          subSectionName: override.sub_section_name || lesson.subSectionName,
          order: override.order_index ?? lesson.order,
          videoUrl: override.video_url,
          handbookRules: override.handbook_rules,
          handbookTerms: override.handbook_terms,
          formulas: override.formulas,
          miniExamCount: override.mini_exam_count,
          homeworkPdf: override.homework_pdf,
          homeworkDeadline: override.homework_deadline,
        }
      : lesson;
  });

  const extraLessons = overrides
    .filter((row) => !baseById.has(row.lesson_id))
    .map((row) => {
      const localMatch = baseLessons.find((lesson) => lesson.id === row.lesson_id);
      if (localMatch) return localMatch;
      return {
        id: row.lesson_id,
        title: row.title,
        subjectId: row.subject_id || "mathematics",
        subjectName: row.subject_name || "Matematika",
        sectionId: row.section_id || "",
        sectionName: row.section_name || "",
        subSectionId: row.sub_section_id || "",
        subSectionName: row.sub_section_name || "",
        order: row.order_index ?? 999,
        videoUrl: row.video_url,
        handbookRules: row.handbook_rules,
        handbookTerms: row.handbook_terms,
        formulas: row.formulas,
        miniExamCount: row.mini_exam_count,
        homeworkPdf: row.homework_pdf,
        homeworkDeadline: row.homework_deadline,
      } satisfies LessonAdminData;
    });

  return [...extraLessons, ...mergedBase];
}

export default function AdminContentPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const stats = getAdminLessonStats();
  const [lessons, setLessons] = useState<LessonAdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [editing, setEditing] = useState<LessonAdminData | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [newLesson, setNewLesson] = useState({
    subjectId: "mathematics",
    sectionId: "",
    subSectionId: "",
    title: "",
    videoUrl: "",
    handbookRules: "",
    handbookTerms: "",
    formulas: "",
    miniExamCount: 10,
    homeworkPdf: "",
    homeworkDeadline: "",
  });

  const loadLessons = useCallback(async () => {
    const { data, error } = await supabase.from("lesson_content").select("*");
    if (error) {
      setSaveError(error.message);
      setLessons(getAdminLessons());
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as Array<{
      lesson_id: string;
      title: string;
      subject_id?: string;
      subject_name?: string;
      section_id?: string;
      section_name?: string;
      sub_section_id?: string;
      sub_section_name?: string;
      order_index?: number;
      video_url: string;
      handbook_rules: string;
      handbook_terms: string;
      formulas: string;
      mini_exam_count: number;
      homework_pdf: string;
      homework_deadline: string;
    }>;
    setSaveError("");
    setLessons(mergeLessons(getAdminLessons(), rows));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      await loadLessons();
      if (!active) return;
    };

    load();

    const channel = supabase
      .channel("admin-lesson-content")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lesson_content" },
        () => {
          void loadLessons();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [loadLessons, supabase]);

  const sections = useMemo(
    () => getSections(newLesson.subjectId),
    [newLesson.subjectId]
  );
  const subSections = useMemo(
    () =>
      getSubSections(
        newLesson.subjectId,
        newLesson.sectionId || sections[0]?.id || ""
      ),
    [newLesson.subjectId, newLesson.sectionId, sections]
  );

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      const q = search.toLowerCase();
      const matchQ =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q);
      const matchSub = filterSubject === "all" || l.subjectId === filterSubject;
      return matchQ && matchSub;
    });
  }, [lessons, search, filterSubject]);

  const handleSave = async (data: LessonAdminData) => {
    setSaveError("");
    setLessons((prev) => prev.map((l) => (l.id === data.id ? data : l)));
    if (!user) {
      setSaveError("Admin session topilmadi. Qayta login qiling.");
      await loadLessons();
      return;
    }
    const { error } = await supabase.from("lesson_content").upsert(
      {
        ...toLessonContentOverride(data),
        updated_by: user.id,
      } as never,
      { onConflict: "lesson_id" }
    );
    if (error) {
      setSaveError(error.message);
      await loadLessons();
      return;
    }
    setEditing(null);
  };

  const handleAddLesson = async () => {
    setSaveError("");
    const subj = curricula.find((c) => c.id === newLesson.subjectId);
    const effectiveSectionId = newLesson.sectionId || subj?.sections[0]?.id || "";
    const sec = subj?.sections.find((s) => s.id === effectiveSectionId);
    const effectiveSubSectionId = newLesson.subSectionId || sec?.subSections[0]?.id || "";
    const sub = sec?.subSections.find((s) => s.id === effectiveSubSectionId);
    const id = `new-${Date.now()}`;
    const item: LessonAdminData = {
      id,
      title: newLesson.title || "Yangi dars",
      subjectId: newLesson.subjectId,
      subjectName: subj?.name ?? "",
      sectionId: effectiveSectionId,
      sectionName: sec?.name ?? "",
      subSectionId: effectiveSubSectionId,
      subSectionName: sub?.name ?? "",
      order: 999,
      videoUrl: newLesson.videoUrl,
      handbookRules: newLesson.handbookRules,
      handbookTerms: newLesson.handbookTerms,
      formulas: newLesson.formulas,
      miniExamCount: newLesson.miniExamCount,
      homeworkPdf: newLesson.homeworkPdf,
      homeworkDeadline: newLesson.homeworkDeadline,
    };
    setLessons((prev) => [item, ...prev]);
    if (!user) {
      setSaveError("Admin session topilmadi. Qayta login qiling.");
      await loadLessons();
      return;
    }
    const { error } = await supabase.from("lesson_content").upsert(
      {
        ...toLessonContentOverride(item),
        updated_by: user.id,
      } as never,
      { onConflict: "lesson_id" }
    );
    if (error) {
      setSaveError(error.message);
      await loadLessons();
      return;
    }
    setShowAdd(false);
    setEditing(item);
  };

  return (
    <div>
      <PageHeader
        title="Content Management"
        description="Darslarni tahrirlash: title, video, ma'lumotnoma, formula, mini exam, homework"
        action={
          <Button variant="primary" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-4 h-4" /> Yangi dars
          </Button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <BookOpen className="w-7 h-7 text-primary mb-2" />
          <p className="text-2xl font-bold">{stats.subjects}</p>
          <p className="text-sm text-text-muted">Fanlar</p>
        </Card>
        <Card>
          <Layers className="w-7 h-7 text-accent mb-2" />
          <p className="text-2xl font-bold">{stats.sections}</p>
          <p className="text-sm text-text-muted">Sectionlar</p>
        </Card>
        <Card>
          <Video className="w-7 h-7 text-secondary mb-2" />
          <p className="text-2xl font-bold">{lessons.length || stats.lessons}</p>
          <p className="text-sm text-text-muted">Darslar</p>
        </Card>
      </div>

      {showAdd && (
        <Card className="mb-6 border-primary/30">
          <h3 className="font-semibold mb-4">Yangi dars qo&apos;shish</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Fan"
              options={curricula.map((c) => ({ value: c.id, label: c.name }))}
              value={newLesson.subjectId}
              onChange={(e) =>
                setNewLesson((n) => ({
                  ...n,
                  subjectId: e.target.value,
                  sectionId: "",
                  subSectionId: "",
                }))
              }
            />
            <Select
              label="Section"
              options={sections.map((s) => ({ value: s.id, label: s.name }))}
              value={newLesson.sectionId || sections[0]?.id || ""}
              onChange={(e) =>
                setNewLesson((n) => ({
                  ...n,
                  sectionId: e.target.value,
                  subSectionId: "",
                }))
              }
            />
            <Select
              label="Sub-section"
              options={subSections.map((s) => ({ value: s.id, label: s.name }))}
              value={newLesson.subSectionId || subSections[0]?.id || ""}
              onChange={(e) =>
                setNewLesson((n) => ({ ...n, subSectionId: e.target.value }))
              }
            />
            <Input
              label="Title"
              value={newLesson.title}
              onChange={(e) => setNewLesson((n) => ({ ...n, title: e.target.value }))}
            />
            <Input
              label="Video URL"
              className="sm:col-span-2"
              value={newLesson.videoUrl}
              onChange={(e) => setNewLesson((n) => ({ ...n, videoUrl: e.target.value }))}
            />
            <Textarea
              label="Ma'lumotnoma — qoidalar"
              value={newLesson.handbookRules}
              onChange={(e) =>
                setNewLesson((n) => ({ ...n, handbookRules: e.target.value }))
              }
            />
            <Textarea
              label="Ma'lumotnoma — atamalar"
              value={newLesson.handbookTerms}
              onChange={(e) =>
                setNewLesson((n) => ({ ...n, handbookTerms: e.target.value }))
              }
            />
            <Textarea
              label="Formulalar"
              className="sm:col-span-2"
              value={newLesson.formulas}
              onChange={(e) => setNewLesson((n) => ({ ...n, formulas: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" onClick={handleAddLesson}>
              Darsni yaratish
            </Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Bekor
            </Button>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Dars qidirish..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterSubject("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm border",
                filterSubject === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-text-muted"
              )}
            >
              Barchasi
            </button>
            {curricula.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilterSubject(c.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm border",
                  filterSubject === c.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-muted"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {saveError && (
        <Card className="mb-6 border-danger/30">
          <p className="text-sm text-danger">{saveError}</p>
        </Card>
      )}

      <div className="space-y-2">
        {loading && (
          <Card>
            <p className="text-sm text-text-muted">Dars ma&apos;lumotlari yuklanmoqda...</p>
          </Card>
        )}
        {filtered.slice(0, 50).map((lesson) => (
          <Card key={lesson.id} hover className="!p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{lesson.title}</p>
                <p className="text-xs text-text-muted truncate">
                  {lesson.subjectName} · {lesson.sectionName} · {lesson.subSectionName}
                </p>
                <p className="text-xs text-text-muted font-mono mt-0.5">{lesson.id}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="muted">{lesson.miniExamCount} MCQ</Badge>
                <Button variant="primary" size="sm" onClick={() => setEditing(lesson)}>
                  <Pencil className="w-3.5 h-3.5" /> Tahrirlash
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length > 50 && (
          <p className="text-center text-sm text-text-muted py-2">
            +{filtered.length - 50} ta dars yana mavjud (filtrni toraytiring)
          </p>
        )}
      </div>

      <LessonEditorModal
        lesson={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </div>
  );
}

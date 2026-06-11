"use client";

import { LessonEditorModal } from "@/components/admin/LessonEditorModal";
import { MiniExamEditor } from "@/components/admin/MiniExamEditor";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import {
  getAdminLessonStats,
  type LessonAdminData,
} from "@/lib/data/admin-lessons";
import { curricula } from "@/lib/data/curriculum";
import {
  buildRuntimeCurricula,
  getRuntimeSections,
  getRuntimeSubSections,
  type CurriculumStructureNode,
} from "@/lib/data/curriculum/runtime";
import { toLessonContentOverride, type LessonContentOverride } from "@/lib/lesson-content";
import { notifyDataChanged, useLiveRefresh } from "@/lib/live-refresh";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { BookOpen, FolderPlus, Layers, Pencil, Plus, Search, Trash2, Video } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const LESSON_CONTENT_MIGRATION_MESSAGE =
  "Supabase lesson_content jadvalida yangi dars metadata ustunlari yo'q. SQL Editor'da supabase/lesson_content_metadata_migration.sql faylini ishga tushiring.";

function isMissingLessonContentMetadataError(message?: string) {
  return Boolean(
    message &&
      (message.includes("lesson_content.subject_id") ||
        message.includes("lesson_content.subject_name") ||
        message.includes("lesson_content.section_id") ||
        message.includes("lesson_content.sub_section_id") ||
        message.includes("lesson_content.mini_exam_questions") ||
        message.includes("lesson_content.order_index") ||
        message.includes("column") && message.includes("does not exist"))
  );
}

function formatSaveError(message: string) {
  return isMissingLessonContentMetadataError(message)
    ? `${LESSON_CONTENT_MIGRATION_MESSAGE} Asl xato: ${message}`
    : message;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function createUniqueId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

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
    mini_exam_questions?: string;
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
          miniExamQuestions: override.mini_exam_questions || "[]",
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
        miniExamQuestions: row.mini_exam_questions || "[]",
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
  const [lessonRows, setLessonRows] = useState<LessonContentOverride[]>([]);
  const [structureRows, setStructureRows] = useState<CurriculumStructureNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [schemaWarning, setSchemaWarning] = useState("");
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [editing, setEditing] = useState<LessonAdminData | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [structureBusy, setStructureBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState<"save" | "add" | "delete" | null>(null);

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
    miniExamQuestions: "[]",
    homeworkPdf: "",
  });

  const runtimeCurricula = useMemo(
    () => buildRuntimeCurricula(structureRows, lessonRows),
    [lessonRows, structureRows]
  );

  const loadLessons = useCallback(async () => {
    setLoading(true);
    try {
      const { data: structureData, error: structureError } = await supabase
        .from("curriculum_structure")
        .select("*")
        .order("order_index", { ascending: true });
      if (structureError) throw structureError;
      setStructureRows((structureData ?? []) as CurriculumStructureNode[]);

      const { error: schemaError } = await supabase
        .from("lesson_content")
        .select("lesson_id, subject_id, order_index")
        .limit(1);

      setSchemaWarning(
        schemaError && isMissingLessonContentMetadataError(schemaError.message)
          ? formatSaveError(schemaError.message)
          : ""
      );

      const { data, error } = await supabase.from("lesson_content").select("*");
      if (error) throw error;

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
        mini_exam_questions?: string;
      }>;
      setLessonRows(rows as LessonContentOverride[]);
      setLessons(mergeLessons([], rows));
      if (!schemaError) setSaveError("");
    } catch (error) {
      setSaveError(formatSaveError(getErrorMessage(error)));
      setLessonRows([]);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void loadLessons();
    });

    const lessonChannel = supabase
      .channel("admin-lesson-content")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lesson_content" },
        () => {
          void loadLessons();
        }
      )
      .subscribe();
    const structureChannel = supabase
      .channel("admin-curriculum-structure")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "curriculum_structure" },
        () => {
          void loadLessons();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(lessonChannel);
      supabase.removeChannel(structureChannel);
    };
  }, [loadLessons, supabase]);

  useLiveRefresh(() => {
    void loadLessons();
  });

  const sections = useMemo(
    () => getRuntimeSections(runtimeCurricula, newLesson.subjectId),
    [newLesson.subjectId, runtimeCurricula]
  );
  const subSections = useMemo(
    () => getRuntimeSubSections(runtimeCurricula, newLesson.subjectId, newLesson.sectionId || sections[0]?.id || ""),
    [newLesson.sectionId, newLesson.subjectId, runtimeCurricula, sections]
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
    let nextError = "";
    setSaveError("");
    setActionBusy("save");
    if (!user) {
      nextError = "Admin session topilmadi. Qayta login qiling.";
      await loadLessons();
      setSaveError(nextError);
      setActionBusy(null);
      return;
    }
    try {
      const { error } = await supabase.from("lesson_content").upsert(
        {
          ...toLessonContentOverride(data),
          updated_by: user.id,
        } as never,
        { onConflict: "lesson_id" }
      );
      if (error) throw error;
      setEditing(null);
      notifyDataChanged();
    } catch (error) {
      nextError = formatSaveError(getErrorMessage(error));
    } finally {
      await loadLessons();
      if (nextError) setSaveError(nextError);
      setActionBusy(null);
    }
  };

  const handleAddLesson = async () => {
    let nextError = "";
    setSaveError("");
    const subj = runtimeCurricula.find((c) => c.id === newLesson.subjectId);
    const effectiveSectionId = newLesson.sectionId || subj?.sections[0]?.id || "";
    const sec = subj?.sections.find((s) => s.id === effectiveSectionId);
    const effectiveSubSectionId = newLesson.subSectionId || sec?.subSections[0]?.id || "";
    const sub = sec?.subSections.find((s) => s.id === effectiveSubSectionId);
    if (!effectiveSectionId || !effectiveSubSectionId || !sub) {
      setSaveError("Yangi dars qo'shishdan oldin section va sub-section mavjud bo'lishi kerak.");
      return;
    }
    setActionBusy("add");
    const id = createUniqueId("new");
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
      miniExamQuestions: newLesson.miniExamQuestions,
      homeworkPdf: newLesson.homeworkPdf,
      homeworkDeadline: "",
    };
    if (!user) {
      nextError = "Admin session topilmadi. Qayta login qiling.";
      await loadLessons();
      setSaveError(nextError);
      setActionBusy(null);
      return;
    }
    try {
      const { error } = await supabase.from("lesson_content").upsert(
        {
          ...toLessonContentOverride(item),
          updated_by: user.id,
        } as never,
        { onConflict: "lesson_id" }
      );
      if (error) throw error;
      setShowAdd(false);
      setEditing(item);
      notifyDataChanged();
    } catch (error) {
      nextError = formatSaveError(getErrorMessage(error));
    } finally {
      await loadLessons();
      if (nextError) setSaveError(nextError);
      setActionBusy(null);
    }
  };

  const handleDeleteLesson = async (lesson: LessonAdminData) => {
    let nextError = "";
    setSaveError("");
    setActionBusy("delete");
    if (!user) {
      nextError = "Admin session topilmadi. Qayta login qiling.";
      await loadLessons();
      setSaveError(nextError);
      setActionBusy(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("lesson_content")
        .delete()
        .eq("lesson_id", lesson.id);
      if (error) throw error;
      setEditing(null);
      notifyDataChanged();
    } catch (error) {
      nextError = formatSaveError(getErrorMessage(error));
    } finally {
      await loadLessons();
      if (nextError) setSaveError(nextError);
      setActionBusy(null);
    }
  };

  const upsertStructureNode = async (node: CurriculumStructureNode) => {
    if (!user) {
      setSaveError("Admin session topilmadi. Qayta login qiling.");
      return false;
    }
    let nextError = "";
    setStructureBusy(true);
    try {
      const { error } = await supabase.from("curriculum_structure").upsert(
        {
          ...node,
          parent_section_id: node.parent_section_id ?? "",
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        } as never,
        { onConflict: "node_type,subject_id,node_id,parent_section_id" }
      );
      if (error) throw error;
      notifyDataChanged();
      return true;
    } catch (error) {
      nextError = formatSaveError(getErrorMessage(error));
      return false;
    } finally {
      await loadLessons();
      if (nextError) setSaveError(nextError);
      setStructureBusy(false);
    }
  };

  const createSection = async (subjectId: string) => {
    const name = window.prompt("Yangi section nomi");
    if (!name?.trim()) return;
    const orderRaw = window.prompt("Section tartibi", String((runtimeCurricula.find((subject) => subject.id === subjectId)?.sections.length ?? 0) + 1));
    const order = Number(orderRaw || "999");
    await upsertStructureNode({
      node_id: createUniqueId("section"),
      node_type: "section",
      subject_id: subjectId,
      parent_section_id: "",
      name: name.trim(),
      order_index: Number.isFinite(order) ? order : 999,
      is_deleted: false,
    });
  };

  const editSection = async (subjectId: string, sectionId: string, currentName: string, currentOrder: number) => {
    const name = window.prompt("Section nomi", currentName);
    if (!name?.trim()) return;
    const orderRaw = window.prompt("Section tartibi", String(currentOrder));
    const order = Number(orderRaw || currentOrder);
    await upsertStructureNode({
      node_id: sectionId,
      node_type: "section",
      subject_id: subjectId,
      parent_section_id: "",
      name: name.trim(),
      order_index: Number.isFinite(order) ? order : currentOrder,
      is_deleted: false,
    });
  };

  const deleteSection = async (subjectId: string, sectionId: string, sectionName: string, lessonCount: number) => {
    const warning =
      lessonCount > 0
        ? `${sectionName} ichida ${lessonCount} ta dars bor. O'chirsangiz shu bo'lim user tomonda yashirinadi. Davom etilsinmi?`
        : `${sectionName} section o'chirilsinmi?`;
    if (!window.confirm(warning)) return;
    await upsertStructureNode({
      node_id: sectionId,
      node_type: "section",
      subject_id: subjectId,
      parent_section_id: "",
      name: sectionName,
      order_index: 999,
      is_deleted: true,
    });
  };

  const createSubSection = async (subjectId: string, sectionId: string, sectionName: string) => {
    const name = window.prompt(`${sectionName} uchun yangi sub-section nomi`);
    if (!name?.trim()) return;
    await upsertStructureNode({
      node_id: createUniqueId("sub"),
      node_type: "sub_section",
      subject_id: subjectId,
      parent_section_id: sectionId,
      name: name.trim(),
      order_index: 999,
      is_deleted: false,
    });
  };

  const editSubSection = async (
    subjectId: string,
    sectionId: string,
    subSectionId: string,
    currentName: string
  ) => {
    const name = window.prompt("Sub-section nomi", currentName);
    if (!name?.trim()) return;
    await upsertStructureNode({
      node_id: subSectionId,
      node_type: "sub_section",
      subject_id: subjectId,
      parent_section_id: sectionId,
      name: name.trim(),
      order_index: 999,
      is_deleted: false,
    });
  };

  const deleteSubSection = async (
    subjectId: string,
    sectionId: string,
    subSectionId: string,
    subSectionName: string,
    lessonCount: number
  ) => {
    const warning =
      lessonCount > 0
        ? `${subSectionName} ichida ${lessonCount} ta dars bor. O'chirsangiz shu bo'lim user tomonda yashirinadi. Davom etilsinmi?`
        : `${subSectionName} sub-section o'chirilsinmi?`;
    if (!window.confirm(warning)) return;
    await upsertStructureNode({
      node_id: subSectionId,
      node_type: "sub_section",
      subject_id: subjectId,
      parent_section_id: sectionId,
      name: subSectionName,
      order_index: 999,
      is_deleted: true,
    });
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
          <p className="text-2xl font-bold">{runtimeCurricula.reduce((total, subject) => total + subject.sections.length, 0)}</p>
          <p className="text-sm text-text-muted">Sectionlar</p>
        </Card>
        <Card>
          <Video className="w-7 h-7 text-secondary mb-2" />
          <p className="text-2xl font-bold">{lessons.length || stats.lessons}</p>
          <p className="text-sm text-text-muted">Darslar</p>
        </Card>
      </div>

      <div className="space-y-4 mb-6">
        {runtimeCurricula.map((subject) => (
          <Card key={subject.id}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold">{subject.name}</h3>
                <p className="text-xs text-text-muted">Section va sub-section boshqaruvi</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                loading={structureBusy}
                disabled={Boolean(actionBusy)}
                onClick={() => createSection(subject.id)}
              >
                <FolderPlus className="w-4 h-4" /> Section qo&apos;shish
              </Button>
            </div>
            <div className="space-y-3">
              {subject.sections.map((section) => {
                const lessonCount = section.subSections.reduce((count, subSection) => count + subSection.lessons.length, 0);
                return (
                  <div key={section.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{section.name}</p>
                        <p className="text-xs text-text-muted">{lessonCount} ta dars</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" size="sm" disabled={structureBusy || Boolean(actionBusy)} onClick={() => createSubSection(subject.id, section.id, section.name)}>
                          <Plus className="w-3.5 h-3.5" /> Sub-section
                        </Button>
                        <Button variant="outline" size="sm" disabled={structureBusy || Boolean(actionBusy)} onClick={() => editSection(subject.id, section.id, section.name, section.order)}>
                          <Pencil className="w-3.5 h-3.5" /> Tahrirlash
                        </Button>
                        <Button variant="danger" size="sm" disabled={structureBusy || Boolean(actionBusy)} onClick={() => deleteSection(subject.id, section.id, section.name, lessonCount)}>
                          <Trash2 className="w-3.5 h-3.5" /> O&apos;chirish
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {section.subSections.map((subSection) => (
                        <div key={subSection.id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg bg-surface-elevated p-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{subSection.name}</p>
                            <p className="text-xs text-text-muted">{subSection.lessons.length} ta dars</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" disabled={structureBusy || Boolean(actionBusy)} onClick={() => editSubSection(subject.id, section.id, subSection.id, subSection.name)}>
                              <Pencil className="w-3.5 h-3.5" /> Tahrirlash
                            </Button>
                            <Button variant="danger" size="sm" disabled={structureBusy || Boolean(actionBusy)} onClick={() => deleteSubSection(subject.id, section.id, subSection.id, subSection.name, subSection.lessons.length)}>
                              <Trash2 className="w-3.5 h-3.5" /> O&apos;chirish
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
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
            <div className="sm:col-span-2">
              <MiniExamEditor
                value={newLesson.miniExamQuestions}
                onChange={(miniExamQuestions, miniExamCount) =>
                  setNewLesson((n) => ({ ...n, miniExamQuestions, miniExamCount }))
                }
              />
            </div>
            <Input
              label="Homework link"
              className="sm:col-span-2"
              value={newLesson.homeworkPdf}
              onChange={(e) => setNewLesson((n) => ({ ...n, homeworkPdf: e.target.value }))}
              placeholder="https://... yoki fayl manzili"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="primary"
              loading={actionBusy === "add"}
              disabled={!sections.length || !subSections.length || structureBusy}
              onClick={handleAddLesson}
            >
              Darsni yaratish
            </Button>
            <Button variant="outline" disabled={Boolean(actionBusy)} onClick={() => setShowAdd(false)}>
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

      {(schemaWarning || saveError) && (
        <Card className="mb-6 border-danger/30">
          <p className="text-sm text-danger">{saveError || schemaWarning}</p>
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
                <Button variant="danger" size="sm" onClick={() => setEditing(lesson)}>
                  <Trash2 className="w-3.5 h-3.5" /> O&apos;chirish
                </Button>
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
        onDelete={handleDeleteLesson}
        saving={actionBusy === "save"}
        deleting={actionBusy === "delete"}
      />
    </div>
  );
}

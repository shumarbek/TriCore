"use client";

import { LessonEditorModal } from "@/components/admin/LessonEditorModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select, Textarea } from "@/components/ui/Input";
import {
  getAdminLessonStats,
  getAdminLessons,
  type LessonAdminData,
} from "@/lib/data/admin-lessons";
import { curricula, getSections, getSubSections } from "@/lib/data/curriculum";
import { cn } from "@/lib/utils";
import { BookOpen, Layers, Pencil, Plus, Search, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const ADMIN_LESSONS_KEY = "tricore-admin-lessons";

export default function AdminContentPage() {
  const stats = getAdminLessonStats();
  const [lessons, setLessons] = useState(getAdminLessons);
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

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_LESSONS_KEY);
    if (saved) setLessons(JSON.parse(saved) as LessonAdminData[]);
  }, []);

  useEffect(() => {
    localStorage.setItem(ADMIN_LESSONS_KEY, JSON.stringify(lessons));
  }, [lessons]);

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

  const handleSave = (data: LessonAdminData) => {
    setLessons((prev) => prev.map((l) => (l.id === data.id ? data : l)));
    setEditing(null);
  };

  const handleAddLesson = () => {
    const subj = curricula.find((c) => c.id === newLesson.subjectId);
    const sec = subj?.sections.find((s) => s.id === newLesson.sectionId);
    const sub = sec?.subSections.find((s) => s.id === newLesson.subSectionId);
    const id = `new-${Date.now()}`;
    const item: LessonAdminData = {
      id,
      title: newLesson.title || "Yangi dars",
      subjectId: newLesson.subjectId,
      subjectName: subj?.name ?? "",
      sectionId: newLesson.sectionId,
      sectionName: sec?.name ?? "",
      subSectionId: newLesson.subSectionId,
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
          <p className="text-2xl font-bold">{stats.lessons}</p>
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

      <div className="space-y-2">
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

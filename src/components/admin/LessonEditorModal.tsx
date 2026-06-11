"use client";

import { MiniExamEditor } from "@/components/admin/MiniExamEditor";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { LessonAdminData } from "@/lib/data/admin-lessons";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { BookMarked, FileText, Trash2, Target, Video, X } from "lucide-react";
import { useEffect, useState } from "react";

const editorTabs = [
  { id: "basic", label: "Asosiy", icon: Video },
  { id: "handbook", label: "Ma'lumotnoma", icon: BookMarked },
  { id: "formula", label: "Formula", icon: FileText },
  { id: "exam", label: "Mini Exam", icon: Target },
  { id: "homework", label: "Homework", icon: FileText },
] as const;

interface LessonEditorModalProps {
  lesson: LessonAdminData | null;
  onClose: () => void;
  onSave: (data: LessonAdminData) => Promise<void> | void;
  onDelete?: (lesson: LessonAdminData) => Promise<void> | void;
  saving?: boolean;
  deleting?: boolean;
}

export function LessonEditorModal({
  lesson,
  onClose,
  onSave,
  onDelete,
  saving = false,
  deleting = false,
}: LessonEditorModalProps) {
  const [tab, setTab] = useState<(typeof editorTabs)[number]["id"]>("basic");
  const [form, setForm] = useState<LessonAdminData | null>(lesson);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setForm(lesson);
      setTab("basic");
      setConfirmDelete(false);
    });
    return () => {
      active = false;
    };
  }, [lesson]);

  if (!lesson || !form) return null;

  const update = (patch: Partial<LessonAdminData>) =>
    setForm((f) => (f ? { ...f, ...patch } : f));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="text-lg font-bold">Darsni tahrirlash</h2>
              <p className="text-xs text-text-muted font-mono">{form.id}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-surface-elevated">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-1 px-5 pt-3 overflow-x-auto border-b border-border">
            {editorTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap",
                  tab === t.id ? "bg-primary/15 text-primary" : "text-text-muted"
                )}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {tab === "basic" && (
              <>
                <Input
                  label="Title"
                  value={form.title}
                  onChange={(e) => update({ title: e.target.value })}
                />
                <Input
                  label="Video URL"
                  value={form.videoUrl}
                  onChange={(e) => update({ videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
                <p className="text-xs text-text-muted">
                  {form.subjectName} · {form.sectionName} · {form.subSectionName}
                </p>
              </>
            )}
            {tab === "handbook" && (
              <>
                <Textarea
                  label="Qoidalar (har qator — alohida qoida)"
                  className="min-h-[120px] font-mono text-sm"
                  value={form.handbookRules}
                  onChange={(e) => update({ handbookRules: e.target.value })}
                />
                <Textarea
                  label="Atamalar (format: atama|ta'rif)"
                  className="min-h-[120px] font-mono text-sm"
                  value={form.handbookTerms}
                  onChange={(e) => update({ handbookTerms: e.target.value })}
                />
              </>
            )}
            {tab === "formula" && (
              <Textarea
                label="Formulalar (har qator — alohida)"
                className="min-h-[160px] font-mono text-sm"
                value={form.formulas}
                onChange={(e) => update({ formulas: e.target.value })}
              />
            )}
            {tab === "exam" && (
              <MiniExamEditor
                value={form.miniExamQuestions}
                onChange={(miniExamQuestions, miniExamCount) =>
                  update({ miniExamQuestions, miniExamCount })
                }
              />
            )}
            {tab === "homework" && (
              <>
                <Input
                  label="Homework link"
                  value={form.homeworkPdf}
                  onChange={(e) => update({ homeworkPdf: e.target.value })}
                  placeholder="https://... yoki fayl manzili"
                />
              </>
            )}
          </div>

          <div className="p-5 border-t border-border flex flex-col sm:flex-row sm:justify-between gap-2">
            {onDelete && (
              <Button
                variant="danger"
                loading={deleting}
                disabled={saving}
                onClick={() => {
                  if (!confirmDelete) {
                    setConfirmDelete(true);
                    return;
                  }
                  void onDelete(form);
                }}
              >
                <Trash2 className="w-4 h-4" />
                {confirmDelete ? "Tasdiqlash: o'chirish" : "Darsni o'chirish"}
              </Button>
            )}
            <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={saving || deleting} onClick={onClose}>Bekor</Button>
            <Button
              variant="primary"
              loading={saving}
              disabled={deleting}
              onClick={() => void onSave(form)}
            >
              Saqlash
            </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

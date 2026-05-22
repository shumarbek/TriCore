"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { curricula, countQuestionsInScope } from "@/lib/data/curriculum";
import { cn } from "@/lib/utils";
import {
  BookMarked,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Database,
  FileText,
  Layers,
  Plus,
  ScrollText,
} from "lucide-react";
import { useMemo, useState } from "react";

type ContentTab = "lessons" | "handbook" | "exams" | "homework";

export default function AdminContentPage() {
  const [tab, setTab] = useState<ContentTab>("lessons");
  const [expandedSubject, setExpandedSubject] = useState<string | null>("physics");

  const stats = useMemo(() => {
    let lessons = 0;
    let subSections = 0;
    let sections = 0;
    for (const s of curricula) {
      sections += s.sections.length;
      for (const sec of s.sections) {
        subSections += sec.subSections.length;
        for (const sub of sec.subSections) {
          lessons += sub.lessons.length;
        }
      }
    }
    const examQuestions = curricula.reduce((n, subj) => {
      return (
        n +
        subj.sections.reduce(
          (sn, sec) =>
            sn +
            sec.subSections.reduce(
              (qn, ss) => qn + countQuestionsInScope(subj.id, sec.id, ss.id),
              0
            ),
          0
        )
      );
    }, 0);
    return { lessons, subSections, sections, examQuestions };
  }, []);

  return (
    <div>
      <PageHeader
        title="Content Management"
        description="Curriculum: Section → Sub-section → Dars. Ma'lumotnoma, exam bank, homework"
        action={
          <Button variant="primary">
            <Plus className="w-4 h-4" /> Yangi dars
          </Button>
        }
      />

      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Fanlar", count: curricula.length, icon: BookOpen },
          { label: "Sectionlar", count: stats.sections, icon: Layers },
          { label: "Darslar", count: stats.lessons, icon: FileText },
          { label: "Exam savollar (bank)", count: stats.examQuestions, icon: Database },
        ].map((item) => (
          <Card key={item.label}>
            <item.icon className="w-7 h-7 text-primary mb-2" />
            <p className="text-2xl font-bold">{item.count}</p>
            <p className="text-sm text-text-muted">{item.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            ["lessons", "Darslar", BookOpen],
            ["handbook", "Ma'lumotnoma", BookMarked],
            ["exams", "Practice Exam Bank", Database],
            ["homework", "Homework", FileText],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors",
              tab === id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-text-muted hover:text-text"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "lessons" && (
        <Card>
          <h3 className="font-semibold mb-4">Curriculum tuzilmasi</h3>
          <p className="text-sm text-text-muted mb-4">
            Subject → Section → Sub-section → Lesson. Har bir darsda video, ma&apos;lumotnoma,
            formulas, mini exam, homework.
          </p>
          <div className="space-y-3">
            {curricula.map((subject) => (
              <div key={subject.id} className="rounded-xl border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSubject(expandedSubject === subject.id ? null : subject.id)
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated/50 text-left"
                >
                  <span className="font-semibold">{subject.name}</span>
                  <span className="flex items-center gap-2 text-sm text-text-muted">
                    {subject.sections.length} section
                    {expandedSubject === subject.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                </button>
                {expandedSubject === subject.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border">
                    {subject.sections.map((sec) => (
                      <div key={sec.id} className="pl-2">
                        <p className="text-sm font-medium text-primary">{sec.name}</p>
                        {sec.subSections.map((sub) => (
                          <div
                            key={sub.id}
                            className="ml-3 mt-1 flex items-center justify-between text-xs text-text-muted py-1"
                          >
                            <span>{sub.name}</span>
                            <Badge variant="muted">{sub.lessons.length} dars</Badge>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm">
            {[
              "Dars nomi va tartib raqami",
              "Video URL",
              "Ma'lumotnoma (qoidalar + atamalar)",
              "Formula panel",
              "Mini exam savollari",
              "Homework PDF",
            ].map((f) => (
              <div
                key={f}
                className="p-3 rounded-xl border border-dashed border-border hover:border-primary/40"
              >
                + {f}
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "handbook" && (
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-primary" />
            Ma&apos;lumotnoma tahriri
          </h3>
          <p className="text-sm text-text-muted mb-4">
            Har bir dars uchun alohida qoidalar va atamalar. Foydalanuvchi dars ichida
            &quot;Ma&apos;lumotnoma&quot; tab&apos;ida ko&apos;radi.
          </p>
          <div className="space-y-2">
            {[
              { lesson: "math-geo-plan-5", title: "To'g'ri burchakli uchburchak" },
              { lesson: "phys-mol-4", title: "Ideal gaz holatining tenglamasi" },
              { lesson: "phys-din-1", title: "Nyuton qonunlari" },
            ].map((h) => (
              <div
                key={h.lesson}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/50"
              >
                <div>
                  <p className="text-sm font-medium">{h.title}</p>
                  <p className="text-xs text-text-muted font-mono">{h.lesson}</p>
                </div>
                <Button variant="outline" size="sm">
                  Tahrirlash
                </Button>
              </div>
            ))}
          </div>
          <Button variant="primary" className="mt-4">
            + Qoidalar / atamalar qo&apos;shish
          </Button>
        </Card>
      )}

      {tab === "exams" && (
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" />
            Practice Exam — savollar banki
          </h3>
          <p className="text-sm text-text-muted mb-4">
            Har bir <strong>sub-section</strong> uchun admin MCQ savollar yaratadi. Foydalanuvchi
            Practice Exams da Subject + Section + Sub-section (yoki All) tanlaydi — savollar
            random tanlanadi. <strong>Difficulty yo&apos;q.</strong>
          </p>
          <div className="space-y-3">
            {curricula.flatMap((subj) =>
              subj.sections.flatMap((sec) =>
                sec.subSections.map((ss) => (
                  <div
                    key={`${subj.id}-${ss.id}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium">{ss.name}</p>
                      <p className="text-xs text-text-muted">
                        {subj.name} · {sec.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="accent">
                        ~{countQuestionsInScope(subj.id, sec.id, ss.id)} savol
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Bankni boshqarish
                      </Button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </Card>
      )}

      {tab === "homework" && (
        <Card>
          <h3 className="font-semibold mb-4">Homework qoidalari</h3>
          <ul className="text-sm text-text-muted space-y-2 list-disc pl-5">
            <li>Har bir darsda alohida homework (dars ichidagi tab).</li>
            <li>
              <strong>/homework</strong> sahifasida faqat har bir section bo&apos;yicha oxirgi
              o&apos;tilgan dars vazifasi ko&apos;rinadi.
            </li>
            <li>Admin har dars uchun PDF va muddat belgilaydi.</li>
          </ul>
          <Button variant="outline" className="mt-4">
            Section homework sozlamalari
          </Button>
        </Card>
      )}
    </div>
  );
}

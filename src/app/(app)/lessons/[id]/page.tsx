"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { getLessonById } from "@/lib/data/curriculum";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  Copy,
  Pause,
  Play,
  SkipForward,
  StickyNote,
  Upload,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const formulas = [
  { name: "Asosiy formula", expr: "F = ma" },
  { name: "Yordamchi", expr: "v = s / t" },
];

const tabs = ["Notes", "Formulas", "Mini Exam", "Homework", "Discussion"] as const;

export default function LessonDetailPage() {
  const params = useParams();
  const lessonId = params.id as string;
  const meta = getLessonById(lessonId);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Notes");
  const [playing, setPlaying] = useState(false);
  const [noteContent, setNoteContent] = useState(
    "# Mening dars qaydlarim\n\nBu yerda faqat shu dars uchun shaxsiy notes saqlanadi.\n\n- Muhim formulalar\n- Misollar\n- Savollar"
  );

  if (!meta) {
    return (
      <div>
        <Link href="/lessons" className="text-sm text-primary">
          ← Darslar
        </Link>
        <p className="mt-8 text-text-muted">Dars topilmadi</p>
      </div>
    );
  }

  const { lesson, subjectName, sectionName, subSectionName } = meta;

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/lessons" className="text-sm text-text-muted hover:text-primary mb-4 inline-block">
        ← Darslar
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card glass={false} className="overflow-hidden p-0">
            <div className="aspect-video bg-surface-elevated relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
              <button
                type="button"
                onClick={() => setPlaying(!playing)}
                className="relative z-10 w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-primary/40"
              >
                {playing ? (
                  <Pause className="w-7 h-7 text-white" />
                ) : (
                  <Play className="w-7 h-7 text-white ml-1" />
                )}
              </button>
              <span className="absolute bottom-4 left-4 text-sm text-text-muted">
                {lesson.title} — 24:32
              </span>
            </div>
            <div className="p-4 flex flex-wrap items-center gap-3 border-t border-border">
              <Button variant="ghost" size="sm">1x</Button>
              <Button variant="ghost" size="sm">1.25x</Button>
              <Button variant="ghost" size="sm">1.5x</Button>
              <Button variant="ghost" size="sm"><SkipForward className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm"><Volume2 className="w-4 h-4" /> CC</Button>
              <div className="flex-1" />
              <Badge variant="accent">Auto-save notes</Badge>
            </div>
          </Card>

          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-text-muted mt-1">
              {subjectName} · {sectionName} · {subSectionName}
            </p>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((tab) => (
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
                {tab === "Notes" && <StickyNote className="w-3.5 h-3.5" />}
                {tab}
              </button>
            ))}
          </div>

          <Card>
            {activeTab === "Notes" && (
              <div className="space-y-3">
                <p className="text-xs text-text-muted">
                  Shaxsiy dars qaydlari — faqat shu dars uchun. Alohida Notes bo&apos;limi yo&apos;q.
                </p>
                <Textarea
                  className="min-h-[220px] font-mono text-sm"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
                <p className="text-xs text-success">Avtomatik saqlandi</p>
              </div>
            )}
            {activeTab === "Formulas" && (
              <div className="space-y-3">
                {formulas.map((f) => (
                  <div key={f.name} className="p-4 rounded-xl bg-surface-elevated border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{f.name}</span>
                      <Button variant="ghost" size="sm"><Copy className="w-4 h-4" /></Button>
                    </div>
                    <p className="font-mono text-accent">{f.expr}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "Mini Exam" && (
              <div className="text-center py-8">
                <p className="text-text-muted mb-4">10 ta MCQ · 15 daqiqa</p>
                <Button variant="primary">Mini imtihonni boshlash</Button>
              </div>
            )}
            {activeTab === "Homework" && (
              <div className="space-y-4">
                <p className="text-sm text-text-muted">
                  Bu darsning uy vazifasi. Agar bu sectiondagi <strong>eng so&apos;nggi
                  o&apos;tilgan dars</strong> bo&apos;lsa, u shuningdek{" "}
                  <Link href="/homework" className="text-primary hover:underline">
                    Homework
                  </Link>{" "}
                  bo&apos;limida ham ko&apos;rinadi.
                </p>
                <Button variant="outline">PDF yuklab olish</Button>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto text-text-muted mb-2" />
                  <p className="text-sm text-text-muted">Javob faylini yuklang</p>
                </div>
              </div>
            )}
            {activeTab === "Discussion" && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-surface-elevated">
                  <p className="text-sm font-medium">Savol namunasi</p>
                  <p className="text-xs text-text-muted mt-1">Admin · Javob</p>
                </div>
                <Textarea placeholder="Savol yozing..." />
                <Button variant="primary" size="sm">Yuborish</Button>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-primary" />
              Dars notes
            </h3>
            <p className="text-xs text-text-muted">
              Qisqa ko&apos;rinish. To&apos;liq tahrir Notes tab&apos;ida.
            </p>
            <p className="text-sm mt-2 line-clamp-4 text-text-muted whitespace-pre-wrap">
              {noteContent}
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-primary" />
              Formulalar
            </h3>
            {formulas.map((f) => (
              <div key={f.name} className="mb-3 last:mb-0">
                <p className="text-xs text-text-muted">{f.name}</p>
                <p className="font-mono text-sm text-accent mt-0.5">{f.expr}</p>
              </div>
            ))}
          </Card>
          <Card>
            <Button variant="primary" className="w-full mb-2">Yakunlash</Button>
            <Button variant="outline" className="w-full">Keyingi dars →</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

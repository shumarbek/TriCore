"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getAllLessons } from "@/lib/data/curriculum";
import { cn } from "@/lib/utils";
import { BookOpen, Lock, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const statusBadge = {
  completed: "success" as const,
  in_progress: "accent" as const,
  available: "default" as const,
  locked: "muted" as const,
};

const statusLabel = {
  completed: "Yakunlangan",
  in_progress: "Jarayonda",
  available: "Ochiq",
  locked: "Qulflangan",
};

export default function LessonsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [adminLessons, setAdminLessons] = useState<Array<ReturnType<typeof getAllLessons>[0]>>([]);
  const allLessons = useMemo(() => [...getAllLessons(), ...adminLessons], [adminLessons]);

  useEffect(() => {
    const saved = localStorage.getItem("tricore-admin-lessons");
    if (!saved) return;
    const items = JSON.parse(saved) as Array<ReturnType<typeof getAllLessons>[0]>;
    const known = new Set(getAllLessons().map((l) => l.id));
    setAdminLessons(items.filter((l) => !known.has(l.id)).map((l) => ({ ...l, status: "available" as const })));
  }, []);

  const filtered =
    filter === "all"
      ? allLessons
      : allLessons.filter((l) => l.subjectId === filter);

  const active = filtered.slice(0, 60);

  return (
    <div>
      <PageHeader
        title="Lessons"
        description="Barcha darslar — ma'lumotnoma, notes, homework har dars ichida"
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "all", label: "Barchasi" },
          { id: "mathematics", label: "Matematika" },
          { id: "physics", label: "Fizika" },
          { id: "chemistry", label: "Kimyo" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
              filter === f.id
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-text-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {active.map((lesson, i) => (
          <Card key={lesson.id} delay={Math.min(i * 0.02, 0.3)} hover>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                {lesson.status === "in_progress" ? (
                  <Play className="w-5 h-5 text-primary" />
                ) : lesson.status === "locked" ? (
                  <Lock className="w-5 h-5 text-text-muted" />
                ) : (
                  <BookOpen className="w-5 h-5 text-success" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                  {lesson.title}
                </h3>
                <p className="text-sm text-text-muted truncate">
                  {lesson.subjectName} · {lesson.sectionName} · {lesson.subSectionName}
                </p>
                {lesson.status === "in_progress" && (
                  <ProgressBar value={45} className="mt-2 max-w-xs" size="sm" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusBadge[lesson.status]}>
                  {statusLabel[lesson.status]}
                </Badge>
                {lesson.status !== "locked" ? (
                  <Link href={`/lessons/${lesson.id}`}>
                    <Badge variant="accent">Ochish</Badge>
                  </Link>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

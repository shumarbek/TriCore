"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurriculum } from "@/lib/data/curriculum";
import { subjects } from "@/lib/data/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Lock, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const statusConfig = {
  completed: { icon: CheckCircle, badge: "success" as const, label: "Yakunlangan" },
  in_progress: { icon: Play, badge: "accent" as const, label: "Jarayonda" },
  locked: { icon: Lock, badge: "muted" as const, label: "Qulflangan" },
  available: { icon: Circle, badge: "default" as const, label: "Ochiq" },
};

export default function SubjectRoadmapPage() {
  const params = useParams();
  const subjectId = params.subject as string;
  const subject = subjects.find((s) => s.id === subjectId);
  const curriculum = getCurriculum(subjectId);

  if (!subject || !curriculum) {
    return <p className="text-text-muted">Fan topilmadi</p>;
  }

  const continueLesson = curriculum.sections
    .flatMap((s) => s.subSections)
    .flatMap((sub) => sub.lessons)
    .find((l) => l.status === "in_progress");

  return (
    <div>
      <PageHeader
        title={subject.name}
        description="Section → Sub-section → Dars — ketma-ket roadmap"
        action={
          continueLesson ? (
            <Link href={`/lessons/${continueLesson.id}`}>
              <Button variant="primary">Davom etish</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="space-y-6">
        {curriculum.sections.map((section, si) => (
          <Card key={section.id} delay={si * 0.05}>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <span className="text-2xl">{subject.icon}</span>
              {section.name}
            </h3>
            <p className="text-xs text-text-muted mb-4">
              {section.subSections.length} sub-section ·{" "}
              {section.subSections.reduce((n, s) => n + s.lessons.length, 0)} dars
            </p>

            <div className="space-y-5">
              {section.subSections.map((sub) => (
                <div key={sub.id}>
                  <p className="text-sm font-semibold text-primary mb-2">{sub.name}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {sub.lessons.map((lesson) => {
                      const status = lesson.status;
                      const cfg = statusConfig[status];
                      const Icon = cfg.icon;
                      const className = cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                        status === "locked"
                          ? "border-border opacity-60 cursor-not-allowed"
                          : "border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                      );
                      const inner = (
                        <>
                          <Icon
                            className={cn(
                              "w-4 h-4 flex-shrink-0",
                              status === "completed" && "text-success",
                              status === "in_progress" && "text-accent",
                              status === "locked" && "text-text-muted"
                            )}
                          />
                          <span className="text-sm font-medium flex-1 leading-snug">
                            {lesson.title}
                          </span>
                          <Badge variant={cfg.badge}>{cfg.label}</Badge>
                        </>
                      );
                      return status === "locked" ? (
                        <div key={lesson.id} className={className}>
                          {inner}
                        </div>
                      ) : (
                        <Link key={lesson.id} href={`/lessons/${lesson.id}`} className={className}>
                          {inner}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

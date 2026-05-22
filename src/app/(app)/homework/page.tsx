"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { homeworkItems } from "@/lib/data/mock";
import { BookOpen, Calendar, Download, Info, Upload } from "lucide-react";
import Link from "next/link";

const statusConfig = {
  pending: { variant: "warning" as const, label: "Kutilmoqda" },
  submitted: { variant: "accent" as const, label: "Yuborilgan" },
  graded: { variant: "success" as const, label: "Baholangan" },
};

export default function HomeworkPage() {
  return (
    <div>
      <PageHeader
        title="Homework"
        description="Har bir fan bo'limidagi eng so'nggi o'tilgan dars uchun bo'lim uy vazifasi"
      />

      <Card className="mb-6 flex gap-3 items-start">
        <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <p className="text-sm text-text-muted">
          Bu yerda faqat har bir <strong className="text-text">section</strong> bo&apos;yicha oxirgi
          yakunlangan darsning uy vazifasi ko&apos;rsatiladi. Boshqa darslarning vazifalari o&apos;z
          dars sahifasidagi <strong className="text-text">Homework</strong> tab&apos;ida.
        </p>
      </Card>

      {homeworkItems.length === 0 ? (
        <Card>
          <p className="text-center text-text-muted py-8">
            Hozircha bo&apos;lim uy vazifasi yo&apos;q. Darslarni yakunlang.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {homeworkItems.map((hw, i) => {
            const cfg = statusConfig[hw.status];
            return (
              <Card key={hw.id} delay={i * 0.05}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{hw.title}</h3>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      {"score" in hw && hw.score != null && (
                        <Badge variant="success">{hw.score}%</Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-muted mt-1">
                      {hw.subjectName} · {hw.sectionName}
                    </p>
                    <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      Oxirgi o&apos;tilgan dars: {hw.lessonTitle}
                    </p>
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Muddat: {hw.deadline}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" /> PDF
                    </Button>
                    {hw.status === "pending" && (
                      <Button variant="primary" size="sm">
                        <Upload className="w-4 h-4" /> Yuklash
                      </Button>
                    )}
                    <Link href={`/lessons/${hw.lessonId}`}>
                      <Button variant="ghost" size="sm">
                        Darsga o&apos;tish
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

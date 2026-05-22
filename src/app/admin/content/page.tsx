"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { subjects } from "@/lib/data/navigation";
import { BookOpen, FileText, Plus, Video } from "lucide-react";

export default function AdminContentPage() {
  return (
    <div>
      <PageHeader
        title="Content Management"
        description="Create subjects, lessons, exams, and upload materials"
        action={
          <Button variant="primary">
            <Plus className="w-4 h-4" /> New Lesson
          </Button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Subjects", count: 3, icon: BookOpen },
          { label: "Lessons", count: 156, icon: Video },
          { label: "Exams", count: 48, icon: FileText },
        ].map((item) => (
          <Card key={item.label}>
            <item.icon className="w-8 h-8 text-primary mb-2" />
            <p className="text-2xl font-bold">{item.count}</p>
            <p className="text-sm text-text-muted">{item.label}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold mb-4">Lesson Creator</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-text-muted">
          {[
            "Lesson title & description",
            "Video URL (YouTube/Vimeo)",
            "Rich content editor",
            "Formula editor",
            "Homework PDF upload",
            "Mini exam creator",
            "Thumbnails & attachments",
          ].map((field) => (
            <div
              key={field}
              className="p-3 rounded-xl border border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors"
            >
              + {field}
            </div>
          ))}
        </div>
        <Button variant="primary" className="mt-4">Open Lesson Editor</Button>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Subjects</h3>
        <div className="space-y-3">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-text-muted">{s.sections.join(", ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="muted">12 modules</Badge>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

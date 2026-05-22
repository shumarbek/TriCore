"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { subjects } from "@/lib/data/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

export default function LearningPage() {
  return (
    <div>
      <PageHeader
        title="Learning"
        description="Choose a subject and follow your structured roadmap to mastery"
      />

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {subjects.map((subject, i) => (
          <Link key={subject.id} href={`/learning/${subject.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hover className="h-full relative overflow-hidden group">
                <div
                  className={cn(
                    "absolute inset-0 opacity-10 bg-gradient-to-br",
                    subject.color
                  )}
                />
                <div className="relative">
                  <span className="text-4xl">{subject.icon}</span>
                  <h3 className="text-xl font-bold mt-4">{subject.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {subject.sections.slice(0, 3).map((s) => (
                      <Badge key={s} variant="muted">
                        {s}
                      </Badge>
                    ))}
                    {subject.sections.length > 3 && (
                      <Badge variant="muted">+{subject.sections.length - 3}</Badge>
                    )}
                  </div>
                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-text-muted mb-1">
                      <span>Progress</span>
                      <span>{subject.progress}%</span>
                    </div>
                    <ProgressBar value={subject.progress} />
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                    Open Roadmap <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Learning Flow</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
          {["Subject", "Section", "Module", "Lesson", "Mini Exam", "Homework", "Final Exam"].map(
            (step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium">
                  {step}
                </span>
                {i < arr.length - 1 && <span className="text-border">→</span>}
              </span>
            )
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <Badge variant="muted"><Lock className="w-3 h-3 inline mr-1" />Locked</Badge>
          <Badge variant="default">Available</Badge>
          <Badge variant="accent">In Progress</Badge>
          <Badge variant="success">Completed</Badge>
        </div>
      </Card>
    </div>
  );
}

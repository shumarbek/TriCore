"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Input";
import { userNotes } from "@/lib/data/notes";
import { Plus, Search, StickyNote } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NotesPage() {
  const [selected, setSelected] = useState(userNotes[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const current = userNotes.find((n) => n.id === selected);

  const filtered = userNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)]">
      <PageHeader
        title="Notes"
        description="Rich text notes with formula support, auto-save, and search"
        action={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" /> New Note
          </Button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        <Card className="lg:col-span-1 flex flex-col min-h-[400px]">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="search"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-elevated border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <ul className="flex-1 overflow-y-auto space-y-1">
            {filtered.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => setSelected(note.id)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    selected === note.id
                      ? "bg-primary/15 border border-primary/25"
                      : "hover:bg-surface-elevated"
                  }`}
                >
                  <p className="font-medium text-sm truncate flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {note.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    {note.subject} · {note.updated}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2 flex flex-col min-h-[400px]">
          {current ? (
            <>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border flex-wrap gap-2">
                <div>
                  <h3 className="font-semibold">{current.title}</h3>
                  <p className="text-xs text-text-muted">
                    {current.subject} · Auto-saved · {current.updated}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {current.lessonId && (
                    <Link href={`/lessons/${current.lessonId}`}>
                      <Button variant="ghost" size="sm">
                        Bog&apos;langan dars
                      </Button>
                    </Link>
                  )}
                  <span className="text-xs text-success">Saved</span>
                </div>
              </div>
              <Textarea
                className="flex-1 min-h-[280px] font-mono text-sm"
                defaultValue={current.content}
              />
              <p className="text-xs text-text-muted mt-2">
                Supports LaTeX formulas · Markdown · Auto-save enabled
              </p>
            </>
          ) : (
            <p className="text-text-muted text-center py-20">Select or create a note</p>
          )}
        </Card>
      </div>
    </div>
  );
}

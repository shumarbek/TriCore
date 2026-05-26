"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, StickyNote, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string | null;
  lesson_id: string | null;
  updated_at: string;
}

export default function NotesPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadNotes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) {
      setNotes(data as Note[]);
      if (!selected && data.length > 0) setSelected(data[0].id);
    }
  }, [supabase, user, selected]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const current = notes.find((n) => n.id === selected);

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.subject ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const createNote = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notes")
      .insert({ user_id: user.id, title: "Yangi qayd", content: "" })
      .select()
      .single();
    if (data) {
      setNotes((prev) => [data as Note, ...prev]);
      setSelected(data.id);
    }
  };

  const updateNote = useCallback(
    (field: "title" | "content", value: string) => {
      if (!current) return;
      setNotes((prev) =>
        prev.map((n) => (n.id === current.id ? { ...n, [field]: value } : n))
      );
      // Debounced save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        await supabase
          .from("notes")
          .update({ [field]: value, updated_at: new Date().toISOString() })
          .eq("id", current.id);
      }, 800);
    },
    [current, supabase]
  );

  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selected === id) setSelected(notes.find((n) => n.id !== id)?.id ?? "");
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <PageHeader
        title="Notes"
        description="Rich text notes with formula support, auto-save, and search"
        action={
          <Button variant="primary" size="md" onClick={createNote}>
            <Plus className="w-4 h-4" /> Yangi qayd
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
                    {note.subject ?? ""} \u00b7 {new Date(note.updated_at).toLocaleDateString()}
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
                  <input
                    className="font-semibold bg-transparent border-none focus:outline-none text-text w-full"
                    value={current.title}
                    onChange={(e) => updateNote("title", e.target.value)}
                  />
                  <p className="text-xs text-text-muted">
                    Avtomatik saqlanadi \u00b7 {new Date(current.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {current.lesson_id && (
                    <Link href={`/lessons/${current.lesson_id}`}>
                      <Button variant="ghost" size="sm">
                        Bog&apos;langan dars
                      </Button>
                    </Link>
                  )}
                  <Button variant="danger" size="sm" onClick={() => deleteNote(current.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <Textarea
                className="flex-1 min-h-[280px] font-mono text-sm"
                value={current.content}
                onChange={(e) => updateNote("content", e.target.value)}
              />
              <p className="text-xs text-text-muted mt-2">
                Markdown \u00b7 Auto-save enabled
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

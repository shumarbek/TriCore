"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import { useLanguage } from "@/contexts/LanguageProvider";
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

type NoteRow = Note & { user_id: string };

export default function NotesPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tx = {
    uz: { title: "Qaydlar", description: "Avtomatik saqlanadigan va qidiriladigan qaydlar", new: "Yangi qayd", search: "Qaydlarni qidirish...", autosaved: "Avtomatik saqlanadi", linkedLesson: "Bog'langan dars", autosaveEnabled: "avtomatik saqlash yoqilgan", select: "Qaydni tanlang yoki yarating", placeholder: "Qayd matnini shu yerga yozing..." },
    kaa: { title: "Qaydlar", description: "Avtomatik saqlanatın hám izlenetin qaydlar", new: "Jańa qayd", search: "Qaydlardı izlew...", autosaved: "Avtomatik saqlanadı", linkedLesson: "Baylanısqan sabaq", autosaveEnabled: "avtomatik saqlaw qosılǵan", select: "Qayddı tańlań yaki jaratıń", placeholder: "Qaydıń mátinin osı jerge jazıń..." },
    ru: { title: "Заметки", description: "Заметки с автосохранением и поиском", new: "Новая заметка", search: "Поиск заметок...", autosaved: "Автосохранение", linkedLesson: "Связанный урок", autosaveEnabled: "автосохранение включено", select: "Выберите или создайте заметку", placeholder: "Введите текст заметки здесь..." },
    en: { title: "Notes", description: "Auto-saved notes with search", new: "New note", search: "Search notes...", autosaved: "Auto-saved", linkedLesson: "Linked lesson", autosaveEnabled: "auto-save enabled", select: "Select or create a note", placeholder: "Write your note here..." },
  }[language];

  const loadNotes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("notes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
    const rows = (data ?? []) as NoteRow[];
    if (rows.length > 0) {
      setNotes(rows);
      if (!selected) setSelected(rows[0].id);
    } else {
      setNotes([]);
    }
  }, [supabase, user, selected]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const current = notes.find((n) => n.id === selected);
  const filtered = notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || (n.subject ?? "").toLowerCase().includes(search.toLowerCase()));

  const createNote = async () => {
    if (!user) return;
    const { data } = await supabase.from("notes").insert({ user_id: user.id, title: tx.new, content: "" } as never).select().single();
    const row = data as NoteRow | null;
    if (row) {
      setNotes((prev) => [row, ...prev]);
      setSelected(row.id);
    }
  };

  const updateNote = useCallback(
    (field: "title" | "content", value: string) => {
      if (!current) return;
      setNotes((prev) => prev.map((n) => (n.id === current.id ? { ...n, [field]: value } : n)));
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        await supabase.from("notes").update({ [field]: value, updated_at: new Date().toISOString() } as never).eq("id", current.id);
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
        title={tx.title}
        description={tx.description}
        action={<Button variant="primary" size="md" onClick={createNote}><Plus className="w-4 h-4" /> {tx.new}</Button>}
      />

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        <Card className="lg:col-span-1 flex flex-col min-h-[400px]">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="search"
              placeholder={tx.search}
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
                  className={`w-full text-left p-3 rounded-xl transition-colors ${selected === note.id ? "bg-primary/15 border border-primary/25" : "hover:bg-surface-elevated"}`}
                >
                  <p className="font-medium text-sm truncate flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {note.title}
                  </p>
                  <p className="text-xs text-text-muted">{note.subject ?? ""} · {new Date(note.updated_at).toLocaleDateString()}</p>
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
                  <input className="font-semibold bg-transparent border-none focus:outline-none text-text w-full" value={current.title} onChange={(e) => updateNote("title", e.target.value)} />
                  <p className="text-xs text-text-muted">{tx.autosaved} · {new Date(current.updated_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {current.lesson_id && (
                    <Link href={`/lessons/${current.lesson_id}`}>
                      <Button variant="ghost" size="sm">{tx.linkedLesson}</Button>
                    </Link>
                  )}
                  <Button variant="danger" size="sm" onClick={() => void deleteNote(current.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <Textarea className="flex-1 min-h-[280px] font-mono text-sm" placeholder={tx.placeholder} value={current.content} onChange={(e) => updateNote("content", e.target.value)} />
              <p className="text-xs text-text-muted mt-2">Markdown · {tx.autosaveEnabled}</p>
            </>
          ) : (
            <p className="text-text-muted text-center py-20">{tx.select}</p>
          )}
        </Card>
      </div>
    </div>
  );
}

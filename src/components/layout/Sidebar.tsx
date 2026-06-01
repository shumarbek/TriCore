"use client";

import { useLanguage } from "@/contexts/LanguageProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { useTheme } from "@/contexts/ThemeProvider";
import { buildRuntimeCurricula, type CurriculumStructureNode } from "@/lib/data/curriculum/runtime";
import { adminNavItems, mainNavItems } from "@/lib/data/navigation";
import type { LessonContentOverride } from "@/lib/lesson-content";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Atom, ChevronDown, ChevronLeft, Moon, Play, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const subjectColors: Record<string, string> = {
  mathematics: "from-blue-500 to-cyan-400",
  physics: "from-violet-500 to-purple-400",
  chemistry: "from-emerald-500 to-teal-400",
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  admin?: boolean;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  admin = false,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const items = admin ? adminNavItems : mainNavItems;
  const [lessonsOpen, setLessonsOpen] = useState(false);
  const [currentLessons, setCurrentLessons] = useState<Array<{
    subjectId: string;
    subjectName: string;
    subjectIcon: string;
    lessonId: string;
    lessonTitle: string;
    sectionName: string;
    subSectionName: string;
  }>>([]);
  const isLessonsActive = pathname.startsWith("/lessons");
  const navLabels: Record<string, string> = {
    "/dashboard": t.nav.dashboard,
    "/learning": t.nav.learning,
    "/lessons": t.nav.lessons,
    "/practice-exams": t.nav.practiceExams,
    "/rankings": t.nav.rankings,
    "/ai-assistant": t.nav.aiAssistant,
    "/homework": t.nav.homework,
    "/notes": t.nav.notes,
    "/support": t.nav.support,
    "/settings": t.nav.settings,
    "/admin": t.nav.overview,
    "/admin/content": t.nav.content,
    "/admin/exams": t.nav.examBank,
    "/admin/users": t.nav.users,
    "/admin/messages": t.nav.messages,
    "/admin/analytics": t.nav.analytics,
    "/admin/ai-settings": t.nav.aiSettings,
  };

  useEffect(() => {
    if (admin) {
      setCurrentLessons([]);
      return;
    }
    const supabase = createClient();
    const loadCurrentLessons = async () => {
      const [{ data: lessonData }, { data: structureData }, progressResult] = await Promise.all([
        supabase.from("lesson_content").select("*"),
        supabase.from("curriculum_structure").select("*").order("order_index", { ascending: true }),
        user
          ? supabase.from("lesson_progress").select("lesson_id, status").eq("user_id", user.id)
          : Promise.resolve({ data: [] as Array<{ lesson_id: string; status: string }> }),
      ]);

      const completedIds = new Set(
        ((progressResult.data ?? []) as Array<{ lesson_id: string; status: string }>)
          .filter((row) => row.status === "completed")
          .map((row) => row.lesson_id)
      );

      const runtimeCurricula = buildRuntimeCurricula(
        (structureData ?? []) as CurriculumStructureNode[],
        (lessonData ?? []) as LessonContentOverride[]
      );

      const nextLessons = runtimeCurricula.map((subject) => {
        for (const section of subject.sections) {
          for (const subSection of section.subSections) {
            const nextLesson = subSection.lessons.find((lesson) => !completedIds.has(lesson.id)) ?? subSection.lessons[0];
            if (nextLesson) {
              return {
                subjectId: subject.id,
                subjectName: subject.name,
                subjectIcon: subject.id === "mathematics" ? "∑" : subject.id === "physics" ? "⚛" : "⚗",
                lessonId: nextLesson.id,
                lessonTitle: nextLesson.title,
                sectionName: section.name,
                subSectionName: subSection.name,
              };
            }
          }
        }
        return {
          subjectId: subject.id,
          subjectName: subject.name,
          subjectIcon: subject.id === "mathematics" ? "∑" : subject.id === "physics" ? "⚛" : "⚗",
          lessonId: "",
          lessonTitle: "—",
          sectionName: "",
          subSectionName: "",
        };
      });

      setCurrentLessons(nextLessons);
    };

    void loadCurrentLessons();

    const channels = [
      supabase
        .channel("sidebar-lesson-content")
        .on("postgres_changes", { event: "*", schema: "public", table: "lesson_content" }, () => void loadCurrentLessons())
        .subscribe(),
      supabase
        .channel("sidebar-curriculum-structure")
        .on("postgres_changes", { event: "*", schema: "public", table: "curriculum_structure" }, () => void loadCurrentLessons())
        .subscribe(),
    ];

    if (user) {
      channels.push(
        supabase
          .channel(`sidebar-progress-${user.id}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "lesson_progress", filter: `user_id=eq.${user.id}` }, () => void loadCurrentLessons())
          .subscribe()
      );
    }

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [admin, user]);

  const content = (
    <aside
      className={cn(
        "flex flex-col h-screen border-r border-border bg-[var(--sidebar)] transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex items-center gap-3 p-4 border-b border-border min-h-[64px]">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Atom className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="font-bold text-lg gradient-text">TriCore</span>
              <p className="text-[10px] text-text-muted -mt-0.5">STEM Learning OS</p>
            </motion.div>
          )}
        </Link>
        <button
          type="button"
          onClick={onMobileClose}
          className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-surface-elevated text-text-muted"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

            <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-2 space-y-0.5">
        {items.map((item) => {
          const isLessonsItem = !admin && item.href === "/lessons";
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/admin" &&
              pathname.startsWith(item.href));
          const Icon = item.icon;

          if (isLessonsItem) {
            return (
              <div key={item.href}>
                {/* Lessons nav item + chevron */}
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className="flex-1 min-w-0"
                    title={collapsed ? navLabels[item.href] ?? item.label : undefined}
                  >
                    <motion.div
                      whileHover={{ x: collapsed ? 0 : 4 }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                        isLessonsActive
                          ? "bg-primary/15 text-primary border border-primary/20"
                          : "text-text-muted hover:bg-surface-elevated hover:text-text border border-transparent"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 flex-shrink-0",
                          isLessonsActive ? "text-primary" : "group-hover:text-primary"
                        )}
                      />
                      {!collapsed && (
                        <span className="text-sm font-medium truncate">{navLabels[item.href] ?? item.label}</span>
                      )}
                      {!collapsed && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLessonsOpen((o) => !o);
                          }}
                          className="ml-auto p-0.5 rounded hover:bg-surface-elevated"
                        >
                          <ChevronDown
                            className={cn(
                              "w-3.5 h-3.5 transition-transform duration-200",
                              lessonsOpen && "rotate-180"
                            )}
                          />
                        </button>
                      )}
                    </motion.div>
                  </Link>
                </div>

                {/* Sub-items: har bir fan uchun hozirgi dars */}
                <AnimatePresence>
                  {lessonsOpen && !collapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-3 pl-4 border-l-2 border-border mt-1 space-y-1">
                        {currentLessons.map((cl) => {
                          const lessonActive = pathname === `/lessons/${cl.lessonId}`;
                          return (
                            <Link
                              key={cl.subjectId}
                              href={`/lessons/${cl.lessonId}`}
                              onClick={onMobileClose}
                            >
                              <motion.div
                                whileHover={{ x: 3 }}
                                className={cn(
                                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 group",
                                  lessonActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-text-muted hover:bg-surface-elevated hover:text-text"
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold",
                                    subjectColors[cl.subjectId] ?? "from-gray-500 to-gray-400"
                                  )}
                                >
                                  {cl.subjectIcon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate leading-tight">
                                    {cl.subjectName}
                                  </p>
                                  <p className="text-[10px] text-text-muted truncate leading-tight flex items-center gap-1">
                                    <Play className="w-2.5 h-2.5 text-accent flex-shrink-0" />
                                    {cl.lessonTitle}
                                  </p>
                                </div>
                              </motion.div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              title={collapsed ? navLabels[item.href] ?? item.label : undefined}
            >
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  active
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-text-muted hover:bg-surface-elevated hover:text-text border border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    active ? "text-primary" : "group-hover:text-primary"
                  )}
                />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{navLabels[item.href] ?? item.label}</span>
                )}
                {active && !collapsed && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-surface-elevated hover:text-text transition-colors",
            collapsed && "justify-center"
          )}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span className="text-sm">{t.common.theme}</span>}
        </button>
        {!admin && !collapsed && (
          <Link
            href="/admin"
            className="block text-center text-xs text-text-muted hover:text-primary py-2"
          >
            {t.common.adminPanel} {"->"}
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-text-muted hover:bg-surface-elevated transition-colors"
        >
          <ChevronLeft
            className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed && <span className="text-xs">{t.common.collapse}</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block flex-shrink-0 sticky top-0 h-screen">{content}</div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden w-64"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


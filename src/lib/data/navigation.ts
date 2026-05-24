import {
  Atom,
  BarChart3,
  BookOpen,
  Bot,
  ClipboardList,
  Database,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Medal,
  MessageSquare,
  Settings,
  Sliders,
  StickyNote,
  Target,
} from "lucide-react";
import { curricula } from "./curriculum";

export const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learning", label: "Learning", icon: GraduationCap },
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/practice-exams", label: "Practice Exams", icon: Target },
  { href: "/rankings", label: "Rankings", icon: Medal },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
  { href: "/homework", label: "Homework", icon: ClipboardList },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/support", label: "Support", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const adminNavItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/content", label: "Content", icon: BookOpen },
  { href: "/admin/exams", label: "Exam Bank", icon: Database },
  { href: "/admin/users", label: "Users", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/ai-settings", label: "AI Settings", icon: Sliders },
];

export const subjects = curricula.map((c) => ({
  id: c.id,
  name: c.name,
  icon: c.id === "mathematics" ? "∑" : c.id === "physics" ? "⚛" : "⚗",
  color:
    c.id === "mathematics"
      ? "from-blue-500 to-cyan-400"
      : c.id === "physics"
        ? "from-violet-500 to-purple-400"
        : "from-emerald-500 to-teal-400",
  progress:
    c.id === "mathematics" ? 18 : c.id === "physics" ? 12 : 8,
  sections: c.sections.map((s) => s.name),
}));

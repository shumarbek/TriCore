"use client";

import { useTheme } from "@/contexts/ThemeProvider";
import { adminNavItems, mainNavItems } from "@/lib/data/navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Atom, ChevronLeft, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const { theme, toggleTheme } = useTheme();
  const items = admin ? adminNavItems : mainNavItems;

  const content = (
    <aside
      className={cn(
        "flex flex-col h-full border-r border-border bg-[var(--sidebar)] transition-all duration-300",
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

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/admin" &&
              pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              title={collapsed ? item.label : undefined}
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
                  <span className="text-sm font-medium truncate">{item.label}</span>
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
          {!collapsed && <span className="text-sm">Theme</span>}
        </button>
        {!admin && !collapsed && (
          <Link
            href="/admin"
            className="block text-center text-xs text-text-muted hover:text-primary py-2"
          >
            Admin Panel →
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
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block flex-shrink-0">{content}</div>
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

"use client";

import { userStats } from "@/lib/data/mock";
import { cn } from "@/lib/utils";
import { Bell, Flame, Menu, Search, Zap } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-border glass">
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-surface-elevated text-text-muted"
      >
        <Menu className="w-5 h-5" />
      </button>

      {title && (
        <h2 className="text-lg font-semibold text-text hidden sm:block">{title}</h2>
      )}

      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="search"
            placeholder="Darslar va mavzularni qidirish..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-elevated/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <div className="hidden sm:flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-warning">
            <Flame className="w-4 h-4" />
            {userStats.dailyStreak}
          </span>
          <span className="flex items-center gap-1 text-primary">
            <Zap className="w-4 h-4" />
            {userStats.xp.toLocaleString()} XP
          </span>
        </div>

        <button
          type="button"
          className="relative p-2 rounded-xl hover:bg-surface-elevated text-text-muted"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        <Link href="/settings" className="flex items-center gap-2 group">
          <div
            className={cn(
              "w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary",
              "flex items-center justify-center text-white text-sm font-bold",
              "ring-2 ring-transparent group-hover:ring-primary/40 transition-all"
            )}
          >
            JD
          </div>
        </Link>
      </div>
    </header>
  );
}

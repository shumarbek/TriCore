"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { useLanguage } from "@/contexts/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Bell, Flame, LogOut, Menu, Search, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { profile, user, signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [replies, setReplies] = useState<Array<{ id: string; subject: string; replied_at: string | null }>>([]);
  const [openMessages, setOpenMessages] = useState<Array<{ id: string; subject: string; created_at: string }>>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  const seenKey = user ? `tricore-seen-notifications-${user.id}` : "";

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    if (profile?.role === "admin") {
      const { data } = await supabase
        .from("messages")
        .select("id, subject, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(10);
      setOpenMessages((data ?? []) as Array<{ id: string; subject: string; created_at: string }>);
      setReplies([]);
      return;
    }
    const { data } = await supabase
      .from("messages")
      .select("id, subject, replied_at")
      .eq("user_id", user.id)
      .eq("status", "replied")
      .order("replied_at", { ascending: false })
      .limit(10);
    setReplies((data ?? []) as Array<{ id: string; subject: string; replied_at: string | null }>);
    setOpenMessages([]);
  }, [profile?.role, supabase, user]);

  useEffect(() => {
    if (!user) return;
    const raw = localStorage.getItem(seenKey);
    setSeenIds(new Set(raw ? JSON.parse(raw) : []));
    loadNotifications();
    const channel = supabase
      .channel(`header-notifications-${user.id}`)
      .on(
        "postgres_changes",
        profile?.role === "admin"
          ? { event: "*", schema: "public", table: "messages" }
          : { event: "UPDATE", schema: "public", table: "messages", filter: `user_id=eq.${user.id}` },
        () => loadNotifications()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadNotifications, seenKey, supabase, user]);

  const unreadCount = useMemo(() => {
    const ids =
      profile?.role === "admin"
        ? openMessages.map((m) => `admin-${m.id}`)
        : replies.map((r) => `reply-${r.id}`);
    return ids.filter((id) => !seenIds.has(id)).length;
  }, [openMessages, profile?.role, replies, seenIds]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

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
            placeholder={t.header.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-elevated/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        {profile && (
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-warning">
              <Flame className="w-4 h-4" />
              {profile.streak}
            </span>
            <span className="flex items-center gap-1 text-primary">
              <Zap className="w-4 h-4" />
              {profile.xp.toLocaleString()} XP
            </span>
          </div>
        )}

        <div className="relative">
          <button
            type="button"
            className="relative p-2 rounded-xl hover:bg-surface-elevated text-text-muted"
            onClick={() => {
              setOpenNotifications((v) => !v);
              if (user) {
                const notificationIds =
                  profile?.role === "admin"
                    ? openMessages.map((m) => `admin-${m.id}`)
                    : replies.map((r) => `reply-${r.id}`);
                const next = new Set([...seenIds, ...notificationIds]);
                setSeenIds(next);
                localStorage.setItem(seenKey, JSON.stringify([...next]));
              }
            }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-accent text-[10px] text-white leading-4 text-center">
                {unreadCount}
              </span>
            )}
          </button>
          {openNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface shadow-xl z-50 p-2">
              <p className="px-2 py-1 text-xs font-semibold text-text-muted">{t.common.notifications}</p>
              {profile?.role === "admin" && openMessages.length > 0 ? (
                openMessages.map((m) => (
                  <Link
                    key={m.id}
                    href="/admin/messages"
                    className="block rounded-lg px-2 py-2 hover:bg-surface-elevated"
                    onClick={() => setOpenNotifications(false)}
                  >
                    <p className="text-sm font-medium truncate">{t.header.newSupportMessage}: {m.subject}</p>
                    <p className="text-xs text-text-muted">{new Date(m.created_at).toLocaleString()}</p>
                  </Link>
                ))
              ) : replies.length === 0 ? (
                <p className="px-2 py-4 text-sm text-text-muted">{t.common.noNotifications}</p>
              ) : (
                replies.map((r) => (
                  <Link
                    key={r.id}
                    href="/support"
                    className="block rounded-lg px-2 py-2 hover:bg-surface-elevated"
                    onClick={() => setOpenNotifications(false)}
                  >
                    <p className="text-sm font-medium truncate">{t.header.supportReply}: {r.subject}</p>
                    <p className="text-xs text-text-muted">
                      {r.replied_at ? new Date(r.replied_at).toLocaleString() : ""}
                    </p>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          title={t.common.logout}
          className="p-2 rounded-xl hover:bg-surface-elevated text-text-muted"
        >
          <LogOut className="w-5 h-5" />
        </button>

        <Link href="/settings" className="flex items-center gap-2 group">
          <div
            className={cn(
              "w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary",
              "flex items-center justify-center text-white text-sm font-bold",
              "ring-2 ring-transparent group-hover:ring-primary/40 transition-all"
            )}
          >
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
}

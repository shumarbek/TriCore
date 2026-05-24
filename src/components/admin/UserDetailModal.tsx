"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AdminUser } from "@/lib/data/admin-users";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Eye,
  EyeOff,
  Code2,
  Globe,
  Key,
  Mail,
  Monitor,
  Shield,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

const authLabels = {
  email: { label: "Email + Password", variant: "default" as const, icon: Mail },
  google: { label: "Google OAuth", variant: "accent" as const, icon: Globe },
  github: { label: "GitHub OAuth", variant: "muted" as const, icon: Code2 },
};

interface UserDetailModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onBanToggle?: () => void;
}

export function UserDetailModal({ user, onClose, onBanToggle }: UserDetailModalProps) {
  const [tab, setTab] = useState<"profile" | "learning" | "security" | "activity">("profile");
  const [showPassword, setShowPassword] = useState(false);

  if (!user) return null;

  const auth = authLabels[user.authMethod];
  const AuthIcon = auth.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.fullName}</h2>
                <p className="text-sm text-text-muted">@{user.username}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant={auth.variant}>
                    <AuthIcon className="w-3 h-3 inline mr-1" />
                    {auth.label}
                  </Badge>
                  <Badge variant={user.status === "active" ? "success" : "danger"}>
                    {user.status}
                  </Badge>
                  <Badge variant={user.onlineStatus === "online" ? "success" : "muted"}>
                    {user.onlineStatus}
                  </Badge>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-elevated text-text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-1 px-6 pt-4 border-b border-border overflow-x-auto">
            {(
              [
                ["profile", "Profil"],
                ["learning", "O'qish"],
                ["security", "Xavfsizlik"],
                ["activity", "Faollik"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors",
                  tab === id
                    ? "bg-primary/15 text-primary border-b-2 border-primary"
                    : "text-text-muted hover:text-text"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {tab === "profile" && (
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  ["Email", user.email],
                  ["Telefon", user.phone ?? "—"],
                  ["Ro'yxatdan o'tgan", user.registeredAt],
                  ["Oxirgi kirish", user.lastLogin],
                  ["Qurilma", user.deviceInfo],
                  ["User ID", user.id],
                ].map(([k, v]) => (
                  <div key={k} className="p-3 rounded-xl bg-surface-elevated/50">
                    <dt className="text-text-muted text-xs mb-1">{k}</dt>
                    <dd className="font-medium break-all">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {tab === "learning" && (
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Umumiy progress", value: `${user.progress}%`, icon: BookOpen },
                  { label: "XP", value: user.xp.toLocaleString(), icon: Zap },
                  { label: "Darslar", value: user.lessonsCompleted, icon: BookOpen },
                  { label: "Imtihonlar", value: user.examsPassed, icon: Shield },
                  { label: "O'rtacha ball", value: `${user.avgScore}%`, icon: Shield },
                  { label: "Reyting", value: `#${user.rank}`, icon: Zap },
                  { label: "Streak", value: `${user.streak} kun`, icon: Zap },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-xl border border-border flex items-center gap-3"
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-text-muted">{item.label}</p>
                      <p className="font-bold text-lg">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "security" && (
              <div className="space-y-4">
                {user.authMethod === "email" ? (
                  <>
                    <div className="p-4 rounded-xl bg-warning/10 border border-warning/25">
                      <p className="text-sm flex items-center gap-2 text-warning">
                        <Key className="w-4 h-4" />
                        Email/parol orqali ro&apos;yxatdan o&apos;tgan — admin ko&apos;rishi mumkin
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                      <p className="text-xs text-text-muted mb-2">Parol (hash emas, demo ma&apos;lumot)</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-sm bg-bg px-3 py-2 rounded-lg">
                          {showPassword ? user.password : "••••••••••••"}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Parolni tiklash
                    </Button>
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-surface-elevated border border-border text-sm text-text-muted">
                    <Monitor className="w-5 h-5 text-primary mb-2" />
                    Bu foydalanuvchi <strong className="text-text">{auth.label}</strong> orqali
                    kirgan. Parol tizimda saqlanmaydi — faqat provider token (OAuth).
                  </div>
                )}
              </div>
            )}

            {tab === "activity" && (
              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Kirish tarixi</p>
                {user.loginHistory.map((log) => (
                  <div
                    key={log.date}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl bg-surface-elevated/50 text-sm gap-1"
                  >
                    <span className="font-medium">{log.date}</span>
                    <span className="text-text-muted">{log.device}</span>
                    <span className="text-xs text-text-muted font-mono">{log.ip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border flex gap-2 justify-end">
            {onBanToggle && (
              user.status === "active" ? (
                <Button variant="danger" size="sm" onClick={onBanToggle}>
                  Ban qilish
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={onBanToggle}>
                  Ban ni olib tashlash
                </Button>
              )
            )}
            <Button variant="primary" size="sm" onClick={onClose}>
              Yopish
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

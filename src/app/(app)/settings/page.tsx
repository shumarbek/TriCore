"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import { type LanguageCode, useLanguage } from "@/contexts/LanguageProvider";
import { useTheme } from "@/contexts/ThemeProvider";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCircle, Globe, Info, Moon, Shield, Sun, User } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, isBetaLanguage } = useLanguage();
  const { profile, user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ full_name: fullName, username } as never)
      .eq("id", user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title={t.settings.title} description={t.settings.description} />

      <Card className="mb-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-primary" />
          {t.settings.profile}
        </h3>
        {saved && (
          <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/25 text-sm text-success flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {t.settings.saved}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label={t.settings.fullName} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label={t.settings.username} value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input label={t.settings.email} type="email" value={profile?.email ?? ""} disabled />
        </div>
        <Button variant="primary" className="mt-4" onClick={saveProfile} loading={saving}>
          {t.settings.save}
        </Button>
      </Card>

      <Card className="mb-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-warning" />}
          {t.settings.appearance}
        </h3>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex-1 p-4 rounded-xl border transition-all ${
              theme === "dark"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/30"
            }`}
          >
            <Moon className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">{t.settings.darkMode}</p>
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex-1 p-4 rounded-xl border transition-all ${
              theme === "light"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/30"
            }`}
          >
            <Sun className="w-6 h-6 mx-auto mb-2 text-warning" />
            <p className="text-sm font-medium">{t.settings.lightMode}</p>
          </button>
        </div>
      </Card>

      <Card className="mb-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-accent" />
          {t.settings.notifications}
        </h3>
        {[
          t.settings.lessonReminders,
          t.settings.homeworkDeadlines,
          t.settings.rankingUpdates,
          t.settings.aiRecommendations,
        ].map((label) => (
          <label
            key={label}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <span className="text-sm">{label}</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
        ))}
      </Card>

      <Card className="mb-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-secondary" />
          {t.settings.language}
          <div className="relative group">
            <Info className="w-4 h-4 text-text-muted cursor-help" />
            <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-xl border border-border bg-surface p-3 text-xs text-text-muted shadow-xl group-hover:block">
              <p className="font-semibold text-text mb-1">{t.settings.languageInfoTitle}</p>
              <p>{t.settings.languageInfoBody}</p>
            </div>
          </div>
        </h3>
        <Select
          label={t.settings.interfaceLanguage}
          options={[
            { value: "uz", label: t.languageNames.uz },
            { value: "kaa", label: `${t.languageNames.kaa} (${t.betaBadge})` },
            { value: "ru", label: `${t.languageNames.ru} (${t.betaBadge})` },
            { value: "en", label: `${t.languageNames.en} (${t.betaBadge})` },
          ]}
          value={language}
          onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        />
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {(["uz", "kaa", "ru", "en"] as LanguageCode[]).map((code) => (
            <div
              key={code}
              className={`rounded-xl border p-3 ${
                language === code ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{t.languageNames[code]}</p>
                {isBetaLanguage(code) && (
                  <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                    {t.betaBadge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-danger" />
          {t.settings.security}
        </h3>
        <div className="space-y-4">
          <Input label={t.settings.currentPassword} type="password" />
          <Input label={t.settings.newPassword} type="password" />
          <Button variant="outline">{t.settings.changePassword}</Button>
          <Button variant="danger">{t.settings.enableTwoFactor}</Button>
        </div>
      </Card>
    </div>
  );
}

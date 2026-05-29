"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import { useTheme } from "@/contexts/ThemeProvider";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCircle, Globe, Moon, Shield, Sun, User } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
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
      <PageHeader title="Settings" description="Profilingizni sozlang" />

      <Card className="mb-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-primary" />
          Profile
        </h3>
        {saved && (
          <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/25 text-sm text-success flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Saqlandi!
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input label="Email" type="email" value={profile?.email ?? ""} disabled />
        </div>
        <Button variant="primary" className="mt-4" onClick={saveProfile} loading={saving}>
          Saqlash
        </Button>
      </Card>

      <Card className="mb-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-warning" />}
          Appearance
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
            <p className="text-sm font-medium">Dark Mode</p>
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
            <p className="text-sm font-medium">Light Mode</p>
          </button>
        </div>
      </Card>

      <Card className="mb-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-accent" />
          Notifications
        </h3>
        {[
          "Lesson reminders",
          "Homework deadlines",
          "Ranking updates",
          "AI recommendations",
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
          Language
        </h3>
        <Select
          label="Interface Language"
          options={[
            { value: "en", label: "English" },
            { value: "uz", label: "O'zbek" },
            { value: "ru", label: "Русский" },
          ]}
        />
      </Card>

      <Card>
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-danger" />
          Security
        </h3>
        <div className="space-y-4">
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Button variant="outline">Change Password</Button>
          <Button variant="danger">Enable Two-Factor Auth</Button>
        </div>
      </Card>
    </div>
  );
}

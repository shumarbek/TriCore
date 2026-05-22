"use client";

import { UserDetailModal } from "@/components/admin/UserDetailModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { adminUsers, type AdminUser } from "@/lib/data/admin-users";
import { Code2, Globe, Mail, Search } from "lucide-react";
import { useMemo, useState } from "react";

const authIcon = {
  email: Mail,
  google: Globe,
  github: Code2,
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [authFilter, setAuthFilter] = useState<string>("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    return adminUsers.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q);
      const matchAuth = authFilter === "all" || u.authMethod === authFilter;
      return matchSearch && matchAuth;
    });
  }, [search, authFilter]);

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Tizimdagi barcha ma'lumotlar: progress, kirish tarixi, email/parol (faqat email auth)"
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-2xl font-bold">{adminUsers.length}</p>
          <p className="text-sm text-text-muted">Jami foydalanuvchilar</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-primary">
            {adminUsers.filter((u) => u.authMethod === "email").length}
          </p>
          <p className="text-sm text-text-muted">Email + parol</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-accent">
            {adminUsers.filter((u) => u.authMethod !== "email").length}
          </p>
          <p className="text-sm text-text-muted">OAuth (Google/GitHub)</p>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Ism, email, username..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Barchasi" },
              { id: "email", label: "Email/Parol" },
              { id: "google", label: "Google" },
              { id: "github", label: "GitHub" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setAuthFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  authFilter === f.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button variant="outline">Export CSV</Button>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-border">
                <th className="pb-3 pr-4">Foydalanuvchi</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Auth</th>
                <th className="pb-3 pr-4">Progress</th>
                <th className="pb-3 pr-4">XP</th>
                <th className="pb-3 pr-4">Holat</th>
                <th className="pb-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const Icon = authIcon[u.authMethod];
                return (
                  <tr key={u.id} className="border-b border-border/50 last:border-0">
                    <td className="py-4 pr-4">
                      <p className="font-medium">{u.fullName}</p>
                      <p className="text-xs text-text-muted">@{u.username}</p>
                    </td>
                    <td className="py-4 pr-4 text-text-muted">{u.email}</td>
                    <td className="py-4 pr-4">
                      <Badge
                        variant={
                          u.authMethod === "email"
                            ? "default"
                            : u.authMethod === "google"
                              ? "accent"
                              : "muted"
                        }
                      >
                        <Icon className="w-3 h-3 inline mr-1" />
                        {u.authMethod}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4">{u.progress}%</td>
                    <td className="py-4 pr-4">{u.xp.toLocaleString()}</td>
                    <td className="py-4 pr-4">
                      <Badge variant={u.status === "active" ? "success" : "danger"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Button variant="primary" size="sm" onClick={() => setSelected(u)}>
                        Ko&apos;rish
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <UserDetailModal user={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

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
  const [users, setUsers] = useState(adminUsers);
  const [search, setSearch] = useState("");
  const [authFilter, setAuthFilter] = useState("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q);
      const matchAuth = authFilter === "all" || u.authMethod === authFilter;
      return matchSearch && matchAuth;
    });
  }, [users, search, authFilter]);

  const toggleBan = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "banned" ? "active" : "banned" }
          : u
      )
    );
    if (selected?.id === id) {
      setSelected((s) =>
        s ? { ...s, status: s.status === "banned" ? "active" : "banned" } : s
      );
    }
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Email/parol, online/offline, holat — ko'rish va tizimdan chetlatish (ban)"
      />

      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-sm text-text-muted">Jami</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-success">
            {users.filter((u) => u.onlineStatus === "online").length}
          </p>
          <p className="text-sm text-text-muted">Online</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-primary">
            {users.filter((u) => u.authMethod === "email").length}
          </p>
          <p className="text-sm text-text-muted">Email/Parol</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-danger">
            {users.filter((u) => u.status === "banned").length}
          </p>
          <p className="text-sm text-text-muted">Banned</p>
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
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  authFilter === f.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-border">
                <th className="pb-3 pr-3">User</th>
                <th className="pb-3 pr-3">Email</th>
                <th className="pb-3 pr-3">Parol</th>
                <th className="pb-3 pr-3">Online</th>
                <th className="pb-3 pr-3">Holat</th>
                <th className="pb-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const Icon = authIcon[u.authMethod];
                return (
                  <tr key={u.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-3">
                      <p className="font-medium">{u.fullName}</p>
                      <p className="text-xs text-text-muted flex items-center gap-1">
                        <Icon className="w-3 h-3" /> @{u.username}
                      </p>
                    </td>
                    <td className="py-3 pr-3 text-text-muted">{u.email}</td>
                    <td className="py-3 pr-3 font-mono text-xs">
                      {u.authMethod === "email" ? (
                        <span className="text-warning">{u.password}</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.onlineStatus === "online" ? "bg-success" : "bg-text-muted"
                          }`}
                        />
                        {u.onlineStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <Badge variant={u.status === "active" ? "success" : "danger"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1 flex-wrap">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(u)}>
                          Ko&apos;rish
                        </Button>
                        <Button
                          variant={u.status === "banned" ? "outline" : "danger"}
                          size="sm"
                          onClick={() => toggleBan(u.id)}
                        >
                          {u.status === "banned" ? "Unban" : "Ban"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <UserDetailModal
        user={selected}
        onClose={() => setSelected(null)}
        onBanToggle={selected ? () => toggleBan(selected.id) : undefined}
      />
    </div>
  );
}

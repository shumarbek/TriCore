"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/contexts/AuthProvider";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data as Profile[]);
  }, [supabase]);

  useEffect(() => {
    load();
    // Realtime: online status o'zgarishi
    const channel = supabase
      .channel("admin-users")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, load]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || u.status === statusFilter ||
        (statusFilter === "online" && u.is_online) ||
        (statusFilter === "offline" && !u.is_online);
      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  const toggleBan = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const newStatus = user.status === "banned" ? "active" : "banned";
    await supabase.from("profiles").update({ status: newStatus } as never).eq("id", id);
    load();
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
            {users.filter((u) => u.is_online).length}
          </p>
          <p className="text-sm text-text-muted">Online</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-primary">
            {users.filter((u) => u.status === "active").length}
          </p>
          <p className="text-sm text-text-muted">Active</p>
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
              { id: "active", label: "Active" },
              { id: "banned", label: "Banned" },
              { id: "online", label: "Online" },
              { id: "offline", label: "Offline" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  statusFilter === f.id
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
                <th className="pb-3 pr-3">XP</th>
                <th className="pb-3 pr-3">Online</th>
                <th className="pb-3 pr-3">Holat</th>
                <th className="pb-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-3">
                    <p className="font-medium">{u.full_name}</p>
                    <p className="text-xs text-text-muted">@{u.username}</p>
                  </td>
                  <td className="py-3 pr-3 text-text-muted">{u.email}</td>
                  <td className="py-3 pr-3 font-mono text-xs">{u.xp.toLocaleString()}</td>
                  <td className="py-3 pr-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          u.is_online ? "bg-success" : "bg-text-muted"
                        }`}
                      />
                      {u.is_online ? "online" : "offline"}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <Badge variant={u.status === "active" ? "success" : "danger"}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Button
                      variant={u.status === "banned" ? "outline" : "danger"}
                      size="sm"
                      onClick={() => toggleBan(u.id)}
                    >
                      {u.status === "banned" ? "Unban" : "Ban"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

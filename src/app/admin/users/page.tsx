"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

const users = [
  { name: "Alex Chen", email: "alex@mail.com", progress: 78, status: "active" },
  { name: "Sara Kim", email: "sara@mail.com", progress: 65, status: "active" },
  { name: "Mike Johnson", email: "mike@mail.com", progress: 12, status: "banned" },
  { name: "Elena Petrova", email: "elena@mail.com", progress: 54, status: "active" },
];

export default function AdminUsersPage() {
  return (
    <div>
      <PageHeader
        title="User Management"
        description="View users, monitor activity, ban/unban, reset passwords"
      />

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input placeholder="Search users..." className="pl-10" />
          </div>
          <Button variant="outline">Export CSV</Button>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-border">
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Progress</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b border-border/50 last:border-0">
                  <td className="py-4 pr-4 font-medium">{u.name}</td>
                  <td className="py-4 pr-4 text-text-muted">{u.email}</td>
                  <td className="py-4 pr-4">{u.progress}%</td>
                  <td className="py-4 pr-4">
                    <Badge variant={u.status === "active" ? "success" : "danger"}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      {u.status === "active" ? (
                        <Button variant="danger" size="sm">Ban</Button>
                      ) : (
                        <Button variant="outline" size="sm">Unban</Button>
                      )}
                    </div>
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

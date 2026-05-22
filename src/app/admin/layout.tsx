import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell admin>
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="text-sm text-text-muted hover:text-primary transition-colors"
        >
          ← Back to Platform
        </Link>
      </div>
      {children}
    </AppShell>
  );
}

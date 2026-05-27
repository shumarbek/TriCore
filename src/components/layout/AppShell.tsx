"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthProvider";
import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AppShell({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const banned = profile?.status === "banned";

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        admin={admin}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
      {banned && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-danger/40 bg-surface p-6 text-center shadow-2xl">
            <Ban className="w-10 h-10 text-danger mx-auto mb-3" />
            <h2 className="text-xl font-bold">Akkount bloklangan</h2>
            <p className="text-sm text-text-muted mt-2">
              Administrator sizning platformadan foydalanishingizni vaqtincha cheklagan.
              Darslar va imtihonlardan foydalanish bloklandi.
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
            >
              Chiqish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

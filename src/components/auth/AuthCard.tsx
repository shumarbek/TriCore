"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthProvider";
import { motion } from "framer-motion";
import { Atom } from "lucide-react";
import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-8 shadow-2xl"
    >
      <Link href="/" className="flex items-center justify-center gap-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Atom className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold gradient-text">TriCore</span>
      </Link>
      <h1 className="text-2xl font-bold text-center text-text">{title}</h1>
      <p className="text-text-muted text-center text-sm mt-1 mb-6">{subtitle}</p>
      {children}
      {footer}
    </motion.div>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-text-muted">or</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export function SocialButtons() {
  const { signInWithProvider } = useAuth();
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        size="md"
        className="w-full"
        onClick={() => signInWithProvider("google")}
      >
        Google
      </Button>
      <Button
        variant="outline"
        size="md"
        className="w-full"
        onClick={() => signInWithProvider("github")}
      >
        GitHub
      </Button>
    </div>
  );
}

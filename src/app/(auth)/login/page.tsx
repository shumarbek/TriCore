"use client";

import { AuthCard, AuthDivider, SocialButtons } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue your STEM journey"
      footer={
        <p className="text-center text-sm text-text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Register
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Input
          label="Email or Username"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-text-muted cursor-pointer">
            <input type="checkbox" className="rounded border-border" />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Link href="/dashboard" className="block">
          <Button variant="primary" size="lg" className="w-full">
            Sign In
          </Button>
        </Link>
      </form>
      <AuthDivider />
      <SocialButtons />
    </AuthCard>
  );
}

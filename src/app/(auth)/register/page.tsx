"use client";

import { AuthCard, AuthDivider, SocialButtons } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, Mail, User } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create account"
      subtitle="Start your journey from zero to mastery"
      footer={
        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Input label="Full Name" placeholder="John Doe" icon={<User className="w-4 h-4" />} />
        <Input label="Username" placeholder="johndoe" icon={<User className="w-4 h-4" />} />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
        />
        <label className="flex items-start gap-2 text-xs text-text-muted">
          <input type="checkbox" className="mt-0.5 rounded" />
          I agree to the Terms of Service and Privacy Policy
        </label>
        <Link href="/dashboard" className="block">
          <Button variant="primary" size="lg" className="w-full">
            Create Account
          </Button>
        </Link>
      </form>
      <AuthDivider />
      <SocialButtons />
    </AuthCard>
  );
}

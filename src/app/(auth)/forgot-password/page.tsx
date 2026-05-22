"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset password"
      subtitle="We'll send a verification link to your email"
      footer={
        <p className="text-center text-sm text-text-muted mt-6">
          <Link href="/login" className="text-primary hover:underline">
            ← Back to login
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
        />
        <Button variant="primary" size="lg" className="w-full">
          Send Reset Link
        </Button>
      </form>
    </AuthCard>
  );
}

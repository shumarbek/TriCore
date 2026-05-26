"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`,
    });
    if (err) setError(err.message);
    else setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <AuthCard
        title="Email yuborildi"
        subtitle="Parolni tiklash havolasi emailingizga yuborildi"
      >
        <p className="text-center text-sm text-text-muted mb-4">
          <strong className="text-text">{email}</strong> ni tekshiring.
        </p>
        <Link href="/login">
          <Button variant="primary" className="w-full">Login ga qaytish</Button>
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle="We'll send a verification link to your email"
      footer={
        <p className="text-center text-sm text-text-muted mt-6">
          <Link href="/login" className="text-primary hover:underline">
            \u2190 Back to login
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/25 text-sm text-danger">
            {error}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button variant="primary" size="lg" className="w-full" type="submit" loading={loading}>
          Send Reset Link
        </Button>
      </form>
    </AuthCard>
  );
}

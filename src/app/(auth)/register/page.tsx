"use client";

import { AuthCard, AuthDivider, SocialButtons } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthProvider";
import { Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Parollar mos kelmaydi");
      return;
    }
    if (password.length < 6) {
      setError("Parol kamida 6 belgidan iborat bo'lishi kerak");
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email, password, {
      full_name: fullName,
      username: username || email.split("@")[0],
    });
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthCard
        title="Email tasdiqlang"
        subtitle="Ro'yxatdan o'tish uchun emailingizga yuborilgan havolani bosing"
      >
        <div className="text-center space-y-4">
          <p className="text-sm text-text-muted">
            <strong className="text-text">{email}</strong> ga tasdiqlash havolasi yuborildi.
          </p>
          <Link href="/login">
            <Button variant="primary" className="w-full">Login sahifasiga o&apos;tish</Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

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
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/25 text-sm text-danger">
            {error}
          </div>
        )}
        <Input
          label="Full Name"
          placeholder="John Doe"
          icon={<User className="w-4 h-4" />}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          label="Username"
          placeholder="johndoe"
          icon={<User className="w-4 h-4" />}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
          icon={<Lock className="w-4 h-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
          icon={<Lock className="w-4 h-4" />}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button variant="primary" size="lg" className="w-full" type="submit" loading={loading}>
          Create Account
        </Button>
      </form>
      <AuthDivider />
      <SocialButtons />
    </AuthCard>
  );
}

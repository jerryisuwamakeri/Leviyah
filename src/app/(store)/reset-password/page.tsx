"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const sp     = useSearchParams();
  const router = useRouter();

  const token = sp.get("token") ?? "";
  const email = sp.get("email") ?? "";

  const [password,             setPassword]             = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading,              setLoading]              = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, email, password, password_confirmation: passwordConfirmation });
      toast.success("Password reset! You can now log in.");
      router.push("/login");
    } catch {
      toast.error("Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Invalid reset link.</p>
        <Link href="/forgot-password" className="text-rose-600 hover:underline mt-2 block">Request a new one</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} disabled className="mt-1.5 bg-gray-50" />
      </div>
      <div>
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          className="mt-1.5"
          required minLength={8}
        />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm Password</Label>
        <Input
          id="confirm"
          type="password"
          value={passwordConfirmation}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordConfirmation(e.target.value)}
          placeholder="Repeat password"
          className="mt-1.5"
          required
        />
      </div>
      <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={loading}>
        {loading ? "Resetting…" : "Reset Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 text-rose-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Reset Your Password</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your new password below.</p>
          </div>
          <Suspense fallback={<div className="text-center text-gray-400 py-4">Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

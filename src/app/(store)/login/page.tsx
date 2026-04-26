"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import toast from "react-hot-toast";

function LoginForm() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const { setUser } = useAuthStore();
  const router      = useRouter();
  const params      = useSearchParams();
  const redirect    = params.get("redirect") ?? "/account";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      setUser(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.replace(redirect);
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EAD8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black tracking-widest uppercase text-[#111111]">Leviyah</Link>
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#7A6050] mt-2">Sign In</p>
        </div>

        {redirect !== "/account" && (
          <div className="bg-[#C9A880]/10 border border-[#C9A880]/30 px-4 py-3 mb-5 text-center">
            <p className="text-[11px] text-[#7A6050]">Sign in to continue to your destination.</p>
          </div>
        )}

        <div className="bg-white border border-[#E8D8C4] p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Email</Label>
              <Input type="email" value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="mt-2 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]"
                placeholder="you@example.com" required />
            </div>
            <div>
              <div className="flex justify-between">
                <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Password</Label>
                <Link href="/forgot-password"
                  className="text-[9px] font-bold tracking-widest uppercase text-[#C9A880] hover:text-[#111111] transition-colors">
                  Forgot?
                </Link>
              </div>
              <Input type="password" value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="mt-2 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]"
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#111111] text-white h-11 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors disabled:opacity-50">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-[11px] text-[#7A6050] mt-6">
            No account?{" "}
            <Link href={`/register${redirect !== "/account" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="text-[#111111] font-bold underline underline-offset-2 hover:text-[#C9A880] transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

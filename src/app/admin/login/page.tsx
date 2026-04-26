"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { staffAuthApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const { setStaff } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await staffAuthApi.login({ email, password });
      setStaff(data.staff, data.token, data.roles, data.permissions);
      router.replace("/admin/dashboard");
    } catch {
      toast.error("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0C0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <p className="text-3xl font-black tracking-widest uppercase text-[#C9A880]">Leviyah</p>
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#7A6050] mt-2">Staff Portal</p>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#2A2520] p-8">
          <p className="text-xs font-bold tracking-widest uppercase text-white mb-6">Sign In</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label className="text-[#7A6050] text-[10px] font-bold tracking-widest uppercase">Email</Label>
              <Input
                id="email" type="email" value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="mt-2 bg-[#0E0C0A] border-[#2A2520] text-white placeholder-[#3A3530] focus:border-[#C9A880] rounded-none h-11"
                placeholder="admin@leviyah.com" required
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[#7A6050] text-[10px] font-bold tracking-widest uppercase">Password</Label>
                <Link href="/admin/forgot-password"
                  className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] transition-colors">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password" type="password" value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="mt-2 bg-[#0E0C0A] border-[#2A2520] text-white placeholder-[#3A3530] focus:border-[#C9A880] rounded-none h-11"
                placeholder="••••••••" required
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#C9A880] text-[#111111] h-11 text-[10px] font-black tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-50">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-[9px] font-semibold tracking-widest uppercase text-[#3A3530] hover:text-[#7A6050] transition-colors">
            ← Back to Store
          </Link>
        </p>
      </div>
    </div>
  );
}

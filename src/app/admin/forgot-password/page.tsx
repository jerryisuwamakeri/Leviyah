"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, ArrowLeft } from "lucide-react";

export default function AdminForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email, "staff");
      setSent(true);
      toast.success("Reset link sent!");
    } catch {
      toast.error("Email not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0C0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <Link href="/admin/login"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] mb-8 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Login
        </Link>

        <div className="bg-[#111111] border border-[#2A2520] p-8">

          <div className="text-center mb-7">
            <div className="w-12 h-12 bg-[#C9A880]/10 border border-[#C9A880]/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-5 h-5 text-[#C9A880]" />
            </div>
            <h1 className="text-lg font-black text-white tracking-tight">Forgot Password</h1>
            <p className="text-[11px] text-[#7A6050] mt-1.5">Enter your staff email to receive a reset link.</p>
          </div>

          {sent ? (
            <div className="text-center py-2">
              <div className="bg-[#C9A880]/10 border border-[#C9A880]/30 p-4 mb-5">
                <p className="text-[#C9A880] font-bold text-sm">Reset link sent!</p>
                <p className="text-[#C9A880]/60 text-[11px] mt-1">Check your email at <strong>{email}</strong>.</p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050] hover:text-white transition-colors">
                Send Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050] mb-2">
                  Staff Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder:text-[#3A3530] rounded-none h-11 focus-visible:ring-[#C9A880]/30 focus-visible:border-[#C9A880]/40"
                  placeholder="staff@leviyah.com"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#C9A880] text-[#111111] hover:bg-white rounded-none h-11 text-[10px] font-black tracking-widest uppercase"
                disabled={loading}>
                {loading ? "Sending…" : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

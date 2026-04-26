"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error("Email not found or request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Left — image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/skincare-products.jpg"
          alt="Leviyah Beauty"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#111111]/50" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="text-4xl font-black text-white leading-tight">
            Reset your<br />
            <span className="text-[#C9A880]">password.</span>
          </p>
          <p className="text-white/60 text-sm mt-3">
            We'll send a secure link to your inbox.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/login"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#B8A090] hover:text-[#C9A880] transition-colors mb-10">
            <ArrowLeft className="w-3 h-3" /> Back to Sign In
          </Link>

          <div className="mb-8">
            <Link href="/" className="text-2xl font-black tracking-widest uppercase text-[#111111]">
              Leviyah
            </Link>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mt-2">
              Forgot Password
            </p>
          </div>

          {sent ? (
            <div className="border border-[#E8D8C4] bg-white p-8 text-center">
              <CheckCircle className="w-10 h-10 text-[#C9A880] mx-auto mb-4" strokeWidth={1.5} />
              <p className="font-black text-[#111111] mb-2">Check Your Email</p>
              <p className="text-sm text-[#7A6050] leading-relaxed">
                We sent a password reset link to<br />
                <span className="font-semibold text-[#111111]">{email}</span>
              </p>
              <button onClick={() => { setSent(false); setEmail(""); }}
                className="mt-6 text-[10px] font-bold tracking-widest uppercase text-[#B8A090] hover:text-[#C9A880] transition-colors">
                Resend link
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#7A6050] mb-6 leading-relaxed">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#111111] text-white h-12 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors disabled:opacity-50">
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

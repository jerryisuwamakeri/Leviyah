"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

function RegisterForm() {
  const [form,    setForm]    = useState({ name: "", email: "", password: "", password_confirmation: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router   = useRouter();
  const params   = useSearchParams();
  const redirect = params.get("redirect") ?? "/account";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) { toast.error("Passwords don't match."); return; }
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      setUser(data.user, data.token);
      toast.success("Welcome to Leviyah!");
      router.replace(redirect);
    } catch {
      toast.error("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const f = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }),
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image src="/images/hero-beauty.jpg" alt="Leviyah Beauty" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-[#111111]/40" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="text-4xl font-black text-white leading-tight">
            Join the<br />
            <span className="text-[#C9A880]">Leviyah</span><br />
            Family.
          </p>
          <p className="text-white/60 text-sm mt-3">Premium beauty delivered to your door.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <Link href="/" className="text-2xl font-black tracking-widest uppercase text-[#111111]">Leviyah</Link>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mt-2">Create Account</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Full Name</Label>
              <Input {...f("name")} className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" placeholder="Jane Doe" required />
            </div>
            <div>
              <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Email</Label>
              <Input type="email" {...f("email")} className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" placeholder="you@example.com" required />
            </div>
            <div>
              <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Phone <span className="normal-case tracking-normal font-normal">(optional)</span></Label>
              <Input {...f("phone")} className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" placeholder="+234 800 000 0000" />
            </div>
            <div>
              <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Password</Label>
              <Input type="password" {...f("password")} className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" placeholder="Min. 8 characters" required minLength={8} />
            </div>
            <div>
              <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Confirm Password</Label>
              <Input type="password" {...f("password_confirmation")} className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" placeholder="Repeat password" required />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#111111] text-white h-12 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors disabled:opacity-50 mt-2">
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[11px] text-[#7A6050] mt-6">
            Already have an account?{" "}
            <Link href={`/login${redirect !== "/account" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="text-[#111111] font-bold underline-offset-2 underline hover:text-[#C9A880] transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-center text-[10px] text-[#B8A090] mt-4 leading-relaxed">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[#C9A880] transition-colors">Terms</Link>
            {" "}&amp;{" "}
            <Link href="/privacy-policy" className="underline hover:text-[#C9A880] transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

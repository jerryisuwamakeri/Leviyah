"use client";

import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, User, LogOut, ChevronRight } from "lucide-react";
import type { User as UserType } from "@/types";

export default function AccountPage() {
  const { isAuthenticated, isStaff, token, setUser, logout } = useAuthStore();
  const router = useRouter();
  const [me, setMe] = useState<UserType | null>(null);

  useEffect(() => {
    if (!isAuthenticated || isStaff) {
      router.replace("/login?redirect=/account");
      return;
    }
    authApi.me().then((r) => {
      setMe(r.data);
      setUser(r.data, token!);
    }).catch(() => {
      logout();
      router.replace("/login?redirect=/account");
    });
  }, [isAuthenticated, isStaff, token, setUser, logout, router]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.push("/");
  };

  if (!me) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C9A880] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mb-1">Welcome back</p>
          <h1 className="text-2xl font-black text-[#111111]">{me.name}</h1>
          <p className="text-xs text-[#B8A090] mt-0.5">{me.email}</p>
        </div>

        {/* Menu */}
        <div className="bg-white border border-[#E8D8C4] divide-y divide-[#F5EAD8]">
          <Link href="/account/orders"
            className="flex items-center justify-between px-5 py-4 hover:bg-[#FDFAF7] transition-colors group">
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-[#C9A880]" />
              <div>
                <p className="text-sm font-bold text-[#111111]">My Orders</p>
                <p className="text-[10px] text-[#B8A090]">Track and view your orders</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#C9A880] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link href="/account/profile"
            className="flex items-center justify-between px-5 py-4 hover:bg-[#FDFAF7] transition-colors group">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-[#C9A880]" />
              <div>
                <p className="text-sm font-bold text-[#111111]">Profile</p>
                <p className="text-[10px] text-[#B8A090]">Update your name, phone, and password</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#C9A880] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#FFF8F5] transition-colors text-left">
            <LogOut className="w-4 h-4 text-[#B8A090]" />
            <p className="text-sm font-bold text-[#7A6050]">Sign Out</p>
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link href="/shop"
            className="text-[10px] font-bold tracking-widest uppercase text-[#C9A880] hover:text-[#111111] transition-colors">
            Continue Shopping →
          </Link>
        </div>
      </div>
    </div>
  );
}

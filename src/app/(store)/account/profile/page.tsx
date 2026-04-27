"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { isAuthenticated, user, setUser, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login?redirect=/account/profile");
  }, [isAuthenticated, router]);

  const [name,  setName]  = useState(user?.name  ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [changingPw, setChangingPw] = useState(false);

  if (!isAuthenticated || !user) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile({ name, phone });
      setUser(res.data, token!);
      toast.success("Profile updated.");
    } catch {
      toast.error("Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error("Passwords do not match."); return; }
    if (newPw.length < 8)   { toast.error("Password must be at least 8 characters."); return; }
    setChangingPw(true);
    try {
      await authApi.resetPassword({ current_password: currentPw, password: newPw, password_confirmation: confirmPw });
      toast.success("Password changed.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch {
      toast.error("Could not change password. Check your current password.");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 space-y-6">

        <div className="mb-2">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mb-1">Account</p>
          <h1 className="text-2xl font-black text-[#111111]">Profile</h1>
        </div>

        {/* Personal info */}
        <form onSubmit={saveProfile} className="bg-white border border-[#E8D8C4] p-5 space-y-4">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Personal Info</p>

          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050] block mb-1.5">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border border-[#E8D8C4] px-3 h-11 text-sm text-[#111111] focus:outline-none focus:border-[#C9A880] bg-white" />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050] block mb-1.5">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel"
              className="w-full border border-[#E8D8C4] px-3 h-11 text-sm text-[#111111] focus:outline-none focus:border-[#C9A880] bg-white" />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050] block mb-1.5">Email</label>
            <input value={user.email} disabled
              className="w-full border border-[#E8D8C4] px-3 h-11 text-sm text-[#B8A090] bg-[#FAFAFA] cursor-not-allowed" />
          </div>

          <button type="submit" disabled={saving}
            className="w-full h-11 bg-[#111111] text-white text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors disabled:opacity-40">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={changePassword} className="bg-white border border-[#E8D8C4] p-5 space-y-4">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Change Password</p>

          {[
            { label: "Current Password", val: currentPw, set: setCurrentPw },
            { label: "New Password",     val: newPw,     set: setNewPw     },
            { label: "Confirm Password", val: confirmPw, set: setConfirmPw },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050] block mb-1.5">{label}</label>
              <input type="password" value={val} onChange={(e) => set(e.target.value)} required
                className="w-full border border-[#E8D8C4] px-3 h-11 text-sm text-[#111111] focus:outline-none focus:border-[#C9A880] bg-white" />
            </div>
          ))}

          <button type="submit" disabled={changingPw}
            className="w-full h-11 bg-[#111111] text-white text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors disabled:opacity-40">
            {changingPw ? "Updating…" : "Update Password"}
          </button>
        </form>

        <Link href="/account"
          className="block text-center text-[10px] font-bold tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] transition-colors">
          ← Back to Account
        </Link>
      </div>
    </div>
  );
}

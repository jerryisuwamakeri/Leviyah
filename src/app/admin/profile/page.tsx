"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Lock, Camera, Check, Eye, EyeOff,
  Shield, Key, AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import type { Staff } from "@/types";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

const ROLE_META: Record<string, { label: string; color: string; desc: string }> = {
  super_admin: { label: "Super Admin",  color: "bg-[#C9A880] text-[#111111]",      desc: "Full system access — can manage everything" },
  admin:       { label: "Admin",        color: "bg-white/10 text-white",            desc: "Admin access — manages store operations" },
  manager:     { label: "Manager",      color: "bg-[#C9A880]/20 text-[#C9A880]",   desc: "Store manager — products, orders & POS" },
  cashier:     { label: "Cashier",      color: "bg-white/5 text-white/60",          desc: "POS & sales only" },
  support:     { label: "Support",      color: "bg-[#C9A880]/10 text-[#C9A880]/70",desc: "Customer support & chats only" },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050] mb-1.5 block">
        {label}
      </Label>
      {children}
    </div>
  );
}

export default function AdminProfilePage() {
  const qc = useQueryClient();
  const { staff: authStaff, setStaff, roles, permissions } = useAuthStore();

  const [avatarFile,  setAvatarFile]  = useState<File | null>(null);
  const [avatarPrev,  setAvatarPrev]  = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    name: authStaff?.name ?? "",
    phone: authStaff?.phone ?? "",
    position: authStaff?.position ?? "",
    department: authStaff?.department ?? "",
  });

  const [pwForm, setPwForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  /* ── Fetch fresh profile ── */
  const { data } = useQuery<{ staff: Staff; roles: string[]; permissions: string[] }>({
    queryKey: ["admin", "profile"],
    queryFn: () => adminApi.profile().then((r) => {
      const d = r.data as { staff: Staff; roles: string[]; permissions: string[] };
      setProfileForm({
        name:       d.staff.name       ?? "",
        phone:      d.staff.phone      ?? "",
        position:   d.staff.position   ?? "",
        department: d.staff.department ?? "",
      });
      return d;
    }),
  });

  const staff = (data as { staff?: Staff })?.staff ?? authStaff;

  /* ── Update profile ── */
  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (avatarFile) fd.append("avatar", avatarFile);
      return adminApi.updateProfile(fd).then((r) => r.data);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["admin", "profile"] });
      setStaff(updated, localStorage.getItem("lvy_token")!, roles, permissions);
      toast.success("Profile updated!");
      setAvatarFile(null);
    },
    onError: () => toast.error("Failed to update profile."),
  });

  /* ── Change password ── */
  const { mutate: changePassword, isPending: changingPw } = useMutation({
    mutationFn: () => adminApi.changePassword(pwForm).then((r) => r.data),
    onSuccess: () => {
      toast.success("Password changed successfully.");
      setPwForm({ current_password: "", password: "", password_confirmation: "" });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Password change failed.");
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPrev(URL.createObjectURL(file));
  };

  const avatarSrc = avatarPrev
    ?? (staff?.avatar ? (staff.avatar.startsWith("http") ? staff.avatar : `${STORAGE}/${staff.avatar}`) : null);

  const currentRole = roles[0] ?? null;
  const roleMeta    = currentRole ? ROLE_META[currentRole] : null;

  return (
    <div className="max-w-3xl space-y-6">

      {/* Header */}
      <div>
        <p className="text-[9px] font-bold tracking-[0.35em] uppercase text-[#C9A880]">Account</p>
        <h1 className="text-2xl font-black text-white mt-1">My Profile</h1>
      </div>

      {/* Role card */}
      {roleMeta && (
        <div className="bg-[#111111] border border-[#2A2520] p-5 flex items-center gap-5">
          <div className="w-10 h-10 bg-[#C9A880]/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#C9A880]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 ${roleMeta.color}`}>
                {roleMeta.label}
              </span>
              <span className="text-[10px] text-[#7A6050]">{roleMeta.desc}</span>
            </div>
            <p className="text-[10px] text-[#3A3530] mt-1.5">
              Permissions: {permissions.slice(0, 5).map(p => p.replace(/_/g, " ")).join(", ")}
              {permissions.length > 5 && ` +${permissions.length - 5} more`}
            </p>
          </div>
        </div>
      )}

      {/* ── Profile form ─────────────────────────────── */}
      <div className="bg-[#111111] border border-[#2A2520]">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2A2520]">
          <User className="w-4 h-4 text-[#C9A880]" />
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#7A6050]">Personal Information</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 bg-[#C9A880] flex items-center justify-center overflow-hidden">
                {avatarSrc ? (
                  <Image src={avatarSrc} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <span className="text-[#111111] text-2xl font-black">
                    {staff?.name?.[0] ?? "A"}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#C9A880] flex items-center justify-center hover:bg-white transition-colors"
              >
                <Camera className="w-3 h-3 text-[#111111]" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{staff?.name}</p>
              <p className="text-[10px] text-[#7A6050] mt-0.5">{staff?.email}</p>
              <p className="text-[10px] text-[#7A6050]">ID: {staff?.employee_id}</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-[9px] font-bold tracking-widest uppercase text-[#C9A880] hover:text-white transition-colors mt-2"
              >
                Change Photo
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name">
              <Input
                value={profileForm.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm(f => ({ ...f, name: e.target.value }))}
                className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10 focus:border-[#C9A880]"
              />
            </Field>

            <Field label="Phone Number">
              <Input
                value={profileForm.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+234..."
                className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10 focus:border-[#C9A880]"
              />
            </Field>

            <Field label="Position / Job Title">
              <Input
                value={profileForm.position}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm(f => ({ ...f, position: e.target.value }))}
                placeholder="e.g. Senior Cashier"
                className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10 focus:border-[#C9A880]"
              />
            </Field>

            <Field label="Department">
              <Input
                value={profileForm.department}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm(f => ({ ...f, department: e.target.value }))}
                placeholder="e.g. Sales"
                className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10 focus:border-[#C9A880]"
              />
            </Field>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => saveProfile()}
              disabled={saving}
              className="flex items-center gap-2 bg-[#C9A880] text-[#111111] px-6 h-10 text-[10px] font-black tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Change password ──────────────────────────── */}
      <div className="bg-[#111111] border border-[#2A2520]">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2A2520]">
          <Lock className="w-4 h-4 text-[#C9A880]" />
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#7A6050]">Change Password</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 bg-[#0E0C0A] border border-[#2A2520] p-3">
            <AlertTriangle className="w-4 h-4 text-[#C9A880] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#7A6050] leading-relaxed">
              After changing your password, all other active sessions will be signed out for security.
            </p>
          </div>

          {/* Current password */}
          <Field label="Current Password">
            <div className="relative">
              <Input
                type={showPw.current ? "text" : "password"}
                value={pwForm.current_password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPwForm(f => ({ ...f, current_password: e.target.value }))}
                placeholder="Enter current password"
                className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10 focus:border-[#C9A880] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6050] hover:text-[#C9A880] transition-colors"
              >
                {showPw.current ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="New Password">
              <div className="relative">
                <Input
                  type={showPw.new ? "text" : "password"}
                  value={pwForm.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPwForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10 focus:border-[#C9A880] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6050] hover:text-[#C9A880] transition-colors"
                >
                  {showPw.new ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {/* Strength indicator */}
              {pwForm.password && (
                <div className="flex gap-1 mt-1.5">
                  {[1,2,3,4].map((n) => (
                    <div key={n} className={`h-0.5 flex-1 transition-colors ${
                      pwForm.password.length >= n * 2
                        ? n <= 2 ? "bg-[#C9A880]/60" : "bg-[#C9A880]"
                        : "bg-[#2A2520]"
                    }`} />
                  ))}
                </div>
              )}
            </Field>

            <Field label="Confirm New Password">
              <div className="relative">
                <Input
                  type={showPw.confirm ? "text" : "password"}
                  value={pwForm.password_confirmation}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPwForm(f => ({ ...f, password_confirmation: e.target.value }))}
                  placeholder="Repeat new password"
                  className={`bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10 focus:border-[#C9A880] pr-10 ${
                    pwForm.password_confirmation && pwForm.password !== pwForm.password_confirmation
                      ? "border-[#C9A880]/40"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6050] hover:text-[#C9A880] transition-colors"
                >
                  {showPw.confirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {pwForm.password_confirmation && pwForm.password !== pwForm.password_confirmation && (
                <p className="text-[9px] text-[#C9A880]/60 mt-1">Passwords do not match</p>
              )}
            </Field>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => changePassword()}
              disabled={
                changingPw ||
                !pwForm.current_password ||
                !pwForm.password ||
                pwForm.password !== pwForm.password_confirmation ||
                pwForm.password.length < 8
              }
              className="flex items-center gap-2 bg-[#111111] border border-[#C9A880] text-[#C9A880] px-6 h-10 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Key className="w-3.5 h-3.5" />
              {changingPw ? "Changing…" : "Change Password"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Account info ─────────────────────────────── */}
      <div className="bg-[#111111] border border-[#2A2520] p-5">
        <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#7A6050] mb-4">Account Details</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          {[
            ["Email",       staff?.email],
            ["Employee ID", staff?.employee_id],
            ["Status",      staff?.status],
            ["Department",  staff?.department ?? "—"],
            ["Position",    staff?.position ?? "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[9px] text-[#3A3530] tracking-widest uppercase">{label}</p>
              <p className="text-white font-semibold mt-0.5 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

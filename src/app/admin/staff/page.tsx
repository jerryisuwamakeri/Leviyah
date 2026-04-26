"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Plus, QrCode, Trash2, Eye, EyeOff } from "lucide-react";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import toast from "react-hot-toast";
import type { Staff } from "@/types";

const ROLES = ["super_admin", "admin", "manager", "cashier", "support"];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin:       "Admin",
  manager:     "Manager",
  cashier:     "Cashier",
  support:     "Support",
};

const EMPTY_FORM = {
  name: "", email: "", password: "", phone: "",
  position: "", department: "", role: "cashier",
};

export default function AdminStaffPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [qrStaff, setQrStaff]       = useState<Staff | null>(null);
  const [showPw, setShowPw]         = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);

  const { data } = useQuery<{ data: Staff[] }>({
    queryKey: ["admin", "staff"],
    queryFn:  () => adminApi.staff().then((r) => r.data),
  });

  const staffList: Staff[] = Array.isArray(data)
    ? (data as unknown as Staff[])
    : (data as { data: Staff[] })?.data ?? [];

  const { mutate: createStaff, isPending: creating } = useMutation({
    mutationFn: (d: unknown) => adminApi.createStaff(d).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "staff"] });
      toast.success("Staff member created.");
      setCreateOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("Failed to create staff."),
  });

  const { mutate: deleteStaff } = useMutation({
    mutationFn: (id: number) => adminApi.deleteStaff(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "staff"] });
      toast.success("Staff removed.");
    },
  });

  function field(k: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [k]: value }));
  }

  const initials = form.name
    .split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase() || "?";

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black tracking-wider uppercase text-white flex items-center gap-2.5">
          <Users className="w-5 h-5 text-[#C9A880]" /> Staff
        </h1>
        <button
          onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }}
          className="flex items-center gap-2 bg-[#C9A880] text-[#111111] px-4 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-white transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Staff
        </button>
      </div>

      {/* Staff table */}
      <div className="bg-[#111111] border border-[#2A2520] rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#2A2520]">
              <tr>
                {["Member", "Employee ID", "Position", "Department", "Role", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] font-black tracking-[0.25em] uppercase text-[#7A6050] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1A17]">
              {staffList.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[#3A3530] text-xs">
                    No staff members yet.
                  </td>
                </tr>
              )}
              {staffList.map((s) => (
                <tr key={s.id} className="hover:bg-[#1E1A17]/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#C9A880] flex items-center justify-center text-[#111111] text-[10px] font-black shrink-0">
                        {s.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{s.name}</p>
                        <p className="text-[10px] text-[#7A6050]">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-[#7A6050]">{s.employee_id}</td>
                  <td className="px-4 py-3 text-xs text-white/70">{s.position ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-white/70">{s.department ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.roles?.map((r) => (
                        <span key={r.id} className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-[#C9A880]/10 text-[#C9A880]/80 border border-[#C9A880]/20">
                          {ROLE_LABELS[r.name] ?? r.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      s.status === "active"
                        ? "bg-[#C9A880]/15 text-[#C9A880] border border-[#C9A880]/30"
                        : "bg-[#2A2520] text-[#7A6050] border border-[#3A3530]"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQrStaff(s)}
                        className="w-7 h-7 flex items-center justify-center text-[#7A6050] hover:text-[#C9A880] hover:bg-[#C9A880]/10 transition-colors"
                        title="View QR Code">
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Remove ${s.name}?`)) deleteStaff(s.id); }}
                        className="w-7 h-7 flex items-center justify-center text-[#7A6050] hover:text-white/60 hover:bg-[#2A2520] transition-colors"
                        title="Remove staff">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#111111] border border-[#2A2520] rounded-none text-white max-w-lg p-0">

          {/* Header */}
          <div className="px-6 py-4 border-b border-[#2A2520] flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black tracking-[0.35em] uppercase text-[#7A6050]">Staff Management</p>
              <p className="text-sm font-black text-white mt-0.5">New Staff Member</p>
            </div>
            {/* Avatar preview */}
            <div className="w-10 h-10 bg-[#C9A880] flex items-center justify-center text-[#111111] text-sm font-black shrink-0">
              {initials}
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); createStaff(form); }}
            className="px-6 py-5 space-y-5">

            {/* Identity */}
            <div>
              <p className="text-[8px] font-black tracking-[0.35em] uppercase text-[#3A3530] mb-3">Identity</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] mb-1.5 block">
                    Full Name <span className="text-[#C9A880]">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => field("name", e.target.value)}
                    placeholder="e.g. Amaka Johnson"
                    required
                    className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder:text-[#3A3530] rounded-none h-10 focus-visible:ring-[#C9A880]/30 focus-visible:border-[#C9A880]/40"
                  />
                </div>
                <div>
                  <Label className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] mb-1.5 block">
                    Email <span className="text-[#C9A880]">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => field("email", e.target.value)}
                    placeholder="staff@leviyah.com"
                    required
                    className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder:text-[#3A3530] rounded-none h-10 focus-visible:ring-[#C9A880]/30 focus-visible:border-[#C9A880]/40"
                  />
                </div>
                <div>
                  <Label className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] mb-1.5 block">
                    Phone
                  </Label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => field("phone", e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder:text-[#3A3530] rounded-none h-10 focus-visible:ring-[#C9A880]/30 focus-visible:border-[#C9A880]/40"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <p className="text-[8px] font-black tracking-[0.35em] uppercase text-[#3A3530] mb-3">Security</p>
              <div>
                <Label className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] mb-1.5 block">
                  Password <span className="text-[#C9A880]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => field("password", e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                    className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder:text-[#3A3530] rounded-none h-10 pr-10 focus-visible:ring-[#C9A880]/30 focus-visible:border-[#C9A880]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6050] hover:text-white transition-colors">
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role & Position */}
            <div>
              <p className="text-[8px] font-black tracking-[0.35em] uppercase text-[#3A3530] mb-3">Role & Position</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] mb-1.5 block">
                    Role <span className="text-[#C9A880]">*</span>
                  </Label>
                  <Select value={form.role} onValueChange={(v) => field("role", v ?? "cashier")}>
                    <SelectTrigger className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10 focus:ring-[#C9A880]/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#2A2520] rounded-none">
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="text-white text-xs">
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] mb-1.5 block">
                    Position
                  </Label>
                  <Input
                    value={form.position}
                    onChange={(e) => field("position", e.target.value)}
                    placeholder="e.g. Store Cashier"
                    className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder:text-[#3A3530] rounded-none h-10 focus-visible:ring-[#C9A880]/30 focus-visible:border-[#C9A880]/40"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] mb-1.5 block">
                    Department
                  </Label>
                  <Input
                    value={form.department}
                    onChange={(e) => field("department", e.target.value)}
                    placeholder="e.g. Sales, Operations"
                    className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder:text-[#3A3530] rounded-none h-10 focus-visible:ring-[#C9A880]/30 focus-visible:border-[#C9A880]/40"
                  />
                </div>
              </div>
            </div>

            {/* Role description */}
            <div className="bg-[#0E0C0A] border border-[#2A2520] px-4 py-3">
              <p className="text-[9px] text-[#7A6050] leading-relaxed">
                {form.role === "super_admin" && "Full access to all features including staff management, billing, and system settings."}
                {form.role === "admin"       && "Admin access: products, orders, transactions, staff, and promotions."}
                {form.role === "manager"     && "Store manager: products, orders, POS, promotions, and chats."}
                {form.role === "cashier"     && "POS terminal access: create sales, view orders, clock in/out."}
                {form.role === "support"     && "Customer support: chat management and order queries."}
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 border border-[#2A2520] text-[#7A6050] hover:text-white hover:bg-[#1E1A17] rounded-none h-10 text-[10px] tracking-widest uppercase"
                onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#C9A880] text-[#111111] hover:bg-white rounded-none h-10 text-[10px] font-black tracking-widest uppercase"
                disabled={creating}>
                {creating ? "Creating…" : "Create Staff"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={!!qrStaff} onOpenChange={(o) => !o && setQrStaff(null)}>
        <DialogContent className="bg-[#111111] border border-[#2A2520] rounded-none text-white max-w-xs p-0">
          <div className="px-6 py-4 border-b border-[#2A2520]">
            <p className="text-[9px] font-black tracking-[0.35em] uppercase text-[#7A6050]">Staff QR Code</p>
            <p className="text-sm font-black text-white mt-0.5">{qrStaff?.name}</p>
          </div>
          {qrStaff && (
            <div className="flex flex-col items-center gap-4 px-6 py-6">
              <div className="bg-white p-4">
                <QRCode value={qrStaff.qr_code} size={180} />
              </div>
              <div className="text-center space-y-1">
                <p className="font-mono text-[10px] text-[#C9A880]">{qrStaff.employee_id}</p>
                <p className="text-[9px] text-[#7A6050]">Scan to clock in / out at POS</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

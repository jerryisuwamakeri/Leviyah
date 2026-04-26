"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Eye, Pencil, Trash2, Printer, X } from "lucide-react";
import toast from "react-hot-toast";
import type { Transaction } from "@/types";

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success:  "bg-[#C9A880]/15 text-[#C9A880] border border-[#C9A880]/30",
    pending:  "bg-white/5 text-white/50 border border-white/10",
    failed:   "bg-[#2A2520] text-white/40 border border-white/10",
    refunded: "bg-[#C9A880]/8 text-[#C9A880]/60 border border-[#C9A880]/20",
  };
  return (
    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
}

function Receipt({ t, onClose }: { t: Transaction; onClose: () => void }) {
  return (
    <div className="bg-[#FAFAFA] text-[#111111] font-mono p-0 max-w-sm mx-auto rounded-none">
      <div className="bg-[#111111] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[#C9A880] text-[10px] font-black tracking-[0.4em] uppercase">Leviyah</p>
          <p className="text-white/40 text-[8px] tracking-widest uppercase mt-0.5">Beauty & Hair</p>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-6 pt-5 pb-2 border-b-2 border-dashed border-[#D4C5B0]">
        <p className="text-[9px] text-[#7A6050] uppercase tracking-widest text-center">Payment Receipt</p>
        <p className="text-[22px] font-black text-center mt-2 tracking-tight">{formatNGN(t.amount)}</p>
        <div className="flex justify-center mt-2">
          <StatusBadge status={t.status} />
        </div>
      </div>

      <div className="px-6 py-4 space-y-3 border-b border-dashed border-[#D4C5B0]">
        {[
          ["Reference",    t.reference],
          ["Gateway",      t.gateway?.toUpperCase()],
          ["Order #",      t.order?.order_number ?? "—"],
          ["Customer",     t.user?.name ?? "—"],
          ["Email",        t.user?.email ?? "—"],
          ["Date",         new Date(t.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between items-start gap-4">
            <span className="text-[9px] text-[#7A6050] uppercase tracking-widest shrink-0">{label}</span>
            <span className="text-[10px] font-bold text-right break-all">{value}</span>
          </div>
        ))}
      </div>

      {t.order?.items && t.order.items.length > 0 && (
        <div className="px-6 py-4 border-b border-dashed border-[#D4C5B0]">
          <p className="text-[9px] text-[#7A6050] uppercase tracking-widest mb-3">Items</p>
          <div className="space-y-2">
            {t.order.items.map((item: { id: number; product_name: string; quantity: number; unit_price: number; total_price: number }) => (
              <div key={item.id} className="flex justify-between text-[10px]">
                <span className="text-[#3A3530]">{item.product_name} <span className="text-[#7A6050]">×{item.quantity}</span></span>
                <span className="font-bold">{formatNGN(item.total_price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 py-4 text-center space-y-1">
        <p className="text-[8px] text-[#7A6050] tracking-widest uppercase">Thank you for shopping with Leviyah</p>
        <p className="text-[7px] text-[#B0A090]">Kubwa, Abuja • leviyah.com</p>
        <div className="flex justify-center gap-1 mt-3">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className={`h-5 w-0.5 bg-[#111111] ${i % 3 === 0 ? "w-1" : ""}`} />
          ))}
        </div>
        <p className="text-[7px] text-[#7A6050] mt-1">{t.reference}</p>
      </div>

      <div className="px-6 pb-5">
        <button
          onClick={() => window.print()}
          className="w-full flex items-center justify-center gap-2 bg-[#111111] text-[#C9A880] py-2.5 text-[10px] font-black tracking-widest uppercase hover:bg-[#1E1A17] transition-colors">
          <Printer className="w-3.5 h-3.5" /> Print Receipt
        </button>
      </div>
    </div>
  );
}

const STATUSES = ["pending", "success", "failed", "refunded"];

export default function TransactionsPage() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("");
  const [viewing,  setViewing]      = useState<Transaction | null>(null);
  const [editing,  setEditing]      = useState<Transaction | null>(null);
  const [deleting, setDeleting]     = useState<Transaction | null>(null);
  const [newStatus, setNewStatus]   = useState("");

  const { data, isLoading } = useQuery<{ transactions: { data: Transaction[] }; summary: Record<string, number> }>({
    queryKey: ["admin", "transactions", { search, filterStatus }],
    queryFn:  () => adminApi.transactions({ search, status: filterStatus }).then((r) => r.data),
  });

  const transactions = data?.transactions?.data ?? [];
  const summary      = data?.summary ?? {};

  const { mutate: updateTxn, isPending: updating } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminApi.updateTransaction(id, { status }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "transactions"] });
      toast.success("Transaction updated.");
      setEditing(null);
    },
    onError: () => toast.error("Update failed."),
  });

  const { mutate: deleteTxn, isPending: delPending } = useMutation({
    mutationFn: (id: number) => adminApi.deleteTransaction(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "transactions"] });
      toast.success("Transaction deleted.");
      setDeleting(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black tracking-wider uppercase text-white flex items-center gap-2.5">
          <CreditCard className="w-5 h-5 text-[#C9A880]" /> Transactions
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue",   value: summary.total,   accent: true },
          { label: "This Month",      value: summary.monthly },
          { label: "Today",           value: summary.today },
          { label: "Pending Amount",  value: summary.pending },
        ].map(({ label, value, accent }) => (
          <div key={label} className={`bg-[#111111] border rounded-none p-4 ${accent ? "border-[#C9A880]/40" : "border-[#2A2520]"}`}>
            <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050]">{label}</p>
            <p className={`text-lg font-black mt-1.5 ${accent ? "text-[#C9A880]" : "text-white"}`}>
              {formatNGN(Number(value ?? 0))}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reference, customer…"
          className="bg-[#111111] border-[#2A2520] text-white placeholder:text-[#3A3530] max-w-72 rounded-none focus-visible:ring-[#C9A880]/30 h-9 text-sm"
        />
        <Select value={filterStatus} onValueChange={(v) => setFilter(v ?? "")}>
          <SelectTrigger className="bg-[#111111] border-[#2A2520] text-white w-44 rounded-none h-9 text-sm">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-[#111111] border-[#2A2520] rounded-none">
            <SelectItem value="" className="text-white text-sm">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-white capitalize text-sm">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-[#111111] border border-[#2A2520] rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#2A2520]">
              <tr>
                {["Reference", "Customer", "Order", "Amount", "Gateway", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] font-black tracking-[0.25em] uppercase text-[#7A6050] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1A17]">
              {isLoading && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[#3A3530] text-xs">Loading…</td></tr>
              )}
              {!isLoading && transactions.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[#3A3530] text-xs">No transactions found.</td></tr>
              )}
              {transactions.map((t) => (
                <tr key={t.id} className="text-gray-300 hover:bg-[#1E1A17]/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-[#C9A880]">{t.reference}</td>
                  <td className="px-4 py-3 text-xs">
                    <p className="text-white font-medium">{t.user?.name ?? "—"}</p>
                    <p className="text-[#7A6050] text-[10px]">{t.user?.email ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-[#7A6050]">{t.order?.order_number ?? "—"}</td>
                  <td className="px-4 py-3 font-bold text-white text-sm">{formatNGN(t.amount)}</td>
                  <td className="px-4 py-3 text-[10px] uppercase text-[#7A6050] tracking-wider">{t.gateway}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-[#7A6050] text-[10px] whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewing(t)}
                        className="w-7 h-7 flex items-center justify-center text-[#7A6050] hover:text-[#C9A880] hover:bg-[#C9A880]/10 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setEditing(t); setNewStatus(t.status); }}
                        className="w-7 h-7 flex items-center justify-center text-[#7A6050] hover:text-white hover:bg-[#2A2520] transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleting(t)}
                        className="w-7 h-7 flex items-center justify-center text-[#7A6050] hover:text-white/60 hover:bg-[#2A2520] transition-colors">
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

      {/* Receipt / View Modal */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-sm">
          {viewing && <Receipt t={viewing} onClose={() => setViewing(null)} />}
        </DialogContent>
      </Dialog>

      {/* Edit Status Modal */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="bg-[#111111] border border-[#2A2520] rounded-none text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xs font-black tracking-[0.3em] uppercase text-[#7A6050]">
              Update Transaction
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-5 pt-2">
              <div className="bg-[#0E0C0A] border border-[#2A2520] p-4 space-y-2">
                <p className="text-[9px] text-[#7A6050] uppercase tracking-widest">Reference</p>
                <p className="font-mono text-[#C9A880] text-sm">{editing.reference}</p>
                <p className="text-[9px] text-[#7A6050] uppercase tracking-widest mt-3">Amount</p>
                <p className="text-white font-bold">{formatNGN(editing.amount)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050] mb-2">New Status</p>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v ?? editing.status)}>
                  <SelectTrigger className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#2A2520] rounded-none">
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="text-white capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="ghost"
                  className="flex-1 border border-[#2A2520] text-[#7A6050] hover:text-white hover:bg-[#1E1A17] rounded-none h-10 text-xs tracking-widest uppercase"
                  onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#C9A880] text-[#111111] hover:bg-white rounded-none h-10 text-xs font-black tracking-widest uppercase"
                  disabled={updating || newStatus === editing.status}
                  onClick={() => updateTxn({ id: editing.id, status: newStatus })}>
                  {updating ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="bg-[#111111] border border-[#2A2520] rounded-none text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xs font-black tracking-[0.3em] uppercase text-[#7A6050]">
              Delete Transaction
            </DialogTitle>
          </DialogHeader>
          {deleting && (
            <div className="space-y-5 pt-2">
              <div className="bg-[#0E0C0A] border border-[#2A2520] p-4">
                <p className="text-xs text-white/70 leading-relaxed">
                  Permanently delete transaction{" "}
                  <span className="font-mono text-[#C9A880]">{deleting.reference}</span>?
                  This cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1 border border-[#2A2520] text-[#7A6050] hover:text-white hover:bg-[#1E1A17] rounded-none h-10 text-xs tracking-widest uppercase"
                  onClick={() => setDeleting(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#2A2520] text-white hover:bg-[#3A3530] rounded-none h-10 text-xs font-black tracking-widest uppercase"
                  disabled={delPending}
                  onClick={() => deleteTxn(deleting.id)}>
                  {delPending ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

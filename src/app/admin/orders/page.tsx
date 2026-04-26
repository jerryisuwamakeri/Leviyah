"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Eye } from "lucide-react";
import toast from "react-hot-toast";
import type { Order, PaginatedResponse } from "@/types";

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}

const statusColors: Record<string, string> = {
  pending:    "bg-[#C9A880]/10 text-[#C9A880]/70 border border-[#C9A880]/20",
  confirmed:  "bg-[#C9A880]/15 text-[#C9A880] border border-[#C9A880]/30",
  processing: "bg-white/5 text-white/60 border border-white/10",
  shipped:    "bg-white/8 text-white/70 border border-white/15",
  delivered:  "bg-[#C9A880]/20 text-[#C9A880] border border-[#C9A880]/40",
  cancelled:  "bg-[#2A2520] text-white/30 border border-[#3A3530]",
  refunded:   "bg-[#1E1A17] text-[#7A6050] border border-[#2A2520]",
};

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("");
  const [page,      setPage]      = useState(1);
  const [detail,    setDetail]    = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [tracking,  setTracking]  = useState("");

  const { data } = useQuery<PaginatedResponse<Order>>({
    queryKey: ["admin", "orders", { search, status, page }],
    queryFn:  () => adminApi.orders({ search, status, page, per_page: 20 }).then((r) =>
      r.data.data ? r.data : { ...r.data, data: r.data }
    ),
  });

  const orders = (data as { data: Order[] })?.data ?? [];

  const { mutate: updateStatus, isPending: updating } = useMutation({
    mutationFn: ({ id, status, tracking }: { id: number; status: string; tracking: string }) =>
      adminApi.updateOrder(id, { status, tracking_number: tracking || undefined }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order updated.");
      setDetail(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black tracking-wider uppercase text-white flex items-center gap-2.5">
          <ShoppingCart className="w-5 h-5 text-[#C9A880]" /> Orders
        </h1>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Order #, customer name…"
          className="bg-[#111111] border-[#2A2520] text-white placeholder:text-[#3A3530] max-w-72 rounded-none h-9 text-sm focus-visible:ring-[#C9A880]/30"
        />
        <Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
          <SelectTrigger className="bg-[#111111] border-[#2A2520] text-white w-44 rounded-none h-9 text-sm">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-[#111111] border-[#2A2520] rounded-none">
            <SelectItem value="" className="text-white text-sm">All Statuses</SelectItem>
            {["pending","confirmed","processing","shipped","delivered","cancelled","refunded"].map((s) => (
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
                {["Order", "Customer", "Items", "Total", "Payment", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] font-black tracking-[0.25em] uppercase text-[#7A6050] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1A17]">
              {orders.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[#3A3530] text-xs">No orders found.</td></tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#1E1A17]/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-[#C9A880]">{o.order_number}</td>
                  <td className="px-4 py-3 text-xs text-white">{o.user?.name ?? "Guest"}</td>
                  <td className="px-4 py-3 text-xs text-[#7A6050]">{o.items?.length ?? 0}</td>
                  <td className="px-4 py-3 font-bold text-white text-sm">{formatNGN(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      o.payment_status === "paid"
                        ? "bg-[#C9A880]/15 text-[#C9A880] border border-[#C9A880]/30"
                        : "bg-[#2A2520] text-[#7A6050] border border-[#3A3530]"
                    }`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusColors[o.status] ?? "bg-[#1E1A17] text-[#7A6050]"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#7A6050] text-[10px] whitespace-nowrap">
                    {new Date(o.created_at).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setDetail(o); setNewStatus(o.status); setTracking(o.tracking_number ?? ""); }}
                      className="w-7 h-7 flex items-center justify-center text-[#7A6050] hover:text-[#C9A880] hover:bg-[#C9A880]/10 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="bg-[#111111] border border-[#2A2520] rounded-none text-white max-w-2xl max-h-[80vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 border-b border-[#2A2520]">
            <p className="text-[9px] font-black tracking-[0.35em] uppercase text-[#7A6050]">Order Detail</p>
            <DialogTitle className="text-sm font-black text-white mt-0.5">{detail?.order_number}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs bg-[#0E0C0A] border border-[#2A2520] p-4">
                {[
                  ["Customer",       detail.user?.name ?? "Guest"],
                  ["Total",          formatNGN(detail.total)],
                  ["Payment Method", detail.payment_method],
                  ["Payment Status", detail.payment_status],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[9px] text-[#7A6050] uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-white font-bold">{value}</p>
                  </div>
                ))}
              </div>

              {detail.items && detail.items.length > 0 && (
                <div>
                  <p className="text-[9px] font-black tracking-[0.3em] uppercase text-[#7A6050] mb-3">Items</p>
                  <div className="space-y-2">
                    {detail.items.map((item) => (
                      <div key={item.id} className="flex justify-between bg-[#0E0C0A] border border-[#2A2520] p-3">
                        <div>
                          <p className="text-white text-xs font-medium">{item.product_name}</p>
                          {item.variant_info && <p className="text-[#7A6050] text-[10px] mt-0.5">{item.variant_info}</p>}
                        </div>
                        <p className="text-[#C9A880] font-bold text-xs">{item.quantity} × {formatNGN(item.unit_price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 border-t border-[#2A2520] pt-5">
                <div>
                  <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050] mb-2">Update Status</p>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v ?? "")}>
                    <SelectTrigger className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#2A2520] rounded-none">
                      {["pending","confirmed","processing","shipped","delivered","cancelled","refunded"].map((s) => (
                        <SelectItem key={s} value={s} className="text-white capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050] mb-2">Tracking Number</p>
                  <Input
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder:text-[#3A3530] rounded-none h-10"
                    placeholder="Optional…"
                  />
                </div>
                <Button
                  className="w-full bg-[#C9A880] text-[#111111] hover:bg-white rounded-none h-10 text-[10px] font-black tracking-widest uppercase"
                  disabled={updating}
                  onClick={() => updateStatus({ id: detail.id, status: newStatus, tracking })}>
                  {updating ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

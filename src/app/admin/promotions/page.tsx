"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tag, Plus, Trash2, Power, Zap, Percent } from "lucide-react";
import toast from "react-hot-toast";

interface Promotion {
  id: number;
  name: string;
  type: "opening" | "discount" | "stocks";
  description?: string;
  percentage: number;
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
  creator?: { id: number; name: string };
}

const typeLabels: Record<string, string> = {
  opening:  "Opening Promo",
  discount: "Discount Promo",
  stocks:   "Stocks Promo",
};

const defaultForm = { name: "", type: "discount" as const, description: "", percentage: "", starts_at: "", ends_at: "" };

export default function PromotionsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const { data } = useQuery<{ promotions: Promotion[]; active_percentage: number }>({
    queryKey: ["admin", "promotions"],
    queryFn:  () => api.get("/admin/promotions").then((r) => r.data),
  });

  const promotions    = data?.promotions ?? [];
  const activePercent = data?.active_percentage ?? 0;

  const { mutate: createPromo, isPending: creating } = useMutation({
    mutationFn: (d: unknown) => api.post("/admin/promotions", d).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "promotions"] });
      toast.success("Promotion created!");
      setOpen(false);
      setForm(defaultForm);
    },
    onError: () => toast.error("Failed to create promotion."),
  });

  const { mutate: togglePromo } = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/promotions/${id}/toggle`).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["admin", "promotions"] }),
  });

  const { mutate: deletePromo } = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/promotions/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "promotions"] });
      toast.success("Promotion deleted.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.percentage) { toast.error("Name and percentage are required."); return; }
    createPromo({
      ...form,
      percentage: parseFloat(form.percentage),
      starts_at:  form.starts_at || null,
      ends_at:    form.ends_at   || null,
    });
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-wider uppercase text-white flex items-center gap-2.5">
            <Tag className="w-5 h-5 text-[#C9A880]" /> Promotions
          </h1>
          <p className="text-[11px] text-[#7A6050] mt-1">
            When active, a promotion reduces all product prices by its percentage.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-[#C9A880] text-[#111111] px-4 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-white transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Promotion
        </button>
      </div>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#111111] border border-[#2A2520] rounded-none text-white max-w-lg p-0">
          <DialogHeader className="px-6 py-4 border-b border-[#2A2520]">
            <p className="text-[9px] font-black tracking-[0.35em] uppercase text-[#7A6050]">Promotions</p>
            <DialogTitle className="text-sm font-black text-white mt-0.5">Create Promotion</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050] mb-1.5">
                Promotion Name <span className="text-[#C9A880]">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder:text-[#3A3530] rounded-none h-10 focus-visible:ring-[#C9A880]/30"
                placeholder="e.g. Grand Opening Sale"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050] mb-1.5">
                Type
              </label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as typeof form.type })}>
                <SelectTrigger className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#2A2520] rounded-none">
                  <SelectItem value="opening"  className="text-white">Opening Promotion</SelectItem>
                  <SelectItem value="discount" className="text-white">Discount Promotion</SelectItem>
                  <SelectItem value="stocks"   className="text-white">Stocks Promo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050] mb-1.5">
                <span className="inline-flex items-center gap-1"><Percent className="w-3 h-3" /> Discount Percentage (%)</span>
                <span className="text-[#C9A880] ml-0.5">*</span>
              </label>
              <Input
                value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                type="number" min="0.01" max="100" step="0.01"
                className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder:text-[#3A3530] rounded-none h-10 focus-visible:ring-[#C9A880]/30"
                placeholder="e.g. 20"
                required
              />
              {form.percentage && (
                <p className="text-[9px] text-[#C9A880]/70 mt-1.5">
                  All product prices will drop by {form.percentage}% when active.
                </p>
              )}
            </div>

            <div>
              <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050] mb-1.5">
                Description <span className="text-[#3A3530]">(optional)</span>
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder:text-[#3A3530] rounded-none resize-none focus-visible:ring-[#C9A880]/30"
                rows={2}
                placeholder="Brief promo description…"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050] mb-1.5">
                  Starts At <span className="text-[#3A3530]">(optional)</span>
                </label>
                <Input
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  type="datetime-local"
                  className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10 focus-visible:ring-[#C9A880]/30"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050] mb-1.5">
                  Ends At <span className="text-[#3A3530]">(optional)</span>
                </label>
                <Input
                  value={form.ends_at}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  type="datetime-local"
                  className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10 focus-visible:ring-[#C9A880]/30"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 border border-[#2A2520] text-[#7A6050] hover:text-white hover:bg-[#1E1A17] rounded-none h-10 text-[10px] tracking-widest uppercase"
                onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#C9A880] text-[#111111] hover:bg-white rounded-none h-10 text-[10px] font-black tracking-widest uppercase"
                disabled={creating}>
                {creating ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Active banner */}
      {activePercent > 0 && (
        <div className="bg-[#C9A880]/10 border border-[#C9A880]/30 p-4 flex items-center gap-3">
          <Zap className="w-4 h-4 text-[#C9A880] shrink-0" />
          <div>
            <p className="text-[#C9A880] font-bold text-sm">Active Promotion: {activePercent}% off all products</p>
            <p className="text-[#C9A880]/50 text-[11px] mt-0.5">All storefront prices are currently discounted.</p>
          </div>
        </div>
      )}

      {/* Promotions list */}
      {promotions.length === 0 ? (
        <div className="text-center py-16 text-[#3A3530]">
          <Tag className="w-10 h-10 mx-auto mb-4 opacity-30" />
          <p className="text-sm">No promotions yet. Create one to start a sale.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => (
            <div key={promo.id}
              className={`bg-[#111111] border p-5 flex items-center gap-5 transition-all ${
                promo.is_active ? "border-[#C9A880]/50" : "border-[#2A2520]"
              }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap mb-1">
                  <h3 className="font-bold text-white text-sm">{promo.name}</h3>
                  <span className="text-[8px] font-black tracking-[0.3em] uppercase px-2 py-0.5 bg-[#C9A880]/10 text-[#C9A880]/70 border border-[#C9A880]/20">
                    {typeLabels[promo.type]}
                  </span>
                  {promo.is_active && (
                    <span className="text-[8px] font-black tracking-[0.3em] uppercase px-2 py-0.5 bg-[#C9A880] text-[#111111]">
                      ACTIVE
                    </span>
                  )}
                </div>
                {promo.description && (
                  <p className="text-[11px] text-[#7A6050] mb-2">{promo.description}</p>
                )}
                <div className="flex items-center gap-4 text-[10px] text-[#7A6050]">
                  <span className="text-[20px] font-black text-[#C9A880] leading-none">{promo.percentage}% OFF</span>
                  {promo.starts_at && <span>From {new Date(promo.starts_at).toLocaleDateString()}</span>}
                  {promo.ends_at   && <span>Until {new Date(promo.ends_at).toLocaleDateString()}</span>}
                  {promo.creator   && <span>By {promo.creator.name}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => togglePromo(promo.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black tracking-widest uppercase transition-colors border ${
                    promo.is_active
                      ? "border-[#C9A880]/30 text-[#C9A880]/70 hover:text-[#7A6050] hover:border-[#2A2520]"
                      : "border-[#2A2520] text-[#7A6050] hover:text-[#C9A880] hover:border-[#C9A880]/30"
                  }`}>
                  <Power className="w-3 h-3" />
                  {promo.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => { if (confirm("Delete this promotion?")) deletePromo(promo.id); }}
                  className="w-8 h-8 flex items-center justify-center text-[#7A6050] hover:text-white/50 hover:bg-[#2A2520] transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Plus, Pencil, Trash2, Search, Eye, EyeOff, Tag } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import type { Product, Category } from "@/types";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}
function imgUrl(p?: string | null) {
  if (!p) return null;
  return p.startsWith("http") ? p : `${STORAGE}/${p}`;
}

const emptyForm = {
  name: "", category_id: "", short_description: "", description: "",
  base_price: "", sale_price: "", stock_quantity: "0",
  product_type: "simple", has_variants: false, is_active: true, is_featured: false,
};

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [search,     setSearch]     = useState("");
  const [categoryF,  setCategoryF]  = useState("");
  const [page,       setPage]       = useState(1);
  const [tab,        setTab]        = useState<"products" | "categories">("products");
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem,   setEditItem]   = useState<Product | null>(null);
  const [catOpen,    setCatOpen]    = useState(false);
  const [catForm,    setCatForm]    = useState({ name: "", description: "" });
  const [form,       setForm]       = useState({ ...emptyForm });
  const [thumbnail,  setThumbnail]  = useState<File | null>(null);

  /* ── Queries ── */
  const { data, isLoading } = useQuery<{ data: Product[]; last_page: number; total: number }>({
    queryKey: ["admin", "products", { search, category_id: categoryF, page }],
    queryFn: () => adminApi.products({ search, category_id: categoryF || undefined, page, per_page: 20 }).then((r) => r.data),
  });

  const { data: catData } = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: () => fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/admin/products/categories`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("lvy_token")}`, Accept: "application/json" } }
    ).then((r) => r.json()),
  });

  const products   = data?.data ?? [];
  const categories = Array.isArray(catData) ? catData : [];

  /* ── Mutations ── */
  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== "" && v !== null) fd.append(k, String(v)); });
    if (thumbnail) fd.append("thumbnail", thumbnail);
    return fd;
  };

  const { mutate: createProduct, isPending: creating } = useMutation({
    mutationFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/admin/products`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("lvy_token")}`, Accept: "application/json" },
      body: buildFormData(),
    }).then((r) => r.json()),
    onSuccess: (d) => {
      if (d.id) { toast.success("Product created!"); qc.invalidateQueries({ queryKey: ["admin", "products"] }); setCreateOpen(false); setForm({ ...emptyForm }); setThumbnail(null); }
      else toast.error(d.message ?? "Failed.");
    },
  });

  const { mutate: updateProduct, isPending: updating } = useMutation({
    mutationFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/admin/products/${editItem!.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("lvy_token")}`, Accept: "application/json" },
      body: buildFormData(),
    }).then((r) => r.json()),
    onSuccess: (d) => {
      if (d.id) { toast.success("Product updated!"); qc.invalidateQueries({ queryKey: ["admin", "products"] }); setEditItem(null); }
      else toast.error(d.message ?? "Failed.");
    },
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: (p: Product) => adminApi.updateProduct(p.id, { is_active: !p.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "products"] }); toast.success("Deleted."); },
  });

  const { mutate: createCategory, isPending: creatingCat } = useMutation({
    mutationFn: (d: unknown) => fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/admin/products/categories`,
      { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("lvy_token")}`, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) }
    ).then((r) => r.json()),
    onSuccess: (d) => {
      if (d.id) { toast.success("Category created!"); qc.invalidateQueries({ queryKey: ["admin", "categories"] }); setCatOpen(false); setCatForm({ name: "", description: "" }); }
      else toast.error(d.message ?? "Failed.");
    },
  });

  const openCreate = () => { setForm({ ...emptyForm }); setThumbnail(null); setCreateOpen(true); };
  const openEdit   = (p: Product) => {
    setForm({
      name: p.name, category_id: String(p.category_id),
      short_description: p.short_description ?? "",
      description: p.description ?? "",
      base_price: String(p.base_price), sale_price: p.sale_price ? String(p.sale_price) : "",
      stock_quantity: String(p.stock_quantity),
      product_type: p.product_type, has_variants: p.has_variants,
      is_active: p.is_active, is_featured: p.is_featured,
    });
    setThumbnail(null);
    setEditItem(p);
  };

  const F = (key: string) => ({
    value: (form as Record<string, unknown>)[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const isOpen   = createOpen || !!editItem;
  const onClose  = () => { setCreateOpen(false); setEditItem(null); };
  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); editItem ? updateProduct() : createProduct(); };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Manage</p>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
            <Package className="w-5 h-5 text-[#C9A880]" /> Products
          </h1>
        </div>
        {tab === "products"
          ? <button onClick={openCreate} className="flex items-center gap-2 bg-[#C9A880] text-[#111111] px-4 py-2.5 text-[10px] font-black tracking-widest uppercase hover:bg-white transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Product
            </button>
          : <button onClick={() => setCatOpen(true)} className="flex items-center gap-2 bg-[#C9A880] text-[#111111] px-4 py-2.5 text-[10px] font-black tracking-widest uppercase hover:bg-white transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Category
            </button>
        }
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2A2520]">
        {[{ id: "products", label: "Products", icon: Package }, { id: "categories", label: "Categories", icon: Tag }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as typeof tab)}
            className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black tracking-widest uppercase border-b-2 transition-colors ${
              tab === id ? "border-[#C9A880] text-[#C9A880]" : "border-transparent text-[#7A6050] hover:text-white"
            }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Categories tab */}
      {tab === "categories" && (
        <>
          <div className="bg-[#111111] border border-[#2A2520] rounded-none overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-[#2A2520]">
                <tr>
                  {["Name", "Slug", "Products", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[9px] font-black tracking-[0.25em] uppercase text-[#7A6050]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1A17]">
                {categories.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[#3A3530] text-xs">No categories yet.</td></tr>
                )}
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-[#1E1A17]/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-white text-xs">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-[#7A6050]">{c.slug}</td>
                    <td className="px-4 py-3 text-xs text-[#7A6050]">{(c as { products_count?: number }).products_count ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#C9A880]/15 text-[#C9A880] border border-[#C9A880]/30">Active</span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-[#7A6050]">Built-in</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* New Category Dialog */}
          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogContent className="bg-[#111111] border border-[#2A2520] rounded-none text-white max-w-md p-0">
              <DialogHeader className="px-6 py-4 border-b border-[#2A2520]">
                <DialogTitle className="text-sm font-black text-white">New Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createCategory(catForm); }} className="px-6 py-5 space-y-4">
                <div>
                  <Label className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] mb-1.5 block">Name <span className="text-[#C9A880]">*</span></Label>
                  <Input value={catForm.name} onChange={(e) => setCatForm(f => ({ ...f, name: e.target.value }))} required
                    placeholder="e.g. Fragrances" className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10 focus-visible:ring-[#C9A880]/30" />
                </div>
                <div>
                  <Label className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] mb-1.5 block">Description</Label>
                  <Input value={catForm.description} onChange={(e) => setCatForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Optional description" className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10 focus-visible:ring-[#C9A880]/30" />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="ghost" onClick={() => setCatOpen(false)}
                    className="flex-1 border border-[#2A2520] text-[#7A6050] hover:text-white hover:bg-[#1E1A17] rounded-none h-10 text-[10px] tracking-widest uppercase">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingCat}
                    className="flex-1 bg-[#C9A880] text-[#111111] hover:bg-white rounded-none h-10 text-[10px] font-black tracking-widest uppercase">
                    {creatingCat ? "Creating…" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      {tab === "products" && (<>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7A6050]" />
          <Input value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products…"
            className="pl-8 bg-[#111111] border-[#2A2520] text-white placeholder-[#7A6050] rounded-none h-10" />
        </div>
        <Select value={categoryF} onValueChange={(v) => { setCategoryF(v ?? ""); setPage(1); }}>
          <SelectTrigger className="w-44 bg-[#111111] border-[#2A2520] text-white rounded-none h-10">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-[#111111] border-[#2A2520]">
            <SelectItem value="" className="text-white">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)} className="text-white">{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-[#2A2520]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2520]">
                {["Product", "Category", "Price", "Stock", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[9px] font-bold tracking-widest uppercase text-[#7A6050]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1A17]">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-[#1E1A17] animate-pulse rounded" /></td></tr>
                  ))
                : products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#0E0C0A] transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-[#1E1A17] shrink-0 overflow-hidden relative">
                            {imgUrl(p.thumbnail) ? (
                              <Image src={imgUrl(p.thumbnail)!} alt={p.name} fill className="object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Package className="w-4 h-4 text-[#7A6050]" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-xs truncate max-w-48">{p.name}</p>
                            <p className="text-[#7A6050] text-[10px] mt-0.5">{p.has_variants ? "Variable" : "Simple"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#7A6050] text-xs">{p.category?.name ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-white font-bold text-xs">{formatNGN(Number(p.base_price))}</p>
                        {p.sale_price && <p className="text-[#C9A880] text-[10px]">{formatNGN(Number(p.sale_price))}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-bold ${p.stock_quantity <= 5 ? "text-[#C9A880]/60" : "text-white"}`}>
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 ${p.is_active ? "bg-[#C9A880]/20 text-[#C9A880]" : "bg-[#2A2520] text-[#7A6050]"}`}>
                          {p.is_active ? "Active" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(p)}
                            className="w-7 h-7 bg-[#1E1A17] flex items-center justify-center hover:bg-[#C9A880]/20 transition-colors">
                            <Pencil className="w-3 h-3 text-[#C9A880]" />
                          </button>
                          <button onClick={() => toggleActive(p)}
                            className="w-7 h-7 bg-[#1E1A17] flex items-center justify-center hover:bg-[#C9A880]/20 transition-colors">
                            {p.is_active ? <EyeOff className="w-3 h-3 text-[#7A6050]" /> : <Eye className="w-3 h-3 text-[#7A6050]" />}
                          </button>
                          <button onClick={() => { if (confirm("Delete this product?")) deleteProduct(p.id); }}
                            className="w-7 h-7 bg-[#1E1A17] flex items-center justify-center hover:bg-[#2A2520] transition-colors">
                            <Trash2 className="w-3 h-3 text-[#7A6050]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#2A2520]">
            <p className="text-[10px] text-[#7A6050]">{data.total} products</p>
            <div className="flex gap-1">
              {Array.from({ length: data.last_page }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-7 h-7 text-[10px] font-bold transition-colors ${n === page ? "bg-[#C9A880] text-[#111111]" : "bg-[#1E1A17] text-[#7A6050] hover:text-white"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="bg-[#111111] border-[#2A2520] text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-black tracking-wide">
              {editItem ? "Edit Product" : "New Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-[#7A6050] text-[10px] font-bold tracking-widest uppercase">Product Name *</Label>
                <Input {...F("name")} className="mt-1.5 bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10" required />
              </div>

              <div>
                <Label className="text-[#7A6050] text-[10px] font-bold tracking-widest uppercase">Category *</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm((f) => ({ ...f, category_id: v ?? "" }))}>
                  <SelectTrigger className="mt-1.5 bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#2A2520]">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)} className="text-white">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#7A6050] text-[10px] font-bold tracking-widest uppercase">Product Type</Label>
                <Select value={form.product_type} onValueChange={(v) => setForm((f) => ({ ...f, product_type: v ?? "simple", has_variants: v === "variable" }))}>
                  <SelectTrigger className="mt-1.5 bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#2A2520]">
                    <SelectItem value="simple"   className="text-white">Simple</SelectItem>
                    <SelectItem value="variable" className="text-white">Variable (with variants)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#7A6050] text-[10px] font-bold tracking-widest uppercase">Base Price (₦) *</Label>
                <Input type="number" min="0" step="0.01" {...F("base_price")}
                  className="mt-1.5 bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10" required />
              </div>

              <div>
                <Label className="text-[#7A6050] text-[10px] font-bold tracking-widest uppercase">Sale Price (₦)</Label>
                <Input type="number" min="0" step="0.01" {...F("sale_price")}
                  className="mt-1.5 bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10" />
              </div>

              <div>
                <Label className="text-[#7A6050] text-[10px] font-bold tracking-widest uppercase">Stock Quantity</Label>
                <Input type="number" min="0" {...F("stock_quantity")}
                  className="mt-1.5 bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10" />
              </div>

              <div>
                <Label className="text-[#7A6050] text-[10px] font-bold tracking-widest uppercase">Thumbnail Image</Label>
                <input type="file" accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                  className="mt-1.5 w-full text-[#7A6050] text-xs file:mr-3 file:bg-[#C9A880] file:text-[#111111] file:border-0 file:px-3 file:py-1.5 file:text-[9px] file:font-bold file:tracking-widest file:uppercase cursor-pointer" />
              </div>

              <div className="col-span-2">
                <Label className="text-[#7A6050] text-[10px] font-bold tracking-widest uppercase">Short Description</Label>
                <Input {...F("short_description")}
                  className="mt-1.5 bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10"
                  placeholder="One-line summary shown on product cards…" />
              </div>

              <div className="col-span-2">
                <Label className="text-[#7A6050] text-[10px] font-bold tracking-widest uppercase">Full Description</Label>
                <Textarea value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1.5 bg-[#0E0C0A] border-[#2A2520] text-white rounded-none resize-none" rows={3} />
              </div>

              <div className="col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="accent-[#C9A880]" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Active (visible on store)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured}
                    onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                    className="accent-[#C9A880]" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Featured</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-[#2A2520]">
              <button type="submit" disabled={creating || updating}
                className="flex-1 bg-[#C9A880] text-[#111111] h-10 text-[10px] font-black tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-50">
                {creating || updating ? "Saving…" : editItem ? "Save Changes" : "Create Product"}
              </button>
              <button type="button" onClick={onClose}
                className="px-6 border border-[#2A2520] text-[#7A6050] text-[10px] font-bold tracking-widest uppercase hover:border-[#C9A880] hover:text-[#C9A880] transition-colors h-10">
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </>)} {/* end tab === products */}
    </div>
  );
}

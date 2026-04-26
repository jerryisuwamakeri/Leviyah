"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { shopApi } from "@/lib/api";
import ProductCard from "@/components/shop/ProductCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Product, PaginatedResponse, Category } from "@/types";

export default function ShopPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const sp     = useSearchParams();
  const router = useRouter();

  const [search,   setSearch]   = useState(sp.get("search") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "");
  const [sort,     setSort]     = useState(sp.get("sort") ?? "newest");
  const [page,     setPage]     = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", { search, category, sort, page }],
    queryFn: () => shopApi.products({ search, category, sort, page, per_page: 16 }).then((r) => r.data),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => shopApi.categories().then((r) => r.data),
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (search)            params.set("search", search);
    if (category)          params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    router.replace(`/shop?${params.toString()}`, { scroll: false });
    setPage(1);
  }, [search, category, sort]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-[#E8D8C4] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mb-2">Leviyah</p>
          <h1 className="text-4xl font-black text-[#111111]">All Products</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A090]" />
            <Input value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-9 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" />
          </div>

          <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
            <SelectTrigger className="w-full sm:w-44 border-[#E8D8C4] rounded-none h-11">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v ?? "newest")}>
            <SelectTrigger className="w-full sm:w-44 border-[#E8D8C4] rounded-none h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low → High</SelectItem>
              <SelectItem value="price_desc">Price: High → Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#F5EAD8] animate-pulse" />
            ))}
          </div>
        ) : (data?.data ?? []).length === 0 ? (
          <div className="text-center py-24 text-[#B8A090]">
            <p className="text-sm font-semibold">No products found.</p>
            <p className="text-xs mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-[#B8A090] mb-6">
              {data?.total} products
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {data?.data.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {data && data.last_page > 1 && (
              <div className="flex justify-center gap-1 mt-12">
                {Array.from({ length: data.last_page }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-9 h-9 text-xs font-bold transition-colors ${n === page ? "bg-[#111111] text-white" : "bg-white border border-[#E8D8C4] text-[#7A6050] hover:border-[#C9A880]"}`}>
                    {n}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopApi, cartApi } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import Image from "next/image";
import { useState } from "react";
import { ShoppingBag, Star, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import toast from "react-hot-toast";
import type { Product } from "@/types";

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}
function imgUrl(p?: string | null) {
  if (!p) return null;
  return p.startsWith("http") ? p : null;
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const qc = useQueryClient();
  const { setCart, openCart } = useCartStore();

  const [imgIdx,         setImgIdx]         = useState(0);
  const [selectedColor,  setSelectedColor]  = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | null>(null);
  const [qty,            setQty]            = useState(1);

  const { data, isLoading } = useQuery<{ product: Product; related: Product[] }>({
    queryKey: ["product", slug],
    queryFn: () => shopApi.productBySlug(slug).then((r) => r.data),
  });

  const product = data?.product;
  const related = data?.related ?? [];

  const colors  = [...new Set(product?.variants?.map((v) => v.color).filter(Boolean) as string[])];
  const lengths = [...new Set(
    product?.variants
      ?.filter((v) => !selectedColor || v.color === selectedColor)
      .map((v) => v.length)
      .filter(Boolean) as string[]
  )].sort((a, b) => parseInt(a) - parseInt(b));

  const selectedVariant = product?.variants?.find(
    (v) => (!selectedColor || v.color === selectedColor) && (!selectedLength || v.length === selectedLength)
  ) ?? null;

  const price   = selectedVariant?.effective_price ?? product?.effective_price ?? product?.base_price ?? 0;
  const inStock = selectedVariant ? selectedVariant.stock_quantity > 0 : (product?.stock_quantity ?? 0) > 0;

  const { mutate: addToCart, isPending } = useMutation({
    mutationFn: () => cartApi.add({
      product_id: product!.id,
      product_variant_id: selectedVariant?.id,
      quantity: qty,
    }).then((r) => r.data),
    onSuccess: (d) => {
      setCart(d);
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
      openCart();
    },
    onError: () => toast.error("Could not add to cart."),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="aspect-[4/5] bg-[#F5EAD8] animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 bg-[#F5EAD8] animate-pulse w-1/3" />
            <div className="h-8 bg-[#F5EAD8] animate-pulse" />
            <div className="h-10 bg-[#F5EAD8] animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="text-center py-24 text-[#7A6050]">Product not found.</div>;

  const images    = product.images ?? [];
  const currentImg = imgUrl(images[imgIdx]?.url ?? product.thumbnail ?? null);

  return (
    <div className="bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="text-[10px] font-semibold tracking-widest uppercase text-[#B8A090] mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#C9A880] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#C9A880] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#111111]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-20">

          {/* ── Images ──────────────────────────────────── */}
          <div className="space-y-3">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#F5EAD8]">
              {currentImg ? (
                <Image src={currentImg} alt={product.name} fill
                  className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ShoppingBag className="w-16 h-16 text-[#C9A880]/30" />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 flex items-center justify-center hover:bg-white transition-all shadow-sm">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setImgIdx((i) => Math.min(images.length - 1, i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 flex items-center justify-center hover:bg-white transition-all shadow-sm">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setImgIdx(i)}
                    className={`relative w-16 h-20 overflow-hidden shrink-0 border-2 transition-all ${i === imgIdx ? "border-[#C9A880]" : "border-transparent hover:border-[#E8D8C4]"}`}>
                    {imgUrl(img.url) && (
                      <Image src={imgUrl(img.url)!} alt="" fill className="object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ─────────────────────────────────── */}
          <div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mb-3">
              {product.category?.name}
            </p>
            <h1 className="text-2xl lg:text-3xl font-black text-[#111111] leading-tight">{product.name}</h1>

            {product.average_rating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.average_rating) ? "fill-[#C9A880] text-[#C9A880]" : "text-[#E8D8C4] fill-[#E8D8C4]"}`} />
                ))}
                <span className="text-xs text-[#7A6050]">({product.average_rating.toFixed(1)})</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mt-5 pb-5 border-b border-[#E8D8C4]">
              <span className="text-3xl font-black text-[#111111]">{formatNGN(price)}</span>
              {product.sale_price && (
                <span className="text-base line-through text-[#B8A090]">{formatNGN(product.base_price)}</span>
              )}
            </div>

            {product.short_description && (
              <p className="text-sm text-[#7A6050] mt-5 leading-relaxed">{product.short_description}</p>
            )}

            {/* Color */}
            {colors.length > 0 && (
              <div className="mt-6">
                <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#111111] mb-3">
                  Color: <span className="text-[#C9A880]">{selectedColor ?? "Select"}</span>
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {colors.map((color) => {
                    const v = product.variants?.find((vv) => vv.color === color);
                    return (
                      <button key={color}
                        onClick={() => { setSelectedColor(color === selectedColor ? null : color); setSelectedLength(null); }}
                        className={`flex items-center justify-center gap-2 px-3 py-3 border text-[10px] font-bold tracking-widest uppercase transition-all w-full ${selectedColor === color ? "border-[#111111] bg-[#111111] text-white" : "border-[#E8D8C4] text-[#7A6050] hover:border-[#C9A880]"}`}>
                        {v?.color_hex && (
                          <span className="w-3 h-3 rounded-full shrink-0 border border-black/10" style={{ background: v.color_hex }} />
                        )}
                        <span className="truncate">{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Length */}
            {lengths.length > 0 && (
              <div className="mt-5">
                <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#111111] mb-3">
                  Length: <span className="text-[#C9A880]">{selectedLength ?? "Select"}</span>
                </p>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {lengths.map((length) => (
                    <button key={length}
                      onClick={() => setSelectedLength(length === selectedLength ? null : length)}
                      className={`py-3 border text-[10px] font-bold tracking-wide uppercase transition-all text-center ${selectedLength === length ? "border-[#111111] bg-[#111111] text-white" : "border-[#E8D8C4] text-[#7A6050] hover:border-[#C9A880]"}`}>
                      {length}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mt-7">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 border border-[#E8D8C4] flex items-center justify-center hover:border-[#C9A880] transition-colors">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-black text-lg">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}
                className="w-10 h-10 border border-[#E8D8C4] flex items-center justify-center hover:border-[#C9A880] transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to cart */}
            <button
              onClick={() => addToCart()}
              disabled={isPending || !inStock || (product.has_variants && !selectedVariant)}
              className="mt-5 w-full h-14 bg-[#111111] text-white text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              {!inStock
                ? "Out of Stock"
                : isPending
                ? "Adding…"
                : product.has_variants && !selectedVariant
                ? "Select Options First"
                : "Add to Cart"}
            </button>

            {product.description && (
              <div className="mt-8 border-t border-[#E8D8C4] pt-6 text-sm text-[#7A6050] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }} />
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20 border-t border-[#E8D8C4] pt-12">
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mb-2">More Like This</p>
            <h2 className="text-xl font-black text-[#111111] mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

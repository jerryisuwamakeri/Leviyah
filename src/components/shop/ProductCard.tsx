"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star, Plus } from "lucide-react";
import { cartApi } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Product } from "@/types";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}

function buildImgUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : `${STORAGE}/${raw}`;
}

export default function ProductCard({ product, promoPct = 0 }: { product: Product; promoPct?: number }) {
  const qc = useQueryClient();
  const { setCart } = useCartStore();

  const basePrice   = product.effective_price ?? product.base_price;
  const displayPrice = promoPct > 0 ? basePrice * (1 - promoPct / 100) : basePrice;
  const isOnSale     = !!product.sale_price || promoPct > 0;

  const img = buildImgUrl(product.primary_image?.url ?? product.thumbnail ?? null);

  const { mutate: addToCart, isPending } = useMutation({
    mutationFn: () => cartApi.add({ product_id: product.id, quantity: 1 }).then((r) => r.data),
    onSuccess: (data) => {
      setCart(data);
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: () => toast.error("Could not add to cart."),
  });

  return (
    <div className="group relative bg-white border border-[#E8D8C4] hover:border-[#C9A880] transition-all duration-300 hover:shadow-lg">
      {/* Image */}
      <Link href={`/shop/${product.slug}`} className="block aspect-[3/4] relative overflow-hidden bg-[#F5EAD8]">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ShoppingBag className="w-10 h-10 text-[#C9A880]/40" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isOnSale && (
            <span className="bg-[#111111] text-white text-[9px] font-bold tracking-widest uppercase px-2 py-1">
              Sale
            </span>
          )}
          {product.is_featured && (
            <span className="bg-[#C9A880] text-[#111111] text-[9px] font-bold tracking-widest uppercase px-2 py-1">
              Featured
            </span>
          )}
        </div>

        {/* Quick add overlay */}
        {!product.has_variants && product.stock_quantity > 0 && (
          <button
            onClick={(e) => { e.preventDefault(); addToCart(); }}
            disabled={isPending}
            className="absolute bottom-0 inset-x-0 bg-[#111111]/90 text-white py-3 text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            {isPending ? "Adding…" : "Quick Add"}
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-[9px] font-semibold tracking-widest uppercase text-[#C9A880] mb-1">
          {product.category?.name}
        </p>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-sm font-semibold text-[#111111] line-clamp-1 hover:text-[#C9A880] transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.average_rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-2.5 h-2.5 ${i < Math.round(product.average_rating) ? "fill-[#C9A880] text-[#C9A880]" : "text-[#E8D8C4] fill-[#E8D8C4]"}`} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-[#111111]">{formatNGN(displayPrice)}</span>
            {isOnSale && (
              <span className="text-xs line-through text-[#B8A090]">{formatNGN(product.base_price)}</span>
            )}
          </div>

          {product.has_variants ? (
            <Link href={`/shop/${product.slug}`}
              className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] border border-[#E8D8C4] px-2.5 py-1.5 hover:border-[#C9A880] hover:text-[#C9A880] transition-colors">
              Options
            </Link>
          ) : (
            <button
              onClick={() => addToCart()}
              disabled={isPending || product.stock_quantity === 0}
              className="text-[9px] font-bold tracking-widest uppercase bg-[#111111] text-white px-2.5 py-1.5 hover:bg-[#C9A880] hover:text-[#111111] transition-colors disabled:opacity-40"
            >
              {product.stock_quantity === 0 ? "Sold Out" : isPending ? "…" : "Add"}
            </button>
          )}
        </div>

        {product.has_variants && (
          <p className="text-[9px] text-[#B8A090] mt-1.5 tracking-wide">
            Multiple options available
          </p>
        )}
      </div>
    </div>
  );
}

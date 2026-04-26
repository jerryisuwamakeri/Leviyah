"use client";

import { useCartStore } from "@/store/cart";
import { cartApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { CartItem } from "@/types";
import toast from "react-hot-toast";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}

function buildImg(raw?: string | null) {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : `${STORAGE}/${raw}`;
}

function CartItemRow({ item }: { item: CartItem }) {
  const qc = useQueryClient();
  const { setCart } = useCartStore();

  const updateMutation = useMutation({
    mutationFn: (qty: number) => cartApi.update(item.id, { quantity: qty }).then((r) => r.data),
    onSuccess: (d) => { setCart(d); qc.invalidateQueries({ queryKey: ["cart"] }); },
  });

  const removeMutation = useMutation({
    mutationFn: () => cartApi.remove(item.id).then((r) => r.data),
    onSuccess: (d) => { setCart(d.cart ?? d); qc.invalidateQueries({ queryKey: ["cart"] }); toast.success("Removed"); },
  });

  const img = buildImg(item.variant?.image ?? item.product?.thumbnail);

  return (
    <div className="flex gap-3 py-4 border-b border-[#E8D8C4] last:border-0">
      <div className="relative w-16 h-20 rounded overflow-hidden bg-[#F5EAD8] shrink-0">
        {img ? (
          <Image src={img} alt={item.product?.name ?? "product"} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ShoppingBag className="w-5 h-5 text-[#C9A880]/40" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#111111] truncate">{item.product?.name}</p>
        {item.variant && (
          <p className="text-[10px] text-[#7A6050] mt-0.5">{item.variant.label}</p>
        )}
        <p className="text-sm font-black text-[#111111] mt-1">{formatNGN(item.unit_price)}</p>

        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => item.quantity > 1 && updateMutation.mutate(item.quantity - 1)}
            className="w-6 h-6 border border-[#E8D8C4] flex items-center justify-center hover:border-[#C9A880] transition-colors">
            <Minus className="w-2.5 h-2.5" />
          </button>
          <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
          <button onClick={() => updateMutation.mutate(item.quantity + 1)}
            className="w-6 h-6 border border-[#E8D8C4] flex items-center justify-center hover:border-[#C9A880] transition-colors">
            <Plus className="w-2.5 h-2.5" />
          </button>
          <button onClick={() => removeMutation.mutate()}
            className="ml-auto text-[#B8A090] hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { isOpen, closeCart, cart } = useCartStore();
  const items = cart?.items ?? [];

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white border-l border-[#E8D8C4]">
        <SheetHeader className="border-b border-[#E8D8C4] pb-4">
          <SheetTitle className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#111111]">
            <ShoppingBag className="w-4 h-4 text-[#C9A880]" />
            Your Cart ({(cart as {item_count?: number})?.item_count ?? items.reduce((s, i) => s + i.quantity, 0)})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[#B8A090]">
            <ShoppingBag className="w-14 h-14 opacity-20" />
            <p className="text-xs font-semibold tracking-widest uppercase">Your cart is empty</p>
            <Link href="/shop" onClick={closeCart}
              className="text-[10px] font-bold tracking-widest uppercase border border-[#E8D8C4] text-[#111111] px-5 py-2.5 hover:border-[#C9A880] transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6">
              {items.map((item) => <CartItemRow key={item.id} item={item} />)}
            </div>

            <div className="border-t border-[#E8D8C4] pt-4 space-y-3">
              {cart?.coupon_code && (
                <div className="flex justify-between text-xs text-[#C9A880] font-semibold">
                  <span>Discount ({cart.coupon_code})</span>
                  <span>−{formatNGN(Number((cart as {discount_amount?: number})?.discount_amount ?? 0))}</span>
                </div>
              )}
              <div className="flex justify-between text-[#111111]">
                <span className="text-xs font-bold tracking-widest uppercase">Total</span>
                <span className="text-lg font-black">
                  {formatNGN(Number((cart as {total?: number})?.total ?? items.reduce((s, i) => s + i.unit_price * i.quantity, 0)))}
                </span>
              </div>
              <Link href="/checkout" onClick={closeCart}
                className="block w-full bg-[#111111] text-white text-center py-4 text-[10px] font-bold tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors">
                Checkout
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Package, ArrowRight, ShoppingBag } from "lucide-react";
import type { Order } from "@/types";

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}

const STATUS_COLOR: Record<string, string> = {
  delivered:  "bg-[#C9A880] text-[#111111]",
  pending:    "bg-[#111111] text-white",
  confirmed:  "bg-[#111111] text-white",
  processing: "bg-[#111111] text-white",
  shipped:    "bg-[#111111] text-white",
  cancelled:  "bg-[#E8D8C4] text-[#7A6050]",
  refunded:   "bg-[#E8D8C4] text-[#7A6050]",
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login?redirect=/account/orders");
  }, [isAuthenticated, router]);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: () => orderApi.list().then((r) => r.data?.data ?? r.data),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        <div className="mb-8">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mb-1">Account</p>
          <h1 className="text-2xl font-black text-[#111111]">My Orders</h1>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#F5EAD8] animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (!orders || orders.length === 0) && (
          <div className="bg-white border border-[#E8D8C4] p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-[#C9A880]/40 mx-auto mb-4" strokeWidth={1} />
            <p className="text-sm font-semibold text-[#111111] mb-1">No orders yet</p>
            <p className="text-xs text-[#B8A090] mb-6">Start shopping to see your orders here.</p>
            <Link href="/shop"
              className="inline-flex items-center gap-2 bg-[#111111] text-white px-6 h-11 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors">
              Shop Now
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {orders?.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`}
              className="block bg-white border border-[#E8D8C4] hover:border-[#C9A880] transition-colors p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-mono font-bold text-[#111111] truncate">{order.order_number}</p>
                  <p className="text-[10px] text-[#B8A090] mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                    {" · "}{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[8px] font-black tracking-widest uppercase px-2.5 py-1 ${STATUS_COLOR[order.status] ?? "bg-[#E8D8C4] text-[#7A6050]"}`}>
                    {order.status}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C9A880]" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5EAD8]">
                <div className="flex -space-x-1">
                  {order.items?.slice(0, 4).map((item) => (
                    <div key={item.id} className="w-8 h-9 bg-[#F5EAD8] border border-white overflow-hidden shrink-0">
                      {item.thumbnail && item.thumbnail.startsWith("http") ? (
                        <img src={item.thumbnail} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-3 h-3 text-[#C9A880]/40 m-auto mt-2" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-black text-[#111111]">{formatNGN(order.total)}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/account"
            className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] transition-colors">
            ← Back to Account
          </Link>
        </div>
      </div>
    </div>
  );
}

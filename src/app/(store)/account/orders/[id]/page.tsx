"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowLeft, MapPin, CreditCard } from "lucide-react";
import type { Order } from "@/types";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <React.Suspense>
      <OrderDetail params={params} />
    </React.Suspense>
  );
}

function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = React.use(params);
  const sp      = useSearchParams();
  const isNew   = sp.get("new") === "1";

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => orderApi.get(Number(id)).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-[#F5EAD8] animate-pulse" />)}
      </div>
    );
  }
  if (!order) return <div className="text-center py-24 text-[#7A6050]">Order not found.</div>;

  const statusIdx  = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled" || order.status === "refunded";

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Success banner for new orders */}
        {isNew && (
          <div className="bg-[#C9A880] p-6 text-center">
            <CheckCircle className="w-10 h-10 text-[#111111] mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-lg font-black text-[#111111]">Order Placed!</p>
            <p className="text-[#111111]/70 text-sm mt-1">
              Thank you for shopping with Leviyah. We&apos;ll process your order shortly.
            </p>
          </div>
        )}

        {/* Order header */}
        <div className="bg-white border border-[#E8D8C4] p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Order</p>
            <p className="text-lg font-black text-[#111111] font-mono">{order.order_number}</p>
            <p className="text-xs text-[#7A6050] mt-0.5">{new Date(order.created_at).toLocaleDateString("en-NG", { dateStyle: "full" })}</p>
          </div>
          <span className={`text-[9px] font-black tracking-widest uppercase px-3 py-1.5 ${
            order.status === "delivered" ? "bg-[#C9A880] text-[#111111]" :
            isCancelled                  ? "bg-[#E8D8C4] text-[#7A6050]" :
            "bg-[#111111] text-white"
          }`}>
            {order.status}
          </span>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="bg-white border border-[#E8D8C4] p-5">
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mb-4">Order Progress</p>
            <div className="flex items-center">
              {STATUS_STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 flex items-center justify-center border-2 transition-colors ${
                      i <= statusIdx ? "bg-[#111111] border-[#111111]" : "border-[#E8D8C4]"
                    }`}>
                      {i < statusIdx
                        ? <CheckCircle className="w-3.5 h-3.5 text-[#C9A880]" />
                        : i === statusIdx
                        ? <div className="w-2 h-2 bg-[#C9A880]" />
                        : <div className="w-2 h-2 bg-[#E8D8C4]" />
                      }
                    </div>
                    <p className={`text-[8px] font-bold tracking-widest uppercase mt-1.5 text-center ${
                      i <= statusIdx ? "text-[#111111]" : "text-[#B8A090]"
                    }`}>{s}</p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-1 ${i < statusIdx ? "bg-[#111111]" : "bg-[#E8D8C4]"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white border border-[#E8D8C4]">
          <div className="px-5 py-3.5 border-b border-[#E8D8C4]">
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Items Ordered</p>
          </div>
          <div className="divide-y divide-[#F5EAD8]">
            {order.items?.map((item) => {
              const thumb = item.thumbnail ? (item.thumbnail.startsWith("http") ? item.thumbnail : `${STORAGE}/${item.thumbnail}`) : null;
              return (
                <div key={item.id} className="flex gap-4 px-5 py-4">
                  <div className="w-14 h-16 bg-[#F5EAD8] shrink-0 overflow-hidden">
                    {thumb ? <img src={thumb} alt={item.product_name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-[#C9A880]/40 m-auto mt-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111111]">{item.product_name}</p>
                    {item.variant_info && <p className="text-xs text-[#B8A090]">{item.variant_info}</p>}
                    <p className="text-xs text-[#7A6050] mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-black text-[#111111] shrink-0">{formatNGN(item.total_price)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Shipping address */}
          {order.shipping_address && (
            <div className="bg-white border border-[#E8D8C4] p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-3.5 h-3.5 text-[#C9A880]" />
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Delivery Address</p>
              </div>
              <p className="text-sm font-semibold text-[#111111]">
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </p>
              <p className="text-xs text-[#7A6050] mt-0.5">{order.shipping_address.address_line1}</p>
              <p className="text-xs text-[#7A6050]">{order.shipping_address.city}, {order.shipping_address.state}</p>
              <p className="text-xs text-[#7A6050]">{order.shipping_address.phone}</p>
            </div>
          )}

          {/* Payment & totals */}
          <div className="bg-white border border-[#E8D8C4] p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-3.5 h-3.5 text-[#C9A880]" />
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Payment</p>
            </div>
            <p className="text-sm font-semibold text-[#111111] capitalize mb-3">
              {order.payment_method?.replace("_", " ")} —{" "}
              <span className={order.payment_status === "paid" ? "text-[#C9A880]" : "text-[#7A6050]"}>
                {order.payment_status}
              </span>
            </p>
            <div className="space-y-1.5 text-xs border-t border-[#F5EAD8] pt-3">
              <div className="flex justify-between text-[#7A6050]">
                <span>Subtotal</span><span>{formatNGN(order.subtotal)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-[#C9A880]">
                  <span>Discount</span><span>−{formatNGN(Number(order.discount_amount))}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-[#111111] pt-1">
                <span>Total</span><span>{formatNGN(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/account/orders"
            className="flex items-center gap-2 border border-[#E8D8C4] text-[#7A6050] px-5 h-11 text-[10px] font-bold tracking-widest uppercase hover:border-[#C9A880] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> My Orders
          </Link>
          <Link href="/shop"
            className="flex-1 bg-[#111111] text-white h-11 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors flex items-center justify-center">
            Continue Shopping
          </Link>
        </div>

        {order.notes && (
          <p className="text-xs text-[#B8A090] text-center">{order.notes}</p>
        )}
      </div>
    </div>
  );
}

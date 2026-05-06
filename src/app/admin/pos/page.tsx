"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Scan, Plus, Minus, Trash2, CreditCard, Banknote,
  Building2, ShoppingBag, X, Search, Check, Printer,
  ZapIcon,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import type { Product, ProductVariant } from "@/types";
import { BrowserMultiFormatReader } from "@zxing/browser";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", maximumFractionDigits: 0,
  }).format(v);
}
function imgUrl(p?: string | null) {
  if (!p) return null;
  return p.startsWith("http") ? p : `${STORAGE}/${p}`;
}

interface PosItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
}

/* ── QR Scanner Modal ───────────────────────────────────── */
function QRScannerModal({
  onScan, onClose,
}: {
  onScan: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();

    reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
      if (result) onScan(result.getText());
    }).then((controls) => {
      controlsRef.current = controls;
    }).catch(() => setError("Camera access denied. Please allow camera permissions."));

    return () => {
      controlsRef.current?.stop();
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#2A2520] w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2520]">
          <div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Point of Sale</p>
            <p className="text-sm font-black text-white mt-0.5">Scan Product</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-[#1E1A17] flex items-center justify-center hover:bg-[#C9A880]/20 transition-colors">
            <X className="w-3.5 h-3.5 text-[#7A6050]" />
          </button>
        </div>

        {/* Camera */}
        <div className="relative bg-black aspect-square">
          {error ? (
            <div className="flex items-center justify-center h-full text-center px-6">
              <p className="text-sm text-[#C9A880]/70">{error}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" />
              {/* Targeting reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C9A880]" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C9A880]" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C9A880]" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C9A880]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-[#C9A880]/50 animate-pulse" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4">
          <p className="text-[10px] text-[#7A6050] text-center">
            Point camera at product QR code or barcode
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Receipt Modal ──────────────────────────────────────── */
function ReceiptModal({
  order, change, onClose,
}: {
  order: { order_number: string; total: number; items: PosItem[]; payment_method: string };
  change: number;
  onClose: () => void;
}) {
  const now = new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xs font-mono shadow-2xl">

        {/* Header */}
        <div className="bg-[#111111] px-5 py-5 text-center">
          <p className="text-[#C9A880] text-xl font-black tracking-[0.4em] uppercase">Leviyah</p>
          <p className="text-white/40 text-[8px] tracking-[0.3em] uppercase mt-1">Beauty & Hair — POS Sale</p>
          <p className="text-white/20 text-[8px] mt-2 leading-relaxed">
            Plot K78 Suntan Dasuki Way PW Road<br />Kubwa, Abuja
          </p>
        </div>

        {/* Jagged edge */}
        <div className="flex bg-[#111111]">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex-1 h-2 bg-white" style={{ clipPath: i % 2 === 0 ? "polygon(0 100%,50% 0,100% 100%)" : "none" }} />
          ))}
        </div>

        {/* Order info */}
        <div className="px-5 pt-4 pb-3 text-center border-b border-dashed border-[#E0D0BC]">
          <p className="text-[8px] text-[#7A6050] tracking-widest uppercase">Order</p>
          <p className="text-[11px] font-black text-[#111111] mt-0.5">#{order.order_number}</p>
          <p className="text-[8px] text-[#7A6050] mt-1">{now}</p>
        </div>

        {/* Items */}
        <div className="px-5 py-4 space-y-2.5 border-b border-dashed border-[#E0D0BC]">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between gap-2 text-[10px]">
              <div className="flex-1 min-w-0">
                <p className="truncate font-bold text-[#111111]">{item.product.name}</p>
                {item.variant && <p className="text-[#7A6050] text-[9px]">{item.variant.label}</p>}
                <p className="text-[#7A6050]">×{item.quantity} @ {formatNGN(item.unitPrice)}</p>
              </div>
              <p className="font-black text-[#111111] shrink-0">{formatNGN(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-5 py-4 space-y-2 border-b border-dashed border-[#E0D0BC]">
          <div className="flex justify-between text-[11px] font-black text-[#111111]">
            <span>TOTAL</span>
            <span>{formatNGN(order.total)}</span>
          </div>
          <div className="flex justify-between text-[9px] text-[#7A6050]">
            <span>Payment</span>
            <span className="uppercase font-bold text-[#111111]">{order.payment_method}</span>
          </div>
          {change > 0 && (
            <div className="flex justify-between text-[10px] font-black text-[#C9A880]">
              <span>Change</span>
              <span>{formatNGN(change)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 text-center bg-[#FAFAFA]">
          <p className="text-[9px] text-[#C9A880] font-black tracking-[0.3em] uppercase">Thank you!</p>
          <p className="text-[7px] text-[#B0A090] mt-1">Plot K78 Suntan Dasuki Way PW Road, Kubwa Abuja</p>
          <div className="flex justify-center gap-px mt-3">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className={`bg-[#111111] ${[1,3].includes(i % 5) ? "w-0.5" : "w-px"} ${i % 3 === 0 ? "h-7" : "h-5"}`} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 border-t border-[#E0D0BC]">
          <button onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 py-3.5 text-[10px] font-black tracking-widest uppercase text-[#7A6050] hover:bg-[#F5EAD8] transition-colors border-r border-[#E0D0BC]">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button onClick={onClose}
            className="flex items-center justify-center gap-1.5 py-3.5 text-[10px] font-black tracking-widest uppercase bg-[#C9A880] text-[#111111] hover:bg-[#111111] hover:text-[#C9A880] transition-colors">
            <Check className="w-3.5 h-3.5" /> Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main POS Page ──────────────────────────────────────── */
export default function POSPage() {
  const [search,       setSearch]       = useState("");
  const [items,        setItems]        = useState<PosItem[]>([]);
  const [payMethod,    setPayMethod]    = useState("cash");
  const [amountGiven,  setAmountGiven]  = useState("");
  const [discount,     setDiscount]     = useState("0");
  const [customerName, setCustomerName] = useState("");
  const [scanning,     setScanning]     = useState(false);
  const [barcodeVal,   setBarcodeVal]   = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [receipt,      setReceipt]      = useState<{
    order_number: string; total: number; items: PosItem[]; payment_method: string;
  } | null>(null);
  const [receiptChange, setReceiptChange] = useState(0);

  /* ── Products ── */
  const { data: products } = useQuery<Product[]>({
    queryKey: ["pos-products", search],
    queryFn: () => adminApi.posProducts({ search }).then((r) => r.data),
  });

  /* ── Cart helpers ── */
  const addItem = useCallback((product: Product, variant?: ProductVariant) => {
    const unitPrice = variant
      ? Number(variant.sale_price ?? variant.price)
      : Number(product.sale_price ?? product.base_price);

    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.product.id === product.id && i.variant?.id === variant?.id
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, variant, quantity: 1, unitPrice }];
    });
    toast.success(`${product.name} added`, { duration: 1200 });
  }, []);

  const updateQty = (idx: number, qty: number) => {
    if (qty <= 0) setItems((p) => p.filter((_, i) => i !== idx));
    else setItems((p) => p.map((item, i) => i === idx ? { ...item, quantity: qty } : item));
  };

  /* ── QR / Barcode scan handler ── */
  const handleScan = useCallback(async (code: string) => {
    setScanning(false);
    setBarcodeVal("");
    const trimmed = code.trim();
    if (!trimmed) return;
    try {
      const { data: product } = await adminApi.barcodeSearch(trimmed);
      addItem(product);
    } catch {
      toast.error(`No product found for: ${trimmed}`);
    }
  }, [addItem]);

  /* ── Physical scanner: global keydown buffer ── */
  useEffect(() => {
    const buffer = { val: "", timer: null as ReturnType<typeof setTimeout> | null };
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Enter") {
        if (buffer.val.length >= 3) void handleScan(buffer.val);
        buffer.val = "";
        if (buffer.timer) clearTimeout(buffer.timer);
      } else if (e.key.length === 1) {
        buffer.val += e.key;
        if (buffer.timer) clearTimeout(buffer.timer);
        buffer.timer = setTimeout(() => { buffer.val = ""; }, 100);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleScan]);

  /* ── Totals ── */
  const subtotal    = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discountAmt = parseFloat(discount) || 0;
  const total       = Math.max(0, subtotal - discountAmt);
  const change      = payMethod === "cash" && amountGiven
    ? Math.max(0, parseFloat(amountGiven) - total) : 0;

  /* ── Process sale ── */
  const { mutate: processSale, isPending } = useMutation({
    mutationFn: () => adminApi.posSale({
      items: items.map((i) => ({
        product_id: i.product.id,
        variant_id: i.variant?.id,
        quantity: i.quantity,
      })),
      payment_method:  payMethod,
      amount_tendered: payMethod === "cash" ? parseFloat(amountGiven) || total : total,
      discount_amount: discountAmt,
      customer_name:   customerName || undefined,
    }).then((r) => r.data),
    onSuccess: (data) => {
      setReceiptChange(data.change ?? change);
      setReceipt({
        order_number:   data.order.order_number,
        total:          data.order.total,
        items:          [...items],
        payment_method: payMethod,
      });
      setItems([]);
      setDiscount("0");
      setAmountGiven("");
      setCustomerName("");
    },
    onError: () => toast.error("Sale failed. Please try again."),
  });

  const paymentMethods = [
    { val: "cash",          label: "Cash",    icon: Banknote  },
    { val: "pos",           label: "POS Card", icon: CreditCard },
    { val: "bank_transfer", label: "Transfer", icon: Building2 },
  ];

  return (
    <>
      {scanning && (
        <QRScannerModal onScan={handleScan} onClose={() => setScanning(false)} />
      )}
      {receipt && (
        <ReceiptModal
          order={receipt}
          change={receiptChange}
          onClose={() => setReceipt(null)}
        />
      )}

      <div className="flex flex-col xl:flex-row gap-4 h-full min-h-[calc(100vh-5rem)]">

        {/* ── LEFT: Product catalogue ──────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Search + scan bar */}
          <div className="bg-[#111111] border border-[#2A2520] p-4 space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7A6050]" />
                <Input
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  placeholder="Search products by name or SKU…"
                  className="pl-9 bg-[#0E0C0A] border-[#2A2520] text-white placeholder-[#3A3530] rounded-none h-10"
                />
              </div>
              <button
                onClick={() => setScanning(true)}
                className="flex items-center gap-2 bg-[#C9A880] text-[#111111] px-4 h-10 text-[10px] font-black tracking-widest uppercase hover:bg-white transition-colors whitespace-nowrap">
                <Scan className="w-4 h-4" />
                Scan QR
              </button>
            </div>
            {/* Physical barcode scanner input */}
            <div className="relative">
              <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7A6050]" />
              <Input
                ref={barcodeRef}
                value={barcodeVal}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBarcodeVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { void handleScan(barcodeVal); e.preventDefault(); } }}
                placeholder="Scan barcode here (or type barcode + Enter)…"
                className="pl-9 bg-[#0E0C0A] border-[#2A2520] border-dashed text-white placeholder-[#3A3530] rounded-none h-9 text-xs"
              />
            </div>
          </div>

          {/* Product grid */}
          <div className="bg-[#111111] border border-[#2A2520] flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-[#2A2520]">
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#7A6050]">
                Products ({products?.length ?? 0})
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {!products?.length ? (
                <div className="flex flex-col items-center justify-center h-40 text-[#3A3530]">
                  <ShoppingBag className="w-8 h-8 mb-2" />
                  <p className="text-xs">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                  {products.map((p) => {
                    const thumb = imgUrl(p.thumbnail);
                    return (
                      <button
                        key={p.id}
                        onClick={() => addItem(p)}
                        disabled={p.stock_quantity === 0 && !p.has_variants}
                        className="bg-[#0E0C0A] border border-[#2A2520] hover:border-[#C9A880] transition-all group text-left disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {/* Image */}
                        <div className="aspect-square relative overflow-hidden bg-[#1E1A17]">
                          {thumb ? (
                            <Image src={thumb} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ShoppingBag className="w-6 h-6 text-[#3A3530]" />
                            </div>
                          )}
                          {/* QR label overlay */}
                          <div className="absolute top-1.5 left-1.5">
                            <span className="bg-[#111111]/80 text-[#C9A880] text-[8px] font-bold px-1.5 py-0.5">
                              LVY-{p.id}
                            </span>
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-2.5">
                          <p className="text-[10px] font-semibold text-white truncate leading-snug">{p.name}</p>
                          <p className="text-xs font-black text-[#C9A880] mt-1">
                            {formatNGN(Number(p.sale_price ?? p.base_price))}
                          </p>
                          {p.has_variants && (
                            <p className="text-[9px] text-[#7A6050] mt-0.5">Multiple variants</p>
                          )}
                          {!p.has_variants && (
                            <p className={`text-[9px] mt-0.5 ${p.stock_quantity <= 5 ? "text-[#C9A880]/60" : "text-[#7A6050]"}`}>
                              Stock: {p.stock_quantity}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Sale panel ──────────────────────── */}
        <div className="xl:w-80 2xl:w-96 shrink-0 flex flex-col gap-3">

          {/* Order items */}
          <div className="bg-[#111111] border border-[#2A2520] flex flex-col" style={{ minHeight: "220px", maxHeight: "calc(100vh - 400px)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2520]">
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#7A6050]">
                Current Sale ({items.length} items)
              </p>
              {items.length > 0 && (
                <button onClick={() => setItems([])}
                  className="text-[9px] font-bold uppercase tracking-widest text-[#7A6050] hover:text-[#C9A880] transition-colors">
                  Clear
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#1E1A17]">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-[#3A3530]">
                  <ZapIcon className="w-6 h-6 mb-1.5" />
                  <p className="text-xs">Scan or tap a product</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 px-4 py-3">
                    {/* Thumbnail */}
                    <div className="w-9 h-9 bg-[#1E1A17] shrink-0 overflow-hidden relative">
                      {imgUrl(item.product.thumbnail) ? (
                        <Image src={imgUrl(item.product.thumbnail)!} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#3A3530]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-white truncate">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-[9px] text-[#7A6050]">{item.variant.label}</p>
                      )}
                      <p className="text-[10px] text-[#C9A880] font-bold">
                        {formatNGN(item.unitPrice)}
                      </p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateQty(idx, item.quantity - 1)}
                        className="w-5 h-5 bg-[#1E1A17] flex items-center justify-center hover:bg-[#2A2520] transition-colors">
                        <Minus className="w-2.5 h-2.5 text-[#7A6050]" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <button onClick={() => updateQty(idx, item.quantity + 1)}
                        className="w-5 h-5 bg-[#1E1A17] flex items-center justify-center hover:bg-[#2A2520] transition-colors">
                        <Plus className="w-2.5 h-2.5 text-[#7A6050]" />
                      </button>
                      <button onClick={() => updateQty(idx, 0)}
                        className="w-5 h-5 ml-0.5 flex items-center justify-center hover:text-[#C9A880] transition-colors">
                        <Trash2 className="w-2.5 h-2.5 text-[#3A3530]" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Totals + discount */}
          <div className="bg-[#111111] border border-[#2A2520] p-4 space-y-3">
            <div className="flex justify-between text-xs text-[#7A6050]">
              <span>Subtotal</span>
              <span className="text-white font-semibold">{formatNGN(subtotal)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] whitespace-nowrap">Discount ₦</span>
              <Input
                value={discount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscount(e.target.value)}
                type="number" min="0"
                className="h-7 text-xs text-right bg-[#0E0C0A] border-[#2A2520] text-white rounded-none"
              />
            </div>

            {discountAmt > 0 && (
              <div className="flex justify-between text-xs text-[#C9A880]">
                <span>Discount</span>
                <span>−{formatNGN(discountAmt)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline border-t border-[#2A2520] pt-3">
              <span className="text-[10px] font-black tracking-widest uppercase text-white">Total</span>
              <span className="text-xl font-black text-[#C9A880]">{formatNGN(total)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-[#111111] border border-[#2A2520] p-4 space-y-3">
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#7A6050]">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map(({ val, label, icon: Icon }) => (
                <button
                  key={val}
                  onClick={() => setPayMethod(val)}
                  className={`flex flex-col items-center gap-1.5 py-3 border text-[9px] font-black tracking-widest uppercase transition-all ${
                    payMethod === val
                      ? "border-[#C9A880] bg-[#C9A880]/10 text-[#C9A880]"
                      : "border-[#2A2520] text-[#7A6050] hover:border-[#7A6050]"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {label}
                </button>
              ))}
            </div>

            {payMethod === "cash" && (
              <div>
                <p className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] mb-1.5">Amount Tendered</p>
                <Input
                  value={amountGiven}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmountGiven(e.target.value)}
                  type="number" placeholder="0"
                  className="bg-[#0E0C0A] border-[#2A2520] text-white rounded-none h-10"
                />
                {amountGiven && parseFloat(amountGiven) >= total && (
                  <p className="text-[#C9A880] text-xs font-bold mt-1.5">
                    Change: {formatNGN(change)}
                  </p>
                )}
              </div>
            )}

            <Input
              value={customerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
              placeholder="Customer name (optional)"
              className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder-[#3A3530] rounded-none h-9 text-xs"
            />

            <button
              onClick={() => processSale()}
              disabled={items.length === 0 || isPending}
              className="w-full bg-[#C9A880] text-[#111111] h-12 text-[10px] font-black tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isPending ? (
                "Processing…"
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Complete Sale · {formatNGN(total)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

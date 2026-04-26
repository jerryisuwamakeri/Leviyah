"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi, orderApi } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingBag, CreditCard, MessageCircle,
  ChevronRight, Lock, Check, ArrowLeft, UserCircle, User,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Cart } from "@/types";

const STORAGE      = process.env.NEXT_PUBLIC_STORAGE_URL      ?? "http://localhost:8000/storage";
const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_KEY     ?? "";
const WA_NUMBER    = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER  ?? "";

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}
function imgSrc(p?: string | null) {
  if (!p) return null;
  return p.startsWith("http") ? p : `${STORAGE}/${p}`;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (opts: {
        key: string; email: string; amount: number; ref: string; currency: string;
        callback: (res: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

const PAYMENT_METHODS = [
  { val: "paystack",  label: "Pay with Paystack",   desc: "Card, bank transfer, USSD — secured by Paystack",            icon: CreditCard   },
  { val: "whatsapp",  label: "Order via WhatsApp",   desc: "Send your order details directly to us on WhatsApp",         icon: MessageCircle },
];

type Step = "identity" | "address" | "payment" | "review" | "confirmed";

export default function CheckoutPage() {
  const router            = useRouter();
  const qc                = useQueryClient();
  const { setCart }       = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const [step,          setStep]         = useState<Step>("identity");
  const [isGuest,       setIsGuest]      = useState(false);
  const [guestEmail,    setGuestEmail]   = useState("");
  const [payMethod,     setPayMethod]    = useState("paystack");
  const [paystackReady, setPsReady]      = useState(false);
  const [notes,         setNotes]        = useState("");
  const [confirmed,     setConfirmed]    = useState<{ order_number: string; total: number } | null>(null);

  const [address, setAddress] = useState({
    first_name: "", last_name: "", phone: "",
    address_line1: "", address_line2: "",
    city: "", state: "", country: "Nigeria", postal_code: "",
  });

  /* skip identity step if already logged in */
  useEffect(() => {
    if (isAuthenticated) setStep("address");
  }, [isAuthenticated]);

  /* Paystack inline script */
  useEffect(() => {
    if (document.getElementById("ps-script")) { setPsReady(true); return; }
    const s = document.createElement("script");
    s.id = "ps-script";
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    s.onload = () => setPsReady(true);
    document.body.appendChild(s);
  }, []);

  const { data: cart } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn:  () => cartApi.get().then((r) => r.data),
  });

  const items    = cart?.items ?? [];
  const subtotal = Number((cart as { subtotal?: number })?.subtotal ?? 0);
  const discount = Number((cart as { discount_amount?: number })?.discount_amount ?? 0);
  const total    = Number((cart as { total?: number })?.total ?? 0);

  const clearCart = () => {
    setCart({ items: [], item_count: 0, subtotal: 0, total: 0, discount_amount: 0 } as unknown as Cart);
    qc.invalidateQueries({ queryKey: ["cart"] });
  };

  const payerEmail = isAuthenticated ? (user?.email ?? "") : guestEmail;

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: () => orderApi.checkout({
      shipping_address: address,
      payment_method:   payMethod,
      guest_email:      isAuthenticated ? undefined : guestEmail || undefined,
      guest_name:       isAuthenticated ? undefined : `${address.first_name} ${address.last_name}`.trim() || undefined,
      notes:            notes || undefined,
    }).then((r) => r.data),

    onSuccess: (data) => {
      const order = data.order;

      if (payMethod === "whatsapp") {
        clearCart();
        const itemLines = order.items
          .map((it: { product_name: string; quantity: number; unit_price: number }) =>
            `• ${it.product_name} ×${it.quantity} — ${formatNGN(it.unit_price * it.quantity)}`
          ).join("\n");

        const msg = encodeURIComponent(
          `Hello Leviyah! 👋\n\nI'd like to place this order:\n\n${itemLines}\n\n` +
          `Total: *${formatNGN(total)}*\n` +
          `Order #: ${order.order_number}\n\n` +
          `Delivery to:\n${address.first_name} ${address.last_name}\n` +
          `${address.address_line1}, ${address.city}, ${address.state}\n` +
          `📞 ${address.phone}${notes ? `\n\nNote: ${notes}` : ""}`
        );

        window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");

        if (isAuthenticated) {
          router.push(`/account/orders/${order.id}?new=1`);
        } else {
          setConfirmed({ order_number: order.order_number, total });
          setStep("confirmed");
        }
        return;
      }

      if (payMethod === "paystack") {
        if (!paystackReady || !window.PaystackPop) {
          toast.error("Paystack is not ready. Please try again.");
          return;
        }
        const handler = window.PaystackPop.setup({
          key:      PAYSTACK_KEY,
          email:    payerEmail,
          amount:   Math.round(total * 100),
          ref:      data.payment_reference,
          currency: "NGN",
          callback: (res) => {
            orderApi.verifyPayment(order.id, res.reference)
              .then(() => {
                clearCart();
                toast.success("Payment confirmed!");
                if (isAuthenticated) {
                  router.push(`/account/orders/${order.id}?new=1`);
                } else {
                  setConfirmed({ order_number: order.order_number, total });
                  setStep("confirmed");
                }
              })
              .catch(() => toast.error("Verification failed. Contact support with order: " + order.order_number));
          },
          onClose: () => toast("Payment cancelled."),
        });
        handler.openIframe();
        return;
      }

      clearCart();
      if (isAuthenticated) {
        router.push(`/account/orders/${order.id}?new=1`);
      } else {
        setConfirmed({ order_number: order.order_number, total });
        setStep("confirmed");
      }
    },

    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Failed to place order.");
    },
  });

  if (items.length === 0 && step !== "confirmed") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShoppingBag className="w-12 h-12 text-[#C9A880] mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-black text-[#111111] mb-2">Your cart is empty</h2>
          <p className="text-sm text-[#7A6050] mb-6">Add some products before checking out.</p>
          <Link href="/shop" className="inline-block bg-[#111111] text-white px-8 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  /* ── Guest order confirmed screen ── */
  if (step === "confirmed" && confirmed) {
    return (
      <div className="min-h-screen bg-[#F5EAD8] flex items-center justify-center px-4">
        <div className="bg-white border border-[#E8D8C4] max-w-md w-full p-8 text-center">
          <div className="w-14 h-14 bg-[#C9A880] flex items-center justify-center mx-auto mb-5">
            <Check className="w-7 h-7 text-[#111111]" />
          </div>
          <p className="text-[9px] font-black tracking-[0.4em] uppercase text-[#C9A880] mb-2">Order Placed</p>
          <h2 className="text-2xl font-black text-[#111111]">Thank you!</h2>
          <p className="text-sm text-[#7A6050] mt-3 mb-6">
            Your order has been received. We'll contact you on WhatsApp or via the phone number provided to arrange delivery.
          </p>
          <div className="bg-[#F5EAD8] border border-[#E8D8C4] p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#7A6050] uppercase tracking-widest text-[9px] font-bold">Order Number</span>
              <span className="font-black text-[#111111] font-mono">{confirmed.order_number}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#7A6050] uppercase tracking-widest text-[9px] font-bold">Total</span>
              <span className="font-black text-[#111111]">{formatNGN(confirmed.total)}</span>
            </div>
          </div>
          <p className="text-[10px] text-[#B8A090] mb-6">
            Save your order number for reference. Create an account to track all future orders.
          </p>
          <div className="flex gap-3">
            <Link href="/shop" className="flex-1 border border-[#E8D8C4] text-[#7A6050] h-11 flex items-center justify-center text-[10px] font-bold tracking-widest uppercase hover:border-[#C9A880] transition-colors">
              Shop More
            </Link>
            <Link href="/register" className="flex-1 bg-[#111111] text-white h-11 flex items-center justify-center text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const STEPS = isAuthenticated
    ? [{ id: "address", label: "Address" }, { id: "payment", label: "Payment" }, { id: "review", label: "Review" }]
    : [{ id: "identity", label: "You" }, { id: "address", label: "Address" }, { id: "payment", label: "Payment" }, { id: "review", label: "Review" }];

  const stepIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-[#F5EAD8]">
      <div className="bg-white border-b border-[#E8D8C4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-black tracking-widest uppercase text-[#111111]">Leviyah</Link>
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <div className={`flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase ${
                  s.id === step ? "text-[#111111]" : i < stepIdx ? "text-[#C9A880]" : "text-[#B8A090]"
                }`}>
                  <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-black border transition-colors ${
                    i < stepIdx   ? "bg-[#C9A880] border-[#C9A880] text-[#111111]" :
                    s.id === step ? "border-[#111111] text-[#111111]" : "border-[#E8D8C4] text-[#B8A090]"
                  }`}>
                    {i < stepIdx ? <Check className="w-2.5 h-2.5" /> : i + 1}
                  </span>
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-[#E8D8C4]" />}
              </div>
            ))}
          </div>
          <Link href="/shop" className="flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-5">

            {/* ── Step: Identity (guest only) ── */}
            {step === "identity" && (
              <div className="bg-white border border-[#E8D8C4]">
                <div className="px-6 py-4 border-b border-[#E8D8C4]">
                  <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Step 1</p>
                  <h2 className="text-lg font-black text-[#111111] mt-0.5">How would you like to continue?</h2>
                </div>
                <div className="p-6 space-y-3">
                  {/* Sign in option */}
                  <Link href={`/login?redirect=/checkout`}
                    className="flex items-center gap-4 p-4 border border-[#E8D8C4] hover:border-[#C9A880] transition-all group">
                    <div className="w-12 h-12 bg-[#111111] flex items-center justify-center shrink-0">
                      <UserCircle className="w-5 h-5 text-[#C9A880]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-[#111111]">Sign In to My Account</p>
                      <p className="text-[11px] text-[#7A6050] mt-0.5">Track orders, save addresses, faster checkout</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#B8A090] group-hover:text-[#C9A880] transition-colors" />
                  </Link>

                  {/* Guest option */}
                  <button
                    onClick={() => { setIsGuest(true); }}
                    className={`w-full flex items-center gap-4 p-4 border text-left transition-all ${
                      isGuest ? "border-[#111111] bg-[#F5EAD8]" : "border-[#E8D8C4] hover:border-[#C9A880]"
                    }`}>
                    <div className={`w-12 h-12 flex items-center justify-center shrink-0 ${isGuest ? "bg-[#C9A880]" : "bg-[#F5EAD8]"}`}>
                      <User className={`w-5 h-5 ${isGuest ? "text-[#111111]" : "text-[#7A6050]"}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-[#111111]">Continue as Guest</p>
                      <p className="text-[11px] text-[#7A6050] mt-0.5">No account needed — quick checkout</p>
                    </div>
                    <div className={`w-4 h-4 border-2 flex items-center justify-center shrink-0 ${isGuest ? "border-[#111111] bg-[#111111]" : "border-[#E8D8C4]"}`}>
                      {isGuest && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                  </button>

                  {isGuest && (
                    <div className="pt-1 space-y-3">
                      <div>
                        <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">
                          Email Address <span className="text-[#C9A880]">*</span>
                        </Label>
                        <Input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]"
                          placeholder="your@email.com"
                        />
                        <p className="text-[9px] text-[#B8A090] mt-1">For your order confirmation. Optional but recommended.</p>
                      </div>
                      <button
                        onClick={() => setStep("address")}
                        className="w-full bg-[#111111] text-white h-12 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors flex items-center justify-center gap-2">
                        Continue to Address <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step: Address ── */}
            {step === "address" && (
              <div className="bg-white border border-[#E8D8C4]">
                <div className="px-6 py-4 border-b border-[#E8D8C4]">
                  <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">
                    Step {isAuthenticated ? "1" : "2"} of {isAuthenticated ? "3" : "4"}
                  </p>
                  <h2 className="text-lg font-black text-[#111111] mt-0.5">Delivery Address</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">First Name <span className="text-[#C9A880]">*</span></Label>
                      <Input value={address.first_name} onChange={(e) => setAddress(a => ({ ...a, first_name: e.target.value }))}
                        className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" placeholder="Jane" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Last Name <span className="text-[#C9A880]">*</span></Label>
                      <Input value={address.last_name} onChange={(e) => setAddress(a => ({ ...a, last_name: e.target.value }))}
                        className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Phone Number <span className="text-[#C9A880]">*</span></Label>
                    <Input value={address.phone} onChange={(e) => setAddress(a => ({ ...a, phone: e.target.value }))}
                      className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" placeholder="+234 800 000 0000" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Address <span className="text-[#C9A880]">*</span></Label>
                    <Input value={address.address_line1} onChange={(e) => setAddress(a => ({ ...a, address_line1: e.target.value }))}
                      className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" placeholder="House / Street / Estate" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Landmark (optional)</Label>
                    <Input value={address.address_line2} onChange={(e) => setAddress(a => ({ ...a, address_line2: e.target.value }))}
                      className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" placeholder="Nearest landmark or gate" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">City <span className="text-[#C9A880]">*</span></Label>
                      <Input value={address.city} onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))}
                        className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" placeholder="Kubwa" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">State <span className="text-[#C9A880]">*</span></Label>
                      <Input value={address.state} onChange={(e) => setAddress(a => ({ ...a, state: e.target.value }))}
                        className="mt-1.5 border-[#E8D8C4] rounded-none h-11 focus:border-[#C9A880]" placeholder="FCT" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Order Notes (optional)</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="mt-1.5 border-[#E8D8C4] rounded-none resize-none" rows={3}
                      placeholder="Delivery instructions, preferred time, etc." />
                  </div>
                  <button
                    onClick={() => {
                      if (!address.first_name.trim())  { toast.error("Enter your first name.");     return; }
                      if (!address.last_name.trim())   { toast.error("Enter your last name.");      return; }
                      if (!address.phone.trim())        { toast.error("Enter your phone number.");   return; }
                      if (!address.address_line1.trim()){ toast.error("Enter your street address."); return; }
                      if (!address.city.trim())          { toast.error("Enter your city.");           return; }
                      if (!address.state.trim())         { toast.error("Enter your state.");          return; }
                      setStep("payment");
                    }}
                    className="w-full bg-[#111111] text-white h-12 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors flex items-center justify-center gap-2 mt-2">
                    Continue to Payment <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step: Payment ── */}
            {step === "payment" && (
              <div className="bg-white border border-[#E8D8C4]">
                <div className="px-6 py-4 border-b border-[#E8D8C4]">
                  <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">
                    Step {isAuthenticated ? "2" : "3"} of {isAuthenticated ? "3" : "4"}
                  </p>
                  <h2 className="text-lg font-black text-[#111111] mt-0.5">How would you like to order?</h2>
                </div>
                <div className="p-6 space-y-3">
                  {PAYMENT_METHODS.map(({ val, label, desc, icon: Icon }) => (
                    <button key={val} onClick={() => setPayMethod(val)}
                      className={`w-full flex items-center gap-4 p-4 border text-left transition-all ${
                        payMethod === val ? "border-[#111111] bg-[#F5EAD8]" : "border-[#E8D8C4] hover:border-[#C9A880]"
                      }`}>
                      <div className={`w-12 h-12 flex items-center justify-center shrink-0 ${
                        payMethod === val ? (val === "whatsapp" ? "bg-[#25D366]" : "bg-[#111111]") : "bg-[#F5EAD8]"
                      }`}>
                        <Icon className={`w-5 h-5 ${payMethod === val ? "text-white" : "text-[#7A6050]"}`} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-[#111111]">{label}</p>
                        <p className="text-[11px] text-[#7A6050] mt-0.5">{desc}</p>
                      </div>
                      <div className={`w-4 h-4 border-2 flex items-center justify-center shrink-0 ${payMethod === val ? "border-[#111111] bg-[#111111]" : "border-[#E8D8C4]"}`}>
                        {payMethod === val && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </button>
                  ))}

                  {payMethod === "paystack" && isGuest && !guestEmail && (
                    <div className="bg-[#FFF8F0] border border-[#E8D8C4] p-3">
                      <p className="text-[11px] text-[#7A6050]">
                        💡 Go back and add your email so Paystack can send you a payment receipt.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(isAuthenticated ? "address" : "address")}
                      className="flex items-center gap-1.5 border border-[#E8D8C4] text-[#7A6050] px-5 h-12 text-[10px] font-bold tracking-widest uppercase hover:border-[#C9A880] transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button onClick={() => setStep("review")}
                      className="flex-1 bg-[#111111] text-white h-12 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors flex items-center justify-center gap-2">
                      Review Order <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step: Review ── */}
            {step === "review" && (
              <div className="bg-white border border-[#E8D8C4]">
                <div className="px-6 py-4 border-b border-[#E8D8C4]">
                  <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">
                    Step {isAuthenticated ? "3" : "4"} of {isAuthenticated ? "3" : "4"}
                  </p>
                  <h2 className="text-lg font-black text-[#111111] mt-0.5">Review & Confirm</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border border-[#E8D8C4] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-bold tracking-widest uppercase text-[#C9A880]">Delivery Address</p>
                      <button onClick={() => setStep("address")} className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] transition-colors">Edit</button>
                    </div>
                    <p className="text-sm font-semibold text-[#111111]">{address.first_name} {address.last_name}</p>
                    <p className="text-xs text-[#7A6050]">{address.address_line1}{address.address_line2 && `, ${address.address_line2}`}</p>
                    <p className="text-xs text-[#7A6050]">{address.city}, {address.state}</p>
                    <p className="text-xs text-[#7A6050]">{address.phone}</p>
                    {isGuest && guestEmail && <p className="text-xs text-[#7A6050] mt-0.5">{guestEmail}</p>}
                  </div>

                  <div className="border border-[#E8D8C4] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-bold tracking-widest uppercase text-[#C9A880]">Order Method</p>
                      <button onClick={() => setStep("payment")} className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] transition-colors">Edit</button>
                    </div>
                    <div className="flex items-center gap-2">
                      {payMethod === "whatsapp"
                        ? <MessageCircle className="w-4 h-4 text-[#25D366]" strokeWidth={1.5} />
                        : <CreditCard className="w-4 h-4 text-[#C9A880]" strokeWidth={1.5} />}
                      <p className="text-sm font-semibold text-[#111111]">{PAYMENT_METHODS.find(m => m.val === payMethod)?.label}</p>
                    </div>
                  </div>

                  {notes && (
                    <div className="border border-[#E8D8C4] p-4">
                      <p className="text-[9px] font-bold tracking-widest uppercase text-[#C9A880] mb-1">Notes</p>
                      <p className="text-xs text-[#7A6050]">{notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-[#F5EAD8] p-3">
                    <Lock className="w-3.5 h-3.5 text-[#C9A880] shrink-0" />
                    <p className="text-[10px] text-[#7A6050]">Your personal data is protected and your order is secure.</p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setStep("payment")}
                      className="flex items-center gap-1.5 border border-[#E8D8C4] text-[#7A6050] px-5 h-12 text-[10px] font-bold tracking-widest uppercase hover:border-[#C9A880] transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button onClick={() => placeOrder()} disabled={isPending}
                      className={`flex-1 h-12 text-[10px] font-black tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                        payMethod === "whatsapp"
                          ? "bg-[#25D366] text-white hover:bg-[#1DAA56]"
                          : "bg-[#C9A880] text-[#111111] hover:bg-[#111111] hover:text-white"
                      }`}>
                      {isPending ? "Processing…"
                        : payMethod === "whatsapp" ? `Order via WhatsApp · ${formatNGN(total)}`
                        : `Pay ${formatNGN(total)} via Paystack`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Order summary sidebar ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#E8D8C4] sticky top-20">
              <div className="px-5 py-4 border-b border-[#E8D8C4]">
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Order Summary</p>
              </div>
              <div className="divide-y divide-[#F5EAD8] max-h-72 overflow-y-auto">
                {items.map((item) => {
                  const thumb = imgSrc(item.variant?.image ?? item.product?.thumbnail);
                  return (
                    <div key={item.id} className="flex gap-3 px-5 py-3.5">
                      <div className="relative w-12 h-14 bg-[#F5EAD8] shrink-0 overflow-hidden">
                        {thumb
                          ? <img src={thumb} alt={item.product?.name} className="w-full h-full object-cover" />
                          : <div className="flex items-center justify-center h-full"><ShoppingBag className="w-4 h-4 text-[#C9A880]/40" /></div>}
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#111111] text-white text-[8px] flex items-center justify-center font-bold">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#111111] truncate">{item.product?.name}</p>
                        {item.variant && <p className="text-[10px] text-[#B8A090]">{item.variant.label}</p>}
                        <p className="text-xs font-black text-[#111111] mt-0.5">{formatNGN(item.unit_price)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-4 border-t border-[#E8D8C4] space-y-2">
                <div className="flex justify-between text-xs text-[#7A6050]">
                  <span>Subtotal</span><span className="font-semibold text-[#111111]">{formatNGN(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-[#C9A880]">
                    <span>Discount</span><span>−{formatNGN(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-[#7A6050]">
                  <span>Shipping</span><span className="text-[#C9A880] font-semibold">Free</span>
                </div>
                <div className="flex justify-between font-black text-[#111111] border-t border-[#F5EAD8] pt-2 mt-1">
                  <span className="text-sm">Total</span><span className="text-base">{formatNGN(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

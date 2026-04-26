"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

const faqs = [
  {
    category: "Orders & Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "Within Kubwa and surrounding areas of Abuja, same-day delivery is available for orders placed before 2pm. Inter-state delivery typically takes 2–4 business days.",
      },
      {
        q: "Do you deliver outside Abuja?",
        a: "Yes! We deliver nationwide across Nigeria. Delivery fees and timelines vary by location. Contact us on WhatsApp for a delivery quote to your state.",
      },
      {
        q: "How can I track my order?",
        a: "Once your order is shipped, we'll send you a tracking number via WhatsApp or email. You can also check order status in your account dashboard.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "Orders can be modified or cancelled within 2 hours of placement. After that, the order may have already been processed. Please contact us immediately via WhatsApp.",
      },
    ],
  },
  {
    category: "Products & Hair",
    items: [
      {
        q: "Are your hair products 100% authentic?",
        a: "Absolutely. All our hair extensions, wigs, and bundles are sourced directly from verified suppliers. We do not sell synthetic hair unless explicitly stated.",
      },
      {
        q: "What hair lengths do you offer?",
        a: "We stock hair in lengths ranging from 10 inches to 24 inches. Available lengths are shown on each product page when you select your preferred colour.",
      },
      {
        q: "Can I dye or bleach the hair?",
        a: "Our virgin and Remy hair bundles can be coloured or bleached. We recommend consulting a professional stylist. Pre-coloured bundles (e.g. 613 Blonde) are more sensitive to chemical processing.",
      },
      {
        q: "How do I care for my hair extensions?",
        a: "Use sulphate-free shampoo and conditioner. Avoid excessive heat without a heat protectant. Store in a silk bag when not in use and detangle gently from tips to roots.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept bank transfers, card payments via Paystack, cash on delivery (Abuja only), and POS payment at our Kubwa location.",
      },
      {
        q: "Is it safe to pay online?",
        a: "Yes. All online payments are processed through Paystack, a PCI-DSS compliant payment gateway. We never store your card details.",
      },
      {
        q: "Do you offer instalment payments?",
        a: "We currently do not offer instalment plans, but we're working on it. Follow us on social media for updates.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 7 days of delivery for unopened and unused items in their original packaging. Hair products that have been installed, washed, or used cannot be returned.",
      },
      {
        q: "How do I initiate a return?",
        a: "Contact us via WhatsApp on +234 905 778 2627 with your order number and reason for return. Our team will guide you through the process.",
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are processed within 5–7 business days after we receive and inspect the returned item. Refunds are issued via bank transfer.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E8D8C4] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group">
        <span className="text-sm font-semibold text-[#111111] group-hover:text-[#C9A880] transition-colors">
          {q}
        </span>
        <span className="w-6 h-6 bg-[#F5EAD8] flex items-center justify-center shrink-0">
          {open
            ? <Minus className="w-3.5 h-3.5 text-[#C9A880]" />
            : <Plus className="w-3.5 h-3.5 text-[#C9A880]" />}
        </span>
      </button>
      {open && (
        <p className="text-sm text-[#7A6050] leading-relaxed pb-5">{a}</p>
      )}
    </div>
  );
}

export default function FAQsPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">

      {/* Header */}
      <div className="bg-[#111111] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#C9A880] text-[10px] tracking-[0.4em] uppercase font-bold mb-3">Help Centre</p>
          <h1 className="text-4xl lg:text-5xl font-black text-white">Frequently Asked<br />Questions</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {faqs.map(({ category, items }) => (
          <div key={category}>
            <p className="text-[9px] font-black tracking-[0.3em] uppercase text-[#C9A880] mb-1">{category}</p>
            <div className="w-8 h-0.5 bg-[#C9A880] mb-5" />
            <div className="bg-white border border-[#E8D8C4] px-6">
              {items.map((item) => <FAQItem key={item.q} {...item} />)}
            </div>
          </div>
        ))}

        {/* Still have questions */}
        <div className="bg-[#F5EAD8] border border-[#E8D8C4] p-8 text-center">
          <p className="font-black text-[#111111] mb-2">Still have questions?</p>
          <p className="text-sm text-[#7A6050] mb-5">Our team is ready to help you.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

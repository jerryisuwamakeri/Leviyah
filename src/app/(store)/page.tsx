"use client";

import { useQuery } from "@tanstack/react-query";
import { shopApi } from "@/lib/api";
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Scissors, Droplets, Palette, ShoppingBag } from "lucide-react";
import type { Product, Category } from "@/types";

const categories = [
  { label: "Hair",          slug: "hair",          icon: Scissors    },
  { label: "Supplements",   slug: "supplements",   icon: Droplets    },
  { label: "Lip Essentials",slug: "lip-essentials",icon: Palette     },
  { label: "Bags",          slug: "bags",          icon: ShoppingBag },
];

export default function HomePage() {
  const { data: featured } = useQuery<Product[]>({
    queryKey: ["products", "featured"],
    queryFn: () => shopApi.featured().then((r) => r.data),
  });

  const { data: cats } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => shopApi.categories().then((r) => r.data),
  });

  return (
    <div className="bg-[#FAFAFA]">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#111111] text-white min-h-[88vh] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-beauty.jpg"
            alt="Leviyah Beauty"
            fill
            className="object-cover object-center opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/80 to-[#111111]/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="max-w-xl">
            <p className="text-[#C9A880] text-xs tracking-[0.3em] uppercase font-semibold mb-6">
              Premium Beauty
            </p>
            <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8">
              <span className="block">Beauty</span>
              <span className="block text-[#C9A880]">Redefined.</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed mb-10 max-w-md">
              Curated hair, skincare, and body care essentials for the discerning woman.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/shop"
                className="inline-flex items-center gap-2 bg-[#C9A880] text-[#111111] px-8 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-[#B8905C] transition-colors">
                Shop Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/shop?category=hair"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-3.5 text-xs font-bold tracking-widest uppercase hover:border-[#C9A880] hover:text-[#C9A880] transition-colors">
                Explore Hair
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-white animate-pulse" />
        </div>
      </section>

      {/* ── Category strip ───────────────────────────────── */}
      <section className="border-b border-[#E8D8C4] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 divide-x divide-[#E8D8C4]">
            {categories.map(({ label, slug, icon: Icon }) => (
              <Link key={slug} href={`/shop?category=${slug}`}
                className="group flex flex-col items-center justify-center gap-2.5 py-7 hover:bg-[#F5EAD8] transition-colors">
                <Icon className="w-5 h-5 text-[#C9A880] group-hover:text-[#111111] transition-colors" strokeWidth={1.5} />
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050] group-hover:text-[#111111] transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statement band ───────────────────────────────── */}
      <section className="bg-[#F5EAD8] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A880] font-semibold mb-4">Our Promise</p>
          <h2 className="text-3xl lg:text-5xl font-black text-[#111111] leading-tight">
            Every product. Every skin.<br />
            <span className="text-[#C9A880]">Unapologetically you.</span>
          </h2>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────── */}
      {featured && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A880] font-semibold mb-2">Handpicked</p>
              <h2 className="text-3xl font-black text-[#111111]">Featured</h2>
            </div>
            <Link href="/shop"
              className="text-xs font-bold tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] flex items-center gap-1 transition-colors">
              All Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Brand values ─────────────────────────────────── */}
      <section className="bg-[#111111] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "100% Authentic",  desc: "Every product is verified genuine, sourced from trusted suppliers." },
              { title: "Premium Quality", desc: "We curate only the finest beauty essentials for every woman." },
              { title: "Fast Delivery",   desc: "Swift dispatch with nationwide delivery available." },
            ].map(({ title, desc }) => (
              <div key={title} className="border-t border-[#C9A880]/30 pt-6">
                <h3 className="text-sm font-bold tracking-widest uppercase text-[#C9A880] mb-3">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WhatsApp CTA ─────────────────────────────────── */}
      <section className="bg-white border-y border-[#E8D8C4] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A880] font-semibold mb-1">Need help?</p>
            <h3 className="text-2xl font-black text-[#111111]">Chat us on WhatsApp</h3>
            <p className="text-sm text-[#7A6050] mt-1">+234 905 778 2627 · We reply fast</p>
          </div>
          <a href="https://wa.me/2349057782627" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#111111] text-white px-8 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors whitespace-nowrap">
            Open WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}

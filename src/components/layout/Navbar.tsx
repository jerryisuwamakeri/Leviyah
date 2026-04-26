"use client";

import Link from "next/link";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useState, useEffect } from "react";
import { cartApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const navLinks = [
  { label: "Home",      href: "/" },
  { label: "Hair",      href: "/shop?category=hair" },
  { label: "Skincare",  href: "/shop?category=skincare" },
  { label: "Body Care", href: "/shop?category=body-care" },
  { label: "Makeup",    href: "/shop?category=makeup" },
  { label: "Bags",      href: "/shop?category=bags" },
];

export default function Navbar() {
  const { toggleCart, setCart } = useCartStore();
  const { isAuthenticated, isStaff } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.get().then((r) => r.data),
  });

  useEffect(() => { if (data) setCart(data); }, [data]);

  const itemCount = (data as { item_count?: number })?.item_count ?? 0;
  // Also add a "Home" label visible on mobile

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"} border-b border-[#E8D8C4]`}>
      {/* Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-black tracking-widest text-[#111111] uppercase">Leviyah</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className="text-xs font-semibold tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/shop" aria-label="Search">
              <Search className="w-[18px] h-[18px] text-[#7A6050] hover:text-[#C9A880] transition-colors" />
            </Link>

            {isAuthenticated && !isStaff ? (
              <Link href="/account" aria-label="Account">
                <User className="w-[18px] h-[18px] text-[#7A6050] hover:text-[#C9A880] transition-colors" />
              </Link>
            ) : (
              <Link href="/login" aria-label="Login">
                <User className="w-[18px] h-[18px] text-[#7A6050] hover:text-[#C9A880] transition-colors" />
              </Link>
            )}

            <button onClick={toggleCart} className="relative" aria-label="Cart">
              <ShoppingBag className="w-[18px] h-[18px] text-[#7A6050] hover:text-[#C9A880] transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#111111] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen
                ? <X className="w-5 h-5 text-[#111111]" />
                : <Menu className="w-5 h-5 text-[#111111]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E8D8C4] bg-white px-4 py-4 space-y-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-xs font-semibold tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] transition-colors">
              {l.label}
            </Link>
          ))}
          <div className="border-t border-[#E8D8C4] pt-3 mt-2 flex gap-4">
            <Link href="/login" onClick={() => setMobileOpen(false)}
              className="text-xs font-semibold tracking-widest uppercase text-[#111111]">
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

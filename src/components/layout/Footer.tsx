import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

const shopLinks = ["Hair", "Skincare", "Body Care", "Makeup", "Bags"];
const accountLinks: [string, string][] = [
  ["My Account", "/account"],
  ["Orders",     "/account/orders"],
  ["Sign In",    "/login"],
  ["Register",   "/register"],
];
const companyLinks: [string, string][] = [
  ["About Us",       "/about"],
  ["Contact",        "/contact"],
  ["FAQs",           "/faqs"],
];
const legalLinks: [string, string][] = [
  ["Privacy Policy",  "/privacy-policy"],
  ["Refund Policy",   "/refund-policy"],
  ["Terms of Use",    "/terms"],
];

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-xl font-black tracking-widest uppercase text-[#C9A880] mb-4">Leviyah</p>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Premium beauty essentials curated for the modern woman.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mb-5">Shop</p>
            <ul className="space-y-3">
              {shopLinks.map((c) => (
                <li key={c}>
                  <Link href={`/shop?category=${c.toLowerCase().replace(" ", "-")}`}
                    className="text-sm text-white/50 hover:text-[#C9A880] transition-colors">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mb-5">Account</p>
            <ul className="space-y-3">
              {accountLinks.map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-sm text-white/50 hover:text-[#C9A880] transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mb-5">Company</p>
            <ul className="space-y-3">
              {companyLinks.map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-sm text-white/50 hover:text-[#C9A880] transition-colors">{l}</Link>
                </li>
              ))}
              {legalLinks.map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-sm text-white/50 hover:text-[#C9A880] transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mb-5">Contact</p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#C9A880] shrink-0" />
                <span className="text-sm text-white/50">Kubwa, Abuja, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#C9A880] shrink-0" />
                <a href="tel:+2349057782627" className="text-sm text-white/50 hover:text-[#C9A880] transition-colors">
                  +234 905 778 2627
                </a>
              </li>
              <li>
                <a href="https://wa.me/2349057782627" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-[#C9A880]/30 text-[#C9A880] text-[10px] font-bold tracking-widest uppercase px-4 py-2 hover:bg-[#C9A880] hover:text-[#111111] transition-colors mt-1">
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            &copy; 1st January, 2026 Leviyah Beauty. All rights reserved.
          </p>
          <Link href="/admin/login" className="text-xs text-white/20 hover:text-[#C9A880] transition-colors">
            Staff Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}

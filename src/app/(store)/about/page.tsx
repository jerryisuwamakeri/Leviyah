import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAFA]">

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px]">
        <Image
          src="/images/hero-beauty.jpg"
          alt="Leviyah Beauty"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#111111]/60" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
            <p className="text-[#C9A880] text-[10px] tracking-[0.4em] uppercase font-bold mb-4">Our Story</p>
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight max-w-2xl">
              Beauty is not<br />a luxury —<br />
              <span className="text-[#C9A880]">it's a right.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white border-b border-[#E8D8C4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-[#C9A880] mb-4">Who We Are</p>
              <h2 className="text-4xl font-black text-[#111111] leading-tight mb-6">
                Leviyah was born from<br />a simple belief.
              </h2>
              <p className="text-[#7A6050] leading-relaxed mb-4">
                Every woman deserves access to premium beauty products that celebrate her natural radiance.
                Founded in Kubwa, Abuja, Leviyah is more than a beauty store — it is a movement dedicated
                to empowering women through self-care.
              </p>
              <p className="text-[#7A6050] leading-relaxed mb-8">
                From luxurious hair extensions to high-performance skincare, every product in our collection
                is handpicked and verified to meet the highest standards of quality.
              </p>
              <Link href="/shop"
                className="inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors">
                Shop the Collection <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="relative aspect-[4/5]">
              <Image
                src="/images/skincare-products.jpg"
                alt="Leviyah Beauty Products"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#F5EAD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-[#C9A880] mb-3">What Drives Us</p>
            <h2 className="text-3xl font-black text-[#111111]">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Authenticity",
                body: "Every product is sourced directly from trusted suppliers. No fakes, no compromises — ever.",
              },
              {
                title: "Inclusivity",
                body: "Beauty has no single standard. We celebrate every skin tone, hair type, and body type.",
              },
              {
                title: "Excellence",
                body: "From packaging to delivery, we obsess over the details so you receive only the best.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="bg-white border border-[#E8D8C4] p-8">
                <div className="w-8 h-0.5 bg-[#C9A880] mb-5" />
                <h3 className="text-sm font-black tracking-widest uppercase text-[#111111] mb-3">{title}</h3>
                <p className="text-sm text-[#7A6050] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team photo / brand image */}
      <section className="relative h-80">
        <Image
          src="/images/team-beauty.jpg"
          alt="Leviyah Team"
          fill
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-[#111111]/70 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-[#C9A880] text-[10px] tracking-[0.4em] uppercase font-bold mb-3">Abuja, Nigeria</p>
            <p className="text-3xl lg:text-4xl font-black text-white">
              Crafted with love. <span className="text-[#C9A880]">Delivered with care.</span>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-[#E8D8C4] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-[#C9A880] mb-3">Get in Touch</p>
          <h2 className="text-2xl font-black text-[#111111] mb-6">Have questions? We'd love to hear from you.</h2>
          <Link href="/contact"
            className="inline-flex items-center gap-2 border border-[#111111] text-[#111111] px-8 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-[#111111] hover:text-white transition-colors">
            Contact Us <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </div>
  );
}

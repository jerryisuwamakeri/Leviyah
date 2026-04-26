"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form,    setForm]    = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // WhatsApp redirect with pre-filled message
    const msg = encodeURIComponent(
      `Hi Leviyah! My name is ${form.name}.\n\n${form.message}\n\nEmail: ${form.email}${form.phone ? "\nPhone: " + form.phone : ""}`
    );
    setTimeout(() => {
      window.open(`https://wa.me/2349057782627?text=${msg}`, "_blank");
      setSent(true);
      setLoading(false);
      toast.success("Opening WhatsApp…");
    }, 600);
  };

  const f = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value }),
  });

  return (
    <div className="bg-[#FAFAFA]">

      {/* Hero */}
      <section className="relative h-64 lg:h-80">
        <Image
          src="/images/contact-beauty.jpg"
          alt="Contact Leviyah"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-[#111111]/65" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <p className="text-[#C9A880] text-[10px] tracking-[0.4em] uppercase font-bold mb-3">We're here for you</p>
            <h1 className="text-4xl lg:text-6xl font-black text-white">Get in Touch</h1>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-[#C9A880] mb-5">Contact Details</p>
              <div className="space-y-5">
                {[
                  {
                    icon: MapPin,
                    label: "Address",
                    value: "Kubwa, Abuja, Nigeria",
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: "+234 905 778 2627",
                    href: "tel:+2349057782627",
                  },
                  {
                    icon: MessageCircle,
                    label: "WhatsApp",
                    value: "+234 905 778 2627",
                    href: "https://wa.me/2349057782627",
                  },
                  {
                    icon: Clock,
                    label: "Hours",
                    value: "Mon – Sat: 9am – 7pm",
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-[#F5EAD8] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#C9A880]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold tracking-widest uppercase text-[#B8A090]">{label}</p>
                      {href ? (
                        <a href={href} target={href.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer"
                          className="text-sm text-[#111111] font-semibold hover:text-[#C9A880] transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm text-[#111111] font-semibold">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111111] p-6 mt-8">
              <p className="text-[#C9A880] text-[10px] font-bold tracking-widest uppercase mb-2">Fastest Response</p>
              <p className="text-white text-sm leading-relaxed">
                Send us a WhatsApp message — we typically respond within minutes.
              </p>
              <a href="https://wa.me/2349057782627" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 bg-[#C9A880] text-[#111111] px-5 py-2.5 text-[10px] font-black tracking-widest uppercase hover:bg-white transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-[#C9A880] mb-5">Send a Message</p>
            {sent ? (
              <div className="border border-[#E8D8C4] bg-white p-10 text-center">
                <div className="w-12 h-12 bg-[#F5EAD8] flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-[#C9A880]" strokeWidth={1.5} />
                </div>
                <p className="font-black text-[#111111] mb-2">Message Sent!</p>
                <p className="text-sm text-[#7A6050]">Your WhatsApp has opened. We'll respond shortly.</p>
                <button onClick={() => setSent(false)}
                  className="mt-6 text-[10px] font-bold tracking-widest uppercase text-[#B8A090] hover:text-[#C9A880] transition-colors">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Full Name *</Label>
                    <Input {...f("name")} className="mt-1.5 border-[#E8D8C4] rounded-none h-11" placeholder="Jane Doe" required />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Email *</Label>
                    <Input type="email" {...f("email")} className="mt-1.5 border-[#E8D8C4] rounded-none h-11" placeholder="you@example.com" required />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Phone <span className="normal-case tracking-normal font-normal">(optional)</span></Label>
                  <Input {...f("phone")} className="mt-1.5 border-[#E8D8C4] rounded-none h-11" placeholder="+234…" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Message *</Label>
                  <Textarea {...f("message")} rows={5} className="mt-1.5 border-[#E8D8C4] rounded-none resize-none"
                    placeholder="How can we help you?" required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#111111] text-white h-12 text-[10px] font-black tracking-widest uppercase hover:bg-[#C9A880] hover:text-[#111111] transition-colors disabled:opacity-50">
                  {loading ? "Opening WhatsApp…" : "Send via WhatsApp"}
                </button>
                <p className="text-[10px] text-[#B8A090] text-center">
                  Your message will open in WhatsApp for a faster response.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

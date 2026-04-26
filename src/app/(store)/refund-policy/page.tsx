import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund & Returns Policy" };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-sm font-black tracking-widest uppercase text-[#111111] mb-4">{title}</h2>
    <div className="text-sm text-[#7A6050] leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">

      <div className="bg-[#111111] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#C9A880] text-[10px] tracking-[0.4em] uppercase font-bold mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white">Refund &amp; Returns Policy</h1>
          <p className="text-white/40 text-xs mt-3">Effective: 1st January, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-[#E8D8C4] p-8 lg:p-12">

          <p className="text-sm text-[#7A6050] leading-relaxed mb-10">
            Your satisfaction is our priority. Please read our Returns and Refunds Policy carefully
            before making a purchase. By shopping at Leviyah, you agree to this policy.
          </p>

          <Section title="1. Return Eligibility">
            <p>We accept returns within <strong className="text-[#111111]">7 days</strong> of the delivery date, provided that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The item is in its original, unused condition.</li>
              <li>The original packaging is intact and undamaged.</li>
              <li>Proof of purchase (order number or receipt) is provided.</li>
            </ul>
          </Section>

          <Section title="2. Non-Returnable Items">
            <p>The following items are <strong className="text-[#111111]">not eligible</strong> for return:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Hair extensions, wigs, or bundles that have been installed, washed, cut, or chemically processed.</li>
              <li>Opened skincare, body care, or cosmetic products (for hygiene reasons).</li>
              <li>Sale or clearance items marked as final sale.</li>
              <li>Items damaged through misuse or improper care.</li>
            </ul>
          </Section>

          <Section title="3. Damaged or Incorrect Items">
            <p>If you receive a damaged, defective, or incorrect item, contact us within <strong className="text-[#111111]">48 hours</strong> of delivery via WhatsApp (+234 905 778 2627) with clear photos of the item and packaging. We will arrange a replacement or full refund at no additional cost to you.</p>
          </Section>

          <Section title="4. How to Initiate a Return">
            <p>To start a return:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Contact us on WhatsApp (+234 905 778 2627) or email us.</li>
              <li>Provide your order number and reason for return.</li>
              <li>Our team will review your request and provide return instructions within 24 hours.</li>
              <li>Ship the item back using a trackable method at your cost (unless the return is due to our error).</li>
            </ol>
          </Section>

          <Section title="5. Refund Processing">
            <p>Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund.</p>
            <p>If approved, refunds are processed within <strong className="text-[#111111]">5–7 business days</strong> via bank transfer to the account you provide.</p>
            <p>Original delivery charges are non-refundable unless the return is a result of our error.</p>
          </Section>

          <Section title="6. Exchanges">
            <p>We offer exchanges for a different size, colour, or length on eligible hair products, subject to stock availability. Contact us within 7 days of delivery to arrange an exchange.</p>
          </Section>

          <Section title="7. Contact Us">
            <p>For any return or refund enquiries:</p>
            <p><strong className="text-[#111111]">Leviyah Beauty</strong><br />Kubwa, Abuja, Nigeria<br />WhatsApp: +234 905 778 2627</p>
          </Section>
        </div>
      </div>
    </div>
  );
}

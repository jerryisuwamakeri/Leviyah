import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use" };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-sm font-black tracking-widest uppercase text-[#111111] mb-4">{title}</h2>
    <div className="text-sm text-[#7A6050] leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function TermsPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">

      <div className="bg-[#111111] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#C9A880] text-[10px] tracking-[0.4em] uppercase font-bold mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white">Terms of Use</h1>
          <p className="text-white/40 text-xs mt-3">Effective: 1st January, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-[#E8D8C4] p-8 lg:p-12">

          <p className="text-sm text-[#7A6050] leading-relaxed mb-10">
            These Terms of Use govern your access to and use of the Leviyah Beauty website and services.
            By accessing our website or placing an order, you agree to be bound by these terms.
            Please read them carefully.
          </p>

          <Section title="1. Acceptance of Terms">
            <p>By using this website, you confirm that you are at least 18 years of age and legally capable of entering into a binding agreement. If you do not agree to these terms, please do not use our website.</p>
          </Section>

          <Section title="2. Products & Availability">
            <p>All products are subject to availability. We reserve the right to limit quantities, discontinue products, or refuse orders at our discretion.</p>
            <p>Product images are for illustrative purposes. Actual colours may vary slightly due to photography and screen calibration.</p>
          </Section>

          <Section title="3. Pricing & Payment">
            <p>All prices are displayed in Nigerian Naira (₦) and are inclusive of applicable taxes. Prices are subject to change without notice.</p>
            <p>We reserve the right to cancel any order where a pricing error has occurred, with a full refund issued to the customer.</p>
            <p>Payment must be completed before an order is processed and dispatched.</p>
          </Section>

          <Section title="4. Orders & Contract">
            <p>Placing an order constitutes an offer to purchase. A contract is formed only when we send an order confirmation email or WhatsApp message.</p>
            <p>We reserve the right to decline or cancel any order for any reason, including suspected fraud or stock unavailability.</p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>All content on this website — including text, images, logos, graphics, and product descriptions — is the property of Leviyah Beauty and is protected by applicable copyright and trademark laws.</p>
            <p>You may not reproduce, distribute, or use our content for commercial purposes without our express written consent.</p>
          </Section>

          <Section title="6. User Accounts">
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</p>
            <p>Notify us immediately of any unauthorised use of your account. We are not liable for any loss resulting from unauthorised account access.</p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>To the maximum extent permitted by law, Leviyah Beauty shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products.</p>
            <p>Our total liability for any claim shall not exceed the value of the order giving rise to the claim.</p>
          </Section>

          <Section title="8. Governing Law">
            <p>These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Abuja, Nigeria.</p>
          </Section>

          <Section title="9. Changes to Terms">
            <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated effective date. Continued use of our website after changes constitutes acceptance of the revised terms.</p>
          </Section>

          <Section title="10. Contact">
            <p><strong className="text-[#111111]">Leviyah Beauty</strong><br />Kubwa, Abuja, Nigeria<br />WhatsApp: +234 905 778 2627</p>
          </Section>
        </div>
      </div>
    </div>
  );
}

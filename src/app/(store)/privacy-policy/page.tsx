import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-sm font-black tracking-widest uppercase text-[#111111] mb-4">{title}</h2>
    <div className="text-sm text-[#7A6050] leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">

      <div className="bg-[#111111] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#C9A880] text-[10px] tracking-[0.4em] uppercase font-bold mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
          <p className="text-white/40 text-xs mt-3">Effective: 1st January, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-[#E8D8C4] p-8 lg:p-12">

          <p className="text-sm text-[#7A6050] leading-relaxed mb-10">
            Leviyah Beauty ("Leviyah", "we", "us", or "our") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your personal information
            when you visit our website or make a purchase.
          </p>

          <Section title="1. Information We Collect">
            <p><strong className="text-[#111111]">Personal Information:</strong> Name, email address, phone number, and delivery address when you create an account or place an order.</p>
            <p><strong className="text-[#111111]">Payment Information:</strong> We do not store your card details. All payment data is handled securely by Paystack.</p>
            <p><strong className="text-[#111111]">Usage Data:</strong> Pages visited, products viewed, browser type, and IP address to help us improve our services.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>To process and fulfil your orders, including dispatch and delivery.</p>
            <p>To communicate with you about your orders, account, or customer service enquiries.</p>
            <p>To send promotional emails or SMS if you have opted in (you may unsubscribe at any time).</p>
            <p>To improve our website, product range, and customer experience.</p>
          </Section>

          <Section title="3. Sharing Your Information">
            <p>We do not sell, trade, or rent your personal information to third parties. We may share data with:</p>
            <p><strong className="text-[#111111]">Delivery Partners:</strong> Your name, address, and phone number are shared with logistics providers solely to complete your delivery.</p>
            <p><strong className="text-[#111111]">Payment Processors:</strong> Paystack processes payments on our behalf under their own privacy policy.</p>
            <p><strong className="text-[#111111]">Legal Requirements:</strong> We may disclose information if required by law or to protect our rights.</p>
          </Section>

          <Section title="4. Data Security">
            <p>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or alteration. However, no internet transmission is completely secure, and we cannot guarantee absolute security.</p>
          </Section>

          <Section title="5. Cookies">
            <p>We use cookies to maintain your session, remember your cart, and analyse site traffic. You may disable cookies in your browser settings, though some features may not function correctly.</p>
          </Section>

          <Section title="6. Your Rights">
            <p>You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at <strong className="text-[#111111]">leviyahbeauty@gmail.com</strong> or via WhatsApp at +234 905 778 2627.</p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>Our services are not directed at individuals under the age of 13. We do not knowingly collect personal information from children.</p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised effective date. We encourage you to review this policy periodically.</p>
          </Section>

          <Section title="9. Contact Us">
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <p><strong className="text-[#111111]">Leviyah Beauty</strong><br />Kubwa, Abuja, Nigeria<br />WhatsApp: +234 905 778 2627</p>
          </Section>
        </div>
      </div>
    </div>
  );
}

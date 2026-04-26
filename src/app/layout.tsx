import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: { default: "Leviyah Beauty", template: "%s | Leviyah Beauty" },
  description: "Premium beauty products — hair, skincare, body care & more. Based in Kubwa, Abuja.",
  keywords: ["beauty", "hair", "skincare", "body care", "Nigeria", "Abuja"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

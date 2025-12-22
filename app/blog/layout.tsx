import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <main className="">{children}</main>
      <div className="bg-background dark">
        <CtaSection />
        <Footer />
      </div>
      <Analytics />
    </div>
  );
}

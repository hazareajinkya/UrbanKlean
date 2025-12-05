"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { PricingContent } from "@/components/pricing/pricing-content";

export default function PricingPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <PricingContent />

      <div className="bg-background dark">
        <Footer />
      </div>
    </div>
  );
}

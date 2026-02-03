import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { PricingContent } from "@/components/pricing/pricing-content";
import { coreConf } from "@/lib/utils/conf";

export const metadata: Metadata = {
  title: "Pricing | MagicalCX",
  description:
    "Simple pricing for empathy-first AI support. Choose a plan that fits your message volume and scale as you grow.",
  openGraph: {
    title: "Pricing | MagicalCX",
    description:
      "Simple pricing for empathy-first AI support. Choose a plan that fits your message volume and scale as you grow.",
    url: `${coreConf.baseUrl}/pricing`,
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/pricing`,
  },
};

export default function PricingPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-20 text-sm text-muted-foreground">
            Loading pricing...
          </div>
        }
      >
        <PricingContent />
      </Suspense>

      <div className="bg-background dark">
        <Footer />
      </div>
    </div>
  );
}

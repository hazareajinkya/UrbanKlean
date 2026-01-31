import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";
import { coreConf } from "@/lib/utils/conf";
import { SupportCostCalculator } from "@/components/free-tools/support-cost-calculator";
import { CustomerSupportCostContent } from "@/components/free-tools/customer-support-cost-content";

export const metadata: Metadata = {
  title: "Customer Support Cost Calculator | MagicalCX",
  description:
    "Calculate your customer support team costs per month and per ticket. Understand the real cost of your support operation including salaries, tools, delays, and hidden expenses.",
  keywords: [
    "customer support cost calculator",
    "cost of customer support team",
    "support agent cost per month",
    "customer service cost calculator",
    "support team cost",
  ],
  openGraph: {
    title: "Customer Support Cost Calculator | MagicalCX",
    description:
      "Calculate your customer support team costs and discover how AI-assisted support can reduce costs by 40-80%.",
    url: `${coreConf.baseUrl}/free-tools/customer-support-cost-calculator`,
    type: "website",
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/free-tools/customer-support-cost-calculator`,
  },
};

export default function SupportCostCalculatorPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section with H1 and Intro */}
      <div className="w-full bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />

        <div className="section-container border-x px-6 py-16 md:py-24">
          {/* Header Section */}
          <div className="text-center mb-16 space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background border shadow-sm text-foreground text-sm font-medium">
              <span>Free Calculator Tool</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl section-heading font-serif text-foreground tracking-tight">
              Customer Support Cost Calculator
            </h1>

            {/* Problem-Aware Intro */}
            <p className="section-subline leading-relaxed text-muted-foreground">
              Calculate your true support cost per month and per ticket to spot
              savings fast.
            </p>
          </div>

          {/* Calculator Tool Section */}
          <SupportCostCalculator />
        </div>
      </div>

      {/* Content Section - Insights, Bridge, FAQs */}
      <CustomerSupportCostContent />

      <div className="bg-background dark">
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}

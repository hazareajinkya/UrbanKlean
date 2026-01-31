import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";
import { coreConf } from "@/lib/utils/conf";
import { AIHumanROICalculator } from "@/components/free-tools/ai-human-roi-calculator";
import { RoiContent } from "@/components/free-tools/roi-content";

export const metadata: Metadata = {
  title: "AI vs Human Customer Support ROI Calculator | MagicalCX",
  description:
    "Compare AI customer support ROI vs human-only support. Calculate cost savings, faster response times, and reduced refunds with AI-assisted support.",
  keywords: [
    "AI customer support ROI",
    "chatbot vs human support cost",
    "AI support savings",
    "AI support ROI calculator",
    "customer support ROI",
    "AI chatbot ROI",
    "support cost comparison",
  ],
  openGraph: {
    title: "AI vs Human Customer Support ROI Calculator | MagicalCX",
    description:
      "Compare the ROI of AI-assisted customer support vs human-only support. See cost savings, faster response times, and reduced refunds.",
    url: `${coreConf.baseUrl}/free-tools/ai-vs-human-support-roi-calculator`,
    type: "website",
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/free-tools/ai-vs-human-support-roi-calculator`,
  },
};

export default function AIHumanROICalculatorPage() {
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
              <span>Free ROI Calculator</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl section-heading font-serif text-foreground tracking-tight">
              AI vs Human Customer Support ROI Calculator
            </h1>

            {/* Problem-Aware Intro */}
            <p className="section-subline leading-relaxed text-muted-foreground">
              Compare AI vs human support ROI to see savings, speed gains, and
              refund impact.
            </p>
          </div>

          {/* Calculator Tool Section */}
          <AIHumanROICalculator />
        </div>
      </div>

      {/* Content Section - Insights, Bridge, FAQs */}
      <RoiContent />

      <div className="bg-background dark">
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}

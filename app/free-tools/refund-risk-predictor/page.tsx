import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";
import { coreConf } from "@/lib/utils/conf";
import { RefundRiskPredictor } from "@/components/free-tools/refund-risk-predictor";
import { RefundRiskContent } from "@/components/free-tools/refund-risk-content";

export const metadata: Metadata = {
  title: "Refund Risk Predictor | MagicalCX",
  description:
    "Find out why customers ask for refunds and how to reduce them. Get your refund risk score, top causes, and actionable CX fixes to lower costs and improve retention.",
  keywords: [
    "reduce refunds customer support",
    "why customers ask for refunds",
    "refund risk calculator",
    "customer refund prevention",
    "reduce return rate",
    "customer support refund reduction",
  ],
  openGraph: {
    title: "Refund Risk Predictor | MagicalCX",
    description:
      "Discover your refund risk score and get actionable fixes to reduce customer refunds by up to 30%.",
    url: `${coreConf.baseUrl}/free-tools/refund-risk-predictor`,
    type: "website",
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/free-tools/refund-risk-predictor`,
  },
};

export default function RefundRiskPredictorPage() {
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
              <span>Free Refund Risk Tool</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl section-heading font-serif text-foreground tracking-tight">
              Refund Risk Predictor
            </h1>

            {/* Problem-Aware Intro */}
            <p className="section-subline leading-relaxed text-muted-foreground">
              Predict refund risk and get fixes that lower refunds and protect
              revenue.
            </p>
          </div>

          {/* Refund Risk Predictor Tool Section */}
          <RefundRiskPredictor />
        </div>
      </div>

      {/* Content Section - Insights, Bridge, FAQs */}
      <RefundRiskContent />

      <div className="bg-background dark">
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";
import { coreConf } from "@/lib/utils/conf";
import { SupportPolicyGenerator } from "@/components/free-tools/support-policy-generator";
import { SupportPolicyContent } from "@/components/free-tools/support-policy-content";

export const metadata: Metadata = {
  title: "Customer Support Policy Generator | Free Template | MagicalCX",
  description:
    "Generate a simple, fair customer support policy in minutes. Free templates for refund language, escalation rules, and support hours customized to your business.",
  keywords: [
    "customer support policy template",
    "customer service policy generator",
    "refund policy template",
    "escalation policy template",
    "support policy generator free",
    "customer support guidelines",
    "how to write a support policy",
    "customer service policy examples",
  ],
  openGraph: {
    title: "Customer Support Policy Generator | Free Template",
    description:
      "Clear policies reduce conflict. Generate a simple, fair support policy in minutes with free templates for any business.",
    url: `${coreConf.baseUrl}/free-tools/customer-support-and-refund-policy-generator`,
    type: "website",
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/free-tools/customer-support-and-refund-policy-generator`,
  },
};

export default function SupportPolicyGeneratorPage() {
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
              <span>Customer Support Policy Template</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl section-heading font-serif text-foreground tracking-tight">
              Customer Support And Refund Policy Generator
            </h1>

            {/* Problem-Aware Intro */}
            <p className="section-subline leading-relaxed text-muted-foreground">
              Generate a clear support and refund policy that reduces disputes
              and ticket churn.
            </p>
          </div>

          {/* Policy Generator Tool Section */}
          <SupportPolicyGenerator />
        </div>
      </div>

      {/* Content Section - Insights, FAQs */}
      <SupportPolicyContent />

      <div className="bg-background dark">
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";
import { coreConf } from "@/lib/utils/conf";
import { ResponseQualityGrader } from "@/components/free-tools/response-quality-grader";
import { ResponseQualityContent } from "@/components/free-tools/response-quality-content";

export const metadata: Metadata = {
  title: "Customer Support Response Grader | MagicalCX",
  description:
    "Grade customer support responses on Clarity, Empathy, Resolution Strength, and Brand Safety. Get instant AI-powered feedback to improve support quality.",
  keywords: [
    "customer support response grader",
    "support response grader",
    "customer support response quality",
    "customer service quality checker",
    "how to grade support replies",
    "support reply quality tool",
    "customer support feedback",
    "support response analyzer",
  ],
  openGraph: {
    title: "Customer Support Response Grader | MagicalCX",
    description:
      "Grade customer support responses on Clarity, Empathy, Resolution Strength, and Brand Safety. Get instant AI-powered feedback.",
    url: `${coreConf.baseUrl}/free-tools/customer-support-response-grader`,
    type: "website",
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/free-tools/customer-support-response-grader`,
  },
};

export default function SupportResponseQualityGraderPage() {
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
              <span>Free Quality Grader</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl section-heading font-serif text-foreground tracking-tight">
              Customer Support Response Grader
            </h1>

            {/* Problem-Aware Intro */}
            <p className="section-subline leading-relaxed text-muted-foreground">
              Grade support replies for clarity and empathy to lift CSAT and
              resolution quality.
            </p>
          </div>

          {/* Grader Tool Section */}
          <ResponseQualityGrader />
        </div>
      </div>

      {/* Content Section - Insights, Bridge, FAQs */}
      <ResponseQualityContent />

      <div className="bg-background dark">
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}

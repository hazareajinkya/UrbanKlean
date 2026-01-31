import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";
import { coreConf } from "@/lib/utils/conf";
import { ToneEmpathyChecker } from "@/components/free-tools/tone-empathy-checker";
import { ToneEmpathyContent } from "@/components/free-tools/tone-empathy-content";

export const metadata: Metadata = {
  title: "Customer Support Tone Checker | MagicalCX",
  description:
    "Check how your support messages feel to customers. Analyze emotional warmth, identify risky phrases, and get AI-powered rewrites to build trust and de-escalate situations.",
  keywords: [
    "customer support tone checker",
    "empathetic customer service examples",
    "customer service tone analyzer",
    "empathy checker for support",
    "support message tone",
    "customer communication analyzer",
    "empathetic response examples",
    "customer support empathy tool",
  ],
  openGraph: {
    title: "Customer Support Tone Checker | MagicalCX",
    description:
      "A single sentence can calm a customer—or escalate the situation. This tool helps you understand how your support messages feel to customers.",
    url: `${coreConf.baseUrl}/free-tools/customer-support-tone-checker`,
    type: "website",
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/free-tools/customer-support-tone-checker`,
  },
};

export default function CxToneEmpathyCheckerPage() {
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
              <span>Free Tone Analysis Tool</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl section-heading font-serif text-foreground tracking-tight">
              Customer Support Tone Checker
            </h1>

            {/* Problem-Aware Intro */}
            <p className="section-subline leading-relaxed text-muted-foreground">
              Check support tone and get rewrites that de-escalate and build
              customer trust.
            </p>
          </div>

          {/* Tone Empathy Checker Tool Section */}
          <ToneEmpathyChecker />
        </div>
      </div>

      {/* Content Section - Insights, Bridge, FAQs */}
      <ToneEmpathyContent />

      <div className="bg-background dark">
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}

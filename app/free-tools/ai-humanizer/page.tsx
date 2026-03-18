import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";
import { AiHumanizer } from "@/components/free-tools/ai-humanizer";
import { coreConf } from "@/lib/utils/conf";

export const metadata: Metadata = {
  title: "100% Free AI Humanizer Tool | MagicalCX",
  description:
    "Paste your AI-generated text into the editor below to instantly make it sound 100% human and pass all AI detectors",
  keywords: [
    "100% free ai humanizer",
    "free ai humanizer",
    "humanize ai text",
    "ai to human text converter",
    "rewrite ai content",
    "undetectable humanized text",
  ],
  openGraph: {
    title: "100% Free AI Humanizer Tool | MagicalCX",
    description:
      "Paste your AI-generated text into the editor below to instantly make it sound 100% human and pass all AI detectors",
    url: `${coreConf.baseUrl}/free-tools/ai-humanizer`,
    type: "website",
  },
  alternates: { canonical: `${coreConf.baseUrl}/free-tools/ai-humanizer` },
};

export default function AiHumanizerPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="w-full bg-background relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
          <div className="section-container border-x px-6 py-16 md:py-24">
            <AiHumanizer />
          </div>
        </div>
      </main>
      <div className="bg-background dark">
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}

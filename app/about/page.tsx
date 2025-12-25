import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";
import { coreConf } from "@/lib/utils/conf";
import { AboutV2Content } from "./v2/about-v2-content";

export const metadata: Metadata = {
  title: "About Us | MagicalCX",
  description:
    "We built MagicalCX for businesses that need more revenue and lower costs, but refuse to get there by tricking, rushing, or disrespecting customers.",
  openGraph: {
    title: "About Us | MagicalCX",
    description:
      "Numbers you can show in a board meeting. Experiences you can be proud to put your brand on.",
    url: `${coreConf.baseUrl}/about/v2`,
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/about/v2`,
  },
};

export default function AboutV2Page() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <AboutV2Content />
      <div className="bg-background dark">
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}

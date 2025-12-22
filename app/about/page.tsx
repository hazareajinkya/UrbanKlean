import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { AboutHero } from "@/components/about/about-hero";
import { AboutMission } from "@/components/about/about-mission";
import { AboutValues } from "@/components/about/about-values";
import { AboutPhilosophy } from "@/components/about/about-philosophy";
import { AboutAudience } from "@/components/about/about-audience";
import { AboutStory } from "@/components/about/about-story";
import { CtaSection } from "@/components/landing/cta-section";
import { coreConf } from "@/lib/utils/conf";

export const metadata: Metadata = {
  title: "About Us | MagicalCX",
  description:
    "We built MagicalCX because customer care should feel human—simple, honest, and kind—while improving sales, revenue, costs, margins, and LTV.",
  openGraph: {
    title: "About Us | MagicalCX",
    description:
      "Why we built MagicalCX: customer care should feel human—simple, honest, and kind—while driving measurable business outcomes.",
    url: `${coreConf.baseUrl}/about`,
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <AboutHero />
      <AboutMission />
      <AboutValues />

      <AboutPhilosophy />
      <AboutAudience />
      <AboutStory />

      <div className="bg-background dark ">
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}

"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { AboutHero } from "@/components/about/about-hero";
import { AboutMission } from "@/components/about/about-mission";
import { AboutValues } from "@/components/about/about-values";
import { AboutPhilosophy } from "@/components/about/about-philosophy";
import { AboutAudience } from "@/components/about/about-audience";
import { AboutStory } from "@/components/about/about-story";
import { CtaSection } from "@/components/landing/cta-section";

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

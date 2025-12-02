"use client";

import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { SocialProofStrip } from "@/components/landing/social-proof-strip";
import { OldNewWay } from "@/components/landing/old-new-way";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { WhyChooseUs } from "@/components/landing/why-choose-us";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="">
        <Navbar />
        <div className="container mx-auto">
          <HeroSection />
          <SocialProofStrip />
          <OldNewWay />
          <FeaturesSection />
        </div>

        <div className="bg-background dark">
          <WhyChooseUs />
        </div>
        <div className="container mx-auto">
          <HowItWorks />
        </div>
        <div className="h-100"></div>
      </div>
    </div>
  );
}

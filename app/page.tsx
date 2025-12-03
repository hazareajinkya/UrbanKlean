"use client";

import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { SocialProofStrip } from "@/components/landing/social-proof-strip";
import { OldNewWay } from "@/components/landing/old-new-way";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { WhyChooseUs } from "@/components/landing/why-choose-us";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";
import { FaqSection } from "@/components/landing/faq-section";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef } from "react";

export default function LandingPage() {
  const whyRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: whyRef,
    offset: ["start end", "end start"],
  });
  return (
    <div className="bg-background min-h-screen">
      <Navbar scrollYProgress={scrollYProgress} />

      <HeroSection />
      <SocialProofStrip />
      <OldNewWay />
      <FeaturesSection />

      <div className="bg-background dark " ref={whyRef}>
        <WhyChooseUs />
      </div>

      <HowItWorks />

      <FaqSection />
      <div className="bg-background dark">
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}
